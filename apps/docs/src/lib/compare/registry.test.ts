// apps/docs/src/lib/compare/registry.test.ts
import { describe, it, expect } from "vitest";
import { gapKey, manifestHash, mergeRegistry, deriveStatus } from "./registry.mjs";

describe("gapKey", () => {
  it("joins identity dimensions deterministically", () => {
    const k = gapKey({ theme: "dsfr", component: "Button", scenario: "disabled", state: "disabled", property: "background-color" });
    expect(k).toBe("dsfr/Button/disabled/disabled/background-color");
  });
});

describe("manifestHash", () => {
  const base = { dsfr: { Button: { component: "Button", scenario: "primary", state: "rest", ourSelector: ".st-button", refSelector: ".fr-btn", refMarkup: "<button>" } } };
  it("is stable for identical input", () => {
    expect(manifestHash(base)).toBe(manifestHash(structuredClone(base)));
  });
  it("changes when a selector changes", () => {
    const altered = structuredClone(base);
    altered.dsfr.Button.refSelector = ".fr-btn--secondary";
    expect(manifestHash(altered)).not.toBe(manifestHash(base));
  });
  it("is order-independent across theme/key insertion order", () => {
    const a = { dsfr: { A: { component: "A", scenario: "s", state: "rest", ourSelector: ".a", refSelector: ".ra", refMarkup: "x" }, B: { component: "B", scenario: "s", state: "rest", ourSelector: ".b", refSelector: ".rb", refMarkup: "y" } } };
    const b = { dsfr: { B: a.dsfr.B, A: a.dsfr.A } };
    expect(manifestHash(a)).toBe(manifestHash(b));
  });
});

describe("mergeRegistry", () => {
  const stamp = { manifestHash: "h1", generatedAt: "2026-05-30T00:00:00Z", anatomyVersion: "1.5.0", dsVersion: "^0.10.2", themeVersion: "^0.2.2" };
  const gap = { theme: "dsfr", component: "Button", scenario: "disabled", state: "disabled", property: "background-color", ours: "rgb(0,0,145)", ref: "rgb(229,229,229)", delta: "≠" };
  const key = gapKey(gap);

  it("creates a new oracle entry as open", () => {
    const out = mergeRegistry(null, [gap], stamp);
    expect(out.entries[key]).toMatchObject({ status: "open", source: "oracle", ours: "rgb(0,0,145)", lastSeen: stamp.generatedAt });
  });

  it("preserves human status and note on re-measure", () => {
    const existing = { version: 1, entries: { [key]: { ...gap, status: "escape", note: "DSFR n'expose pas ce token", source: "manual" } } };
    const out = mergeRegistry(existing, [gap], stamp);
    expect(out.entries[key].status).toBe("escape");
    expect(out.entries[key].note).toBe("DSFR n'expose pas ce token");
    expect(out.entries[key].ours).toBe("rgb(0,0,145)"); // measurement refreshed
    expect(out.entries[key].lastSeen).toBe(stamp.generatedAt);
  });

  it("marks a previously-open oracle gap fixed when no longer measured", () => {
    const existing = { version: 1, entries: { [key]: { ...gap, status: "open", source: "oracle" } } };
    const out = mergeRegistry(existing, [], stamp);
    expect(out.entries[key].status).toBe("fixed");
  });

  it("flags regressed when a human-fixed gap reappears", () => {
    const existing = { version: 1, entries: { [key]: { ...gap, status: "fixed", source: "oracle" } } };
    const out = mergeRegistry(existing, [gap], stamp);
    expect(out.entries[key].status).toBe("fixed"); // human intent kept
    expect(out.entries[key].regressed).toBe(true);
  });

  it("leaves untouched manual entries the oracle never measures", () => {
    const manualKey = gapKey({ theme: "dsfr", component: "Header", scenario: "auth", state: "rest", property: "layout" });
    const existing = { version: 1, entries: { [manualKey]: { theme: "dsfr", component: "Header", scenario: "auth", state: "rest", property: "layout", status: "escape", source: "manual", note: "impossible" } } };
    const out = mergeRegistry(existing, [gap], stamp);
    expect(out.entries[manualKey].status).toBe("escape");
    expect(out.entries[manualKey].source).toBe("manual");
  });
});

describe("deriveStatus", () => {
  it("returns stale when the manifest hash no longer matches", () => {
    expect(deriveStatus({ status: "open", manifestHash: "old" }, "new")).toBe("stale");
  });
  it("returns regressed when the regressed flag is set", () => {
    expect(deriveStatus({ status: "fixed", regressed: true, manifestHash: "h1" }, "h1")).toBe("regressed");
  });
  it("passes the human status through otherwise", () => {
    expect(deriveStatus({ status: "escape", manifestHash: "h1" }, "h1")).toBe("escape");
  });
});
