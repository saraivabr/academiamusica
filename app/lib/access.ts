"use client";

export const CHECKOUT_API = "https://fb9323mkb2.execute-api.us-east-1.amazonaws.com";

export function getMemberAccessToken() {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("academia_access="));
  return cookie ? decodeURIComponent(cookie.slice("academia_access=".length)) : null;
}

export async function memberApi(path: string, init: RequestInit = {}) {
  const token = getMemberAccessToken();
  if (!token) throw new Error("Sua sessão expirou. Entre novamente na Academia.");
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  headers.set("authorization", `Bearer ${token}`);

  const response = await fetch(`${CHECKOUT_API}${path}`, {
    ...init,
    headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Não foi possível concluir esta operação.");
  }
  return data;
}

export async function activateMemberAccess(orderId: string) {
  const response = await fetch(`${CHECKOUT_API}/v1/access/claim`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const data = await response.json();
  if (!response.ok || !data.access?.token) {
    throw new Error(data.error || "Não foi possível liberar o acesso.");
  }
  const expiresAt = new Date(data.access.expiresAt).getTime();
  const maxAge = Number.isFinite(expiresAt)
    ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
    : 60 * 60 * 24 * 180;
  document.cookie = `academia_access=${encodeURIComponent(data.access.token)}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Strict`;
  return data.access;
}
