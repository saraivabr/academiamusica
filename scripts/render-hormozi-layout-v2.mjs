import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const sourceDir = path.join(
  rootDir,
  "public/ads/hormozi-v2-20/layout-v2/backgrounds",
);
const outputDir = path.join(
  rootDir,
  "public/ads/hormozi-v2-20/layout-v2/final",
);
const logoDark = path.join(rootDir, "public/brand/musicacom-logo-horizontal.png");
const logoLight = path.join(
  rootDir,
  "public/brand/musicacom-logo-horizontal-light.png",
);

const W = 1080;
const H = 1920;
const CREAM = "#F4EFE5";
const PAPER = "#FBF8F1";
const INK = "#062F27";
const GREEN = "#00D784";
const GREEN_SOFT = "#9CE7C7";
const CORAL = "#FF725C";
const AMBER = "#E5A24B";

const campaigns = [
  {
    id: "c01",
    slug: "historia-da-mae",
    layout: "photo",
    background: "c01.png",
    headline: ["A história dela", "virou música."],
    sub: ["Comece pela prévia", "criativa grátis."],
    cta: "Criar prévia",
  },
  {
    id: "c02",
    slug: "musica-do-casal",
    layout: "photo",
    background: "c02.png",
    headline: ["A música que só", "vocês entendem."],
    sub: ["Uma história única.", "Uma direção só de vocês."],
    cta: "Contar nossa história",
  },
  {
    id: "c03",
    slug: "aniversario",
    layout: "photo",
    background: "c03.png",
    headline: ["Um presente", "que pode ser ouvido."],
    sub: ["Transforme lembranças", "em música."],
    cta: "Criar presente",
  },
  {
    id: "c04",
    slug: "legado",
    layout: "photo",
    background: "c04.png",
    headline: ["Algumas histórias", "merecem continuar."],
    sub: ["Uma homenagem feita", "de memórias reais."],
    cta: "Começar homenagem",
  },
  {
    id: "c05",
    slug: "votos",
    layout: "photo-light",
    background: "c05.png",
    headline: ["Seus votos", "ganharam melodia."],
    sub: ["Comece pela direção", "criativa."],
    cta: "Criar direção",
  },
  {
    id: "c06",
    slug: "previa-antes-de-pagar",
    layout: "graphic",
    theme: "light",
    art: "preview",
    headline: ["Veja a direção.", "Depois decida."],
    sub: ["Prévia criativa grátis.", "Sem áudio completo."],
    cta: "Ver minha prévia",
  },
  {
    id: "c07",
    slug: "escolha-sentimento",
    layout: "graphic",
    theme: "dark",
    art: "moods",
    headline: ["Você escolhe", "o sentimento."],
    sub: ["A história continua", "sendo sua."],
    cta: "Escolher o clima",
  },
  {
    id: "c08",
    slug: "duas-versoes",
    layout: "graphic",
    theme: "light",
    art: "compare",
    headline: ["Uma história.", "Dois caminhos."],
    sub: ["Até 2 versões", "por rodada."],
    cta: "Conhecer a oferta",
  },
  {
    id: "c09",
    slug: "historia-ao-play",
    layout: "graphic",
    theme: "dark",
    art: "journey",
    headline: ["Da história", "ao play."],
    sub: ["Um processo simples", "e guiado."],
    cta: "Começar agora",
  },
  {
    id: "c10",
    slug: "biblioteca-download",
    layout: "graphic",
    theme: "light",
    art: "library",
    headline: ["Ouça. Guarde.", "Baixe."],
    sub: ["Sua música na", "sua biblioteca."],
    cta: "Ver como funciona",
  },
  {
    id: "c11",
    slug: "nao-precisa-cantar",
    layout: "photo-light",
    background: "c11.png",
    headline: ["Você não precisa", "saber cantar."],
    sub: ["Só precisa conhecer", "a história."],
    cta: "Fazer minha prévia",
  },
  {
    id: "c12",
    slug: "tres-lembrancas",
    layout: "photo-light",
    background: "c12.png",
    headline: ["Comece com", "3 lembranças."],
    sub: ["O processo guia", "o restante."],
    cta: "Escrever lembranças",
  },
  {
    id: "c13",
    slug: "sem-prompt",
    layout: "graphic",
    theme: "dark",
    art: "questions",
    headline: ["Sem prompt", "complicado."],
    sub: ["Você conta.", "A plataforma conduz."],
    cta: "Iniciar processo",
  },
  {
    id: "c14",
    slug: "kit-completo",
    layout: "graphic",
    theme: "light",
    art: "stack",
    headline: ["Um projeto.", "Tudo organizado."],
    sub: ["Música, capa, biblioteca", "e download."],
    cta: "Criar meu projeto",
  },
  {
    id: "c15",
    slug: "pix-na-plataforma",
    layout: "graphic",
    theme: "dark",
    art: "pix",
    headline: ["O Pix aparece", "aqui mesmo."],
    sub: ["Sem sair da", "musicacom.ia."],
    cta: "Fazer minha prévia",
  },
  {
    id: "c16",
    slug: "outro-perfume",
    layout: "photo",
    background: "c16.png",
    headline: ["Outra caneca?", "Outro perfume?"],
    sub: ["Dê uma história.", "Não só uma coisa."],
    cta: "Criar presente",
  },
  {
    id: "c17",
    slug: "oferta-direta",
    layout: "graphic",
    theme: "offer",
    art: "offer",
    headline: ["Projeto Música", "Presente."],
    sub: ["Pagamento único", "via Pix."],
    cta: "Criar prévia grátis",
  },
  {
    id: "c18",
    slug: "garantia-sete-dias",
    layout: "graphic",
    theme: "light",
    art: "guarantee",
    headline: ["Prévia primeiro.", "Garantia depois."],
    sub: ["7 dias a partir da", "confirmação da compra."],
    cta: "Conhecer a oferta",
  },
  {
    id: "c19",
    slug: "creditos-sem-validade",
    layout: "graphic",
    theme: "dark",
    art: "timeline",
    headline: ["Crie no", "seu ritmo."],
    sub: ["Créditos sem", "prazo de validade."],
    cta: "Começar agora",
  },
  {
    id: "c20",
    slug: "credito-protegido",
    layout: "graphic",
    theme: "light",
    art: "return",
    headline: ["Falha técnica?", "O crédito volta."],
    sub: ["Seu saldo é", "preservado."],
    cta: "Ver como funciona",
  },
];

