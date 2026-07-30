import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const reportPath = fileURLToPath(new URL("../infra/funnel-report.mjs", import.meta.url));

test("home experiment assigns one persistent visitor variant", async () => {
  const experiment = await source("app/lib/conversionExperiment.ts");

  assert.match(experiment, /home_story_start_v1/);
  assert.match(experiment, /"control"/);
  assert.match(experiment, /"gift_first"/);
  assert.match(experiment, /"example_first"/);
  assert.match(experiment, /localStorage\.getItem\(STORAGE_KEY\)/);
  assert.match(experiment, /localStorage\.setItem\(STORAGE_KEY, assigned\)/);
});

test("home renders every message angle and exposes its assignment", async () => {
  const home = await source("app/components/HomePage.tsx");

  assert.match(home, /heroMessages: Record<HomeStoryVariant/);
  assert.match(home, /UM PRESENTE QUE TEM A SUA HISTÓRIA/);
  assert.match(home, /COMECE COM UMA LEMBRANÇA/);
  assert.match(home, /data-experiment=\{HOME_STORY_EXPERIMENT\}/);
  assert.match(home, /data-variant=\{heroVariant\}/);
});

test("experiment attribution reaches events, checkout orders and paid conversion", async () => {
  const [analytics, backend, report, query] = await Promise.all([
    source("app/lib/analytics.ts"),
    source("infra/checkout/index.mjs"),
    source("infra/funnel-report.mjs"),
    source("infra/funnel.sh"),
  ]);

  assert.match(analytics, /getConversionExperimentContext/);
  assert.match(backend, /experiment: body\.experiment/);
  assert.match(backend, /variant: body\.variant/);
  assert.match(backend, /experiment: order\?\.experiment/);
  assert.match(backend, /variant: order\?\.variant/);
  assert.match(report, /EXPERIMENTO — MENSAGEM DA HOME/);
  assert.match(report, /HOME_VARIANT_MINIMUM = 30/);
  assert.match(report, /wilsonInterval/);
  assert.match(query, /#experiment/);
  assert.match(query, /#variant/);
});

test("all emitted product events are accepted by the collector", async () => {
  const backend = await source("infra/checkout/index.mjs");

  for (const event of [
    "style_jingle_played",
    "music_version_selected",
    "music_next_step_selected",
  ]) {
    assert.match(backend, new RegExp(`\"${event}\"`));
  }
});

test("report waits for balanced samples and selects only a confident linked winner", () => {
  const Items = [];
  const rates = {
    control: 3,
    gift_first: 24,
    example_first: 6,
  };
  for (const [variant, stories] of Object.entries(rates)) {
    for (let index = 0; index < 30; index += 1) {
      const sessionId = `ses_${variant}_${String(index).padStart(3, "0")}`;
      const dimensions = {
        sessionId: { S: sessionId },
        experiment: { S: "home_story_start_v1" },
        variant: { S: variant },
        createdAt: { S: "2026-07-30T12:00:00.000Z" },
      };
      Items.push({
        id: { S: `landing_${variant}_${index}` },
        name: { S: "landing_view" },
        ...dimensions,
      });
      if (index < stories) {
        Items.push({
          id: { S: `story_${variant}_${index}` },
          name: { S: "story_started" },
          ...dimensions,
        });
      }
    }
  }
  Items.push({
    id: { S: "unlinked_story" },
    name: { S: "story_started" },
    sessionId: { S: "ses_gift_first_unlinked" },
    experiment: { S: "home_story_start_v1" },
    variant: { S: "gift_first" },
    createdAt: { S: "2026-07-30T12:00:00.000Z" },
  });

  const result = spawnSync(process.execPath, [reportPath, "30"], {
    input: JSON.stringify({ Items }),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /gift_first\s+30\s+24 · 80\.0%/);
  assert.doesNotMatch(result.stdout, /25 · 83\.3%/);
  assert.match(result.stdout, /DECISÃO DO TESTE: gift_first venceu/);
});
