<script lang="ts" module>
  export type TimelineTone = "neutral" | "info" | "success" | "warning" | "danger";

  export type TimelineItem = {
    /** Titre de l'événement. */
    title: string;
    /** Métadonnée optionnelle (date, heure, libellé court). */
    meta?: string;
    /** Description optionnelle de l'événement. */
    description?: string;
    /** Ton de la pastille (mappé sur les tokens de statut DS, défaut "neutral"). */
    tone?: TimelineTone;
  };

  export type TimelineOrientation = "vertical" | "horizontal";
</script>

<script lang="ts">
  // Timeline — liste d'ÉVÉNEMENTS DATÉS reliés par une ligne de connexion. Chaque
  // item porte une pastille (couleur de statut), un titre, une méta (date/heure)
  // et une description. Distinct de TimelineChart (dataviz à échelle temporelle) :
  // ici c'est une liste sémantique <ol>/<li> façon Ant Design / MUI Timeline.
  // Style 100% token-only (--st-* avec fallback), pas de hex en dur.
  import type { HTMLAttributes } from "svelte/elements";

  type TimelineProps = Omit<HTMLAttributes<HTMLOListElement>, "class"> & {
    items: TimelineItem[];
    orientation?: TimelineOrientation;
    class?: string;
  };

  let {
    items,
    orientation = "vertical",
    class: className,
    ...rest
  }: TimelineProps = $props();

  const safeItems = $derived(Array.isArray(items) ? items : []);
  const classes = $derived(
    ["st-timeline", `st-timeline--${orientation}`, className].filter(Boolean).join(" ")
  );
</script>

<ol {...rest} class={classes}>
  {#each safeItems as item, i (i)}
    <li class="st-timeline__item st-timeline__item--{item.tone ?? 'neutral'}">
      <span class="st-timeline__rail" aria-hidden="true">
        <span class="st-timeline__dot"></span>
        <span class="st-timeline__line"></span>
      </span>
      <div class="st-timeline__content">
        {#if item.meta}
          <span class="st-timeline__meta">{item.meta}</span>
        {/if}
        <span class="st-timeline__title">{item.title}</span>
        {#if item.description}
          <span class="st-timeline__description">{item.description}</span>
        {/if}
      </div>
    </li>
  {/each}
</ol>

<style>
  .st-timeline {
    color: var(--st-semantic-text-primary, inherit);
    display: flex;
    font-family: inherit;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-timeline--vertical {
    flex-direction: column;
  }

  .st-timeline--horizontal {
    flex-direction: row;
  }

  .st-timeline__item {
    --st-timeline-dot: var(--st-semantic-border-strong, rgba(0, 0, 0, 0.32));
    display: flex;
    gap: var(--st-spacing-3, 0.75rem);
    position: relative;
  }

  .st-timeline--vertical .st-timeline__item {
    flex-direction: row;
    padding-bottom: var(--st-spacing-4, 1rem);
  }

  .st-timeline--vertical .st-timeline__item:last-child {
    padding-bottom: 0;
  }

  .st-timeline--horizontal .st-timeline__item {
    flex: 1 1 0;
    flex-direction: column;
    padding-right: var(--st-spacing-4, 1rem);
  }

  .st-timeline--horizontal .st-timeline__item:last-child {
    padding-right: 0;
  }

  .st-timeline__item--info {
    --st-timeline-dot: var(--st-semantic-feedback-info, var(--st-semantic-action-primary));
  }

  .st-timeline__item--success {
    --st-timeline-dot: var(--st-semantic-feedback-success);
  }

  .st-timeline__item--warning {
    --st-timeline-dot: var(--st-semantic-feedback-warning);
  }

  .st-timeline__item--danger {
    --st-timeline-dot: var(--st-semantic-feedback-error);
  }

  .st-timeline__rail {
    align-items: center;
    display: flex;
    flex: none;
    position: relative;
  }

  .st-timeline--vertical .st-timeline__rail {
    flex-direction: column;
  }

  .st-timeline--horizontal .st-timeline__rail {
    flex-direction: row;
    width: 100%;
  }

  .st-timeline__dot {
    background: var(--st-timeline-dot);
    border-radius: var(--st-radius-full, 9999px);
    box-sizing: border-box;
    flex: none;
    height: var(--st-timeline-dot-size, 0.75rem);
    width: var(--st-timeline-dot-size, 0.75rem);
  }

  .st-timeline__line {
    background: var(--st-semantic-border-subtle, var(--st-semantic-border-strong, rgba(0, 0, 0, 0.12)));
    flex: 1 1 auto;
  }

  .st-timeline--vertical .st-timeline__line {
    margin-top: var(--st-spacing-1, 0.25rem);
    min-height: var(--st-spacing-4, 1rem);
    width: var(--st-border-width-thin, 1px);
  }

  .st-timeline--horizontal .st-timeline__line {
    height: var(--st-border-width-thin, 1px);
    margin-left: var(--st-spacing-1, 0.25rem);
  }

  .st-timeline__item:last-child .st-timeline__line {
    display: none;
  }

  .st-timeline__content {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-1, 0.25rem);
    padding-bottom: var(--st-spacing-1, 0.25rem);
  }

  .st-timeline__meta {
    color: var(--st-semantic-text-secondary, inherit);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
  }

  .st-timeline__title {
    color: var(--st-semantic-text-primary, inherit);
    font-size: 0.9375rem;
    font-weight: var(--st-font-weight-medium, 600);
    line-height: 1.3;
  }

  .st-timeline__description {
    color: var(--st-semantic-text-secondary, inherit);
    font-size: 0.875rem;
    line-height: 1.4;
  }
</style>
