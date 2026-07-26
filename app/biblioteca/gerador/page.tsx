"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AcademyShell } from "../../components/Portal";
import { memberApi } from "../../lib/access";
import { trackEvent } from "../../lib/analytics";
import { musicStyles } from "../../lib/musicStyles";
import { playInAcademyPlayer } from "../../lib/musicPlatform";

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

type SavedStudio = {
  plan: MusicPlan;
  creationType: string;
  taskId: string;
  generationStatus: string;
  tracks: GeneratedTrack[];
  mode: "create" | "refine";
};

const creationTypes = [
  { id: "historia", icon: "✦", label: "Minha história", detail: "Um momento que merece virar música", placeholder: "Conte o momento mais importante dessa história…" },
  { id: "homenagem", icon: "♡", label: "Homenagem", detail: "Para alguém que marcou sua vida", placeholder: "Para quem é a homenagem e o que essa pessoa representa?" },
  { id: "romance", icon: "∞", label: "Romance", detail: "Amor, saudade ou reencontro", placeholder: "O que aconteceu nessa história de amor?" },
  { id: "superacao", icon: "↑", label: "Superação", detail: "O desafio e a sua virada", placeholder: "Que desafio você venceu — ou ainda está vencendo?" },
  { id: "jingle", icon: "◉", label: "Jingle", detail: "Uma ideia que precisa ser lembrada", placeholder: "Qual negócio, produto ou mensagem a música deve apresentar?" },
  { id: "instrumental", icon: "♫", label: "Instrumental", detail: "Um clima sem voz nem letra", placeholder: "Que cena ou sensação esse instrumental deve criar?" },
] as const;

