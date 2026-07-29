"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AcademyShell } from "../../components/Portal";
import { CHECKOUT_API, memberApi } from "../../lib/access";
import { trackEvent } from "../../lib/analytics";
import {
  formatProductPrice,
  RECHARGE_PRODUCTS,
  SUBSCRIPTION_PRODUCTS,
  type MusicProduct,
} from "../../lib/musicProducts";

type CreditOrder = {
  id: string;
  status: string;
  value: number;
  productName?: string;
  credits?: number;
  purchaseType?: "recharge" | "subscription";
  brCode?: string;
  qrCodeImage?: string;
  paymentLinkUrl?: string;
  expiresAt?: string;
};

type SubscriptionForm = {
  taxId: string;
  phone: string;
  zipcode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
};

const emptySubscriptionForm: SubscriptionForm = {
  taxId: "",
  phone: "",
  zipcode: "",
  street: "",
  number: "",
  neighborhood: "",
  city: "",
  state: "",
  complement: "",
};

function idempotencyKey(productId: string) {
  const storageKey = `academia-credit-checkout-${productId}`;
  const stored = window.sessionStorage.getItem(storageKey);
  if (stored) return stored;
  const key = crypto.randomUUID().replaceAll("-", "");
  window.sessionStorage.setItem(storageKey, key);
  return key;
}

function clearIdempotencyKey(productId: string) {
  window.sessionStorage.removeItem(`academia-credit-checkout-${productId}`);
}

function orderExpired(order: CreditOrder) {
  if (!order.expiresAt) return false;
  const expiresAt = new Date(order.expiresAt).getTime();
  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
}

