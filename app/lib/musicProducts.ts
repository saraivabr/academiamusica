export type MusicProduct = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  priceCents: number;
  credits: number;
  type: "starter" | "recharge" | "subscription";
  badge?: string;
};

export const STARTER_PRODUCT: MusicProduct = {
  id: "starter_20",
  name: "Acesso Academia Música IA + 20 músicas",
  shortName: "Comece agora",
  description: "Acesso permanente à plataforma com 20 músicas para criar e baixar.",
  priceCents: 4_997,
  credits: 20,
  type: "starter",
};

export const RECHARGE_PRODUCTS: MusicProduct[] = [
  {
    id: "recharge_20",
    name: "Recarga Essencial — 20 músicas",
    shortName: "Essencial",
    description: "Para continuar criando no seu ritmo.",
    priceCents: 4_997,
    credits: 20,
    type: "recharge",
  },
  {
    id: "recharge_50",
    name: "Recarga Criador — 50 músicas",
    shortName: "Criador",
    description: "Mais espaço para testar estilos e comparar versões.",
    priceCents: 10_997,
    credits: 50,
    type: "recharge",
    badge: "MAIS ESCOLHIDO",
  },
  {
    id: "recharge_100",
    name: "Recarga Estúdio — 100 músicas",
    shortName: "Estúdio",
    description: "Volume para repertório, clientes e lançamentos.",
    priceCents: 19_997,
    credits: 100,
    type: "recharge",
  },
];

export const SUBSCRIPTION_PRODUCTS: MusicProduct[] = [
  {
    id: "club_60",
    name: "Clube Criador — 60 músicas por mês",
    shortName: "Clube Criador",
    description: "60 músicas creditadas a cada mensalidade paga via Pix Automático.",
    priceCents: 9_997,
    credits: 60,
    type: "subscription",
    badge: "MELHOR CUSTO POR MÚSICA",
  },
];

export const ALL_MUSIC_PRODUCTS = [
  STARTER_PRODUCT,
  ...RECHARGE_PRODUCTS,
  ...SUBSCRIPTION_PRODUCTS,
];

export function formatProductPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
}
