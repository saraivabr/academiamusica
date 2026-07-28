import { expect, type TestInfo } from "@playwright/test";

export type FrictionMetric = {
  metric: string;
  observed: number;
  budget: number;
  unit: string;
  note: string;
};

export async function validateFrictionBudget(
  testInfo: TestInfo,
  journey: string,
  metrics: FrictionMetric[],
) {
  await testInfo.attach(`friction-${journey}`, {
    body: Buffer.from(JSON.stringify({
      journey,
      verdict: metrics.every((metric) => metric.observed <= metric.budget)
        ? "within-budget"
        : "over-budget",
      metrics,
    }, null, 2)),
    contentType: "application/json",
  });

  for (const metric of metrics) {
    expect.soft(
      metric.observed,
      `${metric.metric}: ${metric.note}`,
    ).toBeLessThanOrEqual(metric.budget);
  }
}
