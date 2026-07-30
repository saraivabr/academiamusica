import { expect, test } from "@playwright/test";
import { mockPlatform } from "./support/mock-platform";

const productRoutes = [
  ["/", "Uma história sua."],
  ["/login/", "Abra seu estúdio."],
  ["/login/google/callback/", "Vamos tentar de novo."],
  ["/academia/", "Vamos criar a primeira?"],
  ["/academia/comecar/", "Você aprende enquanto cria."],
  ["/academia/identidade/", "Dê rosto, atmosfera e presença"],
  ["/academia/musica/", "Transforme escolhas simples em som."],
  ["/academia/publicacao/", "Faça sua música existir no mundo."],
  ["/biblioteca/", "Seu repertório começa com uma ideia."],
  ["/biblioteca/gerador/", "Sua música, passo a passo."],
  ["/biblioteca/negocios/", "Encontre negócios que podem virar música."],
  ["/biblioteca/capa/", "Crie uma música antes da capa."],
  ["/biblioteca/compositor/", "Dê uma vida para a música."],
  ["/biblioteca/creditos/", "Escolha como continuar."],
  ["/biblioteca/estilos-brasileiros/", "O Brasil não cabe"],
  ["/checkout/", "Agora transforme a direção em música completa."],
  ["/preview/", "Sua história começa a ganhar música aqui."],
  ["/obrigado/", "Vamos encontrar sua compra."],
  ["/pagamento-pendente/", "Estamos quase lá."],
  ["/pagamento-recusado/", "Vamos tentar de novo."],
  ["/suporte/", "Como podemos ajudar?"],
  ["/privacidade/", "Política de privacidade"],
  ["/reembolso/", "Política de reembolso"],
  ["/termos/", "Termos de uso"],
] as const;

