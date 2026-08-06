"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AcademyShell } from "../../components/Portal";
import { memberApi } from "../../lib/access";
import { getAnalyticsContext, trackEvent } from "../../lib/analytics";
import {
  businessProspectStorageKey,
  createBusinessJingleIdea,
  isBusinessProspect,
} from "../../lib/businessProspects";
import {
  clearAcademyPlayerSelection,
  playInAcademyPlayer,
} from "../../lib/musicPlatform";
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
  referenceTrackId: string;
};

type SavedStudio = {
  plan: MusicPlan;
  creationType: string;
  taskId: string;
  generationStatus: string;
  tracks: GeneratedTrack[];
  mode: "create" | "refine";
  flowStep?: CreatorStep;
};

type CreatorStep = 1 | 2 | 3 | 4 | 5 | 6;

function isCreatorStep(value: unknown): value is CreatorStep {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 6;
}

const creationTypes = [
  { id: "historia", icon: "✦", label: "Minha história", detail: "Um momento que merece virar música", placeholder: "Conte o momento mais importante dessa história…" },
  { id: "homenagem", icon: "♡", label: "Homenagem", detail: "Para alguém que marcou sua vida", placeholder: "Para quem é a homenagem e o que essa pessoa representa?" },
  { id: "romance", icon: "∞", label: "Romance", detail: "Amor, saudade ou reencontro", placeholder: "O que aconteceu nessa história de amor?" },
  { id: "superacao", icon: "↑", label: "Superação", detail: "O desafio e a sua virada", placeholder: "Que desafio você venceu — ou ainda está vencendo?" },
  { id: "jingle", icon: "◉", label: "Jingle", detail: "Uma ideia que precisa ser lembrada", placeholder: "Qual negócio, produto ou mensagem a música deve apresentar?" },
  { id: "instrumental", icon: "♫", label: "Instrumental", detail: "Um clima sem voz nem letra", placeholder: "Que cena ou sensação esse instrumental deve criar?" },
] as const;

const emotions = [
  { value: "Alegria", prompt: "Quero abrir um sorriso", detail: "Leve e luminosa" },
  { value: "Saudade", prompt: "Quero lembrar com carinho", detail: "Íntima e nostálgica" },
  { value: "Esperança", prompt: "Quero sentir que vai dar certo", detail: "Emocional e crescente" },
  { value: "Paixão", prompt: "Quero sentir o coração bater", detail: "Intensa e envolvente" },
  { value: "Superação", prompt: "Quero ganhar força", detail: "Forte e inspiradora" },
  { value: "Festa", prompt: "Quero dançar e comemorar", detail: "Contagiante e cheia de energia" },
] as const;

const voices = [
  ["Masculina e próxima", "Natural e íntima"],
  ["Feminina e forte", "Presença e emoção"],
  ["Dueto", "Duas vozes em diálogo"],
] as const;

const popularStyleSlugs = [
  "sertanejo-universitario",
  "pagode-atual",
  "forro-pe-de-serra",
  "trap-brasileiro",
  "funk-melody",
  "pop-brasileiro",
];

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

const statusCopy: Record<string, { title: string; detail: string }> = {
  STARTING: {
    title: "Enviando sua direção",
    detail: "Estamos preparando a sessão de criação.",
  },
  PENDING: {
    title: "Criando letra, melodia e arranjo",
    detail: "Sua música está sendo produzida.",
  },
  TEXT_SUCCESS: {
    title: "Composição pronta",
    detail: "Agora estamos transformando a direção em áudio.",
  },
  FIRST_SUCCESS: {
    title: "Primeira versão pronta",
    detail: "A segunda está sendo finalizada.",
  },
};

const storageKey = "academia_express_studio_v1";
const defaultPlan: MusicPlan = {
  theme: "",
  emotion: "Alegria",
  style: "Pop brasileiro",
  voice: "Masculina e próxima",
  hook: "",
  instrumental: false,
  referenceTrackId: "",
};

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function findStyle(styleName: string) {
  const normalized = styleName.trim().toLocaleLowerCase("pt-BR");
  if (!normalized) return undefined;
  return musicStyles.find((item) => (
    item.name.toLocaleLowerCase("pt-BR") === normalized
    || item.slug === normalized
    || item.name.toLocaleLowerCase("pt-BR").includes(normalized)
    || normalized.includes(item.name.toLocaleLowerCase("pt-BR"))
  ));
}

