import { expect, test } from "@playwright/test";
import { mockPlatform } from "./support/mock-platform";

test.describe("Busca de negócios para jingles", () => {
  test.beforeEach(async ({ page }) => {
    await mockPlatform(page);
  });

  test("busca uma empresa e leva o briefing real para o criador", async ({ page }) => {
    await page.goto("/biblioteca/negocios/");
    await expect(page.locator(".prospect-search"))
      .toHaveAttribute("data-interactive", "true");
    await page.getByLabel("Tipo de negócio").fill("cafeterias");
    await page.getByLabel("Cidade ou região").fill("Salvador, BA");
    await page.getByRole("button", { name: "Buscar negócios", exact: true }).click();

    await expect(page.getByRole("heading", {
      name: "1 negócios para abordar com um jingle",
    })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Café da Praça", { exact: true })).toBeVisible();

    await page.getByRole("button", {
      name: "Criar jingle para esta empresa →",
    }).click();

    await expect(page.getByRole("status"))
      .toContainText("Café da Praça foi aplicado ao briefing.");
    await expect(page.getByRole("heading", {
      name: "Como essa música deve fazer alguém se sentir?",
    })).toBeVisible();
  });
});