test.describe("P0 e P1 — produto inteiro sem becos sem saída", () => {
  test.beforeEach(async ({ page }) => {
    await mockPlatform(page);
  });

  test("todas as páginas reais carregam com uma orientação em português", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    for (const [path, expectedText] of productRoutes) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBeLessThan(400);
      await expect(page.getByText(expectedText, { exact: false }).first(), path)
        .toBeVisible({ timeout: 15_000 });
      await expect(page.locator("main").first(), path).toBeVisible();
    }
  });

  test("o CTA da demonstração é uma porta real e identifica sua posição", async ({
    page,
  }) => {
    await page.goto("/");
    const demoCta = page.locator("a[data-track-placement='how_it_works']");
    await expect(demoCta).toHaveAttribute("href", "/preview/");
    await expect(demoCta).toHaveAttribute("data-track", "offer_cta");
    await demoCta.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/preview\/?$/);
  });

  test("a página inexistente oferece duas rotas de recuperação", async ({
    page,
  }) => {
    const response = await page.goto("/isso-nao-existe/");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Esse caminho não existe." }))
      .toBeVisible();
    await expect(page.getByRole("link", { name: "Voltar ao início" }))
      .toHaveAttribute("href", "/");
    await expect(page.getByRole("link", { name: "Entrar no estúdio" }))
      .toHaveAttribute("href", /next=\/biblioteca\/gerador/);
  });

  test("os assuntos de suporte são ações reais e contextualizadas", async ({
    page,
  }) => {
    await page.goto("/suporte/");
    const topics = page.getByRole("region", { name: "Assuntos de suporte" })
      .getByRole("link");
    await expect(topics).toHaveCount(3);
    for (const topic of await topics.all()) {
      await expect(topic).toHaveAttribute("href", /^https:\/\/wa\.me\//);
      await expect(topic).toHaveAttribute("data-track-placement", /^topic_/);
    }
  });

  test("pagamento recusado e pendente têm recuperação coerente", async ({
    page,
  }) => {
    await page.goto("/pagamento-recusado/");
    await expect(page.getByRole("link", { name: "Entrar e escolher créditos" }))
      .toHaveAttribute("href", /next=\/biblioteca\/creditos/);
    await page.goto("/pagamento-pendente/");
    await expect(page.getByRole("link", { name: "Verificar novamente" }))
      .toHaveAttribute("href", "/obrigado/");
  });

  test("a biblioteca vazia mostra somente o primeiro passo útil", async ({
    page,
  }) => {
    await page.goto("/biblioteca/");
    await expect(page.getByRole("heading", {
      name: "Seu repertório começa com uma ideia.",
    })).toBeVisible();
    await expect(page.getByRole("link", {
      name: "Criar minha primeira música →",
    })).toBeVisible();
    await expect(page.getByRole("button", {
      name: "Tocar música mais recente",
    })).toHaveCount(0);
    await expect(page.locator(".library-learning")).toHaveCount(0);
  });

  test("a história preparada entra no criador sem copiar prompt", async ({
    page,
  }) => {
    await page.goto("/biblioteca/compositor/");
    await page.getByLabel("Conte a cena ou história")
      .fill("Minha mãe criou a família inteira e nunca perdeu o bom humor.");
    await page.getByRole("link", { name: "Usar esta história no criador →" })
      .click();

    await expect(page.getByRole("status"))
      .toContainText("Sua história foi aplicada.");
    await expect(page.getByRole("heading", {
      name: "O que você quer sentir quando der o play?",
    })).toBeVisible();
  });

  test("o clima é escolhido por uma intenção fácil de reconhecer", async ({
    page,
  }) => {
    await page.goto("/biblioteca/gerador/");
    const consent = page.getByRole("complementary", {
      name: "Preferências de medição",
    });
    await expect(consent).toHaveAttribute("data-interactive", "true", {
      timeout: 15_000,
    });
    await consent.getByRole("button", { name: "Somente essenciais" }).click();
    await expect(page.locator(".express-flow"))
      .toHaveAttribute("data-interactive", "true");

    const continueButton = page.getByRole("button", { name: "Continuar →" });
    await continueButton.click();
    await page
      .getByPlaceholder("Conte o momento mais importante dessa história…")
      .fill("O dia em que minha família se reuniu para comemorar uma grande conquista.");
    await continueButton.click();

    await expect(page.getByRole("heading", {
      name: "O que você quer sentir quando der o play?",
    })).toBeVisible();
    await expect(page.getByText(
      "Escolha a frase que mais combina com a sua história.",
      { exact: false },
    )).toBeVisible();
    await expect(page.locator(".emotion-grid button")).toHaveCount(6);

    const choice = page.getByRole("button", {
      name: /Quero lembrar com carinho/,
    });
    await choice.click();
    await expect(choice).toHaveAttribute("aria-pressed", "true");
    await continueButton.click();
    await expect(page.getByRole("heading", {
      name: "Qual estilo combina com a sua ideia?",
    })).toBeVisible();
  });

  test("o estilo escolhido entra diretamente na direção da música", async ({
    page,
  }) => {
    await page.goto("/biblioteca/estilos-brasileiros/");
    await page.getByRole("link", { name: "Usar no criador →" }).first().click();

    await expect(page.getByRole("status"))
      .toContainText("Sertanejo universitário foi aplicado.");
    await expect(page.getByRole("heading", { name: "Qual é a sua ideia?" }))
      .toBeVisible();
  });

  test("a página de créditos nomeia cada escolha e mantém uma ação acima da dobra", async ({
    page,
  }) => {
    await page.goto("/biblioteca/creditos/");
    await expect(page.getByRole("link", { name: "Ver opções de recarga ↓" }))
      .toBeVisible();
    await expect(page.getByRole("button", { name: "Adicionar 20 créditos" }))
      .toBeVisible();
    await expect(page.getByRole("button", { name: "Adicionar 50 créditos" }))
      .toBeVisible();
    await expect(page.getByRole("button", { name: "Adicionar 100 créditos" }))
      .toBeVisible();
  });
});
