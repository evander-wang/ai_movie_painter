export const CANVAS_DRAFT_STORAGE_KEY = 'short-flow.canvasDraft.v1';

export function saveCanvasDraft(storage: Storage, payload: unknown) {
  storage.setItem(CANVAS_DRAFT_STORAGE_KEY, JSON.stringify(payload));
}

export function readCanvasDraftPayload(storage: Storage): unknown | null {
  const rawPayload = storage.getItem(CANVAS_DRAFT_STORAGE_KEY);
  if (!rawPayload) return null;

  try {
    return JSON.parse(rawPayload);
  } catch {
    return null;
  }
}

export function clearCanvasDraft(storage: Storage) {
  storage.removeItem(CANVAS_DRAFT_STORAGE_KEY);
}

export function getCanvasDraftStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
