import assert from "node:assert/strict";
import test from "node:test";

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
  assert.match(html, /<meta[^>]+property=["']og:title["'][^>]+100% brasileirada/i);
  assert.match(html, /<meta[^>]+property=["']og:image["'][^>]+musicacom\.ia\.br\/og\.png/i);
  assert.match(html, /A plataforma de geração de música/i);
  assert.match(html, /FEITA NO BRASIL\. PARA O SOM DO BRASIL\./i);
  assert.match(html, /O aprendizado acontece dentro da própria plataforma/i);
  assert.doesNotMatch(html, /Quero conversar e criar/i);
  assert.doesNotMatch(html, /Produtor IA/i);
  assert.doesNotMatch(html, /codex-preview/i);
});

test("renders the express music creator without the conversational studio", async () => {
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
  assert.match(html, /CRIADOR EXPRESS/i);
  assert.match(html, /Uma ideia\. Algumas escolhas\./i);
  assert.match(html, /Criar duas músicas/i);
  assert.doesNotMatch(html, /Crie sua música em uma conversa/i);
  assert.doesNotMatch(html, /Produtor IA está pensando/i);
});