function esc(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textLines(lines, x, y, {
  size,
  color,
  weight = 700,
  lineHeight = 1.04,
  anchor = "start",
  tracking = 0,
} = {}) {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${tracking}">${lines
    .map(
      (line, index) =>
        `<tspan x="${x}" dy="${index === 0 ? 0 : size * lineHeight}">${esc(line)}</tspan>`,
    )
    .join("")}</text>`;
}

function pill(x, y, width, label, color, textColor) {
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="76" rx="38" fill="${color}"/>
    <text x="${x + 34}" y="${y + 49}" fill="${textColor}" font-family="Arial, Helvetica, sans-serif" font-size="29" font-weight="700">${esc(label)}  →</text>
  </g>`;
}

function wave(x, y, width, color) {
  const bars = [28, 52, 84, 42, 110, 64, 34, 78, 118, 56, 86, 38, 64];
  const gap = width / bars.length;
  return bars
    .map(
      (height, i) =>
        `<rect x="${x + i * gap}" y="${y - height / 2}" width="${Math.max(8, gap - 8)}" height="${height}" rx="6" fill="${color}" opacity="${0.72 + (i % 3) * 0.1}"/>`,
    )
    .join("");
}

function previewArt(colors) {
  const labels = ["Título", "Refrão", "Emoção", "Estilo"];
  return `<g transform="translate(88 690)">
    <rect width="904" height="620" rx="52" fill="${colors.panel}" stroke="${colors.stroke}" stroke-width="2"/>
    <text x="58" y="82" fill="${colors.muted}" font-family="Arial" font-size="25" font-weight="700" letter-spacing="3">PRÉVIA CRIATIVA</text>
    ${labels
      .map((label, i) => {
        const x = 58 + (i % 2) * 406;
        const y = 132 + Math.floor(i / 2) * 190;
        return `<g transform="translate(${x} ${y})">
          <rect width="352" height="148" rx="28" fill="${colors.card}"/>
          <circle cx="50" cy="48" r="13" fill="${i === 2 ? CORAL : GREEN}"/>
          <text x="82" y="58" fill="${colors.text}" font-family="Arial" font-size="30" font-weight="700">${label}</text>
          <rect x="34" y="92" width="${210 + i * 18}" height="9" rx="4" fill="${colors.stroke}"/>
          <rect x="34" y="113" width="${150 + i * 24}" height="9" rx="4" fill="${colors.stroke}" opacity=".65"/>
        </g>`;
      })
      .join("")}
    <text x="58" y="566" fill="${colors.muted}" font-family="Arial" font-size="25">Sem player. Sem áudio completo.</text>
  </g>`;
}

