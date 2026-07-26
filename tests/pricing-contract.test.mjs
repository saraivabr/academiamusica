import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("starter price and credit grant stay aligned across frontend and backend", async () => {
  const [frontend, backend, checkoutHtml] = await Promise.all([
    source("app/lib/musicProducts.ts"),
    source("infra/checkout/index.mjs"),
    source("dist/client/checkout/index.html"),
  ]);

  assert.match(frontend, /id: "starter_20"[\s\S]*?priceCents: 4_997[\s\S]*?credits: 20/);
  assert.match(backend, /starter_20:[\s\S]*?value: 4_997[\s\S]*?credits: 20/);
  assert.match(checkoutHtml, /20 músicas incluídas/);
  assert.match(checkoutHtml, /R\$49,97/);
  assert.doesNotMatch(checkoutHtml, /R\$197/);
});

test("recharges and Pix Automatic subscription have matching live catalogs", async () => {
  const [frontend, backend, creditsHtml] = await Promise.all([
    source("app/lib/musicProducts.ts"),
    source("infra/checkout/index.mjs"),
    source("dist/client/biblioteca/creditos/index.html"),
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

test("mobile purchase flow keeps checkout and five destinations usable", async () => {
  const [globals, experience, confirmation] = await Promise.all([
    source("app/globals.css"),
    source("app/spotify-experience.css"),
    source("app/obrigado/PurchaseConfirmation.tsx"),
  ]);

  assert.match(globals, /\.checkout-page>\.checkout-card\{order:-1\}/);
  assert.match(experience, /grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(confirmation, /`purchase_\$\{orderId\}`/);
  assert.match(confirmation, /history\.replaceState/);
});
