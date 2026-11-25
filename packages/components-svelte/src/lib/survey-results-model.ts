import type { BarChartDatum, BarChartTone } from "./BarChart.svelte";
import type {
  ForceGraphEdge,
  ForceGraphEdgeDash,
  ForceGraphLegendEntry,
  ForceGraphNode,
  ForceGraphTone
} from "./ForceGraph.svelte";
import type { TableColumn, TableRow } from "./Table.svelte";

export type SurveyResultsLocale = "fr" | "en";
export type SurveyResultsDensity = "standard" | "projection";
export type SurveySnapshotStatus = "idle" | "live" | "paused" | "closed";
export type SurveyGraphFamily = "company_type" | "tools" | "practices" | "levels";

export type SurveyLocalizedText = string | { fr: string; en: string };

export type SurveyResultsSegment = {
  id: string;
  label: SurveyLocalizedText;
};

export type SurveyAggregateFunnel = {
  enrolled?: number;
  submitted: number;
  complete: number;
  partial: number;
  returnedWithinWindow?: number;
};

export type SurveyAggregateOption = {
  id: string;
  label: SurveyLocalizedText;
  short?: string;
  n: number;
  bySegment?: Record<string, number>;
};

export type SurveyAggregateWord = {
  text: string;
  weight: number;
};

export type SurveyAggregateQuestion = {
  id: string;
  type: string;
  label: SurveyLocalizedText;
  n: number;
  nBySegment?: Record<string, number>;
  options?: SurveyAggregateOption[];
  words?: SurveyAggregateWord[];
};

export type SurveyGraphNode = {
  id: string;
  label: string;
  family: SurveyGraphFamily;
  shape: "hexagon" | "circle" | "diamond" | "square";
  tone?: ForceGraphTone;
  weight: number;
  rawCount?: number;
  fx?: number;
  fy?: number;
};

export type SurveyGraphEdge = {
  source: string;
  target: string;
  kind: "answers" | "co_answered";
  relation?: string;
  weight?: number;
  width?: number;
  dash?: ForceGraphEdgeDash;
  weak?: boolean;
  emphasis?: boolean;
};

export type SurveyAggregateGraph = {
  nodes: SurveyGraphNode[];
  edges: SurveyGraphEdge[];
};

export type SurveyAggregateSummary = {
  facts: SurveyLocalizedText[];
  impacts: SurveyLocalizedText[];
  decision: SurveyLocalizedText;
  limits?: SurveyLocalizedText;
};

export type SurveyAggregateSnapshot = {
  surveyId: string;
  status: SurveySnapshotStatus;
  updatedAt?: string;
  funnel: SurveyAggregateFunnel;
  questions: SurveyAggregateQuestion[];
  graph?: SurveyAggregateGraph;
  summary?: SurveyAggregateSummary;
};

export type SurveyResultsLabels = {
  simulationTitle: string;
  simulationMessage: string;
  statusIdle: string;
  statusLive: string;
  statusPaused: string;
  statusClosed: string;
  kpiSubmitted: string;
  kpiEnrolled: string;
  kpiCompletePartial: string;
  kpiReturned: string;
  lowNTitle: (threshold: number) => string;
  lowNMessage: (submitted: number, minCell: number) => string;
  emptyTitle: string;
  emptyMessage: string;
  graphTitle: string;
  graphSubtitle: string;
  graphLegendTitle: string;
  graphLegendTypes: string;
  graphLegendTools: string;
  graphLegendPractices: string;
  graphLegendLevels: string;
  graphLegendCo: string;
  graphNodeSelected: (label: string, count: number, links: string) => string;
  statsTitle: string;
  statsSubtitle: string;
  questionFilterLabel: string;
  allQuestionsLabel: string;
  colOption: string;
  colRoom: string;
  colCount: string;
  wholeRoomLabel: string;
  masked: string;
  responsesCount: (n: number) => string;
  multiTag: string;
  summaryTitle: string;
  summaryFactsHeading: string;
  summaryImpactsHeading: string;
  summaryDecisionHeading: string;
};

