<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  export type ScoreCardType = "value" | "complexity";
  export type ScoreCardSize = "sm" | "md" | "lg";

  export type ScoreCardProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Titre de la métrique notée. */
    title: string;
    /** Score numérique affiché (formaté à une décimale). */
    score: number;
    /** Nombre de symboles pleins (0..max). */
    stars: number;
    /** Nombre total de symboles. */
    max?: number;
    /**
     * Nature de la note :
     * - `value` (défaut) : étoiles, accent succès.
     * - `complexity` : croix, accent avertissement.
     */
    type?: ScoreCardType;
    /** Libellé d'unité du score (défaut « points »). */
    unit?: string;
    size?: ScoreCardSize;
    class?: string;
  };
</script>

<script lang="ts">
  let {
    title,
    score,
    stars,
    max = 5,
    type = "value",
    unit = "points",
    size = "md",
    class: className,
    ...rest
  }: ScoreCardProps = $props();

  const filled = $derived(Math.max(0, Math.min(max, Math.round(stars))));
  const symbols = $derived(
    Array.from({ length: max }, (_, i) => i < filled)
  );
  const ariaLabel = $derived(
    `${title}, ${score.toFixed(1)} ${unit}, ${filled} sur ${max}`
  );

  const classes = $derived(
    ["st-scoreCard", `st-scoreCard--${size}`, `st-scoreCard--${type}`, className]
      .filter(Boolean)
      .join(" ")
  );

  // Étoile pleine (type=value) vs croix (type=complexity).
  const starPath =
    "m7 1.5 1.7 3.45 3.8.55-2.75 2.68.65 3.79L7 10.18 3.6 11.96l.65-3.79L1.5 5.5l3.8-.55L7 1.5Z";
  const crossPath = "M3.5 3.5l7 7M10.5 3.5l-7 7";
</script>

<article {...rest} class={classes} role="group" aria-label={ariaLabel}>
  <h3 class="st-scoreCard__title">{title}</h3>
  <div class="st-scoreCard__row">
    <div class="st-scoreCard__symbols" aria-hidden="true">
      {#each symbols as on, i (i)}
        <svg
          class="st-scoreCard__symbol {on ? 'st-scoreCard__symbol--on' : 'st-scoreCard__symbol--off'}"
          width="20"
          height="20"
          viewBox="0 0 14 14"
          focusable="false"
        >
          {#if type === "value"}
            <path d={starPath} fill={on ? "currentColor" : "none"} stroke="currentColor" stroke-width="1" stroke-linejoin="round" />
          {:else}
            <path d={crossPath} fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
          {/if}
        </svg>
      {/each}
    </div>
    <span class="st-scoreCard__score">
      {score.toFixed(1)} {unit}
    </span>
  </div>
</article>

<style>
  .st-scoreCard {
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

  .st-scoreCard--sm {
    gap: var(--st-spacing-1, 0.25rem);
    padding: var(--st-spacing-3, 0.75rem);
  }

  .st-scoreCard--lg {
    gap: var(--st-spacing-3, 0.75rem);
    padding: var(--st-spacing-6, 1.5rem);
  }

  .st-scoreCard__title {
    color: var(--st-semantic-text-primary);
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.3;
    margin: 0;
  }

  .st-scoreCard__row {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .st-scoreCard__symbols {
    display: inline-flex;
    gap: 0.125rem;
  }

  .st-scoreCard__symbol {
    display: block;
    flex: 0 0 auto;
  }

  .st-scoreCard--sm .st-scoreCard__symbol {
    height: 16px;
    width: 16px;
  }

  .st-scoreCard--lg .st-scoreCard__symbol {
    height: 24px;
    width: 24px;
  }

  .st-scoreCard__symbol--off {
    color: var(--st-semantic-border-default);
  }

  .st-scoreCard--value .st-scoreCard__symbol--on {
    color: var(--st-semantic-feedback-warning);
  }

  .st-scoreCard--complexity .st-scoreCard__symbol--on {
    color: var(--st-semantic-text-secondary);
  }

  .st-scoreCard__score {
    font-size: 1.0625rem;
    font-weight: 700;
  }

  .st-scoreCard--value .st-scoreCard__score {
    color: var(--st-semantic-feedback-success);
  }

  .st-scoreCard--complexity .st-scoreCard__score {
    color: var(--st-semantic-feedback-warning);
  }
</style>
