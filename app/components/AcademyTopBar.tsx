"use client";

import Link from "next/link";

export default function AcademyTopBar({
  title,
  eyebrow,
}: {
  title: string;
  eyebrow: string;
}) {
  return (
    <header className="academy-top">
      <div className="academy-history" aria-label="Histórico de navegação">
        <button type="button" aria-label="Voltar" onClick={() => window.history.back()}>‹</button>
        <button type="button" aria-label="Avançar" onClick={() => window.history.forward()}>›</button>
      </div>
      <div className="academy-page-title">
        <small>{eyebrow}</small>
        <h1>{title}</h1>
      </div>
      <div className="academy-top-actions">
        <Link href="/biblioteca/gerador" className="academy-top-create">＋ Nova criação</Link>
        <Link href="/academia" className="avatar" title="Início da Academia">SB</Link>
      </div>
    </header>
  );
}
