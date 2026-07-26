import crypto from "node:crypto";
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const dynamo = new DynamoDBClient({});
const bedrock = new BedrockRuntimeClient({});
const ssm = new SSMClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const EVENTS_TABLE_NAME = process.env.EVENTS_TABLE_NAME;
const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "https://musicacom.ia.br";
const PRICE_CENTS = Number(process.env.PRICE_CENTS ?? "19700");
const PRODUCT_NAME = "Academia Música IA";
const WOOVI_BASE_URL = "https://api.woovi.com/api/v1";
const SUNO_BASE_URL = "https://api.sunoapi.org/api/v1";
const PUBLIC_API_URL = process.env.PUBLIC_API_URL;
const MUSIC_TRACKS_INCLUDED = Number(process.env.MUSIC_TRACKS_INCLUDED ?? "25");
const MUSIC_TRACKS_PER_GENERATION = 2;
const MUSIC_GENERATION_LIMIT = Math.ceil(
  MUSIC_TRACKS_INCLUDED / MUSIC_TRACKS_PER_GENERATION,
);
const MUSIC_CONVERSATION_ENABLED = process.env.MUSIC_CONVERSATION_ENABLED !== "false";
const MUSIC_CONVERSATION_MODEL = process.env.MUSIC_CONVERSATION_MODEL
  ?? "us.amazon.nova-2-lite-v1:0";
const MUSIC_CONVERSATION_DAILY_LIMIT = 60;
const MUSIC_CONVERSATION_TOOL = "deliver_music_plan";
const SUNO_GENERATION_COST_ESTIMATE = 12;
const MUSIC_MODEL = "V5";
const SUNO_FAILED_STATUSES = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_AUDIO_FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);
const ALLOWED_CLIENT_EVENTS = new Set([
  "landing_view",
  "offer_cta",
  "checkout_cta",
  "checkout_view",
  "checkout_started",
  "checkout_error",
  "pix_copied",
  "woovi_opened",
  "support_click",
  "login_view",
]);

let cachedSecrets;
let cachedSunoApiKey;

const response = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: {
    "access-control-allow-origin": SITE_ORIGIN,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
    "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
    "x-content-type-options": "nosniff",
    ...extraHeaders,
  },
  body: JSON.stringify(body),
});

function readBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  return JSON.parse(raw);
}

