"use client";

import { FormEvent, useEffect, useState } from "react";
import { activateMemberAccess } from "../lib/access";

export default function AccessLogin() {
  const [orderId, setOrderId] = useState("");
  const [nextPath, setNextPath] = useState("/academia/");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("next");
    const paidOrder = params.get("pedido");
    const timeout = window.setTimeout(() => {
      if (requested?.startsWith("/") && !requested.startsWith("//")) setNextPath(requested);
      if (paidOrder) setOrderId(paidOrder);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await activateMemberAccess(orderId.trim());
      window.location.assign(nextPath);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-card access-login" onSubmit={signIn}>
      <div className="order-title">
        <span className="cover-mini">AMI</span>
        <div><small>ACESSO DO ALUNO</small><h2>Academia Música IA</h2><p>Conteúdo exclusivo para compradores</p></div>
      </div>
      <label>
        Código do pedido
        <input
          required
          autoComplete="off"
          pattern="ami_[a-f0-9]{28}"
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
          placeholder="ami_..."
        />
      </label>
      {error ? <p className="checkout-error">{error}</p> : null}
      <button className="checkout-primary" disabled={loading}>
        {loading ? "Confirmando acesso…" : "Entrar na Academia"}
      </button>
      <a href="/suporte">Não encontrou seu código? Fale com o suporte →</a>
      <small>O acesso é liberado apenas para pedidos com pagamento confirmado.</small>
    </form>
  );
}
