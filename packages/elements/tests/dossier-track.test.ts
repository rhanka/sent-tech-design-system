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
 * - volatility: a CLI re-run changes only `provenance.readAt` (expected
 *   one-line diff); every other byte is pinned by the sha256 below.
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
import { renderDossier } from "../src/element/dom/engines/focus-renderer.js";
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

function siblingDoc(name: string): Record<string, unknown> {
  const envelope = JSON.parse(readFileSync(join(here, "fixtures", `${name}.json`), "utf8")) as Record<string, unknown>;
  return (envelope.root as Record<string, unknown>).document as Record<string, unknown>;
}

function questionsIndex(sections: readonly Record<string, unknown>[], id: string): number {
  return sections.filter((s) => s.kind === "question").findIndex((q) => String(q.id) === id);
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

  it("cross-checks the provenance against the document (ref, source, byte length)", () => {
    const envelope = trackEnvelope();
    expect(envelope.contract).toBe("1.0");
    const root = envelope.root as Record<string, unknown>;
    expect(root.component).toBe("DecisionDossier");
    expect(root.id).toBe("root");
    const document_ = root.document as Record<string, unknown>;
    // The pin names the decision; the document carries it as `ref`.
    expect(document_.ref).toBe(PROVENANCE.decisionId);
    const provenance = document_.provenance as Record<string, unknown>;
    expect(provenance.source).toBe("track:/home/antoinefa/src/h2a/.track/events.jsonl");
    // The CLI stdout (57 372 bytes) is the document re-serialized as
    // `JSON.stringify(doc, null, 2) + "\n"`; only `readAt` moves on re-run.
    expect(Buffer.byteLength(`${JSON.stringify(document_, null, 2)}\n`, "utf8")).toBe(57372);
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
      // The fold rule (AMB-L6-2): the `body` when one exists, else the
      // label-plus-consequence text. Longest argument here is 142 chars.
      const sections = trackDoc().sections as Record<string, unknown>[];
      const argumentLength = (option: Record<string, unknown>): number => {
        if (typeof option.body === "string" && option.body.length > 0) return option.body.length;
        const parts = [option.label, option.consequence].filter(
          (part): part is string => typeof part === "string" && part.length > 0,
        );
        return parts.join("\n").length;
      };
      const longest = Math.max(
        ...sections
          .filter((s) => s.kind === "optionSet")
          .flatMap((s) => (s.options as Record<string, unknown>[]).map(argumentLength)),
      );
      expect(longest).toBe(142);
      expect(target.querySelectorAll("[data-option-fold]").length).toBe(0);
      // The one annotated comment stays display state, never a control (F-R6).
      expect(target.querySelectorAll(".st-dossier__optionAnnotation").length).toBe(0);
      expect(target.querySelectorAll("[data-annotation-control]").length).toBe(0);
      const comments = target.querySelectorAll(".st-dossier__optionAnnotationComment");
      expect(comments.length).toBe(1);
      const source = sections
        .filter((s) => s.kind === "optionSet")
        .flatMap((s) => s.options as Record<string, unknown>[])
        .find((o) => typeof o.annotationComment === "string");
      expect(norm(comments[0]!.textContent)).toBe(norm(source!.annotationComment as string));
      expect(comments[0]!.tagName).toBe("SPAN");
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
      // Independent oracle: the layout rule restated from §11.2 F-R5 (any
      // long option forces the list; otherwise 1-2 options list, 3+ grid),
      // never via the renderer's own `decideOptionSetLayout`.
      const sections = trackDoc().sections as Record<string, unknown>[];
      const sets = sections.filter((s) => s.kind === "optionSet");
      expect(target.querySelectorAll("[data-st-option-set]").length).toBe(24);
      for (const set of sets) {
        const options = set.options as Record<string, unknown>[];
        const argumentOf = (option: Record<string, unknown>): string => {
          if (typeof option.body === "string" && option.body.length > 0) return option.body;
          return [option.label, option.consequence]
            .filter((part): part is string => typeof part === "string" && part.length > 0)
            .join("\n");
        };
        const hasLongOption = options.some((o) => argumentOf(o).length > 300);
        const expected = hasLongOption || options.length <= 2 ? "list" : "grid";
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

  it("groups each optionSet under its question, matching the owner section order (criterion 2 parity)", () => {
    // L6c parity: the owner `renderHtml` runs `preparePresentation`, which
    // pairs each question with its linked optionSets (`questionId`); the DS
    // renderer applies the same grouping. The published Track projection
    // emits prose, 24 questions, 24 optionSets, outcome — grouped on both
    // sides after the fix.
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
    // Every set is linked to its question: neither side drops anything.
    expect(sets.every((set) => questions.some((q) => q.id === set.questionId))).toBe(true);
    // Expected order computed in the test from the grouping rule: each
    // question immediately followed by its linked set(s) in document order.
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
      // DS order matches the owner order: no drop, no duplicate.
      expect(renderedKinds).toEqual(grouped);
      // Each question is immediately followed by its linked set(s).
      const renderedIds = Array.from(
        target.querySelectorAll("[data-st-question], [data-st-option-set]"),
      ).map(
        (el) => `${el.hasAttribute("data-st-question") ? "question" : "optionSet"}:${el.getAttribute("data-st-question") ?? el.getAttribute("data-st-option-set")}`,
      );
      expect(renderedIds).toEqual(
        questions.flatMap((q) => [
          `question:${String(q.id)}`,
          ...sets.filter((t) => t.questionId === q.id).map((t) => `optionSet:${String(t.id)}`),
        ]),
      );
      const expectedIds = sets.flatMap((s) => (s.options as Record<string, unknown>[]).map((o) => String(o.id)));
      expect(Array.from(target.querySelectorAll("[data-option-id]")).map((c) => c.getAttribute("data-option-id"))).toEqual(
        expectedIds,
      );
      // Content agrees on both sides.
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

  it("renders the owner-prefixed recommended answers on the real dossier (11 prefixed, 13 verbatim)", () => {
    // Owner rule (`preparePresentation`): the recommended option label is
    // prefixed with an em dash unless the answer already starts with it.
    const document_ = trackDoc();
    const ownerHtml = renderHtml(document_ as never, {
      renderMarkdown: (markdown: string) => renderMarkdown(markdown),
      sanitizeHtml: (html: string) => html,
    });
    const ownerContainer = document.createElement("div");
    ownerContainer.innerHTML = ownerHtml;
    const ownerPrecos = Array.from(ownerContainer.querySelectorAll(".focus-preco")).map((el) =>
      norm(el.textContent).replace(/^préco:\s*/, ""),
    );
    expect(ownerPrecos.length).toBe(24);
    const { target, stop } = renderTrack();
    try {
      const dsRecos = Array.from(target.querySelectorAll(".st-dossier__questionReco")).map((el) =>
        norm(el.textContent),
      );
      // Display parity with the owner on every question.
      expect(dsRecos).toEqual(ownerPrecos);
      expect(dsRecos.filter((t) => t.includes(" — ")).length).toBe(11);
      // Spot checks: one prefixed answer, one already-named answer kept.
      const sections = document_.sections as Record<string, unknown>[];
      const byId = new Map(sections.filter((s) => s.kind === "question").map((q) => [String(q.id), q]));
      expect(dsRecos[questionsIndex(sections, "track-auto")]).toBe(
        `Propositions uniquement — ${norm(byId.get("track-auto")!.recommendedAnswer as string)}`,
      );
      expect(dsRecos[questionsIndex(sections, "spec-mechanical")]).toBe(
        norm(byId.get("spec-mechanical")!.recommendedAnswer as string),
      );
      // The badge stays the selection marker; the text preselects nothing.
      expect(target.querySelectorAll('[data-st-selected="true"]').length).toBe(0);
    } finally {
      cleanup(stop, target);
    }
  });

  it("groups a synthetic dossier: two sets under one question, a set before its question, an orphan in place", () => {
    const option = (id: string, label: string): Record<string, unknown> => ({
      kind: "option",
      id,
      targetRef: id,
      label,
      annotation: "none",
    });
    const document_ = {
      title: "Synthetic grouping",
      subject: "L6c",
      sections: [
        { kind: "prose", id: "p1", targetRef: "p1", markdown: "Intro" },
        { kind: "optionSet", id: "s-early", targetRef: "s-early", questionId: "q2", options: [option("o-early", "Early")] },
        {
          kind: "question",
          id: "q1",
          targetRef: "q1",
          question: "First?",
          state: "open",
          recommendedOptionId: "o-1a",
          recommendedAnswer: "It is cheap.",
        },
        { kind: "optionSet", id: "s-1a", targetRef: "s-1a", questionId: "q1", options: [option("o-1a", "Take A"), option("o-1b", "Take B")] },
        { kind: "optionSet", id: "s-1b", targetRef: "s-1b", questionId: "q1", options: [option("o-1c", "Take C")] },
        { kind: "question", id: "q2", targetRef: "q2", question: "Second?", state: "open" },
        { kind: "optionSet", id: "s-orphan", targetRef: "s-orphan", questionId: "q-missing", options: [option("o-x", "Other")] },
        { kind: "outcome", id: "o1", targetRef: "o1", modality: "decision", statement: "Done." },
        { kind: "diagram", id: "d1", targetRef: "d1", syntax: "mermaid", alt: "Flow", source: "graph TD;A-->B" },
        { kind: "amendmentTrace", id: "t1", targetRef: "t1", steps: [{ at: "2026-11-02", author: "a", summary: "s" }] },
      ],
    };
    const target = document.createElement("div");
    document.body.append(target);
    const stop = renderDossier(target, document_, () => {});
    try {
      const order = Array.from(
        target.querySelectorAll("[data-st-question], [data-st-option-set], [data-st-outcome], .st-dossier__prose, [data-st-diagram], [data-st-trace]"),
      ).map((el) => {
        if (el.hasAttribute("data-st-question")) return `question:${el.getAttribute("data-st-question")}`;
        if (el.hasAttribute("data-st-option-set")) return `optionSet:${el.getAttribute("data-st-option-set")}`;
        if (el.hasAttribute("data-st-outcome")) return "outcome";
        if (el.hasAttribute("data-st-diagram")) return "diagram";
        if (el.hasAttribute("data-st-trace")) return "amendmentTrace";
        return "prose";
      });
      // The early set moves under q2; the orphan stays where it was written.
      expect(order).toEqual([
        "prose",
        "question:q1",
        "optionSet:s-1a",
        "optionSet:s-1b",
        "question:q2",
        "optionSet:s-early",
        "optionSet:s-orphan",
        "outcome",
        "diagram",
        "amendmentTrace",
      ]);
      // Option order inside each set is preserved; nothing is dropped.
      expect(Array.from(target.querySelectorAll("[data-option-id]")).map((c) => c.getAttribute("data-option-id"))).toEqual(
        ["o-1a", "o-1b", "o-1c", "o-early", "o-x"],
      );
      // The prefixed recommendation shows on q1; q2 without one renders none.
      const q1 = target.querySelector('[data-st-question="q1"]')!;
      expect(norm(q1.querySelector(".st-dossier__questionReco")?.textContent)).toBe("Take A — It is cheap.");
      expect(target.querySelector('[data-st-question="q2"]')!.querySelector(".st-dossier__questionReco")).toBeNull();
    } finally {
      cleanup(stop, target);
    }
  });

  it("keeps the six interleaved L6 fixtures in document order (grouping identity)", () => {
    for (const name of ["dossier-short2", "dossier-short4", "dossier-long", "dossier-reco", "dossier-annotated", "dossier-diagram"]) {
      const document_ = siblingDoc(name);
      const sections = document_.sections as Record<string, unknown>[];
      const target = document.createElement("div");
      document.body.append(target);
      const stop = renderDossier(target, document_, () => {});
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
        expect(renderedKinds).toEqual(sections.map((s) => String(s.kind)));
        const expectedIds = sections
          .filter((s) => s.kind === "optionSet")
          .flatMap((s) => (s.options as Record<string, unknown>[]).map((o) => String(o.id)));
        expect(Array.from(target.querySelectorAll("[data-option-id]")).map((c) => c.getAttribute("data-option-id"))).toEqual(
          expectedIds,
        );
      } finally {
        cleanup(stop, target);
      }
    }
  });
});
