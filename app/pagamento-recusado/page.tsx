import type { Metadata } from "next";
import { PublicShell } from "../components/Portal";
export const metadata: Metadata = { title: "Pagamento não concluído", robots: { index: false, follow: false } };
export default function Recusado(){return <PublicShell compact><main className="status-page narrow"><span className="status-icon failed">×</span><div className="eyebrow">PAGAMENTO NÃO CONCLUÍDO</div><h1>Vamos tentar de novo.</h1><p>Nenhum acesso foi ativado. Revise os dados no provedor de pagamento ou escolha outra forma disponível.</p><div className="status-actions"><a className="portal-button" href="/checkout">Voltar ao checkout</a><a className="portal-button ghost" href="/suporte">Falar com suporte</a></div></main></PublicShell>}
