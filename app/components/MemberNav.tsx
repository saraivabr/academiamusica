"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { memberApi } from "../lib/access";
import {
  flattenGenerations,
  playInAcademyPlayer,
  type PlatformGeneration,
  type PlatformTrack,
} from "../lib/musicPlatform";

const primaryNavigation = [
  { href: "/academia", label: "Início", marker: "⌂", exact: true },
  { href: "/biblioteca/gerador", label: "Criar música", marker: "●", featured: true },
  { href: "/biblioteca", label: "Minhas músicas", marker: "♪" },
];

const learningNavigation = [
  { href: "/academia/comecar", label: "Comece aqui", marker: "01" },
  { href: "/academia/musica", label: "Aprenda a criar", marker: "02" },
  { href: "/academia/identidade", label: "Crie o visual", marker: "03" },
  { href: "/academia/publicacao", label: "Prepare o lançamento", marker: "04" },
];

function NavigationLinks({
  items,
  pathname,
}: {
  items: typeof primaryNavigation;
  pathname: string;
}) {
  return items.map((item) => {
    const active = item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${active ? "active" : ""} ${item.featured ? "featured" : ""}`}
        aria-current={active ? "page" : undefined}
      >
        <span aria-hidden="true">{item.marker}</span>
        <b>{item.label}</b>
      </Link>
    );
  });
}

export default function MemberNav() {
  const pathname = usePathname();
  const [recentTracks, setRecentTracks] = useState<PlatformTrack[]>([]);

  useEffect(() => {
    let active = true;
    memberApi("/v1/music/library")
      .then((data) => {
        if (!active) return;
        const generations = Array.isArray(data.generations)
          ? data.generations as PlatformGeneration[]
          : [];
        setRecentTracks(flattenGenerations(generations).slice(0, 4));
      })
      .catch(() => {
        // The main navigation remains usable when recent tracks are unavailable.
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="member-navigation">
      <nav className="member-nav member-nav-primary" aria-label="Navegação principal">
        <NavigationLinks items={primaryNavigation} pathname={pathname} />
      </nav>

      <div className="academy-sidebar-label">APRENDER</div>
      <nav className="member-nav member-nav-learning" aria-label="Jornada da Academia">
        <NavigationLinks items={learningNavigation} pathname={pathname} />
      </nav>

      {recentTracks.length ? (
        <section className="academy-recents" aria-label="Tocadas recentemente">
          <header>
            <small>SEU REPERTÓRIO</small>
            <Link href="/biblioteca">Ver tudo</Link>
          </header>
          {recentTracks.map((track) => (
            <button
              type="button"
              key={track.id}
              onClick={() => playInAcademyPlayer(track, "Seu repertório")}
            >
              <span
                style={track.imageUrl ? { backgroundImage: `url("${track.imageUrl}")` } : {}}
                aria-hidden="true"
              />
              <b>{track.title}</b>
            </button>
          ))}
        </section>
      ) : null}
    </div>
  );
}
