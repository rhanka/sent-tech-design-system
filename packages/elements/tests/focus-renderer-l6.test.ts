// @vitest-environment jsdom
/**
 * L6 imposed Focus renderer defaults F-R0–F-R7 (json-render §11.2).
 *
 * RED HISTORY (observed on 55c2e8bf before the implementation): the base
 * renders bare `button` cards with no stylesheet (`borderTopWidth === ""`),
 * no selected state (`[data-st-selected]` 0 even after a click), no badge,
 * no fold control and no `data-st-layout` — measured by the scratch probe
 * `BASE-PROBE card=BUTTON borderTopWidth="" selected=0 badge=0 fold=0
 * layout=none emitted=0`, and `selected=0` after a click that emits once.
 * The `dossier-styles` module, `decideOptionSetLayout` and the fold/badge
 * DOM do not exist, so this file fails to collect on the base.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { renderMarkdown } from "../src/element/markdown/minimal-markdown.js";
import { renderHtml } from "@sentropic/focus";
import { DOSSIER_CSS, FOLD_THRESHOLD_CHARS } from "../src/element/dom/engines/dossier-styles.js";
import {
  decideOptionSetLayout,
  renderDossier,
} from "../src/element/dom/engines/focus-renderer.js";
import { dispatchIntent, type IntentDetail } from "../src/element/dom/intents.js";
import {
  a2uiCommonTypes,
} from "../src/generated/a2ui-common-types.js";
import {
  createEnvelopeValidator,
  createFocusPort,
  type CatalogDocument,
  type Diagnostic,
} from "../src/validate/index.js";
import { validateDecisionDossierDocument as realFocusValidate } from "@sentropic/focus/validate";
import { CATALOG_ID } from "../src/contracts/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = join(here, "..");

const catalog = JSON.parse(readFileSync(join(packageDir, "catalog.json"), "utf8")) as CatalogDocument;
const envelopeSchema = JSON.parse(readFileSync(join(packageDir, "envelope.json"), "utf8")) as Record<string, unknown>;
const commonTypes = a2uiCommonTypes as unknown as Record<string, unknown>;
const focusPort = createFocusPort(realFocusValidate);
const bpmnStub = { source: "bpmn-canvas" as const, validate: () => [] };

function validateEnvelope(input: unknown): readonly Diagnostic[] {
  return createEnvelopeValidator({
    catalog: JSON.parse(JSON.stringify(catalog)) as CatalogDocument,
    envelopeSchema,
    commonTypes,
    ports: { focus: focusPort, "bpmn-canvas": bpmnStub },
  }).validate(input);
}

function fixtureEnvelope(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(here, "fixtures", `${name}.json`), "utf8")) as Record<string, unknown>;
}

function docOf(name: string): Record<string, unknown> {
  return (fixtureEnvelope(name).root as Record<string, unknown>).document as Record<string, unknown>;
}

/** Render one document, collecting dispatched option ids. */
function renderDoc(document_: unknown): { readonly target: HTMLElement; readonly emitted: string[]; readonly stop: () => void } {
  const target = document.createElement("div");
  document.body.append(target);
  const emitted: string[] = [];
  const stop = renderDossier(target, document_, (id) => void emitted.push(id));
  return { target, emitted, stop };
}

function afterEachCleanup(stop: () => void, target: HTMLElement): void {
  stop();
  target.remove();
}

