import { describe, expect, it } from "vitest";
import {
  buildQuestionBarData,
  buildQuestionTable,
  formatSurveyPercent,
  resolveSurveyText,
  sanitizeSurveyGraph,
  type SurveyAggregateGraph,
  type SurveyAggregateQuestion,
  type SurveyResultsSegment
} from "./survey-results-model.js";

const segments: SurveyResultsSegment[] = [
  { id: "manuf", label: { fr: "Manuf.", en: "Manuf." } },
  { id: "startup", label: { fr: "Startup", en: "Startup" } },
  { id: "autre", label: { fr: "Autre", en: "Other" } }
];

const sampleQuestion: SurveyAggregateQuestion = {
  id: "q_tools",
  type: "multi",
  label: { fr: "Quels outils utilisez-vous ?", en: "Which tools do you use?" },
  n: 200,
  nBySegment: { manuf: 80, startup: 112, autre: 8 },
  options: [
    {
      id: "copilot",
      label: { fr: "Assistant inline", en: "Inline assistant" },
      short: "Inline",
      n: 120,
      bySegment: { manuf: 40, startup: 76, autre: 4 }
    },
    {
      id: "rare",
      label: { fr: "Outil rare", en: "Rare tool" },
      short: "Rare",
      n: 4,
      bySegment: { manuf: 2, startup: 2, autre: 0 }
    }
  ]
};

