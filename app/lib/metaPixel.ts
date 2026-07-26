"use client";

export const META_PIXEL_ID = "833452152593243";
export const META_CONSENT_KEY = "academia-meta-consent";

type MetaEventParameters = Record<string, string | number | boolean>;

type MetaPixelFunction = {
  (
    action: string,
    eventOrPixelId: string,
    parameters?: MetaEventParameters,
    options?: { eventID?: string },
  ): void;
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push?: MetaPixelFunction;
  queue?: unknown[];
  version?: string;
};

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}

export function hasMetaConsent() {
  try {
    return window.localStorage.getItem(META_CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

export function trackMetaEvent(
  name: string,
  parameters: MetaEventParameters = {},
  eventId?: string,
) {
  if (!hasMetaConsent() || !window.fbq) return;
  window.fbq("track", name, parameters, eventId ? { eventID: eventId } : undefined);
}
