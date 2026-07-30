import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";

const examplesDirectory = new URL("../public/jingles/styles/", import.meta.url);
const stylesPage = new URL("../app/biblioteca/estilos-brasileiros/page.tsx", import.meta.url);

test("the Brazilian styles catalog ships 23 real jingle examples", async () => {
  const [files, pageSource] = await Promise.all([
    readdir(examplesDirectory),
    readFile(stylesPage, "utf8"),
  ]);
  const mp3Files = files.filter((file) => file.endsWith(".mp3")).sort();

  assert.equal(mp3Files.length, 23);
  assert.match(pageSource, /\{styleJingleCount\} jingles musicacom\.ia disponíveis para ouvir/);
  assert.match(pageSource, /playInAcademyPlayer/);
  assert.match(pageSource, /style_jingle_played/);

  for (const file of mp3Files) {
    const info = await stat(new URL(file, examplesDirectory));
    assert.ok(info.size > 300_000, `${file} must contain a real audio file`);
    assert.match(pageSource, new RegExp(`/jingles/styles/${file.replace(".", "\\.")}`));
  }
});
