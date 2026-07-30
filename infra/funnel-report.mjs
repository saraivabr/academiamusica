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
  createdAt: item.createdAt?.S ?? "",
  placement: item.placement?.S ?? "",
  journey: item.journey?.S ?? "",
  step: item.step?.S ?? "",
  outcome: item.outcome?.S ?? "",
  product: item.product?.S ?? "",
  experiment: item.experiment?.S ?? "",
  variant: item.variant?.S ?? "",
  value: Number(item.value?.N ?? 0),
}));

const DECISION_SESSION_MINIMUM = 100;
const SOURCE_SESSION_MINIMUM = 30;
const HOME_EXPERIMENT = "home_story_start_v1";
const HOME_VARIANTS = ["control", "gift_first", "example_first"];
const HOME_VARIANT_MINIMUM = 30;

const apifyJingleStages = [
  {
    label: "Apify com resultados",
    matches: (event) => (
      event.name === "prospect_search_completed"
      && event.outcome === "results"
    ),
  },
  {
    label: "Negócio escolhido",
    matches: (event) => event.name === "prospect_jingle_started",
  },
  {
    label: "Criador de jingle",
    matches: (event) => (
      event.name === "prospect_jingle_creator_opened"
      || (
        event.name === "expert_direction_received"
        && event.placement === "business-prospect"
      )
    ),
  },
  {
    label: "Música entregue",
    matches: (event) => (
      event.name === "music_generation_completed"
      || event.name === "music_generation_delivered"
    ),
  },
  {
    label: "Primeira escuta",
    matches: (event) => event.name === "music_result_played",
  },
];