function createBrief(plan: MusicPlan) {
  const style = findStyle(plan.style);
  const referenceTrack = style?.referenceTracks?.find((item) => item.id === plan.referenceTrackId);
  const direction = style
    ? `Arranjo: ${style.instruments}; ${style.groove}; ${style.bpm} BPM.`
    : "Arranjo brasileiro coerente com o estilo, com melodia clara e produção natural.";
  const parts = [
    `Canção brasileira original em ${plan.style || "Pop brasileiro"}.`,
    referenceTrack ? `Direção sonora escolhida: ${referenceTrack.direction}` : "",
    `Tema: ${plan.theme}.`,
    `Emoção: ${plan.emotion}.`,
    plan.instrumental ? "Somente instrumental, sem voz e sem letra." : `Voz: ${plan.voice}.`,
    plan.instrumental
      ? ""
      : plan.hook.trim()
        ? `Refrão inspirado em “${plan.hook.trim()}”.`
        : "Crie um refrão original, curto e memorável a partir da história.",
    direction,
    "Letra humana, imagens concretas e refrão memorável. Não imite artistas reais.",
  ].filter(Boolean);
  const brief = parts.join(" ");
  if (brief.length <= 500) return brief;
  return `${brief.slice(0, 499).replace(/\s+\S*$/, "").trim()}.`;
}

function planIsReady(plan: MusicPlan) {
  return Boolean(
    plan.theme.trim().length >= 8
    && plan.emotion
    && plan.style
    && (plan.instrumental || plan.voice),
  );
}

