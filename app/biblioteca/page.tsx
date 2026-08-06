"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  Download,
  ImagePlus,
  Play,
  Plus,
  Sparkles,
} from "lucide-react";
import { AcademyShell } from "../components/Portal";
import { memberApi } from "../lib/access";
import { trackEvent } from "../lib/analytics";
import {
  playInAcademyPlayer,
  playableTrackUrl,
  type PlatformGeneration,
} from "../lib/musicPlatform";

const tools = [
  ["LETRA", "Roteiro de composição", "Aprofunde uma história e descubra como construir uma letra mais humana.", "/biblioteca/compositor"],
  ["25 ESTILOS", "Mapa musical do Brasil", "Entenda ritmo, instrumentos e energia antes de pedir outra direção.", "/biblioteca/estilos-brasileiros"],
];

function formatDate(value: string) {
  if (!value) return "Criação recente";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDuration(value: number | null) {
  if (!value) return "—";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function Biblioteca() {
  const [generations, setGenerations] = useState<PlatformGeneration[]>([]);
  const [remainingSongs, setRemainingSongs] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    memberApi("/v1/music/library")
      .then((data) => {
        if (!active) return;
        setGenerations(Array.isArray(data.generations) ? data.generations : []);
        setRemainingSongs(Number(data.remainingSongs));
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError instanceof Error
          ? requestError.message
          : "Não foi possível abrir suas músicas.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const trackCount = generations.reduce((total, generation) => total + generation.tracks.length, 0);
  const rows = generations.flatMap((generation, generationIndex) => (
    generation.tracks.map((track, trackIndex) => ({
      generation,
      generationIndex,
      track,
      trackIndex,
    }))
  ));
  const featuredTrack = rows[0]?.track;

  if (!loading && !error && trackCount === 0) {
    return (
      <AcademyShell title="Suas músicas" eyebrow="SUA BIBLIOTECA">
        <section className="library-first-step">
          <small>SUA PRIMEIRA MÚSICA</small>
          <h2>Seu repertório começa com uma ideia.</h2>
          <p>
            Conte o essencial, escolha a direção e use seus créditos para gerar
            as versões completas. Sua música aparecerá aqui automaticamente.
          </p>
          <Link
            href="/biblioteca/gerador"
            data-track="creator_primary_action"
            data-track-placement="empty_library"
          >
            <Sparkles aria-hidden="true" />
            Criar minha primeira música
          </Link>
        </section>
      </AcademyShell>
    );
  }

  return (
    <AcademyShell title="Suas músicas" eyebrow="SUA BIBLIOTECA">
      <section
        className="spotify-library-hero"
        style={featuredTrack?.imageUrl
          ? { "--library-cover": `url("${featuredTrack.imageUrl}")` } as CSSProperties
        : undefined}
      >
        <div className="spotify-library-cover">
          {featuredTrack?.imageUrl ? null : (
            <img src="/brand/musicacom-symbol.png" alt="" width="358" height="188" />
          )}
        </div>
        <div>
          <small>REPERTÓRIO</small>
          <h2>Suas músicas</h2>
          <p>Do primeiro rascunho ao áudio final: tudo o que você criou fica organizado aqui.</p>
          <strong>musicacom.ia • {trackCount} músicas • {generations.length} rodadas</strong>
        </div>
      </section>

      <section className="music-library" aria-live="polite" aria-busy={loading}>
        <div className="spotify-library-actions">
          <button
            type="button"
            aria-label="Tocar música mais recente"
            disabled={!featuredTrack || !playableTrackUrl(featuredTrack)}
            onClick={() => {
              if (featuredTrack) playInAcademyPlayer(featuredTrack, "Seu repertório");
            }}
          >
            <Play fill="currentColor" aria-hidden="true" />
          </button>
          <Link href="/biblioteca/gerador"><Plus aria-hidden="true" /> Nova música</Link>
          <span>{`${remainingSongs ?? "—"} créditos disponíveis`}</span>
        </div>

        <header className="spotify-track-header">
          <span>#</span>
          <span>TÍTULO</span>
          <span>PROCESSO</span>
          <span>DURAÇÃO</span>
          <span>AÇÕES</span>
        </header>

        {error ? (
          <div className="music-library-state error" role="alert">
            <h3>Não consegui carregar agora.</h3>
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>Tentar novamente</button>
          </div>
        ) : loading ? (
          <div className="music-library-state">
            <p>Abrindo sua estante e atualizando os áudios…</p>
          </div>
        ) : (
          <div className="spotify-track-list">
            {rows.map(({ generation, generationIndex, track, trackIndex }, index) => {
              const playableUrl = playableTrackUrl(track);
              return (
                <article className="spotify-track-row" key={track.id || `${generation.taskId}_${trackIndex}`}>
                  <button
                    type="button"
                    className="spotify-row-play"
                    disabled={!playableUrl}
                    aria-label={`Ouvir ${track.title}`}
                    onClick={() => playInAcademyPlayer(track, `Rodada ${generations.length - generationIndex}`)}
                  >
                    <span>{index + 1}</span><b aria-hidden="true"><Play fill="currentColor" /></b>
                  </button>
                  <div className="spotify-row-title">
                    <i style={track.imageUrl ? { backgroundImage: `url("${track.imageUrl}")` } : {}} />
                    <span>
                      <b>{track.title}</b>
                      <small>Versão {trackIndex + 1} • sua criação</small>
                    </span>
                  </div>
                  <span className="spotify-row-round">
                    Rodada {String(generations.length - generationIndex).padStart(2, "0")}
                    <small>{formatDate(generation.createdAt)}</small>
                  </span>
                  <span className="spotify-row-duration">{formatDuration(track.duration)}</span>
                  <div className="spotify-row-actions">
                    <Link href={`/biblioteca/capa?track=${encodeURIComponent(track.id)}`}>
                      <ImagePlus aria-hidden="true" />
                      {track.hasCustomCover ? "Trocar capa" : "Criar capa"}
                    </Link>
                    {track.audioUrl ? (
                      <a
                        href={track.audioUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        onClick={() => trackEvent("music_downloaded", window.location.pathname, {
                          placement: "library",
                        })}
                      >
                        <Download aria-hidden="true" />
                        Baixar
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {trackCount > 0 ? <section className="library-learning">
        <header>
          <small>CONTINUE O PROCESSO</small>
          <h2>Leve sua música além do play</h2>
        </header>
        <div className="resource-grid live">
          {tools.map(([tag, title, text, href], index) => (
            <Link href={href} key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <small>{tag}</small>
              <h2>{title}</h2>
              <p>{text}</p>
              <b>Abrir →</b>
            </Link>
          ))}
        </div>
      </section> : null}
    </AcademyShell>
  );
}
