<script lang="ts" module>
  export type {
    SanitizedSurveyGraph,
    SurveyAggregateFunnel,
    SurveyAggregateGraph,
    SurveyAggregateOption,
    SurveyAggregateQuestion,
    SurveyAggregateSnapshot,
    SurveyAggregateSummary,
    SurveyAggregateWord,
    SurveyGraphEdge,
    SurveyGraphFamily,
    SurveyGraphNode,
    SurveyLocalizedText,
    SurveyResultsDensity,
    SurveyResultsLabels,
    SurveyResultsLocale,
    SurveyResultsSegment,
    SurveySnapshotStatus
  } from "./survey-results-model.js";

  export type SurveyResultsProps = {
    /** Full aggregate snapshot delivered on each SSE event (never a delta). */
    snapshot: import("./survey-results-model.js").SurveyAggregateSnapshot;
    /** Optional localized header title. */
    title?: import("./survey-results-model.js").SurveyLocalizedText;
    /** Active UI & content locale (`"fr"` default, `"en"`). */
    locale?: import("./survey-results-model.js").SurveyResultsLocale;
    /** Visual density: `"standard"` or `"projection"` (16:9, readable at 3 m). */
    density?: import("./survey-results-model.js").SurveyResultsDensity;
    /** Show permanent SIMULATION warning banner for demo feeds. */
    simulation?: boolean;
    /** Privacy suppression threshold for counts & table cells (default 5). */
    minCellSize?: number;
    /** Privacy suppression threshold for segment denominators (default 10). */
    minSegmentSize?: number;
    /** Minimum submitted count before segment breakdowns appear (default 120). */
    lowNThreshold?: number;
    /** Segment definitions for cross-tab columns (e.g. organisation types). */
    segments?: import("./survey-results-model.js").SurveyResultsSegment[];
    /** Optional label overrides. */
    labels?: Partial<import("./survey-results-model.js").SurveyResultsLabels>;
    /** Cadence (ms) for smoothing high-frequency live KPI/bar/table updates (default 120). */
    statsThrottleMs?: number;
    /** Cadence (ms) for smoothing high-frequency live ForceGraph updates (default 320). */
    graphThrottleMs?: number;
    /** Fired when a ForceGraph node is clicked/toggled (null when cleared). */
    onselectnode?: (nodeId: string | null) => void;
    /** Optional action snippet rendered inside EmptyState when submitted === 0. */
    emptyAction?: import("svelte").Snippet;
    class?: string;
  };
</script>

