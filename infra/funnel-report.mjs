import { readFile } from "node:fs/promises";

const raw = await readFile("/dev/stdin", "utf8");
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
