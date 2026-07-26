"use client";

export type CoverFamily =
  | "sertanejo"
  | "forro"
  | "samba"
  | "funk"
  | "trap"
  | "mpb"
  | "soul"
  | "bahia"
  | "norte"
  | "gospel"
  | "pop";

export type CoverDirection = {
  id: "portrait" | "scene" | "graphic";
  name: string;
  description: string;
  treatment: string;
};

export type CoverFamilyProfile = {
  id: CoverFamily;
  label: string;
  note: string;
  palette: [string, string, string];
  titleColor: string;
  directions: CoverDirection[];
};

const directions = {
  sertanejo: [
    { id: "portrait", name: "Retrato de ouro", description: "Luz de fim de tarde, presença humana e calor.", treatment: "editorial" },
    { id: "scene", name: "Estrada e horizonte", description: "Paisagem ampla, poeira, céu e memória.", treatment: "cinematográfico" },
    { id: "graphic", name: "Noite de palco", description: "Contraste escuro, luzes quentes e impacto.", treatment: "show" },
  ],
  forro: [
    { id: "portrait", name: "Sol do Nordeste", description: "Retrato caloroso, terra e textura artesanal.", treatment: "orgânico" },
    { id: "scene", name: "Festa em movimento", description: "Cor, bandeirolas abstratas e energia de dança.", treatment: "festivo" },
    { id: "graphic", name: "Cordel moderno", description: "Formas gráficas, gravura e contraste popular.", treatment: "ilustrado" },
  ],
  samba: [
    { id: "portrait", name: "Roda dourada", description: "Proximidade, pele quente e luz de encontro.", treatment: "documental" },
    { id: "scene", name: "Cidade que balança", description: "Rua, arquitetura brasileira e elegância.", treatment: "urbano" },
    { id: "graphic", name: "Vinil brasileiro", description: "Geometria rítmica e nostalgia sofisticada.", treatment: "analógico" },
  ],
  funk: [
    { id: "portrait", name: "Flash da noite", description: "Retrato direto, brilho, atitude e contraste.", treatment: "flash" },
    { id: "scene", name: "Baile elétrico", description: "Neon, caixas de som abstratas e movimento.", treatment: "noturno" },
    { id: "graphic", name: "Rua máxima", description: "Colagem, cor ácida e composição explosiva.", treatment: "maximalista" },
  ],
  trap: [
    { id: "portrait", name: "Noite de concreto", description: "Retrato escuro, recorte de luz e presença.", treatment: "editorial" },
    { id: "scene", name: "Cidade depois da meia-noite", description: "Arquitetura, névoa e ambição cinematográfica.", treatment: "cinematográfico" },
    { id: "graphic", name: "Cromo e ruído", description: "Metal, grão, tipografia brutal e luxo contido.", treatment: "gráfico" },
  ],
  mpb: [
    { id: "portrait", name: "Intimidade analógica", description: "Retrato natural, silêncio e textura de filme.", treatment: "analógico" },
    { id: "scene", name: "Brasil contemporâneo", description: "Natureza e arquitetura em composição limpa.", treatment: "editorial" },
    { id: "graphic", name: "Poesia em formas", description: "Recortes, cor autoral e minimalismo artístico.", treatment: "colagem" },
  ],
  soul: [
    { id: "portrait", name: "Veludo noturno", description: "Luz lateral, profundidade e elegância.", treatment: "luxuoso" },
    { id: "scene", name: "Clube depois das onze", description: "Madeira, reflexos e atmosfera íntima.", treatment: "cinematográfico" },
    { id: "graphic", name: "Soul em vinil", description: "Tons quentes, grão e grafismo setentista.", treatment: "retrô" },
  ],
  bahia: [
    { id: "portrait", name: "Corpo e tambor", description: "Retrato forte, tecido e luz solar.", treatment: "vibrante" },
    { id: "scene", name: "Bloco em movimento", description: "Ritmo coletivo, cor e escala de rua.", treatment: "cinético" },
    { id: "graphic", name: "Símbolo e ritmo", description: "Padrões afro-brasileiros e formas marcantes.", treatment: "gráfico" },
  ],
  norte: [
    { id: "portrait", name: "Aparelhagem futura", description: "Retrato popular, brilho e cor elétrica.", treatment: "futurista" },
    { id: "scene", name: "Amazônia cromática", description: "Vegetação, água e atmosfera fantástica.", treatment: "cinematográfico" },
    { id: "graphic", name: "Cartaz do Norte", description: "Letreiros populares, formas e saturação.", treatment: "cartaz" },
  ],
  gospel: [
    { id: "portrait", name: "Luz que encontra", description: "Retrato sereno, respiro e esperança.", treatment: "luminoso" },
    { id: "scene", name: "Depois da tempestade", description: "Horizonte, luz atravessando e caminho.", treatment: "cinematográfico" },
    { id: "graphic", name: "Presença essencial", description: "Símbolo, espaço e luz em composição limpa.", treatment: "minimalista" },
  ],
  pop: [
    { id: "portrait", name: "Ícone em cor", description: "Retrato fashion, cor sólida e assinatura.", treatment: "editorial" },
    { id: "scene", name: "Sonho de estúdio", description: "Luz impossível, atmosfera e brilho controlado.", treatment: "onírico" },
    { id: "graphic", name: "Pop gráfico", description: "Blocos de cor, recortes e energia imediata.", treatment: "gráfico" },
  ],
} satisfies Record<CoverFamily, CoverDirection[]>;