const emotions = [
  ["Alegria", "Solar e celebrativa"],
  ["Saudade", "Íntima e nostálgica"],
  ["Esperança", "Emocional e crescente"],
  ["Paixão", "Intensa e envolvente"],
  ["Superação", "Forte e inspiradora"],
  ["Festa", "Dançante e contagiante"],
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
  const [dailyFreeAvailable, setDailyFreeAvailable] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [generationStatus, setGenerationStatus] = useState("IDLE");
  const [tracks, setTracks] = useState<GeneratedTrack[]>([]);
  const [mode, setMode] = useState<"create" | "refine">("create");
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [showAllStyles, setShowAllStyles] = useState(false);
  const generationLockRef = useRef(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const selectedType = creationTypes.find((item) => item.id === creationType) ?? creationTypes[0];
  const isGenerating = generationStatus === "STARTING"
    || (!completedStatuses.has(generationStatus) && generationStatus !== "IDLE");
  const generationFailed = failedStatuses.has(generationStatus);
  const ready = planIsReady(plan);
  const creationCost = dailyFreeAvailable ? 0 : remainingSongs === 1 ? 1 : 2;
  const canCreate = dailyFreeAvailable || Boolean(remainingSongs);
  const styleOptions = useMemo(() => (
    showAllStyles
      ? musicStyles
      : musicStyles.filter((style) => popularStyleSlugs.includes(style.slug))
  ), [showAllStyles]);

  useEffect(() => {
    trackEvent("music_creator_opened");
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const data = JSON.parse(saved) as SavedStudio;
          if (data.plan) setPlan(data.plan);
          if (data.creationType) setCreationType(data.creationType);
          if (data.taskId) setTaskId(data.taskId);
          if (data.generationStatus) setGenerationStatus(data.generationStatus);
          if (Array.isArray(data.tracks)) setTracks(data.tracks);
          if (data.mode) setMode(data.mode);
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
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
        setDailyFreeAvailable(Boolean(data.dailyFreeAvailable));
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
    };
    window.localStorage.setItem(storageKey, JSON.stringify(saved));
  }, [creationType, generationStatus, hydrated, mode, plan, taskId, tracks]);

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
        if (typeof data.dailyFreeAvailable === "boolean") {
          setDailyFreeAvailable(data.dailyFreeAvailable);
        }
        if (data.status === "SUCCESS") {
          generationLockRef.current = false;
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
    try {
      const data = await memberApi("/v1/music/generations", {
        method: "POST",
        body: JSON.stringify({
          brief: createBrief(selectedPlan),
          instrumental: selectedPlan.instrumental,
          conversationId: makeId("express"),
          mode: selectedMode,
          reservationType: dailyFreeAvailable ? "FREE_DAILY" : "CREDITS",
        }),
      });
      setTaskId(data.taskId);
      setGenerationStatus(data.status);
      setRemainingSongs(Number(data.remainingSongs));
      if (data.dailyFreeUsed) setDailyFreeAvailable(false);
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
    setTracks([]);
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
    setMode("create");
    setError("");
    generationLockRef.current = false;
    window.localStorage.removeItem(storageKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const status = statusCopy[generationStatus];

  return (
    <AcademyShell title="Criar" eyebrow="CRIADOR EXPRESS" className="express-academy">
      <section className="express-hero">
        <div>
          <small>SEM PROMPT • SEM INTERROGATÓRIO</small>
          <h2>Uma ideia. Algumas escolhas.<br />Sua música.</h2>
          <p>Conte o essencial e escolha o clima. Você tem uma música grátis por dia.</p>
        </div>
        <ol aria-label="Etapas da criação">
          <li className={!isGenerating && !tracks.length ? "active" : "done"}><span>1</span><b>Escolha</b></li>
          <li className={isGenerating ? "active" : tracks.length ? "done" : ""}><span>2</span><b>Crie</b></li>
          <li className={tracks.length ? "active" : ""}><span>3</span><b>Ouça</b></li>
        </ol>
      </section>

      <section className="express-layout">
        <div className="express-builder">
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
                  onClick={() => selectCreationType(type.id)}
                >
                  <i>{type.icon}</i>
                  <span><b>{type.label}</b><small>{type.detail}</small></span>
                  <em>{creationType === type.id ? "✓" : "＋"}</em>
                </button>
              ))}
            </div>
          </section>

          <section className="express-block">
            <header>
              <span>02</span>
              <div><small>CONTE SÓ O ESSENCIAL</small><h3>Qual é a sua ideia?</h3></div>
            </header>
            <label className="express-story">
              <textarea
                rows={4}
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
          </section>

          <section className="express-block">
            <header>
              <span>03</span>
              <div><small>DEFINA A SENSAÇÃO</small><h3>Como essa música deve fazer alguém se sentir?</h3></div>
            </header>
            <div className="express-choice-grid emotion-grid">
              {emotions.map(([emotion, detail]) => (
                <button
                  type="button"
                  key={emotion}
                  className={plan.emotion === emotion ? "selected" : ""}
                  onClick={() => updatePlan({ emotion })}
                >
                  <b>{emotion}</b><small>{detail}</small>
                </button>
              ))}
            </div>
          </section>

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
                  onClick={() => updatePlan({ style: style.name })}
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
          </section>

          {!plan.instrumental ? (
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
                    onClick={() => updatePlan({ voice })}
                  >
                    <b>{voice}</b><small>{detail}</small>
                  </button>
                ))}
              </div>
              <details className="express-advanced">
                <summary>Quero definir uma frase para o refrão</summary>
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
        </div>

        <aside className="express-summary">
          <header>
            <small>SEU PEDIDO</small>
            <h2>{ready ? "Pronto para criar" : "Complete sua ideia"}</h2>
          </header>
          <dl>
            <div><dt>Tipo</dt><dd>{selectedType.label}</dd></div>
            <div><dt>Emoção</dt><dd>{plan.emotion}</dd></div>
            <div><dt>Estilo</dt><dd>{plan.style}</dd></div>
            <div><dt>Voz</dt><dd>{plan.instrumental ? "Instrumental" : plan.voice}</dd></div>
            <div><dt>Refrão</dt><dd>{plan.instrumental ? "Sem letra" : plan.hook.trim() || "Criado para você"}</dd></div>
          </dl>

          <div className={`express-balance ${!dailyFreeAvailable && remainingSongs === 0 ? "empty" : ""}`}>
            <span>♫</span>
            <div>
              <b>{dailyFreeAvailable
                ? "Sua música grátis de hoje está disponível"
                : remainingSongs === null
                  ? "Consultando saldo"
                  : remainingSongs === 0
                    ? "Sua música grátis volta amanhã"
                    : `${remainingSongs} créditos disponíveis`}</b>
              <small>{dailyFreeAvailable
                ? "A primeira criação do dia não usa créditos."
                : remainingSongs === 0
                  ? "Se quiser criar mais hoje, adicione créditos."
                  : "Rodadas extras entregam duas versões."}</small>
            </div>
          </div>

          {status ? (
            <div className="express-generating" aria-live="polite">
              <span className="express-loader" />
              <div><b>{status.title}</b><small>{status.detail}</small></div>
            </div>
          ) : null}

          {error ? (
            <div className="express-error" role="alert">
              <b>{generationFailed ? "Sua direção continua salva." : "Não foi possível concluir."}</b>
              <p>{error}</p>
            </div>
          ) : null}

          <button
            type="button"
            className="express-create"
            disabled={!ready || isGenerating || providerReady !== true || !canCreate}
            onClick={() => void generateMusic()}
          >
            {isGenerating
              ? "Criando suas músicas…"
              : !canCreate
                ? "Volte amanhã ou adicione créditos"
                : dailyFreeAvailable
                  ? "Criar minha música grátis"
                  : "Criar duas músicas"}
            {!isGenerating && canCreate ? (
              <span>{creationCost === 0 ? "GRÁTIS HOJE" : `${creationCost} ${creationCost === 1 ? "crédito" : "créditos"}`}</span>
            ) : null}
          </button>
          <p className="express-cost">
            Você confirma antes de usar o saldo. Falhas de criação devolvem os créditos.
          </p>
          <button type="button" className="express-new" onClick={startNewMusic} disabled={isGenerating}>
            Limpar e começar outra
          </button>
        </aside>
      </section>

      {tracks.length ? (
        <section ref={resultRef} className="express-results">
          <header>
            <div><small>{tracks.length === 1 ? "SUA MÚSICA DE HOJE" : "DUAS VERSÕES • UMA ESCOLHA"}</small><h2>{tracks.length === 1 ? "Sua ideia ganhou som." : "Qual delas conta melhor a sua história?"}</h2></div>
            <Link href="/biblioteca">Abrir sua biblioteca →</Link>
          </header>
          <div className="express-track-grid">
            {tracks.map((track, index) => {
              const playableUrl = track.audioUrl || track.streamAudioUrl;
              return (
                <article key={track.id || index}>
                  <div
                    className="express-track-cover"
                    style={track.imageUrl ? { backgroundImage: `url("${track.imageUrl}")` } : {}}
                  >
                    <span>VERSÃO {index + 1}</span>
                    {playableUrl ? (
                      <button
                        type="button"
                        aria-label={`Ouvir ${track.title}`}
                        onClick={() => playInAcademyPlayer(track, `Versão ${index + 1}`)}
                      >▶</button>
                    ) : null}
                  </div>
                  <div className="express-track-copy">
                    <small>{track.tags || plan.style}</small>
                    <h3>{track.title}</h3>
                    <p>{track.duration ? `${Math.round(track.duration)} segundos` : "Finalizando áudio…"}</p>
                  </div>
                  <div className="express-track-actions">
                    {playableUrl ? (
                      <button type="button" onClick={() => playInAcademyPlayer(track, `Versão ${index + 1}`)}>
                        Ouvir
                      </button>
                    ) : null}
                    <Link href={`/biblioteca/capa?track=${encodeURIComponent(track.id)}`}>Criar capa</Link>
                    {track.audioUrl ? <a href={track.audioUrl} target="_blank" rel="noreferrer" download>Baixar</a> : null}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="express-refine">
            <div><small>NOVA RODADA • 2 CRÉDITOS</small><h3>Quer tentar outra direção?</h3></div>
            <button type="button" onClick={() => startRefinement({ emotion: "Festa" })}>Mais animada</button>
            <button type="button" onClick={() => startRefinement({ voice: plan.voice === "Feminina e forte" ? "Masculina e próxima" : "Feminina e forte" })}>Outra voz</button>
            <button type="button" onClick={() => startRefinement({ hook: "um refrão mais forte, direto e fácil de lembrar" })}>Refrão mais forte</button>
            <button type="button" onClick={() => startRefinement({ style: "Pop brasileiro" })}>Mudar o estilo</button>
          </div>
        </section>
      ) : null}
    </AcademyShell>
  );
}
