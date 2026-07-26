"use client";

export const CHECKOUT_API = "https://fb9323mkb2.execute-api.us-east-1.amazonaws.com";

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
  document.cookie = `academia_access=${data.access.token}; Path=/; Max-Age=15552000; Secure; SameSite=Lax`;
  return data.access;
}
