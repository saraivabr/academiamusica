import type { ReactNode } from "react";
import Link from "next/link";
import { CirclePlay, ExternalLink, Plus } from "lucide-react";
import MemberNav, { MemberMobileNav } from "./MemberNav";
import AcademyTopBar from "./AcademyTopBar";
import BrandLogo from "./BrandLogo";

export const Logo = ({ href = "/" }: { href?: string }) => (
  <Link href={href} className="portal-logo" aria-label="musicacom.ia">
    <BrandLogo />
  </Link>
);

export function PublicShell({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <div className={`portal ${compact ? "portal-compact" : ""}`}>
      <header className="portal-header">
        <Logo />
        <nav>
          <Link href="/#como-funciona">Como funciona</Link>
          <Link href="/#duvidas">Dúvidas</Link>
          <Link href="/login?mode=login">Entrar</Link>
        </nav>
      </header>
      {children}
      <footer className="portal-footer">
        <Logo />
        <div><a href="/termos">Termos</a><a href="/privacidade">Privacidade</a><a href="/reembolso">Reembolso</a><a href="/suporte">Suporte</a></div>
        <span>© 2026 musicacom.ia</span>
      </footer>
    </div>
  );
}

export function AcademyShell({
  children,
  title,
  eyebrow = "ÁREA DE MEMBROS",
  className = "",
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <div className={`academy-shell ${className}`.trim()}>
      <aside className="academy-sidebar">
        <Logo href="/academia" />
        <Link href="/biblioteca/gerador" className="academy-new-session">
          <span aria-hidden="true"><Plus /></span>
          Nova criação
        </Link>
        <MemberNav />
        <div className="academy-help"><small>PRECISA DE AJUDA?</small><p>Fale com a gente e continue de onde parou.</p><Link href="/suporte">Abrir suporte <ExternalLink aria-hidden="true" /></Link></div>
      </aside>
      <main className="academy-main">
        <AcademyTopBar title={title} eyebrow={eyebrow} />
        {children}
      </main>
      <MemberMobileNav />
    </div>
  );
}

export function LessonCard({ number, title, text, time = "8 min", href }: { number: string; title: string; text: string; time?: string; href?: string }) {
  const content = <><span>{number}</span><div><small>{href ? `TUTORIAL • ${time}` : "CONTEÚDO EM PREPARAÇÃO"}</small><h3>{title}</h3><p>{text}</p></div><b>{href ? <><CirclePlay aria-hidden="true" /> Assistir</> : "EM BREVE"}</b></>;
  return href
    ? <Link href={href} className="lesson-card">{content}</Link>
    : <article className="lesson-card is-upcoming" aria-label={`${title} — em breve`}>{content}</article>;
}

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return <PublicShell compact><main className="legal-page"><div className="eyebrow">musicacom.ia</div><h1>{title}</h1><small>Última atualização: {updated}</small><article>{children}</article></main></PublicShell>;
}
