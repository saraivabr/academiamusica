"use client";

import { useEffect, useState } from "react";
import { activateMemberAccess, CHECKOUT_API } from "../lib/access";
import { hasMetaConsent, trackMetaEvent } from "../lib/metaPixel";
import { STARTER_PRODUCT } from "../lib/musicProducts";

type ConfirmedOrder = {
  value: number;
  credits: number;
  productName: string;
};

export default function PurchaseConfirmation() {
  const [state, setState] = useState<"checking" | "paid" | "paid-access-error" | "pending" | "invalid">("checking");
  const [orderId, setOrderId] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const [refreshAttempt, setRefreshAttempt] = useState(0);

  useEffect(() => {
    const storedOrderId = window.sessionStorage.getItem("academia-confirmation-order");
    const orderId = new URLSearchParams(window.location.search).get("pedido") || storedOrderId;
    if (!orderId) {
      const timeout = window.setTimeout(() => setState("invalid"), 0);
      return () => window.clearTimeout(timeout);
    }
    window.sessionStorage.setItem("academia-confirmation-order", orderId);
    window.history.replaceState({}, "", window.location.pathname);
    fetch(`${CHECKOUT_API}/v1/checkout/${encodeURIComponent(orderId)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Pedido não encontrado");
        const data = await response.json();
        if (data.order?.status !== "PAID") {
          setState("pending");
          return;
        }
        setOrderId(orderId);
        const confirmed = {
          value: Number(data.order.value) || STARTER_PRODUCT.priceCents,
          credits: Number(data.order.credits) || STARTER_PRODUCT.credits,
          productName: data.order.productName || STARTER_PRODUCT.name,
        };
        setConfirmedOrder(confirmed);
        if (hasMetaConsent()) {
          const purchaseKey = "academia-meta-purchase-tracked";
          let alreadyTracked = false;
          try {
            alreadyTracked = window.sessionStorage.getItem(purchaseKey) === "tracked";
          } catch {
            // The event can still be sent when storage is unavailable.
          }
          if (!alreadyTracked) {
            trackMetaEvent(
              "Purchase",
              {
                content_name: confirmed.productName,
                content_type: "product",
                value: confirmed.value / 100,
                currency: "BRL",
              },
              `purchase_${crypto.randomUUID()}`,
            );
            try {
              window.sessionStorage.setItem(purchaseKey, "tracked");
            } catch {
              // Purchase confirmation must never depend on analytics storage.
            }
          }
        }
        return activateMemberAccess(orderId)
          .then(() => {
            window.sessionStorage.removeItem("academia-confirmation-order");
            setState("paid");
          })
          .catch(() => setState("paid-access-error"));
      })
      .catch(() => setState("invalid"));
  }, [refreshAttempt]);

  if (state === "checking") {
    return <main className="status-page narrow"><span className="status-icon pending">…</span><div className="eyebrow">CONFIRMANDO PAGAMENTO</div><h1>Só um instante.</h1><p>Estamos conferindo seu pedido com o provedor de pagamento.</p></main>;
  }

  if (state === "pending") {
    return <main className="status-page narrow"><span className="status-icon pending">…</span><div className="eyebrow">PAGAMENTO EM PROCESSAMENTO</div><h1>Estamos quase lá.</h1><p>O Pix ainda não foi confirmado. Consulte novamente sem gerar outra cobrança ou fale com o suporte se o valor já saiu da sua conta.</p><div className="status-actions"><button className="portal-button" type="button" onClick={() => { setState("checking"); setRefreshAttempt((current) => current + 1); }}>Verificar novamente</button><a className="portal-button ghost" href="/suporte">Falar com suporte</a></div></main>;
  }

  if (state === "invalid") {
    return <main className="status-page narrow"><span className="status-icon failed">×</span><div className="eyebrow">PEDIDO NÃO LOCALIZADO</div><h1>Vamos encontrar sua compra.</h1><p>Abra o link recebido após o pagamento ou fale com o atendimento usando o mesmo e-mail informado na compra.</p><div className="status-actions"><a className="portal-button" href="/suporte">Localizar com o suporte</a><a className="portal-button ghost" href="/preview/">Voltar à minha prévia</a></div></main>;
  }

  if (state === "paid-access-error") {
    return <main className="status-page narrow"><span className="status-icon success">✓</span><div className="eyebrow">PAGAMENTO CONFIRMADO</div><h1>Sua compra está segura.</h1><p>Confirmamos o pedido <strong>{orderId}</strong>, mas não conseguimos autorizar este dispositivo automaticamente. Use esse código na página de entrada ou fale com o suporte.</p><div className="status-actions"><a className="portal-button" href="/login/">Liberar meu acesso</a><a className="portal-button ghost" href="/suporte/">Falar com suporte</a></div></main>;
  }

  return <main className="status-page narrow"><span className="status-icon success">✓</span><div className="eyebrow">PAGAMENTO CONFIRMADO • CRÉDITOS LIBERADOS</div><h1>Agora transforme sua prévia em música.</h1><p>Seus {confirmedOrder?.credits ?? STARTER_PRODUCT.credits} créditos já estão disponíveis: 10 rodadas pagas, com até 2 versões por rodada. Guarde o código <strong>{orderId}</strong> para recuperar o acesso em outro aparelho.</p><div className="status-actions"><a className="portal-button" href="/biblioteca/gerador/">Gerar minhas versões</a><a className="portal-button ghost" href="/biblioteca/">Ver minhas músicas</a></div></main>;
}
