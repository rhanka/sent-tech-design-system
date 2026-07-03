<script lang="ts" module>
  export type KpiCardSize = "sm" | "md" | "lg";
  export type KpiCardTrend = "up" | "down" | "flat";
  export type KpiCardFormat = "number" | "currency" | "percent";
  export type KpiCardDeltaFormat = "percent" | "absolute";
  export type KpiCardTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type { CellDecoration, CellDecorationIntent } from "./cellDecoration.js";
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Sparkline from "./Sparkline.svelte";
  import {
    type CellDecoration,
    cellDecorationClass,
    cellDecorationLabel,
  } from "./cellDecoration.js";
  import CellDecorationIcon from "./CellDecorationIcon.svelte";

  type KpiCardProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Valeur principale affichée en grand. */
    value: number | string;
    /** Étiquette de l'indicateur (ex. « Revenu mensuel »). */
    label: string;
    /** Variation par rapport à la période précédente. */
    delta?: number;
    /** Comment exprimer le delta : en pourcentage ou en valeur absolue. */
    deltaFormat?: KpiCardDeltaFormat;
    /** Tendance ; déduite du signe du delta si absente. */
    trend?: KpiCardTrend;
    /** Formatage de la valeur principale via Intl.NumberFormat. */
    format?: KpiCardFormat;
    /** Unité suffixée à la valeur (ex. « ms », « €/mois »). */
    unit?: string;
    /** Code devise ISO 4217 pour format="currency" (défaut EUR). */
    currency?: string;
    /** Locale BCP 47 pour le formatage des nombres (défaut undefined = locale du runtime). */
    locale?: string;
    /** Mini-graphique de tendance optionnel. */
    sparkline?: number[];
    size?: KpiCardSize;
    /** Couleur catégorielle pour l'accent (bordure de gauche). */
    tone?: KpiCardTone;
    /**
     * Conditional formatting : décoration sémantique de la carte (intent → token
     * feedback en fond teinté accessible + icône lucide optionnelle).
     */
    decoration?: CellDecoration;
    class?: string;
  };

  let {
    value,
    label,
    delta,
    deltaFormat = "percent",
    trend,
    format = "number",
    unit,
    currency = "EUR",
    locale,
    sparkline,
    size = "md",
    tone,
    decoration,
    class: className,
    ...rest
  }: KpiCardProps = $props();

  const resolvedTrend = $derived<KpiCardTrend | undefined>(
    trend ?? (delta == null ? undefined : delta > 0 ? "up" : delta < 0 ? "down" : "flat")
  );

  const formattedValue = $derived.by(() => {
    if (typeof value === "string") {
      return value;
    }
    if (format === "currency") {
      return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
    }
    if (format === "percent") {
      return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 2 }).format(
        value
      );
    }
    return new Intl.NumberFormat(locale).format(value);
  });

  const formattedDelta = $derived.by(() => {
    if (delta == null) {
      return undefined;
    }
    const sign = delta > 0 ? "+" : "";
    if (deltaFormat === "percent") {
      const pct = new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: 1
      }).format(delta);
      return `${sign}${pct}`;
    }
    return `${sign}${new Intl.NumberFormat(locale).format(delta)}`;
  });

  /** Le sparkline emprunte la couleur sémantique de la tendance. */
  const sparklineTone = $derived(
    resolvedTrend === "up" ? "success" : resolvedTrend === "down" ? "error" : "neutral"
  );

  const arrow = $derived(
    resolvedTrend === "up" ? "M3 8.5 7 4l4 4.5" : resolvedTrend === "down" ? "M3 5.5 7 10l4-4.5" : "M3 7h8"
  );

  const trendLabel = $derived(
    resolvedTrend === "up"
      ? "en hausse"
      : resolvedTrend === "down"
        ? "en baisse"
        : resolvedTrend === "flat"
          ? "stable"
          : undefined
  );

  const ariaLabel = $derived(
    [
      label,
      formattedValue,
      unit,
      formattedDelta && `${formattedDelta} ${trendLabel ?? ""}`.trim(),
      decoration && cellDecorationLabel[decoration.intent]
    ]
      .filter(Boolean)
      .join(", ")
  );

  const classes = $derived(
    [
      "st-kpiCard",
      `st-kpiCard--${size}`,
      tone && `st-kpiCard--${tone}`,
      tone && "st-kpiCard--toned",
      decoration && "st-cell",
      decoration && cellDecorationClass(decoration.intent),
      className
    ]
      .filter(Boolean)
      .join(" ")
  );
</script>

