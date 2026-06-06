<script lang="ts" module>
  export type RatingSize = "sm" | "md" | "lg";
</script>

<script lang="ts">
  import { Star, StarHalf } from "@lucide/svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type RatingProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onchange"> & {
    /** Note courante (0..max). Pas de 1, ou 0.5 si `allowHalf`. */
    value?: number;
    /** Nombre d'étoiles. */
    max?: number;
    /** Appelé avec la nouvelle note au clic ou au clavier. */
    onChange?: (value: number) => void;
    /** Affichage seul : ni clic ni clavier n'émettent. */
    readonly?: boolean;
    /** Autorise les demi-étoiles (sélection au demi-point). */
    allowHalf?: boolean;
    size?: RatingSize;
    /** Attribut name (utile dans un formulaire / pour la sémantique radio). */
    name?: string;
    /** Étiquette accessible du groupe. */
    label?: string;
    class?: string;
  };

  let {
    value = 0,
    max = 5,
    onChange,
    readonly = false,
    allowHalf = false,
    size = "md",
    name,
    label,
    class: className,
    ...rest
  }: RatingProps = $props();

  const iconSize = $derived(size === "sm" ? 16 : size === "lg" ? 28 : 22);

  const classes = $derived(
    ["st-rating", `st-rating--${size}`, readonly && "st-rating--readonly", className]
      .filter(Boolean)
      .join(" ")
  );

  const stars = $derived(Array.from({ length: max }, (_, i) => i + 1));

  // L'étoile « focusable » (tabindex 0) suit la valeur ; à 0 c'est la première.
  // En mode allowHalf, la valeur peut être un demi-entier : on focus l'étoile plafond.
  const focusedStar = $derived(value > 0 ? Math.ceil(value) : 1);

  // Refs des boutons radio pour déplacer le focus programmatiquement.
  let radioRefs = $state<Record<number, HTMLElement | null>>({});

  // Texte accessible décrivant la valeur courante (utilisé pour aria-valuetext et aria-label readonly).
  const valueText = $derived(
    value === 0
      ? `0 / ${max}`
      : allowHalf && value % 1 !== 0
        ? `${value} / ${max}`
        : `${value} / ${max}`
  );

  function fill(star: number): "full" | "half" | "empty" {
    if (value >= star) return "full";
    if (allowHalf && value >= star - 0.5) return "half";
    return "empty";
  }

  function commit(next: number) {
    if (readonly) return;
    const clamped = Math.max(0, Math.min(max, next));
    value = clamped;
    onChange?.(clamped);
  }

  function onStarClick(event: MouseEvent, star: number) {
    if (readonly) return;
    let next = star;
    if (allowHalf) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const isLeftHalf = event.clientX - rect.left < rect.width / 2;
      next = isLeftHalf ? star - 0.5 : star;
    }
    // Re-cliquer la valeur déjà sélectionnée remet à zéro.
    if (next === value) {
      commit(0);
      return;
    }
    commit(next);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (readonly) return;
    const step = allowHalf ? 0.5 : 1;
    let handled = true;
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = Math.min(max, value + step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        // En mode entier, ne pas descendre sous 1 (pas de radio "0").
        next = allowHalf ? Math.max(0, value - step) : Math.max(1, value - step);
        break;
      case "Home":
        // Home → première étoile (1), pas 0 (aucun radio "0" n'existe).
        next = allowHalf ? 0 : 1;
        break;
      case "End":
        next = max;
        break;
      default:
        handled = false;
    }
    if (handled) {
      event.preventDefault();
      if (next !== null) {
        commit(next);
        // En mode entier, déplacer le focus DOM vers le radio cible.
        if (!allowHalf) {
          const targetStar = next > 0 ? Math.ceil(next) : 1;
          const targetEl = radioRefs[targetStar];
          if (targetEl) targetEl.focus();
        }
      }
    }
  }

  // En mode allowHalf, on expose un slider ARIA (valeurs fractionnaires non représentables
  // fidèlement par un radiogroup). En mode entier, on garde radiogroup/radio.
  // Readonly : rendu non interactif avec span + aria-label global pour éviter les boutons disabled
  // qui disparaissent de l'arbre d'accessibilité interactif.
