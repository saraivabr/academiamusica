"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  activateMemberAccess,
  beginGoogleLogin,
  confirmFreePasswordReset,
  confirmFreeAccount,
  GOOGLE_AUTH_ENABLED,
  loginFreeAccount,
  registerFreeAccount,
  requestFreePasswordReset,
  resendFreeAccountCode,
} from "../lib/access";
import { trackEvent } from "../lib/analytics";
import styles from "./login.module.css";

type Mode = "login" | "register" | "confirm" | "forgot" | "reset" | "legacy";
const defaultNextPath = "/biblioteca/gerador/";

const modeContent: Record<Mode, { eyebrow: string; title: string; description: string }> = {
  register: {
    eyebrow: "SALVE SEU PROJETO",
    title: "Abra seu estúdio.",
    description: "Entre para preservar sua direção criativa, acompanhar o pagamento e acessar suas músicas.",
  },
  login: {
    eyebrow: "BEM-VINDO DE VOLTA",
    title: "Continue seu som.",
    description: "Entre para criar, ouvir e organizar suas músicas.",
  },
  confirm: {
    eyebrow: "ÚLTIMO PASSO",
    title: "Confirme seu e-mail.",
    description: "Digite o código de 6 números que acabamos de enviar.",
  },
  forgot: {
    eyebrow: "RECUPERAR ACESSO",
    title: "Vamos encontrar sua conta.",
    description: "Informe seu e-mail para receber um código de recuperação.",
  },
  reset: {
    eyebrow: "NOVA SENHA",
    title: "Proteja seu estúdio.",
    description: "Use o código recebido e escolha uma nova senha.",
  },
  legacy: {
    eyebrow: "ACESSO DE CLIENTE",
    title: "Já comprou antes?",
    description: "Use o código do seu pedido para recuperar seu acesso.",
  },
};

