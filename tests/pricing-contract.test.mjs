import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("public checkout sells the approved starter contract", async () => {
  const [frontend, backend, checkoutHtml] = await Promise.all([
    source("app/lib/musicProducts.ts"),
    source("infra/checkout/index.mjs"),
    source("out/checkout/index.html"),
  ]);

  assert.match(frontend, /id: "starter_20"[\s\S]*?priceCents: 4_997[\s\S]*?credits: 20/);
  assert.match(backend, /starter_20:[\s\S]*?value: 4_997[\s\S]*?credits: 20/);
  assert.match(checkoutHtml, /Projeto Música Presente/);
  assert.match(checkoutHtml, /20 créditos musicais/);
  assert.match(checkoutHtml, /10 rodadas pagas/);
  assert.match(checkoutHtml, /R\$<\/small>49,97/);
  assert.doesNotMatch(checkoutHtml, /música grátis por dia/i);
  assert.doesNotMatch(checkoutHtml, /R\$197/);
});

test("recharges and Pix Automatic subscription have matching live catalogs", async () => {
  const [frontend, backend, creditsHtml] = await Promise.all([
    source("app/lib/musicProducts.ts"),
    source("infra/checkout/index.mjs"),
    source("out/biblioteca/creditos/index.html"),
  ]);
  const contracts = [
    ["recharge_20", "4_997", "20"],
    ["recharge_50", "10_997", "50"],
    ["recharge_100", "19_997", "100"],
    ["club_60", "9_997", "60"],
  ];

  for (const [id, price, credits] of contracts) {
    const pattern = new RegExp(`${id}:[\\s\\S]*?value: ${price}[\\s\\S]*?credits: ${credits}`);
    assert.match(backend, pattern);
    assert.match(frontend, new RegExp(`id: "${id}"[\\s\\S]*?priceCents: ${price}[\\s\\S]*?credits: ${credits}`));
  }
  assert.match(creditsHtml, /Pix Automático/);
  assert.match(creditsHtml, /Sem renovação automática/);
});

test("crediting is idempotent and music generation keeps model V5", async () => {
  const backend = await source("infra/checkout/index.mjs");
  assert.match(backend, /TransactWriteItemsCommand/);
  assert.match(backend, /music_subscription_payment_/);
  assert.match(backend, /ConditionExpression: "attribute_not_exists\(id\)"/);
  assert.match(backend, /const MUSIC_MODEL = "V5"/);
  assert.doesNotMatch(backend, /PRICE_CENTS/);
});

test("paid recharges and subscription installments use verified atomic crediting", async () => {
  const backend = await source("infra/checkout/index.mjs");

  assert.match(backend, /providerCompleted[\s\S]*?verifiedData[\s\S]*?await markPaid\(orderId, verifiedData\.charge \?\? verifiedData\)/);
  assert.match(backend, /subscriptionId = stored\.subscriptionGlobalId \|\| orderId/);
  assert.match(backend, /subscriptions\/\$\{encodeURIComponent\(subscriptionId\)\}\/installments/);
  assert.match(backend, /Mensalidade não localizada no provedor/);
  assert.match(backend, /attribute_not_exists\(creditsAppliedAt\)/);
  assert.doesNotMatch(backend, /#status <> :paid OR attribute_not_exists\(creditsAppliedAt\)/);
});

test("mobile purchase flow keeps checkout and four primary destinations usable", async () => {
  const [globals, experience, confirmation] = await Promise.all([
    source("app/globals.css"),
    source("app/spotify-experience.css"),
    source("app/obrigado/PurchaseConfirmation.tsx"),
  ]);

  assert.match(globals, /\.checkout-page\s*>\s*\.checkout-card\s*\{\s*order:\s*-1\s*\}/);
  assert.match(experience, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(confirmation, /`purchase_\$\{orderId\}`/);
  assert.match(confirmation, /history\.replaceState/);
});

test("Offer V2 account uses verified email and privacy-safe abuse controls", async () => {
  const [backend, access, homeHtml] = await Promise.all([
    source("infra/checkout/index.mjs"),
    source("app/lib/access.ts"),
    source("out/index.html"),
  ]);

  assert.match(access, /AWSCognitoIdentityProviderService\.\$\{target\}/);
  assert.match(access, /ConfirmSignUp/);
  assert.match(backend, /verifyCognitoIdToken/);
  assert.match(backend, /path === "\/v1\/auth\/exchange"/);
  assert.match(backend, /status: \{ S: "FREE" \}/);
  assert.match(backend, /offerVersion: \{ S: CURRENT_OFFER_VERSION \}/);
  assert.match(backend, /free_account_device/);
  assert.match(backend, /free_account_ip_window/);
  assert.match(homeHtml, /Prévia criativa grátis/i);
  assert.doesNotMatch(homeHtml, /música grátis por dia/i);
  assert.doesNotMatch(backend, /macAddress|rawIp/);
});

test("every generation is paid in credits, with no daily free benefit left", async () => {
  const [backend, creator, deploy] = await Promise.all([
    source("infra/checkout/index.mjs"),
    source("app/biblioteca/gerador/page.tsx"),
    source("infra/deploy-checkout.sh"),
  ]);
  const surface = `${backend}\n${creator}\n${deploy}`;

  assert.match(backend, /reservationType !== "CREDITS"/);
  assert.match(backend, /allTracks\.slice\(0, trackLimit\)/);
  assert.match(creator, /reservationType: "CREDITS"/);
  assert.doesNotMatch(surface, /FREE_DAILY|free_daily|dailyFree|freeDaily|LEGACY_DAILY_FREE_END_AT|dailyBenefitEndsAt/);
});

test("login redirect and Cognito key rotation are hardened", async () => {
  const [login, backend, deploy] = await Promise.all([
    source("app/login/AccessLogin.tsx"),
    source("infra/checkout/index.mjs"),
    source("infra/deploy-checkout.sh"),
  ]);

  assert.match(login, /destination\.origin === window\.location\.origin/);
  assert.match(login, /destination\.pathname\.startsWith\("\/biblioteca\/"\)/);
  assert.match(backend, /cognitoJwks\(issuer, true\)/);
  assert.match(backend, /cachedCognitoJwksFetchedAt/);
  assert.match(backend, /cachedCognitoJwksForcedRefreshAt/);
  assert.match(deploy, /EXPECTED_COGNITO_CLIENT_ID/);
});

test("Google login uses Cognito authorization code with PKCE and state", async () => {
  const [access, login, callback, deploy] = await Promise.all([
    readFile(new URL("../app/lib/access.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/login/AccessLogin.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/login/google/callback/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../infra/configure-cognito-auth.sh", import.meta.url), "utf8"),
  ]);

  assert.match(login, /Continuar com Google/);
  assert.match(access, /code_challenge_method: "S256"/);
  assert.match(access, /returnedState !== session\.state/);
  assert.match(access, /grant_type: "authorization_code"/);
  assert.match(callback, /completeGoogleLogin/);
  assert.match(deploy, /SupportedIdentityProviders = \["COGNITO", "Google"\]/);
  assert.match(deploy, /AllowedOAuthFlows = \["code"\]/);
});
