import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import SurveyResults from "./SurveyResults.svelte";
import type {
  SurveyAggregateSnapshot,
  SurveyResultsSegment
} from "./survey-results-model.js";

const segments: SurveyResultsSegment[] = [
  { id: "manuf", label: { fr: "Manuf.", en: "Manuf." } },
  { id: "startup", label: { fr: "Startup", en: "Startup" } },
  { id: "autre", label: { fr: "Autre", en: "Other" } }
];

function makeSnapshot(overrides: Partial<SurveyAggregateSnapshot> = {}): SurveyAggregateSnapshot {
  return {
    surveyId: "devmtl-2026-c",
    status: "live",
    updatedAt: "2026-11-27T09:15:00Z",
    funnel: {
      enrolled: 220,
      submitted: 180,
      complete: 150,
      partial: 30,
      returnedWithinWindow: 14
    },
    questions: [
      {
        id: "q_tools",
        type: "multi",
        label: { fr: "Quels outils IA utilisez-vous ?", en: "Which AI tools do you use?" },
        n: 180,
        nBySegment: { manuf: 80, startup: 92, autre: 8 },
        options: [
          {
            id: "inline",
            label: { fr: "Complétion inline", en: "Inline completion" },
            short: "Inline",
            n: 126,
            bySegment: { manuf: 52, startup: 70, autre: 4 }
          },
          {
            id: "rare",
            label: { fr: "Agent autonome", en: "Autonomous agent" },
            short: "Agent",
            n: 3,
            bySegment: { manuf: 1, startup: 2, autre: 0 }
          }
        ]
      },
      {
        id: "q_level",
        type: "scale",
        label: { fr: "Maturité en équipe", en: "Team maturity" },
        n: 170,
        nBySegment: { manuf: 75, startup: 88, autre: 7 },
        options: [
          {
            id: "l1",
            label: { fr: "1 · Exploration", en: "1 · Exploring" },
            short: "1 · Expl.",
            n: 90,
            bySegment: { manuf: 45, startup: 42, autre: 3 }
          },
          {
            id: "l2",
            label: { fr: "2 · Standardisé", en: "2 · Standardised" },
            short: "2 · Std.",
            n: 80,
            bySegment: { manuf: 30, startup: 46, autre: 4 }
          }
        ]
      }
    ],
    graph: {
      nodes: [
        { id: "type:manuf", label: "Manuf.", family: "company_type", shape: "hexagon", tone: "category1", weight: 4, rawCount: 80 },
        { id: "type:startup", label: "Startup", family: "company_type", shape: "hexagon", tone: "category1", weight: 5, rawCount: 92 },
        { id: "tool:inline", label: "Inline", family: "tools", shape: "circle", tone: "category2", weight: 5, rawCount: 126 },
        { id: "tool:rare", label: "Rare", family: "tools", shape: "circle", tone: "category2", weight: 1, rawCount: 3 }
      ],
      edges: [
        { source: "type:manuf", target: "tool:inline", kind: "answers", weight: 52, relation: "52" },
        { source: "type:startup", target: "tool:inline", kind: "answers", weight: 70, relation: "70" },
        { source: "type:startup", target: "tool:rare", kind: "answers", weight: 2, relation: "2" }
      ]
    },
    ...overrides
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("SurveyResults — empty, simulation, KPIs & read-only", () => {
  it("renders EmptyState when submitted is 0 and stays strictly read-only", () => {
    const empty = makeSnapshot({
      status: "idle",
      funnel: { enrolled: 12, submitted: 0, complete: 0, partial: 0, returnedWithinWindow: 0 }
    });
    const { container } = render(SurveyResults, {
      props: { snapshot: empty, locale: "fr", simulation: true }
    });

    expect(container.querySelector(".st-empty-state")).toBeTruthy();
    expect(container.querySelector(".st-forceGraph")).toBeNull();
    expect(container.querySelector(".st-alert--warning")).toBeTruthy();
    expect(container.querySelectorAll(".st-kpiCard")).toHaveLength(4);
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("input")).toBeNull();
  });

  it("omits simulation banner by default and switches copy cleanly between FR and EN", () => {
    const { container } = render(SurveyResults, {
      props: { snapshot: makeSnapshot(), segments, locale: "en" }
    });
    expect(container.querySelector(".st-alert--warning")).toBeNull();
    expect(container.textContent).toContain("Responses received");
    expect(container.textContent).toContain("Which AI tools do you use?");
    expect(container.textContent).toContain("Inline completion");
  });
});

describe("SurveyResults — < 120 whole-room fallback & < 5 masking", () => {
  it("shows whole-room fallback banner, collapses table columns and graph roots when submitted < 120", () => {
    const lowNSnap = makeSnapshot({
      funnel: { enrolled: 90, submitted: 75, complete: 65, partial: 10, returnedWithinWindow: 5 }
    });
    const { container } = render(SurveyResults, {
      props: { snapshot: lowNSnap, segments, locale: "fr", lowNThreshold: 120 }
    });

    const infoAlerts = Array.from(container.querySelectorAll(".st-alert--info"));
    expect(infoAlerts.some((a) => a.textContent?.includes("120"))).toBe(true);

    // Table must NOT show segment headers (Manuf. / Startup)
    const headers = Array.from(container.querySelectorAll("table th")).map((th) =>
      th.textContent?.trim()
    );
    expect(headers).toContain("Effectif");
    expect(headers).not.toContain("Startup");

    // Graph must collapse company_type nodes into Salle entière
    expect(container.querySelector(".st-forceGraph")?.textContent).toContain("Salle entière");
    expect(container.querySelector(".st-forceGraph")?.textContent).not.toContain("Rare");
  });

  it("shows segment columns at >= 120 while masking cells < 5 and segments < 10", () => {
    const { container } = render(SurveyResults, {
      props: { snapshot: makeSnapshot(), segments, locale: "en", minCellSize: 5, minSegmentSize: 10 }
    });

    // No < 120 alert
    const alerts = Array.from(container.querySelectorAll(".st-alert--info"));
    expect(alerts.some((a) => a.textContent?.includes("120"))).toBe(false);

    // First question table contains Startup column and masks < 5 cells
    const firstTable = container.querySelector("table") as HTMLTableElement;
    const headers = Array.from(firstTable.querySelectorAll("th")).map((th) => th.textContent?.trim());
    expect(headers).toEqual(["Answer", "Room", "Manuf.", "Startup", "Other"]);

    const rows = Array.from(firstTable.querySelectorAll("tbody tr"));
    const firstRowCells = Array.from(rows[0].querySelectorAll("td")).map((td) => td.textContent?.trim());
    expect(firstRowCells[1]).toBe("70% (126)");
    expect(firstRowCells[4]).toBe("< 5"); // autre denom is 8 < 10

    const secondRowCells = Array.from(rows[1].querySelectorAll("td")).map((td) => td.textContent?.trim());
    expect(secondRowCells[1]).toBe("< 5"); // n = 3 < 5
  });
});

describe("SurveyResults — GraphLegend, node selection, question filter & summary", () => {
  it("renders inline GraphLegend (lg in projection mode) and handles node selection", async () => {
    const onselectnode = vi.fn();
    const { container } = render(SurveyResults, {
      props: {
        snapshot: makeSnapshot(),
        segments,
        locale: "en",
        density: "projection",
        onselectnode
      }
    });

    const root = container.querySelector(".st-surveyResults") as HTMLElement;
    expect(root.getAttribute("data-density")).toBe("projection");
    expect(root.classList.contains("st-surveyResults--projection")).toBe(true);

    const legend = container.querySelector(".st-graphLegend") as HTMLElement;
    expect(legend).toBeTruthy();
    expect(legend.classList.contains("st-graphLegend--inline")).toBe(true);
    expect(legend.classList.contains("st-graphLegend--lg")).toBe(true);

    // Click a ForceGraph node
    const nodeEl = container.querySelector('.st-forceGraph [role="button"][aria-label^="Inline"]') as Element;
    expect(nodeEl).toBeTruthy();
    await fireEvent.click(nodeEl);
    expect(onselectnode).toHaveBeenCalledWith("tool:inline");
    expect(container.textContent).toContain("126");

    // Clicking again clears selection
    await fireEvent.click(nodeEl);
    expect(onselectnode).toHaveBeenLastCalledWith(null);
  });

  it("filters displayed questions via Select", async () => {
    const { container } = render(SurveyResults, {
      props: { snapshot: makeSnapshot(), segments, locale: "fr" }
    });

    expect(container.querySelectorAll(".st-surveyResults__questionCard")).toHaveLength(2);
    const select = container.querySelector("select") as HTMLSelectElement;
    await fireEvent.change(select, { target: { value: "q_level" } });
    expect(container.querySelectorAll(".st-surveyResults__questionCard")).toHaveLength(1);
    expect(container.querySelector(".st-surveyResults__questionCard")?.textContent).toContain(
      "Maturité en équipe"
    );
  });

  it("renders optional closing summary card only when status === 'closed'", () => {
    const summary = {
      facts: [{ fr: "Fait 1", en: "Fact 1" }],
      impacts: [{ fr: "Impact 1", en: "Impact 1" }],
      decision: { fr: "Décision clé", en: "Key decision" },
      limits: { fr: "180 envois volontaires", en: "180 voluntary submissions" }
    };

    const liveView = render(SurveyResults, {
      props: { snapshot: makeSnapshot({ status: "live", summary }), locale: "fr" }
    });
    expect(liveView.container.querySelector(".st-surveyResults__summary")).toBeNull();

    const closedView = render(SurveyResults, {
      props: { snapshot: makeSnapshot({ status: "closed", summary }), locale: "fr" }
    });
    const summaryEl = closedView.container.querySelector(".st-surveyResults__summary");
    expect(summaryEl).toBeTruthy();
    expect(summaryEl?.textContent).toContain("Fait 1");
    expect(summaryEl?.textContent).toContain("Impact 1");
    expect(summaryEl?.textContent).toContain("Décision clé");
    expect(summaryEl?.textContent).toContain("180 envois volontaires");
  });

  it("smooths live SSE bursts with trailing flush and flushes immediately on close", async () => {
    vi.useFakeTimers();
    const { container, rerender } = render(SurveyResults, {
      props: { snapshot: makeSnapshot(), segments, locale: "en" }
    });

    expect(container.querySelector(".st-kpiCard__number")?.textContent).toBe("180");

    // Rapid SSE full-aggregate replacement during live status
    await rerender({
      snapshot: makeSnapshot({
        funnel: { enrolled: 250, submitted: 215, complete: 180, partial: 35, returnedWithinWindow: 16 }
      }),
      segments,
      locale: "en"
    });

    // Advance past 120ms stats throttle
    vi.advanceTimersByTime(130);
    await Promise.resolve();
    expect(container.querySelector(".st-kpiCard__number")?.textContent).toBe("215");

    // Closing flushes immediately without waiting
    await rerender({
      snapshot: makeSnapshot({
        status: "closed",
        funnel: { enrolled: 260, submitted: 240, complete: 205, partial: 35, returnedWithinWindow: 18 }
      }),
      segments,
      locale: "en"
    });
    expect(container.querySelector(".st-kpiCard__number")?.textContent).toBe("240");
  });

  it("uses container queries for 390/820/1280 and projection typography tokens", () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "SurveyResults.svelte"),
      "utf8"
    );
    expect(source).toContain("container-type: inline-size");
    expect(source).toContain("@container st-survey-results");
    expect(source).toContain(".st-surveyResults--projection");
    expect(source).toContain("1.125rem");
    expect(source).toContain("--st-");
  });
});

