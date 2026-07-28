import { expect, test, type Page } from "@playwright/test";
import { validateFrictionBudget } from "./support/friction";
import { mockPlatform } from "./support/mock-platform";

async function chooseEssentialMeasurement(page: Page) {
  const consent = page.getByRole("complementary", {
    name: "Preferências de medição",
  });
  await expect(consent).toBeVisible();
  await expect(consent).toHaveAttribute("data-interactive", "true", {
    timeout: 15_000,
  });
  await consent.getByRole("button", { name: "Somente essenciais" }).click();
  await expect(consent).toBeHidden();
}

async function waitForAccessFormHydration(page: Page) {
  await expect(page.locator("form[data-interactive]")).toHaveAttribute(
    "data-interactive",
    "true",
    { timeout: 15_000 },
  );
  const password = page.getByLabel("Sua senha");
  const toggle = page.getByRole("button", { name: "Mostrar senha" });
  await toggle.click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ocultar senha" }).click();
  await expect(password).toHaveAttribute("type", "password");
}

test.describe("entrada na solução sem fricção desnecessária", () => {
  test.beforeEach(async ({ page }) => {
    await mockPlatform(page);
  });

  test("a proposta e o caminho grátis aparecem antes da primeira rolagem", async ({
    page,
  }, testInfo) => {
    await page.goto("/");

    const primaryCta = page.getByRole("link", { name: /criar grátis agora/i });
    await expect(primaryCta).toBeVisible();
    await expect(page.locator(".br-proof-row")).toContainText("1 música grátis por dia");
    await expect(page.locator(".br-proof-row")).toContainText("Sem cartão");

    const horizontalOverflow = await page.evaluate(
      () => Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    );

    await chooseEssentialMeasurement(page);
    await primaryCta.click();
    await expect(page).toHaveURL(/\/login\/?\?mode=register$/);
    await expect(page.getByRole("heading", { name: "Abra seu estúdio." })).toBeVisible();

    const requiredFields = await page.locator("form input[required]:visible").count();
    const paymentCommitments = await page
      .getByText(/cartão de crédito|dados do cartão|pagamento obrigatório/i)
      .count();

    await validateFrictionBudget(testInfo, "descoberta-e-cadastro", [
      {
        metric: "Interrupções obrigatórias antes do cadastro",
        observed: 1,
        budget: 1,
        unit: "decisão",
        note: "O consentimento deve ser resolvido em uma única ação.",
      },
      {
        metric: "Ações da home até o cadastro",
        observed: 1,
        budget: 1,
        unit: "clique",
        note: "O CTA principal deve levar diretamente à criação da conta.",
      },
      {
        metric: "Campos obrigatórios iniciais",
        observed: requiredFields,
        budget: 3,
        unit: "campos",
        note: "Nome, e-mail e senha são o máximo aceitável antes da confirmação.",
      },
      {
        metric: "Compromissos de pagamento antes do valor",
        observed: paymentCommitments,
        budget: 0,
        unit: "bloqueios",
        note: "A entrada gratuita não pode pedir pagamento ou cartão.",
      },
      {
        metric: "Rolagem horizontal",
        observed: horizontalOverflow,
        budget: 1,
        unit: "pixels",
        note: "A experiência deve caber na largura do dispositivo.",
      },
    ]);
  });

  test("um erro de senha é explicável e não apaga o trabalho do usuário", async ({
    page,
  }, testInfo) => {
    await page.unrouteAll({ behavior: "wait" });
    await mockPlatform(page, { rejectFirstRegistration: true });
    await page.goto("/login/?mode=register");
    await chooseEssentialMeasurement(page);
    await waitForAccessFormHydration(page);

    await page.getByLabel("Como podemos chamar você?").fill("Maria");
    await page.getByLabel("Seu melhor e-mail").fill("maria@example.com");
    await page.getByLabel("Sua senha").fill("senhafraca");
    await page.getByRole("button", { name: "Criar minha conta grátis" }).click();

    const alert = page.getByRole("alert");
    await expect(alert).toContainText(
      "Use ao menos 8 caracteres, com maiúscula, minúscula e número.",
    );
    await expect(page.getByLabel("Como podemos chamar você?")).toHaveValue("Maria");
    await expect(page.getByLabel("Seu melhor e-mail")).toHaveValue("maria@example.com");
    await expect(page.getByLabel("Sua senha")).toHaveValue("senhafraca");

    const recoveryActions = await page
      .getByRole("button", { name: "Criar minha conta grátis" })
      .count();

    await validateFrictionBudget(testInfo, "recuperacao-de-erro", [
      {
        metric: "Campos apagados após erro",
        observed: 0,
        budget: 0,
        unit: "campos",
        note: "O usuário deve corrigir a senha sem redigitar nome ou e-mail.",
      },
      {
        metric: "Ações necessárias para tentar novamente",
        observed: recoveryActions,
        budget: 1,
        unit: "ação",
        note: "A ação principal deve permanecer disponível junto ao erro.",
      },
    ]);
  });

  test("o cadastro pode ser concluído sem depender do mouse", async ({
    page,
  }, testInfo) => {
    await page.goto("/login/?mode=register");
    await chooseEssentialMeasurement(page);
    await waitForAccessFormHydration(page);

    const name = page.getByLabel("Como podemos chamar você?");
    const email = page.getByLabel("Seu melhor e-mail");
    const password = page.getByLabel("Sua senha");
    const passwordToggle = page.getByRole("button", { name: "Mostrar senha" });
    const submit = page.getByRole("button", { name: "Criar minha conta grátis" });

    await name.focus();
    await expect(name).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(email).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(password).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(passwordToggle).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(submit).toBeFocused();

    await validateFrictionBudget(testInfo, "cadastro-por-teclado", [
      {
        metric: "Tabs dos dados à ação principal",
        observed: 4,
        budget: 4,
        unit: "tabs",
        note: "A ordem deve seguir nome, e-mail, senha, controle de senha e envio.",
      },
      {
        metric: "Controles sem nome acessível",
        observed: 0,
        budget: 0,
        unit: "controles",
        note: "Todos os elementos da sequência são encontrados pelo nome.",
      },
    ]);
  });

  test("o Google abre o estúdio sem formulário nem código por e-mail", async ({
    page,
  }, testInfo) => {
    await page.goto("/login/?mode=register");
    await chooseEssentialMeasurement(page);
    await waitForAccessFormHydration(page);

    await page.getByRole("button", { name: "Continuar com Google" }).click();

    await expect(page).toHaveURL(/\/biblioteca\/gerador\/?$/);
    await expect(page.getByRole("heading", { name: "O que você quer criar?" })).toBeVisible();
    await expect(page.locator(".express-flow")).toHaveAttribute(
      "data-interactive",
      "true",
    );

    await validateFrictionBudget(testInfo, "entrada-com-google", [
      {
        metric: "Ações de autenticação",
        observed: 1,
        budget: 1,
        unit: "ação",
        note: "O Google substitui nome, e-mail, senha e confirmação manual.",
      },
      {
        metric: "Campos digitados",
        observed: 0,
        budget: 0,
        unit: "campos",
        note: "O fluxo federado não deve pedir novamente dados já autorizados.",
      },
      {
        metric: "Códigos copiados do e-mail",
        observed: 0,
        budget: 0,
        unit: "códigos",
        note: "O login federado deve eliminar a confirmação manual por e-mail.",
      },
    ]);
  });

  test("cadastro, confirmação e primeira música formam uma jornada contínua", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await chooseEssentialMeasurement(page);
    await page.getByRole("link", { name: /criar grátis agora/i }).click();
    await waitForAccessFormHydration(page);

    await page.getByLabel("Como podemos chamar você?").fill("Maria");
    await page.getByLabel("Seu melhor e-mail").fill("maria@example.com");
    await page.getByLabel("Sua senha").fill("SenhaForte1");
    await page.getByRole("button", { name: "Criar minha conta grátis" }).click();

    await expect(page.getByRole("heading", { name: "Confirme seu e-mail." })).toBeVisible();
    await page.getByLabel("Código recebido").fill("123456");
    await page.getByRole("button", { name: "Confirmar e começar" }).click();

    await expect(page).toHaveURL(/\/biblioteca\/gerador\/?$/);
    await expect(page.getByRole("heading", { name: "O que você quer criar?" })).toBeVisible();
    await expect(page.locator(".express-flow")).toHaveAttribute(
      "data-interactive",
      "true",
    );

    let creativeDecisions = 0;
    const continueButton = page.getByRole("button", { name: "Continuar →" });

    await page.getByRole("button", { name: /Homenagem/ }).click();
    await expect(page.getByRole("button", { name: /Homenagem/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    creativeDecisions += 1;
    await continueButton.click();
    await page
      .getByPlaceholder("Para quem é a homenagem e o que essa pessoa representa?")
      .fill("Quero homenagear minha mãe por tudo que ela fez pela família.");
    creativeDecisions += 1;
    await continueButton.click();

    await expect(
      page.getByRole("heading", {
        name: "Como essa música deve fazer alguém se sentir?",
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Saudade/ }).click();
    creativeDecisions += 1;
    await continueButton.click();

    await expect(
      page.getByRole("heading", { name: "Qual estilo combina com a sua ideia?" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Sertanejo universitário/i }).click();
    creativeDecisions += 1;
    await continueButton.click();

    await expect(
      page.getByRole("heading", { name: "Que voz conta melhor essa história?" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Feminina e forte/ }).click();
    creativeDecisions += 1;
    await continueButton.click();

    await expect(
      page.getByRole("heading", { name: "É essa música que você quer criar?" }),
    ).toBeVisible();
    const creationButton = page.getByRole("button", {
      name: /Criar 1 música grátis/,
    });
    await expect(creationButton).toBeEnabled();
    await creationButton.click();

    await expect(
      page.getByRole("heading", { name: "Ouça o que nasceu da sua ideia." }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Raiz que me guia")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Escolher e criar capa" }),
    ).toBeVisible();

    await validateFrictionBudget(testInfo, "primeiro-valor", [
      {
        metric: "Decisões criativas antes da confirmação",
        observed: creativeDecisions,
        budget: 5,
        unit: "decisões",
        note: "O criador promete uma decisão por etapa.",
      },
      {
        metric: "Entradas de texto criativo obrigatórias",
        observed: 1,
        budget: 1,
        unit: "texto",
        note: "A história é o único texto necessário; as demais escolhas são visuais.",
      },
      {
        metric: "Dead ends até o primeiro resultado",
        observed: 0,
        budget: 0,
        unit: "bloqueios",
        note: "Cada etapa deve apresentar uma próxima ação visível e habilitável.",
      },
    ]);
  });
});
