"use client";

import { transitionAuthenticatedWorkspace } from "./accountWorkspace";
import { clearAcademyPlayerSelection } from "./musicPlatform";

export const CHECKOUT_API = "https://fb9323mkb2.execute-api.us-east-1.amazonaws.com";
export const COGNITO_CLIENT_ID = "375mcuenagmq50eellircoljq6";
const COGNITO_ENDPOINT = "https://cognito-idp.us-east-1.amazonaws.com/";

function transitionMemberWorkspace(token = "") {
  clearAcademyPlayerSelection();
  try {
    transitionAuthenticatedWorkspace(window.localStorage, token);
  } catch {
    // The account transition must still complete when storage is unavailable.
  }
}

function getDeviceId() {
  const storageKey = "academia-free-device";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const created = crypto.randomUUID().replaceAll("-", "");
  window.localStorage.setItem(storageKey, created);
  return created;
}

async function cognitoRequest(target: string, body: Record<string, unknown>) {
  const response = await fetch(COGNITO_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/x-amz-json-1.1",
      "x-amz-target": `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = String(data.__type || "").split("#").pop() ?? "";
    const messages: Record<string, string> = {
      UsernameExistsException: "Este e-mail já possui uma conta. Entre com sua senha.",
      CodeMismatchException: "O código informado não confere.",
      ExpiredCodeException: "O código expirou. Solicite um novo.",
      NotAuthorizedException: "E-mail ou senha incorretos.",
      UserNotConfirmedException: "Confirme o código enviado ao seu e-mail.",
      InvalidPasswordException: "Use ao menos 8 caracteres, com maiúscula, minúscula e número.",
      TooManyRequestsException: "Muitas tentativas. Aguarde alguns minutos.",
    };
    const error = new Error(messages[code] || data.message || "Não foi possível concluir o acesso.");
    error.name = code || "CognitoError";
    throw error;
  }
  return data;
}

async function exchangeCognitoToken(idToken: string) {
  const response = await fetch(`${CHECKOUT_API}/v1/auth/exchange`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken, deviceId: getDeviceId() }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access?.token) {
    throw new Error(data.error || "Não foi possível abrir sua conta.");
  }
  setMemberAccess(data.access);
  return data;
}

function setMemberAccess(access: { token: string; expiresAt: string }) {
  transitionMemberWorkspace(access.token);
  const expiresAt = new Date(access.expiresAt).getTime();
  const maxAge = Number.isFinite(expiresAt)
    ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
    : 60 * 60 * 24 * 30;
  document.cookie = `academia_access=${encodeURIComponent(access.token)}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Strict`;
}

export async function registerFreeAccount(name: string, email: string, password: string) {
  return cognitoRequest("SignUp", {
    ClientId: COGNITO_CLIENT_ID,
    Username: email.trim().toLowerCase(),
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email.trim().toLowerCase() },
      { Name: "name", Value: name.trim() },
    ],
  });
}

export async function confirmFreeAccount(email: string, code: string) {
  return cognitoRequest("ConfirmSignUp", {
    ClientId: COGNITO_CLIENT_ID,
    Username: email.trim().toLowerCase(),
    ConfirmationCode: code.trim(),
  });
}

export async function resendFreeAccountCode(email: string) {
  return cognitoRequest("ResendConfirmationCode", {
    ClientId: COGNITO_CLIENT_ID,
    Username: email.trim().toLowerCase(),
  });
}

export async function loginFreeAccount(email: string, password: string) {
  const data = await cognitoRequest("InitiateAuth", {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: email.trim().toLowerCase(),
      PASSWORD: password,
    },
  });
  return exchangeCognitoToken(data.AuthenticationResult?.IdToken);
}

export async function requestFreePasswordReset(email: string) {
  return cognitoRequest("ForgotPassword", {
    ClientId: COGNITO_CLIENT_ID,
    Username: email.trim().toLowerCase(),
  });
}

export async function confirmFreePasswordReset(
  email: string,
  code: string,
  password: string,
) {
  return cognitoRequest("ConfirmForgotPassword", {
    ClientId: COGNITO_CLIENT_ID,
    Username: email.trim().toLowerCase(),
    ConfirmationCode: code.trim(),
    Password: password,
  });
}

export function getMemberAccessToken() {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("academia_access="));
  return cookie ? decodeURIComponent(cookie.slice("academia_access=".length)) : null;
}

export function clearMemberAccess() {
  transitionMemberWorkspace();
  document.cookie = "academia_access=; Path=/; Max-Age=0; Secure; SameSite=Strict";
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
  setMemberAccess(data.access);
  return data.access;
}
