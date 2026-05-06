<script lang="ts" module>
  export interface SideNavItem {
    label: string;
    href: string;
    active?: boolean;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type SideNavProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    items: SideNavItem[];
    label?: string;
    class?: string;
  };

  let { items, label = "Navigation", class: className, ...rest }: SideNavProps = $props();
  const classes = () => ["st-sidenav", className].filter(Boolean).join(" ");
</script>

<nav {...rest} class={classes()} aria-label={label}>
  <ul>
    {#each items as item}
      <li>
        <a class:st-sidenav__link--active={item.active} href={item.href} aria-current={item.active ? "page" : undefined}>
          {item.label}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .st-sidenav {
    background: var(--st-component-sideNav-background, var(--st-semantic-surface-default));
    border-right: 1px solid var(--st-component-sideNav-border, var(--st-semantic-border-subtle));
    padding: var(--st-spacing-3, 0.75rem);
    width: var(--st-component-sideNav-width, 16rem);
  }

  .st-sidenav ul {
    display: grid;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-sidenav a {
    border-radius: var(--st-radius-small, 0.375rem);
    color: var(--st-component-sideNav-itemText, var(--st-semantic-text-secondary));
    display: block;
    padding: 0.625rem 0.75rem;
    text-decoration: none;
  }

  .st-sidenav__link--active {
    background: var(--st-component-sideNav-activeBackground, var(--st-semantic-surface-subtle));
    color: var(--st-component-sideNav-activeText, var(--st-semantic-text-primary));
    font-weight: 650;
  }
</style>
