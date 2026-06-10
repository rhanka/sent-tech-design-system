import { describe, expect, it, beforeEach, vi } from "vitest";

// Le compteur lit `browser` depuis $app/environment et persiste en localStorage.
// On force browser=true et on fournit un localStorage en mémoire pour exercer
// les chemins de persistance (sinon, en SSR, ils seraient ignorés).
vi.mock("$app/environment", () => ({ browser: true }));

// Ces tests re-importent les modules à chaque cas (vi.resetModules en beforeEach),
// ce qui peut dépasser le timeout par défaut (5s) sous charge CI -> flaky.
// Timeout généreux pour stabiliser (notamment le svelte NPM Publish qui lance ces tests).
vi.setConfig({ testTimeout: 20000, hookTimeout: 20000 });

function installMemoryStorage() {
  const store = new Map<string, string>();
  const mock = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear()
  };
  vi.stubGlobal("localStorage", mock);
  return store;
}

describe("anon chat counter", () => {
  beforeEach(() => {
    vi.resetModules();
    installMemoryStorage();
  });

  it("starts empty with the full allowance remaining", async () => {
    const { anonCounter } = await import("./anon-counter.svelte");
    const { ANON_LIMIT } = await import("./chat-config");
    anonCounter.reset();
    expect(anonCounter.count).toBe(0);
    expect(anonCounter.remaining).toBe(ANON_LIMIT);
    expect(anonCounter.reached).toBe(false);
  });

  it("increments, persists, and caps at ANON_LIMIT", async () => {
    const { anonCounter } = await import("./anon-counter.svelte");
    const { ANON_LIMIT, ANON_COUNT_STORAGE_KEY } = await import("./chat-config");
    anonCounter.reset();

    for (let i = 0; i < ANON_LIMIT + 3; i += 1) {
      anonCounter.increment();
    }

    expect(anonCounter.count).toBe(ANON_LIMIT);
    expect(anonCounter.remaining).toBe(0);
    expect(anonCounter.reached).toBe(true);
    expect(localStorage.getItem(ANON_COUNT_STORAGE_KEY)).toBe(String(ANON_LIMIT));
  });

  it("restores a clamped value from localStorage", async () => {
    const { ANON_LIMIT, ANON_COUNT_STORAGE_KEY } = await import("./chat-config");
    localStorage.setItem(ANON_COUNT_STORAGE_KEY, "999");
    const { anonCounter } = await import("./anon-counter.svelte");
    anonCounter.restore();
    expect(anonCounter.count).toBe(ANON_LIMIT);
    expect(anonCounter.reached).toBe(true);
  });

  it("ignores malformed stored values", async () => {
    const { ANON_COUNT_STORAGE_KEY } = await import("./chat-config");
    localStorage.setItem(ANON_COUNT_STORAGE_KEY, "not-a-number");
    const { anonCounter } = await import("./anon-counter.svelte");
    anonCounter.restore();
    expect(anonCounter.count).toBe(0);
  });

  it("reset clears the counter and storage", async () => {
    const { anonCounter } = await import("./anon-counter.svelte");
    const { ANON_COUNT_STORAGE_KEY } = await import("./chat-config");
    anonCounter.increment();
    anonCounter.reset();
    expect(anonCounter.count).toBe(0);
    expect(localStorage.getItem(ANON_COUNT_STORAGE_KEY)).toBeNull();
  });
});

describe("chat config contract", () => {
  it("is unconfigured by default (no PUBLIC_CHAT_ENDPOINT) and never throws", async () => {
    const { isChatConfigured, sendChatMessage, ANON_LIMIT } = await import("./chat-config");
    expect(isChatConfigured()).toBe(false);
    expect(ANON_LIMIT).toBeGreaterThan(0);
    // sendChatMessage doit renvoyer un résultat exploitable, jamais lever.
    const result = await sendChatMessage([{ role: "user", content: "hi" }], "fr");
    expect(result.ok).toBe(false);
    expect(typeof result.reply).toBe("string");
    expect(result.reply.length).toBeGreaterThan(0);
  });

  it("falls back to '#' for the auth CTA when unset", async () => {
    const { CHAT_AUTH_URL } = await import("./chat-config");
    expect(CHAT_AUTH_URL).toBe("#");
  });
});