function normalizeEmail(value) {
  const email = String(value ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function normalizeName(value) {
  const name = String(value ?? "").trim().replace(/\s+/g, " ");
  return name.length >= 2 && name.length <= 100 ? name : null;
}

function normalizePhone(value) {
  const phone = String(value ?? "").replace(/\D/g, "");
  return phone.length >= 10 && phone.length <= 15 ? phone : null;
}

function safeString(value, maxLength = 500) {
  return String(value ?? "").slice(0, maxLength);
}

function normalizeConversationId(value) {
  const conversationId = safeString(value, 80).trim();
  return /^[a-zA-Z0-9_-]{8,80}$/.test(conversationId)
    ? conversationId
    : `music_${crypto.randomUUID().replaceAll("-", "")}`;
}

function normalizeConversationMessages(value) {
  if (!Array.isArray(value)) return [];
  const messages = [];
  let totalLength = 0;
  for (const item of value.slice(-16)) {
    const role = item?.role === "assistant" ? "assistant" : item?.role === "user" ? "user" : null;
    const text = safeString(item?.text ?? item?.content, 1_000).trim();
    if (!role || !text || totalLength + text.length > 6_000) continue;
    if (!messages.length && role !== "user") continue;
    const previous = messages.at(-1);
    if (previous?.role === role) {
      previous.content[0].text = safeString(`${previous.content[0].text}\n${text}`, 1_000);
    } else {
      messages.push({ role, content: [{ text }] });
    }
    totalLength += text.length;
  }
  return messages.slice(-12);
}

function normalizeMusicPlan(value = {}) {
  return {
    theme: safeString(value.theme, 400).trim(),
    emotion: safeString(value.emotion, 120).trim(),
    style: safeString(value.style ?? value.styleName, 120).trim(),
    voice: safeString(value.voice, 120).trim(),
    hook: safeString(value.hook, 120).trim(),
    instrumental: value.instrumental === true,
  };
}

function missingMusicPlanFields(plan) {
  const missing = [];
  if (!plan.theme) missing.push("theme");
  if (!plan.emotion) missing.push("emotion");
  if (!plan.style) missing.push("style");
  if (!plan.instrumental && !plan.voice) missing.push("voice");
  if (!plan.instrumental && !plan.hook) missing.push("hook");
  return missing;
}

function planQuestion(field) {
  return {
    theme: {
      reply: "Qual história, pessoa ou momento você quer transformar em música?",
      quickReplies: ["Uma homenagem", "Minha história", "Um romance", "Uma superação"],
    },
    emotion: {
      reply: "Que sentimento deve ficar em quem ouvir essa música?",
      quickReplies: ["Saudade", "Alegria", "Esperança", "Paixão"],
    },
    style: {
      reply: "Que estilo combina com essa história?",
      quickReplies: ["Sertanejo", "Pagode", "Forró", "Pop brasileiro"],
    },
    voice: {
      reply: "Como você imagina a voz dessa música?",
      quickReplies: ["Masculina e próxima", "Feminina e forte", "Dueto", "Quero instrumental"],
    },
    hook: {
      reply: "Qual frase precisa aparecer no refrão?",
      quickReplies: ["Quero sugerir uma frase", "Pode nascer da história"],
    },
  }[field];
}

function forceReadyDefaults(plan) {
  const next = { ...plan };
  if (!next.emotion) next.emotion = "emocionante, verdadeira e próxima";
  if (!next.style) next.style = "Pop brasileiro";
  if (!next.instrumental && !next.voice) next.voice = "voz brasileira natural e próxima";
  if (!next.instrumental && !next.hook) {
    next.hook = safeString(next.theme || "essa história merece virar música", 100);
  }
  return next;
}

function inferEmotionFromMessages(messages) {
  const text = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content?.[0]?.text ?? "")
    .join(" ")
    .toLocaleLowerCase("pt-BR");
  const emotions = [];
  const add = (emotion) => {
    if (!emotions.includes(emotion)) emotions.push(emotion);
  };
  if (/\b(gratid[aã]o|agrade(?:cer|cimento)|obrigad[oa])\b/i.test(text)) add("gratidão");
  if (/\b(saudade|saudades|sinto falta)\b/i.test(text)) add("saudade");
  if (/\b(amor|romance|rom[aâ]ntic[oa]|apaixonad[oa])\b/i.test(text)) add("amor");
  if (/\b(alegria|feliz|felicidade|celebrar|comemorar)\b/i.test(text)) add("alegria");
  if (/\b(supera(?:ç[aã]o|r)|recome(?:ç|c)o|ven(?:cer|ci|ceu)|conquista)\b/i.test(text)) add("superação");
  if (/\b(esperan[çc]a|f[eé]|confian[çc]a)\b/i.test(text)) add("esperança");
  if (/\b(tristeza|dor|luto|despedida)\b/i.test(text)) add("tristeza");
  return emotions.slice(0, 2).join(" e ");
}

function firstUsefulQuestion(value) {
  const text = safeString(value, 360).trim();
  const questionEnd = text.indexOf("?");
  if (questionEnd < 0) return text;
  const beforeQuestion = text.slice(0, questionEnd);
  const sentenceStart = Math.max(
    beforeQuestion.lastIndexOf(". "),
    beforeQuestion.lastIndexOf("! "),
  );
  const question = text.slice(sentenceStart + 2, questionEnd + 1).trim();
  return question.length >= 12 ? question : text.slice(0, questionEnd + 1).trim();
}

function normalizeConversationOutput(input, currentPlan, userTurnCount, messages = []) {
  const current = normalizeMusicPlan(currentPlan);
  const incoming = normalizeMusicPlan(input);
  const plan = {
    theme: incoming.theme || current.theme,
    emotion: incoming.emotion || current.emotion || inferEmotionFromMessages(messages),
    style: incoming.style || current.style,
    voice: incoming.voice || current.voice,
    hook: incoming.hook || current.hook,
    instrumental: typeof input?.instrumental === "boolean"
      ? incoming.instrumental
      : current.instrumental,
  };
  const readyPlan = userTurnCount >= 6 ? forceReadyDefaults(plan) : plan;
  const missingFields = missingMusicPlanFields(readyPlan);
  const stage = missingFields.length ? "collecting" : "ready";
  const fallback = stage === "ready"
    ? {
        reply: "Entendi sua direção. Confira o resumo e, se estiver certo, vamos criar duas músicas.",
        quickReplies: ["Quero mudar algo"],
      }
    : planQuestion(missingFields[0]);
  const quickReplies = stage === "ready"
    ? fallback.quickReplies
    : Array.isArray(input?.quickReplies)
    ? input.quickReplies
      .map((item) => safeString(item, 40).trim())
      .filter(Boolean)
      .slice(0, 4)
    : fallback.quickReplies;
  const rawReply = firstUsefulQuestion(safeString(input?.reply, 360).trim()
    .replace(/^(oi[!.]?\s*)/i, "")
    .replace(/^(adorei|que legal|perfeito|maravilhoso)[^.!?]*[.!?]\s*/i, ""));
  const reply = stage === "ready"
    ? fallback.reply
    : rawReply || fallback.reply;
  return {
    reply,
    stage,
    quickReplies,
    plan: readyPlan,
    missingFields,
  };
}

function deterministicConversationFallback(currentPlan, messages, userTurnCount, mode) {
  const plan = normalizeMusicPlan(currentPlan);
  const latestText = messages.at(-1)?.content?.[0]?.text ?? "";
  const instrumental = /\b(instrumental|sem voz|só instrumentos?)\b/i.test(latestText);
  if (instrumental) plan.instrumental = true;
  const missingBefore = missingMusicPlanFields(plan);
  const target = missingBefore[0];
  if (latestText && target) {
    if (target === "theme") plan.theme = latestText;
    if (target === "emotion") plan.emotion = latestText;
    if (target === "style") plan.style = latestText;
    if (target === "voice" && !instrumental) plan.voice = latestText;
    if (target === "hook" && !instrumental) plan.hook = latestText;
  } else if (latestText && mode === "refine") {
    plan.emotion = safeString(`${plan.emotion}; ajuste solicitado: ${latestText}`, 120);
  }
  return normalizeConversationOutput({}, plan, userTurnCount, messages);
}

function itemToOrder(item) {
  if (!item) return null;
  return {
    id: item.id?.S,
    status: item.status?.S,
    brCode: item.brCode?.S,
    qrCodeImage: item.qrCodeImage?.S,
    paymentLinkUrl: item.paymentLinkUrl?.S,
    expiresAt: item.expiresAt?.S,
    paidAt: item.paidAt?.S,
    sessionId: item.sessionId?.S,
    source: item.source?.S,
    medium: item.medium?.S,
    campaign: item.campaign?.S,
    sunoGenerationCount: Number(item.sunoGenerationCount?.N ?? "0"),
  };
}

function publicOrder(order) {
  return {
    id: order.id,
    status: order.status,
    value: PRICE_CENTS,
    brCode: order.brCode,
    qrCodeImage: order.qrCodeImage,
    paymentLinkUrl: order.paymentLinkUrl,
    expiresAt: order.expiresAt,
    paidAt: order.paidAt,
  };
}

function normalizedSessionId(value) {
  const sessionId = safeString(value, 80).trim();
  return /^[a-zA-Z0-9_-]{16,80}$/.test(sessionId) ? sessionId : "server";
}

function normalizedEventId(value) {
  const eventId = safeString(value, 100).trim();
  return /^[a-zA-Z0-9_-]{16,100}$/.test(eventId)
    ? eventId
    : `evt_${crypto.randomUUID().replaceAll("-", "")}`;
}

async function recordFunnelEvent({
  id,
  name,
  sessionId,
  path,
  source,
  medium,
  campaign,
  referrer,
  orderId,
  value,
}) {
  if (!EVENTS_TABLE_NAME) return;
  const now = new Date().toISOString();
  const item = {
    id: { S: normalizedEventId(id) },
    name: { S: safeString(name, 64) },
    sessionId: { S: normalizedSessionId(sessionId) },
    createdAt: { S: now },
    ttl: { N: String(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 180) },
    ...(path ? { path: { S: safeString(path, 240) } } : {}),
    ...(source ? { source: { S: safeString(source, 100) } } : {}),
    ...(medium ? { medium: { S: safeString(medium, 100) } } : {}),
    ...(campaign ? { campaign: { S: safeString(campaign, 140) } } : {}),
    ...(referrer ? { referrer: { S: safeString(referrer, 140) } } : {}),
    ...(orderId ? { orderId: { S: safeString(orderId, 100) } } : {}),
    ...(Number.isFinite(value) ? { value: { N: String(value) } } : {}),
  };
  try {
    await dynamo.send(new PutItemCommand({
      TableName: EVENTS_TABLE_NAME,
      Item: item,
      ConditionExpression: "attribute_not_exists(id)",
    }));
  } catch (error) {
    if (!(error instanceof ConditionalCheckFailedException)) {
      console.error("Unable to record funnel event", {
        eventId: item.id.S,
        eventName: item.name.S,
        message: error.message,
      });
    }
  }
}

async function recordMemberMusicEvent(order, name, id, value) {
  await recordFunnelEvent({
    id,
    name,
    sessionId: order.sessionId,
    path: "/biblioteca/gerador/",
    source: order.source,
    medium: order.medium,
    campaign: order.campaign,
    orderId: order.id,
    value,
  });
}

async function reserveConversationTurn(orderId) {
  if (!EVENTS_TABLE_NAME) return true;
  const day = new Date().toISOString().slice(0, 10);
  try {
    await dynamo.send(new UpdateItemCommand({
      TableName: EVENTS_TABLE_NAME,
      Key: { id: { S: `music_chat_limit_${orderId}_${day}` } },
      UpdateExpression: "SET #name = :name, orderId = :orderId, updatedAt = :updatedAt, #ttl = :ttl ADD turnCount :one",
      ConditionExpression: "attribute_not_exists(turnCount) OR turnCount < :limit",
      ExpressionAttributeNames: {
        "#name": "name",
        "#ttl": "ttl",
      },
      ExpressionAttributeValues: {
        ":name": { S: "music_conversation_rate_limit" },
        ":orderId": { S: orderId },
        ":updatedAt": { S: new Date().toISOString() },
        ":ttl": { N: String(Math.floor(Date.now() / 1000) + 60 * 60 * 48) },
        ":one": { N: "1" },
        ":limit": { N: String(MUSIC_CONVERSATION_DAILY_LIMIT) },
      },
    }));
    return true;
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) return false;
    throw error;
  }
}

