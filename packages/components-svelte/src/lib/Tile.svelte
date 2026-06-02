<script lang="ts" module>
  export type TileVariant = "static" | "clickable" | "selectable";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type TileProps = Omit<HTMLAttributes<HTMLElement>, "class" | "title"> & {
    /** `static` (présentation), `clickable` (lien/bouton), `selectable` (case unitaire). */
    variant?: TileVariant;
    /** Pour `clickable` : si fourni, rend un `<a>`, sinon un `<button>`. */
    href?: string;
    /** Pour `selectable` : état coché (bindable). */
    selected?: boolean;
    disabled?: boolean;
    /** Titre rapide (sinon utiliser le slot `children`). */
    title?: string;
    description?: string;
    class?: string;
    onclick?: (event: MouseEvent) => void;
    /** Pour `selectable` : notifié au changement d'état. */
    onselect?: (selected: boolean) => void;
    children?: Snippet;
  };

  let {
    variant = "static",
    href,
    selected = $bindable(false),
    disabled = false,
    title,
    description,
    class: className,
    onclick,
    onselect,
    children,
    ...rest
  }: TileProps = $props();

  const classes = () =>
    [
      "st-tile",
      `st-tile--${variant}`,
      variant === "selectable" && selected ? "st-tile--selected" : null,
      disabled ? "st-tile--disabled" : null,
      className
    ]
      .filter(Boolean)
      .join(" ");

  function toggle() {
    if (disabled) return;
    selected = !selected;
    onselect?.(selected);
  }
</script>

{#snippet body()}
  {#if children}
    {@render children()}
  {:else}
    {#if title}<span class="st-tile__title">{title}</span>{/if}
    {#if description}<span class="st-tile__description">{description}</span>{/if}
  {/if}
{/snippet}

{#if variant === "clickable" && href}
  <a {...rest} class={classes()} {href} aria-disabled={disabled} {onclick}>
    <span class="st-tile__content">{@render body()}</span>
  </a>
{:else if variant === "clickable"}
  <button {...rest} type="button" class={classes()} {disabled} {onclick}>
    <span class="st-tile__content">{@render body()}</span>
  </button>
{:else if variant === "selectable"}
  <label class={classes()}>
    <input
      type="checkbox"
      class="st-tile__input"
      checked={selected}
      {disabled}
      onchange={toggle}
    />
    <span class="st-tile__content">{@render body()}</span>
  </label>
{:else}
  <div {...rest} class={classes()}>
    <span class="st-tile__content">{@render body()}</span>
  </div>
{/if}

<style>
  .st-tile {
    background: var(--st-component-card-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-card-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-card-radius, 0.5rem);
    color: var(--st-semantic-text-primary);
    display: block;
    padding: var(--st-spacing-4, 1rem);
    text-align: left;
    text-decoration: none;
    width: 100%;
  }

  /* clickable: <a>/<button> reset + interactivity */
  a.st-tile,
  button.st-tile {
    cursor: pointer;
    font: inherit;
    transition:
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-tile--clickable:hover:not(.st-tile--disabled),
  .st-tile--selectable:hover:not(.st-tile--disabled) {
    background: var(
      --st-component-control-hoverBackground,
      var(--st-semantic-surface-subtle)
    );
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-tile--clickable:focus-visible,
  .st-tile--selectable:focus-within {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    box-shadow: 0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline: none;
  }

  .st-tile--selectable {
    align-items: start;
    cursor: pointer;
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    grid-template-columns: auto 1fr;
  }

  .st-tile--selected {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    box-shadow: 0 0 0 1px var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
  }

  .st-tile--disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .st-tile__input {
    accent-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    margin: 0.2rem 0 0;
  }

  .st-tile__content {
    display: grid;
    gap: 0.25rem;
  }

  .st-tile__title {
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .st-tile__description {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary));
    font-size: 0.8125rem;
  }
</style>
