"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Download,
  LibraryBig,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { memberApi } from "../lib/access";
import {
  academyPlayerClearEvent,
  academyPlayerEvent,
  academyPlayerPendingStorageKey,
  academyPlayerStorageKey,
  flattenGenerations,
  playableTrackUrl,
  type PlatformGeneration,
  type PlayerSelection,
} from "../lib/musicPlatform";
import { gsap, useGSAP } from "../lib/gsap";

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function AcademyPlayer() {
  const pathname = usePathname();
  const [selection, setSelection] = useState<PlayerSelection | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoplayRef = useRef(false);
  const playerRef = useRef<HTMLElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const trackDetailsRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const equalizerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    let restoreTimer = 0;
    try {
      const saved = window.localStorage.getItem(academyPlayerStorageKey);
      if (saved) {
        const restored = JSON.parse(saved) as PlayerSelection;
        autoplayRef.current =
          window.localStorage.getItem(academyPlayerPendingStorageKey) === "1";
        window.localStorage.removeItem(academyPlayerPendingStorageKey);
        restoreTimer = window.setTimeout(() => setSelection(restored), 0);
      }
    } catch {
      try {
        window.localStorage.removeItem(academyPlayerStorageKey);
      } catch {
        // Ignore storage restrictions in hardened browser contexts.
      }
    }

    const handlePlay = (event: Event) => {
      const next = (event as CustomEvent<PlayerSelection>).detail;
      if (!next?.track || !playableTrackUrl(next.track)) return;
      autoplayRef.current = true;
      setSelection(next);
      setCurrentTime(0);
      try {
        window.localStorage.setItem(academyPlayerStorageKey, JSON.stringify(next));
        window.localStorage.removeItem(academyPlayerPendingStorageKey);
      } catch {
        // Playback still works when storage is unavailable.
      }
    };
    const handleClear = () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
      }
      setSelection(null);
      setPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    };
    window.addEventListener(academyPlayerEvent, handlePlay);
    window.addEventListener(academyPlayerClearEvent, handleClear);
    return () => {
      window.clearTimeout(restoreTimer);
      window.removeEventListener(academyPlayerEvent, handlePlay);
      window.removeEventListener(academyPlayerClearEvent, handleClear);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !selection) return;
    audio.load();
    if (!autoplayRef.current) return;
    autoplayRef.current = false;
    void audio.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [selection]);

  const playableUrl = selection ? playableTrackUrl(selection.track) : "";
  const visible = pathname.startsWith("/academia") || pathname.startsWith("/biblioteca");

  useGSAP(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(playerRef.current, {
      y: 16,
      autoAlpha: 0,
      duration: 0.48,
      ease: "power3.out",
      clearProps: "transform,opacity,visibility",
    });
  }, { dependencies: [visible], scope: playerRef });

  useGSAP(() => {
    if (!selection?.track.id || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timeline = gsap.timeline({
      defaults: {
        duration: 0.46,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
      },
    });
    timeline
      .from(coverRef.current, {
        rotation: -3,
        scale: 0.9,
        autoAlpha: 0,
      })
      .from(trackDetailsRef.current?.children ?? [], {
        x: 10,
        autoAlpha: 0,
        stagger: 0.045,
      }, "<0.08");
  }, {
    dependencies: [selection?.track.id],
    revertOnUpdate: true,
    scope: playerRef,
  });

  useGSAP(() => {
    const bars = equalizerRef.current?.querySelectorAll("i");
    if (!bars?.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.set(equalizerRef.current, { autoAlpha: playing ? 1 : 0.62 });
    gsap.set(bars, { scaleY: playing ? 0.5 : 0.22, transformOrigin: "50% 100%" });

    if (!playing || reduceMotion) return;

    gsap.fromTo(
      toggleRef.current,
      { scale: 0.88 },
      { scale: 1, duration: 0.38, ease: "back.out(2)", overwrite: "auto" },
    );
    gsap.to(bars, {
      scaleY: (index) => [1, 0.58, 0.84][index] ?? 0.72,
      duration: 0.32,
      ease: "sine.inOut",
      stagger: 0.08,
      repeat: -1,
      yoyo: true,
    });
  }, {
    dependencies: [playing],
    revertOnUpdate: true,
    scope: playerRef,
  });

  useEffect(() => {
    if (!visible || selection) return;
    let active = true;
    memberApi("/v1/music/library")
      .then((data) => {
        if (!active) return;
        const generations = Array.isArray(data.generations)
          ? data.generations as PlatformGeneration[]
          : [];
        const latestTrack = flattenGenerations(generations).find((track) => playableTrackUrl(track));
        if (!latestTrack) return;
        const next = { track: latestTrack, context: "Sua música mais recente" };
        setSelection(next);
        try {
          window.localStorage.setItem(academyPlayerStorageKey, JSON.stringify(next));
        } catch {
          // The latest song still appears when storage is unavailable.
        }
      })
      .catch(() => {
        // Keep the empty player available when the library cannot be loaded.
      });
    return () => {
      active = false;
    };
  }, [selection, visible]);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || !playableUrl) return;
    if (audio.paused) {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  }

  if (!visible) return null;

  return (
    <footer
      ref={playerRef}
      className={`academy-player ${selection ? "has-track" : ""} ${playing ? "is-playing" : ""}`}
      aria-label="Player da Academia"
    >
      <div className="academy-player-track">
        <div
          ref={coverRef}
          className="academy-player-cover"
          style={selection?.track.imageUrl ? { backgroundImage: `url("${selection.track.imageUrl}")` } : {}}
          aria-hidden="true"
        >
          {!selection ? <img src="/brand/musicacom-symbol.png" alt="" width="358" height="188" /> : null}
          <span ref={equalizerRef} className="academy-player-equalizer" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div ref={trackDetailsRef}>
          <strong>{selection?.track.title || "Seu repertório começa aqui"}</strong>
          <span>{selection?.context || "Escolha uma faixa em Minhas músicas"}</span>
        </div>
      </div>

      <div className="academy-player-controls">
        <div>
          <button
            ref={toggleRef}
            type="button"
            className="academy-player-skip"
            aria-label="Voltar ao início"
            disabled={!playableUrl}
            onClick={() => seek(0)}
          >
            <RotateCcw aria-hidden="true" />
          </button>
          <button
            type="button"
            className="academy-player-toggle"
            aria-label={playing ? "Pausar música" : "Tocar música"}
            disabled={!playableUrl}
            onClick={togglePlayback}
          >
            {playing
              ? <Pause fill="currentColor" aria-hidden="true" />
              : <Play fill="currentColor" aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="academy-player-skip"
            aria-label="Avançar dez segundos"
            disabled={!playableUrl}
            onClick={() => seek(Math.min(duration || 0, currentTime + 10))}
          >
            <span className="academy-skip-forward" aria-hidden="true">
              <RotateCw />
              <small>10</small>
            </span>
          </button>
        </div>
        <div className="academy-player-timeline">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            aria-label="Posição da música"
            disabled={!playableUrl}
            onChange={(event) => seek(Number(event.target.value))}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="academy-player-actions">
        {selection?.track.audioUrl ? (
          <a href={selection.track.audioUrl} target="_blank" rel="noreferrer" download>
            <Download aria-hidden="true" />
            Baixar
          </a>
        ) : <Link href="/biblioteca"><LibraryBig aria-hidden="true" /> Abrir músicas</Link>}
        <button
          type="button"
          aria-label={muted ? "Ativar som" : "Silenciar"}
          disabled={!playableUrl}
          onClick={() => {
            const next = !muted;
            setMuted(next);
            if (audioRef.current) audioRef.current.muted = next;
          }}
        >
          {muted
            ? <VolumeX aria-hidden="true" />
            : <Volume2 aria-hidden="true" />}
        </button>
      </div>

      {playableUrl ? (
        <audio
          ref={audioRef}
          src={playableUrl}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        />
      ) : null}
    </footer>
  );
}