<script lang="ts">
  import Alert from "./Alert.svelte";
  import Badge from "./Badge.svelte";
  import BarChart from "./BarChart.svelte";
  import Card from "./Card.svelte";
  import Divider from "./Divider.svelte";
  import EmptyState from "./EmptyState.svelte";
  import ForceGraph from "./ForceGraph.svelte";
  import GraphLegend from "./GraphLegend.svelte";
  import KpiCard from "./KpiCard.svelte";
  import Select from "./Select.svelte";
  import Table from "./Table.svelte";
  import Tag from "./Tag.svelte";
  import Typography from "./Typography.svelte";
  import UnorderedList from "./UnorderedList.svelte";
  import {
    buildDefaultGraphLegend,
    buildQuestionBarData,
    buildQuestionTable,
    getSurveyResultsLabels,
    resolveSurveyText,
    sanitizeSurveyGraph,
    type SurveyAggregateSnapshot
  } from "./survey-results-model.js";

  let {
    snapshot,
    title,
    locale = "fr",
    density = "standard",
    simulation = false,
    minCellSize = 5,
    minSegmentSize = 10,
    lowNThreshold = 120,
    segments = [],
    labels: labelOverrides,
    statsThrottleMs = 120,
    graphThrottleMs = 320,
    onselectnode,
    emptyAction,
    class: className
  }: SurveyResultsProps = $props();

  // Burst smoothing for high-frequency SSE full-aggregate streams (120 ms stats, 320 ms graph).
  // Non-live transitions and initial render flush immediately so closed/idle states never lag.
  // svelte-ignore state_referenced_locally
  let statsSnapshot = $state.raw<SurveyAggregateSnapshot>(snapshot);
  // svelte-ignore state_referenced_locally
  let graphSnapshot = $state.raw<SurveyAggregateSnapshot>(snapshot);

  let lastSurveyId = "";
  let lastStatsTs = 0;
  let lastGraphTs = 0;
  let pendingStats: SurveyAggregateSnapshot | null = null;
  let pendingGraph: SurveyAggregateSnapshot | null = null;
  let statsTimer: ReturnType<typeof setTimeout> | null = null;
  let graphTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    const incoming = snapshot;
    const statsDelay = statsThrottleMs;
    const graphDelay = graphThrottleMs;
    const now = Date.now();
    const surveyChanged = lastSurveyId !== "" && lastSurveyId !== incoming.surveyId;
    const firstCommit = lastSurveyId === "";
    lastSurveyId = incoming.surveyId;

    const flushStatsNow = () => {
      if (statsTimer !== null) {
        clearTimeout(statsTimer);
        statsTimer = null;
      }
      pendingStats = null;
      statsSnapshot = incoming;
      lastStatsTs = Date.now();
    };

    const flushGraphNow = () => {
      if (graphTimer !== null) {
        clearTimeout(graphTimer);
        graphTimer = null;
      }
      pendingGraph = null;
      graphSnapshot = incoming;
      lastGraphTs = Date.now();
    };

    if (firstCommit || surveyChanged || incoming.status !== "live" || statsDelay <= 0) {
      flushStatsNow();
    } else if (now - lastStatsTs >= statsDelay) {
      flushStatsNow();
    } else {
      pendingStats = incoming;
      if (statsTimer === null) {
        statsTimer = setTimeout(() => {
          statsTimer = null;
          if (pendingStats) {
            statsSnapshot = pendingStats;
            pendingStats = null;
            lastStatsTs = Date.now();
          }
        }, Math.max(0, statsDelay - (now - lastStatsTs)));
      }
    }

    if (firstCommit || surveyChanged || incoming.status !== "live" || graphDelay <= 0) {
      flushGraphNow();
    } else if (now - lastGraphTs >= graphDelay) {
      flushGraphNow();
    } else {
      pendingGraph = incoming;
      if (graphTimer === null) {
        graphTimer = setTimeout(() => {
          graphTimer = null;
          if (pendingGraph) {
            graphSnapshot = pendingGraph;
            pendingGraph = null;
            lastGraphTs = Date.now();
          }
        }, Math.max(0, graphDelay - (now - lastGraphTs)));
      }
    }
  });

  $effect(() => {
    return () => {
      if (statsTimer !== null) clearTimeout(statsTimer);
      if (graphTimer !== null) clearTimeout(graphTimer);
    };
  });

  let selectedNodeId = $state<string | null>(null);
  let selectedQuestionId = $state<string>("all");

  const t = $derived(getSurveyResultsLabels(locale, labelOverrides));
  const numberLocale = $derived(locale === "fr" ? "fr-CA" : "en-CA");
  const kpiSize = $derived(density === "projection" ? "lg" : "md");
  const legendSize = $derived(density === "projection" ? "lg" : "md");
  const maskedLabel = $derived(minCellSize === 5 ? t.masked : `< ${minCellSize}`);

  const resolvedTitle = $derived(
    title ? resolveSurveyText(title, locale) : t.statsTitle
  );

  const statusMeta = $derived.by(() => {
    switch (statsSnapshot.status) {
      case "live":
        return { label: t.statusLive, tone: "success" as const };
      case "closed":
        return { label: t.statusClosed, tone: "info" as const };
      case "paused":
        return { label: t.statusPaused, tone: "warning" as const };
      default:
        return { label: t.statusIdle, tone: "neutral" as const };
    }
  });

  const isLowN = $derived(
    statsSnapshot.funnel.submitted > 0 && statsSnapshot.funnel.submitted < lowNThreshold
  );

  const isGraphLowN = $derived(
    graphSnapshot.funnel.submitted > 0 && graphSnapshot.funnel.submitted < lowNThreshold
  );

  const sanitizedGraph = $derived(
    sanitizeSurveyGraph(graphSnapshot.graph, {
      isLowN: isGraphLowN,
      submitted: graphSnapshot.funnel.submitted,
      minCellSize,
      wholeRoomLabel: t.wholeRoomLabel
    })
  );

  const hasGraph = $derived(sanitizedGraph.nodes.length > 0);
  const legendEntries = $derived(buildDefaultGraphLegend(t));

  const effectiveQuestionId = $derived(
    selectedQuestionId === "all" ||
      statsSnapshot.questions.some((q) => q.id === selectedQuestionId)
      ? selectedQuestionId
      : "all"
  );

  const visibleQuestions = $derived(
    effectiveQuestionId === "all"
      ? statsSnapshot.questions
      : statsSnapshot.questions.filter((q) => q.id === effectiveQuestionId)
  );

  const selectedNodeSummary = $derived.by(() => {
    if (!selectedNodeId) return null;
    const node = sanitizedGraph.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;
    const incident = sanitizedGraph.edges
      .filter((e) => e.source === selectedNodeId || e.target === selectedNodeId)
      .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
      .slice(0, 4)
      .map((e) => {
        const otherId = e.source === selectedNodeId ? e.target : e.source;
        const other = sanitizedGraph.nodes.find((n) => n.id === otherId);
        const detail = e.relation ?? (e.weight !== undefined ? String(e.weight) : "");
        return detail ? `${other?.label ?? otherId} (${detail})` : (other?.label ?? otherId);
      });
    return t.graphNodeSelected(
      node.label ?? node.id,
      node.rawCount ?? Math.round(node.weight ?? 0),
      incident.length > 0 ? incident.join(" · ") : "—"
    );
  });

  const showSummary = $derived(
    statsSnapshot.status === "closed" &&
      statsSnapshot.funnel.submitted > 0 &&
      Boolean(statsSnapshot.summary)
  );

  function handleNodeSelect(nodeId: string) {
    const next = selectedNodeId === nodeId ? null : nodeId;
    selectedNodeId = next;
    onselectnode?.(next);
  }

  const rootClasses = $derived(
    [
      "st-surveyResults",
      `st-surveyResults--${density}`,
      hasGraph && "st-surveyResults--withGraph",
      className
    ]
      .filter(Boolean)
      .join(" ")
  );
