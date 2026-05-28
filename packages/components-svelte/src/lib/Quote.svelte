<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type QuoteProps = Omit<HTMLAttributes<HTMLElement>, "class" | "cite"> & {
    /** Auteur de la citation. */
    author?: string;
    /** Source / référence (affichée après l'auteur). */
    source?: string;
    /** URL source (attribut cite du blockquote). */
    cite?: string;
    class?: string;
    children?: Snippet;
  };

  let {
    author,
    source,
    cite,
    class: className,
    children,
    ...rest
  }: QuoteProps = $props();

  const classes = () => ["st-quote", className].filter(Boolean).join(" ");
  const hasAttribution = () => Boolean(author || source);
</script>

<figure {...rest} class={classes()}>
  <blockquote class="st-quote__text" {cite}>
    {#if children}{@render children()}{/if}
  </blockquote>
  {#if hasAttribution()}
    <figcaption class="st-quote__attribution">
      {#if author}<span class="st-quote__author">{author}</span>{/if}
      {#if source}<cite class="st-quote__source">{source}</cite>{/if}
    </figcaption>
  {/if}
</figure>

<style>
  .st-quote {
    border-left: 4px solid var(--st-semantic-action-primary);
    margin: 0;
    padding: var(--st-spacing-2, 0.5rem) 0 var(--st-spacing-2, 0.5rem) var(--st-spacing-4, 1rem);
  }

  .st-quote__text {
    color: var(--st-semantic-text-primary);
    font-size: 1.125rem;
    line-height: 1.6;
    margin: 0;
  }

  .st-quote__attribution {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    margin-top: var(--st-spacing-2, 0.5rem);
  }

  .st-quote__author {
    font-weight: 600;
  }

  .st-quote__author + .st-quote__source::before {
    content: ", ";
  }

  .st-quote__source {
    font-style: italic;
  }
</style>
