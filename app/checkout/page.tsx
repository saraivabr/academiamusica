import { PublicShell } from "../components/Portal";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Inscrição | Academia Música IA",
  description: "Garanta sua formação e 25 músicas incluídas por Pix.",
};

export default function Checkout() {
  return (
    <PublicShell compact>
      <main className="checkout-page">
        <section className="checkout-intro">
          <div className="eyebrow">INSCRIÇÕES ABERTAS</div>
          <h1>Aprenda criando suas próprias músicas.</h1>
          <p>
            Entre na Academia Música IA, receba 25 criações no estúdio e siga um
            caminho prático da primeira ideia ao lançamento.
          </p>
          <div className="checkout-proof">
            <span>✓ 7 dias de garantia</span>
            <span>✓ Pagamento único</span>
            <span>✓ 25 músicas incluídas</span>
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
