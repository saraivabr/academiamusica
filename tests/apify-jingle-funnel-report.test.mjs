import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const reportPath = fileURLToPath(
  new URL("../infra/funnel-report.mjs", import.meta.url),
);

function event(id, name, sessionId, createdAt, properties = {}) {
  const item = {
    id: { S: id },
    name: { S: name },
    sessionId: { S: sessionId },
    source: { S: properties.source ?? "direct" },
    createdAt: { S: createdAt },
  };
  for (const property of ["placement", "outcome"]) {
    if (properties[property]) item[property] = { S: properties[property] };
  }
  return item;
}

function runReport(items) {
  return spawnSync(process.execPath, [reportPath, "14"], {
    encoding: "utf8",
    input: JSON.stringify({ Items: items }),
  });
}

test("Apify jingle report links ordered unique sessions and anchors their origin", () => {
  const items = [
    event("a_search_1", "prospect_search_completed", "session_a_123456", "2026-07-29T10:00:00.000Z", {
      source: "instagram",
      outcome: "results",
    }),
    event("a_search_2", "prospect_search_completed", "session_a_123456", "2026-07-29T10:00:00.500Z", {
      source: "instagram",
      outcome: "results",
    }),
    event("a_business_1", "prospect_jingle_started", "session_a_123456", "2026-07-29T10:01:00.000Z", {
      source: "direct",
    }),
    event("a_business_2", "prospect_jingle_started", "session_a_123456", "2026-07-29T10:01:00.500Z"),
    event("a_creator", "expert_direction_received", "session_a_123456", "2026-07-29T10:02:00.000Z", {
      placement: "business-prospect",
    }),
    event("a_delivered", "music_generation_completed", "session_a_123456", "2026-07-29T10:03:00.000Z"),
    event("a_play_1", "music_result_played", "session_a_123456", "2026-07-29T10:04:00.000Z"),
    event("a_play_2", "music_result_played", "session_a_123456", "2026-07-29T10:05:00.000Z"),

    event("b_search", "prospect_search_completed", "session_b_123456", "2026-07-29T11:00:00.000Z", {
      source: "google",
      outcome: "results",
    }),
    event("b_business", "prospect_jingle_started", "session_b_123456", "2026-07-29T11:01:00.000Z"),
    event("b_creator", "prospect_jingle_creator_opened", "session_b_123456", "2026-07-29T11:02:00.000Z", {
      placement: "business-prospect",
    }),
    event("b_early_play", "music_result_played", "session_b_123456", "2026-07-29T11:03:00.000Z"),
    event("b_delivered", "music_generation_delivered", "session_b_123456", "2026-07-29T11:04:00.000Z"),

    event("c_empty", "prospect_search_completed", "session_c_123456", "2026-07-29T12:00:00.000Z", {
      source: "instagram",
      outcome: "empty",
    }),
    event("c_business", "prospect_jingle_started", "session_c_123456", "2026-07-29T12:01:00.000Z"),

    event("d_business", "prospect_jingle_started", "session_d_123456", "2026-07-29T13:00:00.000Z"),
    event("d_search", "prospect_search_completed", "session_d_123456", "2026-07-29T13:01:00.000Z", {
      source: "instagram",
      outcome: "results",
    }),
    event("d_creator", "prospect_jingle_creator_opened", "session_d_123456", "2026-07-29T13:02:00.000Z"),

    event("server_search", "prospect_search_completed", "server", "2026-07-29T14:00:00.000Z", {
      outcome: "results",
    }),
  ];

  const result = runReport(items);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /JORNADA APIFY → PRIMEIRA ESCUTA/);
  assert.match(result.stdout, /Apify com resultados\s+3\s+—\s+100\.0%/);
  assert.match(result.stdout, /Negócio escolhido\s+2\s+66\.7%\s+66\.7%/);
  assert.match(result.stdout, /Criador de jingle\s+2\s+100\.0%\s+66\.7%/);
  assert.match(result.stdout, /Música entregue\s+2\s+100\.0%\s+66\.7%/);
  assert.match(result.stdout, /Primeira escuta\s+1\s+50\.0%\s+33\.3%/);
  assert.match(result.stdout, /aguarde mais volume \(3\/100 sessões Apify\)/);
  assert.match(result.stdout, /Sessões com ao menos uma busca sem resultado: 1/);
  assert.match(result.stdout, /Eventos da jornada sem sessão válida: 1/);
  assert.match(result.stdout, /instagram\s+2\s+1 · 50\.0%\s+1 · 100\.0%\s+1 · 100\.0%\s+1 · 100\.0%\s+50\.0%\s+2\/30/);
  assert.match(result.stdout, /google\s+1\s+1 · 100\.0%\s+1 · 100\.0%\s+1 · 100\.0%\s+0 · 0\.0%\s+0\.0%\s+1\/30/);
});

test("Apify jingle report marks the exact overall and origin sample thresholds", () => {
  const items = Array.from({ length: 100 }, (_, index) => (
    event(
      `search_${index}`,
      "prospect_search_completed",
      `session_${String(index).padStart(12, "0")}`,
      `2026-07-29T10:${String(Math.floor(index / 60)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}.000Z`,
      {
        source: index < 30 ? "instagram" : "direct",
        outcome: "results",
      },
    )
  ));

  const result = runReport(items);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /amostra geral pronta \(100 sessões Apify; mínimo 100\)/);
  assert.match(result.stdout, /instagram\s+30\s+0 · 0\.0%(?:\s+0 · —){3}\s+0\.0%\s+pronta/);
});

test("collector projection and creator instrumentation expose the journey dimensions", async () => {
  const [shell, creator] = await Promise.all([
    readFile(new URL("../infra/funnel.sh", import.meta.url), "utf8"),
    readFile(new URL("../app/biblioteca/gerador/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(shell, /createdAt,#placement,#journey,#step,#outcome,#product/);
  assert.match(shell, /"#placement":"placement"/);
  assert.match(shell, /"#step":"step"/);
  assert.match(creator, /trackEvent\("prospect_jingle_creator_opened"/);
  assert.match(creator, /placement: "business-prospect"/);
});
