import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  analyticsSessionStorageKey,
  analyticsSessionTimeoutMs,
  getOrCreateAnalyticsSession,
  resetAnalyticsMemorySessionForTests,
} from "../app/lib/analyticsSession.js";

const reportPath = fileURLToPath(
  new URL("../infra/funnel-report.mjs", import.meta.url),
);

function event(id, name, sessionId) {
  return {
    id: { S: id },
    name: { S: name },
    sessionId: { S: sessionId },
    source: { S: "test" },
    createdAt: { S: "2026-07-28T00:00:00.000Z" },
  };
}

test("creator activation counts only linked unique Rota Única sessions", () => {
  const payload = {
    Items: [
      event("open_a_1", "music_route_unique_opened", "session_a_123456"),
      event("open_a_2", "music_route_unique_opened", "session_a_123456"),
      event("open_b", "music_route_unique_opened", "session_b_123456"),
      event("open_c", "music_route_unique_opened", "session_c_123456"),
      event("confirm_a", "music_route_unique_confirmed", "session_a_123456"),
      event("confirm_b", "music_route_unique_confirmed", "session_b_123456"),
      event("confirm_legacy", "music_route_unique_confirmed", "server"),
      event("failed_started", "music_generation_confirmed", "session_c_123456"),
    ],
  };

  const result = spawnSync(process.execPath, [reportPath, "180"], {
    encoding: "utf8",
    input: JSON.stringify(payload),
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /ROTA ÚNICA — ativação do criador/);
  assert.match(result.stdout, /Aberturas únicas: 3/);
  assert.match(result.stdout, /Confirmações vinculadas: 2/);
  assert.match(result.stdout, /Taxa de ativação: 66\.7%/);
  assert.match(result.stdout, /Confirmações sem abertura vinculada: 0/);
  assert.match(result.stdout, /Confirmações sem sessão válida: 1/);
  assert.match(result.stdout, /coleta em andamento \(3\/100 sessões\)/);
});

test("analytics session expires after 30 minutes and survives storage restrictions in memory", () => {
  const values = new Map();
  const storage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
  let sequence = 0;
  const createId = () => `session_${String(++sequence).padStart(10, "0")}`;

  resetAnalyticsMemorySessionForTests();
  const first = getOrCreateAnalyticsSession(storage, 1_000, createId);
  const active = getOrCreateAnalyticsSession(
    storage,
    1_000 + analyticsSessionTimeoutMs - 1,
    createId,
  );
  const expired = getOrCreateAnalyticsSession(
    storage,
    1_000 + (analyticsSessionTimeoutMs * 2),
    createId,
  );

  assert.equal(first, active);
  assert.notEqual(first, expired);
  assert.match(values.get(analyticsSessionStorageKey), new RegExp(expired));

  const blockedStorage = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
  };
  resetAnalyticsMemorySessionForTests();
  const fallbackA = getOrCreateAnalyticsSession(blockedStorage, 5_000, createId);
  const fallbackB = getOrCreateAnalyticsSession(blockedStorage, 6_000, createId);
  assert.equal(fallbackA, fallbackB);
});

test("creator activation is recorded only after an idempotent successful reconciliation", async () => {
  const [creatorSource, backendSource] = await Promise.all([
    readFile(new URL("../app/biblioteca/gerador/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../infra/checkout/index.mjs", import.meta.url), "utf8"),
  ]);

  assert.match(creatorSource, /trackEvent\("music_route_unique_opened"\)/);
  assert.match(creatorSource, /\.\.\.getAnalyticsContext\(\)/);
  assert.match(backendSource, /sessionId: context\.sessionId \|\| order\.sessionId/);
  assert.match(backendSource, /"music_route_unique_confirmed"/);

  const creationStart = backendSource.indexOf("async function createSunoGeneration");
  const pollingStart = backendSource.indexOf("async function getSunoGeneration");
  const creationSource = backendSource.slice(creationStart, pollingStart);
  assert.doesNotMatch(creationSource, /music_route_unique_confirmed/);

  const successStart = backendSource.indexOf("async function recordSuccessfulSunoTask");
  const successSource = backendSource.slice(successStart, successStart + 2_000);
  assert.match(successSource, /music_route_unique_confirmed/);
  assert.match(successSource, /music_route_unique_confirmed_\$\{taskId\}/);
  assert.match(successSource, /deleteSunoAnalyticsContext/);

  const libraryStart = backendSource.indexOf("async function getMusicLibrary");
  const librarySource = backendSource.slice(libraryStart, libraryStart + 3_000);
  assert.match(librarySource, /reconcileSunoTask\(taskId, item, order\)/);
  assert.match(librarySource, /recordSuccessfulSunoTask\(order, taskId, item, tracks\)/);

  const pollingSource = backendSource.slice(pollingStart, pollingStart + 1_500);
  assert.match(pollingSource, /reconcileSunoTask\(taskId, task, order\)/);

  const callbackStart = backendSource.indexOf("async function handleSunoCallback");
  const callbackSource = backendSource.slice(callbackStart, callbackStart + 2_500);
  assert.match(callbackSource, /callbackTokenMatches/);
  assert.match(callbackSource, /reconcileSunoTask\(taskId, task, order\)/);

  const taskStart = backendSource.indexOf("async function rememberSunoTask");
  const taskSource = backendSource.slice(taskStart, taskStart + 1_200);
  assert.doesNotMatch(taskSource, /sessionId:/);
  assert.match(backendSource, /60 \* 60 \* 48/);

  const cleanupStart = backendSource.indexOf("async function cleanupFailedSunoSetup");
  const cleanupSource = backendSource.slice(cleanupStart, cleanupStart + 700);
  assert.ok(
    cleanupSource.indexOf("releaseSunoGeneration") < cleanupSource.indexOf("deleteSunoAnalyticsContext"),
    "the financial reservation must be released before best-effort analytics cleanup",
  );
  assert.match(cleanupSource, /catch \(error\)/);
});

test("creator report becomes decision-ready at exactly 100 valid sessions", () => {
  const items = Array.from({ length: 100 }, (_, index) => (
    event(`open_${index}`, "music_route_unique_opened", `session_${String(index).padStart(12, "0")}`)
  ));
  for (let index = 0; index < 40; index += 1) {
    items.push(event(
      `confirm_${index}`,
      "music_route_unique_confirmed",
      `session_${String(index).padStart(12, "0")}`,
    ));
  }

  const result = spawnSync(process.execPath, [reportPath, "180"], {
    encoding: "utf8",
    input: JSON.stringify({ Items: items }),
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Aberturas únicas: 100/);
  assert.match(result.stdout, /Confirmações vinculadas: 40/);
  assert.match(result.stdout, /Taxa de ativação: 40\.0%/);
  assert.match(result.stdout, /pronta para decisão \(100 sessões ou mais\)/);
});