describe("survey-results-model", () => {
  it("resolves plain and bilingual localized text", () => {
    expect(resolveSurveyText("Fixed", "fr")).toBe("Fixed");
    expect(resolveSurveyText({ fr: "Bonjour", en: "Hello" }, "fr")).toBe("Bonjour");
    expect(resolveSurveyText({ fr: "Bonjour", en: "Hello" }, "en")).toBe("Hello");
  });

  it("masks percentages below minCellSize and formats per locale", () => {
    expect(formatSurveyPercent(4, 100, "fr", 5, "< 5")).toBe("< 5");
    expect(formatSurveyPercent(5, 4, "fr", 5, "< 5")).toBe("< 5");
    expect(formatSurveyPercent(60, 100, "fr", 5, "< 5")).toBe("60 %");
    expect(formatSurveyPercent(60, 100, "en", 5, "< 5")).toBe("60%");
  });

  it("builds bar chart data masking options below minCellSize", () => {
    const bars = buildQuestionBarData(sampleQuestion, {
      locale: "fr",
      minCellSize: 5,
      maskedLabel: "< 5"
    });
    expect(bars).toHaveLength(2);
    expect(bars[0]).toEqual({ label: "Inline", value: 60, tone: "category1" });
    expect(bars[1]).toEqual({ label: "Rare (< 5)", value: 0, tone: "category2" });
  });

  it("builds whole-room table when isLowN is true", () => {
    const table = buildQuestionTable(sampleQuestion, {
      locale: "fr",
      segments,
      isLowN: true,
      minCellSize: 5,
      minSegmentSize: 10
    });
    expect(table.columns.map((c) => c.key)).toEqual(["option", "room", "count"]);
    expect(table.rows[0]).toEqual({
      option: "Assistant inline",
      room: "60 %",
      count: "120"
    });
    expect(table.rows[1]).toEqual({
      option: "Outil rare",
      room: "< 5",
      count: "< 5"
    });
  });

  it("builds segmented cross-tab table with < 5 cell and < 10 segment masking and dual room count", () => {
    const table = buildQuestionTable(sampleQuestion, {
      locale: "en",
      segments,
      isLowN: false,
      minCellSize: 5,
      minSegmentSize: 10
    });
    expect(table.columns.map((c) => c.key)).toEqual(["option", "room", "manuf", "startup", "autre"]);
    // manuf: 40/80 = 50%, startup: 76/112 = 68%, autre: denom 8 < 10 => "< 5"
    expect(table.rows[0]).toEqual({
      option: "Inline assistant",
      room: "60% (120)",
      manuf: "50%",
      startup: "68%",
      autre: "< 5"
    });
    // rare option: n=4 < 5, segment counts < 5 => all masked
    expect(table.rows[1]).toEqual({
      option: "Rare tool",
      room: "< 5",
      manuf: "< 5",
      startup: "< 5",
      autre: "< 5"
    });
  });

  it("sanitizes graph: filters < 5 nodes/edges and collapses company_type roots under lowN", () => {
    const graph: SurveyAggregateGraph = {
      nodes: [
        { id: "type:manuf", label: "Manuf.", family: "company_type", shape: "hexagon", tone: "category1", weight: 3, rawCount: 30 },
        { id: "type:startup", label: "Startup", family: "company_type", shape: "hexagon", tone: "category1", weight: 4, rawCount: 40 },
        { id: "tool:a", label: "Tool A", family: "tools", shape: "circle", tone: "category2", weight: 3, rawCount: 25 },
        { id: "tool:tiny", label: "Tiny", family: "tools", shape: "circle", tone: "category2", weight: 1, rawCount: 3 }
      ],
      edges: [
        { source: "type:manuf", target: "tool:a", kind: "answers", weight: 10, relation: "10" },
        { source: "type:startup", target: "tool:a", kind: "answers", weight: 15, relation: "15" },
        { source: "type:startup", target: "tool:tiny", kind: "answers", weight: 3, relation: "3" }
      ]
    };

    const lowN = sanitizeSurveyGraph(graph, {
      isLowN: true,
      submitted: 70,
      minCellSize: 5,
      wholeRoomLabel: "Salle entière"
    });

    expect(lowN.nodes.map((n) => n.id)).toEqual(["room:all", "tool:a"]);
    expect(lowN.nodes[0].label).toBe("Salle entière");
    expect(lowN.nodes[0].rawCount).toBe(70);
    expect(lowN.edges).toHaveLength(1);
    expect(lowN.edges[0].source).toBe("room:all");
    expect(lowN.edges[0].target).toBe("tool:a");
    expect(lowN.edges[0].weight).toBe(25);

    const highN = sanitizeSurveyGraph(graph, {
      isLowN: false,
      submitted: 200,
      minCellSize: 5,
      wholeRoomLabel: "Salle entière"
    });
    expect(highN.nodes.map((n) => n.id)).toEqual(["type:manuf", "type:startup", "tool:a"]);
    expect(highN.edges).toHaveLength(2);
  });

  it("fails closed when node rawCount or edge weight is undefined, and never exposes < minCellSize room:all", () => {
    const graph: SurveyAggregateGraph = {
      nodes: [
        { id: "type:manuf", label: "Manuf.", family: "company_type", shape: "hexagon", weight: 4 },
        { id: "tool:ok", label: "Valid", family: "tools", shape: "circle", weight: 3, rawCount: 12 },
        { id: "tool:unknown", label: "Unknown", family: "tools", shape: "circle", weight: 3 }
      ],
      edges: [
        { source: "tool:ok", target: "tool:unknown", kind: "co_answered" },
        { source: "type:manuf", target: "tool:ok", kind: "answers" }
      ]
    };

    const sanitized = sanitizeSurveyGraph(graph, {
      isLowN: false,
      submitted: 200,
      minCellSize: 5,
      wholeRoomLabel: "Whole room"
    });
    expect(sanitized.nodes.map((n) => n.id)).toEqual(["tool:ok"]);
    expect(sanitized.edges).toEqual([]);

    const tinyRoom = sanitizeSurveyGraph(graph, {
      isLowN: true,
      submitted: 3,
      minCellSize: 5,
      wholeRoomLabel: "Whole room"
    });
    expect(tinyRoom.nodes).toEqual([]);
    expect(tinyRoom.edges).toEqual([]);
  });

  it("does not fabricate room:all edge weights by summing lift-filtered segment edges under lowN", () => {
    // tool:a has true room count 32, while only one lift-filtered segment edge (10) survived
    const graph: SurveyAggregateGraph = {
      nodes: [
        { id: "type:manuf", label: "Manuf.", family: "company_type", shape: "hexagon", weight: 3, rawCount: 30 },
        { id: "type:startup", label: "Startup", family: "company_type", shape: "hexagon", weight: 4, rawCount: 40 },
        { id: "tool:a", label: { fr: "Complétion", en: "Completion" }, family: "tools", shape: "circle", weight: 4, rawCount: 32 }
      ],
      edges: [
        { source: "type:manuf", target: "tool:a", kind: "answers", weight: 10, relation: { fr: "10 réponses", en: "10 answers" } }
      ]
    };

    const lowN = sanitizeSurveyGraph(graph, {
      isLowN: true,
      submitted: 70,
      minCellSize: 5,
      wholeRoomLabel: "Whole room",
      locale: "en"
    });
    expect(lowN.nodes.find((n) => n.id === "tool:a")?.label).toBe("Completion");
    expect(lowN.nodes.find((n) => n.id === "tool:a")?.group).toBe("tools");
    expect(lowN.edges).toHaveLength(1);
    // Uses true whole-room rawCount (32), never fabricated partial sum (10)
    expect(lowN.edges[0].weight).toBe(32);

    // Explicit room:all edge is preserved without double-counting type:* edges
    const withExplicitRoom: SurveyAggregateGraph = {
      nodes: [
        { id: "room:all", label: "Salle", family: "company_type", shape: "hexagon", weight: 5, rawCount: 70 },
        { id: "type:manuf", label: "Manuf.", family: "company_type", shape: "hexagon", weight: 3, rawCount: 30 },
        { id: "tool:a", label: { fr: "Complétion", en: "Completion" }, family: "tools", shape: "circle", weight: 4, rawCount: 32 }
      ],
      edges: [
        { source: "room:all", target: "tool:a", kind: "answers", weight: 32, relation: { fr: "32 réponses", en: "32 answers" } },
        { source: "type:manuf", target: "tool:a", kind: "answers", weight: 10, relation: "10" }
      ]
    };
    const explicit = sanitizeSurveyGraph(withExplicitRoom, {
      isLowN: true,
      submitted: 70,
      minCellSize: 5,
      wholeRoomLabel: "Whole room",
      locale: "en"
    });
    expect(explicit.edges).toHaveLength(1);
    expect(explicit.edges[0].weight).toBe(32);
    expect(explicit.edges[0].relation).toBe("32 answers");
  });

  it("never renders French-only short strings under locale='en' in buildQuestionBarData", () => {
    const frenchShortQuestion: SurveyAggregateQuestion = {
      id: "q_fr_short",
      type: "multi",
      label: { fr: "Outils utilisés", en: "Tools used" },
      n: 100,
      options: [
        {
          id: "revue",
          label: { fr: "Revue de code assistée", en: "Assisted code review" },
          short: "Revue IA",
          n: 60
        },
        {
          id: "bilingual",
          label: { fr: "Tests générés", en: "Generated tests" },
          short: { fr: "Tests IA", en: "AI tests" },
          n: 40
        }
      ]
    };

    const enBars = buildQuestionBarData(frenchShortQuestion, { locale: "en", minCellSize: 5 });
    expect(enBars[0].label).toBe("Assisted code review");
    expect(enBars[1].label).toBe("AI tests");

    const frBars = buildQuestionBarData(frenchShortQuestion, { locale: "fr", minCellSize: 5 });
    expect(frBars[0].label).toBe("Revue IA");
    expect(frBars[1].label).toBe("Tests IA");
  });
});