export default function Gerador() {
  const [plan, setPlan] = useState<MusicPlan>(defaultPlan);
  const [creationType, setCreationType] = useState("historia");
  const [providerReady, setProviderReady] = useState<boolean | null>(null);
  const [remainingSongs, setRemainingSongs] = useState<number | null>(null);
  const [taskId, setTaskId] = useState("");
  const [generationStatus, setGenerationStatus] = useState("IDLE");
  const [tracks, setTracks] = useState<GeneratedTrack[]>([]);
  const [mode, setMode] = useState<"create" | "refine">("create");
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [flowStep, setFlowStep] = useState<CreatorStep>(1);
  const [importNotice, setImportNotice] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const generationLockRef = useRef(false);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const resultAudioRefs = useRef<Array<HTMLAudioElement | null>>([]);

  const selectedType = creationTypes.find((item) => item.id === creationType) ?? creationTypes[0];
  const selectedStyle = findStyle(plan.style);
  const selectedReferenceTrack = selectedStyle?.referenceTracks?.find(
    (item) => item.id === plan.referenceTrackId,
  );
  const isGenerating = generationStatus === "STARTING"
    || (!completedStatuses.has(generationStatus) && generationStatus !== "IDLE");
  const generationFailed = failedStatuses.has(generationStatus);
  const ready = planIsReady(plan);
  const creationCost = remainingSongs === 1 ? 1 : 2;
  const canCreate = Boolean(remainingSongs);
  const selectedTrack = tracks.find((track) => track.id === selectedTrackId) ?? tracks[0];
  const styleOptions = useMemo(() => (
    showAllStyles
      ? musicStyles
      : musicStyles.filter((style) => popularStyleSlugs.includes(style.slug))
  ), [showAllStyles]);

  useEffect(() => {
    trackEvent("music_creator_opened");
    trackEvent("music_route_unique_opened");
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const importSource = params.get("source") || "";
      let importedBusinessName = "";
      let importedIdea = params.get("idea")?.trim().slice(0, 500) || "";
      if (importSource === "business-prospect") {
        try {
          const storedProspect = JSON.parse(
            window.sessionStorage.getItem(businessProspectStorageKey) || "null",
          );
          if (isBusinessProspect(storedProspect)) {
            importedIdea = createBusinessJingleIdea(storedProspect);
            importedBusinessName = storedProspect.name;
          }
        } catch {
          // A malformed browser draft must not prevent the creator from opening.
        } finally {
          window.sessionStorage.removeItem(businessProspectStorageKey);
        }
      }
      const importedStyle = findStyle(params.get("style") || "");
      let nextPlan = defaultPlan;
      let nextCreationType = "historia";
      let nextTaskId = "";
      let nextGenerationStatus = "IDLE";
      let nextTracks: GeneratedTrack[] = [];
      let nextMode: "create" | "refine" = "create";
      let nextFlowStep: CreatorStep = 1;
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const data = JSON.parse(saved) as SavedStudio;
          if (data.plan) nextPlan = data.plan;
          if (data.creationType) nextCreationType = data.creationType;
          if (data.taskId) nextTaskId = data.taskId;
          if (data.generationStatus) nextGenerationStatus = data.generationStatus;
          if (Array.isArray(data.tracks)) nextTracks = data.tracks;
          if (data.mode) nextMode = data.mode;
          if (isCreatorStep(data.flowStep)) {
            nextFlowStep = data.flowStep === 5 && data.plan?.instrumental ? 4 : data.flowStep;
          }
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }

      if (importedIdea || importedStyle) {
        nextPlan = {
          ...nextPlan,
          ...(importedIdea ? { theme: importedIdea, instrumental: false } : {}),
          ...(importedStyle ? { style: importedStyle.name } : {}),
        };
        nextCreationType = importedBusinessName
          ? "jingle"
          : importedIdea ? "historia" : nextCreationType;
        nextTaskId = "";
        nextGenerationStatus = "IDLE";
        nextTracks = [];
        nextMode = "create";
        nextFlowStep = importedIdea
          ? 3
          : nextPlan.theme.trim().length >= 8
            ? nextPlan.instrumental ? 4 : 5
            : 2;
        setImportNotice(importedBusinessName
          ? `${importedBusinessName} foi aplicado ao briefing. Agora escolha o clima do jingle.`
          : importedIdea
            ? "Sua história foi aplicada. Agora escolha o clima."
            : `${importedStyle?.name} foi aplicado. Continue sua direção.`);
        trackEvent("expert_direction_received", window.location.pathname, {
          placement: importSource || "direct",
        });
        if (importedBusinessName) {
          trackEvent("prospect_jingle_creator_opened", window.location.pathname, {
            placement: "business-prospect",
          });
        }
        window.history.replaceState({}, "", window.location.pathname);
      }

      setPlan(nextPlan);
      setCreationType(nextCreationType);
      setTaskId(nextTaskId);
      setGenerationStatus(nextGenerationStatus);
      setTracks(nextTracks);
      setMode(nextMode);
      setFlowStep(nextFlowStep);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    memberApi("/v1/music/availability")
      .then((data) => {
        if (!active) return;
        setProviderReady(Boolean(data.available));
        setRemainingSongs(Number(data.remainingSongs));
        if (data.starterPreview?.story) {
          setPlan((current) => current.theme.trim()
            ? current
            : {
                ...current,
                theme: String(data.starterPreview.story).slice(0, 400),
                emotion: String(data.starterPreview.emotion || current.emotion).slice(0, 120),
                style: String(data.starterPreview.style || current.style).slice(0, 120),
                hook: String(data.starterPreview.hook || current.hook).slice(0, 120),
                instrumental: false,
              });
          setCreationType("historia");
          setFlowStep(6);
          setImportNotice("Sua prévia foi recuperada. Revise a direção antes de usar os créditos.");
        }
      })
      .catch((requestError) => {
        if (!active) return;
        setProviderReady(false);
        setError(requestError instanceof Error ? requestError.message : "Não foi possível abrir o estúdio.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const saved: SavedStudio = {
      plan,
      creationType,
      taskId,
      generationStatus,
      tracks,
      mode,
      flowStep,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(saved));
  }, [creationType, flowStep, generationStatus, hydrated, mode, plan, taskId, tracks]);

  useEffect(() => {
    if (!hydrated || isGenerating || tracks.length) return;
    trackEvent("creator_step_viewed", window.location.pathname, {
      step: String(flowStep),
    });
  }, [flowStep, hydrated, isGenerating, tracks.length]);

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
          generationLockRef.current = false;
          trackEvent("music_generation_delivered", window.location.pathname, {
            outcome: Array.isArray(data.tracks) && data.tracks.length > 1
              ? "multiple_tracks"
              : "single_track",
          });
          window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
        }
        if (failedStatuses.has(data.status)) generationLockRef.current = false;
        if (!completedStatuses.has(data.status)) timer = window.setTimeout(check, 5_000);
      } catch (requestError) {
        if (!active) return;
        const message = requestError instanceof Error
          ? requestError.message
          : "Não foi possível acompanhar a criação.";
        setError(message);
        timer = window.setTimeout(check, 8_000);
      }
    };
    timer = window.setTimeout(check, 2_000);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [generationStatus, taskId]);

  function updatePlan(patch: Partial<MusicPlan>) {
    setPlan((current) => ({ ...current, ...patch }));
    setError("");
  }

  function selectCreationType(typeId: string) {
    const instrumental = typeId === "instrumental";
    setCreationType(typeId);
    updatePlan({
      instrumental,
      voice: instrumental ? "" : plan.voice || "Masculina e próxima",
      hook: instrumental ? "" : plan.hook,
    });
  }

  async function generateMusic(selectedPlan = plan, selectedMode = mode) {
    if (
      generationLockRef.current
      || isGenerating
      || !planIsReady(selectedPlan)
      || remainingSongs === null
      || !canCreate
    ) return;

    generationLockRef.current = true;
    setError("");
    setGenerationStatus("STARTING");
    setTracks([]);
    trackEvent("music_creator_plan_ready");
    trackEvent("paid_generation_started", window.location.pathname, {
      journey: "music_present_v1",
      product: "starter_20",
    });
    try {
      const data = await memberApi("/v1/music/generations", {
        method: "POST",
        body: JSON.stringify({
          brief: createBrief(selectedPlan),
          instrumental: selectedPlan.instrumental,
          coverBeatId: selectedPlan.referenceTrackId,
          conversationId: makeId("express"),
          mode: selectedMode,
          reservationType: "CREDITS",
          ...getAnalyticsContext(),
        }),
      });
      setTaskId(data.taskId);
      setGenerationStatus(data.status);
      setRemainingSongs(Number(data.remainingSongs));
    } catch (requestError) {
      generationLockRef.current = false;
      setGenerationStatus("IDLE");
      setError(requestError instanceof Error ? requestError.message : "Não foi possível iniciar a criação.");
    }
  }

  function startRefinement(patch: Partial<MusicPlan>) {
    const nextPlan = { ...plan, ...patch };
    setPlan(nextPlan);
    setMode("refine");
    setFlowStep(6);
    setTracks([]);
    setSelectedTrackId("");
    setTaskId("");
    setGenerationStatus("IDLE");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNewMusic() {
    if (isGenerating) return;
    setPlan(defaultPlan);
    setCreationType("historia");
    setTaskId("");
    setGenerationStatus("IDLE");
    setTracks([]);
    setSelectedTrackId("");
    setMode("create");
    setFlowStep(1);
    setError("");
    generationLockRef.current = false;
    window.localStorage.removeItem(storageKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const status = statusCopy[generationStatus];
  const totalChoiceSteps = plan.instrumental ? 4 : 5;
  const visibleChoiceStep = flowStep === 6
    ? totalChoiceSteps
    : Math.min(flowStep, totalChoiceSteps);

  function goBack() {
    if (flowStep === 6) {
      setFlowStep(plan.instrumental ? 4 : 5);
      return;
    }
    setFlowStep((current) => Math.max(1, current - 1) as CreatorStep);
  }

  function goNext() {
    trackEvent("creator_step_completed", window.location.pathname, {
      step: String(flowStep),
    });
    if (flowStep === 4 && plan.instrumental) {
      setFlowStep(6);
      return;
    }
    setFlowStep((current) => Math.min(6, current + 1) as CreatorStep);
  }

  function keepSingleResultPlaying(activeIndex: number) {
    resultAudioRefs.current.forEach((audio, index) => {
      if (audio && index !== activeIndex && !audio.paused) {
        audio.pause();
      }
    });
  }

  return (
    <AcademyShell title="Criar" eyebrow="ROTA DE CRIAÇÃO" className="express-academy">
      <section className="express-hero">
        <div>
          <small>UMA DECISÃO POR VEZ</small>
          <h2>{tracks.length
            ? "Sua ideia ganhou som."
            : isGenerating
              ? "Agora deixe a música nascer."
              : "Sua música, passo a passo."}</h2>
          <p>{tracks.length
            ? "Ouça com calma, escolha a versão que mais combina com a história e avance para a capa."
            : isGenerating
              ? "Sua direção está protegida. Você pode acompanhar cada etapa sem preencher tudo outra vez."
              : "Conte o essencial. A plataforma organiza a direção e mostra o que será criado antes de começar."}</p>
        </div>
        <ol aria-label="Etapas da criação">
          <li className={!isGenerating && !tracks.length ? "active" : "done"}><span>1</span><b>Direção</b></li>
          <li className={isGenerating ? "active" : tracks.length ? "done" : ""}><span>2</span><b>Crie</b></li>
          <li className={tracks.length ? "active" : ""}><span>3</span><b>Ouça</b></li>
        </ol>
      </section>

      {!isGenerating && !tracks.length ? (
        <section
          className="express-flow"
          aria-live="polite"
          data-interactive={hydrated && providerReady !== null ? "true" : "false"}
        >
          {importNotice ? <p className="express-import-notice" role="status">{importNotice}</p> : null}
          <header className="express-flow-progress">
            <span>PASSO {visibleChoiceStep} DE {totalChoiceSteps}</span>
            <div aria-hidden="true">
              <i style={{ width: `${(visibleChoiceStep / totalChoiceSteps) * 100}%` }} />
            </div>
          </header>

          <div className="express-scene" key={flowStep}>
            {flowStep === 1 ? (
              <section className="express-block">
                <header>
                  <span>01</span>
                  <div><small>COMECE PELO MOTIVO</small><h3>O que você quer criar?</h3></div>
                </header>
                <div className="express-type-grid">
                  {creationTypes.map((type) => (
                    <button
                      type="button"
                      key={type.id}
                      className={creationType === type.id ? "selected" : ""}
                      aria-pressed={creationType === type.id}
                      onClick={() => selectCreationType(type.id)}
                    >
                      <i>{type.icon}</i>
                      <span><b>{type.label}</b><small>{type.detail}</small></span>
                      <em>{creationType === type.id ? "✓" : "＋"}</em>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {flowStep === 2 ? (
              <section className="express-block">
                <header>
                  <span>02</span>
                  <div><small>CONTE SÓ O ESSENCIAL</small><h3>Qual é a sua ideia?</h3></div>
                </header>
                <label className="express-story">
                  <textarea
                    rows={4}
                    autoFocus
                    value={plan.theme}
                    maxLength={500}
                    placeholder={selectedType.placeholder}
                    onChange={(event) => updatePlan({ theme: event.target.value })}
                  />
                  <small>{plan.theme.length}/500</small>
                </label>
                <div className="express-example">
                  <b>Exemplo</b>
                  <p>“Quero homenagear minha mãe, que criou três filhos sozinha e nunca deixou faltar amor.”</p>
                </div>
                {creationType === "jingle" ? (
                  <Link className="express-business-search" href="/biblioteca/negocios">
                    <span>⌖</span>
                    <div>
                      <b>Ainda não escolheu uma empresa?</b>
                      <small>Busque negócios reais com o Apify e volte com o briefing preenchido.</small>
                    </div>
                    <em>Buscar negócios →</em>
                  </Link>
                ) : null}
              </section>
            ) : null}

            {flowStep === 3 ? (
              <section className="express-block">
                <header>
                  <span>03</span>
                  <div>
                    <small>ESCOLHA PELO EFEITO</small>
                    <h3>O que você quer sentir quando der o play?</h3>
                    <p className="express-choice-hint">Não pense em estilo musical. Escolha a frase que mais combina com a sua história.</p>
                  </div>
                </header>
                <div className="express-choice-grid emotion-grid">
                  {emotions.map((emotion) => (
                    <button
                      type="button"
                      key={emotion.value}
                      className={plan.emotion === emotion.value ? "selected" : ""}
                      aria-pressed={plan.emotion === emotion.value}
                      onClick={() => updatePlan({ emotion: emotion.value })}
                    >
                      <span className="emotion-copy">
                        <b>{emotion.prompt}</b>
                        <small>{emotion.detail}</small>
                      </span>
                      <em>{emotion.value}</em>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {flowStep === 4 ? (
              <section className="express-block">
                <header>
                  <span>04</span>
                  <div><small>ESCOLHA O SOM</small><h3>Qual estilo combina com a sua ideia?</h3></div>
                </header>
                <div className="express-style-grid">
                  {styleOptions.map((style) => (
                    <button
                      type="button"
                      key={style.slug}
                      className={plan.style === style.name ? "selected" : ""}
                      aria-pressed={plan.style === style.name}
                      onClick={() => updatePlan({ style: style.name, referenceTrackId: "" })}
                    >
                      <span>{style.family}</span>
                      <b>{style.name}</b>
                      <small>{style.mood}</small>
                    </button>
                  ))}
                </div>
                <button className="express-more-styles" type="button" onClick={() => setShowAllStyles((current) => !current)}>
                  {showAllStyles ? "Mostrar estilos principais ↑" : `Ver todos os ${musicStyles.length} estilos brasileiros ↓`}
                </button>
                {!plan.instrumental && selectedStyle?.referenceTracks?.length ? (
                  <section className="express-reference-picker" aria-labelledby="trap-reference-title">
                    <header>
                      <div>
                        <small>BEATS LIBERADOS PARA COVER</small>
                        <h4 id="trap-reference-title">Escolha o beat do seu trap</h4>
                      </div>
                      <span>Permitido para esta criação</span>
                    </header>
                    {selectedStyle.referenceTracks.map((reference) => {
                      const selected = plan.referenceTrackId === reference.id;
                      return (
                        <article className={selected ? "selected" : ""} key={reference.id}>
                          <div className="express-reference-art" aria-hidden="true">
                            <span>TRAP</span>
                            <i>01</i>
                          </div>
                          <div className="express-reference-copy">
                            <small>BEAT DISPONÍVEL</small>
                            <h5>{reference.label}</h5>
                            <p>Ouça antes de escolher. Sua letra e sua voz serão criadas sobre este beat.</p>
                            <audio controls preload="metadata" src={reference.audioUrl}>
                              Seu navegador não conseguiu tocar este beat.
                            </audio>
                            <div className="express-reference-actions">
                              <button
                                type="button"
                                className={selected ? "selected" : ""}
                                aria-pressed={selected}
                                onClick={() => updatePlan({
                                  referenceTrackId: selected ? "" : reference.id,
                                })}
                              >
                                {selected ? "✓ Beat escolhido" : "Usar este beat"}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </section>
                ) : null}
              </section>
            ) : null}

            {flowStep === 5 && !plan.instrumental ? (
              <section className="express-block">
                <header>
                  <span>05</span>
                  <div><small>ESCOLHA A INTERPRETAÇÃO</small><h3>Que voz conta melhor essa história?</h3></div>
                </header>
                <div className="express-choice-grid voice-grid">
                  {voices.map(([voice, detail]) => (
                    <button
                      type="button"
                      key={voice}
                      className={plan.voice === voice ? "selected" : ""}
                      aria-pressed={plan.voice === voice}
                      onClick={() => updatePlan({ voice })}
                    >
                      <b>{voice}</b><small>{detail}</small>
                    </button>
                  ))}
                </div>
                <details className="express-advanced">
                  <summary>Quero sugerir uma frase para o refrão</summary>
                  <label>
                    <span>Frase opcional</span>
                    <input
                      value={plan.hook}
                      maxLength={120}
                      placeholder="Se deixar vazio, criamos o refrão para você."
                      onChange={(event) => updatePlan({ hook: event.target.value })}
                    />
                  </label>
                </details>
              </section>
            ) : null}

            {flowStep === 6 ? (
              <section className="express-review">
                <div className="express-review-copy">
                  <small>RESPIRE E CONFIRME</small>
                  <h3>É essa música que você quer criar?</h3>
                  <p>A plataforma entendeu sua ideia assim. Volte para ajustar qualquer escolha antes de começar.</p>
                  <blockquote>{plan.theme}</blockquote>
                </div>
                <aside className="express-summary">
                  <header>
                    <small>SUA DIREÇÃO</small>
                    <h2>{ready ? "Pronta para criar" : "Complete sua ideia"}</h2>
                  </header>
                  <dl>
                    <div><dt>Tipo</dt><dd>{selectedType.label}</dd></div>
                    <div><dt>Clima</dt><dd>{plan.emotion}</dd></div>
                    <div><dt>Estilo</dt><dd>{plan.style}</dd></div>
                    {selectedReferenceTrack ? (
                      <div><dt>Beat</dt><dd>{selectedReferenceTrack.label}</dd></div>
                    ) : null}
                    <div><dt>Voz</dt><dd>{plan.instrumental ? "Instrumental" : plan.voice}</dd></div>
                    <div><dt>Refrão</dt><dd>{plan.instrumental ? "Sem letra" : plan.hook.trim() || "Criado para você"}</dd></div>
                  </dl>

                  <div className={`express-balance ${remainingSongs === 0 ? "empty" : ""}`}>
                    <span>♫</span>
                    <div>
                      <b>{remainingSongs === null
                        ? "Consultando saldo"
                        : remainingSongs === 0
                          ? "Você precisa de créditos para gerar"
                          : `${remainingSongs} créditos disponíveis`}</b>
                      <small>{remainingSongs === 0
                        ? "Adicione créditos para liberar uma nova rodada."
                        : `Esta rodada usa ${creationCost} ${creationCost === 1 ? "crédito" : "créditos"}.`}</small>
                    </div>
                  </div>

                  {error ? (
                    <div className="express-error" role="alert">
                      <b>{generationFailed ? "Sua direção continua salva." : "Não foi possível concluir."}</b>
                      <p>{error}</p>
                    </div>
                  ) : null}

                  {remainingSongs === 0 ? (
                    <Link className="express-create" href="/biblioteca/creditos">
                      Adicionar créditos
                      <span>PIX</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="express-create"
                      disabled={!ready || providerReady !== true || remainingSongs === null}
                      onClick={() => void generateMusic()}
                    >
                      {creationCost === 1 ? "Criar 1 música" : "Criar 2 versões"}
                      <span>{creationCost} {creationCost === 1 ? "CRÉDITO" : "CRÉDITOS"}</span>
                    </button>
                  )}
                  <p className="express-cost">
                    Falhas antes da entrega devolvem automaticamente os créditos.
                  </p>
                </aside>
              </section>
            ) : null}
          </div>

          <footer className="express-flow-controls">
            <button type="button" onClick={goBack} disabled={flowStep === 1}>← Voltar</button>
            <span>{flowStep === 6 ? "Revise antes de criar" : "Sua direção fica salva automaticamente"}</span>
            {flowStep < 6 ? (
              <button
                type="button"
                className="primary"
                onClick={goNext}
                disabled={flowStep === 2 && plan.theme.trim().length < 8}
              >
                Continuar →
              </button>
            ) : (
              <button type="button" className="primary ghost" onClick={startNewMusic}>
                Limpar direção
              </button>
            )}
          </footer>
        </section>
      ) : null}

      {isGenerating ? (
        <section className="express-generation-stage" aria-live="polite">
          <div className="express-generation-disc" aria-hidden="true">
            <img src="/brand/musicacom-symbol.png" alt="" width="358" height="188" />
          </div>
          <div>
            <small>CRIANDO AGORA</small>
            <h2>{status?.title || "Sua música está ganhando forma"}</h2>
            <p>{status?.detail || "Estamos trabalhando na letra, melodia e no arranjo."}</p>
            <div className="express-generation-pulse" aria-hidden="true">
              {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
            </div>
            <dl>
              <div><dt>História</dt><dd>{plan.theme}</dd></div>
              <div><dt>Direção</dt><dd>{plan.style} • {plan.emotion} • {plan.instrumental ? "Instrumental" : plan.voice}</dd></div>
            </dl>
            <p className="express-generation-note">Você pode sair desta página. Sua direção continuará salva.</p>
          </div>
        </section>
      ) : null}

      {tracks.length ? (
        <section ref={resultRef} className="express-results">
          <header>
            <div><small>{tracks.length === 1 ? "SUA MÚSICA DE HOJE" : "DUAS VERSÕES • UMA ESCOLHA"}</small><h2>{tracks.length === 1 ? "Ouça o que nasceu da sua ideia." : "Qual versão conta melhor a sua história?"}</h2></div>
            <button type="button" className="express-new-result" onClick={startNewMusic}>＋ Criar outra música</button>
          </header>
          <div className="express-track-grid">
            {tracks.map((track, index) => {
              const playableUrl = track.audioUrl || track.streamAudioUrl;
              return (
                <article
                  key={track.id || index}
                  className={selectedTrack?.id === track.id ? "selected" : ""}
                >
                  <div
                    className="express-track-cover"
                    style={track.imageUrl ? { backgroundImage: `url("${track.imageUrl}")` } : {}}
                  >
                    <span>{tracks.length === 1 ? "SUA MÚSICA" : `VERSÃO ${index + 1}`}</span>
                    {playableUrl ? (
                      <button
                        type="button"
                        aria-label={`Ouvir ${track.title} no player`}
                        onClick={() => {
                          keepSingleResultPlaying(-1);
                          playInAcademyPlayer(track, tracks.length === 1
                            ? "Sua música"
                            : `Comparando versão ${index + 1}`);
                          trackEvent("music_result_played", window.location.pathname, {
                            placement: `persistent_player_${index + 1}`,
                          });
                        }}
                      >
                        ▶
                      </button>
                    ) : null}
                  </div>
                  <div className="express-track-copy">
                    <small>{plan.style}</small>
                    <h3>{track.title}</h3>
                    <p>{track.duration ? `${Math.round(track.duration)} segundos` : "Finalizando áudio…"}</p>
                    {playableUrl ? (
                      <audio
                        ref={(node) => {
                          resultAudioRefs.current[index] = node;
                        }}
                        controls
                        preload="metadata"
                        src={playableUrl}
                        onPlay={() => {
                          clearAcademyPlayerSelection();
                          keepSingleResultPlaying(index);
                          trackEvent("music_result_played", window.location.pathname, {
                            placement: `result_${index + 1}`,
                          });
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="express-track-actions">
                    <button
                      type="button"
                      className={selectedTrack?.id === track.id ? "selected" : ""}
                      aria-pressed={selectedTrack?.id === track.id}
                      onClick={() => {
                        setSelectedTrackId(track.id);
                        trackEvent("music_version_selected", window.location.pathname, {
                          placement: `result_${index + 1}`,
                        });
                      }}
                    >
                      {selectedTrack?.id === track.id ? "✓ Minha escolhida" : "Escolher esta versão"}
                    </button>
                    {track.audioUrl ? (
                      <a
                        href={track.audioUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        onClick={() => trackEvent("music_downloaded", window.location.pathname, {
                          placement: `result_${index + 1}`,
                        })}
                      >
                        Baixar áudio
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
          {selectedTrack ? (
            <section className="express-project-next" aria-label="Próximos passos da música escolhida">
              <div
                className="express-project-next-cover"
                style={selectedTrack.imageUrl
                  ? { backgroundImage: `url("${selectedTrack.imageUrl}")` }
                  : {}}
                aria-hidden="true"
              />
              <div className="express-project-next-copy">
                <small>MÚSICA ESCOLHIDA • PROJETO EM ANDAMENTO</small>
                <h3>Leve “{selectedTrack.title}” adiante.</h3>
                <p>Agora você pode criar a identidade visual, baixar o áudio ou pedir uma nova interpretação sem recomeçar a história.</p>
              </div>
              <div className="express-project-next-actions">
                <Link
                  className="primary"
                  href={`/biblioteca/capa?track=${encodeURIComponent(selectedTrack.id)}`}
                  onClick={() => trackEvent("music_next_step_selected", window.location.pathname, {
                    placement: "result_project",
                    next_step: "cover",
                  })}
                >
                  Criar capa
                </Link>
                {selectedTrack.audioUrl ? (
                  <a
                    href={selectedTrack.audioUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    onClick={() => trackEvent("music_downloaded", window.location.pathname, {
                      placement: "result_project",
                    })}
                  >
                    Baixar áudio
                  </a>
                ) : null}
                <button type="button" onClick={() => startRefinement({})}>
                  Nova interpretação
                </button>
              </div>
            </section>
          ) : null}
          <div className="express-refine">
            <div><small>NOVA DIREÇÃO • CONFIRMAÇÃO ANTES DO SALDO</small><h3>Quer tentar outra interpretação?</h3></div>
            <button type="button" onClick={() => startRefinement({ emotion: "Festa" })}>Mais animada</button>
            <button type="button" onClick={() => startRefinement({ voice: plan.voice === "Feminina e forte" ? "Masculina e próxima" : "Feminina e forte" })}>Outra voz</button>
            <button type="button" onClick={() => startRefinement({ hook: "um refrão mais forte, direto e fácil de lembrar" })}>Refrão mais forte</button>
            <button type="button" onClick={() => startRefinement({ style: "Pop brasileiro" })}>Mudar o estilo</button>
          </div>
          <div className="express-results-footer">
            <Link href="/biblioteca">Ver todo o repertório →</Link>
          </div>
        </section>
      ) : null}
    </AcademyShell>
  );
}
