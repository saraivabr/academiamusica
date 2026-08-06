"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import BrandLogo from "../components/BrandLogo";
import { trackEvent } from "../lib/analytics";
import "./preview.css";

const previewStorageKey = "musicacom-preview-v1";

const emotions = [
  ["Carinho", "Uma homenagem íntima e verdadeira"],
  ["Saudade", "Uma lembrança que merece continuar viva"],
  ["Alegria", "Uma celebração leve e luminosa"],
  ["Superação", "Uma história de força e recomeço"],
] as const;

const styles = [
  ["Sertanejo", "Romântico, próximo e fácil de cantar"],
  ["MPB", "Poético, brasileiro e cheio de detalhes"],
  ["Pagode", "Afetuoso, coletivo e com refrão marcante"],
  ["Gospel", "Esperançoso, crescente e emocionante"],
] as const;

type PreviewDraft = {
  story: string;
  title: string;
  hook: string;
  emotion: string;
  style: string;
};

function firstWords(value: string, limit = 7) {
  return value
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, limit)
    .join(" ");
}

function titleFor(story: string, emotion: string) {
  const normalized = story.toLocaleLowerCase("pt-BR");
  if (/\bm[aã]e\b/.test(normalized)) return "Canção para minha mãe";
  if (/\bpai\b/.test(normalized)) return "Tudo que aprendi com você";
  if (/\bcasamento\b|\bamor\b|\bcasal\b/.test(normalized)) return "A nossa história";
  if (/\banivers[aá]rio\b/.test(normalized)) return "O dia que merece canção";
  if (emotion === "Superação") return "Foi assim que eu recomecei";
  return "Uma história para guardar";
}

function buildPreview(story: string, emotion: string, style: string): PreviewDraft {
  const memory = firstWords(story, 9);
  return {
    story,
    emotion,
    style,
    title: titleFor(story, emotion),
    hook: memory
      ? `Essa história fica em mim: ${memory}.`
      : "Essa história fica em mim e agora vai virar canção.",
  };
}

export default function PreviewPage() {
  const [story, setStory] = useState("");
  const [emotion, setEmotion] = useState("Carinho");
  const [style, setStyle] = useState("Sertanejo");
  const [preview, setPreview] = useState<PreviewDraft | null>(null);
  const storyTracked = useRef(false);
  const remainingToMinimum = Math.max(0, 20 - story.trim().length);

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const incomingStory = params.get("idea")?.trim().slice(0, 500) ?? "";
      if (incomingStory) {
        setStory(incomingStory);
        storyTracked.current = true;
        trackEvent("story_started", window.location.pathname, {
          journey: "music_present_v1",
          placement: "home_hero",
        });
      }
      try {
        const stored = JSON.parse(window.sessionStorage.getItem(previewStorageKey) ?? "null");
        if (stored?.story && !incomingStory) {
          setStory(String(stored.story).slice(0, 500));
          setEmotion(String(stored.emotion || "Carinho"));
          setStyle(String(stored.style || "Sertanejo"));
          setPreview(stored);
        }
      } catch {
        window.sessionStorage.removeItem(previewStorageKey);
      }
    }, 0);
    return () => window.clearTimeout(hydration);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedStory = story.trim();
    if (normalizedStory.length < 20) return;
    const nextPreview = buildPreview(normalizedStory, emotion, style);
    window.sessionStorage.setItem(previewStorageKey, JSON.stringify(nextPreview));
    trackEvent("preview_completed", window.location.pathname, {
      journey: "music_present_v1",
      outcome: "creative_direction_ready",
      product: "starter_20",
    });
    setPreview(nextPreview);
  }

  return (
    <main className="preview-page">
      <nav className="preview-nav">
        <Link href="/" aria-label="musicacom.ia — início">
          <BrandLogo className="preview-logo" />
        </Link>
        <a href="/login?mode=login">Já tenho conta</a>
      </nav>

      <section className="preview-hero">
        <div className="preview-copy">
          <span>PRÉVIA CRIATIVA GRÁTIS</span>
          <h1>Sua história começa a ganhar música aqui.</h1>
          <p>
            Conte o que aconteceu, escolha o sentimento e veja a primeira
            direção criativa. O áudio completo só é gerado depois do pagamento.
          </p>
        </div>

        <form className="preview-form" onSubmit={submit}>
          <label>
            <span>01 — Conte a história</span>
            <textarea
              value={story}
              onChange={(event) => {
                const nextStory = event.target.value;
                setStory(nextStory);
                setPreview(null);
                if (!storyTracked.current && nextStory.trim().length >= 8) {
                  storyTracked.current = true;
                  trackEvent("story_started", window.location.pathname, {
                    journey: "music_present_v1",
                  });
                }
              }}
              minLength={20}
              maxLength={500}
              rows={5}
              required
              placeholder="Ex.: minha mãe criou três filhos sozinha e nunca deixou a casa perder a alegria..."
            />
            <small className={remainingToMinimum > 0 ? "preview-hint-short" : ""}>
              {remainingToMinimum > 0
                ? `Faltam ${remainingToMinimum} caracteres para liberar sua prévia`
                : `${story.length}/500`}
            </small>
          </label>

          <fieldset>
            <legend>02 — Qual sentimento deve ficar?</legend>
            <div className="preview-options">
              {emotions.map(([name, description]) => (
                <button
                  type="button"
                  aria-pressed={emotion === name}
                  className={emotion === name ? "selected" : ""}
                  key={name}
                  onClick={() => {
                    setEmotion(name);
                    setPreview(null);
                  }}
                >
                  <strong>{name}</strong>
                  <small>{description}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>03 — Que caminho musical combina?</legend>
            <div className="preview-options preview-styles">
              {styles.map(([name, description]) => (
                <button
                  type="button"
                  aria-pressed={style === name}
                  className={style === name ? "selected" : ""}
                  key={name}
                  onClick={() => {
                    setStyle(name);
                    setPreview(null);
                  }}
                >
                  <strong>{name}</strong>
                  <small>{description}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <button className="preview-submit" disabled={story.trim().length < 20}>
            Ver minha prévia criativa
          </button>
          <p className="preview-disclaimer">
            Sem cartão. Esta etapa não gera áudio nem consome créditos.
          </p>
        </form>
      </section>

      {preview ? (
        <section className="preview-result" aria-live="polite">
          <div className="preview-result-copy">
            <span>SUA DIREÇÃO ESTÁ PRONTA</span>
            <h2>{preview.title}</h2>
            <blockquote>“{preview.hook}”</blockquote>
            <dl>
              <div><dt>Sentimento</dt><dd>{preview.emotion}</dd></div>
              <div><dt>Estilo</dt><dd>{preview.style}</dd></div>
              <div><dt>História</dt><dd>{preview.story}</dd></div>
            </dl>
          </div>
          <aside>
            <span>PROJETO MÚSICA PRESENTE</span>
            <strong><small>R$</small> 49,97</strong>
            <p>Pagamento único via Pix.</p>
            <ul>
              <li>20 créditos musicais</li>
              <li>10 rodadas pagas</li>
              <li>Até 2 versões por rodada</li>
              <li>Biblioteca, download, capa e tutorial</li>
            </ul>
            <a
              href="/checkout/?offer=music_present_v1"
              data-track="checkout_cta"
              data-track-journey="music_present_v1"
              data-track-product="starter_20"
            >
              Gerar minhas versões completas
            </a>
            <small>Potencial de até 20 músicas. Falhas técnicas devolvem o saldo reservado.</small>
          </aside>
        </section>
      ) : null}
    </main>
  );
}
