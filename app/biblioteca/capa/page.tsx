"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { AcademyShell } from "../../components/Portal";
import { memberApi } from "../../lib/access";
import {
  coverFamilies,
  coverFamilyById,
  inferCoverFamily,
  type CoverDirection,
  type CoverFamily,
} from "../../lib/coverDirections";
import {
  flattenGenerations,
  type PlatformGeneration,
  type PlatformTrack,
} from "../../lib/musicPlatform";

type PreparedCover = {
  artwork: string;
  artworkType?: string;
  jobId: string;
};

type CoverPreparation = {
  jobId: string;
  stage: "processing" | "ready";
};

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível preparar a imagem."));
    image.src = source;
  });
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  size: number,
) {
  const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
}

function wrapTitle(
  context: CanvasRenderingContext2D,
  title: string,
  maxWidth: number,
) {
  const words = title.trim().toLocaleUpperCase("pt-BR").split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

async function composeCover({
  prepared,
  title,
  artist,
  familyId,
  direction,
}: {
  prepared: PreparedCover;
  title: string;
  artist: string;
  familyId: CoverFamily;
  direction: CoverDirection;
}) {
  const size = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Seu navegador não conseguiu montar a capa.");

  const family = coverFamilyById(familyId);
  const artwork = await loadImage(
    `data:${prepared.artworkType || "image/png"};base64,${prepared.artwork}`,
  );
  drawCoverImage(context, artwork, size);

  const atmosphere = context.createLinearGradient(0, 0, size, size);
  atmosphere.addColorStop(0, `${family.palette[0]}26`);
  atmosphere.addColorStop(.55, "rgba(0,0,0,0)");
  atmosphere.addColorStop(1, `${family.palette[1]}42`);
  context.fillStyle = atmosphere;
  context.fillRect(0, 0, size, size);

  const textShade = context.createLinearGradient(0, size * .45, 0, size);
  textShade.addColorStop(0, "rgba(0,0,0,0)");
  textShade.addColorStop(1, "rgba(0,0,0,.88)");
  context.fillStyle = textShade;
  context.fillRect(0, 0, size, size);

  const inset = 132;
  context.fillStyle = family.titleColor;
  context.textBaseline = "alphabetic";
  context.font = "700 56px Arial, sans-serif";
  context.letterSpacing = "8px";
  context.fillText(artist.trim().toLocaleUpperCase("pt-BR"), inset, 155);

  context.font = "800 178px Arial, sans-serif";
  context.letterSpacing = "-6px";
  const lines = wrapTitle(context, title, size - inset * 2);
  const lineHeight = 166;
  const firstLineY = size - 148 - (lines.length - 1) * lineHeight;
  context.shadowColor = "rgba(0,0,0,.55)";
  context.shadowBlur = 24;
  lines.forEach((line, index) => {
    context.fillText(line, inset, firstLineY + index * lineHeight);
  });
  context.shadowBlur = 0;

  context.fillStyle = family.palette[1];
  context.fillRect(inset, size - 82, 118, 9);
  context.fillStyle = "rgba(255,255,255,.72)";
  context.font = "700 25px Arial, sans-serif";
  context.letterSpacing = "5px";
  context.fillText(`${family.label} • ${direction.treatment}`.toLocaleUpperCase("pt-BR"), inset + 144, size - 69);

  return canvas.toDataURL("image/jpeg", .9);
}

async function compressPhoto(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Envie uma foto em JPG, PNG ou WebP.");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("A foto pode ter no máximo 12 MB.");
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const maxSide = 1536;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(64, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(64, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Seu navegador não conseguiu preparar a foto.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", .88);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function waitForPreparedCover(
  jobId: string,
  onProgress: (message: string) => void,
) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const result = await memberApi(`/v1/music/covers/jobs/${encodeURIComponent(jobId)}`) as (
      PreparedCover & CoverPreparation
    );
    if (result.stage === "ready" && result.artwork) return result;
    onProgress(attempt < 8
      ? "O GPT está transformando sua foto em capa…"
      : "O GPT está caprichando nos últimos detalhes…");
    await new Promise((resolve) => window.setTimeout(resolve, 3_000));
  }
  throw new Error("A capa está demorando mais que o normal. Tente novamente em alguns instantes.");
}

export default function CoverStudioPage() {
  const [tracks, setTracks] = useState<PlatformTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [familyId, setFamilyId] = useState<CoverFamily>("pop");
  const [directionId, setDirectionId] = useState<CoverDirection["id"]>("portrait");
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [finalCover, setFinalCover] = useState("");
  const [savedCoverUrl, setSavedCoverUrl] = useState("");
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const selectedTrack = tracks.find((track) => track.id === selectedTrackId) ?? null;
  const family = coverFamilyById(familyId);
  const direction = family.directions.find((item) => item.id === directionId) ?? family.directions[0];

  useEffect(() => {
    let active = true;
    memberApi("/v1/music/library")
      .then((data) => {
        if (!active) return;
        const generations = Array.isArray(data.generations)
          ? data.generations as PlatformGeneration[]
          : [];
        const nextTracks = flattenGenerations(generations);
        setTracks(nextTracks);
        const requestedTrack = new URLSearchParams(window.location.search).get("track");
        const firstTrack = nextTracks.find((track) => track.id === requestedTrack) ?? nextTracks[0];
        if (firstTrack) {
          setSelectedTrackId(firstTrack.id);
          setTitle(firstTrack.title);
          setFamilyId(inferCoverFamily(firstTrack.tags));
        }
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : "Não foi possível abrir suas músicas.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function selectTrack(track: PlatformTrack) {
    setSelectedTrackId(track.id);
    setTitle(track.title);
    setFamilyId(inferCoverFamily(track.tags));
    setDirectionId("portrait");
    setFinalCover("");
    setSavedCoverUrl("");
  }

  const canCreate = useMemo(() => (
    Boolean(selectedTrack && title.trim() && artist.trim() && photo && consent && !creating)
  ), [artist, consent, creating, photo, selectedTrack, title]);

  async function receivePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setFinalCover("");
    setSavedCoverUrl("");
    try {
      const compressed = await compressPhoto(file);
      setPhoto(compressed);
      setPhotoName(file.name || "Foto escolhida");
    } catch (photoError) {
      setError(photoError instanceof Error ? photoError.message : "Não foi possível usar esta foto.");
    }
  }

  async function createCover() {
    if (!canCreate || !selectedTrack) return;
    setCreating(true);
    setError("");
    setFinalCover("");
    setSavedCoverUrl("");
    try {
      setProgress("Enviando sua referência ao GPT…");
      const preparation = await memberApi("/v1/music/covers/prepare", {
        method: "POST",
        body: JSON.stringify({
          trackId: selectedTrack.id,
          trackToken: selectedTrack.coverToken,
          title: title.trim(),
          artist: artist.trim(),
          genreFamily: familyId,
          direction: direction.id,
          photo,
          consent,
        }),
      }) as CoverPreparation;

      setProgress("O GPT está criando a direção visual…");
      const prepared = await waitForPreparedCover(preparation.jobId, setProgress);
      setProgress("Aplicando título e assinatura…");
      const composed = await composeCover({
        prepared,
        title,
        artist,
        familyId,
        direction,
      });
      setFinalCover(composed);

      setProgress("Salvando no seu repertório…");
      const saved = await memberApi("/v1/music/covers/save", {
        method: "POST",
        body: JSON.stringify({
          trackId: selectedTrack.id,
          trackToken: selectedTrack.coverToken,
          jobId: prepared.jobId,
          title: title.trim(),
          artist: artist.trim(),
          genreFamily: familyId,
          direction: direction.id,
          image: composed,
        }),
      });
      setSavedCoverUrl(saved.coverUrl || "");
      setProgress("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível criar a capa agora.");
      setProgress("");
    } finally {
      setCreating(false);
    }
  }

  return (
    <AcademyShell title="Criar capa" eyebrow="DIRETOR DE CAPA • IDENTIDADE VISUAL" className="cover-academy">
      <section className="cover-hero">
        <div>
          <small>SUA MÚSICA PRECISA SER RECONHECIDA ANTES DO PLAY</small>
          <h2>Transforme uma foto sua em capa de lançamento.</h2>
          <p>Escolha a música e uma direção inspirada na linguagem visual do gênero. O GPT usa sua foto como referência, cria a arte completa e a Academia aplica o título corretamente.</p>
        </div>
        <ol aria-label="Etapas da criação da capa">
          <li className={selectedTrack ? "done" : "active"}><span>1</span> Música</li>
          <li className={selectedTrack && !photo ? "active" : photo ? "done" : ""}><span>2</span> Direção</li>
          <li className={photo && !finalCover ? "active" : finalCover ? "done" : ""}><span>3</span> Sua foto</li>
          <li className={finalCover ? "active" : ""}><span>4</span> Capa</li>
        </ol>
      </section>

      {loading ? <div className="cover-loading">Abrindo seu repertório…</div> : null}
      {!loading && !tracks.length ? (
        <div className="cover-empty">
          <small>PRIMEIRO PASSO</small>
          <h2>Crie uma música antes da capa.</h2>
          <p>O Diretor de Capa usa o título e o estilo da sua música para indicar a direção visual.</p>
          <a href="/biblioteca/gerador">Conversar e criar música →</a>
        </div>
      ) : null}

      {tracks.length ? (
        <section className="cover-studio">
          <div className="cover-controls">
            <section className="cover-step">
              <header><span>01</span><div><small>ESCOLHA A FAIXA</small><h2>Qual música vai ganhar uma capa?</h2></div></header>
              <div className="cover-track-picker">
                {tracks.slice(0, 8).map((track) => (
                  <button
                    type="button"
                    className={track.id === selectedTrackId ? "selected" : ""}
                    key={track.id}
                    onClick={() => selectTrack(track)}
                  >
                    <i style={track.imageUrl ? { backgroundImage: `url("${track.imageUrl}")` } : {}} />
                    <span><b>{track.title}</b><small>{track.tags || "Música criada na Academia"}</small></span>
                    <em>{track.id === selectedTrackId ? "✓" : "○"}</em>
                  </button>
                ))}
              </div>
            </section>

            <section className="cover-step">
              <header><span>02</span><div><small>LINGUAGEM DO GÊNERO</small><h2>Escolha como sua música deve parecer.</h2></div></header>
              <label className="cover-family-select">
                Estilo visual
                <select value={familyId} onChange={(event) => {
                  setFamilyId(event.target.value as CoverFamily);
                  setDirectionId("portrait");
                  setFinalCover("");
                }}>
                  {coverFamilies.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
                </select>
                <small>{family.note}</small>
              </label>
              <div className="cover-directions">
                {family.directions.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={item.id === directionId ? "selected" : ""}
                    style={{ "--cover-a": family.palette[0], "--cover-b": family.palette[1], "--cover-c": family.palette[2] } as CSSProperties}
                    onClick={() => {
                      setDirectionId(item.id);
                      setFinalCover("");
                    }}
                  >
                    <i><span /></i>
                    <b>{item.name}</b>
                    <small>{item.description}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="cover-step">
              <header><span>03</span><div><small>VOCÊ NA CAPA</small><h2>Tire uma foto agora ou envie da galeria.</h2></div></header>
              <div className={`cover-photo-drop ${photo ? "has-photo" : ""}`}>
                {photo ? (
                  // A imagem é um data URL local escolhido pelo próprio usuário.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="Foto escolhida para a capa" />
                ) : <div><i>＋</i><b>Uma foto simples já funciona</b><small>Prefira boa luz e deixe espaço ao redor do corpo.</small></div>}
                <div>
                  <button type="button" onClick={() => cameraInputRef.current?.click()}>Abrir câmera</button>
                  <button type="button" onClick={() => galleryInputRef.current?.click()}>Enviar foto</button>
                  {photoName ? <small>{photoName}</small> : null}
                </div>
                <input ref={cameraInputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={receivePhoto} />
                <input ref={galleryInputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={receivePhoto} />
              </div>
              <p className="cover-photo-note">Sua foto fica protegida apenas durante a criação e é apagada automaticamente. Só a capa final permanece no repertório.</p>
              <label className="cover-consent">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                <span>Confirmo que sou a pessoa da foto ou tenho autorização para usá-la.</span>
              </label>
            </section>

            <section className="cover-step cover-naming">
              <header><span>04</span><div><small>ASSINATURA</small><h2>Como o lançamento vai aparecer?</h2></div></header>
              <label>Título da música<input value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} /></label>
              <label>Seu nome artístico<input value={artist} maxLength={60} placeholder="Ex.: Saraiva Beatz" onChange={(event) => setArtist(event.target.value)} /></label>
            </section>
          </div>

          <aside className="cover-preview-panel">
            <header><small>PRÉVIA DA CAPA</small><span>1:1 • ALTA RESOLUÇÃO</span></header>
            <div
              className={`cover-preview ${finalCover ? "has-result" : ""}`}
              style={{ "--cover-a": family.palette[0], "--cover-b": family.palette[1], "--cover-c": family.palette[2] } as CSSProperties}
            >
              {finalCover ? (
                // A capa final é montada no canvas antes de ser salva.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={finalCover} alt={`Capa criada para ${title}`} />
              ) : (
                <>
                  {photo ? (
                    // Prévia local da foto; não há URL que o otimizador possa buscar.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" />
                  ) : <i />}
                  <div><small>{artist || "SEU NOME ARTÍSTICO"}</small><strong>{title || "TÍTULO DA MÚSICA"}</strong><span>{direction.name}</span></div>
                </>
              )}
            </div>
            <div className="cover-choice-summary">
              <small>DIREÇÃO ESCOLHIDA</small>
              <b>{direction.name}</b>
              <p>{family.label} • {direction.treatment}</p>
            </div>
            {error ? <p className="cover-error" role="alert">{error}</p> : null}
            <button className="cover-create-button" type="button" disabled={!canCreate} onClick={() => void createCover()}>
              {creating
                ? progress || "Criando sua capa…"
                : finalCover
                  ? "Criar outra capa →"
                  : "Criar minha capa →"}
            </button>
            {!canCreate && !creating ? <p className="cover-guidance">Escolha a música, envie sua foto, informe seu nome e confirme a autorização.</p> : null}
            {finalCover ? (
              <div className="cover-result-actions">
                <a href={finalCover} download={`${title || "capa"}.jpg`}>Baixar capa ↓</a>
                {savedCoverUrl ? <a href="/biblioteca">Ver no repertório →</a> : null}
              </div>
            ) : null}
          </aside>
        </section>
      ) : null}
    </AcademyShell>
  );
}
