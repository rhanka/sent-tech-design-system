<script lang="ts" module>
  export type TimePickerFormat = "24" | "12";
</script>

<script lang="ts">
  import { Clock } from "@lucide/svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type TimePickerProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onchange"> & {
    /** Heure courante au format "HH:mm" (24h, toujours). Vide = non renseigné. */
    value?: string;
    /** Appelé avec "HH:mm" lors d'une sélection. */
    onChange?: (value: string) => void;
    /** Pas (en minutes) entre deux créneaux générés. */
    step?: number;
    /** Borne minimale "HH:mm" (inclusive). */
    min?: string;
    /** Borne maximale "HH:mm" (inclusive). */
    max?: string;
    /** Affichage 24h (par défaut) ou 12h (AM/PM). La valeur émise reste "HH:mm". */
    format?: TimePickerFormat;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    label?: string;
    class?: string;
    id?: string;
  };

  let {
    value = "",
    onChange,
    step = 15,
    min,
    max,
    format = "24",
    size = "md",
    disabled = false,
    label,
    class: className,
    id,
    ...rest
  }: TimePickerProps = $props();

  const fieldId = $derived(id ?? `st-timepicker-${Math.random().toString(36).slice(2, 9)}`);
  const listId = $derived(`${fieldId}-list`);

  const groupClasses = $derived(["st-timepicker", `st-timepicker--${size}`].join(" "));

  function toMinutes(hhmm: string | undefined): number | null {
    if (!hhmm) return null;
    const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
    if (!match) return null;
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h * 60 + m;
  }

  function fromMinutes(total: number): string {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function display(hhmm: string): string {
    if (format === "24") return hhmm;
    const total = toMinutes(hhmm);
    if (total === null) return hhmm;
    const h24 = Math.floor(total / 60);
    const m = total % 60;
    const period = h24 < 12 ? "AM" : "PM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
  }

  const slots = $derived.by<string[]>(() => {
    const safeStep = step > 0 ? step : 15;
    const lower = toMinutes(min) ?? 0;
    const upper = toMinutes(max) ?? 23 * 60 + 59;
    const result: string[] = [];
    for (let t = lower; t <= upper; t += safeStep) {
      result.push(fromMinutes(t));
    }
    return result;
  });

  let open = $state(false);
  let hostEl = $state<HTMLDivElement | null>(null);

  const displayValue = $derived(value ? display(value) : "");

  function toggleOpen() {
    if (disabled) return;
    open = !open;
  }

  function pick(slot: string) {
    value = slot;
    onChange?.(slot);
    open = false;
  }

  function onPanelKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      open = false;
    }
  }

  function onDocumentMouseDown(event: MouseEvent) {
    if (!open) return;
    const target = event.target as Node | null;
    if (hostEl && target && !hostEl.contains(target)) {
      open = false;
    }
  }

  $effect(() => {
    if (typeof document === "undefined") return;
    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  });
</script>

