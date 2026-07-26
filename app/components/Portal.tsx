import type { ReactNode } from "react";
import Link from "next/link";
import MemberNav from "./MemberNav";

export const Logo = () => (
  <Link href="/" className="portal-logo">
    <span className="brand-disc"><i /><i /><i /></span>
    <span>Academia <b>Música IA</b></span>
  </Link>
);

export function PublicShell({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <div className={`portal ${compact ? "portal-compact" : ""}`}>
      <header className="portal-header">
        <Logo />
        <nav>
          <Link href="/#jornada">Método</Link>
          <Link href="/#duvidas">Dúvidas</Link>
          <Link href="/login">Entrar</Link>
        </nav>
      </header>
      {children}
      <footer className="portal-footer">
        <Logo />
        <div><a href="/termos">Termos</a><a href="/privacidade">Privacidade</a><a href="/reembolso">Reembolso</a><a href="/suporte">Suporte</a></div>
        <span>© 2026 Academia Música IA</span>
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
        <Logo />
        <div className="academy-sidebar-label">SUA JORNADA</div>
        <MemberNav />
        <div className="academy-help"><small>PRECISA DE AJUDA?</small><p>Fale com a gente e continue de onde parou.</p><Link href="/suporte">Abrir suporte ↗</Link></div>
      </aside>
      <main className="academy-main">
        <header className="academy-top"><div><small>{eyebrow}</small><h1>{title}</h1></div><Link href="/" className="avatar" title="Voltar ao site">SB</Link></header>
        {children}
      </main>
    </div>
  );
}

export function LessonCard({ number, title, text, time = "8 min", href = "#" }: { number: string; title: string; text: string; time?: string; href?: string }) {
  return <Link href={href} className="lesson-card"><span>{number}</span><div><small>AULA • {time}</small><h3>{title}</h3><p>{text}</p></div><b>▶</b></Link>;
}

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return <PublicShell compact><main className="legal-page"><div className="eyebrow">ACADEMIA MÚSICA IA</div><h1>{title}</h1><small>Última atualização: {updated}</small><article>{children}</article></main></PublicShell>;
}
