import crypto from "node:crypto";
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const dynamo = new DynamoDBClient({});
const ssm = new SSMClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "https://musicacom.ia.br";
const PRICE_CENTS = Number(process.env.PRICE_CENTS ?? "19700");
const PRODUCT_NAME = "Academia Música IA";
const WOOVI_BASE_URL = "https://api.woovi.com/api/v1";

let cachedSecrets;

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
  await dynamo.send(new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: { id: { S: orderId } },
    UpdateExpression: "SET #status = :status, paidAt = :paidAt, transactionId = :transactionId, updatedAt = :updatedAt",
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: {
      ":status": { S: "PAID" },
      ":paidAt": { S: charge.paidAt ?? new Date().toISOString() },
      ":transactionId": { S: safeString(charge.transactionID || charge.identifier, 200) },
      ":updatedAt": { S: new Date().toISOString() },
    },
  }));
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
  if (!order || order.status !== "PAID") {
    return response(403, { error: "Pagamento ainda não confirmado para este código." });
  }

  const { accessSecret } = await getSecrets();
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 180;
  const payload = `v1.${expiresAt}.${orderId}`;
  const signature = crypto.createHmac("sha256", accessSecret).update(payload).digest("hex");
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
    if (method === "POST" && path === "/v1/checkout") return await createCheckout(event);
    if (method === "GET" && path.startsWith("/v1/checkout/")) {
      return await getCheckout(decodeURIComponent(path.slice("/v1/checkout/".length)));
    }
    if (method === "POST" && path === "/v1/webhooks/woovi") return await handleWebhook(event);
    if (method === "POST" && path === "/v1/access/claim") return await claimAccess(event);
    return response(404, { error: "Rota não encontrada." });
  } catch (error) {
    console.error("Unhandled checkout error", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return response(500, { error: "O checkout encontrou um erro. Tente novamente." });
  }
};
