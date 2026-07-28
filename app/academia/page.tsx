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
    href: "/biblioteca/gerador",
    number: "01",
    label: "DIREÇÃO",
    title: "Você escolhe sem complicação",
    text: "Conte o essencial, escolha emoção, estilo e voz. A parte técnica fica por nossa conta.",
  },
  {
    href: "/biblioteca",
    number: "02",
    label: "COMPARAÇÃO",
    title: "Duas versões para decidir",
    text: "Você escuta no mesmo player e entende qual versão funciona melhor.",
  },
  {
    href: "/biblioteca/capa",
    number: "03",
    label: "IDENTIDADE",
    title: "Uma capa com a sua presença",
    text: "Sua foto ganha a linguagem visual certa para o gênero da música.",
  },
  {
    href: "/academia/publicacao",
    number: "04",
    label: "LANÇAMENTO",
    title: "Tudo pronto para publicar",
    text: "Organize capa, áudio e informações para levar sua música ao mundo.",
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
    <AcademyShell title="Início" eyebrow="SEU ESTÚDIO">
      <section className="spotify-greeting">
        <div>
          <small>musicacom.ia</small>
          <h2>Boa criação.</h2>
          <p>Continue de onde parou ou comece um novo lançamento.</p>
        </div>
        <span><b>{remainingSongs ?? "—"}</b> créditos disponíveis</span>
      </section>

      <section className="spotify-quick-grid" aria-label="Acessos rápidos">
        <Link href="/biblioteca/gerador">
          <i className="quick-create">＋</i>
          <b>Criar nova música</b>
          <span>▶</span>
        </Link>
        <Link href="/biblioteca">
          <i className="quick-library">♫</i>
          <b>Seu repertório</b>
          <span>▶</span>
        </Link>
        <Link href="/biblioteca/capa">
          <i className="quick-cover">▣</i>
          <b>Criar uma capa</b>
          <span>▶</span>
        </Link>
        <Link href="/academia/comecar">
          <i className="quick-method">01</i>
          <b>Abrir tutorial</b>
          <span>▶</span>
        </Link>
      </section>

      <section
        className="platform-feature"
        style={featuredTrack?.imageUrl
          ? { "--feature-cover": `url("${featuredTrack.imageUrl}")` } as CSSProperties
          : undefined}
      >
        <div className="platform-feature-copy">
          <small>SEU PRÓXIMO LANÇAMENTO</small>
          <h2>Conte uma história.<br />Saia com uma música.</h2>
          <p>Você escolhe o essencial. A plataforma libera uma música grátis por dia, organiza a capa e ajuda a preparar tudo para publicar.</p>
          <div>
            <Link href="/biblioteca/gerador" className="platform-primary-action">
              <span aria-hidden="true">▶</span> Começar agora
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
        <aside className="platform-feature-art">
          <span className="feature-vinyl"><i>AMI</i></span>
          <small>IDEIA → SOM → CAPA → LANÇAMENTO</small>
        </aside>
      </section>

      <section className="platform-section">
        <header className="platform-section-head">
          <div><small>SUA BIBLIOTECA</small><h2>Feito por você</h2></div>
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
            <p>Comece com uma ideia e faça escolhas simples. A plataforma cuida do restante.</p>
            </div>
            <Link href="/biblioteca/gerador">Começar agora →</Link>
          </div>
        )}
      </section>

      <section className="platform-section">
        <header className="platform-section-head">
          <div><small>O VALOR DO PROCESSO</small><h2>Você não recebe só um arquivo</h2></div>
          <Link href="/academia/comecar">Abrir tutorial</Link>
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