async function ingestClientEvent(event) {
  const origin = event.headers?.origin ?? event.headers?.Origin;
  if (origin !== SITE_ORIGIN) {
    return response(403, { error: "Origem não autorizada." });
  }
  let body;
  try {
    body = readBody(event);
  } catch {
    return response(400, { error: "Evento inválido." });
  }
  if (!ALLOWED_CLIENT_EVENTS.has(body.name)) {
    return response(400, { error: "Evento não permitido." });
  }
  await recordFunnelEvent({
    id: body.eventId,
    name: body.name,
    sessionId: body.sessionId,
    path: body.path,
    source: body.source,
    medium: body.medium,
    campaign: body.campaign,
    referrer: body.referrer,
  });
  return response(202, { accepted: true });
}

async function getSecrets() {
  if (cachedSecrets) return cachedSecrets;
  const [woovi, webhook, access] = await Promise.all([
    ssm.send(new GetParameterCommand({
      Name: process.env.WOOVI_APP_ID_PARAMETER,
      WithDecryption: true,
    })),
    ssm.send(new GetParameterCommand({
      Name: process.env.WEBHOOK_SECRET_PARAMETER,
      WithDecryption: true,
    })),
    ssm.send(new GetParameterCommand({
      Name: process.env.ACCESS_SECRET_PARAMETER,
      WithDecryption: true,
    })),
  ]);
  cachedSecrets = {
    wooviAppId: woovi.Parameter?.Value,
    webhookSecret: webhook.Parameter?.Value,
    accessSecret: access.Parameter?.Value,
  };
  if (!cachedSecrets.wooviAppId || !cachedSecrets.webhookSecret || !cachedSecrets.accessSecret) {
    throw new Error("Checkout secrets are unavailable");
  }
  return cachedSecrets;
}

