"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CHECKOUT_API } from "../lib/access";
import { getAnalyticsContext, trackEvent } from "../lib/analytics";
import { trackMetaEvent } from "../lib/metaPixel";

type Order = {
  id: string;
  status: string;
  value: number;
  brCode?: string;
  qrCodeImage?: string;
  paymentLinkUrl?: string;
  expiresAt?: string;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function getIdempotencyKey() {
  const storageKey = "academia-musica-checkout-key";
  const stored = window.sessionStorage.getItem(storageKey);
  if (stored) return stored;
  const key = crypto.randomUUID().replaceAll("-", "");
  window.sessionStorage.setItem(storageKey, key);
  return key;
}

export default function CheckoutClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const pollingFailures = useRef(0);

  const expiresLabel = (() => {
    if (!order?.expiresAt) return null;
    const date = new Date(order.expiresAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  })();

  useEffect(() => {
    if (!order?.id || order.status === "PAID") return;
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`${CHECKOUT_API}/v1/checkout/${encodeURIComponent(order.id)}`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = await response.json();
        pollingFailures.current = 0;
        setOrder(data.order);
        if (data.order?.status === "PAID") {
          window.sessionStorage.removeItem("academia-musica-checkout-key");
          window.location.assign(`/obrigado?pedido=${encodeURIComponent(data.order.id)}`);
        }
      } catch {
        pollingFailures.current += 1;
        if (pollingFailures.current >= 5) {
          window.clearInterval(interval);
          setError("A confirmação automática pausou. Seu Pix continua válido; atualize a página após pagar.");
        }
      }
    }, 4000);
    return () => window.clearInterval(interval);
  }, [order?.id, order?.status]);

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!acceptedTerms) {
      setError("Confirme os termos para continuar.");
      return;
    }
    setLoading(true);
    setError("");
    trackEvent("checkout_started");
    trackMetaEvent("InitiateCheckout", {
      content_name: "Academia Música IA",
      content_type: "product",
      value: 197,
      currency: "BRL",
    });
    try {
      const analytics = getAnalyticsContext();
      const response = await fetch(`${CHECKOUT_API}/v1/checkout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          acceptedTerms,
          idempotencyKey: getIdempotencyKey(),
          ...analytics,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.order) {
        throw new Error(data.error || "Não foi possível gerar o Pix.");
      }
      setOrder(data.order);
      trackMetaEvent("AddPaymentInfo", {
        content_name: "Academia Música IA",
        value: 197,
        currency: "BRL",
      });
    } catch (requestError) {
      trackEvent("checkout_error");
      setError(requestError instanceof Error ? requestError.message : "Não foi possível gerar o Pix.");
    } finally {
      setLoading(false);
    }
  }

  async function copyPix() {
    if (!order?.brCode) return;
    await navigator.clipboard.writeText(order.brCode);
    trackEvent("pix_copied");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  if (order) {
    return (
      <section className="checkout-card pix-card" aria-live="polite">
        <div className="pix-status"><span /> PIX GERADO COM SEGURANÇA</div>
        <h2>Agora é só pagar.</h2>
        <p className="pix-instruction">
          Abra o aplicativo do seu banco, escolha Pix Copia e Cola e use o código abaixo.
        </p>
        {order.qrCodeImage ? (
          <img className="pix-qr" src={order.qrCodeImage} alt="QR Code Pix da inscrição" />
        ) : null}
        <div className="pix-price">{formatPrice(order.value)}</div>
        {order.brCode ? (
          <>
            <label className="pix-code">
              <span>PIX COPIA E COLA</span>
              <textarea readOnly value={order.brCode} rows={3} />
            </label>
            <button type="button" className="checkout-primary" onClick={copyPix}>
              {copied ? "Código copiado ✓" : "Copiar código Pix"}
            </button>
          </>
        ) : null}
        {order.paymentLinkUrl ? (
          <a className="payment-link" href={order.paymentLinkUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("woovi_opened")}>
            Prefiro abrir a página segura da Woovi ↗
          </a>
        ) : null}
        <div className="payment-waiting">
          <span className="payment-loader" aria-hidden="true" />
          <div>
            <strong>Aguardando confirmação</strong>
            <small>A página atualiza automaticamente depois do pagamento.</small>
          </div>
        </div>
        <small className="order-reference">Pedido: <strong>{order.id}</strong> — guarde este código para acessar em outro dispositivo.</small>
        {expiresLabel ? <small className="payment-note">Este código é válido até {expiresLabel}.</small> : null}
        {error ? <p className="checkout-error">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="checkout-card">
      <div className="order-title">
        <span className="cover-mini">AMI</span>
        <div>
          <small>SEU ACESSO</small>
          <h2>Academia Música IA</h2>
          <p>Plataforma de criação musical</p>
        </div>
      </div>
      <div className="order-includes">
        <p><b>✓</b> Acesso permanente à plataforma</p>
        <p><b>✓</b> Criador visual sem prompt</p>
        <p><b>✓</b> 25 músicas incluídas para criar e baixar</p>
        <p><b>✓</b> Capa e tutorial de lançamento integrados</p>
        <p><b>✓</b> Biblioteca pessoal com player e download</p>
      </div>
      <div className="order-price">
        <span>Pagamento único</span>
        <strong><small>R$</small>197</strong>
        <em>via Pix • sem renovação automática</em>
      </div>
      <form className="checkout-form" onSubmit={createOrder}>
        <label>
          Seu nome
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Como podemos chamar você?"
          />
        </label>
        <label>
          Seu melhor e-mail
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Você receberá as orientações aqui"
          />
        </label>
        <label>
          WhatsApp <small>(opcional)</small>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            maxLength={20}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="(11) 99999-9999"
          />
        </label>
        <label className="terms-check">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
          <span>
            Li e aceito os <a href="/termos" target="_blank">Termos</a>, a{" "}
            <a href="/privacidade" target="_blank">Política de Privacidade</a> e as
            condições de reembolso.
          </span>
        </label>
        {error ? <p className="checkout-error">{error}</p> : null}
        <button className="checkout-primary" disabled={loading}>
          {loading ? "Gerando seu Pix…" : "Entrar na plataforma + 25 músicas • R$197"}
        </button>
      </form>
      <small className="payment-note">
        Pagamento processado pela Woovi. A Academia não recebe seus dados bancários.
      </small>
      <div className="secure-row">
        <span>🔒 Ambiente seguro</span>
        <span>7 dias de garantia</span>
      </div>
    </section>
  );
}