function moodsArt(colors) {
  const items = [
    ["EMOCIONANTE", GREEN, "●"],
    ["ROMÂNTICA", CORAL, "♥"],
    ["DIVERTIDA", AMBER, "✦"],
  ];
  return `<g transform="translate(76 720)">
    ${items
      .map(
        ([label, color, icon], i) => `<g transform="translate(${i * 316} ${i % 2 ? 70 : 0})">
        <rect width="282" height="500" rx="141" fill="${colors.card}" stroke="${colors.stroke}" stroke-width="2"/>
        <circle cx="141" cy="150" r="78" fill="${color}" opacity=".2"/>
        <text x="141" y="177" fill="${color}" font-family="Arial" font-size="72" font-weight="700" text-anchor="middle">${icon}</text>
        <text x="141" y="330" fill="${colors.text}" font-family="Arial" font-size="23" font-weight="700" text-anchor="middle" letter-spacing="1.5">${label}</text>
        <rect x="76" y="378" width="130" height="8" rx="4" fill="${color}"/>
      </g>`,
      )
      .join("")}
  </g>`;
}

function compareArt(colors) {
  return `<g transform="translate(90 710)">
    <path d="M450 40 C450 160 286 175 250 245" fill="none" stroke="${colors.stroke}" stroke-width="5"/>
    <path d="M450 40 C450 160 614 175 650 245" fill="none" stroke="${colors.stroke}" stroke-width="5"/>
    <rect x="300" width="300" height="120" rx="32" fill="${colors.panel}"/>
    <text x="450" y="74" fill="${colors.text}" font-family="Arial" font-size="28" font-weight="700" text-anchor="middle">UMA HISTÓRIA</text>
    ${[
      [80, "VERSÃO A", GREEN],
      [520, "VERSÃO B", CORAL],
    ]
      .map(
        ([x, label, color]) => `<g transform="translate(${x} 250)">
        <rect width="360" height="440" rx="42" fill="${colors.card}" stroke="${colors.stroke}" stroke-width="2"/>
        <text x="38" y="72" fill="${color}" font-family="Arial" font-size="25" font-weight="700" letter-spacing="2">${label}</text>
        <circle cx="180" cy="205" r="90" fill="${color}" opacity=".12"/>
        ${wave(72, 205, 220, color)}
        <rect x="38" y="345" width="284" height="10" rx="5" fill="${colors.stroke}"/>
        <circle cx="${label.endsWith("A") ? 132 : 238}" cy="350" r="13" fill="${color}"/>
      </g>`,
      )
      .join("")}
  </g>`;
}

function journeyArt(colors) {
  const nodes = [
    ["01", "HISTÓRIA", "Três lembranças"],
    ["02", "PRÉVIA", "Título e direção"],
    ["03", "PIX", "Dentro da plataforma"],
    ["04", "PLAY", "Versões completas"],
  ];
  return `<g transform="translate(86 690)">
    ${nodes
      .map(
        ([num, title, detail], i) => `<g transform="translate(0 ${i * 188})">
        ${i < 3 ? `<line x1="42" y1="96" x2="42" y2="204" stroke="${colors.stroke}" stroke-width="4"/>` : ""}
        <circle cx="42" cy="52" r="42" fill="${i === 3 ? CORAL : GREEN}"/>
        <text x="42" y="63" fill="${INK}" font-family="Arial" font-size="24" font-weight="800" text-anchor="middle">${num}</text>
        <text x="120" y="46" fill="${colors.text}" font-family="Arial" font-size="31" font-weight="800" letter-spacing="1.5">${title}</text>
        <text x="120" y="82" fill="${colors.muted}" font-family="Arial" font-size="25">${detail}</text>
        <line x1="470" y1="52" x2="880" y2="52" stroke="${colors.stroke}" stroke-width="3"/>
      </g>`,
      )
      .join("")}
  </g>`;
}

