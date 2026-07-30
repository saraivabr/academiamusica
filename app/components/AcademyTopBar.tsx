import Link from "next/link";
import { Sparkles, UserRound } from "lucide-react";

export default function AcademyTopBar({
  title,
  eyebrow,
}: {
  title: string;
  eyebrow: string;
}) {
  return (
    <header className="academy-top">
      <div className="academy-page-title">
        <small>{eyebrow}</small>
        <h1>{title}</h1>
      </div>
      <div className="academy-top-actions">
        <Link href="/biblioteca/gerador" className="academy-top-create">
          <Sparkles aria-hidden="true" />
          Criar música
        </Link>
        <Link href="/academia" className="avatar" title="Início do estúdio" aria-label="Ir para o início do estúdio">
          <UserRound aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
