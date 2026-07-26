"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AcademyShell } from "../components/Portal";
import { memberApi } from "../lib/access";
import {
  playInAcademyPlayer,
  playableTrackUrl,
  type PlatformGeneration,
} from "../lib/musicPlatform";

const tools = [
  ["LETRA", "Roteiro de composição", "Aprofunde uma história e descubra como construir uma letra mais humana.", "/biblioteca/compositor"],
  ["24 ESTILOS", "Mapa musical do Brasil", "Entenda ritmo, instrumentos e energia antes de pedir outra direção.", "/biblioteca/estilos-brasileiros"],
  ["MÉTODO", "Como escolher a melhor versão", "Compare emoção, refrão e arranjo para decidir com mais segurança.", "/academia/musica"],
];

function formatDate(value: string) {
  if (!value) return "Criação recente";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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

  return (
    <AcademyShell title="Minhas músicas" eyebrow="OUÇA • COMPARE • BAIXE">
      <section className="my-music-head">
        <div>
          <small>SUA BIBLIOTECA PESSOAL</small>
          <h2>Tudo o que você criou,<br /><em>guardado aqui.</em></h2>
          <p>Ouça as versões, compare com calma e baixe suas favoritas. Cada nova rodada aparece automaticamente nesta página.</p>
        </div>
        <div className="music-balance-card">
          <strong>{remainingSongs ?? "—"}</strong>
          <span>músicas disponíveis</span>
          <Link href="/biblioteca/gerador">Criar nova música →</Link>
        </div>
      </section>

      <section className="music-library" aria-live="polite" aria-busy={loading}>
        <header>
          <div>
            <small>SUAS CRIAÇÕES</small>
            <h2>{loading ? "Buscando suas músicas…" : `${trackCount} ${trackCount === 1 ? "música" : "músicas"}`}</h2>
          </div>
          {!loading && trackCount > 0 ? <span>Mais recentes primeiro</span> : null}
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
        ) : trackCount === 0 ? (
          <div className="music-library-state empty">
            <small>AINDA ESTÁ VAZIA</small>
            <h3>Sua primeira dupla vai aparecer aqui.</h3>
            <p>Converse com o Produtor IA, confirme a direção e crie duas versões para comparar.</p>
            <Link href="/biblioteca/gerador">Criar minhas primeiras músicas →</Link>
          </div>
        ) : (
          <div className="music-generation-list">
            {generations.map((generation, generationIndex) => (
              <article className="music-generation" key={generation.taskId}>
                <header>
                  <div>
                    <small>RODADA {String(generations.length - generationIndex).padStart(2, "0")}</small>
                    <h3>{formatDate(generation.createdAt)}</h3>
                  </div>
                  <span>{generation.tracks.length} versões</span>
                </header>
                <div className="saved-track-grid">
                  {generation.tracks.map((track, trackIndex) => {
                    const playableUrl = playableTrackUrl(track);
                    return (
                      <article className="saved-track" key={track.id || `${generation.taskId}_${trackIndex}`}>
                        <div
                          className="saved-track-cover"
                          style={track.imageUrl ? { backgroundImage: `url("${track.imageUrl}")` } : {}}
                        >
                          <span>VERSÃO {trackIndex + 1}</span>
                        </div>
                        <div className="saved-track-copy">
                          <h3>{track.title}</h3>
                          <p>
                            Versão {trackIndex + 1} da sua direção
                            {track.duration ? ` • ${Math.round(track.duration)} segundos` : ""}
                          </p>
                        </div>
                        {playableUrl ? (
                          <button
                            type="button"
                            className="saved-track-play"
                            onClick={() => playInAcademyPlayer(track, `Rodada ${generations.length - generationIndex}`)}
                          >
                            <span aria-hidden="true">▶</span> Ouvir no player
                          </button>
                        ) : <span className="track-processing">Finalizando áudio…</span>}
                        {track.audioUrl ? (
                          <a href={track.audioUrl} target="_blank" rel="noreferrer" download>
                            Baixar música
                          </a>
                        ) : null}
                        <Link className="saved-track-cover-action" href={`/biblioteca/capa?track=${encodeURIComponent(track.id)}`}>
                          {track.hasCustomCover ? "Trocar capa ↻" : "Criar capa ◇"}
                        </Link>
                      </article>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="library-learning">
        <header>
          <small>APRENDA COM O QUE VOCÊ OUVIU</small>
          <h2>Quer melhorar a próxima?</h2>
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
      </section>
    </AcademyShell>
  );
}