<div class="st-field" bind:this={hostEl} {...rest}>
  <div class="st-field__control">
    {#if label}<label class="st-field__label" for={fieldId}>{label}</label>{/if}
    <span class={groupClasses}>
      <input
        id={fieldId}
        type="text"
        readonly
        class="st-timepicker__control"
        value={displayValue}
        placeholder={format === "24" ? "HH:mm" : "hh:mm AM"}
        {disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-expanded={open ? "true" : "false"}
        onclick={toggleOpen}
      />
      <button
        type="button"
        class="st-timepicker__trigger"
        aria-label="Ouvrir la liste des horaires"
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        {disabled}
        onclick={toggleOpen}
      >
        <Clock size={16} aria-hidden="true" />
      </button>
    </span>
  </div>
  {#if open}
    <ul
      id={listId}
      class="st-timepicker__list"
      role="listbox"
      aria-label={label ?? "Horaires"}
      tabindex="-1"
      onkeydown={onPanelKeyDown}
    >
      {#each slots as slot (slot)}
        <li role="presentation">
          <button
            type="button"
            class="st-timepicker__option"
            class:st-timepicker__option--selected={slot === value}
            role="option"
            aria-selected={slot === value ? "true" : "false"}
            onclick={() => pick(slot)}
          >
            {display(slot)}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .st-field {
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary));
    display: grid;
    gap: var(--st-component-field-gap, 0.5rem);
    max-width: var(--st-component-field-maxWidth, 28rem);
    position: relative;
  }

  .st-field__control {
    display: grid;
    gap: var(--st-component-field-gap, 0.5rem);
  }

  .st-field__label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .st-timepicker {
    align-items: stretch;
    background: var(--st-component-control-background, var(--st-semantic-surface-default));
    border: var(--st-component-control-anatomy-shape-borderWidth, 1px)
      var(--st-component-control-anatomy-shape-borderStyle, solid)
      var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-control-anatomy-shape-radius, 0.375rem);
    color: var(--st-component-control-text, var(--st-semantic-text-primary));
    display: inline-flex;
    overflow: hidden;
    transition:
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-timepicker--sm {
    min-height: var(--st-component-control-smHeight, 2rem);
  }

  .st-timepicker--md {
    min-height: var(--st-component-control-mdHeight, 2.5rem);
  }

  .st-timepicker--lg {
    min-height: var(--st-component-control-lgHeight, 3rem);
  }

  .st-timepicker:hover:not(:has(input:disabled)) {
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong));
  }

  .st-timepicker:focus-within {
    border-color: var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    box-shadow: var(--st-component-control-anatomy-focus-boxShadow,
      0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive)));
  }

  .st-timepicker__control {
    background: transparent;
    border: 0;
    color: inherit;
    cursor: pointer;
    flex: 1 1 auto;
    font: inherit;
    min-width: 0;
    padding: 0 0.75rem;
    width: 100%;
  }

  .st-timepicker__control:focus {
    outline: none;
  }

  .st-timepicker__control::placeholder {
    color: var(--st-component-control-placeholderText, var(--st-semantic-text-muted));
  }

  .st-timepicker__control:disabled {
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted));
    cursor: not-allowed;
  }

  .st-timepicker__trigger {
    align-items: center;
    background: transparent;
    border: 0;
    border-left: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    justify-content: center;
    min-width: 2.25rem;
    padding: 0 0.5rem;
  }

  .st-timepicker__trigger:hover:not(:disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-timepicker__trigger:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: -2px;
  }

  .st-timepicker__trigger:disabled {
    cursor: not-allowed;
  }

  .st-timepicker__list {
    background: var(--st-component-popover-background, var(--st-semantic-surface-raised));
    border: 1px solid var(--st-component-popover-border, var(--st-semantic-border-subtle));
    border-radius: var(--st-component-popover-radius, 0.5rem);
    box-shadow: var(--st-component-popover-shadow, 0 18px 45px rgb(15 23 42 / 0.18));
    list-style: none;
    margin: var(--st-spacing-1, 0.25rem) 0 0;
    max-height: 14rem;
    overflow-y: auto;
    padding: var(--st-spacing-1, 0.25rem);
    position: absolute;
    top: 100%;
    width: 100%;
    z-index: var(--st-component-popover-zIndex, 80);
  }

  .st-timepicker__option {
    background: transparent;
    border: 0;
    border-radius: var(--st-component-control-radius, 0.375rem);
    color: inherit;
    cursor: pointer;
    display: block;
    font: inherit;
    padding: var(--st-spacing-2, 0.5rem) var(--st-spacing-3, 0.75rem);
    text-align: left;
    width: 100%;
  }

  .st-timepicker__option:hover {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-timepicker__option:focus-visible {
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: -2px;
  }

  .st-timepicker__option--selected {
    background: var(--st-component-dropdown-selectedBackground, var(--st-semantic-action-primary));
    color: var(--st-component-dropdown-selectedText, var(--st-semantic-action-primaryText));
  }
</style>