function libraryArt(colors) {
  return `<g transform="translate(82 720)">
    ${[0, 1, 2]
      .map((i) => {
        const fills = [GREEN, CORAL, AMBER];
        return `<g transform="translate(${i * 304} ${i === 1 ? 42 : 0})">
          <rect width="270" height="360" rx="36" fill="${colors.card}" stroke="${colors.stroke}" stroke-width="2"/>
          <rect x="26" y="26" width="218" height="218" rx="28" fill="${fills[i]}" opacity=".18"/>
          <circle cx="${110 + i * 24}" cy="${120 + i * 14}" r="54" fill="${fills[i]}" opacity=".75"/>
          <rect x="26" y="278" width="${160 + i * 20}" height="11" rx="5" fill="${colors.text}" opacity=".8"/>
          <rect x="26" y="308" width="${110 + i * 18}" height="9" rx="4" fill="${colors.stroke}"/>
        </g>`;
      })
      .join("")}
    <g transform="translate(0 458)">
      <circle cx="50" cy="50" r="50" fill="${GREEN}"/>
      <path d="M38 28 L75 50 L38 72 Z" fill="${INK}"/>
      <rect x="130" y="45" width="720" height="10" rx="5" fill="${colors.stroke}"/>
      <rect x="130" y="45" width="410" height="10" rx="5" fill="${CORAL}"/>
      <circle cx="540" cy="50" r="15" fill="${CORAL}"/>
      <path d="M860 22 V66 M840 48 L860 68 L880 48" stroke="${colors.text}" stroke-width="7" fill="none" stroke-linecap="round"/>
    </g>
  </g>`;
}

function questionsArt(colors) {
  const items = [
    ["PARA QUEM?", "alguém especial"],
    ["QUAL MOMENTO?", "uma lembrança"],
    ["QUAL EMOÇÃO?", "o sentimento"],
  ];
  return `<g transform="translate(90 710)">
    ${items
      .map(
        ([q, a], i) => `<g transform="translate(${i * 44} ${i * 190})">
        <rect width="${900 - i * 88}" height="150" rx="34" fill="${colors.card}" stroke="${colors.stroke}" stroke-width="2"/>
        <circle cx="58" cy="75" r="22" fill="${i === 2 ? CORAL : GREEN}"/>
        <text x="104" y="63" fill="${colors.text}" font-family="Arial" font-size="25" font-weight="800" letter-spacing="1.5">${q}</text>
        <text x="104" y="104" fill="${colors.muted}" font-family="Arial" font-size="25">${a}</text>
      </g>`,
      )
      .join("")}
    <path d="M360 650 C450 590 570 590 660 650" fill="none" stroke="${GREEN}" stroke-width="5"/>
    <path d="M642 632 L666 650 L639 662" fill="none" stroke="${GREEN}" stroke-width="5"/>
  </g>`;
}

function stackArt(colors) {
  const items = [
    ["MÚSICA", GREEN],
    ["CAPA", CORAL],
    ["BIBLIOTECA", AMBER],
    ["DOWNLOAD", GREEN_SOFT],
  ];
  return `<g transform="translate(100 710)">
    ${items
      .map(
        ([label, color], i) => `<g transform="translate(${i * 42} ${i * 130})">
        <rect width="${860 - i * 84}" height="190" rx="38" fill="${colors.card}" stroke="${colors.stroke}" stroke-width="2"/>
        <rect width="18" height="190" rx="9" fill="${color}"/>
        <text x="56" y="86" fill="${colors.text}" font-family="Arial" font-size="29" font-weight="800" letter-spacing="2">${label}</text>
        <rect x="56" y="116" width="${360 - i * 26}" height="10" rx="5" fill="${colors.stroke}"/>
      </g>`,
      )
      .join("")}
  </g>`;
}

