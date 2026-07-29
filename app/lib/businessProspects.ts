export const businessProspectStorageKey = "academia_business_jingle_prospect_v1";

export type BusinessProspect = {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  mapsUrl: string;
  imageUrl: string;
  rating: number | null;
  reviewsCount: number | null;
};

export function isBusinessProspect(value: unknown): value is BusinessProspect {
  if (!value || typeof value !== "object") return false;
  const prospect = value as Partial<BusinessProspect>;
  return typeof prospect.id === "string"
    && typeof prospect.name === "string"
    && prospect.name.trim().length >= 2
    && typeof prospect.category === "string"
    && typeof prospect.address === "string";
}

export function createBusinessJingleIdea(prospect: BusinessProspect) {
  const details = [
    `Crie um jingle para ${prospect.name}.`,
    prospect.category ? `É um negócio de ${prospect.category}.` : "",
    prospect.address ? `Atende em ${prospect.address}.` : "",
    "O refrão deve repetir o nome da empresa, comunicar confiança e terminar com uma chamada curta para conhecer ou comprar.",
    "Não invente promoções, preços, endereço, telefone ou qualidades que não foram informadas.",
  ].filter(Boolean);
  return details.join(" ").slice(0, 500);
}