export const coverFamilies: CoverFamilyProfile[] = [
  { id: "sertanejo", label: "Sertanejo", note: "calor humano, horizonte e palco", palette: ["#7a3f21", "#e8b86a", "#17100c"], titleColor: "#fff4dd", directions: directions.sertanejo },
  { id: "forro", label: "Forró e piseiro", note: "cor, festa e matéria popular", palette: ["#d84b25", "#f3c748", "#166b69"], titleColor: "#fff7de", directions: directions.forro },
  { id: "samba", label: "Samba e pagode", note: "encontro, cidade e memória", palette: ["#155b4a", "#efbd62", "#8c3428"], titleColor: "#fff6df", directions: directions.samba },
  { id: "funk", label: "Funk brasileiro", note: "flash, rua e energia máxima", palette: ["#6725d9", "#ff4fc8", "#caff3d"], titleColor: "#ffffff", directions: directions.funk },
  { id: "trap", label: "Rap e trap", note: "noite, presença e tensão", palette: ["#08090f", "#6748ff", "#c7ff43"], titleColor: "#f4f2ec", directions: directions.trap },
  { id: "mpb", label: "MPB e bossa", note: "poesia, recorte e sofisticação", palette: ["#1f5548", "#d88957", "#eee5ce"], titleColor: "#f9f1dd", directions: directions.mpb },
  { id: "soul", label: "Soul e romântico", note: "veludo, intimidade e elegância", palette: ["#3d1624", "#b86465", "#d5a768"], titleColor: "#fff0df", directions: directions.soul },
  { id: "bahia", label: "Axé e ritmos afro", note: "corpo, símbolo e movimento", palette: ["#ef4b2e", "#f6b928", "#0c6671"], titleColor: "#fff8df", directions: directions.bahia },
  { id: "norte", label: "Sons do Norte", note: "natureza, aparelhagem e cor", palette: ["#125943", "#f05e31", "#e5cf3d"], titleColor: "#fff7d8", directions: directions.norte },
  { id: "gospel", label: "Gospel", note: "luz, horizonte e esperança", palette: ["#315a78", "#e9c98b", "#f3eee4"], titleColor: "#ffffff", directions: directions.gospel },
  { id: "pop", label: "Pop brasileiro", note: "ícone, cor e impacto imediato", palette: ["#ef3d74", "#6338d0", "#ffcb3d"], titleColor: "#ffffff", directions: directions.pop },
];

export function coverFamilyById(id: CoverFamily) {
  return coverFamilies.find((family) => family.id === id) ?? coverFamilies[10];
}

export function inferCoverFamily(tags: string): CoverFamily {
  const value = tags.toLocaleLowerCase("pt-BR");
  if (/sertanejo|mod[aã]o|country/.test(value)) return "sertanejo";
  if (/forr[oó]|piseiro|bai[aã]o/.test(value)) return "forro";
  if (/pagode|samba|cavaquinho/.test(value)) return "samba";
  if (/funk carioca|funk melody|tamborz[aã]o|baile/.test(value)) return "funk";
  if (/trap|boom bap|hip.?hop|rap/.test(value)) return "trap";
  if (/mpb|bossa/.test(value)) return "mpb";
  if (/soul|r&b|arrocha|rom[aâ]ntic/.test(value)) return "soul";
  if (/ax[eé]|samba.?reggae|maracatu|frevo/.test(value)) return "bahia";
  if (/tecnobrega|carimb[oó]|par[aá]/.test(value)) return "norte";
  if (/gospel|worship|louvor/.test(value)) return "gospel";
  return "pop";
}
