"use client";

import { useEffect, useState } from "react";
import {
  META_CONSENT_KEY,
  META_PIXEL_ID,
  trackMetaEvent,
} from "../lib/metaPixel";

type Consent = "granted" | "denied" | null;

function readConsent(): Consent {
  try {
    const value = window.localStorage.getItem(META_CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function initializePixel() {
  if (window.fbq?.loaded) return;

  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue?.push(args);
  }) as NonNullable<typeof window.fbq>;

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/pt_BR/fbevents.js";
  script.dataset.metaPixel = META_PIXEL_ID;
  document.head.appendChild(script);

  window.fbq("init", META_PIXEL_ID);
  window.fbq("track", "PageView");
  if (window.location.pathname.startsWith("/checkout")) {
    trackMetaEvent("ViewContent", {
      content_name: "Projeto Música Presente",
      content_type: "product",
      value: 49.97,
      currency: "BRL",
    });
  }
}

export default function MetaPixel() {
  const [consent, setConsent] = useState<Consent>(null);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    if (stored === "granted") initializePixel();
    const timeout = window.setTimeout(() => {
      setConsent(stored);
      setInteractive(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  function chooseConsent(value: Exclude<Consent, null>) {
    try {
      window.localStorage.setItem(META_CONSENT_KEY, value);
    } catch {
      // The choice still applies to the current page when storage is unavailable.
    }
    setConsent(value);
    if (value === "granted") initializePixel();
  }

  if (consent !== null) return null;

  return (
    <aside
      className="cookie-consent"
      aria-label="Preferências de medição"
      data-interactive={interactive ? "true" : "false"}
    >
      <div>
        <strong>Sua privacidade importa.</strong>
        <p>
          Podemos usar a Meta para medir campanhas e melhorar os anúncios. Você
          escolhe se permite essa medição.{" "}
          <a href="/privacidade/">Ver política</a>
        </p>
      </div>
      <div className="cookie-actions">
        <button type="button" className="cookie-essential" onClick={() => chooseConsent("denied")}>
          Somente essenciais
        </button>
        <button type="button" className="cookie-allow" onClick={() => chooseConsent("granted")}>
          Permitir medição
        </button>
      </div>
    </aside>
  );
}
