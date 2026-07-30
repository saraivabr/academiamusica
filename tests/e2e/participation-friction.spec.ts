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

  test("a proposta e a prévia grátis aparecem antes da primeira rolagem", async ({
    page,
  }, testInfo) => {
    await page.goto("/");

    const primaryCta = page.getByRole("button", {
      name: "Começar minha prévia grátis",
    });
    await expect(primaryCta).toBeVisible();
    await expect(page.locator(".br-hero-note")).toContainText("Prévia criativa grátis");
    await expect(page.locator(".br-hero-note")).toContainText("Áudio completo após o Pix");

    const horizontalOverflow = await page.evaluate(
      () => Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    );

    await chooseEssentialMeasurement(page);
    await page.getByLabel("Que história você quer transformar em música?")
      .fill("Uma homenagem para minha mãe, que sustentou nossa família com coragem.");
    await primaryCta.click();
    await expect(page).toHaveURL(/\/preview\/?\?idea=/);
    await expect(page.getByRole("heading", {
      name: "Sua história começa a ganhar música aqui.",
    })).toBeVisible();
    await page.getByRole("button", { name: "Ver minha prévia criativa" }).click();
    await expect(page.getByText("SUA DIREÇÃO ESTÁ PRONTA")).toBeVisible();
    await expect(page.getByText("20 créditos musicais")).toBeVisible();

    await validateFrictionBudget(testInfo, "descoberta-e-previa", [
      {
        metric: "Interrupções obrigatórias antes do cadastro",
        observed: 1,
        budget: 1,
        unit: "decisão",
        note: "O consentimento deve ser resolvido em uma única ação.",
      },
      {
        metric: "Ações da home até a prévia",
        observed: 2,
        budget: 2,
        unit: "ações",
        note: "Uma ação leva a história para a prévia e outra revela a direção.",
      },
      {
        metric: "Cadastros antes da prévia",
        observed: 0,
        budget: 0,
        unit: "cadastros",
        note: "A direção criativa deve aparecer antes de pedir conta.",
      },
      {
        metric: "Áudios gratuitos antes do Pix",
        observed: 0,
        budget: 0,
        unit: "áudios",
        note: "A etapa gratuita valida a direção sem consumir geração musical.",
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
    await page.getByRole("button", { name: "Criar minha conta" }).click();

    const alert = page.getByRole("alert");
    await expect(alert).toContainText(
      "Use ao menos 8 caracteres, com maiúscula, minúscula e número.",
    );
    await expect(page.getByLabel("Como podemos chamar você?")).toHaveValue("Maria");
    await expect(page.getByLabel("Seu melhor e-mail")).toHaveValue("maria@example.com");
    await expect(page.getByLabel("Sua senha")).toHaveValue("senhafraca");

    const recoveryActions = await page
      .getByRole("button", { name: "Criar minha conta" })
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
    const submit = page.getByRole("button", { name: "Criar minha conta" });

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

    await expect(page).toHaveURL(/\/biblioteca\/gerador\/?$/, {
      timeout: 15_000,
    });
    await expect(page.getByRole("heading", { name: "O que você quer criar?" })).toBeVisible();
    await expect(page.locator(".express-flow")).toHaveAttribute(
      "data-interactive",
      "true",
      { timeout: 15_000 },
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
    test.setTimeout(60_000);
    await page.goto("/login/?mode=register");
    await chooseEssentialMeasurement(page);
    await waitForAccessFormHydration(page);

    await page.getByLabel("Como podemos chamar você?").fill("Maria");
    await page.getByLabel("Seu melhor e-mail").fill("maria@example.com");
    await page.getByLabel("Sua senha").fill("SenhaForte1");
    await page.getByRole("button", { name: "Criar minha conta" }).click();

    await expect(page.getByRole("heading", { name: "Confirme seu e-mail." })).toBeVisible();
    await page.getByLabel("Código recebido").fill("123456");
    await page.getByRole("button", { name: "Confirmar e começar" }).click();

    await expect(page).toHaveURL(/\/biblioteca\/gerador\/?$/);
    await expect(page.getByRole("heading", { name: "O que você quer criar?" })).toBeVisible();
    await expect(page.locator(".express-flow")).toHaveAttribute(
      "data-interactive",
      "true",
      { timeout: 15_000 },
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
        name: "O que você quer sentir quando der o play?",
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Quero lembrar com carinho/ }).click();
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
      name: /Criar 2 versões/,
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
