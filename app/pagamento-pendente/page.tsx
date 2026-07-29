import type { Metadata } from "next";
import { PublicShell } from "../components/Portal";
export const metadata: Metadata = { title: "Pagamento pendente", robots: { index: false, follow: false } };
export default function Pendente(){return <PublicShell compact><main className="status-page narrow"><span className="status-icon pending">…</span><div className="eyebrow">PAGAMENTO EM ANÁLISE</div><h1>Estamos quase lá.</h1><p>Seu pagamento ainda está sendo processado. Se você chegou aqui depois de pagar, consulte o pedido novamente. Nenhuma nova cobrança será criada.</p><div className="status-actions"><a className="portal-button" href="/obrigado/">Verificar novamente</a><a className="portal-button ghost" href="/suporte">Preciso de ajuda</a></div></main></PublicShell>}
