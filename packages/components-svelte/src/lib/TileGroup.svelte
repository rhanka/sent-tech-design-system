<script lang="ts" module>
  export interface TileGroupItem {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type TileGroupProps = Omit<
    HTMLAttributes<HTMLFieldSetElement>,
    "class" | "onchange"
  > & {
    items: TileGroupItem[];
    value?: string;
    name?: string;
    legend?: string;
    legendHidden?: boolean;
    disabled?: boolean;
    class?: string;
    onchange?: (value: string) => void;
  };

  let {
    items,
    value = $bindable<string | undefined>(undefined),
    name,
    legend,
    legendHidden = false,
    disabled = false,
    class: className,
    onchange,
    ...rest
  }: TileGroupProps = $props();

  const groupId = $props.id();
  const groupName = $derived(name ?? `st-tileGroup-${groupId}`);

  const classes = () =>
    ["st-tileGroup", disabled ? "st-tileGroup--disabled" : null, className]
      .filter(Boolean)
      .join(" ");

  function select(next: string, itemDisabled?: boolean) {
    if (disabled || itemDisabled) return;
    value = next;
    onchange?.(next);
  }
</script>

<fieldset {...rest} class={classes()} {disabled}>
  {#if legend}
    <legend class={legendHidden ? "st-tileGroup__legend st-tileGroup__legend--hidden" : "st-tileGroup__legend"}
    >{legend}</legend>
  {/if}
  <div class="st-tileGroup__items">
    {#each items as item (item.value)}
      {@const checked = value === item.value}
      <label
        class="st-tileGroup__tile"
        class:st-tileGroup__tile--checked={checked}
        class:st-tileGroup__tile--disabled={item.disabled || disabled}
      >
        <input
          type="radio"
          class="st-tileGroup__input"
          name={groupName}
          value={item.value}
          {checked}
          disabled={item.disabled || disabled}
          onchange={() => select(item.value, item.disabled)}
        />
        <span class="st-tileGroup__content">
          <span class="st-tileGroup__label">{item.label}</span>
          {#if item.description}
            <span class="st-tileGroup__description">{item.description}</span>
          {/if}
        </span>
      </label>
    {/each}
  </div>
</fieldset>

<style>
  .st-tileGroup {
    border: 0;
    color: var(--st-semantic-text-primary);
    margin: 0;
    min-width: 0;
    padding: 0;
  }

  .st-tileGroup__legend {
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary));
    font-weight: 600;
    margin-block-end: var(--st-spacing-2, 0.5rem);
    padding: 0;
  }

  .st-tileGroup__legend--hidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .st-tileGroup__items {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  }

  .st-tileGroup__tile {
    background: var(--st-component-card-background, var(--st-semantic-surface-raised));
    border: 1px solid
      var(--st-component-card-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-card-radius, 0.5rem);
    cursor: pointer;
    display: grid;
    gap: 0.5rem;
    grid-template-columns: auto 1fr;
    padding: 0.875rem 1rem;
    transition:
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-tileGroup__tile:hover:not(.st-tileGroup__tile--disabled) {
    border-color: var(
      --st-component-control-hoverBorder,
      var(--st-semantic-border-strong)
    );
  }

  .st-tileGroup__tile--checked {
    border-color: var(
      --st-component-control-focusRing,
      var(--st-semantic-border-interactive)
    );
    box-shadow: 0 0 0 1px
      var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
  }

  .st-tileGroup__tile--disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .st-tileGroup__input {
    accent-color: var(
      --st-component-control-focusRing,
      var(--st-semantic-border-interactive)
    );
    margin: 0.25rem 0 0;
  }

  .st-tileGroup__content {
    display: grid;
    gap: 0.25rem;
  }

  .st-tileGroup__label {
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .st-tileGroup__description {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary));
    font-size: 0.8125rem;
  }
</style>