function safeNextPath(value: string | null) {
  if (!value) return defaultNextPath;
  try {
    const destination = new URL(value, window.location.origin);
    const allowed = destination.pathname === "/biblioteca"
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
  const [showPassword, setShowPassword] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("next");
    const requestedMode = params.get("mode");
    const timer = window.setTimeout(() => {
      setNextPath(safeNextPath(requested));
      if (requestedMode === "login") setMode("login");
      setInteractive(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setPassword("");
    setCode("");
    setShowPassword(false);
    setError("");
    setNotice("");
  }

  async function resendCode() {
    setError("");
    setNotice("");
    try {
      await resendFreeAccountCode(email);
      setNotice("Novo código enviado. Confira também a caixa de spam.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível reenviar o código.");
    }
  }

  async function loginWithGoogle() {
    setError("");
    setGoogleLoading(true);
    trackEvent("auth_google_started", window.location.pathname, {
      placement: mode,
    });
    try {
      await beginGoogleLogin(nextPath);
    } catch (reason) {
      setGoogleLoading(false);
      setError(reason instanceof Error ? reason.message : "Não foi possível abrir o Google.");
    }
  }

  const content = modeContent[mode];
  const isPrimaryMode = mode === "register" || mode === "login";
  const passwordChecks = [
    { label: "8 caracteres", valid: password.length >= 8 },
    { label: "letra maiúscula", valid: /[A-Z]/.test(password) },
    { label: "letra minúscula", valid: /[a-z]/.test(password) },
    { label: "um número", valid: /\d/.test(password) },
  ];
  const submitLabel = mode === "register"
    ? "Criar minha conta"
    : mode === "confirm"
      ? "Confirmar e começar"
      : mode === "forgot"
        ? "Enviar código"
        : mode === "reset"
          ? "Salvar nova senha"
          : mode === "legacy"
            ? "Recuperar meu acesso"
            : "Entrar na plataforma";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (mode === "register") {
        trackEvent("auth_email_started", window.location.pathname, {
          placement: "register",
        });
        await registerFreeAccount(name, email, password);
        setShowPassword(false);
        setMode("confirm");
        setNotice("Enviamos um código de 6 números para o seu e-mail.");
        return;
      }
      if (mode === "confirm") {
        await confirmFreeAccount(email, code);
        await loginFreeAccount(email, password);
        trackEvent("auth_email_completed", window.location.pathname, {
          outcome: "register",
        });
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
        setPassword("");
        setCode("");
        setShowPassword(false);
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
      trackEvent("auth_email_completed", window.location.pathname, {
        outcome: "login",
      });
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
    <div className={styles.accessCard}>
      {isPrimaryMode ? (
        <div className={styles.modeTabs} role="group" aria-label="Escolha como acessar">
          <button
            type="button"
            aria-pressed={mode === "register"}
            className={mode === "register" ? styles.activeTab : ""}
            onClick={() => changeMode("register")}
          >
            Criar conta
          </button>
          <button
            type="button"
            aria-pressed={mode === "login"}
            className={mode === "login" ? styles.activeTab : ""}
            onClick={() => changeMode("login")}
          >
            Já tenho conta
          </button>
        </div>
      ) : (
        <button type="button" className={styles.backButton} onClick={() => changeMode("login")}>
          <span aria-hidden="true">←</span> Voltar para entrar
        </button>
      )}

      <header className={styles.cardHeader}>
        <span className={styles.cardEyebrow}>{content.eyebrow}</span>
        <h2>{content.title}</h2>
        <p>{content.description}</p>
        {mode === "confirm" || mode === "reset" ? (
          <span className={styles.emailBadge}>{email}</span>
        ) : null}
      </header>

      {isPrimaryMode && GOOGLE_AUTH_ENABLED ? (
        <>
          <button
            type="button"
            className={styles.googleButton}
            disabled={googleLoading || loading}
            onClick={() => void loginWithGoogle()}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.19-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
              <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.6 0-4.81-1.76-5.6-4.13H3.05v2.62A10 10 0 0 0 12 22Z" />
              <path fill="#FBBC05" d="M6.4 13.93A6 6 0 0 1 6.09 12c0-.67.11-1.32.31-1.93V7.45H3.05A10 10 0 0 0 2 12c0 1.64.39 3.19 1.05 4.55l3.35-2.62Z" />
              <path fill="#EA4335" d="M12 5.94c1.47 0 2.78.5 3.82 1.49l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.95 5.45l3.35 2.62C7.19 7.7 9.4 5.94 12 5.94Z" />
            </svg>
            <span>{googleLoading ? "Abrindo o Google…" : "Continuar com Google"}</span>
          </button>
          <div className={styles.accessDivider}><span>ou use seu e-mail</span></div>
        </>
      ) : null}

      <form
        className={styles.accessForm}
        data-interactive={interactive ? "true" : "false"}
        onSubmit={submit}
      >

        {mode === "register" ? (
          <label className={styles.field}>
            <span>Como podemos chamar você?</span>
            <input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" />
          </label>
        ) : null}

        {mode !== "legacy" ? (
          <label className={styles.field}>
            <span>Seu melhor e-mail</span>
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" disabled={mode === "confirm" || mode === "reset"} />
          </label>
        ) : null}

        {mode !== "legacy" && mode !== "forgot" ? (
          <div className={styles.passwordField}>
            <label className={styles.field}>
              <span>{mode === "reset" ? "Crie uma nova senha" : "Sua senha"}</span>
              <span className={styles.passwordInput}>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  autoComplete={mode === "register" || mode === "reset" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                  disabled={mode === "confirm"}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((visible) => !visible)}
                  disabled={mode === "confirm"}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </span>
            </label>
            {mode === "register" || mode === "reset" ? (
              <div className={styles.passwordChecks} aria-label="Requisitos da senha">
                {passwordChecks.map((check) => (
                  <span key={check.label} className={check.valid ? styles.validCheck : ""}>
                    <i aria-hidden="true">{check.valid ? "✓" : "○"}</i> {check.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {mode === "confirm" || mode === "reset" ? (
          <label className={`${styles.field} ${styles.codeField}`}>
            <span>Código recebido</span>
            <input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" />
          </label>
        ) : null}

        {mode === "legacy" ? (
          <label className={styles.field}>
            Código do pedido antigo
            <input required autoComplete="off" pattern="ami_[a-f0-9]{28}" value={orderId} onChange={(event) => setOrderId(event.target.value)} placeholder="ami_..." />
          </label>
        ) : null}

        {notice ? <p className={styles.notice} role="status"><span aria-hidden="true">✓</span>{notice}</p> : null}
        {error ? <p className={styles.error} role="alert"><span aria-hidden="true">!</span>{error}</p> : null}

        <button className={styles.primaryButton} disabled={loading}>
          {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
          <span>{loading ? "Abrindo seu estúdio…" : submitLabel}</span>
          {!loading ? <b aria-hidden="true">→</b> : null}
        </button>

        {mode === "confirm" ? (
          <button
            type="button"
            className={styles.textAction}
            onClick={() => void resendCode()}
          >
            Não recebeu? <strong>Reenviar código</strong>
          </button>
        ) : null}
        {mode === "login" ? (
          <button type="button" className={styles.textAction} onClick={() => changeMode("forgot")}>
            Esqueci minha senha
          </button>
        ) : null}
        {mode === "forgot" || mode === "reset" ? (
          <p className={styles.recoveryHint}>O código expira por segurança. Se precisar, solicite outro.</p>
        ) : null}
      </form>

      {mode !== "confirm" && mode !== "reset" && mode !== "forgot" ? (
        <div className={styles.legacyAccess}>
          <span>Comprou na versão anterior?</span>
          <button type="button" onClick={() => changeMode(mode === "legacy" ? "login" : "legacy")}>
            {mode === "legacy" ? "Entrar com e-mail" : "Usar código do pedido"}
          </button>
        </div>
      ) : null}

      <p className={styles.privacyNote}>
        Ao continuar, você concorda com o uso seguro do acesso para proteger sua conta, seus créditos e seus projetos.
      </p>
    </div>
  );
}