<article {...rest} class={classes} role="group" aria-label={ariaLabel}>
  <p class="st-kpiCard__label">{label}</p>

  <p class="st-kpiCard__value">
    {#if decoration}
      <CellDecorationIcon icon={decoration.icon} />
    {/if}
    <span class="st-kpiCard__number">{formattedValue}</span>
    {#if unit}
      <span class="st-kpiCard__unit">{unit}</span>
    {/if}
  </p>

  {#if formattedDelta || sparkline}
    <div class="st-kpiCard__footer">
      {#if formattedDelta}
        <span
          class="st-kpiCard__delta st-kpiCard__delta--{resolvedTrend ?? 'flat'}"
          aria-hidden="true"
        >
          <svg
            class="st-kpiCard__arrow"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d={arrow}
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="st-kpiCard__deltaValue">{formattedDelta}</span>
        </span>
      {/if}

      {#if sparkline && sparkline.length > 0}
        <Sparkline
          class="st-kpiCard__sparkline"
          data={sparkline}
          tone={sparklineTone}
          area
        />
      {/if}
    </div>
  {/if}
</article>

<style>
  .st-kpiCard {
    background: var(--st-component-card-background, var(--st-semantic-surface-raised));
    border-width: var(--st-component-card-anatomy-shape-borderWidth, 1px);
    border-style: var(--st-component-card-anatomy-shape-borderStyle, solid);
    border-color: var(--st-component-card-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-card-anatomy-shape-radius, 0.5rem);
    box-shadow: var(--st-component-card-shadow, 0 1px 2px rgb(15 23 42 / 0.08));
    color: var(--st-semantic-text-primary);
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
    padding: var(--st-spacing-4, 1rem);
  }

  .st-kpiCard--sm {
    gap: var(--st-spacing-1, 0.25rem);
    padding: var(--st-spacing-3, 0.75rem);
  }

  .st-kpiCard--lg {
    gap: var(--st-spacing-3, 0.75rem);
    padding: var(--st-spacing-6, 1.5rem);
  }

  /* Accent catégoriel : liseré conservé, mais carte carrée pour éviter
     le liseré arrondi sur conteneur arrondi. */
  .st-kpiCard--toned {
    border-inline-start-width: var(--st-spacing-1, 0.25rem);
    border-radius: 0;
  }

  .st-kpiCard__label {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.25;
    margin: 0;
  }

  .st-kpiCard--lg .st-kpiCard__label {
    font-size: 0.875rem;
  }

  .st-kpiCard__value {
    align-items: baseline;
    color: var(--st-semantic-text-primary);
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-1, 0.25rem);
    margin: 0;
  }

  /* Conditional formatting (« classe Power-BI ») : fond teinté accessible
     (color-mix 14% sur token feedback, comme Badge/Tag) + icône alignée sur la
     valeur. Le fond n'est jamais la seule indication (icône + texte SR). */
  .st-kpiCard.st-cell {
    padding: var(--st-spacing-4, 1rem);
  }

  .st-kpiCard.st-cell .st-kpiCard__value {
    align-items: center;
  }

  .st-kpiCard.st-cell .st-kpiCard__number {
    color: inherit;
  }

  .st-cell--intent-positive {
    background: color-mix(in srgb, var(--st-semantic-feedback-success) 14%, white);
    color: var(--st-semantic-feedback-success);
  }

  .st-cell--intent-negative {
    background: color-mix(in srgb, var(--st-semantic-feedback-error) 14%, white);
    color: var(--st-semantic-feedback-error);
  }

  .st-cell--intent-warning {
    background: color-mix(in srgb, var(--st-semantic-feedback-warning) 14%, white);
    color: var(--st-semantic-feedback-warning);
  }

  .st-cell--intent-info {
    background: color-mix(in srgb, var(--st-semantic-feedback-info) 14%, white);
    color: var(--st-semantic-feedback-info);
  }

  .st-cell--intent-neutral {
    background: var(--st-semantic-surface-subtle);
    color: var(--st-semantic-text-secondary);
  }

  .st-kpiCard__number {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.1;
  }

  .st-kpiCard--sm .st-kpiCard__number {
    font-size: 1.25rem;
  }

  .st-kpiCard--lg .st-kpiCard__number {
    font-size: 2.25rem;
  }

  .st-kpiCard__unit {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .st-kpiCard__footer {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
    justify-content: space-between;
  }

  .st-kpiCard__delta {
    align-items: center;
    display: inline-flex;
    font-size: 0.8125rem;
    font-weight: 600;
    gap: var(--st-spacing-1, 0.25rem);
    line-height: 1;
  }

  .st-kpiCard__arrow {
    display: block;
    flex: 0 0 auto;
  }

  .st-kpiCard__delta--up {
    color: var(--st-semantic-feedback-success);
  }

  .st-kpiCard__delta--down {
    color: var(--st-semantic-feedback-error);
  }

  .st-kpiCard__delta--flat {
    color: var(--st-semantic-text-secondary);
  }

  /* Liserés catégoriels — alignés sur la palette data des autres composants. */
  .st-kpiCard--category1 {
    border-inline-start-color: var(--st-semantic-data-category1);
  }
  .st-kpiCard--category2 {
    border-inline-start-color: var(--st-semantic-data-category2);
  }
  .st-kpiCard--category3 {
    border-inline-start-color: var(--st-semantic-data-category3);
  }
  .st-kpiCard--category4 {
    border-inline-start-color: var(--st-semantic-data-category4);
  }
  .st-kpiCard--category5 {
    border-inline-start-color: var(--st-semantic-data-category5);
  }
  .st-kpiCard--category6 {
    border-inline-start-color: var(--st-semantic-data-category6);
  }
  .st-kpiCard--category7 {
    border-inline-start-color: var(--st-semantic-data-category7);
  }
  .st-kpiCard--category8 {
    border-inline-start-color: var(--st-semantic-data-category8);
  }
</style>
