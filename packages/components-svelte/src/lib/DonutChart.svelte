<script lang="ts" module>
  export type DonutChartTone =
    | "category1" | "category2" | "category3" | "category4"
    | "category5" | "category6" | "category7" | "category8";

  export type DonutChartDatum = {
    label: string;
    value: number;
    tone?: DonutChartTone;
  };
</script>

<script lang="ts">
  import ChartDataList from "./ChartDataList.svelte";
  import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";

  type DonutChartProps = {
    data: DonutChartDatum[];
    /** Diamètre du SVG. */
    size?: number;
    /** Épaisseur de l'anneau. */
    thickness?: number;
    /** Texte au centre (sinon le total). null pour masquer. */
    centerLabel?: string | null;
    /**
     * Per-slice value labels. `false`/absent (default) → none. `true` → each
     * slice's value with the default formatter. Object → `format(value)` and/or a
     * `position` override (default `center` of the arc). Slices too thin to fit a
     * legible label are skipped. Labels are `aria-hidden` — the values already
     * live in the accessible ChartDataList.
     */
    dataLabels?: DataLabelsProp;
    label: string;
    class?: string;
  };

  let {
    data,
    size = 220,
    thickness = 34,
    centerLabel,
    dataLabels,
    label,
    class: className
  }: DonutChartProps = $props();

  const TONES: DonutChartTone[] = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8"
  ];

  // A slice must span at least this many degrees to host a legible label.
  const DATA_LABEL_MIN_DEG = 18;

  let hoveredIndex: number | null = $state(null);

  const slices = $derived.by(() => {
    const total = data.reduce((sum, d) => sum + Math.max(d.value, 0), 0);
    if (total <= 0) return { total: 0, items: [] as Array<{ d: DonutChartDatum; path: string; tone: DonutChartTone; pct: number; spanDeg: number; labelX: number; labelY: number }> };
    const cx = size / 2;
    const cy = size / 2;
    const rOuter = size / 2 - 2;
    const rInner = Math.max(rOuter - thickness, 1);
    const TWO_PI = Math.PI * 2;
    let angle = -Math.PI / 2; // départ en haut
    const polar = (r: number, a: number): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const items = data.map((d, i) => {
      const frac = Math.max(d.value, 0) / total;
      // epsilon pour éviter le cas exact 2π (slice à 100%) non rendu.
      const span = Math.min(frac * TWO_PI, TWO_PI - 0.0001);
      const a0 = angle;
      const a1 = angle + span;
      angle = a1;
      const large = span > Math.PI ? 1 : 0;
      const [x0o, y0o] = polar(rOuter, a0);
      const [x1o, y1o] = polar(rOuter, a1);
      const [x1i, y1i] = polar(rInner, a1);
      const [x0i, y0i] = polar(rInner, a0);
      const path = `M ${x0o} ${y0o} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rInner} ${rInner} 0 ${large} 0 ${x0i} ${y0i} Z`;
      // Label anchor: centre of the arc (mid-angle, mid-radius of the ring).
      const aMid = (a0 + a1) / 2;
      const rMid = (rOuter + rInner) / 2;
      const [labelX, labelY] = polar(rMid, aMid);
      return { d, path, tone: d.tone ?? TONES[i % TONES.length], pct: frac * 100, spanDeg: (span * 180) / Math.PI, labelX, labelY };
    });
    return { total, items };
  });

  const classes = () => ["st-donutChart", className].filter(Boolean).join(" ");
  const fmtPct = (p: number) => `${p.toFixed(p < 10 ? 1 : 0)}%`;
  const dataValueItems = $derived(
    slices.items.map((slice) => `${slice.d.label}: ${slice.d.value} (${fmtPct(slice.pct)})`)
  );

  // --- Data labels ----------------------------------------------------------
  // One value label centred in each arc (default `center`). Slices thinner than
  // DATA_LABEL_MIN_DEG are skipped so labels stay legible. aria-hidden (values
  // are in the ChartDataList already).
  const dataLabelOpts = $derived(normalizeDataLabels(dataLabels));
  const dataLabelItems = $derived(
    dataLabelOpts.enabled
      ? slices.items
          .filter((slice) => slice.spanDeg >= DATA_LABEL_MIN_DEG)
          .map((slice) => ({
            key: slice.d.label,
            x: slice.labelX,
            y: slice.labelY,
            text: formatDataLabel(slice.d.value, dataLabelOpts, (v) => String(v))
          }))
      : []
  );

  function handleVisualPointerMove(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Element)) {
      hoveredIndex = null;
      return;
    }
    const index = Number(target.getAttribute("data-chart-index"));
    hoveredIndex = Number.isInteger(index) ? index : null;
  }
