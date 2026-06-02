<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  export interface TableOfContentsItem {
    id: string;
    label: string;
    level?: number;
  }

  type TableOfContentsProps = Omit<HTMLAttributes<HTMLElement>, "class" | "items"> & {
    title?: string;
    items: TableOfContentsItem[];
    activeId?: string;
    class?: string;
  };

  const normalizeItemId = (value: string) => value.replace(/^#/, "");

  let {
    title,
    items,
    activeId = "",
    class: className,
    ...rest
  }: TableOfContentsProps = $props();

  const normalizedActive = () => normalizeItemId(activeId);
  const normalizedItems = () =>
    items.map((item) => ({
      ...item,
      id: normalizeItemId(item.id),
      level: Math.max(item.level ?? 1, 1)
    }));

  const classes = () => ["st-tableOfContents", className].filter(Boolean).join(" ");
</script>

<nav {...rest} class={classes()} aria-label={title ?? "Table des matières"}>
  {#if title}
    <p class="st-tableOfContents__title">{title}</p>
  {/if}
  <ol class="st-tableOfContents__list">
    {#each normalizedItems() as item (item.id)}
      {@const isActive = item.id === normalizedActive()}
      <li
        class="st-tableOfContents__item"
        style={`--st-tableOfContents-level:${item.level - 1}`}
      >
        <a
          class="st-tableOfContents__link"
          href={`#${item.id}`}
          aria-current={isActive ? "location" : undefined}
        >
          {item.label}
        </a>
      </li>
    {/each}
  </ol>
</nav>

<style>
  .st-tableOfContents {
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: 0.5rem;
    padding: 0.75rem 0.875rem;
  }

  .st-tableOfContents__title {
    color: var(--st-semantic-text-primary);
    font-size: 0.8125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  .st-tableOfContents__list {
    list-style: none;
    margin: 0;
    padding-left: 0;
  }

  .st-tableOfContents__item {
    padding-inline-start: calc(var(--st-tableOfContents-level) * var(--st-spacing-4, 1rem));
  }

  .st-tableOfContents__item + .st-tableOfContents__item {
    margin-top: 0.125rem;
  }

  .st-tableOfContents__link {
    color: var(--st-semantic-text-secondary);
    display: inline-block;
    padding: 0.25rem 0;
    text-decoration: none;
  }

  .st-tableOfContents__link:hover,
  .st-tableOfContents__link:focus-visible {
    color: var(--st-semantic-text-primary);
    text-decoration: underline;
    text-underline-offset: 0.15em;
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-tableOfContents__link[aria-current="location"] {
    color: var(--st-semantic-text-primary);
    font-weight: 600;
  }
</style>
