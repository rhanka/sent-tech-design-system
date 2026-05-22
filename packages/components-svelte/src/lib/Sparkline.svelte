<script lang="ts">
  type SparklineTone = "neutral" | "success" | "warning" | "error";

  type SparklineProps = {
    data: number[];
    width?: number;
    height?: number;
    tone?: SparklineTone;
    strokeWidth?: number;
    area?: boolean;
    label?: string;
    class?: string;
  };

  let {
    data,
    width = 120,
    height = 28,
    tone = "neutral",
    strokeWidth = 1.5,
    area = false,
    label,
    class: className
  }: SparklineProps = $props();

  const PADDING = 2;

  const geometry = $derived.by(() => {
    if (!data || data.length === 0) {
      return { line: "", area: "" };
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const innerWidth = Math.max(width - PADDING * 2, 1);
    const innerHeight = Math.max(height - PADDING * 2, 1);
    const step = data.length > 1 ? innerWidth / (data.length - 1) : 0;
    const points = data.map((value, index) => {
      const x = PADDING + step * index;
      const normalised = (value - min) / span;
      const y = PADDING + (1 - normalised) * innerHeight;
      return { x, y };
    });
    const line = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ");
    const baseline = height - PADDING;
    const first = points[0];
    const last = points[points.length - 1];
    const areaPath = `${line} L${last.x.toFixed(2)},${baseline.toFixed(2)} L${first.x.toFixed(2)},${baseline.toFixed(2)} Z`;
    return { line, area: areaPath };
  });

  const classes = () =>
    ["st-sparkline", `st-sparkline--${tone}`, className].filter(Boolean).join(" ");
</script>

<span
  class={classes()}
  role="img"
  aria-label={label}
>
  <svg
    width={width}
    height={height}
    viewBox="0 0 {width} {height}"
    preserveAspectRatio="none"
    aria-hidden={label ? "true" : undefined}
    focusable="false"
  >
    {#if area && geometry.area}
      <path d={geometry.area} class="st-sparkline__area" />
    {/if}
    {#if geometry.line}
      <path
        d={geometry.line}
        class="st-sparkline__line"
        fill="none"
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    {/if}
  </svg>
</span>

<style>
  .st-sparkline {
    display: inline-flex;
    line-height: 0;
    vertical-align: middle;
  }

  .st-sparkline svg {
    display: block;
  }

  .st-sparkline--neutral {
    color: var(--st-component-sparkline-neutralStroke, var(--st-semantic-text-secondary));
  }

  .st-sparkline--success {
    color: var(--st-component-sparkline-successStroke, var(--st-semantic-feedback-success));
  }

  .st-sparkline--warning {
    color: var(--st-component-sparkline-warningStroke, var(--st-semantic-feedback-warning));
  }

  .st-sparkline--error {
    color: var(--st-component-sparkline-errorStroke, var(--st-semantic-feedback-error));
  }

  .st-sparkline__line {
    stroke: currentColor;
  }

  .st-sparkline__area {
    fill: currentColor;
    opacity: 0.18;
    stroke: none;
  }
</style>