describe("SurveyResults — P1 regression guards (masking, locale, stale selection, projection)", () => {
  it("masks question header Tag when 0 < question.n < minCellSize and keeps EN labels with French short strings", () => {
    const snap = makeSnapshot({
      questions: [
        {
          id: "q_small",
          type: "single",
          label: { fr: "Question rare", en: "Rare question" },
          n: 3,
          options: [
            {
              id: "opt1",
              label: { fr: "Déploiement continu", en: "Continuous deployment" },
              short: "Déploiement",
              n: 3
            }
          ]
        }
      ]
    });

    const { container } = render(SurveyResults, {
      props: { snapshot: snap, locale: "en", minCellSize: 5 }
    });

    const tags = Array.from(container.querySelectorAll(".st-surveyResults__tags .st-tag")).map((el) =>
      el.textContent?.trim()
    );
    expect(tags[0]).toBe("< 5 responses");
    expect(tags[0]).not.toContain("3 responses");

    // BarChart must render English label, not French short string
    const barLabels = Array.from(container.querySelectorAll(".st-barChart__categoryLabel")).map((el) =>
      el.textContent?.trim()
    );
    expect(barLabels.some((l) => l?.includes("Continuous deployment"))).toBe(true);
    expect(barLabels.some((l) => l?.includes("Déploiement"))).toBe(false);
  });

  it("resets stale selectedNodeId on surveyId change and lowN collapse so ForceGraph is never 100% dimmed", async () => {
    const onselectnode = vi.fn();
    const { container, rerender } = render(SurveyResults, {
      props: {
        snapshot: makeSnapshot(),
        segments,
        locale: "en",
        statsThrottleMs: 0,
        graphThrottleMs: 0,
        onselectnode
      }
    });

    // Select a company_type node present at high N
    const startupNode = container.querySelector('.st-forceGraph [role="button"][aria-label^="Startup"]') as Element;
    expect(startupNode).toBeTruthy();
    await fireEvent.click(startupNode);
    expect(onselectnode).toHaveBeenCalledWith("type:startup");
    expect(container.querySelectorAll(".st-forceGraph__node--dim").length).toBeGreaterThan(0);

    // Transition to lowN where type:startup collapses into room:all
    await rerender({
      snapshot: makeSnapshot({
        funnel: { enrolled: 90, submitted: 75, complete: 65, partial: 10, returnedWithinWindow: 5 }
      }),
      segments,
      locale: "en",
      statsThrottleMs: 0,
      graphThrottleMs: 0,
      onselectnode
    });

    // Graph actually collapsed to Whole room and stale selection is cleared (zero dimmed nodes)
    expect(container.querySelector(".st-forceGraph")?.textContent).toContain("Whole room");
    expect(container.querySelectorAll(".st-forceGraph__node--dim")).toHaveLength(0);
    expect(onselectnode).toHaveBeenLastCalledWith(null);

    // Select a surviving node, then switch surveyId (even if the new survey reuses the same node id)
    const inlineNode = container.querySelector('.st-forceGraph [role="button"][aria-label^="Inline"]') as Element;
    expect(inlineNode).toBeTruthy();
    await fireEvent.click(inlineNode);
    expect(onselectnode).toHaveBeenLastCalledWith("tool:inline");

    await rerender({
      snapshot: makeSnapshot({ surveyId: "devmtl-2026-next" }),
      segments,
      locale: "en",
      statsThrottleMs: 0,
      graphThrottleMs: 0,
      onselectnode
    });
    expect(container.querySelectorAll(".st-forceGraph__node--dim")).toHaveLength(0);
    expect(onselectnode).toHaveBeenLastCalledWith(null);
  });

  it("renders per-type segment bars at >= lowNThreshold and stacks projection main layout to avoid table overflow", () => {
    const { container } = render(SurveyResults, {
      props: { snapshot: makeSnapshot(), segments, locale: "en", density: "projection" }
    });

    const root = container.querySelector(".st-surveyResults") as HTMLElement;
    // Projection with segmented columns stacks main so 18px segment tables & bars never overflow
    expect(root.classList.contains("st-surveyResults--stackedMain")).toBe(true);

    // Per-type bars are rendered for segments meeting minSegmentSize (manuf=80, startup=92; autre=8 < 10 omitted)
    const segmentBarCards = container.querySelectorAll(".st-surveyResults__segmentBar");
    expect(segmentBarCards.length).toBeGreaterThanOrEqual(2);
    const segmentHeadings = Array.from(
      container.querySelectorAll(".st-surveyResults__segmentBarTitle")
    ).map((el) => el.textContent?.trim());
    expect(segmentHeadings).toContain("Manuf.");
    expect(segmentHeadings).toContain("Startup");
    expect(segmentHeadings).not.toContain("Other");

    // Horizontal BarChart uses above-bar placement so category labels never clip on the left
    const firstCatLabel = container.querySelector(".st-barChart__categoryLabel") as SVGTextElement;
    expect(firstCatLabel.getAttribute("text-anchor")).toBe("start");
    expect(Number(firstCatLabel.getAttribute("x"))).toBeGreaterThanOrEqual(0);
  });

  it("maintains clean a11y semantics: distinct KPI/section labels, valid heading hierarchy, non-spamming lowN alert", () => {
    const lowNSnap = makeSnapshot({
      status: "closed",
      funnel: { enrolled: 90, submitted: 75, complete: 65, partial: 10, returnedWithinWindow: 5 },
      summary: {
        facts: [{ fr: "Fait", en: "Fact" }],
        impacts: [],
        decision: { fr: "Décision", en: "Decision" }
      }
    });
    const { container } = render(SurveyResults, {
      props: { snapshot: lowNSnap, segments, locale: "en", lowNThreshold: 120 }
    });

    const section = container.querySelector("section.st-surveyResults")!;
    expect(section.getAttribute("aria-label")).toBe("Live survey results");

    const kpis = container.querySelector(".st-surveyResults__kpis")!;
    expect(kpis.getAttribute("aria-label")).toBe("Room metrics");

    // Without `title`, top-level cards use h2 (not skipping h2) and summary has no nested h2 inside h3
    expect(container.querySelector(".st-surveyResults__summary h2")?.textContent?.trim()).toBe("Room synthesis");
    expect(container.querySelectorAll(".st-surveyResults__summary .st-alert")).toHaveLength(0);

    // lowN alert disables live re-announcement spam on 120ms bursts
    const lowNAlert = container.querySelector(".st-alert--info")!;
    expect(lowNAlert.getAttribute("aria-live")).toBe("off");
  });
});
