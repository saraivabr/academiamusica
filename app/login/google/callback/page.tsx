"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicShell } from "../../../components/Portal";
import { completeGoogleLogin } from "../../../lib/access";
import styles from "../../login.module.css";

type CallbackState = "connecting" | "error";

export default function GoogleCallback() {
  const [state, setState] = useState<CallbackState>("connecting");
  const [message, setMessage] = useState("Validando sua conta com segurança.");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code") || "";
    const returnedState = params.get("state") || "";
    const providerError = params.get("error_description") || params.get("error");

    if (providerError || !code) {
      const timer = window.setTimeout(() => {
        setState("error");
        setMessage(
          providerError
            ? "O acesso pelo Google foi cancelado ou não pôde ser concluído."
            : "O Google não devolveu uma autorização válida.",
        );
      }, 0);
      return () => window.clearTimeout(timer);
    }

    void completeGoogleLogin(code, returnedState)
      .then((nextPath) => window.location.replace(nextPath))
      .catch((reason) => {
        setState("error");
        setMessage(
          reason instanceof Error
            ? reason.message
            : "Não foi possível concluir o acesso com Google.",
        );
      });
  }, []);

  return (
    <PublicShell compact>
      <main className={styles.googleCallback}>
        <div className={styles.callbackDisc} aria-hidden="true">
          <span>♫</span>
        </div>
        <span className={styles.cardEyebrow}>
          {state === "connecting" ? "ABRINDO SEU ESTÚDIO" : "ACESSO NÃO CONCLUÍDO"}
        </span>
        <h1>
          {state === "connecting"
            ? "Conectando seu som."
            : "Vamos tentar de novo."}
        </h1>
        <p role={state === "error" ? "alert" : "status"}>{message}</p>
        {state === "connecting" ? (
          <div className={styles.callbackProgress} aria-label="Conectando">
            <i /><i /><i />
          </div>
        ) : (
          <Link className={styles.callbackReturn} href="/login/?mode=login">
            Voltar para entrar
          </Link>
        )}
      </main>
    </PublicShell>
  );
}
