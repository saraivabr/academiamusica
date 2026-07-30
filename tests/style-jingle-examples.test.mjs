import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";

const examplesDirectory = new URL("../public/jingles/styles/", import.meta.url);
const stylesPage = new URL("../app/biblioteca/estilos-brasileiros/page.tsx", import.meta.url);
const stylesLibrary = new URL("../app/lib/musicStyles.ts", import.meta.url);
const playerBoundary = new URL("../app/components/MemberPlayerBoundary.tsx", import.meta.url);
const academyPlayer = new URL("../app/components/AcademyPlayer.tsx", import.meta.url);

test("the Brazilian styles catalog ships 23 real jingle examples", async () => {
  const [files, pageSource, librarySource] = await Promise.all([
    readdir(examplesDirectory),
    readFile(stylesPage, "utf8"),
    readFile(stylesLibrary, "utf8"),
  ]);
  const mp3Files = files.filter((file) => file.endsWith(".mp3")).sort();
  const styleSlugs = new Set(
    Array.from(librarySource.matchAll(/slug:\s*"([^"]+)"/g), (match) => match[1]),
  );
  const mappingSource = pageSource.slice(
    pageSource.indexOf("const styleJingles"),
    pageSource.indexOf("const styleJingleCount"),
  );
  const mappedSlugs = Array.from(
    mappingSource.matchAll(/^\s*(?:"([^"]+)"|([\p{L}\p{N}-]+)):\s*\{/gmu),
    (match) => match[1] || match[2],
  );

  assert.equal(mp3Files.length, 23);
  assert.equal(mappedSlugs.length, 23);
  assert.deepEqual(
    mappedSlugs.filter((slug) => !styleSlugs.has(slug)),
    [],
    "every jingle must map to a real catalog style slug",
  );
  assert.match(pageSource, /\{styleJingleCount\} jingles musicacom\.ia disponíveis para ouvir/);
  assert.match(pageSource, /playInAcademyPlayer/);
  assert.match(pageSource, /style_jingle_played/);

  for (const file of mp3Files) {
    const info = await stat(new URL(file, examplesDirectory));
    assert.ok(info.size > 300_000, `${file} must contain a real audio file`);
    assert.match(pageSource, new RegExp(`/jingles/styles/${file.replace(".", "\\.")}`));
  }
});

test("nested library routes mount an audio element before the user presses play", async () => {
  const [boundarySource, playerSource] = await Promise.all([
    readFile(playerBoundary, "utf8"),
    readFile(academyPlayer, "utf8"),
  ]);

  assert.match(boundarySource, /normalizedPathname\.startsWith\("\/biblioteca\/"\)/);
  assert.match(boundarySource, /normalizedPathname\.startsWith\("\/academia\/"\)/);
  assert.match(playerSource, /const audio = audioRef\.current;/);
  assert.match(playerSource, /audio\.src = nextUrl;/);
  assert.match(playerSource, /void audio\.play\(\)/);
  assert.doesNotMatch(playerSource, /\{playableUrl \? \(\s*<audio/);
  assert.doesNotMatch(playerSource, /src=\{playableUrl/);
});
