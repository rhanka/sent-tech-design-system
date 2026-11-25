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
  short?: SurveyLocalizedText;
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
  label: SurveyLocalizedText;
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
  relation?: SurveyLocalizedText;
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
  sectionAriaLabel: string;
  kpisRegionLabel: string;
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
  graphNodeSelected: (label: string, count: number | string, links: string) => string;
  statsTitle: string;
  statsSubtitle: string;
  segmentBarsTitle: string;
  questionFilterLabel: string;
  allQuestionsLabel: string;
  colOption: string;
  colRoom: string;
  colCount: string;
  wholeRoomLabel: string;
  masked: string;
  responsesCount: (n: number | string) => string;
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
    sectionAriaLabel: "Résultats du sondage en direct",
    kpisRegionLabel: "Indicateurs de la salle",
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
    segmentBarsTitle: "Répartition par type d’organisation",
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
    sectionAriaLabel: "Live survey results",
    kpisRegionLabel: "Room metrics",
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
    segmentBarsTitle: "Breakdown by organisation type",
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

function resolveOptionBarLabel(
  opt: SurveyAggregateOption,
  locale: SurveyResultsLocale
): string {
  if (opt.short !== undefined) {
    if (typeof opt.short === "object") {
      const resolved = resolveSurveyText(opt.short, locale);
      if (resolved) return resolved;
    } else if (opt.short.length > 0 && (locale === "fr" || typeof opt.label === "string")) {
      return opt.short;
    }
  }
  return resolveSurveyText(opt.label, locale);
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
    const baseLabel = resolveOptionBarLabel(opt, options.locale);
    const isMasked = opt.n < minCell || question.n < minCell || question.n <= 0;
    const pct = isMasked ? 0 : Math.round((100 * opt.n) / question.n);
    return {
      label: isMasked ? `${baseLabel} (${maskedLabel})` : baseLabel,
      value: pct,
      tone: BAR_TONES[idx % BAR_TONES.length]
    };
  });
}

export type SurveySegmentBarGroup = {
  segmentId: string;
  label: string;
  n: number;
  data: BarChartDatum[];
};

