import { PublicShell } from "../components/Portal";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Acesso à plataforma | Academia Música IA",
  description: "Entre na plataforma, crie suas músicas e aprenda pelo tutorial integrado.",
};

export default function Checkout() {
  return (
    <PublicShell compact>
      <main className="checkout-page">
        <section className="checkout-intro">
          <div className="eyebrow">ACESSO À PLATAFORMA</div>
          <h1>Entre com uma ideia. Saia com música.</h1>
          <p>
            Escolha história, emoção, ritmo e voz sem escrever prompt. A plataforma
            entrega duas versões por rodada e mantém tudo no seu repertório.
          </p>
          <div className="checkout-proof">
            <span>✓ 7 dias de garantia</span>
            <span>✓ Criador visual</span>
            <span>✓ Tutorial integrado</span>
            <span>✓ 20 músicas incluídas</span>
          </div>
          <div className="checkout-help">
            <small>FICOU COM ALGUMA DÚVIDA?</small>
            <strong>Fale com o atendimento antes de pagar.</strong>
            <a
              href="https://wa.me/5511991143605?text=Oi%2C%20vim%20pelo%20site%20da%20Academia%20M%C3%BAsica%20IA%20e%20tenho%20uma%20d%C3%BAvida."
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