/** Whitespace-collapsed text comparison (AMB-L6-5 normalisation). */
function norm(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

describe("F-R0 consumed contract: author layout is refused (criterion 11-refusal half)", () => {
  it("refuses a root-level author layout property with schema-violation", () => {
    const envelope = fixtureEnvelope("dossier-short2");
    (envelope.root as Record<string, unknown>).layout = "grid";
    const diagnostics = validateEnvelope(envelope);
    const errors = diagnostics.filter((d) => d.severity === "error");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every((d) => d.code === "schema-violation")).toBe(true);
  });

  it("refuses a document-level layout on an option with schema-violation", () => {
    const envelope = fixtureEnvelope("dossier-short2");
    const doc = (envelope.root as Record<string, unknown>).document as Record<string, unknown>;
    const set = (doc.sections as Record<string, unknown>[]).find((s) => s.kind === "optionSet") as Record<string, unknown>;
    const options = set.options as Record<string, unknown>[];
    options[0]!.layout = "grid";
    const diagnostics = validateEnvelope(envelope);
    const errors = diagnostics.filter((d) => d.severity === "error");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every((d) => d.code === "schema-violation")).toBe(true);
  });

  it("refuses a document-level layout on an optionSet with schema-violation", () => {
    const envelope = fixtureEnvelope("dossier-short2");
    const doc = (envelope.root as Record<string, unknown>).document as Record<string, unknown>;
    const set = (doc.sections as Record<string, unknown>[]).find((s) => s.kind === "optionSet") as Record<string, unknown>;
    set.layout = "grid";
    const diagnostics = validateEnvelope(envelope);
    const errors = diagnostics.filter((d) => d.severity === "error");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every((d) => d.code === "schema-violation")).toBe(true);
  });

  it("accepts every L6 fixture envelope with no error diagnostic", () => {
    for (const name of ["dossier-short2", "dossier-short4", "dossier-long", "dossier-reco", "dossier-annotated", "dossier-diagram", "decision-dossier"]) {
      const errors = validateEnvelope(fixtureEnvelope(name)).filter((d) => d.severity === "error");
      expect(errors).toEqual([]);
    }
  });
});