</script>

<section
  class={rootClasses}
  data-density={density}
  aria-label={resolvedTitle}
>
  <div class="st-surveyResults__stack">
    {#if title || statsSnapshot.status}
      <header class="st-surveyResults__header">
        {#if title}
          <Typography variant={density === "projection" ? "h2" : "h3"} as="h2">
            {resolveSurveyText(title, locale)}
          </Typography>
        {/if}
        <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
      </header>
    {/if}

    {#if simulation}
      <Alert
        tone="warning"
        title={t.simulationTitle}
        message={t.simulationMessage}
      />
    {/if}

    <div class="st-surveyResults__kpis" role="region" aria-label={t.kpiSubmitted}>
      <KpiCard
        label={t.kpiSubmitted}
        value={statsSnapshot.funnel.submitted}
        tone="category1"
        size={kpiSize}
        locale={numberLocale}
      />
      <KpiCard
        label={t.kpiEnrolled}
        value={statsSnapshot.funnel.enrolled ?? "—"}
        tone="category2"
        size={kpiSize}
        locale={numberLocale}
      />
      <KpiCard
        label={t.kpiCompletePartial}
        value={`${statsSnapshot.funnel.complete} / ${statsSnapshot.funnel.partial}`}
        tone="category3"
        size={kpiSize}
      />
      <KpiCard
        label={t.kpiReturned}
        value={statsSnapshot.funnel.returnedWithinWindow ?? "—"}
        tone="category4"
        size={kpiSize}
        locale={numberLocale}
      />
    </div>

    {#if isLowN}
      <Alert
        tone="info"
        title={t.lowNTitle(lowNThreshold)}
        message={t.lowNMessage(statsSnapshot.funnel.submitted, minCellSize)}
      />
    {/if}

    {#if statsSnapshot.funnel.submitted === 0}
      <Card>
        <EmptyState
          title={t.emptyTitle}
          message={t.emptyMessage}
          action={emptyAction}
        />
      </Card>
    {:else}
      {#if showSummary && statsSnapshot.summary}
        <Card class="st-surveyResults__summary">
          <div class="st-surveyResults__sectionStack">
            <div class="st-surveyResults__rowHeader">
              <Typography variant={density === "projection" ? "h3" : "h4"} as="h3">
                {t.summaryTitle}
              </Typography>
              <Badge tone="info">{statusMeta.label}</Badge>
            </div>
            <Divider />
            {#if statsSnapshot.summary.facts.length > 0}
              <div class="st-surveyResults__subBlock">
                <Typography variant="h5" as="h4">{t.summaryFactsHeading}</Typography>
                <UnorderedList
                  items={statsSnapshot.summary.facts.map((item) => resolveSurveyText(item, locale))}
                />
              </div>
            {/if}
            {#if statsSnapshot.summary.impacts.length > 0}
              <div class="st-surveyResults__subBlock">
                <Typography variant="h5" as="h4">{t.summaryImpactsHeading}</Typography>
                <UnorderedList
                  items={statsSnapshot.summary.impacts.map((item) => resolveSurveyText(item, locale))}
                />
              </div>
            {/if}
            <Alert
              tone="info"
              title={t.summaryDecisionHeading}
              message={resolveSurveyText(statsSnapshot.summary.decision, locale)}
            />
            {#if statsSnapshot.summary.limits}
              <Typography variant="caption" tone="secondary">
                {resolveSurveyText(statsSnapshot.summary.limits, locale)}
              </Typography>
            {/if}
          </div>
        </Card>
      {/if}

      <div class="st-surveyResults__main">
        {#if hasGraph}
          <Card class="st-surveyResults__graphCard">
            <div class="st-surveyResults__sectionStack">
              <div class="st-surveyResults__headingGroup">
                <Typography variant={density === "projection" ? "h3" : "h4"} as="h3">
                  {t.graphTitle}
                </Typography>
                <Typography variant="body-sm" tone="secondary">
                  {t.graphSubtitle}
                </Typography>
              </div>

              <div class="st-surveyResults__graphWrap">
                <ForceGraph
                  nodes={sanitizedGraph.nodes}
                  edges={sanitizedGraph.edges}
                  label={t.graphTitle}
                  width={920}
                  height={480}
                  nodeRadius={density === "projection" ? 9 : 7}
                  showLabels={true}
                  iterations={graphSnapshot.status === "live" ? 60 : 140}
                  repulsion={1.0}
                  edgeCurve={0.14}
                  selectedIds={selectedNodeId ? [selectedNodeId] : []}
                  onSelect={handleNodeSelect}
                />
              </div>

              <GraphLegend
                entries={legendEntries}
                title={t.graphLegendTitle}
                variant="inline"
                size={legendSize}
              />

              {#if selectedNodeSummary}
                <Alert tone="info" title={selectedNodeSummary} />
              {/if}
            </div>
          </Card>
        {/if}

        <Card class="st-surveyResults__statsCard">
          <div class="st-surveyResults__sectionStack">
            <div class="st-surveyResults__statsHeader">
              <div class="st-surveyResults__headingGroup">
                <Typography variant={density === "projection" ? "h3" : "h4"} as="h3">
                  {t.statsTitle}
                </Typography>
                <Typography variant="body-sm" tone="secondary">
                  {t.statsSubtitle}
                </Typography>
              </div>

              {#if statsSnapshot.questions.length > 1}
                <div class="st-surveyResults__filter">
                  <Select
                    label={t.questionFilterLabel}
                    size="lg"
                    bind:value={selectedQuestionId}
                  >
                    <option value="all">{t.allQuestionsLabel}</option>
                    {#each statsSnapshot.questions as q, index (q.id)}
                      <option value={q.id}>
                        {index + 1}. {resolveSurveyText(q.label, locale)}
                      </option>
                    {/each}
                  </Select>
                </div>
              {/if}
            </div>

            <div class="st-surveyResults__questions">
              {#each visibleQuestions as question (question.id)}
                {@const qTitle = resolveSurveyText(question.label, locale)}
                {@const barData = buildQuestionBarData(question, {
                  locale,
                  minCellSize,
                  maskedLabel
                })}
                {@const tableData = buildQuestionTable(question, {
                  locale,
                  segments,
                  isLowN,
                  minCellSize,
                  minSegmentSize,
                  labels: {
                    colOption: t.colOption,
                    colRoom: t.colRoom,
                    colCount: t.colCount,
                    masked: maskedLabel
                  }
                })}
                <Card class="st-surveyResults__questionCard">
                  <div class="st-surveyResults__sectionStack">
                    <div class="st-surveyResults__rowHeader">
                      <Typography variant={density === "projection" ? "h4" : "h5"} as="h4">
                        {qTitle}
                      </Typography>
                      <div class="st-surveyResults__tags">
                        <Tag tone="neutral" size="sm">{t.responsesCount(question.n)}</Tag>
                        {#if question.type === "multi"}
                          <Tag tone="info" size="sm">{t.multiTag}</Tag>
                        {/if}
                      </div>
                    </div>

                    {#if barData.length > 0}
                      <div class="st-surveyResults__chartWrap">
                        <BarChart
                          data={barData}
                          orientation="horizontal"
                          domain={[0, 100]}
                          width={640}
                          height={Math.max(170, barData.length * (density === "projection" ? 48 : 40) + 44)}
                          label={qTitle}
                          dataLabels={{
                            format: (v) => (locale === "fr" ? `${v} %` : `${v}%`)
                          }}
                        />
                      </div>

                      <Table
                        columns={tableData.columns}
                        rows={tableData.rows}
                        caption={qTitle}
                      />
                    {/if}
                  </div>
                </Card>
              {/each}
            </div>
          </div>
        </Card>
      </div>
    {/if}
  </div>
</section>

<style>
  .st-surveyResults {
    color: var(--st-semantic-text-primary, #0f172a);
    container-name: st-survey-results;
    container-type: inline-size;
    display: block;
    width: 100%;
  }

  .st-surveyResults__stack {
    display: grid;
    gap: var(--st-spacing-4, 1rem);
  }

  .st-surveyResults__sectionStack {
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .st-surveyResults__header,
  .st-surveyResults__rowHeader {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-surveyResults__statsHeader {
    align-items: end;
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    grid-template-columns: 1fr;
  }

  .st-surveyResults__headingGroup,
  .st-surveyResults__subBlock {
    display: grid;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-surveyResults__tags {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-surveyResults__filter {
    width: 100%;
  }

  /* 390 px phone baseline: 1-col stacked KPIs and stacked graph/stats. */
  .st-surveyResults__kpis {
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    grid-template-columns: 1fr;
  }

  .st-surveyResults__main {
    display: grid;
    gap: var(--st-spacing-4, 1rem);
    grid-template-columns: 1fr;
    align-items: start;
  }

  .st-surveyResults__questions {
    display: grid;
    gap: var(--st-spacing-4, 1rem);
  }

  .st-surveyResults__graphWrap,
  .st-surveyResults__chartWrap {
    min-width: 0;
    overflow-x: auto;
    width: 100%;
  }

  .st-surveyResults__graphWrap :global(svg),
  .st-surveyResults__chartWrap :global(svg) {
    display: block;
    height: auto;
    max-width: 100%;
  }

  .st-surveyResults :global(.st-table td),
  .st-surveyResults :global(.st-table th) {
    font-variant-numeric: tabular-nums;
  }

  .st-surveyResults :global(select:focus-visible),
  .st-surveyResults :global([role="button"]:focus-visible) {
    outline: var(--st-component-control-anatomy-focus-outline, 3px solid #e87432);
    outline-offset: var(--st-component-control-anatomy-focus-outlineOffset, 2px);
  }

  /* 820 px tablet: 2x2 KPI grid, side-by-side stats header. */
  @container st-survey-results (min-width: 640px) {
    .st-surveyResults__kpis {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .st-surveyResults__statsHeader {
      grid-template-columns: minmax(0, 1fr) minmax(14rem, 22rem);
    }
  }

  /* 1280 px room / 16:9: 4-col KPI strip + 7/5 split (engram graph | question stats). */
  @container st-survey-results (min-width: 1080px) {
    .st-surveyResults__kpis {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .st-surveyResults--withGraph .st-surveyResults__main {
      grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    }
  }

  /* 3 m room projection mode: 16:9 rhythm, >= 18 px table/bar labels, >= 16 px graph labels. */
  .st-surveyResults--projection .st-surveyResults__stack {
    gap: var(--st-spacing-6, 1.5rem);
  }

  .st-surveyResults--projection :global(.st-kpiCard__label) {
    font-size: 1.0625rem;
  }

  .st-surveyResults--projection :global(.st-kpiCard__number) {
    font-size: clamp(2rem, 3cqi, 2.75rem);
  }

  .st-surveyResults--projection :global(.st-alert__title) {
    font-size: 1.125rem;
  }

  .st-surveyResults--projection :global(.st-alert__message) {
    font-size: 1rem;
  }

  .st-surveyResults--projection :global(.st-table th),
  .st-surveyResults--projection :global(.st-table td) {
    font-size: 1.125rem;
    padding: var(--st-spacing-3, 0.75rem) var(--st-spacing-4, 1rem);
  }

  .st-surveyResults--projection :global(.st-table caption) {
    font-size: 1.0625rem;
  }

  .st-surveyResults--projection :global(.st-barChart text) {
    font-size: 1.125rem;
    font-weight: 600;
  }

  .st-surveyResults--projection :global(.st-forceGraph__label) {
    font-size: 1rem;
    font-weight: 600;
  }

  .st-surveyResults--projection :global(.st-forceGraph__edge) {
    stroke-opacity: 0.85;
  }
</style>
