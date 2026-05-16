<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type HeaderProps = Omit<HTMLAttributes<HTMLElement>, "class"> & {
    title?: string;
    label?: string;
    sticky?: boolean;
    class?: string;
    logo?: Snippet;
    navigation?: Snippet;
    actions?: Snippet;
    children?: Snippet;
  };

  let {
    title,
    label = "Application header",
    sticky = true,
    class: className,
    logo,
    navigation,
    actions,
    children,
    ...rest
  }: HeaderProps = $props();

  const classes = () =>
    ["st-header", sticky ? "st-header--sticky" : null, className].filter(Boolean).join(" ");
</script>

<header {...rest} class={classes()} aria-label={label}>
  <div class="st-header__leading">
    {#if logo}
      <span class="st-header__logo">{@render logo()}</span>
    {/if}
    {#if title}
      <span class="st-header__title">{title}</span>
    {/if}
  </div>
  {#if navigation}
    <nav class="st-header__navigation" aria-label="Primary">
      {@render navigation()}
    </nav>
  {/if}
  {#if actions}
    <div class="st-header__actions">
      {@render actions()}
    </div>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</header>

<style>
  .st-header {
    align-items: center;
    background: var(--st-component-header-background, var(--st-semantic-surface-default));
    border-bottom: 1px solid var(--st-component-header-border, var(--st-semantic-border-subtle));
    box-shadow: var(--st-component-header-shadow, 0 1px 3px rgb(15 23 42 / 0.06));
    color: var(--st-component-header-text, var(--st-semantic-text-primary));
    display: flex;
    gap: var(--st-spacing-4, 1rem);
    height: var(--st-component-header-height, 3.5rem);
    padding: 0 var(--st-spacing-4, 1rem);
    width: 100%;
    z-index: var(--st-component-header-zIndex, 70);
  }

  .st-header--sticky {
    position: sticky;
    top: 0;
  }

  .st-header__leading {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .st-header__logo {
    align-items: center;
    color: var(--st-component-header-logoText, var(--st-semantic-text-primary));
    display: inline-flex;
  }

  .st-header__title {
    color: var(--st-component-header-titleText, var(--st-semantic-text-primary));
    font-size: 0.9375rem;
    font-weight: 650;
    letter-spacing: -0.005em;
    line-height: 1.2;
  }

  .st-header__navigation {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    justify-content: center;
    min-width: 0;
  }

  .st-header__actions {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    gap: var(--st-spacing-2, 0.5rem);
    margin-left: auto;
  }

  /*
   * When no navigation snippet is provided, the actions area still flushes
   * to the right because flex:1 leading + auto margin keep the layout balanced.
   */
</style>