function pixArt(colors) {
  return `<g transform="translate(170 700)">
    <rect width="740" height="650" rx="60" fill="${colors.card}" stroke="${colors.stroke}" stroke-width="2"/>
    <text x="370" y="90" fill="${colors.text}" font-family="Arial" font-size="32" font-weight="800" text-anchor="middle">PIX</text>
    <g transform="translate(225 150)">
      <path d="M0 70 V0 H70 M220 0 H290 V70 M0 220 V290 H70 M220 290 H290 V220" fill="none" stroke="${GREEN}" stroke-width="12"/>
      ${[
        [55, 55],
        [125, 55],
        [195, 55],
        [55, 125],
        [160, 125],
        [230, 125],
        [90, 195],
        [160, 195],
        [230, 230],
      ]
        .map(([x, y], i) => `<rect x="${x}" y="${y}" width="${i % 3 ? 32 : 46}" height="${i % 2 ? 46 : 32}" rx="5" fill="${colors.text}"/>`)
        .join("")}
    </g>
    <rect x="100" y="520" width="540" height="70" rx="18" fill="${colors.panel}"/>
    <rect x="132" y="548" width="350" height="12" rx="6" fill="${colors.stroke}"/>
    <path d="M556 540 H582 V566 H556 Z M570 552 H596 V578 H570" fill="none" stroke="${colors.text}" stroke-width="4"/>
  </g>`;
}

function offerArt() {
  return `<g transform="translate(78 650)">
    <text x="0" y="150" fill="${INK}" font-family="Arial" font-size="138" font-weight="900" letter-spacing="-5">R$ 49,97</text>
    <text x="4" y="205" fill="${INK}" font-family="Arial" font-size="25" font-weight="700" letter-spacing="3">PAGAMENTO ÚNICO VIA PIX</text>
    ${[
      ["20", "CRÉDITOS"],
      ["10", "RODADAS"],
      ["2", "VERSÕES / RODADA"],
    ]
      .map(
        ([num, label], i) => `<g transform="translate(${i * 314} 300)">
        <rect width="282" height="280" rx="44" fill="${i === 0 ? INK : PAPER}" stroke="${INK}" stroke-width="2"/>
        <text x="36" y="130" fill="${i === 0 ? GREEN : INK}" font-family="Arial" font-size="88" font-weight="900">${num}</text>
        <text x="36" y="190" fill="${i === 0 ? CREAM : INK}" font-family="Arial" font-size="22" font-weight="800" letter-spacing="1.5">${label}</text>
      </g>`,
      )
      .join("")}
    <rect x="0" y="640" width="910" height="124" rx="32" fill="${CORAL}"/>
    <text x="40" y="716" fill="${INK}" font-family="Arial" font-size="29" font-weight="800">10 rodadas × até 2 versões. Não são 20 músicas.</text>
  </g>`;
}

function guaranteeArt(colors) {
  return `<g transform="translate(90 680)">
    <text x="0" y="390" fill="${GREEN}" font-family="Arial" font-size="420" font-weight="900" letter-spacing="-20">7</text>
    <text x="330" y="165" fill="${colors.text}" font-family="Arial" font-size="46" font-weight="800">DIAS</text>
    <text x="330" y="218" fill="${colors.muted}" font-family="Arial" font-size="25">a partir da confirmação</text>
    <line x1="330" y1="275" x2="850" y2="275" stroke="${colors.stroke}" stroke-width="4"/>
    ${["1", "2", "3", "4", "5", "6", "7"]
      .map(
        (n, i) => `<g transform="translate(${330 + i * 76} 320)">
        <circle r="24" fill="${i === 6 ? CORAL : colors.card}" stroke="${colors.stroke}" stroke-width="2"/>
        <text y="8" fill="${colors.text}" font-family="Arial" font-size="20" font-weight="700" text-anchor="middle">${n}</text>
      </g>`,
      )
      .join("")}
    <rect x="330" y="430" width="520" height="230" rx="36" fill="${colors.panel}"/>
    <text x="370" y="492" fill="${colors.muted}" font-family="Arial" font-size="21" font-weight="700" letter-spacing="2">ANTES DE COMPRAR</text>
    <text x="370" y="550" fill="${colors.text}" font-family="Arial" font-size="31" font-weight="800">Prévia criativa</text>
    <text x="370" y="592" fill="${colors.muted}" font-family="Arial" font-size="23">Título · refrão · emoção · estilo</text>
  </g>`;
}