const DEFAULT_LABELS: Record<SurveyResultsLocale, SurveyResultsLabels> = {
  fr: {
    simulationTitle: "SIMULATION — données de démonstration",
    simulationMessage:
      "Les chiffres affichés proviennent d’une simulation et non d’un sondage en production.",
    statusIdle: "En attente",
    statusLive: "En direct",
    statusPaused: "En pause",
    statusClosed: "Sondage fermé",
    kpiSubmitted: "Réponses reçues",
    kpiEnrolled: "Inscrits par e-mail",
    kpiCompletePartial: "Complets / Partiels",
    kpiReturned: "Retours brouillon 30 min",
    lowNTitle: (threshold) => `Affichage sur la salle entière (< ${threshold} réponses)`,
    lowNMessage: (submitted, minCell) =>
      `Avec ${submitted} réponse(s), le découpage par segment est trop fin. Les graphiques et tableaux montrent la salle entière ; les cases < ${minCell} restent masquées.`,
    emptyTitle: "Aucune réponse encore dans la salle",
    emptyMessage:
      "Le graphe et les statistiques apparaîtront en direct dès la première réponse envoyée.",
    graphTitle: "Graphe pondéré en direct",
    graphSubtitle:
      "Types d’organisation reliés aux outils, pratiques et niveaux (cases ≥ 5). Cliquez un nœud pour lire ses liens.",
    graphLegendTitle: "Légende du graphe",
    graphLegendTypes: "Type d’organisation",
    graphLegendTools: "Outils",
    graphLegendPractices: "Pratiques",
    graphLegendLevels: "Niveaux",
    graphLegendCo: "Co-réponse",
    graphNodeSelected: (label, count, links) =>
      `Nœud « ${label} » (${count} réponses) · ${links}`,
    statsTitle: "Résultats par question",
    statsSubtitle:
      "Pourcentages des répondants par question. Les cellules sous le seuil sont masquées (< 5).",
    questionFilterLabel: "Filtrer une question",
    allQuestionsLabel: "Toutes les questions",
    colOption: "Réponse",
    colRoom: "Salle",
    colCount: "Effectif",
    wholeRoomLabel: "Salle entière",
    masked: "< 5",
    responsesCount: (n) => `${n} réponses`,
    multiTag: "choix multiple",
    summaryTitle: "Synthèse de la salle",
    summaryFactsHeading: "Faits observés",
    summaryImpactsHeading: "Impacts sur le cycle de vie",
    summaryDecisionHeading: "Décision proposée"
  },
  en: {
    simulationTitle: "SIMULATION — demo data",
    simulationMessage:
      "All room figures shown here come from a simulation rather than a live production poll.",
    statusIdle: "Waiting",
    statusLive: "Live",
    statusPaused: "Paused",
    statusClosed: "Closed",
    kpiSubmitted: "Responses received",
    kpiEnrolled: "Email enrolled",
    kpiCompletePartial: "Complete / Partial",
    kpiReturned: "30-min draft returns",
    lowNTitle: (threshold) => `Whole-room view (< ${threshold} responses)`,
    lowNMessage: (submitted, minCell) =>
      `With ${submitted} response(s), segment columns are too sparse. Charts and tables show the whole room; cells < ${minCell} remain masked.`,
    emptyTitle: "No responses in the room yet",
    emptyMessage:
      "The weighted graph and question statistics will appear live as soon as the first response arrives.",
    graphTitle: "Live weighted graph",
    graphSubtitle:
      "Organisation types linked to tools, practices and levels (cells ≥ 5). Click a node to inspect its links.",
    graphLegendTitle: "Graph legend",
    graphLegendTypes: "Organisation type",
    graphLegendTools: "Tools",
    graphLegendPractices: "Practices",
    graphLegendLevels: "Levels",
    graphLegendCo: "Co-answer link",
    graphNodeSelected: (label, count, links) =>
      `Node "${label}" (${count} responses) · ${links}`,
    statsTitle: "Results by question",
    statsSubtitle:
      "Percentage of respondents per question. Cells below the privacy threshold are masked (< 5).",
    questionFilterLabel: "Filter question",
    allQuestionsLabel: "All questions",
    colOption: "Answer",
    colRoom: "Room",
    colCount: "Count",
    wholeRoomLabel: "Whole room",
    masked: "< 5",
    responsesCount: (n) => `${n} responses`,
    multiTag: "multi-choice",
    summaryTitle: "Room synthesis",
    summaryFactsHeading: "Observed facts",
    summaryImpactsHeading: "Lifecycle impacts",
    summaryDecisionHeading: "Proposed decision"
  }
};

const BAR_TONES: BarChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8"
];

const FAMILY_DEFAULT_TONE: Record<SurveyGraphFamily, ForceGraphTone> = {
  company_type: "category1",
  tools: "category2",
  practices: "category7",
  levels: "category6"
};