async function getSunoApiKey() {
  if (cachedSunoApiKey) return cachedSunoApiKey;
  const result = await ssm.send(new GetParameterCommand({
    Name: process.env.SUNO_API_KEY_PARAMETER,
    WithDecryption: true,
  }));
  cachedSunoApiKey = result.Parameter?.Value;
  if (!cachedSunoApiKey) throw new Error("Suno API key is unavailable");
  return cachedSunoApiKey;
}

function memberToken(event) {
  const authorization = event.headers?.authorization ?? event.headers?.Authorization ?? "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

async function authorizeMember(event) {
  const token = memberToken(event);
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return null;

  const expiresAt = Number(parts[1]);
  const orderId = parts[2];
  const signature = parts[3];
  if (
    !Number.isInteger(expiresAt)
    || expiresAt < Math.floor(Date.now() / 1000)
    || !/^ami_[a-f0-9]{28}$/.test(orderId)
    || !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return null;
  }

  const { accessSecret } = await getSecrets();
  const payload = `v1.${expiresAt}.${orderId}`;
  const expected = crypto.createHmac("sha256", accessSecret).update(payload).digest("hex");
  const suppliedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (
    suppliedBuffer.length !== expectedBuffer.length
    || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return null;
  }

  const order = await findOrder(orderId);
  return order && (order.status === "PAID" || order.status === "OWNER")
    ? order
    : null;
}

function normalizeSunoTrack(track) {
  return {
    id: safeString(track.id, 100),
    title: safeString(track.title || "Música gerada", 160),
    tags: safeString(track.tags, 500),
    duration: Number(track.duration) || null,
    audioUrl: safeRemoteUrl(track.audioUrl || track.audio_url),
    streamAudioUrl: safeRemoteUrl(track.streamAudioUrl || track.stream_audio_url),
    imageUrl: safeRemoteUrl(track.imageUrl || track.image_url),
  };
}

function safeRemoteUrl(value) {
  try {
    const url = new URL(safeString(value, 2_000));
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

async function sunoRequest(path, options = {}) {
  const sunoApiKey = await getSunoApiKey();
  const result = await fetch(`${SUNO_BASE_URL}${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${sunoApiKey}`,
      "content-type": "application/json",
      ...options.headers,
    },
    signal: AbortSignal.timeout(18_000),
  });
  const text = await result.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { msg: "Resposta inválida do serviço de música." };
  }
  if (!result.ok || data.code !== 200) {
    const error = new Error(safeString(data.msg || "A geração não pôde ser iniciada.", 240));
    error.statusCode = result.status === 429 || data.code === 429 ? 429 : 502;
    throw error;
  }
  return data.data;
}

async function reserveSunoGeneration(orderId, accessStatus) {
  try {
    const result = await dynamo.send(new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: { id: { S: orderId } },
      UpdateExpression: "SET sunoGenerationCount = if_not_exists(sunoGenerationCount, :zero) + :one",
      ConditionExpression: "attribute_exists(id) AND #status = :accessStatus AND (attribute_not_exists(sunoGenerationCount) OR sunoGenerationCount < :limit)",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":zero": { N: "0" },
        ":one": { N: "1" },
        ":limit": { N: String(MUSIC_GENERATION_LIMIT) },
        ":accessStatus": { S: accessStatus },
      },
      ReturnValues: "UPDATED_NEW",
    }));
    return Number(result.Attributes?.sunoGenerationCount?.N ?? "0");
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) return null;
    throw error;
  }
}

function remainingMusicTracks(generationCount) {
  return Math.max(
    0,
    MUSIC_TRACKS_INCLUDED - generationCount * MUSIC_TRACKS_PER_GENERATION,
  );
}

function conversationSystemPrompt({ mode, currentPlan, availableStyles, userTurnCount }) {
  const styleNames = Array.isArray(availableStyles)
    ? availableStyles
      .map((item) => safeString(item?.name ?? item, 80).trim())
      .filter(Boolean)
      .slice(0, 40)
    : [];
  return [
    "Você é o Produtor IA da Academia Música IA.",
    "Conduza uma conversa curta, humana e acolhedora em português do Brasil.",
    "Nunca fale de prompt, modelo, API, fornecedor ou detalhes técnicos.",
    "Faça somente uma pergunta por resposta e não repita algo que o aluno já informou.",
    "Extraia tema, emoção, estilo, voz, frase de refrão e se é instrumental.",
    "Se a pessoa pedir instrumental, voz e refrão deixam de ser obrigatórios.",
    "Se ela citar um artista, converta a referência em características musicais sem prometer imitação.",
    "Não elogie genericamente. Reaja de forma breve e avance a criação.",
    "Após seis respostas do aluno, escolha padrões plausíveis para o que faltar e entregue o plano pronto.",
    "Quando o plano estiver completo, confirme que entendeu e convide a revisar o resumo.",
    `Modo atual: ${mode}. Respostas do aluno: ${userTurnCount}.`,
    `Plano atual: ${JSON.stringify(currentPlan)}.`,
    styleNames.length ? `Estilos disponíveis: ${styleNames.join(", ")}.` : "",
    `Sempre chame a ferramenta ${MUSIC_CONVERSATION_TOOL} uma vez com a resposta e o plano atualizado.`,
  ].filter(Boolean).join("\n");
}

