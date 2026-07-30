"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AcademyShell } from "../../components/Portal";
import { trackEvent } from "../../lib/analytics";
import { playInAcademyPlayer } from "../../lib/musicPlatform";
import { musicStyles } from "../../lib/musicStyles";

type StyleJingle = {
  title: string;
  audioUrl: string;
  duration: number;
};

const styleJingles: Record<string, StyleJingle> = {
  modao: { title: "O Que a Memória Cantou", audioUrl: "/jingles/styles/02-modao.mp3", duration: 73.9 },
  piseiro: { title: "Pisa no Play", audioUrl: "/jingles/styles/03-piseiro.mp3", duration: 52.3 },
  "forro-pe-de-serra": { title: "Sanfona da Sua História", audioUrl: "/jingles/styles/04-forro-pe-de-serra.mp3", duration: 44 },
  baiao: { title: "Mapa de Som", audioUrl: "/jingles/styles/05-baiao.mp3", duration: 52.9 },
  arrocha: { title: "Saudade Virou Refrão", audioUrl: "/jingles/styles/06-arrocha.mp3", duration: 66.5 },
  "pagode-90": { title: "Roda da Memória", audioUrl: "/jingles/styles/07-pagode-90.mp3", duration: 55.8 },
  "pagode-atual": { title: "Manda a Ideia", audioUrl: "/jingles/styles/08-pagode-atual.mp3", duration: 53.8 },
  "samba-raiz": { title: "Puxa o Refrão", audioUrl: "/jingles/styles/09-samba-raiz.mp3", duration: 64.5 },
  "samba-rock": { title: "Clique com Balanço", audioUrl: "/jingles/styles/10-samba-rock.mp3", duration: 54.8 },
  mpb: { title: "A Palavra Vira Som", audioUrl: "/jingles/styles/11-mpb.mp3", duration: 62.2 },
  "bossa-nova": { title: "Ponto de Encontro", audioUrl: "/jingles/styles/12-bossa-nova.mp3", duration: 50.4 },
  "funk-carioca": { title: "Bateu, Virou Música", audioUrl: "/jingles/styles/13-funk-carioca.mp3", duration: 39.9 },
  "funk-melody": { title: "Nosso Som na Rede", audioUrl: "/jingles/styles/14-funk-melody.mp3", duration: 83 },
  "trap-brasileiro": { title: "Do Texto pro Topo", audioUrl: "/jingles/styles/15-trap-brasileiro.mp3", duration: 41.6 },
  "boom-bap-br": { title: "Sem Prompt, Com Verdade", audioUrl: "/jingles/styles/16-boom-bap-br.mp3", duration: 41 },
  "soul-brasileiro": { title: "Tem Som em Você", audioUrl: "/jingles/styles/17-soul-brasileiro.mp3", duration: 76.8 },
  axe: { title: "Vem Cantar, Brasil", audioUrl: "/jingles/styles/18-axe.mp3", duration: 50 },
  "samba-reggae": { title: "Tambor da História", audioUrl: "/jingles/styles/19-samba-reggae.mp3", duration: 63.3 },
  tecnobrega: { title: "Aparelhagem da Ideia", audioUrl: "/jingles/styles/20-tecnobrega.mp3", duration: 48.6 },
  carimbo: { title: "Gira, História", audioUrl: "/jingles/styles/21-carimbo.mp3", duration: 47.5 },
  frevo: { title: "Frevo do Play", audioUrl: "/jingles/styles/22-frevo.mp3", duration: 42.4 },
  "gospel-brasileiro": { title: "Quando a Esperança Canta", audioUrl: "/jingles/styles/24-gospel-brasileiro.mp3", duration: 95 },
  "pop-brasileiro": { title: "Seu Primeiro Play", audioUrl: "/jingles/styles/25-pop-brasileiro.mp3", duration: 49.7 },
};

const styleJingleCount = Object.keys(styleJingles).length;

