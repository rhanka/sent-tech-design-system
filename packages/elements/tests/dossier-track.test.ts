// @vitest-environment jsdom
/**
 * L6 Task 7 pilot witness: the `track focus --format json` output for the
 * published decision `01M6F299S0TJJ085JDRZ0YM64B`, committed byte-for-byte
 * as `fixtures/dossier-track.json` inside the `DecisionDossier` envelope.
 *
 * RED HISTORY: before Task 7 no `dossier-track.json` existed, so the
 * Chromium `TRACK_L6_PRESENT` row recorded `blocked` and no vitest test
 * touched a real Track document. This file fails to collect without the
 * fixture and fails its regeneration check on any drift.
 *
 * Provenance (recorded at generation, 2026-11-02):
 * - track version: 0.98.8 (`track --version`, global CLI)
 * - command (run from the h2a repo root):
 *   track focus 01M6F299S0TJJ085JDRZ0YM64B --workspace \
 *     'ws:89c45cc3e040949f1a1a034529722ee877150fd2a0e3da16a7f6e9d8e27f495d' \
 *     --format json
 *   exit code 0, stdout 57 372 bytes; the document inside the envelope
 *   re-serializes byte-identically to that stdout (no manual edit).
 * - decision: 01M6F299S0TJJ085JDRZ0YM64B
 *   (« Mémoire cible complète : 24 choix communs »)
 * - workspace: ws:89c45cc3e040949f1a1a034529722ee877150fd2a0e3da16a7f6e9d8e27f495d
 * - known h2a limit: the Track→Focus projection v1 carries no top-level
 *   `sources`; nothing is added here (a criterion needing it stays an
 *   h2a input).
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { renderHtml } from "@sentropic/focus";
import { validateDecisionDossierDocument as realFocusValidate } from "@sentropic/focus/validate";
import { renderMarkdown } from "../src/element/markdown/minimal-markdown.js";
import {
  decideOptionSetLayout,
  isLongOption,
  renderDossier,
} from "../src/element/dom/engines/focus-renderer.js";
import { dispatchIntent, type IntentDetail } from "../src/element/dom/intents.js";
import {
  createEnvelopeValidator,
  createFocusPort,
  type CatalogDocument,
  type Diagnostic,
} from "../src/validate/index.js";
import { a2uiCommonTypes } from "../src/generated/a2ui-common-types.js";

/** Provenance of the committed fixture (see header). */
const PROVENANCE = {
  trackVersion: "0.98.8",
  decisionId: "01M6F299S0TJJ085JDRZ0YM64B",
  workspace: "ws:89c45cc3e040949f1a1a034529722ee877150fd2a0e3da16a7f6e9d8e27f495d",
  sha256: "8fc4f66acbce47ecbe44affd9d2b31cb708a9814cf6b722da0e81eca05102af5",
} as const;

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = join(here, "..");
const fixturePath = join(here, "fixtures", "dossier-track.json");

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

function trackEnvelope(): Record<string, unknown> {
  return JSON.parse(readFileSync(fixturePath, "utf8")) as Record<string, unknown>;
}

function trackDoc(): Record<string, unknown> {
  return (trackEnvelope().root as Record<string, unknown>).document as Record<string, unknown>;
}