const conversationTool = {
  toolSpec: {
    name: MUSIC_CONVERSATION_TOOL,
    description: "Entrega a próxima fala do Produtor IA e o plano musical acumulado.",
    inputSchema: {
      json: {
        type: "object",
        properties: {
          reply: { type: "string", description: "Resposta curta em português, com no máximo uma pergunta." },
          stage: { type: "string", description: "collecting enquanto faltam dados ou ready quando o plano pode ser confirmado." },
          quickReplies: {
            type: "array",
            description: "Até quatro respostas curtas opcionais.",
            items: { type: "string" },
          },
          theme: { type: "string", description: "História, pessoa, cena ou assunto da música." },
          emotion: { type: "string", description: "Sentimento central desejado." },
          style: { type: "string", description: "Estilo musical em linguagem clara." },
          voice: { type: "string", description: "Direção da voz; vazio para instrumental." },
          hook: { type: "string", description: "Frase ou ideia central do refrão; vazio para instrumental." },
          instrumental: { type: "boolean", description: "Verdadeiro quando a música não deve ter voz nem letra." },
        },
        required: [
          "reply",
          "stage",
          "quickReplies",
          "theme",
          "emotion",
          "style",
          "voice",
          "hook",
          "instrumental",
        ],
      },
    },
  },
};

async function createMusicConversation(event) {
  const order = await authorizeMember(event);
  if (!order) return response(401, { error: "Sua sessão expirou. Entre novamente." });
  if (!MUSIC_CONVERSATION_ENABLED) {
    return response(503, {
      error: "O Produtor IA está em manutenção. Use o modo guiado.",
      conversationAvailable: false,
    });
  }

  let body;
  try {
    body = readBody(event);
  } catch {
    return response(400, { error: "Conversa inválida." });
  }
  const messages = normalizeConversationMessages(body.messages);
  if (!messages.length) {
    return response(400, { error: "Conte uma ideia para começar a conversa." });
  }
  const conversationId = normalizeConversationId(body.conversationId);
  const mode = body.mode === "refine" ? "refine" : "create";
  const currentPlan = normalizeMusicPlan(body.plan);
  const userTurnCount = messages.filter((item) => item.role === "user").length;
  const remainingSongs = remainingMusicTracks(order.sunoGenerationCount);
  if (!(await reserveConversationTurn(order.id))) {
    return response(429, {
      error: "Você chegou ao limite de conversas de hoje. Suas músicas e seu saldo continuam seguros.",
    });
  }

  await recordMemberMusicEvent(
    order,
    "music_conversation_started",
    `music_conversation_started_${conversationId}`,
  );
  if (body.inputMethod === "voice") {
    await recordMemberMusicEvent(
      order,
      "music_voice_used",
      `music_voice_used_${conversationId}`,
    );
  }
  if (mode === "refine") {
    await recordMemberMusicEvent(
      order,
      "music_refinement_started",
      `music_refinement_started_${conversationId}`,
    );
  }

  let result;
  try {
    const modelResponse = await bedrock.send(new ConverseCommand({
      modelId: MUSIC_CONVERSATION_MODEL,
      system: [{
        text: conversationSystemPrompt({
          mode,
          currentPlan,
          availableStyles: body.availableStyles,
          userTurnCount,
        }),
      }],
      messages,
      toolConfig: {
        tools: [conversationTool],
        toolChoice: { tool: { name: MUSIC_CONVERSATION_TOOL } },
      },
      inferenceConfig: {
        maxTokens: 1_200,
        temperature: 0,
      },
    }));
    const toolUse = modelResponse.output?.message?.content
      ?.find((item) => item.toolUse?.name === MUSIC_CONVERSATION_TOOL)
      ?.toolUse;
    if (!toolUse?.input) throw new Error("Structured conversation output is unavailable");
    result = normalizeConversationOutput(toolUse.input, currentPlan, userTurnCount, messages);
  } catch (error) {
    console.error("Music conversation fallback", {
      orderId: order.id,
      conversationId,
      name: error.name,
      message: error.message,
    });
    await recordMemberMusicEvent(
      order,
      "music_conversation_error",
      `music_conversation_error_${conversationId}_${crypto.randomUUID().slice(0, 8)}`,
    );
    result = deterministicConversationFallback(currentPlan, messages, userTurnCount, mode);
  }

  if (result.stage === "ready") {
    await recordMemberMusicEvent(
      order,
      "music_plan_ready",
      `music_plan_ready_${conversationId}`,
    );
  }
  return response(200, {
    conversationId,
    ...result,
    conversationAvailable: true,
    remainingSongs,
    songsPerGeneration: MUSIC_TRACKS_PER_GENERATION,
    remainingAfterGeneration: Math.max(0, remainingSongs - MUSIC_TRACKS_PER_GENERATION),
  });
}

async function releaseSunoGeneration(orderId) {
  try {
    await dynamo.send(new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: { id: { S: orderId } },
      UpdateExpression: "ADD sunoGenerationCount :minusOne",
      ConditionExpression: "sunoGenerationCount > :zero",
      ExpressionAttributeValues: {
        ":minusOne": { N: "-1" },
        ":zero": { N: "0" },
      },
    }));
  } catch (error) {
    console.error("Unable to release Suno generation reservation", {
      orderId,
      message: error.message,
    });
  }
}

async function rememberSunoTask(taskId, orderId) {
  await dynamo.send(new PutItemCommand({
    TableName: EVENTS_TABLE_NAME,
    Item: {
      id: { S: `suno_task_${taskId}` },
      name: { S: "suno_generation_started" },
      orderId: { S: orderId },
      providerTaskId: { S: taskId },
      createdAt: { S: new Date().toISOString() },
      ttl: { N: String(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 15) },
    },
    ConditionExpression: "attribute_not_exists(id)",
  }));
}

async function ownsSunoTask(taskId, orderId) {
  const result = await dynamo.send(new GetItemCommand({
    TableName: EVENTS_TABLE_NAME,
    Key: { id: { S: `suno_task_${taskId}` } },
    ConsistentRead: true,
  }));
  return result.Item?.orderId?.S === orderId;
}

