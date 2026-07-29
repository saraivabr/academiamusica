import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  authenticatedWorkspaceKeys,
  authenticatedWorkspaceOwnerKey,
  transitionAuthenticatedWorkspace,
} from "../app/lib/accountWorkspace.js";

test("renders finished production metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>Gerador de Música com IA Grátis \| musicacom\.ia<\/title>/i);
  assert.match(html, /<meta[^>]+property=["']og:title["'][^>]+Gerador de Música com IA Grátis/i);
  assert.match(html, /<meta[^>]+property=["']og:image["'][^>]+musicacom\.ia\.br\/og-musicacom-ia\.jpg/i);
  assert.match(html, /Uma história sua\./i);
  assert.match(html, /DA SUA HISTÓRIA AO PLAY/i);
  assert.match(html, /O aprendizado acontece dentro da própria plataforma/i);
  assert.match(html, /"@type":"SoftwareApplication"/i);
  assert.match(html, /"price":"0"/i);
  assert.match(
    html,
    /<audio[^>]+academia-musica-ia-trap-jingle\.mp3[^>]+preload=["']none["']/i,
  );
  assert.doesNotMatch(html, /cada rodada extra usa dois créditos/i);
  assert.doesNotMatch(html, /Quero conversar e criar/i);
  assert.doesNotMatch(html, /Produtor IA/i);
  assert.doesNotMatch(html, /codex-preview/i);
});

test("publishes crawl instructions and only important public URLs", async () => {
  const [robots, sitemap, manifestSource] = await Promise.all([
    readFile(new URL("../public/robots.txt", import.meta.url), "utf8"),
    readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
  ]);
  const manifest = JSON.parse(manifestSource);

  assert.match(robots, /Sitemap: https:\/\/musicacom\.ia\.br\/sitemap\.xml/i);
  assert.match(sitemap, /https:\/\/musicacom\.ia\.br\/<\/loc>/i);
  assert.match(sitemap, /https:\/\/musicacom\.ia\.br\/suporte\/<\/loc>/i);
  assert.doesNotMatch(sitemap, /\/login\/|\/checkout\/|\/biblioteca\//i);
  assert.equal(manifest.lang, "pt-BR");
  assert.equal(manifest.theme_color, "#04e688");
});

test("renders the single-route music creator without the conversational studio", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `express-${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/biblioteca/gerador/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /ROTA DE CRIAÇÃO/i);
  assert.match(html, /Sua música, passo a passo\./i);
  assert.match(html, /PASSO[\s\S]{0,30}1[\s\S]{0,30}DE[\s\S]{0,30}5/i);
  assert.match(html, /O que você quer criar\?/i);
  assert.doesNotMatch(html, /Qual é a sua ideia\?/i);
  assert.doesNotMatch(html, /Crie sua música em uma conversa/i);
  assert.doesNotMatch(html, /Produtor IA está pensando/i);
});

test("renders the redesigned studio access with a clear free path", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `login-${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/login/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Uma ideia hoje\./i);
  assert.match(html, /Uma música sua\./i);
  assert.match(html, /Abra seu estúdio\./i);
  assert.match(html, /Criar minha conta grátis/i);
  assert.match(html, /Continuar com Google/i);
  assert.match(html, /Não precisa de cartão/i);
  assert.match(html, /Usar código do pedido/i);
  assert.match(html, /href=["']\/login\?mode=login["']/i);
});

test("keeps an early track selection until the lazy player is mounted", async () => {
  const [platformSource, playerSource] = await Promise.all([
    readFile(new URL("../app/lib/musicPlatform.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AcademyPlayer.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(
    platformSource,
    /localStorage\.setItem\(academyPlayerPendingStorageKey,\s*["']1["']\)/,
  );
  assert.match(
    playerSource,
    /localStorage\.getItem\(academyPlayerPendingStorageKey\)\s*===\s*["']1["']/,
  );
  assert.match(
    playerSource,
    /localStorage\.removeItem\(academyPlayerPendingStorageKey\)/,
  );
});

test("keeps account workspaces isolated and the persistent player on listening routes", async () => {
  const [accessSource, boundarySource, portalSource, creatorSource] = await Promise.all([
    readFile(new URL("../app/lib/access.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/MemberPlayerBoundary.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/Portal.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/biblioteca/gerador/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(accessSource, /transitionMemberWorkspace\(access\.token\)/);
  assert.match(accessSource, /transitionMemberWorkspace\(\)/);
  assert.match(boundarySource, /pathname\.replace\(\/\\\/\+\$\/, ""\) \|\| "\/"/);
  assert.match(boundarySource, /normalizedPathname === "\/academia"/);
  assert.match(boundarySource, /normalizedPathname === "\/biblioteca"/);
  assert.doesNotMatch(portalSource, /href=["']#["']/);
  assert.match(portalSource, /CONTEÚDO EM PREPARAÇÃO/);
  assert.match(creatorSource, /<small>\{plan\.style\}<\/small>/);
  assert.doesNotMatch(creatorSource, /track\.tags \|\| plan\.style/);
});

test("preserves workspace for the same account and clears it on account changes", () => {
  const values = new Map();
  const storage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
  const tokenFor = (identity, expiry = "2000000000") => `v1.${expiry}.${identity}.signature`;

  const firstLogin = transitionAuthenticatedWorkspace(storage, tokenFor("ami_account_a"));
  assert.equal(firstLogin.cleared, true);
  values.set(authenticatedWorkspaceKeys[0], "music draft");
  values.set(authenticatedWorkspaceKeys[1], "cover job");

  const sameAccount = transitionAuthenticatedWorkspace(
    storage,
    tokenFor("ami_account_a", "2100000000"),
  );
  assert.equal(sameAccount.cleared, false);
  assert.equal(values.get(authenticatedWorkspaceKeys[0]), "music draft");
  assert.equal(values.get(authenticatedWorkspaceKeys[1]), "cover job");

  const differentAccount = transitionAuthenticatedWorkspace(storage, tokenFor("ami_account_b"));
  assert.equal(differentAccount.cleared, true);
  assert.equal(values.has(authenticatedWorkspaceKeys[0]), false);
  assert.equal(values.has(authenticatedWorkspaceKeys[1]), false);
  assert.equal(values.get(authenticatedWorkspaceOwnerKey), "ami_account_b");

  values.set(authenticatedWorkspaceKeys[0], "new draft");
  const logout = transitionAuthenticatedWorkspace(storage, "");
  assert.equal(logout.cleared, true);
  assert.equal(values.has(authenticatedWorkspaceKeys[0]), false);
  assert.equal(values.has(authenticatedWorkspaceOwnerKey), false);
});
