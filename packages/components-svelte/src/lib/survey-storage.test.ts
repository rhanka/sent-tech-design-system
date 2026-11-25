import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_DRAFT_TTL_MS,
  clearAllSurveyStorage,
  clearPendingSubmission,
  clearSurveyDraft,
  hasSurveyPasskey,
  hashSurveyEmail,
  loadPendingSubmission,
  loadSurveyDraft,
  savePendingSubmission,
  saveSurveyDraft,
  saveSurveyPasskey,
} from "./survey-storage.js";
import type { SurveyDraft, SurveyPendingSubmission } from "./survey-types.js";

describe("survey-storage", () => {
  beforeEach(() => {
    clearAllSurveyStorage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearAllSurveyStorage();
  });

  it("hashes emails deterministically, case-insensitively, and never leaks plaintext", () => {
    const h1 = hashSurveyEmail("  Alice@Example.CA ");
    const h2 = hashSurveyEmail("alice@example.ca");
    const h3 = hashSurveyEmail("bob@example.ca");
    expect(h1).toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h1).toMatch(/^[0-9a-f]{16}$/);
    expect(h1).not.toContain("alice");
  });

  it("saves, loads, and expires a 30-minute draft", () => {
    const now = 1_700_000_000_000;
    const draft: SurveyDraft = {
      surveyId: "C",
      answers: { type: "startup", tools: ["t1"] },
      questionIndex: 2,
      enrollmentMeta: { company_name: "Acme" },
      expiresAt: now + DEFAULT_DRAFT_TTL_MS,
      updatedAt: now,
    };

    saveSurveyDraft("C", "alice@example.ca", draft);

    // Ensure raw email is never present in localStorage keys
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i) ?? "";
      expect(k.toLowerCase()).not.toContain("alice@example.ca");
    }

    const loaded = loadSurveyDraft("C", "ALICE@example.ca", now + 60_000);
    expect(loaded).toEqual(draft);

    // Expired at or after expiresAt -> returns null and purges entry
    expect(loadSurveyDraft("C", "alice@example.ca", now + DEFAULT_DRAFT_TTL_MS)).toBeNull();
    expect(loadSurveyDraft("C", "alice@example.ca", now + 1000)).toBeNull();
  });

  it("clears drafts explicitly", () => {
    const now = 1_700_000_000_000;
    saveSurveyDraft("A", "bob@example.ca", {
      surveyId: "A",
      answers: { type: "pme" },
      questionIndex: 0,
      enrollmentMeta: {},
      expiresAt: now + 60_000,
      updatedAt: now,
    });
    clearSurveyDraft("A", "bob@example.ca");
    expect(loadSurveyDraft("A", "bob@example.ca", now)).toBeNull();
  });

  it("persists and clears offline pending submissions", () => {
    const pending: SurveyPendingSubmission = {
      payload: {
        surveyId: "C",
        mode: "partial",
        answeredCount: 2,
        totalQuestions: 5,
        answers: { type: "manuf", tools: ["t1"] },
        enrollmentMeta: {},
        returnedFromDraft: false,
        submittedAt: "2026-11-27T14:00:00.000Z",
      },
      queuedAt: 1_700_000_000_000,
      attempts: 1,
      lastError: "offline",
    };

    savePendingSubmission("C", "alice@example.ca", pending);
    expect(loadPendingSubmission("C", "alice@example.ca")).toEqual(pending);

    clearPendingSubmission("C", "alice@example.ca");
    expect(loadPendingSubmission("C", "alice@example.ca")).toBeNull();
  });

  it("tracks optional local passkey registration per salted identity", () => {
    expect(hasSurveyPasskey("alice@example.ca")).toBe(false);
    saveSurveyPasskey("alice@example.ca");
    expect(hasSurveyPasskey("ALICE@example.ca")).toBe(true);
    expect(hasSurveyPasskey("bob@example.ca")).toBe(false);
  });

  it("falls back silently to in-memory storage when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    const now = 1_700_000_000_000;
    const draft: SurveyDraft = {
      surveyId: "B",
      answers: { type: "services" },
      questionIndex: 1,
      enrollmentMeta: {},
      expiresAt: now + DEFAULT_DRAFT_TTL_MS,
      updatedAt: now,
    };

    expect(() => saveSurveyDraft("B", "sandbox@example.ca", draft)).not.toThrow();
    expect(loadSurveyDraft("B", "sandbox@example.ca", now + 1000)).toEqual(draft);
    clearSurveyDraft("B", "sandbox@example.ca");
    expect(loadSurveyDraft("B", "sandbox@example.ca", now + 1000)).toBeNull();
  });
});
