import assert from "node:assert/strict";
import test from "node:test";
import {
  buildGoogleMapsActorInput,
  businessProspectConfig,
  normalizeBusinessProspect,
  normalizeBusinessSearch,
} from "../infra/checkout/business-prospects.mjs";

test("normalizes a bounded business search for the Google Maps actor", () => {
  assert.deepEqual(
    normalizeBusinessSearch({
      query: "  restaurantes   italianos ",
      location: " Salvador, BA ",
      limit: 999,
    }),
    {
      query: "restaurantes italianos",
      location: "Salvador, BA",
      limit: 10,
    },
  );
  assert.equal(normalizeBusinessSearch({ query: "x", location: "Salvador" }), null);
  assert.equal(normalizeBusinessSearch({ query: "salão", location: "" }), null);
});

test("builds a cost-bounded Portuguese Google Maps input", () => {
  const input = buildGoogleMapsActorInput({
    query: "clínicas de estética",
    location: "Recife, PE",
    limit: 5,
  });

  assert.deepEqual(input.searchStringsArray, ["clínicas de estética"]);
  assert.equal(input.locationQuery, "Recife, PE");
  assert.equal(input.maxCrawledPlacesPerSearch, 5);
  assert.equal(input.language, "pt-BR");
  assert.equal(input.countryCode, "br");
  assert.equal(input.skipClosedPlaces, true);
  assert.equal(businessProspectConfig.actorId, "compass~crawler-google-places");
  assert.equal(businessProspectConfig.dailySearchLimit, 5);
  assert.ok(businessProspectConfig.maxTotalChargeUsd <= 0.5);
});

test("returns only safe, useful prospect fields", () => {
  const prospect = normalizeBusinessProspect({
    placeId: "ChIJ-example",
    title: "  Café   da Praça ",
    categoryName: "Cafeteria",
    address: "Rua Um, 10",
    phone: "(71) 99999-0000",
    website: "https://cafedapraca.example/cardapio",
    url: "https://maps.google.com/example",
    imageUrl: "javascript:alert(1)",
    totalScore: 4.8,
    reviewsCount: 234,
    reviews: [{ text: "must not leak" }],
  });

  assert.deepEqual(prospect, {
    id: "ChIJ-example",
    name: "Café da Praça",
    category: "Cafeteria",
    address: "Rua Um, 10",
    phone: "(71) 99999-0000",
    website: "https://cafedapraca.example/cardapio",
    mapsUrl: "https://maps.google.com/example",
    imageUrl: "",
    rating: 4.8,
    reviewsCount: 234,
  });
});
