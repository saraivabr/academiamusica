"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AcademyShell } from "../../components/Portal";
import { memberApi } from "../../lib/access";
import { musicStyles } from "../../lib/musicStyles";

type GeneratedTrack = {
  id: string;
  title: string;
  tags: string;
  duration: number | null;
  audioUrl: string;
  streamAudioUrl: string;
  imageUrl: string;
};

type MusicPlan = {
  theme: string;
  emotion: string;
  style: string;
  voice: string;
  hook: string;
  instrumental: boolean;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type ConversationStage = "collecting" | "ready";
type ConversationMode = "create" | "refine";
type MusicPlanField = "theme" | "emotion" | "style" | "voice" | "hook";

type SpeechRecognitionEventLike = {
  results: ArrayLike<{
    0: {
      transcript: string;
    };
  }>;
};

type SpeechRecognitionErrorLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

type SavedStudio = {
  conversationId: string;
  messages: ChatMessage[];
  plan: MusicPlan;
  stage: ConversationStage;
  quickReplies: string[];
  missingFields?: MusicPlanField[];
  mode: ConversationMode;
  taskId: string;
  generationStatus: string;
  tracks: GeneratedTrack[];
};

const completedStatuses = new Set([
  "SUCCESS",
  "CREATE_TASK_FAILED",
  "GENERATE_AUDIO_FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

const failedStatuses = new Set([
  "CREATE_TASK_FAILED",
  "GENERATE_AUDIO_FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

const studioStorageKey = "academia_conversational_studio_v1";
const initialMessage: ChatMessage = {
  id: "producer_welcome",
  role: "assistant",
  text: "Que música você quer criar hoje? Pode escrever ou falar do seu jeito.",
};
const initialReplies = [
  "Uma homenagem",
  "Minha história",
  "Um romance",
  "Uma superação",
  "Instrumental",
];
const refinementReplies = [
  "Mais animada",
  "Outra voz",
  "Refrão mais forte",
  "Mudar o estilo",
];
const emptyPlan: MusicPlan = {
  theme: "",
  emotion: "",
  style: "",
  voice: "",
  hook: "",
  instrumental: false,
};
const initialMissingFields: MusicPlanField[] = ["theme", "emotion", "style", "voice", "hook"];

const choiceDescriptions: Record<string, string> = {
  "Uma homenagem": "para alguém especial",
  "Minha história": "um momento que te marcou",
  "Um romance": "amor, saudade ou reencontro",
  "Uma superação": "um desafio e a virada",
  Instrumental: "um clima, sem voz",
  Saudade: "lembrança e distância",
  Alegria: "leveza e celebração",
  Esperança: "força para seguir",
  Paixão: "intensidade e desejo",
  Sertanejo: "história direta e refrão forte",
  Pagode: "balanço, afeto e roda",
  Forró: "energia, dança e sanfona",
  "Pop brasileiro": "melodia clara e atual",
  "Masculina e próxima": "interpretação íntima",
  "Feminina e forte": "presença e intensidade",
  Dueto: "duas vozes em diálogo",
  "Pode criar a partir da história": "o Produtor propõe a frase",
  "Vou escrever uma frase": "você define as palavras",
};

const fieldLessons: Record<MusicPlanField, { label: string; lesson: string }> = {
  theme: {
    label: "História",
    lesson: "Comece por uma cena concreta: quem estava lá e o que aconteceu.",
  },
  emotion: {
    label: "Emoção",
    lesson: "A emoção orienta o ritmo, a interpretação e a intensidade.",
  },
  style: {
    label: "Estilo",
    lesson: "O estilo define o balanço, os instrumentos e a energia.",
  },
  voice: {
    label: "Voz",
    lesson: "A voz muda a personalidade e o ponto de vista da música.",
  },
  hook: {
    label: "Refrão",
    lesson: "O refrão é a ideia curta que a pessoa vai lembrar.",
  },
};

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function findStyle(styleName: string) {
  const normalized = styleName.toLocaleLowerCase("pt-BR");
  return musicStyles.find((item) => (
    item.name.toLocaleLowerCase("pt-BR") === normalized
    || item.slug === normalized
    || item.name.toLocaleLowerCase("pt-BR").includes(normalized)
    || normalized.includes(item.name.toLocaleLowerCase("pt-BR"))
  ));
}

function createBrief(plan: MusicPlan) {
  const style = findStyle(plan.style);
  const direction = style
    ? `Arranjo: ${style.instruments}; ${style.groove}; ${style.bpm} BPM.`
    : "Arranjo brasileiro coerente com o estilo, com melodia clara e produção natural.";
  const parts = [
    `Canção brasileira original em ${plan.style || "Pop brasileiro"}.`,
    `Tema: ${plan.theme}.`,
    `Emoção: ${plan.emotion}.`,
    plan.instrumental ? "Somente instrumental, sem voz e sem letra." : `Voz: ${plan.voice}.`,
    plan.instrumental ? "" : `Refrão inspirado em “${plan.hook}”.`,
    direction,
    "Letra humana, imagens concretas e refrão memorável. Não imite artistas reais.",
  ].filter(Boolean);
  const brief = parts.join(" ");
  if (brief.length <= 500) return brief;
  return `${brief.slice(0, 499).replace(/\s+\S*$/, "").trim()}.`;
}

function planIsReady(plan: MusicPlan) {
  return Boolean(
    plan.theme
    && plan.emotion
    && plan.style
    && (plan.instrumental || (plan.voice && plan.hook)),
  );
}

function LegacyStudio({
  isGenerating,
  onGenerate,
}: {
  isGenerating: boolean;
  onGenerate: (plan: MusicPlan, mode: ConversationMode) => Promise<void>;
}) {
  const [plan, setPlan] = useState<MusicPlan>({
    theme: "uma história de superação que começou quando ninguém acreditava",
    emotion: "orgulho e esperança",
    style: musicStyles[0].name,
    voice: "voz masculina média, humana e próxima",
    hook: "eu não parei quando ficou difícil",
    instrumental: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onGenerate(plan, "create");
  }

  return (
    <form className="creation-studio legacy-studio" onSubmit={submit}>
      <section className="briefing-panel">
        <header><span>01</span><div><small>MODO GUIADO</small><h3>Conte os detalhes da música</h3></div></header>
        <label>
          Estilo
          <select value={plan.style} onChange={(event) => setPlan({ ...plan, style: event.target.value })}>
            {musicStyles.map((item) => <option key={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <label>
          História ou assunto
          <textarea
            rows={4}
            value={plan.theme}
            onChange={(event) => setPlan({ ...plan, theme: event.target.value })}
            required
          />
        </label>
        <div className="form-split">
          <label>
            Emoção
            <input
              value={plan.emotion}
              onChange={(event) => setPlan({ ...plan, emotion: event.target.value })}
              required
            />
          </label>
          <label>
            Voz
            <input
              value={plan.voice}
              onChange={(event) => setPlan({ ...plan, voice: event.target.value })}
              required={!plan.instrumental}
              disabled={plan.instrumental}
            />
          </label>
        </div>
        <label>
          Frase de refrão
          <input
            value={plan.hook}
            onChange={(event) => setPlan({ ...plan, hook: event.target.value })}
            required={!plan.instrumental}
            disabled={plan.instrumental}
          />
        </label>
        <label className="instrumental-toggle">
          <input
            type="checkbox"
            checked={plan.instrumental}
            onChange={(event) => setPlan({ ...plan, instrumental: event.target.checked })}
          />
          <span><b>Quero somente instrumentos</b><small>Sem voz e sem letra.</small></span>
        </label>
      </section>
      <aside className="generation-panel">
        <div className="engine-badge"><i aria-hidden="true" /><span>MODO DE SEGURANÇA</span></div>
        <p className="legacy-note">O Produtor IA está temporariamente indisponível. Suas músicas continuam acessíveis pelo modo guiado.</p>
        <button className="generate-music-button" disabled={isGenerating}>
          {isGenerating ? "Criando suas músicas…" : "Criar duas músicas →"}
        </button>
      </aside>
    </form>
  );
}

export default function Gerador() {
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [plan, setPlan] = useState<MusicPlan>(emptyPlan);
  const [stage, setStage] = useState<ConversationStage>("collecting");
  const [missingFields, setMissingFields] = useState<MusicPlanField[]>(initialMissingFields);
  const [mode, setMode] = useState<ConversationMode>("create");
  const [quickReplies, setQuickReplies] = useState(initialReplies);
  const [input, setInput] = useState("");
  const [inputMethod, setInputMethod] = useState<"text" | "voice">("text");
  const [conversationAvailable, setConversationAvailable] = useState<boolean | null>(null);
  const [providerReady, setProviderReady] = useState<boolean | null>(null);
  const [remainingSongs, setRemainingSongs] = useState<number | null>(null);
  const [taskId, setTaskId] = useState("");
  const [generationStatus, setGenerationStatus] = useState("IDLE");
  const [tracks, setTracks] = useState<GeneratedTrack[]>([]);
  const [error, setError] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const streamRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const generationLockRef = useRef(false);

  const isGenerating = generationStatus === "STARTING"
    || (!completedStatuses.has(generationStatus) && generationStatus !== "IDLE");
  const ready = stage === "ready" && planIsReady(plan);
  const statusLabel = {
    STARTING: "Enviando sua direção…",
    PENDING: "Criando letra, melodia e arranjo…",
    TEXT_SUCCESS: "A composição está pronta. Produzindo o áudio…",
    FIRST_SUCCESS: "Primeira música pronta. Finalizando a segunda…",
    SUCCESS: "Suas músicas estão prontas.",
  }[generationStatus] ?? "Criando suas músicas…";

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;
      const speechWindow = window as SpeechWindow;
      setSpeechSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));
      try {
        const saved = window.localStorage.getItem(studioStorageKey);
        if (saved) {
          try {
            const data = JSON.parse(saved) as SavedStudio;
            if (data.conversationId) setConversationId(data.conversationId);
            if (Array.isArray(data.messages) && data.messages.length) setMessages(data.messages);
            if (data.plan) setPlan(data.plan);
            if (data.stage) setStage(data.stage);
            if (Array.isArray(data.missingFields)) setMissingFields(data.missingFields);
            if (Array.isArray(data.quickReplies)) setQuickReplies(data.quickReplies);
            if (data.mode) setMode(data.mode);
            if (data.taskId) setTaskId(data.taskId);
            if (data.generationStatus) setGenerationStatus(data.generationStatus);
            if (Array.isArray(data.tracks)) setTracks(data.tracks);
          } catch {
            window.localStorage.removeItem(studioStorageKey);
          }
        }
      } catch {
        // localStorage can be unavailable in hardened browser contexts.
      }
      setConversationId((current) => current || makeId("conversation"));
      setHydrated(true);
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let active = true;
    memberApi("/v1/music/availability")
      .then((data) => {
        if (!active) return;
        setProviderReady(Boolean(data.available));
        setConversationAvailable(data.conversationAvailable !== false);
        setRemainingSongs(Number(data.remainingSongs));
      })
      .catch((requestError) => {
        if (!active) return;
        setProviderReady(false);
        setConversationAvailable(false);
        setError(requestError instanceof Error ? requestError.message : "Não foi possível abrir o estúdio.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !conversationId) return;
    const saved: SavedStudio = {
      conversationId,
      messages: messages.slice(-30),
      plan,
      stage,
      quickReplies,
      missingFields,
      mode,
      taskId,
      generationStatus,
      tracks,
    };
    window.localStorage.setItem(studioStorageKey, JSON.stringify(saved));
  }, [
    conversationId,
    generationStatus,
    hydrated,
    messages,
    missingFields,
    mode,
    plan,
    quickReplies,
    stage,
    taskId,
    tracks,
  ]);

  useEffect(() => {
    const stream = streamRef.current;
    if (!stream) return;
    stream.scrollTo({ top: stream.scrollHeight, behavior: "smooth" });
  }, [isThinking, messages, tracks]);

  useEffect(() => {
    if (completedStatuses.has(generationStatus)) {
      generationLockRef.current = false;
    }
  }, [generationStatus]);

  useEffect(() => {
    if (!taskId || completedStatuses.has(generationStatus)) return;
    let active = true;
    let timer = 0;
    const check = async () => {
      try {
        const data = await memberApi(`/v1/music/generations/${encodeURIComponent(taskId)}`);
        if (!active) return;
        setGenerationStatus(data.status);
        setTracks(data.tracks ?? []);
        setError(data.error ?? "");
        if (typeof data.remainingSongs === "number") setRemainingSongs(data.remainingSongs);
        if (data.status === "SUCCESS") {
          setMessages((current) => (
            current.some((message) => message.id === `result_${taskId}`)
              ? current
              : [...current, {
                  id: `result_${taskId}`,
                  role: "assistant",
                  text: "Suas duas músicas ficaram prontas. Ouça, compare e me diga o que deseja mudar na próxima rodada.",
                }]
          ));
          setQuickReplies(refinementReplies);
          setMode("refine");
        }
        if (failedStatuses.has(data.status)) {
          setMessages((current) => (
            current.some((message) => message.id === `failed_${taskId}`)
              ? current
              : [...current, {
                  id: `failed_${taskId}`,
                  role: "assistant",
                  text: "Essa tentativa não terminou. O saldo foi devolvido; sua conversa continua salva para tentar novamente.",
                }]
          ));
        }
        if (!completedStatuses.has(data.status)) {
          timer = window.setTimeout(check, 5_000);
        }
      } catch (requestError) {
        if (!active) return;
        const message = requestError instanceof Error
          ? requestError.message
          : "Não foi possível acompanhar a criação.";
        setError(message);
        if (message.includes("não encontrada")) {
          setTaskId("");
          setGenerationStatus("IDLE");
        } else {
          timer = window.setTimeout(check, 8_000);
        }
      }
    };
    timer = window.setTimeout(check, 2_000);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [generationStatus, taskId]);

  async function sendMessage(text = input, method = inputMethod) {
    const cleanText = text.trim();
    if (!cleanText || isThinking || isGenerating) return;
    const userMessage: ChatMessage = {
      id: makeId("user"),
      role: "user",
      text: cleanText.slice(0, 1_000),
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setInputMethod("text");
    setIsThinking(true);
    setError("");
    try {
      const data = await memberApi("/v1/music/conversation", {
        method: "POST",
        body: JSON.stringify({
          conversationId,
          mode: tracks.length ? "refine" : mode,
          messages: nextMessages.map((message) => ({
            role: message.role,
            text: message.text,
          })),
          plan,
          inputMethod: method,
          availableStyles: musicStyles.map(({ slug, name }) => ({ slug, name })),
          selectedTrack: tracks[0]
            ? { id: tracks[0].id, title: tracks[0].title, tags: tracks[0].tags }
            : undefined,
        }),
      });
      setConversationId(data.conversationId);
      setPlan(data.plan);
      setStage(data.stage);
      setMissingFields(data.missingFields ?? []);
      setQuickReplies(data.quickReplies ?? []);
      setRemainingSongs(Number(data.remainingSongs));
      setMessages((current) => [...current, {
        id: makeId("producer"),
        role: "assistant",
        text: data.reply,
      }]);
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : "Não consegui continuar a conversa.";
      setError(message);
      if (message.includes("modo guiado") || message.includes("manutenção")) {
        setConversationAvailable(false);
      }
    } finally {
      setIsThinking(false);
    }
  }

  async function generateMusic(selectedPlan = plan, selectedMode = mode) {
    if (
      generationLockRef.current
      || isGenerating
      || !planIsReady(selectedPlan)
      || remainingSongs === null
      || remainingSongs === 0
    ) return;
    generationLockRef.current = true;
    setError("");
    setGenerationStatus("STARTING");
    setTracks([]);
    try {
      const data = await memberApi("/v1/music/generations", {
        method: "POST",
        body: JSON.stringify({
          brief: createBrief(selectedPlan),
          instrumental: selectedPlan.instrumental,
          conversationId,
          mode: selectedMode,
        }),
      });
      setTaskId(data.taskId);
      setGenerationStatus(data.status);
      setRemainingSongs(Number(data.remainingSongs));
      setMessages((current) => [...current, {
        id: makeId("producer"),
        role: "assistant",
        text: "Direção confirmada. Agora vou transformar nossa conversa em duas músicas.",
      }]);
      setQuickReplies([]);
    } catch (requestError) {
      generationLockRef.current = false;
      setGenerationStatus("IDLE");
      setError(requestError instanceof Error ? requestError.message : "Não foi possível iniciar a criação.");
    }
  }

  function startListening() {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setError("O ditado não está disponível neste navegador. Você pode continuar digitando.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    setError("");
    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) {
        setInput(transcript);
        setInputMethod("voice");
      }
    };
    recognition.onerror = (event) => {
      const denied = event.error === "not-allowed" || event.error === "service-not-allowed";
      setError(denied
        ? "O microfone não foi autorizado. Libere a permissão ou continue digitando."
        : "Não consegui ouvir com clareza. Tente novamente ou continue digitando.");
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      window.setTimeout(() => inputRef.current?.focus(), 0);
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  function requestChange() {
    setStage("collecting");
    setQuickReplies(refinementReplies);
    setMessages((current) => [...current, {
      id: makeId("producer"),
      role: "assistant",
      text: "Claro. Diga o que você quer mudar; eu atualizo a direção antes de criar.",
    }]);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function clearConversation() {
    if (isGenerating) return;
    recognitionRef.current?.stop();
    const nextConversationId = makeId("conversation");
    setConversationId(nextConversationId);
    setMessages([initialMessage]);
    setPlan(emptyPlan);
    setStage("collecting");
    setMissingFields(initialMissingFields);
    setMode("create");
    setQuickReplies(initialReplies);
    setInput("");
    setTracks([]);
    setTaskId("");
    setGenerationStatus("IDLE");
    generationLockRef.current = false;
    setError("");
    window.localStorage.removeItem(studioStorageKey);
  }

  const activeField = missingFields[0];
  const lesson = activeField ? fieldLessons[activeField] : null;
  const planItems = [
    { field: "theme" as const, value: plan.theme },
    { field: "emotion" as const, value: plan.emotion },
    { field: "style" as const, value: plan.style },
    ...(!plan.instrumental ? [
      { field: "voice" as const, value: plan.voice },
      { field: "hook" as const, value: plan.hook },
    ] : []),
  ];
  const completedPlanItems = planItems.filter((item) => (
    Boolean(item.value) && !missingFields.includes(item.field)
  )).length;
  const planProgress = Math.round((completedPlanItems / Math.max(planItems.length, 1)) * 100);

  return (
    <AcademyShell
      title="Criar música"
      eyebrow="PRODUTOR IA • ESTÚDIO CONVERSACIONAL"
      className="producer-academy"
    >
      <section className="studio-welcome producer-welcome">
        <div>
          <small>VOCÊ CONTA • O PRODUTOR ORGANIZA</small>
          <h2>Crie sua música em uma conversa.</h2>
          <p>Uma escolha por vez. Você entende o que muda no resultado antes de criar.</p>
        </div>
        <ol aria-label="Etapas da criação">
          <li className={!isGenerating && !tracks.length ? "active" : ""}><span>1</span><b>Converse</b></li>
          <li className={ready && !isGenerating ? "active" : ""}><span>2</span><b>Confirme</b></li>
          <li className={isGenerating ? "active" : ""}><span>3</span><b>Crie</b></li>
          <li className={tracks.length ? "active" : ""}><span>4</span><b>Ouça</b></li>
        </ol>
      </section>

      {conversationAvailable === false ? (
        <LegacyStudio isGenerating={isGenerating} onGenerate={generateMusic} />
      ) : (
        <section className="producer-studio">
          <div className="producer-chat">
            <header className="producer-chat-head">
              <div className="producer-avatar" aria-hidden="true"><i /><span>♪</span></div>
              <div>
                <small>SEU PARCEIRO CRIATIVO</small>
                <h2>Produtor IA</h2>
                <p><i /> {conversationAvailable === null ? "Abrindo o estúdio…" : "Pronto para conversar"}</p>
              </div>
              <button type="button" onClick={clearConversation} disabled={isGenerating}>
                Nova música
              </button>
            </header>

            <div ref={streamRef} className="conversation-stream" aria-live="polite" aria-busy={isThinking}>
              {messages.map((message) => (
                <article className={`chat-message ${message.role}`} key={message.id}>
                  <span>{message.role === "assistant" ? "PI" : "VOCÊ"}</span>
                  <p>{message.text}</p>
                </article>
              ))}

              {isGenerating ? (
                <article className="chat-message assistant generation-progress">
                  <span>PI</span>
                  <div><i aria-hidden="true" /><p>{statusLabel}</p><small>Você pode acompanhar aqui. A conversa está salva.</small></div>
                </article>
              ) : null}

              {tracks.length ? (
                <div className="chat-tracks">
                  {tracks.map((track, index) => {
                    const playableUrl = track.audioUrl || track.streamAudioUrl;
                    return (
                      <article key={track.id || index}>
                        <div
                          className="chat-track-cover"
                          style={track.imageUrl ? { backgroundImage: `url("${track.imageUrl}")` } : {}}
                        >
                          <span>0{index + 1}</span>
                        </div>
                        <div className="chat-track-copy">
                          <small>VERSÃO {index + 1}</small>
                          <h3>{track.title}</h3>
                          <p>{track.duration ? `${Math.round(track.duration)} segundos` : "Música pronta"}</p>
                        </div>
                        {playableUrl ? <audio controls preload="none" src={playableUrl} /> : <span>Finalizando áudio…</span>}
                        {track.audioUrl ? <a href={track.audioUrl} target="_blank" rel="noreferrer" download>Baixar ↓</a> : null}
                      </article>
                    );
                  })}
                  <p className="refinement-note">Uma nova direção cria outra dupla e utiliza mais 2 músicas do seu saldo.</p>
                </div>
              ) : null}

              {isThinking ? (
                <article className="chat-message assistant producer-thinking">
                  <span>PI</span>
                  <p><i /><i /><i /> Produtor IA está pensando</p>
                </article>
              ) : null}
            </div>

            {quickReplies.length > 0 && !isThinking && !isGenerating ? (
              <div className={`choice-area ${activeField === "theme" ? "starter-choices" : ""}`}>
                {lesson ? (
                  <div className="choice-guide" id="producer-choice-guide">
                    <small>AGORA: {lesson.label.toLocaleUpperCase("pt-BR")}</small>
                    <p>{lesson.lesson}</p>
                  </div>
                ) : null}
                <div className="quick-replies" aria-label="Sugestões de resposta">
                  {quickReplies.map((reply) => {
                    const description = choiceDescriptions[reply];
                    return (
                      <button
                        type="button"
                        key={reply}
                        aria-label={description ? `${reply}: ${description}` : reply}
                        onClick={() => {
                          if (reply === "Quero mudar algo") {
                            requestChange();
                            return;
                          }
                          void sendMessage(reply, "text");
                        }}
                      >
                        <b>{reply}</b>
                        {description ? <small>{description}</small> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <form
              className="conversation-composer"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                maxLength={1_000}
                placeholder={remainingSongs === 0
                  ? "Você ainda pode conversar e preparar uma nova direção…"
                  : activeField
                    ? `Responda sobre ${fieldLessons[activeField].label.toLocaleLowerCase("pt-BR")} ou escolha uma opção acima…`
                    : "Diga o que você quer mudar…"}
                aria-label="Mensagem para o Produtor IA"
                aria-describedby={lesson ? "producer-choice-guide" : undefined}
                disabled={isThinking || isGenerating}
                onChange={(event) => {
                  setInput(event.target.value);
                  setInputMethod("text");
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                    && !event.shiftKey
                    && !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              {speechSupported ? (
                <button
                  className={`voice-button ${isListening ? "listening" : ""}`}
                  type="button"
                  onClick={startListening}
                  aria-label={isListening ? "Parar ditado" : "Falar com o Produtor IA"}
                  disabled={isThinking || isGenerating}
                >
                  <span aria-hidden="true">{isListening ? "■" : "●"}</span>
                  {isListening ? "Ouvindo" : "Falar"}
                </button>
              ) : null}
              <button
                className="send-message-button"
                disabled={!input.trim() || isThinking || isGenerating}
              >
                Enviar <span aria-hidden="true">↑</span>
              </button>
            </form>
            <small className="voice-privacy">O ditado é processado pelo navegador. A Academia recebe somente o texto transcrito.</small>
          </div>

          <aside className="producer-plan">
            <header>
              <small>SUA DIREÇÃO MUSICAL</small>
              <h2>{ready ? "Pronta para criar" : "Construindo com você"}</h2>
              <p>{completedPlanItems} de {planItems.length} escolhas feitas</p>
              <div
                className="plan-progress"
                role="progressbar"
                aria-label="Progresso da direção musical"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={planProgress}
              >
                <i style={{ width: `${planProgress}%` }} />
              </div>
            </header>

            <ol className="plan-steps">
              {planItems.map((item) => {
                const current = activeField === item.field;
                const completed = Boolean(item.value) && !missingFields.includes(item.field);
                const status = completed ? "FEITO" : current ? "AGORA" : "DEPOIS";
                return (
                  <li className={completed ? "completed" : current ? "current" : "pending"} key={item.field}>
                    <div>
                      <small>{fieldLessons[item.field].label}</small>
                      <span>{status}</span>
                    </div>
                    <p>{completed ? item.value : current ? "Escolha na conversa" : "Vem na próxima etapa"}</p>
                  </li>
                );
              })}
              {plan.instrumental ? (
                <li className="completed">
                  <div><small>Formato</small><span>FEITO</span></div>
                  <p>Somente instrumentos, sem voz</p>
                </li>
              ) : null}
            </ol>

            <div className={`studio-status ${providerReady ? "ready" : ""}`} aria-live="polite">
              <i aria-hidden="true" />
              <div>
                <b>{remainingSongs === 0 ? "Pacote concluído" : providerReady ? "Estúdio pronto" : "Verificando o estúdio"}</b>
                <small>{remainingSongs === null ? "Consultando seu saldo" : `${remainingSongs} músicas disponíveis`}</small>
              </div>
            </div>

            {error ? <p className="generation-error" role="alert">{error}</p> : null}

            {ready ? (
              <>
                <button
                  className="confirm-plan-button"
                  type="button"
                  disabled={isGenerating || providerReady !== true || remainingSongs === null || remainingSongs === 0}
                  onClick={() => void generateMusic(plan, mode)}
                >
                  {isGenerating
                    ? statusLabel
                    : remainingSongs === 0
                      ? "Saldo concluído"
                      : "Criar duas músicas →"}
                </button>
                <button className="change-plan-button" type="button" onClick={requestChange} disabled={isGenerating}>
                  Quero mudar algo
                </button>
                <p className="balance-preview">
                  {remainingSongs === 0
                    ? "Conversar continua gratuito. Para criar outra dupla, será necessário novo saldo."
                    : remainingSongs === 1
                      ? "Esta última rodada entrega duas versões e conclui seu saldo, sem custo adicional."
                      : `Esta rodada usa 2 músicas${remainingSongs !== null ? ` • seu saldo ficará em ${remainingSongs - 2}` : ""}`}
                </p>
              </>
            ) : (
              <p className="plan-guidance">Continue a conversa. Quando a direção estiver clara, você confirma antes de usar o saldo.</p>
            )}

            <button className="clear-conversation-button" type="button" onClick={clearConversation} disabled={isGenerating}>
              Limpar conversa
            </button>
          </aside>
        </section>
      )}
    </AcademyShell>
  );
}
