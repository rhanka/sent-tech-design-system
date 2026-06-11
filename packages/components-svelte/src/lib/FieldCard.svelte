<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  export type FieldCardVariant = "plain" | "bordered" | "accent";
  export type FieldCardTone =
    | "category1"
    | "category2"
    | "category3"
    | "category4"
    | "category5"
    | "category6"
    | "category7"
    | "category8";

  export type FieldCardProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Titre de la carte / du groupe de champs. */
    label: string;
    /**
     * Variante visuelle :
     * - `plain` : cadre simple, titre discret.
     * - `bordered` (défaut) : titre séparé par un filet sous l'en-tête.
     * - `accent` : liseré catégoriel à gauche (conteneur à angles nets, jamais arrondi).
     */
    variant?: FieldCardVariant;
    /** Couleur catégorielle pour la variante `accent`. */
    tone?: FieldCardTone;
    /** Nombre de commentaires ; affiche une pastille à côté du titre si > 0 ou si `onOpenComments`. */
    commentCount?: number;
    /** Ouvre le fil de commentaires ; rend la pastille interactive. */
    onOpenComments?: () => void;
    class?: string;
    /** Corps de la carte. */
    children?: Snippet;
  };
</script>

<script lang="ts">
  let {
    label,
    variant = "bordered",
    tone,
    commentCount = 0,
    onOpenComments,
    class: className,
    children,
    ...rest
  }: FieldCardProps = $props();

  const classes = $derived(
    [
      "st-fieldCard",
      `st-fieldCard--${variant}`,
      variant === "accent" && tone && `st-fieldCard--${tone}`,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );

  const showBadge = $derived(commentCount > 0 || !!onOpenComments);
</script>

<section {...rest} class={classes}>
  <header class="st-fieldCard__header">
    <h3 class="st-fieldCard__label">{label}</h3>
    {#if showBadge}
      {#if onOpenComments}
        <button
          type="button"
          class="st-fieldCard__comments"
          aria-label={`Commentaires (${commentCount})`}
          onclick={() => onOpenComments?.()}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              d="M2.5 4.25A1.25 1.25 0 0 1 3.75 3h8.5A1.25 1.25 0 0 1 13.5 4.25v5A1.25 1.25 0 0 1 12.25 10.5H6.5L3.5 13v-2.5h-.75A.25.25 0 0 1 2.5 10.25v-6Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {#if commentCount > 0}
            <span class="st-fieldCard__commentCount">{commentCount}</span>
          {/if}
        </button>
      {:else}
        <span class="st-fieldCard__comments st-fieldCard__comments--static">
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              d="M2.5 4.25A1.25 1.25 0 0 1 3.75 3h8.5A1.25 1.25 0 0 1 13.5 4.25v5A1.25 1.25 0 0 1 12.25 10.5H6.5L3.5 13v-2.5h-.75A.25.25 0 0 1 2.5 10.25v-6Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="st-fieldCard__commentCount">{commentCount}</span>
        </span>
      {/if}
    {/if}
  </header>
  <div class="st-fieldCard__body">
    {@render children?.()}
  </div>
</section>

<style>
  .st-fieldCard {
    background: var(--st-component-card-background, var(--st-semantic-surface-raised));
    border-width: var(--st-component-card-anatomy-shape-borderWidth, 1px);
    border-style: var(--st-component-card-anatomy-shape-borderStyle, solid);
    border-color: var(--st-component-card-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-card-anatomy-shape-radius, 0.5rem);
    color: var(--st-semantic-text-primary);
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: var(--st-spacing-4, 1rem);
  }

  /* Variante accent : exergue par liseré de bord → conteneur à angles NETS
     (anti-pattern proscrit : carte arrondie avec exergue par trait de bord). */
  .st-fieldCard--accent {
    border-inline-start-width: var(--st-spacing-1, 0.25rem);
    border-radius: 0;
  }

  .st-fieldCard__header {
    align-items: center;
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-fieldCard--bordered .st-fieldCard__header {
    border-bottom: 1px solid var(--st-semantic-border-subtle);
    margin-bottom: var(--st-spacing-3, 0.75rem);
    padding-bottom: var(--st-spacing-3, 0.75rem);
  }

  .st-fieldCard__label {
    color: var(--st-semantic-text-primary);
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.3;
    margin: 0;
  }

  .st-fieldCard--bordered .st-fieldCard__label {
    font-size: 1rem;
  }

  .st-fieldCard__comments {
    align-items: center;
    background: transparent;
    border: none;
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-muted);
    cursor: var(--st-cursor-interactive, pointer);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.75rem;
    gap: 0.1875rem;
    line-height: 1;
    padding: 0.125rem var(--st-spacing-1, 0.25rem);
  }

  .st-fieldCard__comments--static {
    cursor: default;
  }

  .st-fieldCard__comments:hover:not(.st-fieldCard__comments--static) {
    color: var(--st-semantic-text-primary);
  }

  .st-fieldCard__comments:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive);
    outline-offset: 2px;
  }

  .st-fieldCard__body {
    color: var(--st-semantic-text-primary);
    flex: 1 1 auto;
  }

  .st-fieldCard--plain .st-fieldCard__body,
  .st-fieldCard--accent .st-fieldCard__body {
    margin-top: var(--st-spacing-2, 0.5rem);
  }

  /* Liserés catégoriels — alignés sur la palette data des autres composants. */
  .st-fieldCard--category1 {
    border-inline-start-color: var(--st-semantic-data-category1);
  }
  .st-fieldCard--category2 {
    border-inline-start-color: var(--st-semantic-data-category2);
  }
  .st-fieldCard--category3 {
    border-inline-start-color: var(--st-semantic-data-category3);
  }
  .st-fieldCard--category4 {
    border-inline-start-color: var(--st-semantic-data-category4);
  }
  .st-fieldCard--category5 {
    border-inline-start-color: var(--st-semantic-data-category5);
  }
  .st-fieldCard--category6 {
    border-inline-start-color: var(--st-semantic-data-category6);
  }
  .st-fieldCard--category7 {
    border-inline-start-color: var(--st-semantic-data-category7);
  }
  .st-fieldCard--category8 {
    border-inline-start-color: var(--st-semantic-data-category8);
  }
</style>
