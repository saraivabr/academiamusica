const APIFY_GOOGLE_MAPS_ACTOR = "compass~crawler-google-places";

function compactText(value, maxLength) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function safeHttpUrl(value) {
  try {
    const url = new URL(compactText(value, 2_000));
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function normalizeBusinessSearch(value = {}) {
  const query = compactText(value.query, 80);
  const location = compactText(value.location, 120);
  const requestedLimit = Number(value.limit);
  const limit = requestedLimit <= 5 ? 5 : 10;
  if (query.length < 2 || location.length < 2) return null;
  return { query, location, limit };
}

export function buildGoogleMapsActorInput(search) {
  return {
    searchStringsArray: [search.query],
    locationQuery: search.location,
    maxCrawledPlacesPerSearch: search.limit,
    language: "pt-BR",
    countryCode: "br",
    skipClosedPlaces: true,
    scrapePlaceDetailPage: false,
  };
}

export function normalizeBusinessProspect(value = {}) {
  const name = compactText(value.title ?? value.name, 160);
  if (!name) return null;
  const placeId = compactText(value.placeId ?? value.cid, 180);
  const address = compactText(value.address, 240);
  const mapsUrl = safeHttpUrl(value.url ?? value.mapsUrl);
  const website = safeHttpUrl(value.website);
  const imageUrl = safeHttpUrl(value.imageUrl);
  const rating = Number(value.totalScore);
  const reviewsCount = Number(value.reviewsCount);

  return {
    id: placeId || compactText(`${name}-${address}`, 360),
    name,
    category: compactText(value.categoryName ?? value.category, 100),
    address,
    phone: compactText(value.phone ?? value.phoneUnformatted, 40),
    website,
    mapsUrl,
    imageUrl,
    rating: Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating : null,
    reviewsCount: Number.isInteger(reviewsCount) && reviewsCount >= 0 ? reviewsCount : null,
  };
}

export const businessProspectConfig = Object.freeze({
  actorId: APIFY_GOOGLE_MAPS_ACTOR,
  dailySearchLimit: 5,
  maxTotalChargeUsd: 0.5,
});
