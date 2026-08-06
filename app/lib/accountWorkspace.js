export const authenticatedWorkspaceOwnerKey = "academia_authenticated_workspace_owner_v1";

export const authenticatedWorkspaceKeys = [
  "academia_express_studio_v1",
  "academia-musica:pending-cover",
];

export function memberIdentityFromToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 4 || parts[0] !== "v1" || !parts[2]) return "";
  return parts[2];
}

export function transitionAuthenticatedWorkspace(storage, token) {
  const nextIdentity = memberIdentityFromToken(token);
  const previousIdentity = storage.getItem(authenticatedWorkspaceOwnerKey) || "";
  const shouldClear = !nextIdentity || !previousIdentity || previousIdentity !== nextIdentity;

  if (shouldClear) {
    for (const key of authenticatedWorkspaceKeys) {
      storage.removeItem(key);
    }
  }

  if (nextIdentity) {
    storage.setItem(authenticatedWorkspaceOwnerKey, nextIdentity);
  } else {
    storage.removeItem(authenticatedWorkspaceOwnerKey);
  }

  return {
    nextIdentity,
    previousIdentity,
    cleared: shouldClear,
  };
}
