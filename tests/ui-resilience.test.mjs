import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const appDir = new URL("../app/", import.meta.url);

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, dir);
    if (entry.isDirectory()) await walk(child, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(child);
  }
  return out;
}

const files = await walk(appDir);
const sources = await Promise.all(
  files.map(async (file) => ({
    name: path.relative(appDir.pathname, file.pathname),
    code: await readFile(file, "utf8"),
  })),
);

test("copiar para a área de transferência nunca falha em silêncio", async () => {
  const helper = sources.find((f) => f.name === "lib/clipboard.ts");
  assert.ok(helper, "app/lib/clipboard.ts deve existir");
  assert.match(helper.code, /try\s*\{[\s\S]*navigator\.clipboard\.writeText[\s\S]*\}\s*catch/);
  assert.match(helper.code, /return false/);

  // Chamar a API direto ignora permissão negada e contexto não seguro: a
  // promessa rejeita e o botão fica mudo.
  const raw = sources.filter(
    (f) => f.name !== "lib/clipboard.ts" && f.code.includes("navigator.clipboard"),
  );
  assert.deepEqual(raw.map((f) => f.name), [], "use copyText() de lib/clipboard");
});

test("todo link que abre em nova aba isola a origem", () => {
  const offenders = [];
  for (const { name, code } of sources) {
    for (const tag of code.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? []) {
      if (!tag.includes("noreferrer")) offenders.push(`${name}: ${tag.slice(0, 70)}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("a prévia diz quanto falta em vez de só desabilitar o envio", () => {
  const preview = sources.find((f) => f.name === "preview/page.tsx");
  assert.match(preview.code, /remainingToMinimum/);
  assert.match(preview.code, /Faltam \$\{remainingToMinimum\} caracteres/);
});

test("as páginas legais numeram as seções", () => {
  for (const page of ["termos/page.tsx", "privacidade/page.tsx", "reembolso/page.tsx"]) {
    const headings = sources.find((f) => f.name === page).code.match(/<h2>[^<]+/g) ?? [];
    assert.ok(headings.length > 0, `${page} deve ter seções`);
    headings.forEach((heading, index) => {
      assert.match(heading, new RegExp(`<h2>${index + 1}\\. `), `${page}: ${heading}`);
    });
  }
});