function timelineArt(colors) {
  const items = [
    ["AGORA", "1 projeto", GREEN],
    ["DEPOIS", "outra história", CORAL],
    ["NO SEU TEMPO", "saldo disponível", AMBER],
  ];
  return `<g transform="translate(80 730)">
    <line x1="70" y1="120" x2="920" y2="120" stroke="${colors.stroke}" stroke-width="5"/>
    ${items
      .map(
        ([top, bottom, color], i) => `<g transform="translate(${i * 420} 0)">
        <circle cx="70" cy="120" r="42" fill="${color}"/>
        <text x="70" y="127" fill="${INK}" font-family="Arial" font-size="26" font-weight="900" text-anchor="middle">${i + 1}</text>
        <text x="0" y="225" fill="${colors.text}" font-family="Arial" font-size="24" font-weight="800" letter-spacing="1.5">${top}</text>
        <text x="0" y="270" fill="${colors.muted}" font-family="Arial" font-size="25">${bottom}</text>
      </g>`,
      )
      .join("")}
    <rect x="0" y="390" width="920" height="240" rx="44" fill="${colors.card}" stroke="${colors.stroke}" stroke-width="2"/>
    <text x="50" y="480" fill="${GREEN}" font-family="Arial" font-size="30" font-weight="800">SEM CONTAGEM REGRESSIVA</text>
    <text x="50" y="535" fill="${colors.text}" font-family="Arial" font-size="32" font-weight="800">Use seus créditos quando fizer sentido.</text>
  </g>`;
}

function returnArt(colors) {
  return `<g transform="translate(100 710)">
    <path d="M140 320 C140 90 650 70 760 250" fill="none" stroke="${GREEN}" stroke-width="12" stroke-linecap="round"/>
    <path d="M718 216 L772 254 L712 282" fill="none" stroke="${GREEN}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M760 380 C760 610 250 630 140 450" fill="none" stroke="${GREEN}" stroke-width="12" stroke-linecap="round"/>
    <path d="M182 484 L128 446 L188 418" fill="none" stroke="${GREEN}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="160" cy="350" r="110" fill="${colors.card}" stroke="${colors.stroke}" stroke-width="3"/>
    <text x="160" y="370" fill="${GREEN}" font-family="Arial" font-size="70" font-weight="900" text-anchor="middle">1</text>
    <circle cx="450" cy="350" r="88" fill="${CORAL}" opacity=".18"/>
    <path d="M415 315 L485 385 M485 315 L415 385" stroke="${CORAL}" stroke-width="18" stroke-linecap="round"/>
    <circle cx="740" cy="350" r="110" fill="${colors.card}" stroke="${colors.stroke}" stroke-width="3"/>
    <text x="740" y="370" fill="${GREEN}" font-family="Arial" font-size="70" font-weight="900" text-anchor="middle">1</text>
    <text x="450" y="650" fill="${colors.muted}" font-family="Arial" font-size="25" text-anchor="middle">Falha técnica anterior à entrega</text>
  </g>`;
}

function artFor(campaign, colors) {
  switch (campaign.art) {
    case "preview":
      return previewArt(colors);
    case "moods":
      return moodsArt(colors);
    case "compare":
      return compareArt(colors);
    case "journey":
      return journeyArt(colors);
    case "library":
      return libraryArt(colors);
    case "questions":
      return questionsArt(colors);
    case "stack":
      return stackArt(colors);
    case "pix":
      return pixArt(colors);
    case "offer":
      return offerArt();
    case "guarantee":
      return guaranteeArt(colors);
    case "timeline":
      return timelineArt(colors);
    case "return":
      return returnArt(colors);
    default:
      return "";
  }
}