async function refundFailedSunoTask(taskId, orderId) {
  try {
    await dynamo.send(new UpdateItemCommand({
      TableName: EVENTS_TABLE_NAME,
      Key: { id: { S: `suno_task_${taskId}` } },
      UpdateExpression: "SET refundedAt = :refundedAt",
      ConditionExpression: "orderId = :orderId AND attribute_not_exists(refundedAt)",
      ExpressionAttributeValues: {
        ":orderId": { S: orderId },
        ":refundedAt": { S: new Date().toISOString() },
      },
    }));
    await releaseSunoGeneration(orderId);
    return true;
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) return false;
    throw error;
  }
}

async function getSunoCredits(event) {
  const order = await authorizeMember(event);
  if (!order) return response(401, { error: "Sua sessão expirou. Entre novamente." });
  const credits = await sunoRequest("/generate/credit", { method: "GET" });
  return response(200, {
    available: Number(credits) >= SUNO_GENERATION_COST_ESTIMATE,
    conversationAvailable: MUSIC_CONVERSATION_ENABLED,
    remainingSongs: remainingMusicTracks(order.sunoGenerationCount),
    includedSongs: MUSIC_TRACKS_INCLUDED,
    songsPerGeneration: MUSIC_TRACKS_PER_GENERATION,
  });
}

async function createSunoGeneration(event) {
  const order = await authorizeMember(event);
  if (!order) return response(401, { error: "Sua sessão expirou. Entre novamente." });

  let body;
  try {
    body = readBody(event);
  } catch {
    return response(400, { error: "Briefing inválido." });
  }
  const prompt = safeString(body.brief ?? body.prompt, 501).trim();
  const instrumental = body.instrumental === true;
  const conversationId = normalizeConversationId(body.conversationId);
  const mode = body.mode === "refine" ? "refine" : "create";
  if (prompt.length < 20 || prompt.length > 500) {
    return response(400, { error: "Descreva a música em 20 a 500 caracteres." });
  }
  if (!PUBLIC_API_URL?.startsWith("https://")) {
    throw new Error("Music callback URL is unavailable");
  }

  const generationCount = await reserveSunoGeneration(order.id, order.status);
  if (generationCount === null) {
    return response(429, {
      error: `Este acesso já utilizou as ${MUSIC_TRACKS_INCLUDED} músicas incluídas.`,
    });
  }

  let data;
  try {
    data = await sunoRequest("/generate", {
      method: "POST",
      body: JSON.stringify({
        customMode: false,
        instrumental,
        model: MUSIC_MODEL,
        callBackUrl: `${PUBLIC_API_URL}/v1/suno/callback`,
        prompt,
      }),
    });
  } catch (error) {
    await releaseSunoGeneration(order.id);
    throw error;
  }
  const taskId = safeString(data?.taskId, 100);
  if (!/^[a-zA-Z0-9_-]{8,100}$/.test(taskId)) {
    await releaseSunoGeneration(order.id);
    throw new Error("O serviço não devolveu um identificador de geração válido.");
  }
  try {
    await rememberSunoTask(taskId, order.id);
  } catch (error) {
    await releaseSunoGeneration(order.id);
    throw error;
  }
  await recordMemberMusicEvent(
    order,
    "music_generation_confirmed",
    `music_generation_confirmed_${taskId}`,
    MUSIC_TRACKS_PER_GENERATION,
  );
  return response(202, {
    taskId,
    status: "PENDING",
    conversationId,
    mode,
    remainingSongs: remainingMusicTracks(generationCount),
    includedSongs: MUSIC_TRACKS_INCLUDED,
  });
}

