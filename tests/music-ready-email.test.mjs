import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMusicReadyEmail,
  musicReadyEmailSubject,
} from "../infra/checkout/music-ready-email.mjs";

const baseInput = {
  recipientName: "Maria da Silva",
  libraryUrl: "https://musicacom.ia.br/biblioteca/",
  logoUrl: "https://musicacom.ia.br/brand/musicacom-logo-horizontal-light.png",
  supportUrl: "https://musicacom.ia.br/suporte/",
  tracks: [
    {
      title: "Ainda de Pé",
      imageUrl: "https://media.example.test/capa.jpg",
      downloadUrl: "https://api.example.test/v1/music/download/task_123/track_1?sig=abc",
    },
    {
      title: "Primeira Vitória",
      downloadUrl: "https://api.example.test/v1/music/download/task_123/track_2?sig=def",
    },
  ],
};

test("music-ready email delivers both versions and recovery links", () => {
  const email = buildMusicReadyEmail(baseInput);

  assert.equal(email.subject, "Sua música “Ainda de Pé” está pronta");
  assert.match(email.html, /Maria, sua música/);
  assert.match(email.html, /Ainda de Pé/);
  assert.match(email.html, /Primeira Vitória/);
  assert.match(email.html, /Ouvir ou baixar/);
  assert.match(email.html, /Abrir minhas músicas/);
  assert.match(email.html, /musicacom-logo-horizontal-light\.png/);
  assert.match(email.text, /Versão 1: Ainda de Pé/);
  assert.match(email.text, /https:\/\/musicacom\.ia\.br\/biblioteca\//);
});

test("music-ready email escapes user and provider content", () => {
  const email = buildMusicReadyEmail({
    ...baseInput,
    recipientName: "<script>\nalert(1)</script>",
    tracks: [{
      title: "<img src=x\nonerror=alert(1)>",
      downloadUrl: "https://api.example.test/download",
    }],
  });

  assert.doesNotMatch(email.html, /<script>/);
  assert.doesNotMatch(email.html, /<img src=x/);
  assert.match(email.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(email.subject, /[\r\n]/);
});

test("music-ready email rejects unsafe links and missing tracks", () => {
  assert.throws(
    () => buildMusicReadyEmail({
      ...baseInput,
      tracks: [{ title: "Insegura", downloadUrl: "javascript:alert(1)" }],
    }),
    /downloadable track/,
  );
  assert.throws(
    () => buildMusicReadyEmail({ ...baseInput, libraryUrl: "http://example.test" }),
    /HTTPS/,
  );
  assert.equal(musicReadyEmailSubject([]), "Sua música está pronta");
});
