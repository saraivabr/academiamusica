import type { Metadata } from "next";
import { PublicShell } from "../components/Portal";
export const metadata: Metadata = { title: "Pagamento pendente", robots: { index: false, follow: false } };
export default function Pendente(){return <PublicShell compact><main className="status-page narrow"><span className="status-icon pending">…</span><div className="eyebrow">PAGAMENTO EM ANÁLISE</div><h1>Estamos quase lá.</h1><p>Seu pagamento ainda está sendo processado. Assim que houver confirmação, o acesso será liberado e você receberá as instruções no e-mail informado.</p><a className="portal-button ghost" href="/suporte">Preciso de ajuda</a></main></PublicShell>}
