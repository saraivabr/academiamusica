import { PublicShell } from "../components/Portal";

export default function Checkout() {
  return <PublicShell compact><main className="checkout-page">
    <section className="checkout-intro">
      <div className="eyebrow">ÚLTIMO PASSO</div>
      <h1>Tire sua música do arquivo.</h1>
      <p>Entre na Academia Música IA e siga o caminho da ideia ao lançamento com direção, identidade e presença.</p>
      <div className="checkout-proof"><span>✓ 7 dias de garantia</span><span>✓ Pagamento único</span><span>✓ Acesso online</span></div>
    </section>
    <section className="checkout-card">
      <div className="order-title"><span className="cover-mini">AMI</span><div><small>SUA INSCRIÇÃO</small><h2>Academia Música IA</h2><p>Da ideia ao Spotify</p></div></div>
      <div className="order-includes">
        <p><b>✓</b> Formação principal com acesso permanente</p>
        <p><b>✓</b> Prompts, templates, capa e Canvas</p>
        <p><b>✓</b> Publicação e distribuição guiadas</p>
        <p><b>✓</b> 30 dias de Biblioteca Viva e comunidade</p>
      </div>
      <div className="order-price"><span>Pagamento único</span><strong><small>R$</small>197</strong><em>ou conforme condições exibidas pelo provedor</em></div>
      <div className="renewal-note"><b>Sem assinatura escondida.</b> A compra inicial não inclui renovação automática. Após 30 dias, a continuidade opcional poderá ser contratada por R$29,90/mês ou R$297/ano.</div>
      <button className="checkout-disabled" disabled>Conectar pagamento seguro</button>
      <small className="payment-note">Esta página não coleta dados financeiros. O botão será ativado após a integração com um provedor de pagamento seguro.</small>
      <div className="secure-row"><span>🔒 Ambiente seguro</span><span>7 dias de garantia</span></div>
    </section>
  </main></PublicShell>;
}