</script>

<div class={classes()}>
  <div
    class="st-donutChart__visual"
    role="img"
    aria-label={label}
    onpointermove={handleVisualPointerMove}
    onpointerleave={() => (hoveredIndex = null)}
  >
    <svg viewBox="0 0 {size} {size}" width="100%" height="100%" focusable="false" aria-hidden="true">
      {#if slices.total > 0}
        {#each slices.items as slice, i (slice.d.label)}
          <path
            class="st-donutChart__slice st-donutChart__slice--{slice.tone}"
            class:st-donutChart__slice--dim={hoveredIndex !== null && hoveredIndex !== i}
            d={slice.path}
            data-chart-index={i}
          />
        {/each}
        {#if centerLabel !== null}
          <text class="st-donutChart__center" x={size / 2} y={size / 2} text-anchor="middle" dominant-baseline="central">
            {centerLabel ?? slices.total}
          </text>
        {/if}
        <!-- Data labels — one value per slice, centred in the arc. aria-hidden. -->
        {#if dataLabelItems.length > 0}
          <g class="st-donutChart__dataLabels" aria-hidden="true">
            {#each dataLabelItems as d (d.key)}
              <text class="st-donutChart__dataLabel" x={d.x} y={d.y} text-anchor="middle" dominant-baseline="central">{d.text}</text>
            {/each}
          </g>
        {/if}
      {/if}
    </svg>
  </div>

  <ChartDataList {label} items={dataValueItems} />

  {#if hoveredIndex !== null && slices.items[hoveredIndex]}
    {@const s = slices.items[hoveredIndex]}
    <div class="st-donutChart__tooltip" role="presentation">
      <span class="st-donutChart__tooltipLabel">{s.d.label}</span>
      <span class="st-donutChart__tooltipValue">{s.d.value} · {fmtPct(s.pct)}</span>
    </div>
  {/if}
</div>

<style>
  .st-donutChart {
    color: var(--st-semantic-text-secondary);
    display: block;
    font-family: inherit;
    max-width: 100%;
    position: relative;
  }

  .st-donutChart svg,
  .st-donutChart__visual { display: block; overflow: visible; }

  .st-donutChart__slice {
    cursor: pointer;
    stroke: var(--st-semantic-surface-default, #fff);
    stroke-width: 1.5;
    transition: opacity 120ms ease;
  }

  .st-donutChart__slice--dim { opacity: 0.4; }

  .st-donutChart__slice--category1 { fill: var(--st-semantic-data-category1); }
  .st-donutChart__slice--category2 { fill: var(--st-semantic-data-category2); }
  .st-donutChart__slice--category3 { fill: var(--st-semantic-data-category3); }
  .st-donutChart__slice--category4 { fill: var(--st-semantic-data-category4); }
  .st-donutChart__slice--category5 { fill: var(--st-semantic-data-category5); }
  .st-donutChart__slice--category6 { fill: var(--st-semantic-data-category6); }
  .st-donutChart__slice--category7 { fill: var(--st-semantic-data-category7); }
  .st-donutChart__slice--category8 { fill: var(--st-semantic-data-category8); }

  .st-donutChart__center {
    fill: var(--st-semantic-text-primary);
    font-size: 1.25rem;
    font-weight: 650;
  }

  /* Data labels — per-slice value, centred in the arc. Token-only colour. */
  .st-donutChart__dataLabel {
    fill: var(--st-semantic-text-inverse);
    font-size: 0.6875rem;
    font-weight: 600;
  }

  .st-donutChart__tooltip {
    background: var(--st-semantic-surface-inverse);
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-inverse);
    display: inline-flex;
    flex-direction: column;
    font-size: 0.75rem;
    gap: 0.125rem;
    left: 50%;
    line-height: 1.2;
    padding: 0.375rem 0.5rem;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
    z-index: 1;
  }

  .st-donutChart__tooltipLabel { font-weight: 600; }
  .st-donutChart__tooltipValue { opacity: 0.85; }
</style>
