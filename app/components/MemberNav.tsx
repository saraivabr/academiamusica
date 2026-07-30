"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearMemberAccess, memberApi } from "../lib/access";
import {
  flattenGenerations,
  playInAcademyPlayer,
  type PlatformGeneration,
  type PlatformTrack,
} from "../lib/musicPlatform";

const primaryNavigation = [
  { href: "/academia", label: "Início", marker: "⌂", exact: true },
  { href: "/biblioteca/gerador", label: "Criar", marker: "＋", featured: true },
  { href: "/biblioteca/negocios", label: "Buscar negócios", marker: "⌖" },
  { href: "/biblioteca", label: "Suas músicas", marker: "♫", exact: true },
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
  const [remainingSongs, setRemainingSongs] = useState<number | null>(null);
  const [dailyFreeAvailable, setDailyFreeAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    memberApi("/v1/music/library")
      .then((data) => {
        if (!active) return;
        const generations = Array.isArray(data.generations)
          ? data.generations as PlatformGeneration[]
          : [];
        setRecentTracks(flattenGenerations(generations).slice(0, 5));
        setRemainingSongs(Number(data.remainingSongs));
        setDailyFreeAvailable(Boolean(data.dailyFreeAvailable));
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

      {recentTracks.length ? (
        <section className="academy-recents" aria-label="Tocadas recentemente">
          <header>
            <small>SUA BIBLIOTECA</small>
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

      <Link className="academy-wallet" href="/biblioteca/creditos" aria-label="Saldo de criação e recarga">
        <div>
          <small>{dailyFreeAvailable ? "BENEFÍCIO EM TRANSIÇÃO" : "SEU SALDO"}</small>
          <b>{dailyFreeAvailable ? "1 criação" : `${remainingSongs ?? "—"} créditos`}</b>
        </div>
        <span>＋ PIX</span>
      </Link>

      <Link className="academy-course-link" href="/academia/comecar">
        <span>▤</span>
        <div><small>AJUDA CONTEXTUAL</small><b>Como funciona</b></div>
        <em>›</em>
      </Link>

      <button
        type="button"
        className="academy-signout"
        onClick={() => {
          clearMemberAccess();
          window.location.assign("/login?mode=login");
        }}
      >
        Sair da conta
      </button>
    </div>
  );
}
