"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  CircleHelp,
  Coins,
  Home,
  LibraryBig,
  LogOut,
  Music2,
  Plus,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import { clearMemberAccess, memberApi } from "../lib/access";
import {
  flattenGenerations,
  playInAcademyPlayer,
  type PlatformGeneration,
  type PlatformTrack,
} from "../lib/musicPlatform";

const primaryNavigation = [
  { href: "/academia", label: "Início", icon: Home, exact: true },
  { href: "/biblioteca/gerador", label: "Criar", icon: Sparkles, featured: true },
  { href: "/biblioteca/negocios", label: "Buscar negócios", icon: Store },
  { href: "/biblioteca", label: "Suas músicas", icon: LibraryBig, exact: true },
] satisfies Array<{
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  featured?: boolean;
}>;

const mobileNavigation = [
  { href: "/academia", label: "Início", icon: Home, exact: true },
  { href: "/biblioteca/gerador", label: "Criar", icon: Sparkles },
  { href: "/biblioteca", label: "Músicas", icon: LibraryBig, exact: true },
  { href: "/biblioteca/creditos", label: "Créditos", icon: Coins },
] satisfies Array<{
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}>;

function isCurrentPath(pathname: string, href: string, exact = false) {
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationLinks({
  items,
  pathname,
}: {
  items: typeof primaryNavigation;
  pathname: string;
}) {
  return items.map((item) => {
    const active = isCurrentPath(pathname, item.href, item.exact);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${active ? "active" : ""} ${item.featured ? "featured" : ""}`}
        aria-current={active ? "page" : undefined}
      >
        <span className="member-nav-icon" aria-hidden="true">
          <Icon />
        </span>
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
              >
                {!track.imageUrl ? <Music2 /> : null}
              </span>
              <b>{track.title}</b>
            </button>
          ))}
        </section>
      ) : null}

      <Link className="academy-wallet" href="/biblioteca/creditos" aria-label="Saldo de criação e recarga">
        <Coins className="academy-wallet-icon" aria-hidden="true" />
        <div>
          <small>{dailyFreeAvailable ? "BENEFÍCIO EM TRANSIÇÃO" : "SEU SALDO"}</small>
          <b>{dailyFreeAvailable ? "1 criação" : `${remainingSongs ?? "—"} créditos`}</b>
        </div>
        <span><Plus aria-hidden="true" /> PIX</span>
      </Link>

      <Link className="academy-course-link" href="/academia/comecar">
        <span aria-hidden="true"><CircleHelp /></span>
        <div><small>AJUDA CONTEXTUAL</small><b>Como funciona</b></div>
        <em aria-hidden="true"><ChevronRight /></em>
      </Link>

      <button
        type="button"
        className="academy-signout"
        onClick={() => {
          clearMemberAccess();
          window.location.assign("/login?mode=login");
        }}
      >
        <LogOut aria-hidden="true" />
        Sair da conta
      </button>
    </div>
  );
}

export function MemberMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="academy-mobile-nav" aria-label="Navegação principal no celular">
      {mobileNavigation.map((item) => {
        const active = isCurrentPath(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            href={item.href}
            key={item.href}
            className={active ? "active" : ""}
            aria-current={active ? "page" : undefined}
          >
            <span aria-hidden="true"><Icon /></span>
            <b>{item.label}</b>
          </Link>
        );
      })}
    </nav>
  );
}
