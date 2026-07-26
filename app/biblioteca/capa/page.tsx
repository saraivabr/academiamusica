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

type CoverCreationStage = "idle" | "uploading" | "directing" | "composing" | "saving" | "complete";

type PendingCoverJob = {
  jobId: string;
  trackId: string;
  title: string;
  artist: string;
  familyId: CoverFamily;
  directionId: CoverDirection["id"];
};

const PENDING_COVER_KEY = "academia-musica:pending-cover";
const coverCreationSteps: Array<{ id: Exclude<CoverCreationStage, "idle" | "complete">; label: string }> = [
  { id: "uploading", label: "Recebendo sua foto" },
  { id: "directing", label: "Criando a direção visual" },
  { id: "composing", label: "Montando título e assinatura" },
  { id: "saving", label: "Salvando no seu repertório" },
];

function stagePosition(stage: CoverCreationStage) {
  if (stage === "complete") return coverCreationSteps.length;
  return Math.max(0, coverCreationSteps.findIndex((item) => item.id === stage));
}

function CoverGenerationExperience({
  stage,
  progress,
  photo,
  title,
  family,
}: {
  stage: CoverCreationStage;
  progress: string;
  photo: string;
  title: string;
  family: ReturnType<typeof coverFamilyById>;
}) {
  const position = stagePosition(stage);
  return (
    <div className="cover-generation-overlay" role="dialog" aria-modal="true" aria-label="Criação da capa em andamento">
      <div className="cover-generation-stage" style={{ "--cover-a": family.palette[0], "--cover-b": family.palette[1], "--cover-c": family.palette[2] } as CSSProperties}>
        <div className="cover-generation-art" aria-hidden="true">
          <div className="cover-generation-halo" />
          <div className="cover-generation-sleeve">
            {photo ? (
              // A imagem é uma prévia local escolhida pelo próprio usuário.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" />
            ) : <i />}
            <span>{title || "Sua nova capa"}</span>
          </div>
          <div className="cover-generation-vinyl"><i /></div>
          <div className="cover-generation-scan" />
        </div>
        <div className="cover-generation-copy">
          <small>DIREÇÃO DE ARTE EM ANDAMENTO</small>
          <h2>Sua música está ganhando uma identidade.</h2>
          <p aria-live="polite">{progress || "Preparando sua capa…"}</p>
          <ol>
            {coverCreationSteps.map((item, index) => (
              <li key={item.id} className={index < position ? "done" : index === position ? "active" : ""}>
                <span>{index < position ? "✓" : index + 1}</span>
                {item.label}
              </li>
            ))}
          </ol>
          <div className="cover-generation-progress" aria-hidden="true"><i style={{ width: `${Math.min(100, Math.max(12, ((position + .45) / coverCreationSteps.length) * 100))}%` }} /></div>
          <em>Normalmente leva de 1 a 4 minutos. Pode deixar esta tela aberta.</em>
        </div>
      </div>
    </div>
  );
}

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
    const maxSide = 1024;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(64, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(64, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Seu navegador não conseguiu preparar a foto.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", .84);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function waitForPreparedCover(
  jobId: string,
  onProgress: (message: string) => void,
) {
  for (let attempt = 0; attempt < 190; attempt += 1) {
    const result = await memberApi(`/v1/music/covers/jobs/${encodeURIComponent(jobId)}`) as (
      PreparedCover & CoverPreparation
    );
    if (result.stage === "ready" && result.artwork) return result;
    onProgress(attempt < 20
      ? "Estudando sua foto e o universo da música…"
      : attempt < 55
        ? "Construindo luz, cenário e identidade visual…"
        : "Finalizando os detalhes da sua nova capa…");
    await new Promise((resolve) => window.setTimeout(resolve, 3_000));
  }
  throw new Error("A criação demorou além do esperado. Você pode tentar novamente.");
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
  const [creationStage, setCreationStage] = useState<CoverCreationStage>("idle");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [finalCover, setFinalCover] = useState("");
  const [savedCoverUrl, setSavedCoverUrl] = useState("");
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const resumedJobRef = useRef(false);

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

  useEffect(() => {
    if (!tracks.length || resumedJobRef.current) return;
    resumedJobRef.current = true;
    let pending: PendingCoverJob | null = null;
    try {
      pending = JSON.parse(window.localStorage.getItem(PENDING_COVER_KEY) || "null") as PendingCoverJob | null;
    } catch {
      window.localStorage.removeItem(PENDING_COVER_KEY);
    }
    if (!pending?.jobId || !pending.trackId) return;
    const track = tracks.find((item) => item.id === pending?.trackId);
    if (!track) {
      window.localStorage.removeItem(PENDING_COVER_KEY);
      return;
    }

    const resumeTimer = window.setTimeout(() => {
      setSelectedTrackId(track.id);
      setTitle(pending.title);
      setArtist(pending.artist);
      setFamilyId(pending.familyId);
      setDirectionId(pending.directionId);
      setCreating(true);
      setCreationStage("directing");
      setProgress("Retomando a criação da sua capa…");
      void finishCoverJob(pending, track);
    }, 0);
    return () => window.clearTimeout(resumeTimer);
  }, [tracks]);

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

  async function finishCoverJob(pending: PendingCoverJob, track: PlatformTrack) {
    try {
      const pendingFamily = coverFamilyById(pending.familyId);
      const pendingDirection = pendingFamily.directions.find((item) => item.id === pending.directionId)
        ?? pendingFamily.directions[0];
      setCreationStage("directing");
      const prepared = await waitForPreparedCover(pending.jobId, setProgress);
      setCreationStage("composing");
      setProgress("Aplicando título e assinatura com acabamento de lançamento…");
      const composed = await composeCover({
        prepared,
        title: pending.title,
        artist: pending.artist,
        familyId: pending.familyId,
        direction: pendingDirection,
      });
      setFinalCover(composed);

      setCreationStage("saving");
      setProgress("Salvando a capa junto da sua música…");
      const saved = await memberApi("/v1/music/covers/save", {
        method: "POST",
        body: JSON.stringify({
          trackId: track.id,
          trackToken: track.coverToken,
          jobId: prepared.jobId,
          title: pending.title,
          artist: pending.artist,
          genreFamily: pending.familyId,
          direction: pendingDirection.id,
          image: composed,
        }),
      });
      setSavedCoverUrl(saved.coverUrl || "");
      setCreationStage("complete");
      setProgress("Capa pronta e salva no seu repertório.");
      window.localStorage.removeItem(PENDING_COVER_KEY);
      window.setTimeout(() => {
        setCreating(false);
        setCreationStage("idle");
        setProgress("");
      }, 900);
    } catch (requestError) {
      window.localStorage.removeItem(PENDING_COVER_KEY);
      setError(requestError instanceof Error ? requestError.message : "Não foi possível criar a capa agora.");
      setCreating(false);
      setCreationStage("idle");
      setProgress("");
    }
  }

  async function createCover() {
    if (!canCreate || !selectedTrack) return;
    setCreating(true);
    setError("");
    setFinalCover("");
    setSavedCoverUrl("");
    try {
      setCreationStage("uploading");
      setProgress("Recebendo sua foto com segurança…");
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

      const pending: PendingCoverJob = {
        jobId: preparation.jobId,
        trackId: selectedTrack.id,
        title: title.trim(),
        artist: artist.trim(),
        familyId,
        directionId: direction.id,
      };
      window.localStorage.setItem(PENDING_COVER_KEY, JSON.stringify(pending));
      await finishCoverJob(pending, selectedTrack);
    } catch (requestError) {
      window.localStorage.removeItem(PENDING_COVER_KEY);
      setError(requestError instanceof Error ? requestError.message : "Não foi possível criar a capa agora.");
      setCreationStage("idle");
      setProgress("");
      setCreating(false);
    }
  }

  return (
    <AcademyShell title="Criar capa" eyebrow="DIRETOR DE CAPA • IDENTIDADE VISUAL" className="cover-academy">
      <section className="cover-hero">
        <div>
          <small>SUA MÚSICA PRECISA SER RECONHECIDA ANTES DO PLAY</small>
          <h2>Transforme uma foto sua em capa de lançamento.</h2>
          <p>Escolha a música, o estilo visual e uma foto. O Diretor de Capa transforma tudo em uma arte pronta e salva o resultado no seu repertório.</p>
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
          <a href="/biblioteca/gerador">Criar uma música →</a>
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

          <section className="cover-review">
            <div className="cover-review-heading">
              <div>
                <small>05 • CONFIRME E CRIE</small>
                <h2>Veja a direção antes de gerar.</h2>
                <p>Você pode voltar e mudar qualquer escolha. A criação só começa quando tocar no botão abaixo.</p>
              </div>
              <span>CAPA QUADRADA • ALTA RESOLUÇÃO</span>
            </div>
            <div className="cover-review-body">
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
              <div className="cover-review-action">
                <div className="cover-choice-summary">
                  <small>DIREÇÃO ESCOLHIDA</small>
                  <b>{direction.name}</b>
                  <p>{family.label} • {direction.treatment}</p>
                </div>
                <ul>
                  <li><span>✓</span> Usa sua foto como referência</li>
                  <li><span>✓</span> Respeita a linguagem do gênero</li>
                  <li><span>✓</span> Salva automaticamente em Minhas músicas</li>
                </ul>
                {error ? <p className="cover-error" role="alert">{error}</p> : null}
                <button className="cover-create-button" type="button" disabled={!canCreate} onClick={() => void createCover()}>
                  {finalCover ? "Criar uma nova versão →" : "Criar minha capa →"}
                </button>
                {!canCreate && !creating ? <p className="cover-guidance">Para liberar: escolha a música, envie uma foto, escreva seu nome e confirme a autorização.</p> : null}
                {finalCover ? (
                  <div className="cover-result-actions">
                    <a href={finalCover} download={`${title || "capa"}.jpg`}>Baixar capa ↓</a>
                    {savedCoverUrl ? <a href="/biblioteca">Ver em Minhas músicas →</a> : null}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </section>
      ) : null}
      {creating ? (
        <CoverGenerationExperience
          stage={creationStage}
          progress={progress}
          photo={photo}
          title={title}
          family={family}
        />
      ) : null}
    </AcademyShell>
  );
}
