"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { AcademyShell } from "../components/Portal";
import { memberApi } from "../lib/access";
import {
  flattenGenerations,
  playInAcademyPlayer,
  type PlatformGeneration,
  type PlatformTrack,
} from "../lib/musicPlatform";

const journey = [
  {
    href: "/academia/musica",
    number: "01",
    label: "DIREÇÃO",
    title: "Faça boas escolhas",
    text: "Aprenda a comparar versões, emoção, refrão e arranjo.",
  },
  {
    href: "/academia/identidade",
    number: "02",
    label: "IDENTIDADE",
    title: "Dê um rosto à música",
    text: "Transforme sua favorita em capa e presença visual.",
  },
  {
    href: "/academia/publicacao",
    number: "03",
    label: "LANÇAMENTO",
    title: "Prepare para o mundo",
    text: "Organize arquivos, dados, distribuição e o link final.",
  },
];

function TrackCard({ track, index }: { track: PlatformTrack; index: number }) {
  return (
    <button
      type="button"
      className="platform-track-card"
      onClick={() => playInAcademyPlayer(track, "Ouça novamente")}
    >
      <span
        className="platform-track-art"
        style={track.imageUrl ? { backgroundImage: `url("${track.imageUrl}")` } : {}}
      >
        <i aria-hidden="true">▶</i>
      </span>
      <strong>{track.title}</strong>
      <small>Versão {(index % 2) + 1} • sua criação</small>
    </button>
  );
}

export default function Academia() {
  const [tracks, setTracks] = useState<PlatformTrack[]>([]);
  const [remainingSongs, setRemainingSongs] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    memberApi("/v1/music/library")
      .then((data) => {
        if (!active) return;
        const generations = Array.isArray(data.generations)
          ? data.generations as PlatformGeneration[]
          : [];
        setTracks(flattenGenerations(generations).slice(0, 6));
        setRemainingSongs(Number(data.remainingSongs));
      })
      .catch(() => {
        // The home remains useful before the library is available.
      });
    return () => {
      active = false;
    };
  }, []);

  const featuredTrack = tracks[0];

  return (
    <AcademyShell title="Boa criação." eyebrow="SUA ACADEMIA">
      <section
        className="platform-feature"
        style={featuredTrack?.imageUrl
          ? { "--feature-cover": `url("${featuredTrack.imageUrl}")` } as CSSProperties
          : undefined}
      >
        <div className="platform-feature-copy">
          <small>SEU ESTÚDIO ESTÁ ABERTO</small>
          <h2>Uma história.<br />Duas versões.<br /><em>Sua música.</em></h2>
          <p>Converse naturalmente, entenda cada escolha e escute o resultado sem sair da plataforma.</p>
          <div>
            <Link href="/biblioteca/gerador" className="platform-primary-action">
              <span aria-hidden="true">＋</span> Criar nova música
            </Link>
            {featuredTrack ? (
              <button
                type="button"
                className="platform-secondary-action"
                onClick={() => playInAcademyPlayer(featuredTrack, "Sua criação mais recente")}
              >
                ▶ Ouvir a mais recente
              </button>
            ) : <Link href="/academia/comecar" className="platform-secondary-action">Como funciona</Link>}
          </div>
        </div>
        <aside>
          <span>{remainingSongs ?? "—"}</span>
          <small>MÚSICAS<br />DISPONÍVEIS</small>
        </aside>
      </section>

      <section className="platform-section">
        <header className="platform-section-head">
          <div><small>SEU SOM</small><h2>Ouça novamente</h2></div>
          <Link href="/biblioteca">Ver todas</Link>
        </header>
        {tracks.length ? (
          <div className="platform-track-grid">
            {tracks.slice(0, 4).map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} />
            ))}
          </div>
        ) : (
          <div className="platform-empty-shelf">
            <div><span>AMI</span></div>
            <div>
              <small>SEU REPERTÓRIO</small>
              <h3>As músicas que você criar aparecerão aqui.</h3>
              <p>Comece com uma história; o Produtor IA conduz o restante.</p>
            </div>
            <Link href="/biblioteca/gerador">Começar agora →</Link>
          </div>
        )}
      </section>

      <section className="platform-section">
        <header className="platform-section-head">
          <div><small>DA IDEIA AO LINK</small><h2>Continue sua jornada</h2></div>
          <Link href="/academia/comecar">Ver o método</Link>
        </header>
        <div className="platform-journey-grid">
          {journey.map((item) => (
            <Link href={item.href} key={item.number}>
              <span>{item.number}</span>
              <small>{item.label}</small>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <b>Continuar →</b>
            </Link>
          ))}
        </div>
      </section>
    </AcademyShell>
  );
}