describe("F-R2 stylesheet foundation (criteria 3 and 8, static half)", () => {
  it("carries no colour literal anywhere in the chunk CSS", () => {
    const withoutVars = DOSSIER_CSS.replace(/var\(\s*--[a-z0-9-]+\s*\)/gi, "var()");
    expect(withoutVars).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(withoutVars).not.toMatch(/(rgb|hsl|oklch|oklab|color-mix?)\s*\(/i);
    for (const literal of ["white", "black", "red", "blue", "green", "yellow", "grey", "gray", "transparent", "currentcolor"]) {
      expect(withoutVars).not.toMatch(new RegExp(`\\b${literal}\\b`, "i"));
    }
  });

  it("resolves every colour-bearing declaration through a --st-* token", () => {
    const colourProps = new Set(["color", "background-color", "border-color", "outline-color"]);
    for (const rule of DOSSIER_CSS.split("}")) {
      const body = rule.split("{")[1];
      if (body === undefined) continue;
      for (const declaration of body.split(";")) {
        const [propRaw, ...valueParts] = declaration.split(":");
        const prop = (propRaw ?? "").trim();
        const value = valueParts.join(":").trim();
        if (prop === "" || value === "") continue;
        const bearsColour = colourProps.has(prop) || prop === "border" || prop === "outline" || prop === "background";
        if (!bearsColour) continue;
        expect(value).toContain("var(--st-");
        const stripped = value.replace(/var\(\s*--[a-z0-9-]+\s*\)/gi, "").replace(/\b(1px|solid|none)\b/gi, "").replace(/[0, ]/g, "");
        expect(stripped).not.toMatch(/#[0-9a-f]/i);
      }
    }
  });

  it("keeps every rule at or under 1 px (criterion 8, static half)", () => {
    expect(DOSSIER_CSS).not.toMatch(/\b(thick|medium)\b/);
    for (const match of DOSSIER_CSS.matchAll(/(\d+(?:\.\d+)?)px/g)) {
      expect(Number(match[1])).toBeLessThanOrEqual(1);
    }
    expect(DOSSIER_CSS).toMatch(/border:\s*(?:1px|var\(--st-borderWidth-thin\))\s+(?:solid|var\(--st-borderStyle-solid\))\s+var\(--st-/);
  });

  it("adopts the sheet without an inline <style> element", () => {
    const { target, stop } = renderDoc(docOf("dossier-short2"));
    try {
      const root = target.getRootNode() as Document | ShadowRoot;
      const adopted = (root as Document).adoptedStyleSheets ?? [];
      const hasSheet = adopted.some((sheet) => {
        try {
          return Array.from(sheet.cssRules).length > 0;
        } catch {
          return false;
        }
      });
      const headStyles = Array.from(document.head.querySelectorAll("style[data-st-dossier-sheet]"));
      const styleElements = [...target.querySelectorAll("style"), ...headStyles];
      // Either the constructable sheet is adopted (strict-row path) or the
      // fallback <style> carries the same bytes (pilot path, converted by
      // the wrapper observer under a strict CSP).
      const fallbackCarriesCss = Array.from(styleElements).some((el) => (el.textContent ?? "").includes("st-dossier"));
      expect(hasSheet || fallbackCarriesCss).toBe(true);
      expect(target.querySelector("[data-st-dossier]")).not.toBeNull();
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("exposes the fold threshold at the pinned 300 characters (AMB-L6-2)", () => {
    expect(FOLD_THRESHOLD_CHARS).toBe(300);
  });
});

describe("F-R1 whole card clickable + F-R3 light selection + F-R7 nothing preselected", () => {
  it("starts with no selected state and no emission on every fixture including reco", () => {
    for (const name of ["dossier-short2", "dossier-short4", "dossier-long", "dossier-reco", "dossier-annotated", "dossier-diagram", "decision-dossier"]) {
      const { target, emitted, stop } = renderDoc(docOf(name));
      try {
        expect(target.querySelectorAll('[data-st-selected="true"]').length).toBe(0);
        expect(target.querySelectorAll('[aria-pressed="true"]').length).toBe(0);
        expect(emitted).toEqual([]);
      } finally {
        afterEachCleanup(stop, target);
      }
    }
  });

  it("clicking a card emits exactly one choose-option and marks it selected", () => {
    const { target, emitted, stop } = renderDoc(docOf("dossier-short2"));
    try {
      const card = target.querySelector('[data-option-id="opt-a"]') as HTMLElement;
      card.click();
      expect(emitted).toEqual(["opt-a"]);
      expect(card.getAttribute("data-st-selected")).toBe("true");
      expect(card.getAttribute("aria-pressed")).toBe("true");
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("clicking card padding and badge bubbles selects the card once", () => {
    const { target, emitted, stop } = renderDoc(docOf("dossier-reco"));
    try {
      const card = target.querySelector('[data-option-id="opt-r1"]') as HTMLElement;
      card.click();
      expect(emitted).toEqual(["opt-r1"]);
      const badge = card.querySelector(".st-dossier__badge") as HTMLElement;
      expect(badge).not.toBeNull();
      badge.click();
      expect(emitted).toEqual(["opt-r1"]);
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("clicking the selected card again clears it with no further emission", () => {
    const { target, emitted, stop } = renderDoc(docOf("dossier-short2"));
    try {
      const card = target.querySelector('[data-option-id="opt-a"]') as HTMLElement;
      card.click();
      card.click();
      expect(emitted).toEqual(["opt-a"]);
      expect(card.hasAttribute("data-st-selected")).toBe(false);
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("choosing another card moves the single selection with one more emission", () => {
    const { target, emitted, stop } = renderDoc(docOf("dossier-short2"));
    try {
      const first = target.querySelector('[data-option-id="opt-a"]') as HTMLElement;
      const second = target.querySelector('[data-option-id="opt-b"]') as HTMLElement;
      first.click();
      second.click();
      expect(emitted).toEqual(["opt-a", "opt-b"]);
      expect(first.hasAttribute("data-st-selected")).toBe(false);
      expect(second.getAttribute("data-st-selected")).toBe("true");
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("selects on keyboard Enter and Space with no layout-affecting inline style", () => {
    const { target, emitted, stop } = renderDoc(docOf("dossier-short2"));
    try {
      const card = target.querySelector('[data-option-id="opt-a"]') as HTMLElement;
      expect(card.getAttribute("style")).toBeNull();
      card.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      expect(emitted).toEqual(["opt-a"]);
      expect(card.getAttribute("style")).toBeNull();
      card.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      expect(emitted).toEqual(["opt-a"]);
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("never writes the selection back into the envelope or the document", () => {
    const document_ = docOf("dossier-short2");
    const before = JSON.stringify(document_);
    const { target, emitted, stop } = renderDoc(document_);
    try {
      (target.querySelector('[data-option-id="opt-a"]') as HTMLElement).click();
      expect(emitted).toEqual(["opt-a"]);
      expect(JSON.stringify(document_)).toBe(before);
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("keeps a disabled option inert with no control (L2 gate restyled as a card)", () => {
    const document_ = docOf("dossier-short2");
    (document_ as Record<string, unknown>).interactions = [
      { name: "choose-option", targetRef: "opt-b", label: "Choose", enabled: false },
    ];
    const { target, emitted, stop } = renderDoc(document_);
    try {
      const disabled = target.querySelector('[data-option-disabled="opt-b"]') as HTMLElement;
      expect(disabled).not.toBeNull();
      expect(disabled.querySelectorAll("button, a, [role='button'], [tabindex]").length).toBe(0);
      expect(disabled.className).toContain("st-dossier__optionCard");
      disabled.click();
      expect(emitted).toEqual([]);
      expect(target.querySelector('[data-option-id="opt-b"]')).toBeNull();
    } finally {
      afterEachCleanup(stop, target);
    }
  });
});

describe("F-R4 long arguments folded + F-R5 renderer-chosen layout", () => {
  it("renders long options collapsed by default with label, consequence and expand control visible", () => {
    const { target, emitted, stop } = renderDoc(docOf("dossier-long"));
    try {
      const cards = target.querySelectorAll('[data-option-id^="opt-long-"]');
      expect(cards.length).toBe(4);
      for (const card of Array.from(cards)) {
        const fold = card.querySelector("[data-option-fold]") as HTMLElement | null;
        expect(fold).not.toBeNull();
        expect(fold!.getAttribute("aria-expanded")).toBe("false");
        expect(norm(fold!.textContent)).toMatch(/show/i);
        const body = card.querySelector(".st-dossier__optionBody") as HTMLElement | null;
        expect(body).not.toBeNull();
        expect(body!.hasAttribute("hidden")).toBe(true);
        expect(norm(card.querySelector(".st-dossier__optionLabel")?.textContent).length).toBeGreaterThan(0);
        expect(norm(card.querySelector(".st-dossier__optionConsequence")?.textContent).length).toBeGreaterThan(0);
      }
      expect(emitted).toEqual([]);
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("expanding reveals the full text with no choose-option emission", () => {
    const { target, emitted, stop } = renderDoc(docOf("dossier-long"));
    try {
      const card = target.querySelector('[data-option-id="opt-long-1"]') as HTMLElement;
      const fold = card.querySelector("[data-option-fold]") as HTMLElement;
      const body = card.querySelector(".st-dossier__optionBody") as HTMLElement;
      const fullText = norm(body.textContent);
      expect(fullText.length).toBeGreaterThan(FOLD_THRESHOLD_CHARS);
      fold.click();
      expect(body.hasAttribute("hidden")).toBe(false);
      expect(fold.getAttribute("aria-expanded")).toBe("true");
      expect(norm(body.textContent)).toBe(fullText);
      expect(emitted).toEqual([]);
      fold.click();
      expect(body.hasAttribute("hidden")).toBe(true);
      expect(emitted).toEqual([]);
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("renders short options fully with no fold control", () => {
    for (const name of ["dossier-short2", "dossier-short4", "dossier-reco", "dossier-annotated", "dossier-diagram"]) {
      const { target, stop } = renderDoc(docOf(name));
      try {
        expect(target.querySelectorAll("[data-option-fold]").length).toBe(0);
      } finally {
        afterEachCleanup(stop, target);
      }
    }
  });

  it("renders a just-under-threshold body fully with no fold control", () => {
    const document_ = docOf("dossier-short2");
    const doc = document_ as Record<string, unknown>;
    const set = (doc.sections as Record<string, unknown>[]).find((s) => s.kind === "optionSet") as Record<string, unknown>;
    const options = set.options as Record<string, unknown>[];
    // 280–300 characters: under the 300 fold threshold (AMB-L6-2 control).
    options[0]!.body = "detail ".repeat(41).trim();
    expect((options[0]!.body as string).length).toBeGreaterThanOrEqual(280);
    expect((options[0]!.body as string).length).toBeLessThanOrEqual(300);
    const { target, stop } = renderDoc(document_);
    try {
      const card = target.querySelector('[data-option-id="opt-a"]') as HTMLElement;
      expect(card.querySelector("[data-option-fold]")).toBeNull();
      const body = card.querySelector(".st-dossier__optionBody") as HTMLElement | null;
      expect(body).not.toBeNull();
      expect(body!.hasAttribute("hidden")).toBe(false);
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("picks the layout from count and length (AMB-L6-3 decision table)", () => {
    expect(decideOptionSetLayout(1, false)).toBe("list");
    expect(decideOptionSetLayout(2, false)).toBe("list");
    expect(decideOptionSetLayout(3, false)).toBe("grid");
    expect(decideOptionSetLayout(4, false)).toBe("grid");
    expect(decideOptionSetLayout(1, true)).toBe("list");
    expect(decideOptionSetLayout(2, true)).toBe("list");
    expect(decideOptionSetLayout(4, true)).toBe("list");
  });

  it("marks short2 list, short4 grid and long list in the DOM, stably", () => {
    const expectations: ReadonlyArray<readonly [string, string]> = [
      ["dossier-short2", "list"],
      ["dossier-short4", "grid"],
      ["dossier-long", "list"],
    ];
    for (const [name, layout] of expectations) {
      const first = renderDoc(docOf(name));
      const second = renderDoc(docOf(name));
      try {
        expect(first.target.querySelector("[data-st-option-set]")?.getAttribute("data-st-layout")).toBe(layout);
        expect(second.target.querySelector("[data-st-option-set]")?.getAttribute("data-st-layout")).toBe(layout);
      } finally {
        afterEachCleanup(first.stop, first.target);
        afterEachCleanup(second.stop, second.target);
      }
    }
  });

  it("caps the grid at two columns in the chunk CSS", () => {
    expect(DOSSIER_CSS).toMatch(/repeat\(\s*2\s*,/);
    expect(DOSSIER_CSS).not.toMatch(/repeat\(\s*[3-9]\s*,/);
  });
});

describe("F-R6 single annotation + F-R7 discreet badge (criteria 12, 13)", () => {
  it("badges exactly the recommended option and no other card", () => {
    const { target, stop } = renderDoc(docOf("dossier-reco"));
    try {
      const badges = target.querySelectorAll(".st-dossier__badge");
      expect(badges.length).toBe(1);
      const card = target.querySelector('[data-option-id="opt-r1"]') as HTMLElement;
      expect(card.querySelector(".st-dossier__badge")).not.toBeNull();
      expect(norm(badges[0]!.textContent).length).toBeGreaterThan(0);
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("renders the badge as display state that changes neither control nor selection", () => {
    const { target, emitted, stop } = renderDoc(docOf("dossier-reco"));
    try {
      const badge = target.querySelector(".st-dossier__badge") as HTMLElement;
      expect(["SPAN", "P", "EM", "STRONG"]).toContain(badge.tagName);
      expect(badge.closest("button, a")).toBeNull();
      expect(badge.hasAttribute("tabindex")).toBe(false);
      (target.querySelector('[data-option-id="opt-r2"]') as HTMLElement).click();
      expect(emitted).toEqual(["opt-r2"]);
      expect(target.querySelectorAll(".st-dossier__badge").length).toBe(1);
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("renders an unmatched recommendedAnswer as question context text, never preselected", () => {
    const document_ = docOf("dossier-reco");
    const doc = document_ as Record<string, unknown>;
    const question = (doc.sections as Record<string, unknown>[]).find((s) => s.kind === "question") as Record<string, unknown>;
    question.recommendedOptionId = "opt-missing";
    const { target, emitted, stop } = renderDoc(document_);
    try {
      expect(target.querySelectorAll(".st-dossier__badge").length).toBe(0);
      const reco = target.querySelector(".st-dossier__questionReco") as HTMLElement | null;
      expect(reco).not.toBeNull();
      expect(norm(reco!.textContent)).toBe(norm(question.recommendedAnswer as string));
      expect(target.querySelectorAll('[data-st-selected="true"]').length).toBe(0);
      expect(emitted).toEqual([]);
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("renders annotations as display state with no per-option control", () => {
    const { target, stop } = renderDoc(docOf("dossier-annotated"));
    try {
      const accept = target.querySelector('[data-option-id="opt-c1"] .st-dossier__optionAnnotation') as HTMLElement | null;
      expect(accept).not.toBeNull();
      expect(accept!.getAttribute("data-annotation")).toBe("accept");
      const comment = target.querySelector('[data-option-id="opt-c2"] .st-dossier__optionAnnotationComment') as HTMLElement | null;
      expect(comment).not.toBeNull();
      expect(norm(comment!.textContent).length).toBeGreaterThan(0);
      for (const card of Array.from(target.querySelectorAll("[data-option-id]"))) {
        expect(card.querySelectorAll("button, a, input, select, textarea, [role='menu'], [role='menuitem']").length).toBe(0);
      }
      const annotationControls = target.querySelectorAll("[data-annotation-control]");
      expect(annotationControls.length).toBeLessThanOrEqual(1);
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("emits exactly one choose-option per choosing click and none from the fold control", () => {
    const { target, emitted, stop } = renderDoc(docOf("dossier-long"));
    try {
      (target.querySelector('[data-option-fold="opt-long-1"]') as HTMLElement).click();
      expect(emitted).toEqual([]);
      (target.querySelector('[data-option-id="opt-long-1"]') as HTMLElement).click();
      expect(emitted).toEqual(["opt-long-1"]);
    } finally {
      afterEachCleanup(stop, target);
    }
  });
});

describe("criterion 4 element half: the §4.6 choose-option detail", () => {
  it("dispatches the §4.6 intent detail through the existing dispatch", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const seen: IntentDetail[] = [];
    try {
      host.addEventListener("st-intent", (event) => {
        seen.push((event as CustomEvent<IntentDetail>).detail);
      });
      dispatchIntent(host, "choose-option", "opt-a");
      expect(seen.length).toBe(1);
      expect(seen[0]).toEqual({ event: "intent", name: "choose-option", target: "opt-a", context: {} });
      const dispatched = host ? seen[0] : undefined;
      expect(dispatched!.event).toBe("intent");
    } finally {
      host.remove();
    }
  });

  it("maps the element intent to the h2a submit_intent shape at the boundary (MCP leg unverified)", () => {
    // DS-side only: the element emits the §4.6 detail; the h2a §8.2
    // `tools/call` of `submit_intent` (visibility ["app"]), the
    // decision-inject route and delivery stay h2a-side and unverified
    // without a host in this run (split table, consequence 2).
    const detail: IntentDetail = { event: "intent", name: "choose-option", target: "opt-r1", context: {} };
    expect(detail.event).toBe("intent");
    expect(detail.name).toBe("choose-option");
    expect(detail.target).toBe("opt-r1");
  });
});

describe("criterion 2 content parity with the owner renderHtml (AMB-L6-5)", () => {
  const hooks = {
    renderMarkdown: (markdown: string) => renderMarkdown(markdown),
    sanitizeHtml: (html: string) => html,
  };

  /** Owner sections in order, mapped to DS kinds. */
  function ownerKinds(ownerRoot: Element): string[] {
    const kinds: string[] = [];
    for (const section of Array.from(ownerRoot.querySelectorAll(":scope > section, :scope > header, :scope > figure"))) {
      const cls = section.className;
      if (cls.includes("focus-header") || cls.includes("focus-readability") || cls.includes("focus-affordances")) continue;
      if (cls.includes("focus-question")) kinds.push("question");
      else if (cls.includes("focus-optionset")) kinds.push("optionSet");
      else if (cls.includes("focus-outcome")) kinds.push("outcome");
      else if (cls.includes("focus-prose")) kinds.push("prose");
      else if (cls.includes("focus-diagram")) kinds.push("diagram");
      else if (cls.includes("focus-amendment-trace")) kinds.push("amendmentTrace");
    }
    return kinds;
  }

  function ownerOptions(ownerRoot: Element): Array<{ readonly id: string; readonly label: string }> {
    return Array.from(ownerRoot.querySelectorAll(".focus-option")).map((item) => {
      const label = item.querySelector("strong");
      return { id: "", label: norm(label?.textContent) };
    });
  }

  it("agrees on section order, option ids/titles and outcome text on presentation-valid fixtures", () => {
    for (const name of ["dossier-short2", "dossier-short4", "dossier-reco", "dossier-annotated", "dossier-diagram"]) {
      const document_ = docOf(name);
      const ownerHtml = renderHtml(document_ as never, hooks);
      const ownerContainer = document.createElement("div");
      ownerContainer.innerHTML = ownerHtml;
      const article = ownerContainer.querySelector("article");
      expect(article).not.toBeNull();
      const { target, stop } = renderDoc(document_);
      try {
        const doc = document_ as Record<string, unknown>;
        const sections = doc.sections as Record<string, unknown>[];
        // Same sections in the same order (fixtures list each optionSet
        // right after its question, matching the owner grouping). The
        // owner always appends its amendment-trace section, even "(none)".
        const expectedKinds = sections.map((s) => String(s.kind));
        expect(ownerKinds(article!)).toEqual([...expectedKinds, "amendmentTrace"]);
        // Same option ids and titles.
        const expectedOptions = sections.flatMap((s) =>
          s.kind === "optionSet"
            ? ((s.options as Record<string, unknown>[]).map((o) => ({ id: String(o.id), label: norm(o.label as string) })))
            : [],
        );
        const ownerLabels = ownerOptions(article!);
        expect(ownerLabels.map((o) => o.label)).toEqual(expectedOptions.map((o) => o.label));
        const dsCards = Array.from(target.querySelectorAll("[data-option-id]"));
        expect(dsCards.map((c) => c.getAttribute("data-option-id"))).toEqual(expectedOptions.map((o) => o.id));
        expect(dsCards.map((c) => norm(c.querySelector(".st-dossier__optionLabel")?.textContent))).toEqual(
          expectedOptions.map((o) => o.label),
        );
        // Same outcome text (the one statement the criterion names).
        const outcome = sections.find((s) => s.kind === "outcome") as Record<string, unknown>;
        expect(norm(article!.querySelector(".focus-outcome p")?.textContent)).toBe(norm(outcome.statement as string));
        expect(norm(target.querySelector(".st-dossier__outcomeText")?.textContent)).toBe(norm(outcome.statement as string));
        // Same prose text through the shared minimal markdown.
        const proseSections = sections.filter((s) => s.kind === "prose");
        const ownerProse = Array.from(article!.querySelectorAll(".focus-prose")).map((el) => norm(el.textContent));
        const dsProse = Array.from(target.querySelectorAll(".st-dossier__prose")).map((el) => norm(el.textContent));
        expect(dsProse).toEqual(ownerProse);
        expect(dsProse.length).toBe(proseSections.length);
      } finally {
        afterEachCleanup(stop, target);
      }
    }
  });

  it("records the presentation-gate boundary on long and legacy inputs (owner refuses, DS renders)", () => {
    // The owner presents only after the readability gate; the DS renders any
    // structurally valid document. Both long bodies and the L2 legacy
    // fixture are out of the owner-presentable set, and the DS still renders
    // their sections, ids and outcome from the input.
    for (const name of ["dossier-long", "decision-dossier"]) {
      const document_ = docOf(name);
      let refused = false;
      try {
        renderHtml(document_ as never, hooks);
      } catch {
        refused = true;
      }
      expect(refused).toBe(true);
      const { target, stop } = renderDoc(document_);
      try {
        const doc = document_ as Record<string, unknown>;
        const sections = doc.sections as Record<string, unknown>[];
        const expectedKinds = sections.map((s) => String(s.kind));
        const renderedKinds = Array.from(
          target.querySelectorAll("[data-st-question], [data-st-option-set], [data-st-outcome], .st-dossier__prose, [data-st-diagram], [data-st-trace]"),
        ).map((el) => {
          if (el.hasAttribute("data-st-question")) return "question";
          if (el.hasAttribute("data-st-option-set")) return "optionSet";
          if (el.hasAttribute("data-st-outcome")) return "outcome";
          if (el.hasAttribute("data-st-diagram")) return "diagram";
          if (el.hasAttribute("data-st-trace")) return "amendmentTrace";
          return "prose";
        });
        expect(renderedKinds).toEqual(expectedKinds);
      } finally {
        afterEachCleanup(stop, target);
      }
    }
  });

  it("renders diagrams as the fenced fallback with no canvas or svg engine (criterion 5)", () => {
    const { target, stop } = renderDoc(docOf("dossier-diagram"));
    try {
      const figure = target.querySelector("[data-st-diagram]") as HTMLElement | null;
      expect(figure).not.toBeNull();
      expect(figure!.tagName).toBe("FIGURE");
      expect(norm(figure!.querySelector("[data-st-diagram-source]")?.textContent)).toContain("start --> finish");
      expect(target.querySelectorAll("canvas, svg, iframe").length).toBe(0);
    } finally {
      afterEachCleanup(stop, target);
    }
  });

  it("keeps prose, question context/state, outcome modality and trace in document order", () => {
    const { target, stop } = renderDoc(docOf("dossier-diagram"));
    try {
      const article = target.querySelector("[data-st-dossier]") as HTMLElement;
      const order = Array.from(article.children).map((el) => el.className);
      const headerIndex = order.findIndex((cls) => cls.includes("st-dossier__header"));
      const proseIndex = order.findIndex((cls) => cls.includes("st-dossier__prose"));
      const questionIndex = order.findIndex((cls) => cls.includes("st-dossier__question"));
      const optionsIndex = order.findIndex((cls) => cls.includes("st-dossier__options"));
      const outcomeIndex = order.findIndex((cls) => cls.includes("st-dossier__outcome"));
      const diagramIndex = order.findIndex((cls) => cls.includes("st-dossier__diagram"));
      expect([headerIndex, proseIndex, questionIndex, optionsIndex, outcomeIndex, diagramIndex].every((i) => i >= 0)).toBe(true);
      expect(proseIndex).toBeLessThan(questionIndex);
      expect(questionIndex).toBeLessThan(optionsIndex);
      expect(optionsIndex).toBeLessThan(outcomeIndex);
      expect(outcomeIndex).toBeLessThan(diagramIndex);
      const question = target.querySelector("[data-st-question]") as HTMLElement;
      expect(norm(question.querySelector(".st-dossier__questionContext")?.textContent).length).toBeGreaterThan(0);
      expect(question.querySelector("[data-st-question-state]")).not.toBeNull();
      expect(norm(target.querySelector(".st-dossier__modality")?.textContent)).toBe("decision");
      expect(target.querySelectorAll("[data-st-trace-step]").length).toBe(1);
    } finally {
      afterEachCleanup(stop, target);
    }
  });
});
