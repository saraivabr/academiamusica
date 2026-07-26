"use client";

import { useEffect, useState } from "react";
import { activateMemberAccess, CHECKOUT_API } from "../lib/access";
import { hasMetaConsent, trackMetaEvent } from "../lib/metaPixel";

export default function PurchaseConfirmation() {
  const [state, setState] = useState<"checking" | "paid" | "paid-access-error" | "pending" | "invalid">("checking");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("pedido");
    if (!orderId) {
      const timeout = window.setTimeout(() => setState("invalid"), 0);
      return () => window.clearTimeout(timeout);
    }
    fetch(`${CHECKOUT_API}/v1/checkout/${encodeURIComponent(orderId)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Pedido não encontrado");
        const data = await response.json();
        if (data.order?.status !== "PAID") {
          setState("pending");
          return;
        }
        setOrderId(orderId);
        if (hasMetaConsent()) {
          const purchaseKey = `academia-meta-purchase-${orderId}`;
          let alreadyTracked = false;
          try {
            alreadyTracked = window.localStorage.getItem(purchaseKey) === "tracked";
          } catch {
            // The event can still be sent when storage is unavailable.
          }
          if (!alreadyTracked) {
            trackMetaEvent(
              "Purchase",
              {
                content_name: "Academia Música IA",
                content_type: "product",
                value: 197,
                currency: "BRL",
              },
              `purchase_${orderId}`,
            );
            try {
              window.localStorage.setItem(purchaseKey, "tracked");
            } catch {
              // Purchase confirmation must never depend on analytics storage.
            }
          }
        }
        return activateMemberAccess(orderId)
          .then(() => setState("paid"))
          .catch(() => setState("paid-access-error"));
      })
      .catch(() => setState("invalid"));
  }, []);

  if (state === "checking") {
    return <main className="status-page narrow"><span className="status-icon pending">…</span><div className="eyebrow">CONFIRMANDO PAGAMENTO</div><h1>Só um instante.</h1><p>Estamos conferindo seu pedido com o provedor de pagamento.</p></main>;
  }

  if (state === "pending") {
    return <main className="status-page narrow"><span className="status-icon pending">…</span><div className="eyebrow">PAGAMENTO EM PROCESSAMENTO</div><h1>Estamos quase lá.</h1><p>O Pix ainda não foi confirmado. Volte ao checkout para acompanhar ou fale com o suporte se já tiver efetuado o pagamento.</p><div className="status-actions"><a className="portal-button" href="/checkout">Voltar ao checkout</a><a className="portal-button ghost" href="/suporte">Falar com suporte</a></div></main>;
  }

  if (state === "invalid") {
    return <main className="status-page narrow"><span className="status-icon failed">×</span><div className="eyebrow">PEDIDO NÃO LOCALIZADO</div><h1>Vamos encontrar sua compra.</h1><p>Abra o link recebido após o pagamento ou fale com o atendimento usando o mesmo e-mail informado no checkout.</p><div className="status-actions"><a className="portal-button" href="/checkout">Ir ao checkout</a><a className="portal-button ghost" href="/suporte">Falar com suporte</a></div></main>;
  }

  if (state === "paid-access-error") {
    return <main className="status-page narrow"><span className="status-icon success">✓</span><div className="eyebrow">PAGAMENTO CONFIRMADO</div><h1>Sua compra está segura.</h1><p>Confirmamos o pedido <strong>{orderId}</strong>, mas não conseguimos autorizar este dispositivo automaticamente. Use esse código na página de entrada ou fale com o suporte.</p><div className="status-actions"><a className="portal-button" href={`/login/?pedido=${encodeURIComponent(orderId)}`}>Liberar meu acesso</a><a className="portal-button ghost" href="/suporte/">Falar com suporte</a></div></main>;
  }

  return <main className="status-page"><span className="status-icon success">✓</span><div className="eyebrow">PAGAMENTO CONFIRMADO • PLATAFORMA LIBERADA</div><h1>Sua primeira música começa com uma ideia.</h1><p>Seu dispositivo está autorizado e seus 25 créditos foram liberados. Guarde o código <strong>{orderId}</strong> para entrar novamente em outro aparelho.</p><div className="next-steps"><article><span>01</span><h2>Crie sua música</h2><p>Escolha história, emoção, ritmo e voz. A plataforma entrega duas versões para comparar.</p><a href="/biblioteca/gerador/">Abrir o criador →</a></article><article><span>02</span><h2>Siga o tutorial</h2><p>Aprenda dentro da plataforma enquanto transforma a favorita em lançamento.</p><a href="/academia/comecar/">Abrir tutorial →</a></article><article><span>03</span><h2>Precisa de ajuda?</h2><p>Nosso atendimento pode orientar seus primeiros passos.</p><a href="/suporte/">Falar com o suporte →</a></article></div></main>;
}
