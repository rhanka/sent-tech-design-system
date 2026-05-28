<script lang="ts" module>
  export type HighlightTone = "neutral" | "info" | "success" | "warning" | "error";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type HighlightProps = Omit<HTMLAttributes<HTMLElement>, "class" | "title"> & {
    /** Tonalité de l'encart (couleur d'accent). */
    tone?: HighlightTone;
    /** Titre optionnel de la mise en avant. */
    title?: string;
    class?: string;
    children?: Snippet;
  };

  let {
    tone = "neutral",
    title,
    class: className,
    children,
    ...rest
  }: HighlightProps = $props();

  const classes = () => ["st-highlight", `st-highlight--${tone}`, className].filter(Boolean).join(" ");
</script>

<aside {...rest} class={classes()}>
  {#if title}<p class="st-highlight__title">{title}</p>{/if}
  {#if children}<div class="st-highlight__body">{@render children()}</div>{/if}
</aside>

<style>
  /* Mise en avant / encart éditorial (DSFR "Mise en avant"). */
  .st-highlight {
    --st-highlight-accent: var(--st-semantic-action-primary);
    background: var(--st-semantic-surface-subtle);
    border-left: 4px solid var(--st-highlight-accent);
    border-radius: var(--st-radius-md, 0.375rem);
    color: var(--st-semantic-text-primary);
    padding: var(--st-spacing-4, 1rem);
  }

  .st-highlight--info { --st-highlight-accent: var(--st-semantic-feedback-info); }
  .st-highlight--success { --st-highlight-accent: var(--st-semantic-feedback-success); }
  .st-highlight--warning { --st-highlight-accent: var(--st-semantic-feedback-warning); }
  .st-highlight--error { --st-highlight-accent: var(--st-semantic-feedback-error); }

  .st-highlight__title {
    font-size: 0.9375rem;
    font-weight: 650;
    margin: 0 0 var(--st-spacing-2, 0.5rem);
  }

  .st-highlight__body {
    color: var(--st-semantic-text-secondary);
    font-size: 0.9375rem;
    line-height: 1.55;
  }

  .st-highlight__body :global(p) { margin: 0; }
</style>