async function getSunoGeneration(event, taskId) {
  const order = await authorizeMember(event);
  if (!order) return response(401, { error: "Sua sessão expirou. Entre novamente." });
  if (
    !/^[a-zA-Z0-9_-]{8,100}$/.test(taskId)
    || !(await ownsSunoTask(taskId, order.id))
  ) {
    return response(404, { error: "Geração não encontrada para este acesso." });
  }

  const data = await sunoRequest(
    `/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
    { method: "GET" },
  );
  const status = safeString(data?.status || "PENDING", 40);
  const tracks = (data?.response?.sunoData ?? []).map(normalizeSunoTrack);
  const failed = SUNO_FAILED_STATUSES.has(status);
  const refunded = failed
    ? await refundFailedSunoTask(taskId, order.id)
    : false;
  if (status === "SUCCESS") {
    await recordMemberMusicEvent(
      order,
      "music_generation_completed",
      `music_generation_completed_${taskId}`,
      tracks.length,
    );
  }
  return response(200, {
    taskId,
    status,
    tracks,
    error: failed
      ? safeString(data?.errorMessage || "A geração falhou. Ajuste o briefing e tente novamente.", 240)
      : null,
    remainingSongs: refunded
      ? remainingMusicTracks(Math.max(0, order.sunoGenerationCount - 1))
      : undefined,
  });
}

async function wooviRequest(path, options = {}) {
  const { wooviAppId } = await getSecrets();
  const result = await fetch(`${WOOVI_BASE_URL}${path}`, {
    ...options,
    headers: {
      accept: "application/json",
      authorization: wooviAppId,
      "content-type": "application/json",
      ...options.headers,
    },
    signal: AbortSignal.timeout(12_000),
  });
  const text = await result.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: "Resposta inválida do provedor de pagamento" };
  }
  if (!result.ok) {
    const error = new Error(safeString(data.error || data.message || "Falha no provedor de pagamento"));
    error.statusCode = result.status;
    error.providerData = data;
    throw error;
  }
  return data;
}

async function findOrder(id) {
  const result = await dynamo.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: { id: { S: id } },
    ConsistentRead: true,
  }));
  return itemToOrder(result.Item);
}

function chargeToOrder(id, charge) {
  return {
    id,
    status: charge.status === "COMPLETED" ? "PAID" : "AWAITING_PAYMENT",
    brCode: charge.brCode || charge.paymentMethods?.pix?.brCode,
    qrCodeImage: charge.qrCodeImage || charge.paymentMethods?.pix?.qrCodeImage,
    paymentLinkUrl: charge.paymentLinkUrl,
    expiresAt: charge.expiresDate,
    paidAt: charge.paidAt,
  };
}

async function saveCharge(order) {
  await dynamo.send(new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: { id: { S: order.id } },
    UpdateExpression: [
      "SET #status = :status",
      "brCode = :brCode",
      "qrCodeImage = :qrCodeImage",
      "paymentLinkUrl = :paymentLinkUrl",
      "expiresAt = :expiresAt",
      "updatedAt = :updatedAt",
    ].join(", "),
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: {
      ":status": { S: order.status },
      ":brCode": { S: order.brCode ?? "" },
      ":qrCodeImage": { S: order.qrCodeImage ?? "" },
      ":paymentLinkUrl": { S: order.paymentLinkUrl ?? "" },
      ":expiresAt": { S: order.expiresAt ?? "" },
      ":updatedAt": { S: new Date().toISOString() },
    },
  }));
}

async function createCheckout(event) {
  let body;
  try {
    body = readBody(event);
  } catch {
    return response(400, { error: "Dados inválidos." });
  }

  const name = normalizeName(body.name);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);
  const idempotencyKey = safeString(body.idempotencyKey, 100);
  const sessionId = normalizedSessionId(body.sessionId);
  const source = safeString(body.source, 100);
  const medium = safeString(body.medium, 100);
  const campaign = safeString(body.campaign, 140);

  if (!name || !email || !/^[a-zA-Z0-9_-]{16,100}$/.test(idempotencyKey)) {
    return response(400, { error: "Informe nome e e-mail válidos." });
  }
  if (body.acceptedTerms !== true) {
    return response(400, { error: "É necessário aceitar os termos da compra." });
  }

  const digest = crypto
    .createHash("sha256")
    .update(idempotencyKey)
    .digest("hex")
    .slice(0, 28);
  const orderId = `ami_${digest}`;
  const existing = await findOrder(orderId);
  if (existing?.paymentLinkUrl) {
    return response(200, { order: publicOrder(existing) });
  }

  const now = new Date().toISOString();
  try {
    await dynamo.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        id: { S: orderId },
        status: { S: "CREATING" },
        product: { S: PRODUCT_NAME },
        value: { N: String(PRICE_CENTS) },
        name: { S: name },
        email: { S: email },
        ...(phone ? { phone: { S: phone } } : {}),
        sessionId: { S: sessionId },
        ...(source ? { source: { S: source } } : {}),
        ...(medium ? { medium: { S: medium } } : {}),
        ...(campaign ? { campaign: { S: campaign } } : {}),
        createdAt: { S: now },
        updatedAt: { S: now },
        ttl: { N: String(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 2) },
      },
      ConditionExpression: "attribute_not_exists(id)",
    }));
  } catch (error) {
    if (!(error instanceof ConditionalCheckFailedException)) throw error;
  }

  let providerData;
  try {
    providerData = await wooviRequest("/charge", {
      method: "POST",
      body: JSON.stringify({
        correlationID: orderId,
        value: PRICE_CENTS,
        comment: PRODUCT_NAME,
        expiresIn: 3600,
        customer: {
          name,
          email,
          ...(phone ? { phone } : {}),
          correlationID: `customer_${digest}`,
        },
        additionalInfo: [
          { key: "product", value: "academia-musica-ia" },
          { key: "source", value: "musicacom.ia.br" },
        ],
      }),
    });
  } catch (error) {
    if (error.statusCode === 400) {
      try {
        providerData = await wooviRequest(`/charge/${encodeURIComponent(orderId)}`);
      } catch {
        // The original provider error is more useful below.
      }
    }
    if (!providerData) {
      await dynamo.send(new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: { id: { S: orderId } },
        UpdateExpression: "SET #status = :status, updatedAt = :updatedAt, failureReason = :reason",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":status": { S: "CREATE_FAILED" },
          ":updatedAt": { S: new Date().toISOString() },
          ":reason": { S: safeString(error.message, 240) },
        },
      }));
      return response(502, { error: "Não foi possível gerar o Pix agora. Tente novamente." });
    }
  }

  const charge = providerData.charge ?? providerData;
  const order = chargeToOrder(orderId, charge);
  await saveCharge(order);
  await recordFunnelEvent({
    id: `pix_created_${orderId}`,
    name: "pix_created",
    sessionId,
    path: "/checkout/",
    source,
    medium,
    campaign,
    orderId,
    value: PRICE_CENTS,
  });
  return response(201, { order: publicOrder(order) });
}

async function getCheckout(orderId) {
  if (!/^ami_[a-f0-9]{28}$/.test(orderId)) {
    return response(404, { error: "Pedido não encontrado." });
  }
  const stored = await findOrder(orderId);
  if (!stored) return response(404, { error: "Pedido não encontrado." });
  if (stored.status === "PAID") {
    return response(200, { order: publicOrder(stored) });
  }

  try {
    const providerData = await wooviRequest(`/charge/${encodeURIComponent(orderId)}`);
    const charge = providerData.charge ?? providerData;
    if (charge.status === "COMPLETED" && Number(charge.value) === PRICE_CENTS) {
      await markPaid(orderId, charge);
      return response(200, {
        order: publicOrder({ ...stored, status: "PAID", paidAt: charge.paidAt ?? new Date().toISOString() }),
      });
    }
  } catch (error) {
    console.error("Unable to reconcile checkout", { orderId, message: error.message });
  }

  return response(200, { order: publicOrder(stored) });
}

async function markPaid(orderId, charge) {
  const order = await findOrder(orderId);
  try {
    await dynamo.send(new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: { id: { S: orderId } },
      UpdateExpression: "SET #status = :paid, paidAt = :paidAt, transactionId = :transactionId, updatedAt = :updatedAt",
      ConditionExpression: "attribute_exists(id) AND #status <> :paid",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":paid": { S: "PAID" },
        ":paidAt": { S: charge.paidAt ?? new Date().toISOString() },
        ":transactionId": { S: safeString(charge.transactionID || charge.identifier, 200) },
        ":updatedAt": { S: new Date().toISOString() },
      },
    }));
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) return false;
    throw error;
  }
  await recordFunnelEvent({
    id: `purchase_confirmed_${orderId}`,
    name: "purchase_confirmed",
    sessionId: order?.sessionId,
    path: "/checkout/",
    source: order?.source,
    medium: order?.medium,
    campaign: order?.campaign,
    orderId,
    value: PRICE_CENTS,
  });
  return true;
}

async function handleWebhook(event) {
  const { webhookSecret } = await getSecrets();
  const authorization = event.headers?.authorization ?? event.headers?.Authorization;
  const supplied = Buffer.from(authorization ?? "");
  const expected = Buffer.from(webhookSecret);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    return response(401, { error: "Não autorizado." });
  }

  let body;
  try {
    body = readBody(event);
  } catch {
    return response(400, { error: "Payload inválido." });
  }

  const orderId = body.charge?.correlationID;
  if (body.event !== "OPENPIX:CHARGE_COMPLETED" || !/^ami_[a-f0-9]{28}$/.test(orderId ?? "")) {
    return response(200, { received: true });
  }

  const providerData = await wooviRequest(`/charge/${encodeURIComponent(orderId)}`);
  const charge = providerData.charge ?? providerData;
  if (charge.status !== "COMPLETED" || Number(charge.value) !== PRICE_CENTS) {
    return response(409, { error: "Cobrança ainda não confirmada." });
  }
  await markPaid(orderId, charge);
  return response(200, { received: true });
}

async function claimAccess(event) {
  let body;
  try {
    body = readBody(event);
  } catch {
    return response(400, { error: "Dados inválidos." });
  }
  const orderId = safeString(body.orderId, 100).trim();
  if (!/^ami_[a-f0-9]{28}$/.test(orderId)) {
    return response(400, { error: "Código de acesso inválido." });
  }
  const order = await findOrder(orderId);
  if (!order || (order.status !== "PAID" && order.status !== "OWNER")) {
    return response(403, { error: "Pagamento ainda não confirmado para este código." });
  }

  const { accessSecret } = await getSecrets();
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 180;
  const payload = `v1.${expiresAt}.${orderId}`;
  const signature = crypto.createHmac("sha256", accessSecret).update(payload).digest("hex");
  if (order.status === "PAID") {
    await recordFunnelEvent({
      id: `access_activated_${orderId}`,
      name: "access_activated",
      sessionId: order.sessionId,
      path: "/login/",
      source: order.source,
      medium: order.medium,
      campaign: order.campaign,
      orderId,
      value: PRICE_CENTS,
    });
  }
  return response(200, {
    access: {
      token: `${payload}.${signature}`,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    },
  });
}

export const handler = async (event) => {
  try {
    const method = event.requestContext?.http?.method ?? event.httpMethod;
    const path = event.rawPath ?? event.path ?? "/";

    if (method === "OPTIONS") return response(204, {});
    if (method === "GET" && path === "/health") {
      return response(200, { ok: true, service: "academia-musica-checkout" });
    }
    if (method === "POST" && path === "/v1/events") return await ingestClientEvent(event);
    if (method === "POST" && path === "/v1/checkout") return await createCheckout(event);
    if (method === "GET" && path.startsWith("/v1/checkout/")) {
      return await getCheckout(decodeURIComponent(path.slice("/v1/checkout/".length)));
    }
    if (method === "POST" && path === "/v1/webhooks/woovi") return await handleWebhook(event);
    if (method === "POST" && path === "/v1/access/claim") return await claimAccess(event);
    if (
      method === "GET"
      && (path === "/v1/music/availability" || path === "/v1/suno/credits")
    ) return await getSunoCredits(event);
    if (method === "POST" && path === "/v1/music/conversation") {
      return await createMusicConversation(event);
    }
    if (
      method === "POST"
      && (path === "/v1/music/generations" || path === "/v1/suno/generations")
    ) {
      return await createSunoGeneration(event);
    }
    if (method === "GET" && path.startsWith("/v1/music/generations/")) {
      return await getSunoGeneration(
        event,
        decodeURIComponent(path.slice("/v1/music/generations/".length)),
      );
    }
    if (method === "GET" && path.startsWith("/v1/suno/generations/")) {
      return await getSunoGeneration(
        event,
        decodeURIComponent(path.slice("/v1/suno/generations/".length)),
      );
    }
    if (method === "POST" && path === "/v1/suno/callback") {
      return response(200, { received: true });
    }
    return response(404, { error: "Rota não encontrada." });
  } catch (error) {
    console.error("Unhandled API error", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return response(error.statusCode ?? 500, {
      error: error.statusCode
        ? error.message
        : "O serviço encontrou um erro. Tente novamente.",
    });
  }
};
