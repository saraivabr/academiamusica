"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  CirclePlay,
  Disc3,
  Image as ImageIcon,
  Play,
  Sparkles,
} from "lucide-react";
import { AcademyShell } from "../components/Portal";
import { memberApi } from "../lib/access";
import {
  flattenGenerations,
  playInAcademyPlayer,
  type PlatformGeneration,
  type PlatformTrack,
} from "../lib/musicPlatform";
import { gsap, useGSAP } from "../lib/gsap";

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
        <i aria-hidden="true"><Play fill="currentColor" /></i>
      </span>
      <strong>{track.title}</strong>
      <small>Versão {(index % 2) + 1} • sua criação</small>
    </button>
  );
}

export default function Academia() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [tracks, setTracks] = useState<PlatformTrack[]>([]);
  const [remainingSongs, setRemainingSongs] = useState<number | null>(null);
  const [libraryLoaded, setLibraryLoaded] = useState(false);

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
      })
      .finally(() => {
        if (active) setLibraryLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const featuredTrack = tracks[0];
  const hasMusic = Boolean(featuredTrack);

  useGSAP(() => {
    const page = pageRef.current;
    if (!libraryLoaded || !page) return;

    const media = gsap.matchMedia();
    media.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce)",
        compact: "(max-width: 840px)",
      },
      (context) => {
        const { compact, reduceMotion } = context.conditions as {
          compact: boolean;
          reduceMotion: boolean;
        };
        if (reduceMotion) return;

        const greetingCopy = page.querySelectorAll(".spotify-greeting > div > *");
        const greetingBalance = page.querySelector(".spotify-greeting > span");
        const quickLinks = page.querySelectorAll(".spotify-quick-grid > a");
        const featureCopy = page.querySelectorAll(".platform-feature-copy > *");
        const featureArt = page.querySelector(".platform-feature-art");
        const sectionHeads = page.querySelectorAll(".platform-section-head");
        const collectionItems = page.querySelectorAll(
          ".platform-track-card, .platform-empty-shelf, .platform-journey-grid > a",
        );
        const timeline = gsap.timeline({
          defaults: {
            duration: compact ? 0.42 : 0.52,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
          },
        });

        timeline.from(greetingCopy, {
          y: compact ? 12 : 18,
          autoAlpha: 0,
          stagger: 0.055,
        });
        if (greetingBalance) {
          timeline.from(greetingBalance, {
            x: compact ? 0 : 14,
            y: compact ? 8 : 0,
            autoAlpha: 0,
          }, "<0.08");
        }
        if (quickLinks.length) {
          timeline.from(quickLinks, {
            y: 14,
            scale: 0.985,
            autoAlpha: 0,
            stagger: 0.07,
          }, "<0.08");
        }
        timeline.from(featureCopy, {
          y: 16,
          autoAlpha: 0,
          stagger: 0.045,
        }, "<0.08");
        if (featureArt) {
          timeline.from(featureArt, {
            x: compact ? 0 : 22,
            y: compact ? 14 : 0,
            scale: 0.96,
            autoAlpha: 0,
          }, "<0.12");
        }
        timeline.from(sectionHeads, {
          y: 12,
          autoAlpha: 0,
        }, "<0.08");
        if (collectionItems.length) {
          timeline.from(collectionItems, {
            y: 15,
            scale: 0.985,
            autoAlpha: 0,
            stagger: 0.055,
          }, "<0.06");
        }
      },
    );

    return () => media.revert();
  }, {
    dependencies: [libraryLoaded],
    revertOnUpdate: true,
    scope: pageRef,
  });

  return (
    <AcademyShell title="Início" eyebrow="SEU ESTÚDIO">
      <div ref={pageRef} className="academy-motion-page">
        <section className="spotify-greeting">
        <div>
          <small>musicacom.ia</small>
          <h2>{hasMusic ? "Sua música está aqui." : "Vamos criar a primeira?"}</h2>
          <p>{hasMusic
            ? "Ouça sua criação e escolha o próximo passo."
            : "Conte uma ideia. A parte técnica fica com a plataforma."}</p>
        </div>
        <span><b>{remainingSongs ?? "—"}</b> créditos disponíveis</span>
      </section>

      {hasMusic ? (
        <section className="spotify-quick-grid" aria-label="Próximos passos">
          <Link href="/biblioteca">
            <i className="quick-library" aria-hidden="true"><Disc3 /></i>
            <b>Ouvir e escolher</b>
            <span aria-hidden="true"><Play fill="currentColor" /></span>
          </Link>
          <Link href={`/biblioteca/capa?track=${encodeURIComponent(featuredTrack.id)}`}>
            <i className="quick-cover" aria-hidden="true"><ImageIcon /></i>
            <b>Criar a capa</b>
            <span aria-hidden="true"><ArrowRight /></span>
          </Link>
        </section>
      ) : null}

      <section
        className="platform-feature"
        style={featuredTrack?.imageUrl
          ? { "--feature-cover": `url("${featuredTrack.imageUrl}")` } as CSSProperties
          : undefined}
      >
        <div className="platform-feature-copy">
          <small>{hasMusic ? "CONTINUE DE ONDE PAROU" : "SUA PRIMEIRA MÚSICA"}</small>
          <h2>{hasMusic
            ? <>Ouça. Escolha.<br />Siga para a capa.</>
            : <>Conte uma história.<br />Saia com uma música.</>}</h2>
          <p>{hasMusic
            ? "Sua criação está salva. Escute antes de decidir se quer criar a capa ou tentar uma nova direção."
            : "Você escolhe o essencial. Cada rodada paga usa 2 créditos e pode entregar até 2 versões."}</p>
          <div>
            {featuredTrack ? (
              <button
                type="button"
                className="platform-primary-action"
                onClick={() => playInAcademyPlayer(featuredTrack, "Sua criação mais recente")}
              >
                <CirclePlay aria-hidden="true" /> Ouvir e escolher
              </button>
            ) : (
              <Link
                href="/biblioteca/gerador"
                className="platform-primary-action"
                data-track="creator_primary_action"
                data-track-placement="member_home_empty"
              >
                <Sparkles aria-hidden="true" /> Criar minha primeira música
              </Link>
            )}
            {featuredTrack
              ? <Link href="/biblioteca/gerador" className="platform-secondary-action">Criar outra música</Link>
              : <Link href="/academia/comecar" className="platform-secondary-action">Como funciona</Link>}
          </div>
        </div>
        <aside className="platform-feature-art">
          <span className="feature-vinyl"><i><img src="/brand/musicacom-symbol.png" alt="" width="358" height="188" /></i></span>
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
            <div><img src="/brand/musicacom-symbol.png" alt="" width="358" height="188" /></div>
            <div>
              <small>SEU REPERTÓRIO</small>
              <h3>As músicas que você criar aparecerão aqui.</h3>
            <p>Comece com uma ideia e faça escolhas simples. A plataforma cuida do restante.</p>
            </div>
          </div>
        )}
      </section>

        {libraryLoaded && hasMusic ? <section className="platform-section">
        <header className="platform-section-head">
          <div><small>PRÓXIMOS PASSOS</small><h2>Continue no seu ritmo</h2></div>
        </header>
        <div className="platform-journey-grid">
          {journey.map((item) => (
            <Link href={item.href} key={item.number}>
              <span>{item.number}</span>
              <small>{item.label}</small>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <b>Continuar <ArrowRight aria-hidden="true" /></b>
            </Link>
          ))}
        </div>
        </section> : null}
      </div>
    </AcademyShell>
  );
}
