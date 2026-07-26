import type { ReactNode } from "react";

export const Logo = () => (
  <a href="/" className="portal-logo">
    <span className="brand-disc"><i /><i /><i /></span>
    <span>Academia <b>Música IA</b></span>
  </a>
);

export function PublicShell({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <div className={`portal ${compact ? "portal-compact" : ""}`}>
      <header className="portal-header">
        <Logo />
        <nav>
          <a href="/#jornada">Método</a>
          <a href="/#duvidas">Dúvidas</a>
          <a href="/login">Entrar</a>
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

const memberLinks = [
  ["/academia", "Visão geral", "◉"],
  ["/academia/comecar", "Comece aqui", "01"],
  ["/academia/musica", "Crie sua música", "02"],
  ["/academia/identidade", "Identidade visual", "03"],
  ["/academia/publicacao", "Publicação", "04"],
  ["/biblioteca", "Biblioteca Viva", "✦"],
  ["/comunidade", "Comunidade", "●"],
];

export function AcademyShell({ children, title, eyebrow = "ÁREA DE MEMBROS" }: { children: ReactNode; title: string; eyebrow?: string }) {
  return (
    <div className="academy-shell">
      <aside className="academy-sidebar">
        <Logo />
        <nav>{memberLinks.map(([href, label, icon]) => <a key={href} href={href}><span>{icon}</span>{label}</a>)}</nav>
        <div className="academy-help"><small>PRECISA DE AJUDA?</small><a href="/suporte">Falar com suporte ↗</a></div>
      </aside>
      <main className="academy-main">
        <header className="academy-top"><div><small>{eyebrow}</small><h1>{title}</h1></div><a href="/" className="avatar">SB</a></header>
        {children}
      </main>
    </div>
  );
}

export function LessonCard({ number, title, text, time = "8 min", href = "#" }: { number: string; title: string; text: string; time?: string; href?: string }) {
  return <a href={href} className="lesson-card"><span>{number}</span><div><small>AULA • {time}</small><h3>{title}</h3><p>{text}</p></div><b>▶</b></a>;
}

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return <PublicShell compact><main className="legal-page"><div className="eyebrow">ACADEMIA MÚSICA IA</div><h1>{title}</h1><small>Última atualização: {updated}</small><article>{children}</article></main></PublicShell>;
}
