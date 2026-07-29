"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
    <footer className={`academy-player ${selection ? "has-track" : ""}`} aria-label="Player da Academia">
      <div className="academy-player-track">
        <div
          className="academy-player-cover"
          style={selection?.track.imageUrl ? { backgroundImage: `url("${selection.track.imageUrl}")` } : {}}
          aria-hidden="true"
        >
          {!selection ? <img src="/brand/musicacom-symbol.png" alt="" width="358" height="188" /> : null}
        </div>
        <div>
          <strong>{selection?.track.title || "Seu repertório começa aqui"}</strong>
          <span>{selection?.context || "Escolha uma faixa em Minhas músicas"}</span>
        </div>
      </div>

      <div className="academy-player-controls">
        <div>
          <button
            type="button"
            className="academy-player-skip"
            aria-label="Voltar ao início"
            disabled={!playableUrl}
            onClick={() => seek(0)}
          >
            I◀
          </button>
          <button
            type="button"
            className="academy-player-toggle"
            aria-label={playing ? "Pausar música" : "Tocar música"}
            disabled={!playableUrl}
            onClick={togglePlayback}
          >
            {playing ? "Ⅱ" : "▶"}
          </button>
          <button
            type="button"
            className="academy-player-skip"
            aria-label="Avançar dez segundos"
            disabled={!playableUrl}
            onClick={() => seek(Math.min(duration || 0, currentTime + 10))}
          >
            ▶I
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
            Baixar
          </a>
        ) : <Link href="/biblioteca">Abrir músicas</Link>}
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
          {muted ? "SEM SOM" : "SOM"}
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
