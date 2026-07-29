import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("product analytics keeps CTA placement and journey-stage dimensions end to end", async () => {
  const [home, client, collector, report] = await Promise.all([
    source("app/components/HomePage.tsx"),
    source("app/lib/analytics.ts"),
    source("infra/checkout/index.mjs"),
    source("infra/funnel-report.mjs"),
  ]);

  for (const placement of [
    "nav",
    "hero",
    "how_it_works",
    "free_offer",
    "final",
  ]) {
    assert.match(home, new RegExp(`data-track-placement="${placement}"`));
  }

  assert.match(client, /properties: AnalyticsProperties/);
  assert.match(client, /\.\.\.properties/);
  assert.match(collector, /"cta_start_free_clicked"/);
  assert.match(collector, /placement: body\.placement/);
  assert.match(collector, /step: body\.step/);
  assert.match(collector, /outcome: body\.outcome/);
  assert.match(report, /CTA PARA COMEÇAR/);
  assert.match(report, /event\.placement === placement/);
});