const stages = [
  { name: "landing_view", label: "Visitas" },
  { name: "story_started", label: "História iniciada", base: "landing_view" },
  { name: "preview_completed", label: "Prévia concluída", base: "story_started" },
  { name: "checkout_view", label: "Checkout aberto", base: "preview_completed" },
  { name: "checkout_started", label: "Checkout iniciado", base: "checkout_view" },
  { name: "pix_created", label: "Pix gerado", base: "checkout_started" },
  { name: "purchase_confirmed", label: "Pagamento confirmado", base: "pix_created" },
  { name: "access_activated", label: "Acesso ativado", base: "purchase_confirmed" },
  { name: "paid_generation_started", label: "Geração paga iniciada", base: "access_activated" },
  { name: "music_generation_delivered", label: "Música entregue", base: "paid_generation_started" },
  { name: "music_result_played", label: "Primeiro play", base: "music_generation_delivered" },
  { name: "music_downloaded", label: "Download", base: "music_result_played" },
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
const validSession = (event) => event.sessionId && event.sessionId !== "server";

function eventTimestamp(event) {
  const timestamp = Date.parse(event.createdAt);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function buildLinkedJourney(sourceEvents) {
  const bySession = new Map();
  for (const event of sourceEvents) {
    if (!validSession(event) || eventTimestamp(event) === null) continue;
    const sessionEvents = bySession.get(event.sessionId) ?? [];
    sessionEvents.push(event);
    bySession.set(event.sessionId, sessionEvents);
  }

  const journeys = [];
  for (const sessionEvents of bySession.values()) {
    let after = Number.NEGATIVE_INFINITY;
    const reached = [];
    for (const stage of apifyJingleStages) {
      const match = sessionEvents
        .filter((event) => (
          stage.matches(event)
          && eventTimestamp(event) >= after
        ))
        .sort((left, right) => eventTimestamp(left) - eventTimestamp(right))[0];
      if (!match) break;
      reached.push(match);
      after = eventTimestamp(match);
    }
    if (reached.length) {
      journeys.push({
        source: reached[0].source || "unknown",
        reached,
      });
    }
  }
  return journeys;
}

function journeyCounts(journeys) {
  return apifyJingleStages.map((_, index) => (
    journeys.filter((journey) => journey.reached.length > index).length
  ));
}

function sampleStatus(sessions, minimum) {
  return sessions >= minimum ? "pronta" : `${sessions}/${minimum}`;
}

function rateCell(value, base) {
  return `${value} · ${percent(value, base)}`;
}

function wilsonInterval(successes, total, z = 1.96) {
  if (total === 0) return { lower: 0, upper: 1 };
  const rate = successes / total;
  const denominator = 1 + (z ** 2 / total);
  const center = rate + (z ** 2 / (2 * total));
  const margin = z * Math.sqrt(
    (rate * (1 - rate) / total) + (z ** 2 / (4 * total ** 2)),
  );
  return {
    lower: (center - margin) / denominator,
    upper: (center + margin) / denominator,
  };
}

function experimentSessionSet(eventName, variant) {
  return new Set(
    events
      .filter((event) => (
        event.name === eventName
        && event.experiment === HOME_EXPERIMENT
        && event.variant === variant
        && validSession(event)
      ))
      .map((event) => event.sessionId),
  );
}

function linkedExperimentSessions(eventName, variant, landingSessions) {
  const reached = experimentSessionSet(eventName, variant);
  return new Set(
    [...reached].filter((sessionId) => landingSessions.has(sessionId)),
  ).size;
}

function printHomeExperiment() {
  const rows = HOME_VARIANTS.map((variant) => {
    const landingSessions = experimentSessionSet("landing_view", variant);
    const visits = landingSessions.size;
    const stories = linkedExperimentSessions("story_started", variant, landingSessions);
    const previews = linkedExperimentSessions("preview_completed", variant, landingSessions);
    const checkouts = linkedExperimentSessions("checkout_started", variant, landingSessions);
    const pix = linkedExperimentSessions("pix_created", variant, landingSessions);
    const sales = linkedExperimentSessions("purchase_confirmed", variant, landingSessions);
    return {
      variant,
      visits,
      stories,
      previews,
      checkouts,
      pix,
      sales,
      rate: visits > 0 ? stories / visits : 0,
      interval: wilsonInterval(stories, visits),
    };
  });
  const totalVisits = rows.reduce((sum, row) => sum + row.visits, 0);
  const sampleReady = rows.every((row) => row.visits >= HOME_VARIANT_MINIMUM);
  const ranked = [...rows].sort((left, right) => (
    right.rate - left.rate || right.stories - left.stories
  ));
  const [best, runnerUp] = ranked;
  const confidentWinner = sampleReady
    && best.rate >= runnerUp.rate * 1.2
    && best.interval.lower > runnerUp.interval.upper;

  console.log("EXPERIMENTO — MENSAGEM DA HOME");
  console.log(`Teste: ${HOME_EXPERIMENT} · métrica principal: história iniciada`);
  console.log("");
  console.log(
    `${"VARIANTE".padEnd(18)}  ${"VISITAS".padStart(7)}  ${"HISTÓRIA".padStart(12)}  ${"PRÉVIA".padStart(7)}  ${"CHECKOUT".padStart(8)}  ${"PIX".padStart(3)}  ${"VENDAS".padStart(6)}`,
  );
  for (const row of rows) {
    console.log(
      `${row.variant.padEnd(18)}  ${String(row.visits).padStart(7)}  ${rateCell(row.stories, row.visits).padStart(12)}  ${String(row.previews).padStart(7)}  ${String(row.checkouts).padStart(8)}  ${String(row.pix).padStart(3)}  ${String(row.sales).padStart(6)}`,
    );
  }
  console.log("");
  if (confidentWinner) {
    console.log(
      `DECISÃO DO TESTE: ${best.variant} venceu com ${percent(best.stories, best.visits)} de início de história.`,
    );
  } else if (!sampleReady) {
    const progress = rows.map((row) => `${row.variant} ${row.visits}/${HOME_VARIANT_MINIMUM}`).join(" · ");
    console.log(`DECISÃO DO TESTE: coleta em andamento (${progress}; total ${totalVisits}).`);
  } else {
    console.log("DECISÃO DO TESTE: amostra mínima atingida, mas ainda sem diferença confiável. Continue coletando.");
  }
}

function printApifyJingleJourney() {
  const journeys = buildLinkedJourney(events);
  const counts = journeyCounts(journeys);
  const emptySearchSessions = new Set(
    events
      .filter((event) => (
        validSession(event)
        && event.name === "prospect_search_completed"
        && event.outcome === "empty"
      ))
      .map((event) => event.sessionId),
  ).size;
  const invalidEvents = events.filter((event) => (
    !validSession(event)
    && apifyJingleStages.some((stage) => stage.matches(event))
  )).length;

  console.log("JORNADA APIFY → PRIMEIRA ESCUTA");
  console.log("Sessões únicas e vinculadas na ordem da jornada.");
  console.log("");
  console.log(
    `${"ETAPA".padEnd(24)}  ${"SESSÕES".padStart(7)}  ${"TAXA ANTERIOR".padStart(13)}  ${"TAXA APIFY".padStart(10)}`,
  );
  for (const [index, stage] of apifyJingleStages.entries()) {
    const previous = index === 0 ? 0 : counts[index - 1];
    console.log(
      `${stage.label.padEnd(24)}  ${String(counts[index]).padStart(7)}  ${(
        index === 0 ? "—" : percent(counts[index], previous)
      ).padStart(13)}  ${percent(counts[index], counts[0]).padStart(10)}`,
    );
  }

  console.log("");
  if (counts[0] >= DECISION_SESSION_MINIMUM) {
    console.log(
      `DECISÃO: amostra geral pronta (${counts[0]} sessões Apify; mínimo ${DECISION_SESSION_MINIMUM}).`,
    );
  } else {
    console.log(
      `DECISÃO: aguarde mais volume (${counts[0]}/${DECISION_SESSION_MINIMUM} sessões Apify).`,
    );
  }
  console.log(`Sessões com ao menos uma busca sem resultado: ${emptySearchSessions}.`);
  console.log(`Eventos da jornada sem sessão válida: ${invalidEvents}.`);

  const origins = [...new Set(journeys.map((journey) => journey.source))]
    .map((source) => {
      const sourceJourneys = journeys.filter((journey) => journey.source === source);
      return { source, counts: journeyCounts(sourceJourneys) };
    })
    .sort((left, right) => (
      right.counts[0] - left.counts[0]
      || left.source.localeCompare(right.source, "pt-BR")
    ));

  if (!origins.length) return;
  console.log("");
  console.log(`POR ORIGEM — mínimo ${SOURCE_SESSION_MINIMUM} sessões Apify por origem`);
  console.log("Cada taxa compara com a etapa anterior; FINAL = primeira escuta ÷ Apify.");
  console.log(
    `${"ORIGEM".padEnd(22)}  ${"APIFY".padStart(5)}  ${"ESCOLHA".padStart(12)}  ${"CRIADOR".padStart(12)}  ${"ENTREGA".padStart(12)}  ${"ESCUTA".padStart(12)}  ${"FINAL".padStart(7)}  ${"AMOSTRA".padStart(8)}`,
  );
  for (const origin of origins) {
    const [apify, business, creator, delivered, listened] = origin.counts;
    console.log(
      `${origin.source.slice(0, 22).padEnd(22)}  ${String(apify).padStart(5)}  ${rateCell(business, apify).padStart(12)}  ${rateCell(creator, business).padStart(12)}  ${rateCell(delivered, creator).padStart(12)}  ${rateCell(listened, delivered).padStart(12)}  ${percent(listened, apify).padStart(7)}  ${sampleStatus(apify, SOURCE_SESSION_MINIMUM).padStart(8)}`,
    );
  }
}

const rows = stages.map((stage) => {
  const sessions = uniqueSessions(stage.name);
  const base = stage.base ? uniqueSessions(stage.base) : 0;
  return { ...stage, sessions, rate: stage.base ? percent(sessions, base) : "—" };
});

const width = Math.max(...rows.map((row) => row.label.length), 18);
console.log(`RELATÓRIO DE FUNIL MUSICACOM.IA — últimos ${process.argv[2] ?? "14"} dias`);
console.log("");
printHomeExperiment();
console.log("");
printApifyJingleJourney();
console.log("");
console.log("AQUISIÇÃO, PAGAMENTO E ACESSO");
console.log("");
console.log(`${"ETAPA".padEnd(width)}  SESSÕES  TAXA ANTERIOR`);
for (const row of rows) {
  console.log(`${row.label.padEnd(width)}  ${String(row.sessions).padStart(7)}  ${row.rate.padStart(13)}`);
}

console.log("");
console.log(`Interesse na oferta: ${uniqueSessions("offer_cta")} sessão(ões)`);

const ctaPlacements = [...new Set(
  events
    .filter((event) => event.name === "offer_cta" && event.placement)
    .map((event) => event.placement),
)].sort();
if (ctaPlacements.length) {
  console.log("");
  console.log("CTA PARA PRÉVIA".padEnd(24) + "  SESSÕES");
  for (const placement of ctaPlacements) {
    const sessions = new Set(
      events
        .filter((event) => (
          event.name === "offer_cta"
          && event.placement === placement
        ))
        .map((event) => event.sessionId),
    ).size;
    console.log(`${placement.slice(0, 24).padEnd(24)}  ${String(sessions).padStart(7)}`);
  }
}

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

const baselineReady = uniqueSessions("landing_view") >= DECISION_SESSION_MINIMUM;
console.log("");
console.log(baselineReady
  ? "Baseline por volume: pronto para primeira decisão."
  : `Baseline por volume: coleta em andamento (meta: ${DECISION_SESSION_MINIMUM} sessões).`);

const creatorOpened = sessionSet("music_route_unique_opened");
const creatorConfirmed = sessionSet("music_route_unique_confirmed");
const linkedConfirmations = new Set(
  [...creatorConfirmed].filter((sessionId) => creatorOpened.has(sessionId)),
);
const unlinkedConfirmations = new Set(
  [...creatorConfirmed].filter((sessionId) => !creatorOpened.has(sessionId)),
);
const creatorBaselineReady = creatorOpened.size >= DECISION_SESSION_MINIMUM;

console.log("");
console.log("ROTA ÚNICA — ativação do criador");
console.log(`Aberturas únicas: ${creatorOpened.size}`);
console.log(`Confirmações vinculadas: ${linkedConfirmations.size}`);
console.log(`Taxa de ativação: ${percent(linkedConfirmations.size, creatorOpened.size)}`);
console.log(`Confirmações sem abertura vinculada: ${unlinkedConfirmations.size}`);
console.log(`Aberturas sem sessão válida: ${invalidSessionEvents("music_route_unique_opened")}`);
console.log(`Confirmações sem sessão válida: ${invalidSessionEvents("music_route_unique_confirmed")}`);
console.log(creatorBaselineReady
  ? `Amostra da Rota Única: pronta para decisão (${DECISION_SESSION_MINIMUM} sessões ou mais).`
  : `Amostra da Rota Única: coleta em andamento (${creatorOpened.size}/${DECISION_SESSION_MINIMUM} sessões).`);
