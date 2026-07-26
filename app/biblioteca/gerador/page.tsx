"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

const completedStatuses = new Set([
  "SUCCESS",
  "CREATE_TASK_FAILED",
  "GENERATE_AUDIO_FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

const taskStorageKey = "academia_music_task";

export default function Gerador() {
  const [styleSlug, setStyleSlug] = useState(musicStyles[0].slug);
  const [theme, setTheme] = useState("uma história de superação que começou quando ninguém acreditava");
  const [emotion, setEmotion] = useState("orgulho e esperança");
  const [voice, setVoice] = useState("voz masculina média, humana e próxima");
  const [hook, setHook] = useState("eu não parei quando ficou difícil");
  const [instrumental, setInstrumental] = useState(false);
  const [providerReady, setProviderReady] = useState<boolean | null>(null);
  const [remainingSongs, setRemainingSongs] = useState<number | null>(null);
  const [taskId, setTaskId] = useState("");
  const [generationStatus, setGenerationStatus] = useState("IDLE");
  const [tracks, setTracks] = useState<GeneratedTrack[]>([]);
  const [generationError, setGenerationError] = useState("");
  const style = musicStyles.find((item) => item.slug === styleSlug)!;

  const generationBrief = useMemo(() => {
    const brief = [
      `Canção brasileira original em ${style.name}.`,
      `Tema: ${theme}.`,
      `Emoção: ${emotion}.`,
      `Voz: ${voice}.`,
      `Refrão inspirado em “${hook}”.`,
      `Arranjo: ${style.instruments}; ${style.groove}; ${style.bpm} BPM.`,
      "Letra humana, imagens concretas e refrão memorável. Não imite artistas reais.",
    ].join(" ");
    if (brief.length <= 500) return brief;
    return `${brief.slice(0, 499).replace(/\s+\S*$/, "").trim()}.`;
  }, [style, theme, emotion, voice, hook]);

  useEffect(() => {
    let active = true;
    memberApi("/v1/music/availability")
      .then((data) => {
        if (!active) return;
        setProviderReady(Boolean(data.available));
        setRemainingSongs(Number(data.remainingSongs));
        const savedTask = window.localStorage.getItem(taskStorageKey);
        if (savedTask && /^[a-zA-Z0-9_-]{8,100}$/.test(savedTask)) {
          setTaskId(savedTask);
          setGenerationStatus("PENDING");
        }
      })
      .catch((error) => {
        if (active) {
          setProviderReady(false);
          setGenerationError(error instanceof Error ? error.message : "Não foi possível abrir o estúdio.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

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
        setGenerationError(data.error ?? "");
        if (typeof data.remainingSongs === "number") {
          setRemainingSongs(data.remainingSongs);
        }
        if (!completedStatuses.has(data.status)) {
          timer = window.setTimeout(check, 5000);
        }
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "Não foi possível acompanhar a criação.";
        setGenerationError(message);
        if (message.includes("não encontrada")) {
          window.localStorage.removeItem(taskStorageKey);
          setTaskId("");
          setGenerationStatus("IDLE");
        } else {
          timer = window.setTimeout(check, 8000);
        }
      }
    };
    timer = window.setTimeout(check, 3000);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [taskId, generationStatus]);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerationError("");
    setGenerationStatus("STARTING");
    setTracks([]);
    try {
      const data = await memberApi("/v1/music/generations", {
        method: "POST",
        body: JSON.stringify({ brief: generationBrief, instrumental }),
      });
      setTaskId(data.taskId);
      window.localStorage.setItem(taskStorageKey, data.taskId);
      setGenerationStatus(data.status);
      setRemainingSongs(Number(data.remainingSongs));
    } catch (error) {
      setGenerationStatus("IDLE");
      setGenerationError(error instanceof Error ? error.message : "Não foi possível iniciar a criação.");
    }
  }

  const isGenerating = generationStatus === "STARTING"
    || (!completedStatuses.has(generationStatus) && generationStatus !== "IDLE");
  const statusLabel = {
    STARTING: "Enviando sua ideia…",
    PENDING: "Criando letra, melodia e arranjo…",
    TEXT_SUCCESS: "A composição está pronta. Produzindo o áudio…",
    FIRST_SUCCESS: "Primeira versão pronta. Finalizando a segunda…",
    SUCCESS: "Suas músicas estão prontas.",
  }[generationStatus] ?? "Preparar criação";

  return (
    <AcademyShell title="Criar música" eyebrow="ESTÚDIO • MOTOR v5">
      <section className="studio-welcome">
        <div>
          <small>SEM TERMOS TÉCNICOS</small>
          <h2>Conte a ideia.<br />Receba a música.</h2>
          <p>Você tem 25 músicas incluídas para aprender criando. Escolha a história, a emoção e o estilo; o estúdio cuida da parte técnica e entrega duas versões por vez.</p>
        </div>
        <ol aria-label="Etapas da criação">
          <li className={!isGenerating && !tracks.length ? "active" : ""}><span>1</span><b>Conte</b></li>
          <li className={isGenerating ? "active" : ""}><span>2</span><b>Crie</b></li>
          <li className={tracks.length ? "active" : ""}><span>3</span><b>Ouça</b></li>
        </ol>
      </section>

      <form className="creation-studio" onSubmit={generate}>
        <section className="briefing-panel">
          <header><span>01</span><div><small>SUA IDEIA</small><h3>Como deve ser a música?</h3></div></header>

          <label>
            Escolha um estilo
            <select value={styleSlug} onChange={(event) => setStyleSlug(event.target.value)}>
              {musicStyles.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
            <small>{style.region} • {style.bpm} BPM • {style.mood}</small>
          </label>

          <label>
            Conte a história ou o assunto
            <textarea
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
              rows={4}
              placeholder="Ex.: comecei sozinho, ninguém acreditava e continuei até conseguir"
              required
            />
          </label>

          <div className="form-split">
            <label>
              Qual emoção deve ficar?
              <input value={emotion} onChange={(event) => setEmotion(event.target.value)} required />
            </label>
            <label>
              Como imagina a voz?
              <input value={voice} onChange={(event) => setVoice(event.target.value)} required />
            </label>
          </div>

          <label>
            Uma frase que precisa aparecer no refrão
            <input value={hook} onChange={(event) => setHook(event.target.value)} required />
          </label>

          <label className="instrumental-toggle">
            <input
              type="checkbox"
              checked={instrumental}
              onChange={(event) => setInstrumental(event.target.checked)}
            />
            <span><b>Quero somente instrumentos</b><small>Ative se não quiser voz nem letra.</small></span>
          </label>
        </section>

        <aside className="generation-panel">
          <div className="engine-badge"><i aria-hidden="true" /><span>MOTOR CRIATIVO</span><b>v5</b></div>
          <div className="creation-summary">
            <small>RESUMO DA SUA ESCOLHA</small>
            <p><span>Estilo</span><b>{style.name}</b></p>
            <p><span>Clima</span><b>{emotion}</b></p>
            <p><span>Formato</span><b>{instrumental ? "Instrumental" : "Com voz e letra"}</b></p>
          </div>
          <div className={`studio-status ${providerReady ? "ready" : ""}`} aria-live="polite">
            <i aria-hidden="true" />
            <div>
              <b>{providerReady === null ? "Abrindo o estúdio…" : remainingSongs === 0 ? "Suas 25 músicas foram utilizadas" : providerReady ? "Tudo pronto para criar" : "Estúdio indisponível"}</b>
              <small>{remainingSongs === null ? "Verificando seu saldo" : remainingSongs === 0 ? "Você concluiu o pacote incluído" : `${remainingSongs} músicas disponíveis`}</small>
            </div>
          </div>
          {generationError ? <p className="generation-error" role="alert">{generationError}</p> : null}
          <button
            className="generate-music-button"
            disabled={isGenerating || remainingSongs === null || remainingSongs <= 0 || providerReady !== true}
          >
            {isGenerating
              ? <><i aria-hidden="true" />{statusLabel}</>
              : remainingSongs === 0
                ? "25 músicas concluídas"
                : providerReady === null
                  ? "Preparando o estúdio…"
                  : providerReady
                    ? "Criar duas músicas agora →"
                    : "Tentar novamente mais tarde"}
          </button>
          <p className="generation-expectation">A criação costuma levar alguns minutos. Você pode deixar esta página aberta enquanto trabalhamos.</p>
          {taskId ? <small className="task-reference">Projeto {taskId.slice(0, 8)} • salvamento automático ativo</small> : null}
        </aside>
      </form>

      {tracks.length ? (
        <section className="creation-results" aria-live="polite">
          <header><div><small>03 • RESULTADO</small><h2>Suas duas versões</h2><p>Ouça com calma, compare e baixe a que mais combina com a sua ideia.</p></div><span>PRONTAS ✓</span></header>
          <div className="generated-tracks">
            {tracks.map((track, index) => {
              const playableUrl = track.audioUrl || track.streamAudioUrl;
              return (
                <article key={track.id || index}>
                  <div className="track-cover" style={track.imageUrl ? { backgroundImage: `url("${track.imageUrl}")` } : {}}>
                    <span>0{index + 1}</span>
                  </div>
                  <div className="track-info"><small>VERSÃO {index + 1}</small><h3>{track.title}</h3><p>Música criada{track.duration ? ` • ${Math.round(track.duration)}s` : ""}</p></div>
                  {playableUrl ? <audio controls preload="none" src={playableUrl} /> : <span className="audio-wait">Finalizando o áudio…</span>}
                  {track.audioUrl ? <a href={track.audioUrl} target="_blank" rel="noreferrer" download>Baixar esta versão ↓</a> : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="creation-tips">
        <article><span>01</span><div><h3>Seja concreto</h3><p>Uma cena real funciona melhor do que palavras genéricas.</p></div></article>
        <article><span>02</span><div><h3>Use uma frase sua</h3><p>O refrão ganha identidade quando parte do seu jeito de falar.</p></div></article>
        <article><span>03</span><div><h3>Baixe a favorita</h3><p>Salve o arquivo escolhido para seguir para capa e lançamento.</p></div></article>
      </section>
    </AcademyShell>
  );
}
