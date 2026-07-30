import type { Metadata } from "next";
import { PublicShell } from "../components/Portal";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Projeto Música Presente — R$ 49,97",
  description: "Libere 20 créditos musicais: 10 rodadas pagas, com até 2 versões por rodada.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Checkout() {
  return (
    <PublicShell compact>
      <main className="checkout-page checkout-paid">
        <section className="checkout-intro">
          <div className="eyebrow">SUA PRÉVIA ESTÁ PRONTA</div>
          <h1>Agora transforme a direção em música completa.</h1>
          <p>
            O Projeto Música Presente libera dez rodadas pagas para você
            experimentar caminhos, comparar versões e escolher a música que mais
            representa a sua história.
          </p>
          <div className="checkout-proof">
            <span>✓ 20 créditos musicais</span>
            <span>✓ 10 rodadas pagas</span>
            <span>✓ Até 2 versões por rodada</span>
            <span>✓ Biblioteca, download, capa e tutorial</span>
          </div>
          <div className="checkout-help">
            <small>FICOU COM ALGUMA DÚVIDA?</small>
            <strong>Fale com o atendimento antes de pagar.</strong>
            <a
              href="https://wa.me/5511991143605?text=Oi%2C%20vim%20pelo%20site%20da%20musicacom.ia%20e%20tenho%20uma%20d%C3%BAvida%20sobre%20o%20Projeto%20M%C3%BAsica%20Presente."
              target="_blank"
              rel="noreferrer"
              data-track="support_click"
            >
              Conversar no WhatsApp ↗
            </a>
          </div>
        </section>
        <CheckoutClient />
      </main>
    </PublicShell>
  );
}