function norm(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

describe("Task 7 pilot input: the track CLI fixture is present (TRACK_L6_PRESENT)", () => {
  it("commits dossier-track.json next to the other L6 fixtures", () => {
    expect(existsSync(fixturePath)).toBe(true);
  });

  it("fails on any drift from the recorded sha256 (regeneration check)", () => {
    const bytes = readFileSync(fixturePath);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(PROVENANCE.sha256);
  });

  it("keeps the provenance the report names (version, decision, workspace)", () => {
    expect(PROVENANCE.trackVersion).toBe("0.98.8");
    expect(PROVENANCE.decisionId).toBe("01M6F299S0TJJ085JDRZ0YM64B");
    expect(PROVENANCE.workspace).toBe("ws:89c45cc3e040949f1a1a034529722ee877150fd2a0e3da16a7f6e9d8e27f495d");
    const envelope = trackEnvelope();
    expect(envelope.contract).toBe("1.0");
    const root = envelope.root as Record<string, unknown>;
    expect(root.component).toBe("DecisionDossier");
    expect(root.id).toBe("root");
    expect((root.document as Record<string, unknown>).ref).toBe(PROVENANCE.decisionId);
  });
});

describe("Task 7 pilot document: DecisionDossierDocument validation (pinned focus validator)", () => {
  it("passes validateDecisionDossierDocument with no issues", () => {
    const result = realFocusValidate(trackDoc());
    expect(result.ok).toBe(true);
  });

  it("passes the element envelope validation with no error diagnostic", () => {
    const errors = validateEnvelope(trackEnvelope()).filter((d) => d.severity === "error");
    expect(errors).toEqual([]);
  });

  it("carries the expected pilot shape: 50 sections, 24 questions, 73 options", () => {
    const sections = trackDoc().sections as Record<string, unknown>[];
    expect(sections.length).toBe(50);
    expect(sections.filter((s) => s.kind === "question").length).toBe(24);
    const sets = sections.filter((s) => s.kind === "optionSet");
    expect(sets.length).toBe(24);
    expect(sets.flatMap((s) => s.options as unknown[]).length).toBe(73);
    expect(trackDoc().title).toBe("Mémoire cible complète : 24 choix communs");
  });
});

describe("Task 7 pilot render: F-R0–F-R7 hold on the real 24-question dossier", () => {
  function renderTrack(): { readonly target: HTMLElement; readonly emitted: string[]; readonly stop: () => void } {
    const target = document.createElement("div");
    document.body.append(target);
    const emitted: string[] = [];
    const stop = renderDossier(target, trackDoc(), (id) => void emitted.push(id));
    return { target, emitted, stop };
  }

  function cleanup(stop: () => void, target: HTMLElement): void {
    stop();
    target.remove();
    for (const leftover of Array.from(document.head.querySelectorAll("style[data-st-dossier-sheet]"))) {
      leftover.remove();
    }
  }

  it("renders nothing preselected and emits nothing before any click (F-R7)", () => {
    const start = performance.now();
    const { target, emitted, stop } = renderTrack();
    const renderMs = performance.now() - start;
    try {
      expect(target.querySelectorAll('[data-st-selected="true"]').length).toBe(0);
      expect(target.querySelectorAll('[aria-pressed="true"]').length).toBe(0);
      expect(emitted).toEqual([]);
      // Record the render cost and the rendered volume for the report.
      expect(target.querySelectorAll("[data-option-id]").length).toBe(73);
      expect(renderMs).toBeLessThan(5000);
    } finally {
      cleanup(stop, target);
    }
  });

  it("badges exactly the recommended option of each of the 24 optionSets (F-R7)", () => {
    const { target, stop } = renderTrack();
    try {
      const sections = trackDoc().sections as Record<string, unknown>[];
      const questions = new Map(
        sections.filter((s) => s.kind === "question").map((q) => [String(q.id), q]),
      );
      const sets = sections.filter((s) => s.kind === "optionSet");
      const badges = target.querySelectorAll(".st-dossier__badge");
      expect(badges.length).toBe(24);
      for (const set of sets) {
        const question = questions.get(String(set.questionId)) as Record<string, unknown>;
        const recommended = String(question.recommendedOptionId);
        const card = target.querySelector(`[data-option-id="${recommended}"]`) as HTMLElement | null;
        expect(card).not.toBeNull();
        expect(card!.querySelector(".st-dossier__badge")).not.toBeNull();
        const rendered = Array.from(
          (card!.closest("[data-st-option-set]") ?? target).querySelectorAll(".st-dossier__badge"),
        );
        expect(rendered.length).toBe(1);
      }
    } finally {
      cleanup(stop, target);
    }
  });

  it("renders no fold control: every argument is under the fold threshold (F-R4 vacuous)", () => {
    const { target, stop } = renderTrack();
    try {
      expect(target.querySelectorAll("[data-option-fold]").length).toBe(0);
      // The one annotated comment stays display state, never a control (F-R6).
      expect(target.querySelectorAll(".st-dossier__optionAnnotation").length).toBe(0);
      expect(target.querySelectorAll("[data-annotation-control]").length).toBe(0);
      for (const card of Array.from(target.querySelectorAll("[data-option-id]"))) {
        expect(card.querySelectorAll("button, a, input, select, textarea, [role='menu'], [role='menuitem']").length).toBe(0);
      }
    } finally {
      cleanup(stop, target);
    }
  });

  it("lets the renderer alone pick list or grid per optionSet, never more than 2 columns (F-R5)", () => {
    const { target, stop } = renderTrack();
    try {
      const sections = trackDoc().sections as Record<string, unknown>[];
      const sets = sections.filter((s) => s.kind === "optionSet");
      expect(target.querySelectorAll("[data-st-option-set]").length).toBe(24);
      for (const set of sets) {
        const options = set.options as Record<string, unknown>[];
        const expected = decideOptionSetLayout(
          options.length,
          options.some((o) => isLongOption(o)),
        );
        const node = target.querySelector(`[data-st-option-set="${String(set.id)}"]`);
        expect(node).not.toBeNull();
        expect(node!.getAttribute("data-st-layout")).toBe(expected);
      }
    } finally {
      cleanup(stop, target);
    }
  });

  it("clicking a track card emits exactly one choose-option with its id (criterion 4 element half)", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const seen: IntentDetail[] = [];
    host.addEventListener("st-intent", (event) => {
      seen.push((event as CustomEvent<IntentDetail>).detail);
    });
    const target = document.createElement("div");
    host.append(target);
    try {
      const firstId = (
        (trackDoc().sections as Record<string, unknown>[]).find((s) => s.kind === "optionSet") as Record<string, unknown>
      ).options as Record<string, unknown>[];
      const stop = renderDossier(target, trackDoc(), (id) => void dispatchIntent(host, "choose-option", id));
      try {
        (target.querySelector(`[data-option-id="${String(firstId[0]!.id)}"]`) as HTMLElement).click();
        expect(seen.length).toBe(1);
        expect(seen[0]).toEqual({
          event: "intent",
          name: "choose-option",
          target: String(firstId[0]!.id),
          context: {},
        });
      } finally {
        stop();
      }
    } finally {
      target.remove();
      host.remove();
      for (const leftover of Array.from(document.head.querySelectorAll("style[data-st-dossier-sheet]"))) {
        leftover.remove();
      }
    }
  });

  it("records the presentation-order divergence on kind-grouped input (owner pairs, DS keeps document order)", () => {
    // NAMED DIVERGENCE (criterion 2, real Track input only): the owner
    // `renderHtml` runs `preparePresentation`, which pairs each question
    // with its linked optionSets (`questionId`), while the DS renderer
    // keeps raw document order. The six hand-written L6 fixtures interleave
    // question and optionSet, so both agree there; the published Track
    // projection emits prose, 24 questions, 24 optionSets, outcome, and the
    // two orders part. Whether Track should emit interleaved sections or
    // the DS should adopt pairing is an h-cond ruling, not a Task 7 edit.
    const document_ = trackDoc();
    const sections = document_.sections as Record<string, unknown>[];
    expect(sections.map((s) => String(s.kind))).toEqual([
      "prose",
      ...Array.from({ length: 24 }, () => "question"),
      ...Array.from({ length: 24 }, () => "optionSet"),
      "outcome",
    ]);
    const ownerHtml = renderHtml(document_ as never, {
      renderMarkdown: (markdown: string) => renderMarkdown(markdown),
      sanitizeHtml: (html: string) => html,
    });
    const ownerContainer = document.createElement("div");
    ownerContainer.innerHTML = ownerHtml;
    const article = ownerContainer.querySelector("article");
    expect(article).not.toBeNull();
    const ownerKinds = Array.from(article!.querySelectorAll(":scope > section, :scope > header, :scope > figure"))
      .map((el) => el.className)
      .filter(
        (cls) =>
          !cls.includes("focus-header") &&
          !cls.includes("focus-readability") &&
          !cls.includes("focus-affordances"),
      )
      .map((cls) =>
        cls.includes("focus-question")
          ? "question"
          : cls.includes("focus-optionset")
            ? "optionSet"
            : cls.includes("focus-outcome")
              ? "outcome"
              : cls.includes("focus-amendment-trace")
                ? "amendmentTrace"
                : "prose",
      );
    const sets = sections.filter((s) => s.kind === "optionSet");
    const questions = sections.filter((s) => s.kind === "question");
    // Every set is linked to its question: the owner drops nothing.
    expect(sets.every((set) => questions.some((q) => q.id === set.questionId))).toBe(true);
    const grouped = sections.flatMap((s) => {
      if (s.kind === "optionSet") return [];
      if (s.kind !== "question") return [String(s.kind)];
      return ["question", ...sets.filter((t) => t.questionId === s.id).map(() => "optionSet")];
    });
    expect(ownerKinds).toEqual([...grouped, "amendmentTrace"]);
    const { target, stop } = renderTrack();
    try {
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
      // DS side of the divergence: raw document order, sections and ids kept.
      expect(renderedKinds).toEqual(sections.map((s) => String(s.kind)));
      const expectedIds = sets.flatMap((s) => (s.options as Record<string, unknown>[]).map((o) => String(o.id)));
      expect(Array.from(target.querySelectorAll("[data-option-id]")).map((c) => c.getAttribute("data-option-id"))).toEqual(
        expectedIds,
      );
      // Content still agrees on both sides despite the order gap.
      const ownerLabels = Array.from(article!.querySelectorAll(".focus-option strong")).map((el: Element) =>
        norm(el.textContent),
      );
      expect(ownerLabels).toEqual(
        sets.flatMap((s) => (s.options as Record<string, unknown>[]).map((o) => norm(o.label as string))),
      );
      const outcome = sections.find((s) => s.kind === "outcome") as Record<string, unknown>;
      expect(norm(article!.querySelector(".focus-outcome p")?.textContent)).toBe(norm(outcome.statement as string));
      expect(norm(target.querySelector(".st-dossier__outcomeText")?.textContent)).toBe(norm(outcome.statement as string));
    } finally {
      cleanup(stop, target);
    }
  });
});
