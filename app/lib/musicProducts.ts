export type MusicProduct = {
  id: string;
  offerVersion: string;
  name: string;
  shortName: string;
  description: string;
  priceCents: number;
  credits: number;
  creditsPerRound: number;
  paidRounds: number;
  versionsPerRound: number;
  type: "starter" | "recharge" | "subscription";
  badge?: string;
};

export const STARTER_PRODUCT: MusicProduct = {
  id: "starter_20",
  offerVersion: "music_present_v1",
  name: "Projeto Música Presente",
  shortName: "Música Presente",
  description: "20 créditos musicais: 10 rodadas pagas, com até 2 versões por rodada.",
  priceCents: 4_997,
  credits: 20,
  creditsPerRound: 2,
  paidRounds: 10,
  versionsPerRound: 2,
  type: "starter",
};

export const RECHARGE_PRODUCTS: MusicProduct[] = [
  {
    id: "recharge_20",
    offerVersion: "music_present_v1",
    name: "Recarga Essencial — 20 créditos",
    shortName: "Essencial",
    description: "10 rodadas pagas, com até 2 versões por rodada.",
    priceCents: 4_997,
    credits: 20,
    creditsPerRound: 2,
    paidRounds: 10,
    versionsPerRound: 2,
    type: "recharge",
  },
  {
    id: "recharge_50",
    offerVersion: "music_present_v1",
    name: "Recarga Criador — 50 créditos",
    shortName: "Criador",
    description: "25 rodadas pagas, com até 2 versões por rodada.",
    priceCents: 10_997,
    credits: 50,
    creditsPerRound: 2,
    paidRounds: 25,
    versionsPerRound: 2,
    type: "recharge",
  },
  {
    id: "recharge_100",
    offerVersion: "music_present_v1",
    name: "Recarga Estúdio — 100 créditos",
    shortName: "Estúdio",
    description: "50 rodadas pagas, com até 2 versões por rodada.",
    priceCents: 19_997,
    credits: 100,
    creditsPerRound: 2,
    paidRounds: 50,
    versionsPerRound: 2,
    type: "recharge",
  },
];

export const SUBSCRIPTION_PRODUCTS: MusicProduct[] = [
  {
    id: "club_60",
    offerVersion: "music_present_v1",
    name: "Clube Criador — 60 créditos por mês",
    shortName: "Clube Criador",
    description: "30 rodadas pagas por mensalidade, com até 2 versões por rodada.",
    priceCents: 9_997,
    credits: 60,
    creditsPerRound: 2,
    paidRounds: 30,
    versionsPerRound: 2,
    type: "subscription",
    badge: "MELHOR CUSTO POR CRÉDITO",
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
