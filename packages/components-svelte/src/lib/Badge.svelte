<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "class"> & {
    /**
     * `"brand"` (additive) is the marketing icon-chip tone: brand gradient
     * background (`--st-component-badge-brandBackground`, falling back to
     * `--st-semantic-gradient-accent` then `action-primary`) with inverse text;
     * a nested Icon follows the text colour.
     */
    tone?: "neutral" | "success" | "warning" | "error" | "info" | "brand";
    /**
     * Badge shape — `"pill"` (default) is the current render (radius 999px, width
     * grows with content). `"circle"` renders an equal-sided round bubble
     * (`min-width === min-height`, equal inline/block padding, tabular-nums) — best
     * for ≤2-digit counts. 3+ digit content degrades GRACEFULLY to a rounded-rect
     * (never clipped), so consumer counts reaching the 1000s stay legible.
     * Mirrors `Avatar`'s `shape`. Additive: with `shape` unset the badge renders
     * byte-identically to before. `"square"` (additive) is an equal-sided tile
     * with the large radius (2.5rem, 3rem at `size="lg"`), meant for an icon chip.
     */
    shape?: "pill" | "circle" | "square";
    /**
     * Density — `"md"` (default) is the current render. `"sm"` shrinks the
     * font-size (the rail-bubble scale). Additive: with `size` unset the badge
     * renders byte-identically to before. `"lg"` (additive) is the icon-chip
     * scale: a `circle` or `square` badge becomes a 3rem tile for a 24px Icon.
     */
    size?: "sm" | "md" | "lg";
    class?: string;
    /**
     * The number / text. Stays content-driven (no `value` prop). For SR users a
     * bare count is ambiguous — pass an `aria-label` via `...rest` describing what
     * is counted (e.g. `aria-label="128 entities"`).
     */
    children?: Snippet;
  };

  let {
    tone = "neutral",
    shape = "pill",
    size = "md",
    class: className,
    children,
    ...rest
  }: BadgeProps = $props();

  const classes = () =>
    [
      "st-badge",
      `st-badge--${tone}`,
      `st-badge--${shape}`,
      `st-badge--${size}`,
      className
    ]
      .filter(Boolean)
      .join(" ");
</script>

<span {...rest} class={classes()}>
  {@render children?.()}
</span>

<style>
  /* P-C: per-theme badge anatomy. Every var falls back to the prior base literal,
     so a theme that emits no `--st-component-badge-*` renders byte-identically. */
  .st-badge {
    display: inline-flex;
    align-items: center;
    border-radius: var(--st-component-badge-radius, var(--st-radius-pill, 999px));
    font-size: var(--st-component-badge-fontSize, 0.75rem);
    font-weight: var(--st-component-badge-fontWeight, 650);
    letter-spacing: var(--st-component-badge-letterSpacing, normal);
    line-height: var(--st-component-badge-lineHeight, 1);
    min-height: var(--st-component-badge-minHeight, 0);
    padding: var(--st-component-badge-paddingBlock, 0.25rem)
      var(--st-component-badge-paddingInline, 0.5rem);
    text-transform: var(--st-component-badge-textTransform, none);
  }

  /* Shape variants (additive). `pill` is the UNTOUCHED base `.st-badge` above — no
     `--pill` rule exists, so a `shape="pill"` (or unset) badge renders
     byte-identically. `--circle` overlays an equal-sided round bubble ON TOP of
     the base rules: equal min-width/min-height, equal inline/block padding,
     centered, tabular-nums for stable digit width. 3+ digit content degrades to a
     rounded-rect (the box grows past the diameter, never clips), so large counts
     stay legible. Every leaf falls back to a base literal so a theme that emits no
     `--st-component-badge-circle-*` renders the variant identically. */
  .st-badge--circle {
    border-radius: var(--st-component-badge-circle-radius, 50%);
    box-sizing: border-box;
    font-variant-numeric: tabular-nums;
    justify-content: center;
    min-width: var(--st-component-badge-circle-size, 1.25rem);
    min-height: var(--st-component-badge-circle-size, 1.25rem);
    /* Equal inline/block padding keeps 1–2 digits round; the inline padding lets
       3+ digits grow the box into a rounded-rect instead of clipping. */
    padding: var(--st-component-badge-circle-padding, 0.125rem);
    text-align: center;
  }

  /* Density variant (additive). `md` is the UNTOUCHED base font-size; `--sm`
     reuses the Tag `sm` scale for cross-house consistency. */
  .st-badge--sm {
    font-size: var(--st-component-badge-sm-fontSize, 0.6875rem);
  }

  /* Icon-chip variants (additive, site marketing). `--square` is an
     equal-sided tile with the large radius; `--lg` scales circle/square to 3rem
     for a 24px Icon. A pill or md badge never reads these rules. */
  .st-badge--square {
    border-radius: var(--st-component-badge-square-radius, var(--st-radius-lg, 0.5rem));
    box-sizing: border-box;
    justify-content: center;
    min-height: var(--st-component-badge-square-size, 2.5rem);
    min-width: var(--st-component-badge-square-size, 2.5rem);
    padding: var(--st-component-badge-square-padding, 0.5rem);
  }

  .st-badge--lg {
    font-size: var(--st-component-badge-lg-fontSize, 1rem);
  }

  .st-badge--lg.st-badge--square,
  .st-badge--lg.st-badge--circle {
    min-height: var(--st-component-badge-lg-size, 3rem);
    min-width: var(--st-component-badge-lg-size, 3rem);
  }

  .st-badge--brand {
    /* A nested Icon takes the chip text colour, whatever the theme icon colour. */
    --st-component-icon-color: currentColor;
    background: var(
      --st-component-badge-brandBackground,
      var(--st-semantic-gradient-accent, var(--st-semantic-action-primary))
    );
    color: var(--st-component-badge-brandText, var(--st-semantic-text-inverse, #ffffff));
  }

  .st-badge--neutral {
    background: var(--st-semantic-surface-subtle);
    color: var(--st-semantic-text-secondary);
  }

  .st-badge--success {
    background: color-mix(in srgb, var(--st-semantic-feedback-success) 14%, white);
    color: var(--st-semantic-feedback-success);
  }

  .st-badge--warning {
    background: color-mix(in srgb, var(--st-semantic-feedback-warning) 14%, white);
    color: var(--st-semantic-feedback-warning);
  }

  .st-badge--error {
    background: color-mix(in srgb, var(--st-semantic-feedback-error) 14%, white);
    color: var(--st-semantic-feedback-error);
  }

  .st-badge--info {
    background: var(
      --st-component-badge-infoBackground,
      color-mix(in srgb, var(--st-semantic-feedback-info) 14%, white)
    );
    color: var(--st-component-badge-infoText, var(--st-semantic-feedback-info));
  }
</style>
