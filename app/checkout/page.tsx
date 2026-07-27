import type { Metadata } from "next";
import { PublicShell } from "../components/Portal";

export const metadata: Metadata = {
  title: "Comece grátis",
  description: "Crie sua conta grátis e faça uma música por dia sem cartão.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Checkout() {
  return (
    <PublicShell compact>
      <main className="checkout-page">
        <section className="checkout-intro">
          <div className="eyebrow">COMECE SEM PAGAR</div>
          <h1>Sua primeira música começa grátis.</h1>
          <p>
            Crie sua conta, confirme o e-mail e faça uma música por dia sem cartão.
            Quando quiser produzir mais, compre créditos por Pix dentro da plataforma.
          </p>
          <div className="checkout-proof">
            <span>✓ Cadastro grátis</span>
            <span>✓ 1 música por dia</span>
            <span>✓ Biblioteca pessoal</span>
            <span>✓ Tutorial integrado</span>
          </div>
          <div className="checkout-help">
            <small>FICOU COM ALGUMA DÚVIDA?</small>
            <strong>Fale com o atendimento antes de começar.</strong>
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
        <section className="checkout-card">
          <div className="order-title">
            <span className="cover-mini">AMI</span>
            <div>
              <small>SEU ACESSO</small>
              <h2>Academia Música IA</h2>
              <p>Plataforma brasileira de criação musical</p>
            </div>
          </div>
          <div className="order-includes">
            <p><b>✓</b> Uma música grátis todos os dias</p>
            <p><b>✓</b> Criação guiada sem escrever prompt</p>
            <p><b>✓</b> Capa, repertório e download organizados</p>
            <p><b>✓</b> Tutorial completo dentro da plataforma</p>
            <p><b>✓</b> Recargas opcionais para criar mais</p>
          </div>
          <div className="order-price">
            <span>PARA COMEÇAR</span>
            <strong><small>R$</small>0</strong>
            <em>sem cartão • sem prazo de teste</em>
          </div>
          <a className="checkout-primary checkout-primary-link" href="/login?mode=register">
            Criar minha conta grátis →
          </a>
          <div className="secure-row">
            <span>🔒 E-mail verificado</span>
            <span>Compra só quando quiser</span>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
