import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Brazilian trap exposes a neutral, self-hosted cover beat", async () => {
  const [creatorSource, stylesSource, backendSource] = await Promise.all([
    readFile(new URL("../app/biblioteca/gerador/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/musicStyles.ts", import.meta.url), "utf8"),
    readFile(new URL("../infra/checkout/index.mjs", import.meta.url), "utf8"),
  ]);

  assert.match(stylesSource, /id:\s*"beat-trap-01"/);
  assert.match(stylesSource, /label:\s*"Beat Trap 01"/);
  assert.match(stylesSource, /audioUrl:\s*"\/beats\/beat-trap-01\.mp3"/);
  assert.doesNotMatch(stylesSource, /youtube/i);
  assert.match(creatorSource, /BEATS LIBERADOS PARA COVER/);
  assert.match(creatorSource, /<audio controls preload="metadata" src=\{reference\.audioUrl\}>/);
  assert.match(backendSource, /"\/generate\/add-vocals"/);
  assert.match(backendSource, /uploadUrl:\s*coverBeat\.uploadUrl/);
});

test("the selected beat informs generation and resets with style", async () => {
  const creatorSource = await readFile(
    new URL("../app/biblioteca/gerador/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(creatorSource, /Direção sonora escolhida: \$\{referenceTrack\.direction\}/);
  assert.match(creatorSource, /referenceTrackId:\s*selected \? "" : reference\.id/);
  assert.match(creatorSource, /style:\s*style\.name,\s*referenceTrackId:\s*""/);
  assert.match(creatorSource, /coverBeatId:\s*selectedPlan\.referenceTrackId/);
});
