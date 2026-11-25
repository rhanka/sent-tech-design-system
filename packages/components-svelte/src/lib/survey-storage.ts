import type { SurveyDraft, SurveyPendingSubmission } from "./survey-types.js";

const STORAGE_PREFIX = "st-survey-v1:";
const DRAFT_PREFIX = `${STORAGE_PREFIX}draft:`;
const PENDING_PREFIX = `${STORAGE_PREFIX}pending:`;
const PASSKEY_PREFIX = `${STORAGE_PREFIX}passkey:`;
const DEFAULT_SALT = "st-survey-2026-salt";

export const DEFAULT_DRAFT_TTL_MS = 30 * 60 * 1000;
export const DEFAULT_PENDING_TTL_MS = 24 * 60 * 60 * 1000;

const memoryStore = new Map<string, string>();

function getWebStorage(): Storage | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // localStorage unavailable (sandboxed iframe / restricted privacy mode)
  }
  return null;
}

function safeGet(key: string): string | null {
  const storage = getWebStorage();
  if (storage) {
    try {
      const raw = storage.getItem(key);
      if (raw != null) return raw;
    } catch {
      // Fall back to in-memory store
    }
  }
  return memoryStore.get(key) ?? null;
}

function safeSet(key: string, value: string): void {
  memoryStore.set(key, value);
  const storage = getWebStorage();
  if (storage) {
    try {
      storage.setItem(key, value);
    } catch {
      // Silent fallback to in-memory store
    }
  }
}

function safeRemove(key: string): void {
  memoryStore.delete(key);
  const storage = getWebStorage();
  if (storage) {
    try {
      storage.removeItem(key);
    } catch {
      // Silent fallback to in-memory store
    }
  }
}

/** Deterministic salted 64-bit FNV-1a digest for local draft lookup without plaintext emails. */
export function hashSurveyEmail(email: string, salt = DEFAULT_SALT): string {
  const normalized = `${salt}:${String(email ?? "").trim().toLowerCase()}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < normalized.length; i += 1) {
    const code = normalized.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= code + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

function draftKey(surveyId: string, identity: string, salt?: string): string {
  return `${DRAFT_PREFIX}${surveyId}:${hashSurveyEmail(identity, salt)}`;
}

function pendingKey(surveyId: string, identity: string, salt?: string): string {
  return `${PENDING_PREFIX}${surveyId}:${hashSurveyEmail(identity, salt)}`;
}

function passkeyKey(identity: string, salt?: string): string {
  return `${PASSKEY_PREFIX}${hashSurveyEmail(identity, salt)}`;
}

export function loadSurveyDraft(
  surveyId: string,
  identity: string,
  now = Date.now(),
  salt?: string,
): SurveyDraft | null {
  if (!surveyId || !identity.trim()) return null;
  const key = draftKey(surveyId, identity, salt);
  const raw = safeGet(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SurveyDraft>;
    if (!parsed || typeof parsed.expiresAt !== "number") return null;
    if (now >= parsed.expiresAt) {
      safeRemove(key);
      return null;
    }
    return {
      surveyId: typeof parsed.surveyId === "string" ? parsed.surveyId : surveyId,
      answers: parsed.answers && typeof parsed.answers === "object" ? parsed.answers : {},
      questionIndex: typeof parsed.questionIndex === "number" ? parsed.questionIndex : 0,
      enrollmentMeta:
        parsed.enrollmentMeta && typeof parsed.enrollmentMeta === "object"
          ? parsed.enrollmentMeta
          : {},
      ...(parsed.entryScope !== undefined ? { entryScope: parsed.entryScope } : {}),
      ...(parsed.depthMode !== undefined ? { depthMode: parsed.depthMode } : {}),
      ...(Array.isArray(parsed.selectedThemes) ? { selectedThemes: parsed.selectedThemes } : {}),
      ...(parsed.questionScopes && typeof parsed.questionScopes === "object"
        ? { questionScopes: parsed.questionScopes }
        : {}),
      ...(typeof parsed.step === "string" ? { step: parsed.step } : {}),
      expiresAt: parsed.expiresAt,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : now,
    };
  } catch {
    return null;
  }
}

export function saveSurveyDraft(
  surveyId: string,
  identity: string,
  draft: SurveyDraft,
  salt?: string,
): void {
  if (!surveyId || !identity.trim()) return;
  safeSet(draftKey(surveyId, identity, salt), JSON.stringify(draft));
}

export function clearSurveyDraft(surveyId: string, identity: string, salt?: string): void {
  if (!surveyId || !identity.trim()) return;
  safeRemove(draftKey(surveyId, identity, salt));
}

export function loadPendingSubmission(
  surveyId: string,
  identity: string,
  salt?: string,
  now = Date.now(),
  maxAgeMs = DEFAULT_PENDING_TTL_MS,
): SurveyPendingSubmission | null {
  if (!surveyId || !identity.trim()) return null;
  const key = pendingKey(surveyId, identity, salt);
  const raw = safeGet(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SurveyPendingSubmission>;
    if (!parsed || !parsed.payload || typeof parsed.queuedAt !== "number") return null;
    if (maxAgeMs > 0 && now - parsed.queuedAt >= maxAgeMs) {
      safeRemove(key);
      return null;
    }
    return {
      payload: parsed.payload,
      queuedAt: parsed.queuedAt,
      attempts: typeof parsed.attempts === "number" ? parsed.attempts : 0,
      ...(typeof parsed.lastError === "string" ? { lastError: parsed.lastError } : {}),
    };
  } catch {
    return null;
  }
}

export function savePendingSubmission(
  surveyId: string,
  identity: string,
  pending: SurveyPendingSubmission,
  salt?: string,
): void {
  if (!surveyId || !identity.trim()) return;
  safeSet(pendingKey(surveyId, identity, salt), JSON.stringify(pending));
}

export function clearPendingSubmission(surveyId: string, identity: string, salt?: string): void {
  if (!surveyId || !identity.trim()) return;
  safeRemove(pendingKey(surveyId, identity, salt));
}

export function hasSurveyPasskey(identity: string, salt?: string): boolean {
  if (!identity.trim()) return false;
  return safeGet(passkeyKey(identity, salt)) === "1";
}

export function saveSurveyPasskey(identity: string, salt?: string): void {
  if (!identity.trim()) return;
  safeSet(passkeyKey(identity, salt), "1");
}

export function clearAllSurveyStorage(): void {
  memoryStore.clear();
  const storage = getWebStorage();
  if (!storage) return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const k = storage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        toRemove.push(k);
      }
    }
    for (const k of toRemove) {
      storage.removeItem(k);
    }
  } catch {
    // Silent fallback
  }
}
