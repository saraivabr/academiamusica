import Link from "next/link";
import { PublicShell } from "./components/Portal";

export default function NotFound() {
  return (
    <PublicShell compact>
      <main className="status-page narrow">
        <span className="status-icon failed" aria-hidden="true">404</span>
        <div className="eyebrow">PÁGINA NÃO ENCONTRADA</div>
        <h1>Esse caminho não existe.</h1>
        <p>
          O endereço pode ter mudado. Volte ao início ou entre no seu estúdio
          para continuar sua música.
        </p>
        <div className="status-actions">
          <Link className="portal-button" href="/">Voltar ao início</Link>
          <Link
            className="portal-button ghost"
            href="/login?mode=login&next=/biblioteca/gerador/"
          >
            Entrar no estúdio
          </Link>
        </div>
      </main>
    </PublicShell>
  );
}
