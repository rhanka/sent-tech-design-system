<script lang="ts" module>
  export interface LanguageOption {
    value: string;
    label: string;
  }
</script>

<script lang="ts">
  type LanguageSelectorProps = {
    /** Code de langue courant (bindable). */
    value?: string;
    options: LanguageOption[];
    /** aria-label du déclencheur. */
    label?: string;
    disabled?: boolean;
    class?: string;
    onchange?: (value: string) => void;
  };

  let {
    value = $bindable<string>(""),
    options,
    label = "Choisir la langue",
    disabled = false,
    class: className,
    onchange
  }: LanguageSelectorProps = $props();

  let open = $state(false);
  let root: HTMLDivElement | undefined = $state();

  const current = $derived(options.find((o) => o.value === value) ?? options[0]);
  const classes = () => ["st-languageSelector", className].filter(Boolean).join(" ");

  function choose(next: string) {
    value = next;
    open = false;
    onchange?.(next);
  }
</script>

<svelte:window
  onclick={(e) => {
    if (open && root && e.target instanceof Node && !root.contains(e.target)) open = false;
  }}
  onkeydown={(e) => {
    if (e.key === "Escape") open = false;
  }}
/>

<div class={classes()} bind:this={root}>
  <button
    type="button"
    class="st-languageSelector__trigger"
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-label={label}
    {disabled}
    onclick={() => (open = !open)}
  >
    <span class="st-languageSelector__current">{current?.label ?? value}</span>
    <span class="st-languageSelector__caret" class:st-languageSelector__caret--open={open} aria-hidden="true"></span>
  </button>

  {#if open}
    <ul class="st-languageSelector__menu" role="listbox" aria-label={label}>
      {#each options as option (option.value)}
        <li>
          <button
            type="button"
            class="st-languageSelector__option"
            class:st-languageSelector__option--active={option.value === value}
            role="option"
            aria-selected={option.value === value}
            onclick={() => choose(option.value)}
          >
            <span class="st-languageSelector__check" aria-hidden="true">{option.value === value ? "✓" : ""}</span>
            {option.label}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .st-languageSelector {
    display: inline-block;
    position: relative;
  }

  .st-languageSelector__trigger {
    align-items: center;
    background: var(--st-component-control-background, var(--st-semantic-surface-default));
    border: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-radius-md, 0.375rem);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 0.85rem;
    gap: var(--st-spacing-2, 0.5rem);
    padding: 0.35rem 0.6rem;
  }

  .st-languageSelector__trigger:hover:not(:disabled) {
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-languageSelector__trigger:focus-visible {
    border-color: var(--st-semantic-border-interactive);
    box-shadow: 0 0 0 2px var(--st-semantic-border-interactive);
    outline: none;
  }

  .st-languageSelector__trigger:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .st-languageSelector__caret {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid currentColor;
    display: inline-block;
    transition: transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-languageSelector__caret--open {
    transform: rotate(180deg);
  }

  .st-languageSelector__menu {
    background: var(--st-component-menu-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-menu-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-radius-md, 0.375rem);
    box-shadow: var(--st-shadow-medium, 0 8px 24px rgb(15 23 42 / 0.12));
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    list-style: none;
    margin: 0.25rem 0 0;
    min-width: 9rem;
    padding: 0.25rem;
    position: absolute;
    right: 0;
    z-index: var(--st-zindex-overlay, 80);
  }

  .st-languageSelector__option {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 0.25rem;
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    display: flex;
    font: inherit;
    font-size: 0.85rem;
    gap: 0.4rem;
    padding: 0.35rem 0.5rem;
    text-align: left;
    width: 100%;
  }

  .st-languageSelector__option:hover {
    background: var(--st-semantic-surface-subtle);
    color: var(--st-semantic-text-primary);
  }

  .st-languageSelector__option--active {
    color: var(--st-semantic-action-primary);
    font-weight: 600;
  }

  .st-languageSelector__check {
    display: inline-flex;
    justify-content: center;
    width: 0.75rem;
  }
</style>
