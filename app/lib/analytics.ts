"use client";

import { getOrCreateAnalyticsSession } from "./analyticsSession";

const ANALYTICS_API = "https://fb9323mkb2.execute-api.us-east-1.amazonaws.com";
const ATTRIBUTION_KEY = "academia-musica-attribution";

type Attribution = {
  source: string;
  medium: string;
  campaign: string;
  referrer: string;
};

export type AnalyticsProperties = {
  placement?: string;
  journey?: string;
  step?: string;
  outcome?: string;
  product?: string;
};

function randomId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

export function getSessionId() {
  return getOrCreateAnalyticsSession(
    window.localStorage,
    Date.now(),
    () => randomId("ses"),
  );
}

export function getAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const incomingSource = params.get("utm_source");
  const incomingMedium = params.get("utm_medium");
  const incomingCampaign = params.get("utm_campaign");

  try {
    const stored = window.localStorage.getItem(ATTRIBUTION_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Attribution still works for the current page without storage.
  }

  let referrer = "";
  try {
    referrer = document.referrer ? new URL(document.referrer).hostname : "";
  } catch {
    referrer = "";
  }
  const attribution = {
    source: incomingSource || referrer || "direct",
    medium: incomingMedium || (referrer ? "referral" : "none"),
    campaign: incomingCampaign || "",
    referrer,
  };
  try {
    window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // Storage can be unavailable in private browsing.
  }
  return attribution;
}

export function getAnalyticsContext() {
  return {
    sessionId: getSessionId(),
    ...getAttribution(),
  };
}

export function trackEvent(
  name: string,
  path = window.location.pathname,
  properties: AnalyticsProperties = {},
) {
  const context = getAnalyticsContext();
  const payload = {
    eventId: randomId("evt"),
    name,
    path,
    ...context,
    ...properties,
  };
  void fetch(`${ANALYTICS_API}/v1/events`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Analytics must never block the buyer journey.
  });
}
