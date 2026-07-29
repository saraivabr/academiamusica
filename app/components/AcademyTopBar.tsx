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
      <div className="academy-page-title">
        <small>{eyebrow}</small>
        <h1>{title}</h1>
      </div>
      <div className="academy-top-actions">
        <Link href="/academia" className="avatar" title="Início da Academia">SB</Link>
      </div>
    </header>
  );
}
