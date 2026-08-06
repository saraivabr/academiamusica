"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { Flip, gsap, useGSAP } from "../lib/gsap";

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

const previousNavigationTarget = new Map<string, string>();

function isCurrentPath(pathname: string, href: string, exact = false) {
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const normalizedHref = href.replace(/\/+$/, "") || "/";
  return exact
    ? normalizedPathname === normalizedHref
    : normalizedPathname === normalizedHref
      || normalizedPathname.startsWith(`${normalizedHref}/`);
}

function useActiveNavigationMotion(
  pathname: string,
  navigationKey: "desktop" | "mobile",
  targetWithinLink?: string,
) {
  const navigationRef = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    const navigation = navigationRef.current;
    const indicator = navigation?.querySelector<HTMLElement>(".member-nav-motion-indicator");
    const activeLink = navigation?.querySelector<HTMLAnchorElement>("a[data-active='true']");
    const activeTarget = targetWithinLink
      ? activeLink?.querySelector<HTMLElement>(targetWithinLink)
      : activeLink;
    if (!navigation || !indicator || !activeLink || !activeTarget) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const activeKey = activeLink.dataset.navKey;
    const previousKey = previousNavigationTarget.get(navigationKey);
    const previousLink = previousKey
      ? Array.from(navigation.querySelectorAll<HTMLAnchorElement>("a[data-nav-key]"))
        .find((link) => link.dataset.navKey === previousKey)
      : null;
    const previousTarget = targetWithinLink
      ? previousLink?.querySelector<HTMLElement>(targetWithinLink)
      : previousLink;
    const shouldAnimate = Boolean(
      previousTarget
      && previousKey !== activeKey
      && !reduceMotion,
    );

    gsap.set(indicator, { autoAlpha: 1 });
    if (shouldAnimate && previousTarget) {
      Flip.fit(indicator, previousTarget, { duration: 0, scale: true });
    }
    Flip.fit(indicator, activeTarget, {
      duration: shouldAnimate ? 0.42 : 0,
      ease: "power3.out",
      scale: true,
    });

    const icon = activeTarget.querySelector<HTMLElement>("svg");
    if (icon && shouldAnimate) {
      gsap.fromTo(
        icon,
        { rotation: -7, scale: 0.84 },
        { rotation: 0, scale: 1, duration: 0.42, ease: "back.out(1.8)", overwrite: "auto" },
      );
    }

    if (activeKey) previousNavigationTarget.set(navigationKey, activeKey);
  }, { dependencies: [pathname], scope: navigationRef });

  return navigationRef;
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
        data-active={active ? "true" : undefined}
        data-nav-key={item.href}
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
  const navigationRef = useActiveNavigationMotion(pathname, "desktop");
  const [recentTracks, setRecentTracks] = useState<PlatformTrack[]>([]);
  const [remainingSongs, setRemainingSongs] = useState<number | null>(null);

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
      <nav
        ref={navigationRef}
        className="member-nav member-nav-primary member-nav-motion"
        aria-label="Navegação principal"
      >
        <span className="member-nav-motion-indicator" aria-hidden="true" />
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
          <small>SEU SALDO</small>
          <b>{`${remainingSongs ?? "—"} créditos`}</b>
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
  const navigationRef = useActiveNavigationMotion(pathname, "mobile", ":scope > span");

  return (
    <nav
      ref={navigationRef}
      className="academy-mobile-nav member-nav-motion"
      aria-label="Navegação principal no celular"
    >
      <span className="member-nav-motion-indicator" aria-hidden="true" />
      {mobileNavigation.map((item) => {
        const active = isCurrentPath(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            href={item.href}
            key={item.href}
            className={active ? "active" : ""}
            aria-current={active ? "page" : undefined}
            data-active={active ? "true" : undefined}
            data-nav-key={item.href}
          >
            <span aria-hidden="true"><Icon /></span>
            <b>{item.label}</b>
          </Link>
        );
      })}
    </nav>
  );
}
