export const analyticsSessionStorageKey = "academia-musica-session-v2";
export const analyticsSessionTimeoutMs = 30 * 60 * 1_000;

let memorySession = null;

function activeSession(session, now) {
  return session
    && typeof session.id === "string"
    && session.id.length >= 16
    && Number.isFinite(session.lastSeenAt)
    && now - session.lastSeenAt < analyticsSessionTimeoutMs;
}

export function getOrCreateAnalyticsSession(storage, now, createId) {
  try {
    const stored = JSON.parse(storage.getItem(analyticsSessionStorageKey) || "null");
    const session = activeSession(stored, now)
      ? { ...stored, lastSeenAt: now }
      : { id: createId(), lastSeenAt: now };
    storage.setItem(analyticsSessionStorageKey, JSON.stringify(session));
    memorySession = session;
    return session.id;
  } catch {
    if (!activeSession(memorySession, now)) {
      memorySession = { id: createId(), lastSeenAt: now };
    } else {
      memorySession = { ...memorySession, lastSeenAt: now };
    }
    return memorySession.id;
  }
}

export function resetAnalyticsMemorySessionForTests() {
  memorySession = null;
}