export function getSurveyResultsLabels(
  locale: SurveyResultsLocale,
  overrides?: Partial<SurveyResultsLabels>
): SurveyResultsLabels {
  return { ...DEFAULT_LABELS[locale], ...overrides };
}

export function resolveSurveyText(
  text: SurveyLocalizedText | undefined,
  locale: SurveyResultsLocale
): string {
  if (text == null) return "";
  if (typeof text === "string") return text;
  return text[locale] ?? text.fr ?? text.en ?? "";
}

export function formatSurveyPercent(
  count: number,
  denom: number,
  locale: SurveyResultsLocale,
  minCellSize = 5,
  maskedLabel = `< ${minCellSize}`
): string {
  if (count < minCellSize || denom < minCellSize || denom <= 0) {
    return maskedLabel;
  }
  const pct = Math.round((100 * count) / denom);
  return locale === "fr" ? `${pct} %` : `${pct}%`;
}

export function buildQuestionBarData(
  question: SurveyAggregateQuestion,
  options: {
    locale: SurveyResultsLocale;
    minCellSize?: number;
    maskedLabel?: string;
  }
): BarChartDatum[] {
  const minCell = options.minCellSize ?? 5;
  const maskedLabel = options.maskedLabel ?? `< ${minCell}`;
  const items = question.options ?? [];

  return items.map((opt, idx) => {
    const baseLabel = opt.short || resolveSurveyText(opt.label, options.locale);
    const isMasked = opt.n < minCell || question.n < minCell || question.n <= 0;
    const pct = isMasked ? 0 : Math.round((100 * opt.n) / question.n);
    return {
      label: isMasked ? `${baseLabel} (${maskedLabel})` : baseLabel,
      value: pct,
      tone: BAR_TONES[idx % BAR_TONES.length]
    };
  });
}

export function buildQuestionTable(
  question: SurveyAggregateQuestion,
  options: {
    locale: SurveyResultsLocale;
    segments?: SurveyResultsSegment[];
    isLowN: boolean;
    minCellSize?: number;
    minSegmentSize?: number;
    labels?: Partial<Pick<SurveyResultsLabels, "colOption" | "colRoom" | "colCount" | "masked">>;
  }
): { columns: TableColumn[]; rows: TableRow[] } {
  const minCell = options.minCellSize ?? 5;
  const minSegment = options.minSegmentSize ?? 10;
  const baseLabels = DEFAULT_LABELS[options.locale];
  const colOption = options.labels?.colOption ?? baseLabels.colOption;
  const colRoom = options.labels?.colRoom ?? baseLabels.colRoom;
  const colCount = options.labels?.colCount ?? baseLabels.colCount;
  const maskedLabel = options.labels?.masked ?? `< ${minCell}`;
  const activeSegments = !options.isLowN && options.segments && options.segments.length > 0
    ? options.segments
    : [];

  const columns: TableColumn[] =
    activeSegments.length === 0
      ? [
          { key: "option", label: colOption },
          { key: "room", label: colRoom, align: "right" },
          { key: "count", label: colCount, align: "right" }
        ]
      : [
          { key: "option", label: colOption },
          { key: "room", label: colRoom, align: "right" },
          ...activeSegments.map((seg) => ({
            key: seg.id,
            label: resolveSurveyText(seg.label, options.locale),
            align: "right" as const
          }))
        ];

  const items = question.options ?? [];
  const rows: TableRow[] = items.map((opt) => {
    const pctText = formatSurveyPercent(opt.n, question.n, options.locale, minCell, maskedLabel);
    const isMasked = opt.n < minCell || question.n < minCell || question.n <= 0;

    if (activeSegments.length === 0) {
      return {
        option: resolveSurveyText(opt.label, options.locale),
        room: pctText,
        count: isMasked ? maskedLabel : String(opt.n)
      };
    }

    const row: TableRow = {
      option: resolveSurveyText(opt.label, options.locale),
      room: isMasked ? maskedLabel : `${pctText} (${opt.n})`
    };

    for (const seg of activeSegments) {
      const denom = question.nBySegment?.[seg.id] ?? 0;
      const segCount = opt.bySegment?.[seg.id] ?? 0;
      row[seg.id] =
        denom < minSegment
          ? maskedLabel
          : formatSurveyPercent(segCount, denom, options.locale, minCell, maskedLabel);
    }

    return row;
  });

  return { columns, rows };
}

export type SanitizedSurveyGraph = {
  nodes: (ForceGraphNode & { family: SurveyGraphFamily; rawCount?: number })[];
  edges: (ForceGraphEdge & { kind: "answers" | "co_answered"; weight?: number })[];
};

