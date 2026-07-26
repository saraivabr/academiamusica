"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { memberApi } from "../lib/access";
import { flattenGenerations, type PlatformGeneration } from "../lib/musicPlatform";

const releaseSteps = [
  {
    id: "idea",
    href: "/biblioteca/gerador",
    label: "Conte sua história",
    detail: "O Produtor organiza a direção.",
  },
  {
    id: "music",
    href: "/biblioteca/gerador",
    label: "Receba duas versões",
    detail: "Compare antes de decidir.",
  },
  {
    id: "choice",
    href: "/biblioteca",
    label: "Escolha a favorita",
    detail: "Ouça no player e baixe.",
  },
  {
    id: "cover",
    href: "/biblioteca/capa",
    label: "Crie a capa",
    detail: "Transforme sua foto em lançamento.",
  },
  {
    id: "release",
    href: "/academia/publicacao",
    label: "Prepare o lançamento",
    detail: "Organize arquivos e publicação.",
  },
] as const;

export default function ReleaseJourney() {
  const pathname = usePathname();
  const [trackCount, setTrackCount] = useState(0);
  const [remainingSongs, setRemainingSongs] = useState<number | null>(null);
  const [hasCover, setHasCover] = useState(false);

  useEffect(() => {
    let active = true;
    memberApi("/v1/music/library")
      .then((data) => {
        if (!active) return;
        const generations = Array.isArray(data.generations)
          ? data.generations as PlatformGeneration[]
          : [];
        const tracks = flattenGenerations(generations);
        setTrackCount(tracks.length);
        setHasCover(tracks.some((track) => track.hasCustomCover));
        setRemainingSongs(Number(data.remainingSongs));
      })
      .catch(() => {
        // A jornada continua útil mesmo se a biblioteca estiver atualizando.
      });
    return () => {
      active = false;
    };
  }, []);

  const completed = useMemo(() => {
    if (hasCover) return 4;
    if (trackCount) return 2;
    return 0;
  }, [hasCover, trackCount]);

  const activeIndex = pathname.startsWith("/academia/publicacao")
    ? 4
    : pathname.startsWith("/biblioteca/capa")
      ? 3
      : pathname === "/biblioteca"
        ? 2
        : pathname.startsWith("/biblioteca/gerador")
          ? Math.min(completed, 1)
          : Math.min(completed, 4);

  return (
    <aside className="academy-process-rail" aria-label="Processo do lançamento">
      <header>
        <small>SEU LANÇAMENTO</small>
        <h2>Da ideia ao play.</h2>
        <p>Cada etapa transforma sua criação em um ativo pronto para mostrar.</p>
      </header>

      <div className="release-progress">
        <span><i style={{ width: `${Math.max(8, (completed / 5) * 100)}%` }} /></span>
        <b>{completed}/5 etapas</b>
      </div>

      <ol>
        {releaseSteps.map((step, index) => {
          const done = index < completed;
          const active = index === activeIndex;
          return (
            <li className={done ? "done" : active ? "active" : ""} key={step.id}>
              <Link href={step.href}>
                <span>{done ? "✓" : index + 1}</span>
                <div><b>{step.label}</b><small>{step.detail}</small></div>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="release-value">
        <span><b>{trackCount}</b><small>músicas no repertório</small></span>
        <span><b>{remainingSongs ?? "—"}</b><small>músicas disponíveis</small></span>
      </div>
      <Link className="release-next" href={releaseSteps[Math.min(completed, 4)].href}>
        Continuar processo →
      </Link>
    </aside>
  );
}
