"use client";

export type PlatformTrack = {
  id: string;
  title: string;
  tags: string;
  duration: number | null;
  audioUrl: string;
  streamAudioUrl: string;
  imageUrl: string;
  coverToken?: string;
  hasCustomCover?: boolean;
};

export type PlatformGeneration = {
  taskId: string;
  createdAt: string;
  status: string;
  tracks: PlatformTrack[];
  error: string | null;
};

export type PlayerSelection = {
  track: PlatformTrack;
  context: string;
};

export const academyPlayerEvent = "academia:play-track";
export const academyPlayerClearEvent = "academia:clear-player";
export const academyPlayerStorageKey = "academia_player_track_v1";
export const academyPlayerPendingStorageKey = "academia_player_pending_v1";

export function playableTrackUrl(track: PlatformTrack) {
  return track.audioUrl || track.streamAudioUrl;
}

export function playInAcademyPlayer(track: PlatformTrack, context = "Minhas músicas") {
  const selection = { track, context };
  try {
    window.localStorage.setItem(academyPlayerStorageKey, JSON.stringify(selection));
    window.localStorage.setItem(academyPlayerPendingStorageKey, "1");
  } catch {
    // The event still reaches an already mounted player when storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent<PlayerSelection>(academyPlayerEvent, {
    detail: selection,
  }));
}

export function clearAcademyPlayerSelection() {
  try {
    window.localStorage.removeItem(academyPlayerStorageKey);
    window.localStorage.removeItem(academyPlayerPendingStorageKey);
  } catch {
    // Clearing the authenticated session must still work when storage is unavailable.
  }
  window.dispatchEvent(new Event(academyPlayerClearEvent));
}

export function flattenGenerations(generations: PlatformGeneration[]) {
  return generations.flatMap((generation) => generation.tracks);
}