export function sanitizeSurveyGraph(
  graph: SurveyAggregateGraph | undefined,
  options: {
    isLowN: boolean;
    submitted: number;
    minCellSize?: number;
    wholeRoomLabel: string;
  }
): SanitizedSurveyGraph {
  if (!graph || graph.nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const minCell = options.minCellSize ?? 5;
  const companyTypeIds = new Set<string>();
  const keptNodes: (ForceGraphNode & { family: SurveyGraphFamily; rawCount?: number })[] = [];

  if (options.isLowN) {
    let hasRoomRoot = false;
    for (const node of graph.nodes) {
      if (node.id === "room:all" || node.family === "company_type") {
        companyTypeIds.add(node.id);
        if (node.id === "room:all") hasRoomRoot = true;
      }
    }

    if (companyTypeIds.size > 0 || hasRoomRoot) {
      keptNodes.push({
        id: "room:all",
        label: options.wholeRoomLabel,
        family: "company_type",
        shape: "hexagon",
        tone: "category1",
        weight: Math.max(2, Math.min(8, Math.sqrt(Math.max(1, options.submitted)) * 0.5)),
        rawCount: options.submitted
      });
    }

    for (const node of graph.nodes) {
      if (companyTypeIds.has(node.id)) continue;
      if (node.rawCount !== undefined && node.rawCount < minCell) continue;
      keptNodes.push({
        id: node.id,
        label: node.label,
        family: node.family,
        shape: node.shape,
        tone: node.tone ?? FAMILY_DEFAULT_TONE[node.family],
        weight: node.weight,
        rawCount: node.rawCount,
        fx: node.fx,
        fy: node.fy
      });
    }
  } else {
    for (const node of graph.nodes) {
      if (node.id !== "room:all" && node.rawCount !== undefined && node.rawCount < minCell) {
        continue;
      }
      keptNodes.push({
        id: node.id,
        label: node.id === "room:all" ? options.wholeRoomLabel : node.label,
        family: node.family,
        shape: node.shape,
        tone: node.tone ?? FAMILY_DEFAULT_TONE[node.family],
        weight: node.weight,
        rawCount: node.rawCount,
        fx: node.fx,
        fy: node.fy
      });
    }
  }

  const validIds = new Set(keptNodes.map((n) => n.id));
  const mergedEdgeMap = new Map<
    string,
    ForceGraphEdge & { kind: "answers" | "co_answered"; weight?: number }
  >();

  for (const edge of graph.edges) {
    const source = options.isLowN && companyTypeIds.has(edge.source) ? "room:all" : edge.source;
    const target = options.isLowN && companyTypeIds.has(edge.target) ? "room:all" : edge.target;
    if (source === target) continue;
    if (!validIds.has(source) || !validIds.has(target)) continue;

    const key = `${source}->${target}:${edge.kind}`;
    const existing = mergedEdgeMap.get(key);
    if (existing) {
      const nextWeight = (existing.weight ?? 0) + (edge.weight ?? 0);
      existing.weight = nextWeight;
      existing.relation = String(nextWeight);
      if (edge.width !== undefined) {
        existing.width = Math.max(existing.width ?? 0, edge.width);
      }
    } else {
      mergedEdgeMap.set(key, {
        source,
        target,
        kind: edge.kind,
        relation: edge.relation ?? (edge.weight !== undefined ? String(edge.weight) : undefined),
        weight: edge.weight,
        width: edge.width,
        dash: edge.dash ?? (edge.kind === "co_answered" ? "dashed" : undefined),
        weak: edge.weak ?? (edge.kind === "co_answered" ? true : undefined),
        emphasis: edge.emphasis
      });
    }
  }

  const keptEdges = Array.from(mergedEdgeMap.values()).filter(
    (e) => e.weight === undefined || e.weight >= minCell
  );

  return { nodes: keptNodes, edges: keptEdges };
}

export function buildDefaultGraphLegend(labels: SurveyResultsLabels): ForceGraphLegendEntry[] {
  return [
    { label: labels.graphLegendTypes, shape: "hexagon", tone: "category1" },
    { label: labels.graphLegendTools, shape: "circle", tone: "category2" },
    { label: labels.graphLegendPractices, shape: "diamond", tone: "category7" },
    { label: labels.graphLegendLevels, shape: "square", tone: "category6" },
    { label: labels.graphLegendCo, dash: "dashed", weak: true, tone: "category5" }
  ];
}
