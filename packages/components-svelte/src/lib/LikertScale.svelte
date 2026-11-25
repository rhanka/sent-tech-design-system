<script lang="ts" module>
  export interface LikertScaleOption {
    value: string;
    label: string;
    stepBadge?: string;
    description?: string;
    disabled?: boolean;
  }

  export type LikertScaleLayout = "auto" | "stacked" | "horizontal";

  export type LikertScaleKind = "ordinal" | "bipolar";

  export interface LikertScaleProps {
    /** Shared radio group name. */
    name: string;
    /** Question or scale legend. */
    legend: string;
    /** Ordered scale steps (4 to 7 recommended). */
    options: LikertScaleOption[];
    /** Ordinal (1..N) or symmetric bipolar (e.g. --, -, 0, +, ++) scale. */
    scaleKind?: LikertScaleKind;
    /** Option value representing the neutral midpoint on a bipolar scale. */
    neutralOptionId?: string;
    /** Option values (e.g. "I don't know") visually separated from the main scale inside the same radiogroup. */
    nonSubstantive?: string[];
    /** Low-end pole label. */
    minLabel?: string;
    /** High-end pole label. */
    maxLabel?: string;
    /** Responsive layout strategy: auto switches <=5 short steps to horizontal at >= 600px. */
    layout?: LikertScaleLayout;
    /** Selected option value (bindable or controlled). */
    value?: string;
    helperText?: string;
    errorText?: string;
    required?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    class?: string;
    onchange?: (value: string) => void;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLFieldSetElement>, "class" | "onchange"> & LikertScaleProps;

  let {
    name,
    legend,
    options,
    scaleKind = "ordinal",
    neutralOptionId,
    nonSubstantive = [],
    minLabel,
    maxLabel,
    layout = "auto",
    value = $bindable<string | undefined>(undefined),
    helperText,
    errorText,
    required = false,
    invalid = false,
    disabled = false,
    class: className,
    onchange,
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const helpId = `${uid}-help`;
  const errorId = `${uid}-error`;

  const nonSubSet = $derived(new Set(nonSubstantive));
  const substantiveOptions = $derived(options.filter((o) => !nonSubSet.has(o.value)));
  const nonSubstantiveOptions = $derived(options.filter((o) => nonSubSet.has(o.value)));

  const isInvalid = $derived(invalid || Boolean(errorText));
  const describedBy = $derived(
    [
      rest["aria-describedby"],
      helperText ? helpId : null,
      errorText ? errorId : null
    ]
      .filter(Boolean)
      .join(" ") || undefined
  );

  const canGoHorizontal = $derived(
    layout === "horizontal" ||
      (layout === "auto" &&
        substantiveOptions.length <= 5 &&
        substantiveOptions.every((o) => o.label.trim().length <= 22))
  );

  const classes = $derived(
    [
      "st-likert",
      scaleKind === "bipolar" ? "st-likert--bipolar" : null,
      canGoHorizontal ? "st-likert--horizontal-capable" : "st-likert--stacked",
      isInvalid ? "st-likert--invalid" : null,
      className
    ]
      .filter(Boolean)
      .join(" ")
  );

  function defaultStepBadge(index: number, count: number): string {
    if (scaleKind === "bipolar") {
      if (count === 5) return ["−−", "−", "0", "+", "++"][index] ?? String(index + 1);
      if (count === 7) return ["−−−", "−−", "−", "0", "+", "++", "+++"][index] ?? String(index + 1);
    }
    return String(index + 1);
  }

  function escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function badgeAlreadyInLabel(badge: string, label: string): boolean {
    const trimmed = label.trim();
    const token = badge.trim();
    if (!token) return false;
    const re = new RegExp(`^${escapeRegExp(token)}(?:\\s*[·.:–—-]\\s*|\\s+|$)`);
    return re.test(trimmed);
  }

  function select(optionValue: string, optionDisabled?: boolean) {
    if (disabled || optionDisabled) return;
    if (optionValue === value) return;
    value = optionValue;
    onchange?.(optionValue);
  }
</script>

<fieldset
  role="radiogroup"
  {...rest}
  class={classes}
  {disabled}
  aria-describedby={describedBy}
  aria-invalid={isInvalid ? "true" : undefined}
  aria-required={required ? "true" : undefined}
>
  <legend class="st-likert__legend">
    {legend}{#if required}<span class="st-likert__required" aria-hidden="true"> *</span>{/if}
  </legend>

  {#if helperText}
    <p class="st-likert__help" id={helpId}>{helperText}</p>
  {/if}

  <div class="st-likert__options">
    {#each substantiveOptions as option, index (option.value)}
      {@const checked = value === option.value}
      {@const badge = option.stepBadge ?? defaultStepBadge(index, substantiveOptions.length)}
      {@const hideBadge = badgeAlreadyInLabel(badge, option.label)}
      {@const isNeutral = Boolean(neutralOptionId && option.value === neutralOptionId)}
      {@const optionDisabled = Boolean(disabled || option.disabled)}
      <label
        class="st-likert__option"
        class:st-likert__option--checked={checked}
        class:st-likert__option--neutral={isNeutral}
        class:st-likert__option--disabled={optionDisabled}
        data-neutral={isNeutral ? "true" : undefined}
        data-invalid={isInvalid ? "true" : undefined}
      >
        <input
          class="st-likert__input"
          type="radio"
          {name}
          value={option.value}
          {checked}
          disabled={optionDisabled}
          required={required || undefined}
          aria-describedby={describedBy}
          onchange={() => select(option.value, option.disabled)}
        />
        <span class="st-likert__badge" aria-hidden={hideBadge ? "true" : undefined}>{badge}</span>
        <span class="st-likert__content">
          <span class="st-likert__label">{option.label}</span>
          {#if option.description}
            <span class="st-likert__description">{option.description}</span>
          {/if}
        </span>
      </label>
    {/each}
  </div>

  {#if minLabel || maxLabel}
    <div class="st-likert__poles" aria-hidden="true">
      <span class="st-likert__pole st-likert__pole--min">{minLabel ?? ""}</span>
      <span class="st-likert__pole st-likert__pole--max">{maxLabel ?? ""}</span>
    </div>
  {/if}

  {#if nonSubstantiveOptions.length > 0}
    <div class="st-likert__nonSubstantive">
      {#each nonSubstantiveOptions as option (option.value)}
        {@const checked = value === option.value}
        {@const optionDisabled = Boolean(disabled || option.disabled)}
        <label
          class="st-likert__option st-likert__option--nonSubstantive"
          class:st-likert__option--checked={checked}
          class:st-likert__option--disabled={optionDisabled}
          data-non-substantive="true"
          data-invalid={isInvalid ? "true" : undefined}
        >
          <input
            class="st-likert__input"
            type="radio"
            {name}
            value={option.value}
            {checked}
            disabled={optionDisabled}
            required={required || undefined}
            aria-describedby={describedBy}
            onchange={() => select(option.value, option.disabled)}
          />
          <span class="st-likert__content">
            <span class="st-likert__label">{option.label}</span>
            {#if option.description}
              <span class="st-likert__description">{option.description}</span>
            {/if}
          </span>
        </label>
      {/each}
    </div>
  {/if}

  {#if errorText}
    <p class="st-likert__error" id={errorId} role="alert">{errorText}</p>
  {/if}
</fieldset>

<style>
  .st-likert {
    border: 0;
    container-type: inline-size;
    margin: 0;
    min-width: 0;
    padding: 0;
  }

  .st-likert__legend {
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary, #1f2437));
    font-size: var(--st-component-selection-legendFontSize, 0.9375rem);
    font-weight: 650;
    line-height: 1.3;
    padding: 0;
  }

  .st-likert__required {
    color: var(--st-component-field-errorText, var(--st-semantic-feedback-error, #dc2626));
  }

  .st-likert__help {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary, #444455));
    font-size: 0.8125rem;
    line-height: 1.4;
    margin: 0.25rem 0 0;
  }

  .st-likert__options {
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    grid-template-columns: 1fr;
    margin-top: var(--st-spacing-2, 0.5rem);
  }

  .st-likert__option {
    align-items: center;
    background: var(--st-component-card-background, var(--st-semantic-surface-default, #ffffff));
    border: var(--st-component-control-anatomy-shape-borderWidth, 1.5px)
      var(--st-component-control-anatomy-shape-borderStyle, solid)
      var(--st-component-card-border, var(--st-semantic-border-subtle, #d6d9ea));
    border-radius: var(--st-component-card-radius, var(--st-component-control-radius, 0.5rem));
    box-sizing: border-box;
    color: var(--st-component-field-labelText, var(--st-semantic-text-primary, #1f2437));
    cursor: var(--st-cursor-interactive, pointer);
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    grid-template-columns: auto auto 1fr;
    min-height: 3rem;
    padding: 0.75rem 1rem;
    transition:
      background-color var(--st-motion-fast, 150ms) var(--st-motion-easing, ease),
      border-color var(--st-motion-fast, 150ms) var(--st-motion-easing, ease),
      box-shadow var(--st-motion-fast, 150ms) var(--st-motion-easing, ease);
    width: 100%;
  }

  .st-likert__option:hover:not(.st-likert__option--disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle, #f3f4fb));
    border-color: var(--st-component-control-hoverBorder, var(--st-semantic-border-strong, #01055e));
  }

  .st-likert__option--checked {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle, #f3f4fb));
    border-color: var(--st-component-selection-checkedBackground, var(--st-semantic-border-interactive, #01055e));
    box-shadow: 0 0 0 1px
      var(--st-component-selection-checkedBackground, var(--st-semantic-border-interactive, #01055e));
  }

  .st-likert__option:has(.st-likert__input:focus-visible) {
    outline: var(--st-component-control-anatomy-focus-outline, none);
    outline-offset: var(--st-component-control-anatomy-focus-offset, 0);
    box-shadow: var(--st-component-control-anatomy-focus-boxShadow,
      0 0 0 2px var(--st-component-control-focusRing, var(--st-semantic-border-interactive, #01055e)));
  }

  .st-likert__option[data-invalid="true"] {
    border-color: var(--st-component-control-invalidBorder, var(--st-semantic-feedback-error, #dc2626));
  }

  .st-likert__option--disabled {
    background: var(--st-component-control-disabledBackground, var(--st-semantic-surface-subtle, #f3f4fb));
    color: var(--st-component-control-disabledText, var(--st-semantic-text-muted, #6b7280));
    cursor: var(--st-cursor-disabled, not-allowed);
    opacity: 0.65;
  }

  .st-likert__input {
    accent-color: var(--st-component-selection-checkedBackground, var(--st-semantic-action-primary, #01055e));
    cursor: inherit;
    height: 1.25rem;
    margin: 0;
    width: 1.25rem;
  }

  .st-likert__input:focus-visible {
    box-shadow: none;
    outline: none;
  }

  .st-likert__badge {
    align-items: center;
    background: var(--st-component-tag-neutralBackground, var(--st-semantic-surface-subtle, #f3f4fb));
    border-radius: var(--st-component-badge-radius, 0.5rem);
    color: var(--st-component-tag-neutralText, var(--st-semantic-action-primary, #01055e));
    display: inline-flex;
    font-size: var(--st-component-badge-fontSize, 0.8125rem);
    font-variant-numeric: tabular-nums;
    font-weight: var(--st-component-badge-fontWeight, 650);
    justify-content: center;
    min-height: 1.75rem;
    min-width: 1.75rem;
    padding: 0 0.375rem;
  }

  .st-likert__option--checked .st-likert__badge {
    background: var(--st-component-selection-checkedBackground, var(--st-semantic-action-primary, #01055e));
    color: var(--st-component-selection-checkedText, var(--st-semantic-action-primaryText, #ffffff));
  }

  .st-likert__content {
    display: grid;
    gap: 0.125rem;
    min-width: 0;
  }

  .st-likert__label {
    color: var(--st-component-selection-choiceLabelColor, inherit);
    font-size: var(--st-component-selection-choiceLabelFontSize, 0.9375rem);
    line-height: var(--st-component-selection-choiceRadioLineHeight,
      var(--st-component-selection-choiceLabelLineHeight, 1.4));
  }

  .st-likert__description {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary, #444455));
    font-size: 0.8125rem;
    line-height: 1.4;
  }

  .st-likert__poles {
    color: var(--st-component-field-helpText, var(--st-semantic-text-secondary, #444455));
    display: flex;
    flex-wrap: wrap;
    font-size: 0.8125rem;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
    margin-top: var(--st-spacing-2, 0.5rem);
  }

  .st-likert__pole--max {
    text-align: end;
  }

  .st-likert__error {
    color: var(--st-component-field-errorText, var(--st-semantic-feedback-error, #dc2626));
    font-size: 0.8125rem;
    line-height: 1.4;
    margin: var(--st-spacing-2, 0.5rem) 0 0;
  }

  .st-likert__option--neutral:not(.st-likert__option--checked) {
    background: var(--st-semantic-surface-subtle, #f3f4fb);
  }

  .st-likert__nonSubstantive {
    border-top: 1px dashed var(--st-semantic-border-subtle, #d6d9ea);
    display: grid;
    gap: var(--st-spacing-2, 0.5rem);
    margin-top: var(--st-spacing-3, 0.75rem);
    padding-top: var(--st-spacing-3, 0.75rem);
  }

  .st-likert__option--nonSubstantive {
    background: var(--st-semantic-surface-subtle, #f3f4fb);
    grid-template-columns: auto 1fr;
  }

  @container (min-width: 600px) {
    .st-likert--horizontal-capable .st-likert__options {
      grid-auto-columns: minmax(0, 1fr);
      grid-auto-flow: column;
      grid-template-columns: none;
    }

    .st-likert--horizontal-capable .st-likert__options .st-likert__option {
      align-content: start;
      gap: var(--st-spacing-2, 0.5rem);
      grid-template-columns: 1fr;
      justify-items: center;
      min-height: 4.5rem;
      padding: 0.75rem 0.5rem;
      text-align: center;
    }
  }
</style>
