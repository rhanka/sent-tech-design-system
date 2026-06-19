<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type LinkItem = { label: string; href: string };
  type ColumnItem = { title?: string; links: LinkItem[] };

  type FooterProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    /** Texte de copyright (bas de pied de page). */
    copyright?: string;
    /** aria-label de la région contentinfo. */
    label?: string;
    class?: string;
    /** Marque / logo : Snippet OU chaîne de texte. */
    brand?: Snippet | string;
    /** Colonnes de liens : Snippet OU tableau de données. */
    columns?: Snippet | ColumnItem[];
    /** Liens légaux : Snippet OU tableau de données. */
    legal?: Snippet | LinkItem[];
    /** Alias data-driven pour les liens légaux (parité React). */
    legalLinks?: LinkItem[];
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
    legalLinks,
    children,
    ...rest
  }: FooterProps = $props();

  const isSnippet = (v: unknown): v is Snippet => typeof v === "function";

  // Résoudre la zone légale : prop `legal` OU prop `legalLinks`
  const resolvedLegal = $derived(legal ?? legalLinks);

  const classes = () => ["st-footer", className].filter(Boolean).join(" ");
  const hasTop = () => Boolean(brand || columns);
  const hasBottom = () => Boolean(copyright || resolvedLegal);
</script>

<footer {...rest} class={classes()} aria-label={label}>
  {#if hasTop()}
    <div class="st-footer__top">
      {#if brand}
        <div class="st-footer__brand">
          {#if isSnippet(brand)}
            {@render brand()}
          {:else}
            {brand}
          {/if}
        </div>
      {/if}
      {#if columns}
        <div class="st-footer__columns">
          {#if isSnippet(columns)}
            {@render columns()}
          {:else if Array.isArray(columns)}
            {#each columns as col}
              <nav>
                {#if col.title}<h2 class="st-footer__col-title">{col.title}</h2>{/if}
                <ul class="st-footer__col-links">
                  {#each col.links as link}
                    <li><a href={link.href}>{link.label}</a></li>
                  {/each}
                </ul>
              </nav>
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if hasBottom()}
    <div class="st-footer__bottom">
      {#if copyright}
        <span class="st-footer__copyright">{copyright}</span>
      {/if}
      {#if resolvedLegal}
        <nav class="st-footer__legal" aria-label="Liens légaux">
          {#if isSnippet(resolvedLegal)}
            {@render resolvedLegal()}
          {:else if Array.isArray(resolvedLegal)}
            {#each resolvedLegal as link}
              <a href={link.href}>{link.label}</a>
            {/each}
          {/if}
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

  .st-footer__col-title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 var(--st-spacing-2, 0.5rem);
    color: var(--st-semantic-text-primary);
  }

  .st-footer__col-links {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-2, 0.5rem);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-footer__col-links a {
    color: inherit;
    font-size: 0.875rem;
    text-decoration: none;
  }

  .st-footer__col-links a:hover {
    text-decoration: underline;
  }
</style>
