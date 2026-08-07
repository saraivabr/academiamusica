import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";

// A CloudFront Function decide o destino de toda requisição do site: ela
// protege a área de membros, redireciona rotas aposentadas e resolve o
// index.html de cada diretório. Um erro aqui derruba o site inteiro, então o
// arquivo é carregado do jeito que a AWS o executa — com o segredo já
// substituído, como faz infra/enable-static-routing.sh.
const SECRET = "segredo-de-teste";

const source = (await readFile(new URL("../infra/cloudfront-rewrite.js", import.meta.url), "utf8"))
  .replace('"__ACCESS_SECRET__"', JSON.stringify(SECRET));

const container = { exports: {} };
new Function("require", "module", "exports", `${source}\nmodule.exports = handler;`)(
  (name) => (name === "crypto" ? crypto : createRequire(import.meta.url)(name)),
  container,
  container.exports,
);
const handler = container.exports;

function accessCookie({ expiresInSeconds = 3600, orderId = `ami_${"a".repeat(28)}` } = {}) {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `v1.${expiresAt}.${orderId}`;
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

const run = (uri, cookieValue) => handler({
  request: {
    uri,
    cookies: cookieValue ? { academia_access: { value: cookieValue } } : {},
  },
});

test("a Academia aposentada leva à home atual do estúdio", () => {
  for (const uri of ["/academia", "/academia/", "/academia/musica/", "/academia/publicacao/"]) {
    const response = run(uri);
    assert.equal(response.statusCode, 302, uri);
    assert.equal(response.headers.location.value, "/biblioteca/", uri);
  }
});

test("o redirect não captura caminhos que só começam parecido", () => {
  // O áudio de demonstração da home mora na raiz e começa com "/academia".
  // Um prefixo sem barra o transformaria num redirect e mataria o player.
  const audio = run("/academia-musica-ia-trap-jingle.mp3");
  assert.equal(audio.statusCode, undefined);
  assert.equal(audio.uri, "/academia-musica-ia-trap-jingle.mp3");

  assert.equal(run("/academiamusica").statusCode, undefined);
});

test("a área de membros exige um cookie assinado e válido", () => {
  const semCookie = run("/biblioteca/");
  assert.equal(semCookie.statusCode, 302);
  assert.match(semCookie.headers.location.value, /^\/login\/\?next=/);

  const assinaturaTrocada = `${accessCookie().split(".").slice(0, 3).join(".")}.${"0".repeat(64)}`;
  assert.equal(run("/biblioteca/", assinaturaTrocada).statusCode, 302);
  assert.equal(run("/biblioteca/", accessCookie({ expiresInSeconds: -1 })).statusCode, 302);
  assert.equal(run("/biblioteca/", accessCookie({ orderId: "ami_curto" })).statusCode, 302);

  assert.equal(run("/biblioteca/", accessCookie()).uri, "/biblioteca/index.html");
});

test("rotas públicas e arquivos resolvem sem redirect", () => {
  assert.equal(run("/").uri, "/index.html");
  assert.equal(run("/preview/").uri, "/preview/index.html");
  assert.equal(run("/checkout").uri, "/checkout/index.html");
  assert.equal(run("/_next/static/abc.js").uri, "/_next/static/abc.js");
  assert.equal(run("/ads/campanha/arte-9x16.png").uri, "/ads/campanha/arte-9x16.png");
});
