"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  activateMemberAccess,
  confirmFreePasswordReset,
  confirmFreeAccount,
  loginFreeAccount,
  registerFreeAccount,
  requestFreePasswordReset,
  resendFreeAccountCode,
} from "../lib/access";

type Mode = "login" | "register" | "confirm" | "forgot" | "reset" | "legacy";
const defaultNextPath = "/biblioteca/gerador/";

function safeNextPath(value: string | null) {
  if (!value) return defaultNextPath;
  try {
    const destination = new URL(value, window.location.origin);
    const allowed = destination.pathname === "/academia"
      || destination.pathname.startsWith("/academia/")
      || destination.pathname === "/biblioteca"
      || destination.pathname.startsWith("/biblioteca/");
    return destination.origin === window.location.origin && allowed
      ? `${destination.pathname}${destination.search}${destination.hash}`
      : defaultNextPath;
  } catch {
    return defaultNextPath;
  }
}

export default function AccessLogin() {
  const [mode, setMode] = useState<Mode>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [orderId, setOrderId] = useState("");
  const [nextPath, setNextPath] = useState(defaultNextPath);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("next");
    const requestedMode = params.get("mode");
    const timer = window.setTimeout(() => {
      setNextPath(safeNextPath(requested));
      if (requestedMode === "login") setMode("login");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setNotice("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (mode === "register") {
        await registerFreeAccount(name, email, password);
        setMode("confirm");
        setNotice("Enviamos um código de 6 números para o seu e-mail.");
        return;
      }
      if (mode === "confirm") {
        await confirmFreeAccount(email, code);
        await loginFreeAccount(email, password);
        window.location.assign(nextPath);
        return;
      }
      if (mode === "forgot") {
        await requestFreePasswordReset(email);
        setMode("reset");
        setNotice("Enviamos um código para você criar uma nova senha.");
        return;
      }
      if (mode === "reset") {
        await confirmFreePasswordReset(email, code, password);
        setMode("login");
        setNotice("Senha atualizada. Agora você já pode entrar.");
        return;
      }
      if (mode === "legacy") {
        await activateMemberAccess(orderId.trim());
        window.location.assign(nextPath);
        return;
      }
      await loginFreeAccount(email, password);
      window.location.assign(nextPath);
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === "UserNotConfirmedException") {
        setMode("confirm");
        setNotice("Confirme o código que enviamos ao seu e-mail.");
        return;
      }
      setError(requestError instanceof Error ? requestError.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-card access-login">
      <div className="login-mode-tabs" role="tablist" aria-label="Escolha como acessar">
        <button type="button" className={mode === "register" || mode === "confirm" ? "active" : ""} onClick={() => changeMode("register")}>
          Criar conta grátis
        </button>
        <button type="button" className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>
          Entrar
        </button>
      </div>

      <form onSubmit={submit}>
        <div className="order-title">
          <span className="cover-mini">AMI</span>
          <div>
            <small>{mode === "register" || mode === "confirm" ? "COMECE SEM PAGAR" : "BEM-VINDO DE VOLTA"}</small>
            <h2>{mode === "confirm"
              ? "Confirme seu e-mail"
              : mode === "forgot" || mode === "reset"
                ? "Recupere sua senha"
                : "Academia Música IA"}</h2>
            <p>Uma música grátis todos os dias</p>
          </div>
        </div>

        {mode === "register" ? (
          <label>
            Seu nome
            <input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Como podemos chamar você?" />
          </label>
        ) : null}

        {mode !== "legacy" ? (
          <label>
            Seu e-mail
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" disabled={mode === "confirm" || mode === "reset"} />
          </label>
        ) : null}

        {mode !== "legacy" && mode !== "forgot" ? (
          <label>
            Sua senha
            <input required type="password" minLength={8} autoComplete={mode === "register" || mode === "reset" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8+ caracteres, maiúscula e número" disabled={mode === "confirm"} />
          </label>
        ) : null}

        {mode === "confirm" || mode === "reset" ? (
          <label>
            Código recebido
            <input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" />
          </label>
        ) : null}

        {mode === "legacy" ? (
          <label>
            Código do pedido antigo
            <input required autoComplete="off" pattern="ami_[a-f0-9]{28}" value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="ami_..." />
          </label>
        ) : null}

        {notice ? <p className="login-notice">{notice}</p> : null}
        {error ? <p className="checkout-error">{error}</p> : null}

        <button className="checkout-primary" disabled={loading}>
          {loading
            ? "Só um instante…"
            : mode === "register"
              ? "Criar minha conta grátis"
              : mode === "confirm"
                ? "Confirmar e criar minha música"
                : mode === "forgot"
                  ? "Enviar código de recuperação"
                  : mode === "reset"
                    ? "Salvar nova senha"
                : mode === "legacy"
                  ? "Entrar com código"
                  : "Entrar na plataforma"}
        </button>

        {mode === "confirm" ? (
          <button
            type="button"
            className="login-text-action"
            onClick={() => void resendFreeAccountCode(email).then(() => setNotice("Enviamos um novo código.")).catch((reason) => setError(reason.message))}
          >
            Reenviar código
          </button>
        ) : null}
        {mode === "login" ? (
          <button type="button" className="login-text-action" onClick={() => changeMode("forgot")}>
            Esqueci minha senha
          </button>
        ) : null}
        {mode === "forgot" || mode === "reset" ? (
          <button type="button" className="login-text-action" onClick={() => changeMode("login")}>
            Voltar ao login
          </button>
        ) : null}
      </form>

      <button type="button" className="login-legacy-toggle" onClick={() => changeMode(mode === "legacy" ? "login" : "legacy")}>
        {mode === "legacy" ? "Voltar ao login por e-mail" : "Já comprou antes? Entrar com código do pedido"}
      </button>
      <small>Um e-mail por conta. Contas gratuitas são protegidas por limites de dispositivo e rede.</small>
    </section>
  );
}
