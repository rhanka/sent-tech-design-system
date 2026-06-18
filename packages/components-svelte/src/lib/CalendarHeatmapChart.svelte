<script lang="ts" module>
  /**
   * CalendarHeatmapChart - grille jour×semaine (GitHub-style).
   * API canonique (référence Svelte, React/Vue doivent s'aligner)
   *
   * Props obligatoires :
   *   data   CalendarHeatmapChartDatum[]  - tableau {date: "YYYY-MM-DD", value}
   *   label  string
   *
   * Props optionnelles :
   *   width   number  (défaut 480)
   *   height  number  (défaut 140)
   *   class   string
   */
  export type CalendarHeatmapChartDatum = {
    date: string;
    value: number;
  };

  export type CalendarHeatmapChartScale = "categorical" | "sequential";
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";

  const TONES = [
    "category1","category2","category3","category4",
    "category5","category6","category7","category8"
  ] as const;

  type CalendarHeatmapChartProps = {
    data: CalendarHeatmapChartDatum[];
    label: string;
    scale?: CalendarHeatmapChartScale;
    width?: number;
    height?: number;
    class?: string;
  };

  let {
    data = [],
    label,
    scale = "sequential",
    width = 480,
    height = 140,
    class: className
  }: CalendarHeatmapChartProps = $props();

  const MARGIN = { top: 24, right: 8, bottom: 8, left: 24 };
  const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  let hoveredDate: string | null = $state(null);

  const plotWidth = $derived(Math.max(width - MARGIN.left - MARGIN.right, 1));
  const plotHeight = $derived(Math.max(height - MARGIN.top - MARGIN.bottom, 1));

  /**
   * FIX #2 : parse strict YYYY-MM-DD en UTC.
   * Retourne null si la date n'est pas valide ou si le round-trip échoue.
   */
  function parseUTCDate(dateStr: string): { year: number; month: number; day: number; ts: number } | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    // Validation basique des bornes
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const ts = Date.UTC(year, month - 1, day);
    // Round-trip : la date UTC re-sérialisée doit valoir l'entrée
    const check = new Date(ts).toISOString().slice(0, 10);
    if (check !== dateStr) return null;
    return { year, month, day, ts };
  }

  /** Nombre de jours entiers entre deux timestamps UTC (diff en ms / ms-par-jour) */
  function daysDiff(tsA: number, tsB: number): number {
    return Math.round((tsB - tsA) / 86400000);
  }

  function normalizedScale(value: CalendarHeatmapChartScale | undefined): CalendarHeatmapChartScale {
    return value === "categorical" ? "categorical" : "sequential";
  }

  const resolvedScale = $derived(normalizedScale(scale));

  // Group data by week and day-of-week
  const grid = $derived.by(() => {
    if (data.length === 0) return { cells: [], weeks: 0, monthLabels: [] };

    // FIX #2 : valider strictement chaque date (parse UTC + round-trip)
    const validData = data.filter((d) => parseUTCDate(d.date) !== null && Number.isFinite(d.value));
    if (validData.length === 0) return { cells: [], weeks: 0, monthLabels: [] };

    // Sort by date
    const sorted = [...validData].sort((a, b) => a.date.localeCompare(b.date));

    const firstParsed = parseUTCDate(sorted[0].date)!;
    const lastParsed = parseUTCDate(sorted[sorted.length - 1].date)!;

    // Compute value range
    const vals = sorted.map((d) => d.value);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const valueRange = maxVal > minVal ? maxVal - minVal : 1;

    // Build a lookup map
    const map = new Map<string, number>();
    for (const d of sorted) {
      map.set(d.date, d.value);
    }

    // FIX #2 : utiliser getUTCDay() pour le jour-de-semaine, JAMAIS getDay() local
    const firstDate = new Date(firstParsed.ts);
    const lastDate = new Date(lastParsed.ts);

    // Determine grid start: Sunday of the week containing firstDate (UTC)
    const startDOW = firstDate.getUTCDay(); // 0=Sun
    const gridStartTs = firstParsed.ts - startDOW * 86400000;

    // Determine grid end: Saturday of the week containing lastDate (UTC)
    const endDOW = lastDate.getUTCDay();
    const gridEndTs = lastParsed.ts + (6 - endDOW) * 86400000;

    // FIX #2 : compter les semaines en jours calendaires entiers
    const totalDays = daysDiff(gridStartTs, gridEndTs) + 1;
    const weeks = Math.ceil(totalDays / 7);
    const cellW = plotWidth / Math.max(weeks, 1);
    const cellH = plotHeight / 7;

    const cells: {
      date: string;
      value: number | null;
      tone: typeof TONES[number] | null;
      x: number;
      y: number;
      w: number;
      h: number;
    }[] = [];

    const monthLabelMap = new Map<string, number>(); // month key -> x

    for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
      const curTs = gridStartTs + dayIndex * 86400000;
      const curDate = new Date(curTs);
      // FIX #2 : utiliser les méthodes UTC partout
      const dow = curDate.getUTCDay();
      const week = Math.floor(dayIndex / 7);
      // FIX #2 : sérialisation UTC
      const dateStr = curDate.toISOString().slice(0, 10);
      const val = map.get(dateStr) ?? null;
      const x = MARGIN.left + week * cellW;
      const y = MARGIN.top + dow * cellH;

      let tone: typeof TONES[number] | null = null;
      if (val !== null && Number.isFinite(val)) {
        const idx = Math.min(
          TONES.length - 1,
          Math.floor(((val - minVal) / valueRange) * TONES.length)
        );
        tone = TONES[Math.max(0, idx)];
      }

      cells.push({ date: dateStr, value: val, tone, x, y, w: Math.max(cellW - 2, 1), h: Math.max(cellH - 2, 1) });

      // Track month label positions (first week of each month)
      // FIX #2 : utiliser getUTCFullYear/getUTCMonth
      const mKey = `${curDate.getUTCFullYear()}-${curDate.getUTCMonth()}`;
      if (!monthLabelMap.has(mKey)) {
        monthLabelMap.set(mKey, x);
      }
    }

    const monthLabels = Array.from(monthLabelMap.entries()).map(([key, x]) => {
      const [, month] = key.split("-").map(Number);
      return { label: MONTH_ABBR[month], x };
    });

    return { cells, weeks, monthLabels };
  });

  // FIX #2 : le SR ne liste que les dates valides (parse UTC strict + round-trip + valeur finie)
  const dataValueItems = $derived(
    data
      .filter((d) => parseUTCDate(d.date) !== null && Number.isFinite(d.value))
      .map((d) => `${d.date}: ${d.value}`)
  );

  const hoveredCell = $derived(
    hoveredDate !== null ? grid.cells.find((c) => c.date === hoveredDate) ?? null : null
  );

  function handlePointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) { hoveredDate = null; return; }
    hoveredDate = target.getAttribute("data-chart-date") ?? null;
  }

  const classes = () => ["st-calendarHeatmapChart", `st-calendarHeatmapChart--${resolvedScale}`, className].filter(Boolean).join(" ");
