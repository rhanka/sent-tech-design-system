<script lang="ts" module>
  export type SlideIndicatorVariant = "dots" | "bars";
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type SlideIndicatorProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onchange"> & {
    /** Nombre total de diapositives. */
    count: number;
    /** Index de la diapositive courante (0-based). */
    current?: number;
    /** Appelé avec l'index ciblé au clic ou au clavier. */
    onChange?: (index: number) => void;
    size?: "sm" | "md" | "lg";
    variant?: SlideIndicatorVariant;
    /** Préfixe d'étiquette accessible de chaque point ("Diapositive 1"...). */
    label?: string;
    class?: string;
  };

  let {
    count,
    current = 0,
    onChange,
    size = "md",
    variant = "dots",
    label = "Diapositive",
    class: className,
    ...rest
  }: SlideIndicatorProps = $props();

  const classes = $derived(
    [
      "st-slideIndicator",
      `st-slideIndicator--${size}`,
      `st-slideIndicator--${variant}`,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );

  const items = $derived(Array.from({ length: Math.max(0, count) }, (_, i) => i));

  // Refs des boutons pour déplacer le focus programmatiquement lors de la navigation clavier.
  let buttonRefs = $state<Record<number, HTMLElement | null>>({});

  function select(index: number) {
    if (index < 0 || index >= count || index === current) return;
    onChange?.(index);
  }

  function onKeyDown(event: KeyboardEvent, index: number) {
    let target = index;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        target = Math.min(count - 1, index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        target = Math.max(0, index - 1);
        break;
      case "Home":
        target = 0;
        break;
      case "End":
        target = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    // Déplacer le focus DOM vers le bouton cible (roving tabindex correct).
    const targetEl = buttonRefs[target];
    if (targetEl) targetEl.focus();
    select(target);
  }
</script>

<!--
  Choix de pattern : role="group" + boutons avec aria-current.
  Justification : un indicateur de carrousel/pagination n'est PAS un tablist — il n'y a pas de
  tabpanel associé. Utiliser role="tab" sans aria-controls/tabpanel trompe les lecteurs d'écran
  qui annoncent « onglet X sur N » sans panneau contrôlé.
  Pattern retenu (ARIA Authoring Practices Guide — Carousel) : role="group" nommé + boutons natifs
  avec aria-current="true" sur le point courant + roving tabindex.
  Le SR annonce « Groupe [label] — [label] 1, bouton ; [label] 2, courant, bouton ; … »
-->
<div {...rest} class={classes} role="group" aria-label={label}>
  {#each items as index (index)}
    <button
      type="button"
      class="st-slideIndicator__dot"
      class:st-slideIndicator__dot--current={index === current}
      aria-current={index === current ? "true" : undefined}
      aria-label={`${label} ${index + 1}`}
      tabindex={index === current ? 0 : -1}
      bind:this={buttonRefs[index]}
      onclick={() => select(index)}
      onkeydown={(event) => onKeyDown(event, index)}
    ></button>
  {/each}
</div>

<style>
  .st-slideIndicator {
    align-items: center;
    display: inline-flex;
    gap: var(--st-spacing-2, 0.5rem);
  }

  .st-slideIndicator__dot {
    background: var(--st-semantic-border-strong, var(--st-semantic-text-muted));
    border: 0;
    cursor: pointer;
    opacity: 0.5;
    padding: 0;
    transition:
      opacity var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      background-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      width var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-slideIndicator__dot:hover {
    opacity: 0.8;
  }

  .st-slideIndicator__dot:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 2px;
  }

  .st-slideIndicator__dot--current {
    background: var(--st-semantic-action-primary);
    opacity: 1;
  }

  /* Variant dots: cercles */
  .st-slideIndicator--dots .st-slideIndicator__dot {
    border-radius: 50%;
  }

  .st-slideIndicator--dots.st-slideIndicator--sm .st-slideIndicator__dot {
    height: 0.375rem;
    width: 0.375rem;
  }

  .st-slideIndicator--dots.st-slideIndicator--md .st-slideIndicator__dot {
    height: 0.5rem;
    width: 0.5rem;
  }

  .st-slideIndicator--dots.st-slideIndicator--lg .st-slideIndicator__dot {
    height: 0.75rem;
    width: 0.75rem;
  }

  /* Variant bars: barres, la courante s'allonge */
  .st-slideIndicator--bars .st-slideIndicator__dot {
    border-radius: 999px;
  }

  .st-slideIndicator--bars.st-slideIndicator--sm .st-slideIndicator__dot {
    height: 0.25rem;
    width: 0.75rem;
  }

  .st-slideIndicator--bars.st-slideIndicator--md .st-slideIndicator__dot {
    height: 0.3125rem;
    width: 1rem;
  }

  .st-slideIndicator--bars.st-slideIndicator--lg .st-slideIndicator__dot {
    height: 0.375rem;
    width: 1.25rem;
  }

  .st-slideIndicator--bars .st-slideIndicator__dot--current {
    width: 1.75rem;
  }

  .st-slideIndicator--bars.st-slideIndicator--lg .st-slideIndicator__dot--current {
    width: 2.25rem;
  }
</style>
