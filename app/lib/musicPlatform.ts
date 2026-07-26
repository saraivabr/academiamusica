"use client";

export type PlatformTrack = {
  id: string;
  title: string;
  tags: string;
  duration: number | null;
  audioUrl: string;
  streamAudioUrl: string;
  imageUrl: string;
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
export const academyPlayerStorageKey = "academia_player_track_v1";

export function playableTrackUrl(track: PlatformTrack) {
  return track.audioUrl || track.streamAudioUrl;
}

export function playInAcademyPlayer(track: PlatformTrack, context = "Minhas músicas") {
  window.dispatchEvent(new CustomEvent<PlayerSelection>(academyPlayerEvent, {
    detail: { track, context },
  }));
}

export function flattenGenerations(generations: PlatformGeneration[]) {
  return generations.flatMap((generation) => generation.tracks);
}
