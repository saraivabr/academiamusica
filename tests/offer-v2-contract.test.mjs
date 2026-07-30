import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("starter offer has one explicit commercial contract", async () => {
  const [frontend, backend] = await Promise.all([
    source("app/lib/musicProducts.ts"),
    source("infra/checkout/index.mjs"),
  ]);

  assert.match(frontend, /offerVersion: "music_present_v1"/);
  assert.match(frontend, /name: "Projeto Música Presente"/);
  assert.match(frontend, /priceCents: 4_997/);
  assert.match(frontend, /credits: 20/);
  assert.match(frontend, /creditsPerRound: 2/);
  assert.match(frontend, /paidRounds: 10/);
  assert.match(frontend, /versionsPerRound: 2/);

  assert.match(backend, /const CURRENT_OFFER_VERSION = "music_present_v1"/);
  assert.match(backend, /name: "Projeto Música Presente"/);
  assert.match(backend, /value: 4_997/);
  assert.match(backend, /credits: 20/);
  assert.match(backend, /creditsPerRound: 2/);
  assert.match(backend, /paidRounds: 10/);
  assert.match(backend, /versionsPerRound: 2/);
  assert.match(backend, /const product = MUSIC_PRODUCTS\[order\.productId\] \?\? STARTER_PRODUCT/);
  assert.match(backend, /paidRounds: product\.paidRounds/);
});

test("public acquisition sells a free creative preview, not a free full song", async () => {
  const [home, metadata, checkout, checkoutClient, terms] = await Promise.all([
    source("app/components/HomePage.tsx"),
    source("app/page.tsx"),
    source("app/checkout/page.tsx"),
    source("app/checkout/CheckoutClient.tsx"),
    source("app/termos/page.tsx"),
  ]);
  const publicOffer = [home, metadata, checkout, checkoutClient, terms].join("\n");

  assert.match(home, /Começar minha prévia grátis/);
  assert.match(home, /R\$ 49,97/);
  assert.match(home, /\/preview\?/);
  assert.match(checkout, /CheckoutClient/);
  assert.match(checkoutClient, /20 créditos musicais/);
  assert.match(checkoutClient, /10 rodadas pagas/);
  assert.match(checkoutClient, /até 2 versões por rodada/i);
  assert.match(terms, /prévia criativa/i);
  assert.match(terms, /20 créditos musicais/i);
  assert.doesNotMatch(publicOffer, /música gr[aá]tis por dia/i);
  assert.doesNotMatch(publicOffer, /uma música gr[aá]tis todos os dias/i);
  assert.doesNotMatch(publicOffer, /Criar minha conta grátis/i);
  assert.doesNotMatch(publicOffer, /R\$0/);
  assert.doesNotMatch(publicOffer, /20 músicas incluídas/i);
});

test("new frontend negotiates Offer V2 while the public legacy frontend stays compatible", async () => {
  const [access, backend, deploy] = await Promise.all([
    source("app/lib/access.ts"),
    source("infra/checkout/index.mjs"),
    source("infra/deploy-checkout.sh"),
  ]);

  assert.match(backend, /LEGACY_DAILY_FREE_END_AT/);
  assert.match(access, /offerVersion: "music_present_v1"/);
  assert.match(backend, /const requestedOfferVersion = body\.offerVersion === CURRENT_OFFER_VERSION/);
  assert.match(backend, /offerVersion: item\.offerVersion\?\.S/);
  assert.match(backend, /offerVersion: \{ S: CURRENT_OFFER_VERSION \}/);
  assert.match(backend, /dailyBenefitEndsAt: \{ S: LEGACY_DAILY_FREE_END_AT \}/);
  assert.match(backend, /function dailyFreeEligible\(order/);
  assert.match(backend, /order\.offerVersion === CURRENT_OFFER_VERSION/);
  assert.match(backend, /if \(!dailyFreeEligible\(order\)\)/);
  assert.match(deploy, /LEGACY_DAILY_FREE_END_AT.*2026-08-06T03:00:00\.000Z/);
});

test("partial delivery returns the missing credit exactly once", async () => {
  const backend = await source("infra/checkout/index.mjs");

  assert.match(backend, /async function settleSuccessfulSunoCredits/);
  assert.match(backend, /attribute_not_exists\(creditsSettledAt\)/);
  assert.match(backend, /ADD musicCreditsBalance :returned/);
  assert.match(backend, /creditsSettledAt = :settledAt/);
  assert.match(backend, /creditsReturned/);
  assert.match(backend, /accountCreditsBalance\(order\) \+ creditsReturned/);
});

test("Offer V2 funnel measures preview through delivered music", async () => {
  const [backend, analytics, report] = await Promise.all([
    source("infra/checkout/index.mjs"),
    source("app/lib/analytics.ts"),
    source("infra/funnel-report.mjs"),
  ]);

  for (const event of [
    "story_started",
    "preview_completed",
    "checkout_started",
    "pix_created",
    "purchase_confirmed",
    "access_activated",
    "paid_generation_started",
    "music_generation_delivered",
    "music_result_played",
    "music_downloaded",
  ]) {
    assert.match(`${backend}\n${analytics}\n${report}`, new RegExp(event));
  }
});

test("Offer V2 keeps the one-time Pix payment inside musicacom.ia", async () => {
  const [checkoutClient, creditsPage, backend] = await Promise.all([
    source("app/checkout/CheckoutClient.tsx"),
    source("app/biblioteca/creditos/page.tsx"),
    source("infra/checkout/index.mjs"),
  ]);

  assert.match(checkoutClient, /PIX GERADO NA MÚSICA\.COM\.IA/);
  assert.match(checkoutClient, /Escaneie o QR Code/);
  assert.match(checkoutClient, /Copiar código Pix/);
  assert.match(checkoutClient, /Aguardando confirmação/);
  assert.doesNotMatch(checkoutClient, /paymentLinkUrl/);
  assert.doesNotMatch(checkoutClient, /href=\{order\.paymentLinkUrl\}/);
  assert.doesNotMatch(checkoutClient, /abrir a página segura da Woovi/i);
  assert.match(
    backend,
    /purchaseType === "subscription" && order\.paymentLinkUrl/,
  );
  assert.match(
    creditsPage,
    /order\.purchaseType === "subscription" && order\.paymentLinkUrl/,
  );
});