</script>

<div class={classes()}>
  <div
    class="st-calendarHeatmapChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handlePointerMove}
    onpointerleave={() => (hoveredDate = null)}
  >
    <svg
      viewBox="0 0 {width} {height}"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      focusable="false"
      aria-hidden="true"
    >
      <!-- day-of-week labels -->
      {#each DAY_LABELS as day, di (day)}
        {#if di % 2 === 1}
          <text
            class="st-calendarHeatmapChart__dayLabel"
            x={MARGIN.left - 4}
            y={MARGIN.top + di * (plotHeight / 7) + (plotHeight / 14)}
            text-anchor="end"
            dominant-baseline="middle"
          >
            {day}
          </text>
        {/if}
      {/each}

      <!-- month labels -->
      {#each grid.monthLabels as ml (ml.label + ml.x)}
        <text
          class="st-calendarHeatmapChart__monthLabel"
          x={ml.x}
          y={MARGIN.top - 6}
          dominant-baseline="auto"
        >
          {ml.label}
        </text>
      {/each}

      <!-- cells -->
      {#each grid.cells as cell (cell.date)}
        <rect
          class="st-calendarHeatmapChart__cell{cell.tone ? ` st-calendarHeatmapChart__cell--${cell.tone}` : ' st-calendarHeatmapChart__cell--empty'}"
          class:st-calendarHeatmapChart__cell--dim={hoveredDate !== null && hoveredDate !== cell.date}
          x={cell.x}
          y={cell.y}
          width={cell.w}
          height={cell.h}
          rx="2"
          data-chart-date={cell.date}
        />
      {/each}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredCell !== null && hoveredCell.value !== null}
    <div
      class="st-calendarHeatmapChart__tooltip"
      role="presentation"
      style="left: {((hoveredCell.x + hoveredCell.w / 2) / width) * 100}%; top: {((hoveredCell.y + hoveredCell.h / 2) / height) * 100}%"
    >
      <span class="st-calendarHeatmapChart__tooltipLabel">{hoveredCell.date}</span>
      <span class="st-calendarHeatmapChart__tooltipValue">{hoveredCell.value}</span>
    </div>
  {/if}
</div>

<style>
  .st-calendarHeatmapChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    position: relative;
    width: 100%;
  }

  .st-calendarHeatmapChart svg {
    display: block;
    overflow: visible;
  }

  .st-calendarHeatmapChart__visual {
    display: block;
  }

  .st-calendarHeatmapChart__dayLabel,
  .st-calendarHeatmapChart__monthLabel {
    fill: var(--st-semantic-text-secondary);
    font-size: 0.5625rem;
  }

  .st-calendarHeatmapChart__cell {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, Canvas);
    stroke-width: 1;
    transition: opacity 120ms ease;
  }

  .st-calendarHeatmapChart__cell--empty {
    fill: var(--st-semantic-border-subtle);
    opacity: 0.25;
  }

  .st-calendarHeatmapChart__cell--dim {
    opacity: 0.3;
  }

  @media (prefers-reduced-motion: reduce) {
    .st-calendarHeatmapChart__cell {
      transition: none;
    }
  }

  .st-calendarHeatmapChart__cell--category1 { fill: var(--st-semantic-data-category1); }
  .st-calendarHeatmapChart__cell--category2 { fill: var(--st-semantic-data-category2); }
  .st-calendarHeatmapChart__cell--category3 { fill: var(--st-semantic-data-category3); }
  .st-calendarHeatmapChart__cell--category4 { fill: var(--st-semantic-data-category4); }
  .st-calendarHeatmapChart__cell--category5 { fill: var(--st-semantic-data-category5); }
  .st-calendarHeatmapChart__cell--category6 { fill: var(--st-semantic-data-category6); }
  .st-calendarHeatmapChart__cell--category7 { fill: var(--st-semantic-data-category7); }
  .st-calendarHeatmapChart__cell--category8 { fill: var(--st-semantic-data-category8); }

  .st-calendarHeatmapChart__tooltip {
    background: var(--st-semantic-surface-inverse);
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse);
    display: inline-flex;
    flex-direction: column;
    font-size: 0.75rem;
    gap: 0.125rem;
    line-height: 1.2;
    padding: 0.375rem 0.5rem;
    pointer-events: none;
    position: absolute;
    transform: translate(-50%, calc(-100% - 8px));
    white-space: nowrap;
    z-index: 1;
  }

  .st-calendarHeatmapChart__tooltipLabel {
    font-weight: 600;
  }

  .st-calendarHeatmapChart__tooltipValue {
    opacity: 0.85;
  }
</style>