</script>

{#if readonly}
  <!-- Readonly : pas d'éléments interactifs disabled — on expose la note via aria-label sur le groupe. -->
  <div
    {...rest}
    class={classes}
    role="img"
    aria-label={label ? `${label} : ${valueText}` : valueText}
  >
    {#each stars as star (star)}
      {@const state = fill(star)}
      <span class="st-rating__star" class:st-rating__star--full={state === "full"} class:st-rating__star--half={state === "half"} aria-hidden="true">
        {#if state === "half"}
          <StarHalf size={iconSize} strokeWidth={1.75} aria-hidden="true" />
        {:else}
          <Star
            size={iconSize}
            strokeWidth={1.75}
            fill={state === "full" ? "currentColor" : "none"}
            aria-hidden="true"
          />
        {/if}
      </span>
    {/each}
  </div>
{:else if allowHalf}
  <!-- allowHalf : slider ARIA — valeurs fractionnaires (0.5 step), plus fidèle que radiogroup. -->
  <div
    {...rest}
    class={classes}
    role="slider"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={max}
    aria-valuenow={value}
    aria-valuetext={valueText}
    tabindex={0}
    onkeydown={onKeyDown}
  >
    {#each stars as star (star)}
      {@const state = fill(star)}
      <span
        class="st-rating__star"
        class:st-rating__star--full={state === "full"}
        class:st-rating__star--half={state === "half"}
        aria-hidden="true"
        onclick={(event) => onStarClick(event, star)}
      >
        {#if state === "half"}
          <StarHalf size={iconSize} strokeWidth={1.75} aria-hidden="true" />
        {:else}
          <Star
            size={iconSize}
            strokeWidth={1.75}
            fill={state === "full" ? "currentColor" : "none"}
            aria-hidden="true"
          />
        {/if}
      </span>
    {/each}
  </div>
{:else}
  <!-- Mode entier : radiogroup / radio. aria-checked=true uniquement sur l'étoile == value. -->
  <div
    {...rest}
    class={classes}
    role="radiogroup"
    aria-label={label}
  >
    {#each stars as star (star)}
      {@const state = fill(star)}
      <button
        type="button"
        class="st-rating__star"
        class:st-rating__star--full={state === "full"}
        role="radio"
        name={name}
        aria-checked={value === star ? "true" : "false"}
        aria-label={`${star} / ${max}`}
        tabindex={star === focusedStar ? 0 : -1}
        bind:this={radioRefs[star]}
        onclick={(event) => onStarClick(event, star)}
        onkeydown={onKeyDown}
      >
        <Star
          size={iconSize}
          strokeWidth={1.75}
          fill={state === "full" ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>
    {/each}
  </div>
{/if}

<style>
  .st-rating {
    align-items: center;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    gap: var(--st-spacing-1, 0.25rem);
  }

  .st-rating__star {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: var(--st-semantic-text-muted);
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    line-height: 0;
    padding: var(--st-spacing-1, 0.25rem);
  }

  .st-rating__star--full,
  .st-rating__star--half {
    color: var(--st-semantic-feedback-warning, var(--st-semantic-action-primary));
  }

  .st-rating__star:hover:not(:disabled) {
    color: var(--st-semantic-feedback-warning, var(--st-semantic-action-primary));
  }

  .st-rating__star:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 2px;
  }

  .st-rating__star:disabled {
    cursor: default;
  }

  .st-rating--readonly .st-rating__star {
    cursor: default;
  }

  /* Mode allowHalf : le slider (conteneur) doit afficher un focus-visible. */
  [role="slider"].st-rating:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: 2px;
  }
</style>
