<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type FooterProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Texte de copyright (bas de pied de page). */
    copyright?: string;
    /** aria-label de la région contentinfo. */
    label?: string;
    class?: string;
    /** Marque / logo (zone de tête, à gauche). */
    brand?: Snippet;
    /** Colonnes de liens (zone de tête). */
    columns?: Snippet;
    /** Liens légaux (barre du bas, à droite du copyright). */
    legal?: Snippet;
    /** Contenu libre additionnel sous la barre du bas. */
    children?: Snippet;
  };

  let {
    copyright,
    label = "Pied de page",
    class: className,
    brand,
    columns,
    legal,
    children,
    ...rest
  }: FooterProps = $props();

  const classes = () => ["st-footer", className].filter(Boolean).join(" ");
  const hasTop = () => Boolean(brand || columns);
  const hasBottom = () => Boolean(copyright || legal);
</script>

<footer {...rest} class={classes()} aria-label={label}>
  {#if hasTop()}
    <div class="st-footer__top">
      {#if brand}
        <div class="st-footer__brand">{@render brand()}</div>
      {/if}
      {#if columns}
        <div class="st-footer__columns">{@render columns()}</div>
      {/if}
    </div>
  {/if}

  {#if hasBottom()}
    <div class="st-footer__bottom">
      {#if copyright}
        <span class="st-footer__copyright">{copyright}</span>
      {/if}
      {#if legal}
        <nav class="st-footer__legal" aria-label="Liens légaux">
          {@render legal()}
        </nav>
      {/if}
    </div>
  {/if}

  {#if children}
    {@render children()}
  {/if}
</footer>

<style>
  .st-footer {
    background: var(--st-component-footer-background, var(--st-semantic-surface-subtle));
    border-top: 1px solid var(--st-component-footer-border, var(--st-semantic-border-subtle));
    color: var(--st-component-footer-text, var(--st-semantic-text-secondary));
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
    padding: var(--st-spacing-8, 2rem) var(--st-spacing-4, 1rem);
    width: 100%;
  }

  .st-footer__top {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-8, 2rem);
    align-items: flex-start;
    justify-content: space-between;
  }

  .st-footer__brand {
    align-items: center;
    color: var(--st-semantic-text-primary);
    display: inline-flex;
    flex: 0 0 auto;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .st-footer__columns {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-8, 2rem);
    flex: 1 1 auto;
    justify-content: flex-end;
  }

  .st-footer__bottom {
    align-items: center;
    border-top: 1px solid var(--st-semantic-border-subtle);
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-4, 1rem);
    justify-content: space-between;
    padding-top: var(--st-spacing-4, 1rem);
  }

  .st-footer__copyright {
    color: var(--st-semantic-text-muted);
    font-size: 0.8125rem;
  }

  .st-footer__legal {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-4, 1rem);
    font-size: 0.8125rem;
  }
</style>