export default function CreditosPage() {
  const [remainingSongs, setRemainingSongs] = useState<number | null>(null);
  const [dailyFreeAvailable, setDailyFreeAvailable] = useState(false);
  const [selected, setSelected] = useState<MusicProduct | null>(null);
  const [order, setOrder] = useState<CreditOrder | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [subscriptionForm, setSubscriptionForm] = useState(emptySubscriptionForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const pollingFailures = useRef(0);
  const selectedProductId = selected?.id;

  const pricePerSong = useMemo(() => {
    if (!selected) return "";
    return formatProductPrice(Math.round(selected.priceCents / selected.credits));
  }, [selected]);

  function refreshBalance() {
    memberApi("/v1/music/availability")
      .then((data) => {
        setRemainingSongs(Number(data.remainingSongs));
        setDailyFreeAvailable(Boolean(data.dailyFreeAvailable));
      })
      .catch(() => setRemainingSongs(null));
  }

  useEffect(() => {
    refreshBalance();
  }, []);

  useEffect(() => {
    if (!order?.id || order.status === "PAID") return;
    let cancelled = false;
    let timeout: number | undefined;

    const check = async () => {
      try {
        const response = await fetch(
          `${CHECKOUT_API}/v1/checkout/${encodeURIComponent(order.id)}`,
          { cache: "no-store" },
        );
        const data = await response.json();
        if (!response.ok || !data.order) throw new Error("Pagamento indisponível.");
        pollingFailures.current = 0;
        if (orderExpired(data.order)) {
          if (selectedProductId) clearIdempotencyKey(selectedProductId);
          setOrder(null);
          setError("Esse Pix expirou. Escolha o pacote novamente para gerar um novo código.");
          return;
        }
        setOrder(data.order);
        if (data.order.status === "PAID") {
          window.sessionStorage.removeItem(`academia-credit-checkout-${selectedProductId}`);
          refreshBalance();
          return;
        }
      } catch {
        pollingFailures.current += 1;
      }
      if (!cancelled && pollingFailures.current < 8) {
        timeout = window.setTimeout(check, 4000);
      }
    };

    timeout = window.setTimeout(check, 1500);
    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [order?.id, order?.status, selectedProductId]);

  function chooseProduct(product: MusicProduct) {
    trackEvent("credits_offer_selected", window.location.pathname, {
      placement: product.type,
      product: product.id,
    });
    setSelected(product);
    setOrder(null);
    setAcceptedTerms(false);
    setError("");
    document.getElementById("credito-checkout")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function createCreditOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !acceptedTerms) {
      setError("Escolha um pacote e confirme as condições para continuar.");
      return;
    }
    setLoading(true);
    setError("");
    trackEvent("credits_checkout_started", window.location.pathname, {
      placement: selected.type,
      product: selected.id,
    });
    try {
      const data = await memberApi("/v1/credits/checkout", {
        method: "POST",
        body: JSON.stringify({
          productId: selected.id,
          acceptedTerms,
          name: billingName,
          email: billingEmail,
          idempotencyKey: idempotencyKey(selected.id),
          ...(selected.type === "subscription" ? subscriptionForm : {}),
        }),
      });
      if (data.order?.status === "PAID") {
        clearIdempotencyKey(selected.id);
        refreshBalance();
      } else if (data.order && orderExpired(data.order)) {
        clearIdempotencyKey(selected.id);
        throw new Error("Esse Pix expirou. Clique novamente para gerar um novo código.");
      }
      setOrder(data.order);
    } catch (requestError) {
      setError(requestError instanceof Error
        ? requestError.message
        : "Não foi possível gerar o Pix.");
    } finally {
      setLoading(false);
    }
  }

  async function copyPix() {
    if (!order?.brCode) return;
    await navigator.clipboard.writeText(order.brCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <AcademyShell title="Créditos" eyebrow="CONTINUE CRIANDO">
      <section className="credits-hero">
        <div>
          <small>SEU SALDO AGORA</small>
          <strong>{remainingSongs ?? "—"}</strong>
          <span>créditos disponíveis</span>
          <em>{dailyFreeAvailable
            ? "+ 1 música grátis hoje"
            : "Sua música grátis volta amanhã"}</em>
        </div>
        <div>
          <h2>Escolha como continuar.</h2>
          <p>
            Comprar é opcional: a música grátis volta todos os dias. A recarga
            não vence; no Clube, os créditos entram após cada mensalidade paga.
          </p>
          <a className="credits-hero-action" href="#recargas">Ver opções de recarga ↓</a>
        </div>
      </section>

      <section className="credit-section" id="recargas">
        <header>
          <small>RECARGA AVULSA</small>
          <h2>Comprou, creditou, criou.</h2>
          <p>Pagamento único via Pix. Sem renovação automática.</p>
        </header>
        <div className="credit-product-grid">
          {RECHARGE_PRODUCTS.map((product) => (
            <article
              key={product.id}
              className={selected?.id === product.id ? "selected" : ""}
            >
              {product.badge ? <em>{product.badge}</em> : null}
              <small>{product.shortName}</small>
              <h3><strong>{product.credits}</strong> músicas</h3>
              <p>{product.description}</p>
              <b>{formatProductPrice(product.priceCents)}</b>
              <span>{formatProductPrice(Math.round(product.priceCents / product.credits))} por música</span>
              <button type="button" onClick={() => chooseProduct(product)}>
                Adicionar {product.credits} músicas
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="credit-section credit-club">
        <header>
          <small>PIX AUTOMÁTICO</small>
          <h2>Clube Criador</h2>
          <p>Mais repertório todo mês, com cancelamento pelo seu banco.</p>
        </header>
        <div className="credit-product-grid subscription">
          {SUBSCRIPTION_PRODUCTS.map((product) => (
            <article
              key={product.id}
              className={selected?.id === product.id ? "selected" : ""}
            >
              {product.badge ? <em>{product.badge}</em> : null}
              <small>{product.shortName}</small>
              <h3><strong>{product.credits}</strong> músicas/mês</h3>
              <p>{product.description}</p>
              <b>{formatProductPrice(product.priceCents)}<i>/mês</i></b>
              <span>{formatProductPrice(Math.round(product.priceCents / product.credits))} por música</span>
              <button type="button" onClick={() => chooseProduct(product)}>
                Assinar com Pix Automático
              </button>
            </article>
          ))}
          <aside>
            <b>Como funciona</b>
            <p>1. Você autoriza no aplicativo do banco.</p>
            <p>2. A primeira mensalidade é paga na aprovação.</p>
            <p>3. Cada mensalidade confirmada libera 60 músicas.</p>
            <p>4. Cancele a qualquer momento no banco ou pelo suporte.</p>
          </aside>
        </div>
      </section>

      {selected ? (
        <section className="credit-checkout" id="credito-checkout">
          {order?.status === "PAID" ? (
            <div className="credit-success">
              <span>✓</span>
              <small>PAGAMENTO CONFIRMADO</small>
              <h2>Seu saldo já foi atualizado.</h2>
              <p>
                {selected.credits} músicas foram adicionadas. Agora você tem{" "}
                <strong>{remainingSongs ?? "novos"} créditos</strong> disponíveis.
              </p>
              <a href="/biblioteca/gerador">Criar uma música agora →</a>
            </div>
          ) : order ? (
            <div className="credit-payment">
              <small>{order.purchaseType === "subscription" ? "AUTORIZE NO SEU BANCO" : "PAGUE COM PIX"}</small>
              <h2>{order.productName ?? selected.name}</h2>
              <strong>{formatProductPrice(order.value)}</strong>
              {order.qrCodeImage ? <img src={order.qrCodeImage} alt="QR Code Pix" /> : null}
              {order.brCode ? (
                <button type="button" onClick={copyPix}>
                  {copied ? "Código copiado ✓" : "Copiar código Pix"}
                </button>
              ) : null}
              {order.paymentLinkUrl ? (
                <a href={order.paymentLinkUrl} target="_blank" rel="noreferrer">
                  {order.purchaseType === "subscription"
                    ? "Abrir e autorizar Pix Automático ↗"
                    : "Abrir pagamento seguro ↗"}
                </a>
              ) : null}
              <p><i /> Aguardando confirmação automática…</p>
              <small>Pedido {order.id}</small>
            </div>
          ) : (
            <form onSubmit={createCreditOrder}>
              <header>
                <div>
                  <small>VOCÊ ESCOLHEU</small>
                  <h2>{selected.name}</h2>
                </div>
                <strong>{formatProductPrice(selected.priceCents)}</strong>
              </header>
              <p className="credit-unit-price">{pricePerSong} por música</p>

              <div className="credit-buyer-fields">
                <label>Nome para o comprovante<input required autoComplete="name" value={billingName} onChange={(event) => setBillingName(event.target.value)} /></label>
                <label>E-mail<input required type="email" autoComplete="email" value={billingEmail} onChange={(event) => setBillingEmail(event.target.value)} /></label>
              </div>

              {selected.type === "subscription" ? (
                <>
                  <div className="subscription-explainer">
                    Esta é uma assinatura mensal por Pix Automático. A primeira
                    cobrança acontece na autorização e as próximas, todo mês.
                  </div>
                  <div className="subscription-fields">
                    <label>CPF<input required inputMode="numeric" autoComplete="off" value={subscriptionForm.taxId} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, taxId: event.target.value })} /></label>
                    <label>WhatsApp<input required inputMode="tel" autoComplete="tel" value={subscriptionForm.phone} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, phone: event.target.value })} /></label>
                    <label>CEP<input required inputMode="numeric" autoComplete="postal-code" value={subscriptionForm.zipcode} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, zipcode: event.target.value })} /></label>
                    <label>Rua<input required autoComplete="street-address" value={subscriptionForm.street} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, street: event.target.value })} /></label>
                    <label>Número<input required value={subscriptionForm.number} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, number: event.target.value })} /></label>
                    <label>Bairro<input required value={subscriptionForm.neighborhood} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, neighborhood: event.target.value })} /></label>
                    <label>Cidade<input required autoComplete="address-level2" value={subscriptionForm.city} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, city: event.target.value })} /></label>
                    <label>UF<input required maxLength={2} autoComplete="address-level1" value={subscriptionForm.state} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, state: event.target.value.toUpperCase() })} /></label>
                    <label className="wide">Complemento <small>(opcional)</small><input value={subscriptionForm.complement} onChange={(event) => setSubscriptionForm({ ...subscriptionForm, complement: event.target.value })} /></label>
                  </div>
                </>
              ) : null}

              <label className="credit-terms">
                <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
                <span>
                  Li e aceito os <a href="/termos" target="_blank">termos</a>.
                  {selected.type === "subscription"
                    ? " Autorizo a cobrança mensal por Pix Automático e sei que posso cancelar."
                    : " Esta compra é única e não gera renovação."}
                </span>
              </label>
              {error ? <p className="checkout-error">{error}</p> : null}
              <button className="credit-confirm" disabled={loading}>
                {loading
                  ? "Preparando pagamento…"
                  : selected.type === "subscription"
                    ? `Autorizar ${formatProductPrice(selected.priceCents)}/mês`
                    : `Gerar Pix de ${formatProductPrice(selected.priceCents)}`}
              </button>
              <button type="button" className="credit-change" onClick={() => setSelected(null)}>
                Escolher outro pacote
              </button>
            </form>
          )}
        </section>
      ) : null}
    </AcademyShell>
  );
}