export function buildQuestionSegmentBars(
  question: SurveyAggregateQuestion,
  options: {
    locale: SurveyResultsLocale;
    segments?: SurveyResultsSegment[];
    isLowN: boolean;
    minCellSize?: number;
    minSegmentSize?: number;
    maskedLabel?: string;
  }
): SurveySegmentBarGroup[] {
  if (options.isLowN || !options.segments || options.segments.length === 0) return [];
  const minCell = options.minCellSize ?? 5;
  const minSegment = options.minSegmentSize ?? 10;
  const maskedLabel = options.maskedLabel ?? `< ${minCell}`;
  const items = question.options ?? [];
  if (items.length === 0) return [];

  const groups: SurveySegmentBarGroup[] = [];
  for (const seg of options.segments) {
    const denom = question.nBySegment?.[seg.id] ?? 0;
    if (denom < minSegment || denom < minCell) continue;
    groups.push({
      segmentId: seg.id,
      label: resolveSurveyText(seg.label, options.locale),
      n: denom,
      data: items.map((opt, idx) => {
        const baseLabel = resolveOptionBarLabel(opt, options.locale);
        const segCount = opt.bySegment?.[seg.id] ?? 0;
        const isMasked = segCount < minCell;
        const pct = isMasked ? 0 : Math.round((100 * segCount) / denom);
        return {
          label: isMasked ? `${baseLabel} (${maskedLabel})` : baseLabel,
          value: pct,
          tone: BAR_TONES[idx % BAR_TONES.length]
        };
      })
    });
  }
  return groups;
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
    locale?: SurveyResultsLocale;
  }
): SanitizedSurveyGraph {
  const minCell = options.minCellSize ?? 5;
  const locale = options.locale ?? "fr";

  if (!graph || graph.nodes.length === 0 || options.submitted < minCell) {
    return { nodes: [], edges: [] };
  }

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
        group: "company_type",
        family: "company_type",
        shape: "hexagon",
        tone: "category1",
        weight: Math.max(2, Math.min(8, Math.sqrt(Math.max(1, options.submitted)) * 0.5)),
        rawCount: options.submitted
      });
    }

    for (const node of graph.nodes) {
      if (companyTypeIds.has(node.id)) continue;
      if (node.rawCount === undefined || !Number.isFinite(node.rawCount) || node.rawCount < minCell) {
        continue;
      }
      keptNodes.push({
        id: node.id,
        label: resolveSurveyText(node.label, locale),
        group: node.family,
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
      if (node.rawCount === undefined || !Number.isFinite(node.rawCount) || node.rawCount < minCell) {
        continue;
      }
      keptNodes.push({
        id: node.id,
        label: node.id === "room:all" ? options.wholeRoomLabel : resolveSurveyText(node.label, locale),
        group: node.family,
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

  const keptNodeMap = new Map(keptNodes.map((n) => [n.id, n]));
  const edgeMap = new Map<
    string,
    ForceGraphEdge & { kind: "answers" | "co_answered"; weight?: number; _explicitRoom?: boolean }
  >();

  for (const edge of graph.edges) {
    const isExplicitRoomEdge = edge.source === "room:all" || edge.target === "room:all";
    const touchesCollapsedType =
      options.isLowN &&
      !isExplicitRoomEdge &&
      (companyTypeIds.has(edge.source) || companyTypeIds.has(edge.target));

    const source = options.isLowN && companyTypeIds.has(edge.source) ? "room:all" : edge.source;
    const target = options.isLowN && companyTypeIds.has(edge.target) ? "room:all" : edge.target;
    if (source === target) continue;
    if (!keptNodeMap.has(source) || !keptNodeMap.has(target)) continue;

    // Fail closed when weight is missing or below minCellSize.
    if (edge.weight === undefined || !Number.isFinite(edge.weight) || edge.weight < minCell) {
      continue;
    }

    const key = `${source}->${target}:${edge.kind}`;
    const existing = edgeMap.get(key);

    if (touchesCollapsedType) {
      // Never fabricate room:all weights by summing lift-filtered segment edges.
      // Prefer an explicit room:all edge if present; otherwise derive the whole-room
      // count from the surviving target node's verified rawCount (>= minCell).
      if (existing) {
        if (!existing._explicitRoom && edge.width !== undefined) {
          existing.width = Math.max(existing.width ?? 0, edge.width);
        }
        continue;
      }
      const otherId = source === "room:all" ? target : source;
      const otherNode = keptNodeMap.get(otherId);
      const roomWeight = otherNode?.rawCount;
      if (roomWeight === undefined || roomWeight < minCell) continue;
      edgeMap.set(key, {
        source,
        target,
        kind: edge.kind,
        relation: String(roomWeight),
        weight: roomWeight,
        width: edge.width,
        dash: edge.dash ?? (edge.kind === "co_answered" ? "dashed" : undefined),
        weak: edge.weak ?? (edge.kind === "co_answered" ? true : undefined),
        emphasis: edge.emphasis,
        _explicitRoom: false
      });
      continue;
    }

    const resolvedRelation =
      edge.relation !== undefined ? resolveSurveyText(edge.relation, locale) : String(edge.weight);

    if (isExplicitRoomEdge && existing && !existing._explicitRoom) {
      // Explicit room:all edge supersedes any collapsed segment placeholder.
      edgeMap.set(key, {
        source,
        target,
        kind: edge.kind,
        relation: resolvedRelation,
        weight: edge.weight,
        width: edge.width,
        dash: edge.dash ?? (edge.kind === "co_answered" ? "dashed" : undefined),
        weak: edge.weak ?? (edge.kind === "co_answered" ? true : undefined),
        emphasis: edge.emphasis,
        _explicitRoom: true
      });
    } else if (!existing) {
      edgeMap.set(key, {
        source,
        target,
        kind: edge.kind,
        relation: resolvedRelation,
        weight: edge.weight,
        width: edge.width,
        dash: edge.dash ?? (edge.kind === "co_answered" ? "dashed" : undefined),
        weak: edge.weak ?? (edge.kind === "co_answered" ? true : undefined),
        emphasis: edge.emphasis,
        _explicitRoom: isExplicitRoomEdge
      });
    }
  }

  const keptEdges = Array.from(edgeMap.values()).map(({ _explicitRoom: _ignored, ...rest }) => rest);

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
