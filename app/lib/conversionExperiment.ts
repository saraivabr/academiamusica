"use client";

export const HOME_STORY_EXPERIMENT = "home_story_start_v1";
export const HOME_STORY_VARIANTS = [
  "control",
  "gift_first",
  "example_first",
] as const;

export type HomeStoryVariant = (typeof HOME_STORY_VARIANTS)[number];

const STORAGE_KEY = `musicacom-experiment-${HOME_STORY_EXPERIMENT}`;
const QUERY_KEY = `exp_${HOME_STORY_EXPERIMENT}`;
let ephemeralVariant: HomeStoryVariant | null = null;

function isHomeStoryVariant(value: string | null): value is HomeStoryVariant {
  return HOME_STORY_VARIANTS.includes(value as HomeStoryVariant);
}

function randomVariant(): HomeStoryVariant {
  const bucket = crypto.getRandomValues(new Uint32Array(1))[0]
    % HOME_STORY_VARIANTS.length;
  return HOME_STORY_VARIANTS[bucket];
}

export function getHomeStoryVariant(): HomeStoryVariant {
  if (typeof window === "undefined") return "control";

  const forced = new URLSearchParams(window.location.search).get(QUERY_KEY);
  if (isHomeStoryVariant(forced)) {
    try {
      window.localStorage.setItem(STORAGE_KEY, forced);
    } catch {
      // The forced variant still works when storage is unavailable.
    }
    return forced;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isHomeStoryVariant(stored)) return stored;
  } catch {
    // Private browsing can make storage unavailable.
  }

  if (ephemeralVariant) return ephemeralVariant;
  const assigned = randomVariant();
  ephemeralVariant = assigned;
  try {
    window.localStorage.setItem(STORAGE_KEY, assigned);
  } catch {
    // Keep the in-memory assignment for this page view.
  }
  return assigned;
}

export function getConversionExperimentContext() {
  return {
    experiment: HOME_STORY_EXPERIMENT,
    variant: getHomeStoryVariant(),
  };
}