function photoOverlay(campaign, light = false) {
  const text = light ? INK : "#FFFFFF";
  const muted = light ? "#315A52" : "#E7E4DD";
  const gradient = light
    ? `<linearGradient id="photoShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${CREAM}" stop-opacity=".96"/><stop offset="49%" stop-color="${CREAM}" stop-opacity=".26"/><stop offset="72%" stop-color="${INK}" stop-opacity="0"/><stop offset="100%" stop-color="${INK}" stop-opacity=".28"/></linearGradient>`
    : `<linearGradient id="photoShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#061C18" stop-opacity=".82"/><stop offset="48%" stop-color="#061C18" stop-opacity=".12"/><stop offset="76%" stop-color="#061C18" stop-opacity="0"/><stop offset="100%" stop-color="#061C18" stop-opacity=".58"/></linearGradient>`;

  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>${gradient}</defs>
    <rect width="${W}" height="${H}" fill="url(#photoShade)"/>
    <text x="74" y="214" fill="${light ? "#315A52" : GREEN_SOFT}" font-family="Arial" font-size="21" font-weight="800" letter-spacing="4">PROJETO MÚSICA PRESENTE</text>
    ${textLines(campaign.headline, 72, 318, { size: 80, color: text, weight: 800, lineHeight: 1.02, tracking: -2 })}
    ${textLines(campaign.sub, 76, 530, { size: 34, color: muted, weight: 500, lineHeight: 1.25 })}
    <line x1="74" y1="1580" x2="126" y2="1580" stroke="${CORAL}" stroke-width="8" stroke-linecap="round"/>
    <text x="150" y="1592" fill="#FFFFFF" font-family="Arial" font-size="30" font-weight="700">${esc(campaign.cta)}  →</text>
    <text x="74" y="1680" fill="#FFFFFF" opacity=".8" font-family="Arial" font-size="22" font-weight="700" letter-spacing="2">MUSICACOM.IA.BR</text>
  </svg>`);
}

function graphicOverlay(campaign) {
  const dark = campaign.theme === "dark";
  const offer = campaign.theme === "offer";
  const background = offer ? "#E9FF4F" : dark ? INK : CREAM;
  const colors = {
    text: dark ? PAPER : INK,
    muted: dark ? "#B8CEC7" : "#42665F",
    card: dark ? "#0D4539" : PAPER,
    panel: dark ? "#123C34" : "#E9E2D4",
    stroke: dark ? "#2A6255" : "#D6CDBC",
  };
  const headlineColor = offer ? INK : colors.text;
  const subColor = offer ? "#315A52" : colors.muted;
  const ctaColor = offer ? INK : dark ? GREEN : INK;
  const ctaText = offer ? "#E9FF4F" : dark ? INK : PAPER;

  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${background}"/>
    <circle cx="1010" cy="90" r="180" fill="${dark ? "#0A3A30" : "#E7DED0"}" opacity=".55"/>
    <circle cx="40" cy="1570" r="210" fill="${CORAL}" opacity="${dark ? ".08" : ".11"}"/>
    <text x="74" y="214" fill="${dark ? GREEN_SOFT : "#315A52"}" font-family="Arial" font-size="21" font-weight="800" letter-spacing="4">PROJETO MÚSICA PRESENTE</text>
    ${textLines(campaign.headline, 72, 318, { size: campaign.id === "c17" ? 74 : 82, color: headlineColor, weight: 850, lineHeight: 1.02, tracking: -2 })}
    ${textLines(campaign.sub, 76, 526, { size: 32, color: subColor, weight: 500, lineHeight: 1.24 })}
    ${artFor(campaign, colors)}
    ${pill(72, 1580, Math.min(610, 210 + campaign.cta.length * 18), campaign.cta, ctaColor, ctaText)}
    <text x="74" y="1692" fill="${subColor}" font-family="Arial" font-size="21" font-weight="700" letter-spacing="2">MUSICACOM.IA.BR</text>
  </svg>`);
}

async function logoComposite(light) {
  const source = light ? logoLight : logoDark;
  return {
    input: await sharp(source).resize({ width: 292 }).png().toBuffer(),
    left: 72,
    top: 72,
  };
}

async function render(campaign) {
  const isPhoto = campaign.layout.startsWith("photo");
  const lightPhoto = campaign.layout === "photo-light";
  const base = isPhoto
    ? sharp(path.join(sourceDir, campaign.background)).resize(W, H, {
        fit: "cover",
        position: "centre",
      })
    : sharp({
        create: {
          width: W,
          height: H,
          channels: 4,
          background: campaign.theme === "dark" ? INK : CREAM,
        },
      });

  const overlay = isPhoto
    ? photoOverlay(campaign, lightPhoto)
    : graphicOverlay(campaign);
  const logoIsLight = campaign.layout === "photo" || campaign.theme === "dark";
  const output = path.join(
    outputDir,
    `${campaign.id}-${campaign.slug}-layout-v2-9x16.png`,
  );

  await base
    .composite([
      { input: overlay, left: 0, top: 0 },
      await logoComposite(logoIsLight),
    ])
    .png({ compressionLevel: 9 })
    .toFile(output);

  return output;
}

const outputs = [];
for (const campaign of campaigns) {
  outputs.push(await render(campaign));
}

console.log(`Rendered ${outputs.length} layouts`);
for (const output of outputs) {
  console.log(path.relative(rootDir, output));
}