function formatDuration(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function Estilos() {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("Todos");
  const [open, setOpen] = useState(musicStyles[0].slug);
  const [copied, setCopied] = useState("");
  const families = ["Todos", ...Array.from(new Set(musicStyles.map((style) => style.family)))];
  const filtered = useMemo(
    () => musicStyles.filter((style) => (
      (family === "Todos" || style.family === family)
      && `${style.name} ${style.region} ${style.family}`.toLowerCase().includes(query.toLowerCase())
    )),
    [query, family],
  );

  async function copy(slug: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(slug);
    window.setTimeout(() => setCopied(""), 1500);
  }

  function playJingle(styleName: string, slug: string, jingle: StyleJingle) {
    playInAcademyPlayer({
      id: `style-jingle-${slug}`,
      title: jingle.title,
      tags: styleName,
      duration: jingle.duration,
      audioUrl: jingle.audioUrl,
      streamAudioUrl: "",
      imageUrl: "/brand/musicacom-social-square.jpg",
      hasCustomCover: true,
    }, `${styleName} • jingle musicacom.ia`);
    trackEvent("style_jingle_played", window.location.pathname, {
      placement: `style_${slug}`,
    });
  }

  return (
    <AcademyShell title="Estilos brasileiros" eyebrow="MAPA MUSICAL • BRASIL">
      <section className="styles-head">
        <div>
          <h2>O Brasil não cabe em<br /><em>“Brazilian music”.</em></h2>
          <p>
            Escolha o gênero, ouça um jingle real e use uma direção que descreve
            groove, timbres, interpretação e produção.
          </p>
          <span className="styles-audio-count">
            <i aria-hidden="true" />
            {styleJingleCount} jingles musicacom.ia disponíveis para ouvir
          </span>
        </div>
        <strong>{musicStyles.length}<span>MAPAS DE ESTILO</span></strong>
      </section>

      <div className="style-tools">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar estilo ou região…"
          aria-label="Buscar estilo ou região"
        />
        <select
          value={family}
          onChange={(event) => setFamily(event.target.value)}
          aria-label="Filtrar por família musical"
        >
          {families.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <section className="style-catalog">
        {filtered.map((style, index) => {
          const jingle = styleJingles[style.slug];
          const isOpen = open === style.slug;
          return (
            <article key={style.slug} className={isOpen ? "open" : ""}>
              <button
                className="style-summary"
                onClick={() => setOpen(isOpen ? "" : style.slug)}
                aria-expanded={isOpen}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <small>
                    {style.family} • {style.region}
                    {jingle ? <b className="style-has-audio"> • JINGLE REAL</b> : null}
                  </small>
                  <h3>{style.name}</h3>
                </div>
                <em>{style.bpm} BPM</em>
                <b>{isOpen ? "−" : "+"}</b>
              </button>

              {isOpen ? (
                <div className="style-detail">
                  {jingle ? (
                    <button
                      type="button"
                      className="style-jingle-card"
                      onClick={() => playJingle(style.name, style.slug, jingle)}
                      aria-label={`Ouvir ${jingle.title}, exemplo de ${style.name}`}
                    >
                      <span className="style-jingle-play" aria-hidden="true">
                        <Play fill="currentColor" />
                      </span>
                      <span className="style-jingle-copy">
                        <small>JINGLE REAL • musicacom.ia</small>
                        <strong>{jingle.title}</strong>
                        <em>{style.name} • {formatDuration(jingle.duration)}</em>
                      </span>
                      <b>OUVIR AGORA</b>
                    </button>
                  ) : null}

                  <div className="style-data">
                    <p><small>CLIMA</small>{style.mood}</p>
                    <p><small>INSTRUMENTOS</small>{style.instruments}</p>
                    <p><small>GROOVE</small>{style.groove}</p>
                    <p><small>VOCAL</small>{style.vocal}</p>
                  </div>

                  <div className="style-prompt">
                    <header>
                      <span>DIREÇÃO MUSICAL</span>
                      <Link
                        href={`/biblioteca/gerador?style=${encodeURIComponent(style.name)}&source=styles`}
                        data-track="expert_direction_applied"
                        data-track-placement="styles"
                      >
                        Usar no criador →
                      </Link>
                    </header>
                    <p>{style.mood}. {style.instruments}. {style.groove}. Voz {style.vocal}.</p>
                    <details>
                      <summary>Ver direção técnica</summary>
                      <p>{style.prompt}</p>
                      <small>O QUE EVITAR</small>
                      <p>{style.exclude}</p>
                      <button type="button" onClick={() => copy(style.slug, style.prompt)}>
                        {copied === style.slug ? "COPIADO ✓" : "COPIAR TEXTO TÉCNICO"}
                      </button>
                    </details>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </AcademyShell>
  );
}
