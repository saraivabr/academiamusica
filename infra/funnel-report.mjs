process.stdin.setEncoding("utf8");
let raw = "";
for await (const chunk of process.stdin) {
  raw += chunk;
}
const payload = JSON.parse(raw || "{}");
const events = (payload.Items ?? []).map((item) => ({
  id: item.id?.S ?? "",
  name: item.name?.S ?? "unknown",
  sessionId: item.sessionId?.S ?? item.id?.S ?? "",
  source: item.source?.S ?? "unknown",
  value: Number(item.value?.N ?? 0),
}));

const stages = [
  { name: "landing_view", label: "Visitas" },
  { name: "checkout_cta", label: "Cliques para checkout", base: "landing_view" },
  { name: "checkout_view", label: "Checkout aberto", base: "checkout_cta" },
  { name: "checkout_started", label: "Checkout iniciado", base: "checkout_view" },
  { name: "pix_created", label: "Pix gerado", base: "checkout_started" },
  { name: "purchase_confirmed", label: "Pagamento confirmado", base: "pix_created" },
  { name: "access_activated", label: "Acesso ativado", base: "purchase_confirmed" },
];

const uniqueSessions = (name, source) => new Set(
  events
    .filter((event) => event.name === name && (!source || event.source === source))
    .map((event) => event.sessionId),
).size;
const sessionSet = (name) => new Set(
  events
    .filter((event) => (
      event.name === name
      && event.sessionId
      && event.sessionId !== "server"
    ))
    .map((event) => event.sessionId),
);
const invalidSessionEvents = (name) => events.filter((event) => (
  event.name === name
  && (!event.sessionId || event.sessionId === "server")
)).length;

const percent = (value, base) => base > 0 ? `${((value / base) * 100).toFixed(1)}%` : "—";
const rows = stages.map((stage) => {
  const sessions = uniqueSessions(stage.name);
  const base = stage.base ? uniqueSessions(stage.base) : 0;
  return { ...stage, sessions, rate: stage.base ? percent(sessions, base) : "—" };
});

const width = Math.max(...rows.map((row) => row.label.length), 18);
console.log(`FUNIL SARAIVAOS — últimos ${process.argv[2] ?? "14"} dias`);
console.log("");
console.log(`${"ETAPA".padEnd(width)}  SESSÕES  TAXA ANTERIOR`);
for (const row of rows) {
  console.log(`${row.label.padEnd(width)}  ${String(row.sessions).padStart(7)}  ${row.rate.padStart(13)}`);
}

console.log("");
console.log(`Interesse na oferta: ${uniqueSessions("offer_cta")} sessão(ões)`);

const purchases = events.filter((event) => event.name === "purchase_confirmed");
const revenue = purchases.reduce((sum, event) => sum + event.value, 0) / 100;
console.log("");
console.log(`Receita confirmada: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(revenue)}`);

const sources = [...new Set(events.map((event) => event.source))].sort();
if (sources.length) {
  console.log("");
  console.log("ORIGEM".padEnd(24) + "  VISITAS  PIX  VENDAS");
  for (const source of sources) {
    console.log(
      `${source.slice(0, 24).padEnd(24)}  ${String(uniqueSessions("landing_view", source)).padStart(7)}  ${String(uniqueSessions("pix_created", source)).padStart(3)}  ${String(uniqueSessions("purchase_confirmed", source)).padStart(6)}`,
    );
  }
}

const baselineReady = uniqueSessions("landing_view") >= 100;
console.log("");
console.log(baselineReady
  ? "Baseline por volume: pronto para primeira decisão."
  : "Baseline por volume: coleta em andamento (meta: 100 sessões ou 14 dias).");

const creatorOpened = sessionSet("music_route_unique_opened");
const creatorConfirmed = sessionSet("music_route_unique_confirmed");
const linkedConfirmations = new Set(
  [...creatorConfirmed].filter((sessionId) => creatorOpened.has(sessionId)),
);
const unlinkedConfirmations = new Set(
  [...creatorConfirmed].filter((sessionId) => !creatorOpened.has(sessionId)),
);
const creatorBaselineReady = creatorOpened.size >= 100;

console.log("");
console.log("ROTA ÚNICA — ativação do criador");
console.log(`Aberturas únicas: ${creatorOpened.size}`);
console.log(`Confirmações vinculadas: ${linkedConfirmations.size}`);
console.log(`Taxa de ativação: ${percent(linkedConfirmations.size, creatorOpened.size)}`);
console.log(`Confirmações sem abertura vinculada: ${unlinkedConfirmations.size}`);
console.log(`Aberturas sem sessão válida: ${invalidSessionEvents("music_route_unique_opened")}`);
console.log(`Confirmações sem sessão válida: ${invalidSessionEvents("music_route_unique_confirmed")}`);
console.log(creatorBaselineReady
  ? "Amostra da Rota Única: pronta para decisão (100 sessões ou mais)."
  : `Amostra da Rota Única: coleta em andamento (${creatorOpened.size}/100 sessões).`);
