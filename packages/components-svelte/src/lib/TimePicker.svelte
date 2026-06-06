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
  let inputEl = $state<HTMLInputElement | null>(null);
  let listEl = $state<HTMLUListElement | null>(null);

  /** Index de l'option mise en évidence dans la listbox (-1 = aucune). */
  let activeIndex = $state(-1);

  const displayValue = $derived(value ? display(value) : "");

  /** Id de l'option active, consommé par aria-activedescendant. */
  const activeDescendant = $derived(
    open && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
  );

  function openList() {
    if (disabled) return;
    open = true;
    // À l'ouverture : se positionner sur la valeur sélectionnée ou la première option.
    const idx = value ? slots.indexOf(value) : -1;
    activeIndex = idx >= 0 ? idx : 0;
    // Le focus reste sur l'input (pattern aria-activedescendant).
  }

  function closeList(returnFocus = true) {
    open = false;
    activeIndex = -1;
    if (returnFocus && inputEl) {
      inputEl.focus();
    }
  }

  function toggleOpen() {
    if (disabled) return;
    if (open) {
      closeList(true);
    } else {
      openList();
    }
  }

  function pick(slot: string) {
    value = slot;
    onChange?.(slot);
    closeList(true);
  }

  /** Fait défiler la listbox pour que l'option active soit visible. */
  function scrollActiveIntoView() {
    if (!listEl || activeIndex < 0) return;
    const optEl = listEl.querySelector<HTMLElement>(`#${listId}-opt-${activeIndex}`);
    if (optEl && typeof optEl.scrollIntoView === "function") {
      optEl.scrollIntoView({ block: "nearest" });
    }
  }

  function onInputKeyDown(event: KeyboardEvent) {
    if (disabled) return;
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          // ArrowDown avec liste déjà ouverte → descendre d'une option.
          activeIndex = Math.min(activeIndex + 1, slots.length - 1);
          scrollActiveIntoView();
        }
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          // ArrowUp avec liste déjà ouverte → remonter d'une option.
          activeIndex = Math.max(activeIndex - 1, 0);
          scrollActiveIntoView();
        }
        break;
      }
      case "Home": {
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          activeIndex = 0;
          scrollActiveIntoView();
        }
        break;
      }
      case "End": {
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          activeIndex = slots.length - 1;
          scrollActiveIntoView();
        }
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          // Enter / Space sur l'input avec liste déjà ouverte → sélectionner l'actif.
          if (activeIndex >= 0 && activeIndex < slots.length) {
            pick(slots[activeIndex]);
          }
        }
        break;
      }
      case "Escape": {
        if (open) {
          event.preventDefault();
          closeList(true);
        }
        break;
      }
    }
  }

  function onListKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        activeIndex = Math.min(activeIndex + 1, slots.length - 1);
        scrollActiveIntoView();
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        scrollActiveIntoView();
        break;
      }
      case "Home": {
        event.preventDefault();
        activeIndex = 0;
        scrollActiveIntoView();
        break;
      }
      case "End": {
        event.preventDefault();
        activeIndex = slots.length - 1;
        scrollActiveIntoView();
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (activeIndex >= 0 && activeIndex < slots.length) {
          pick(slots[activeIndex]);
        }
        break;
      }
      case "Escape": {
        event.preventDefault();
        closeList(true);
        break;
      }
    }
  }

  function onDocumentMouseDown(event: MouseEvent) {
    if (!open) return;
    const target = event.target as Node | null;
    if (hostEl && target && !hostEl.contains(target)) {
      closeList(false);
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
        bind:this={inputEl}
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
        aria-activedescendant={activeDescendant}
        aria-autocomplete="none"
        onclick={toggleOpen}
        onkeydown={onInputKeyDown}
      />
      <button
        type="button"
        class="st-timepicker__trigger"
        aria-label="Ouvrir la liste des horaires"
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        tabindex="-1"
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
      bind:this={listEl}
      class="st-timepicker__list"
      role="listbox"
      aria-label={label ?? "Horaires"}
      tabindex="-1"
      onkeydown={onListKeyDown}
    >
      {#each slots as slot, i (slot)}
        <li role="presentation">
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- Faux positif : la navigation clavier est gérée par le combobox via
               aria-activedescendant + onkeydown sur le listbox parent (onListKeyDown).
               Les options n'ont pas besoin de leur propre gestionnaire keydown. -->
          <div
            id="{listId}-opt-{i}"
            class="st-timepicker__option"
            class:st-timepicker__option--selected={slot === value}
            class:st-timepicker__option--active={i === activeIndex}
            role="option"
            aria-selected={slot === value ? "true" : "false"}
            tabindex="-1"
            onmousedown={(e) => { e.preventDefault(); }}
            onclick={() => { pick(slot); }}
            onmouseenter={() => { activeIndex = i; }}
          >
            {display(slot)}
          </div>
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

  .st-timepicker__option--active:not(.st-timepicker__option--selected) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
    outline: 2px solid var(--st-component-control-focusRing, var(--st-semantic-border-interactive));
    outline-offset: -2px;
  }
</style>
