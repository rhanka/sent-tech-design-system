<script lang="ts" module>
  export interface StepperStep {
    label: string;
    description?: string;
  }

  export type StepperOrientation = "horizontal" | "vertical";
</script>

<script lang="ts">
  import { Check } from "@lucide/svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type StepperProps = Omit<HTMLAttributes<HTMLOListElement>, "class"> & {
    steps: StepperStep[];
    /** Index de l'étape courante (0-based). */
    current?: number;
    orientation?: StepperOrientation;
    /** Autorise la navigation au clic sur les étapes. */
    clickable?: boolean;
    onStepClick?: (index: number) => void;
    /** Étiquette a11y de la liste d'étapes. */
    label?: string;
    class?: string;
  };

  let {
    steps,
    current = 0,
    orientation = "horizontal",
    clickable = false,
    onStepClick,
    label = "Progression",
    class: className,
    ...rest
  }: StepperProps = $props();

  const classes = $derived(
    ["st-stepper", `st-stepper--${orientation}`, className].filter(Boolean).join(" ")
  );

  function stateOf(index: number): "complete" | "current" | "upcoming" {
    if (index < current) return "complete";
    if (index === current) return "current";
    return "upcoming";
  }

  function handleClick(index: number) {
    if (!clickable) return;
    onStepClick?.(index);
  }
</script>

<ol {...rest} class={classes} aria-label={label}>
  {#each steps as step, index (index)}
    {@const state = stateOf(index)}
    {@const isLast = index === steps.length - 1}
    <li
      class={["st-stepper__step", `st-stepper__step--${state}`].join(" ")}
      aria-current={state === "current" ? "step" : undefined}
    >
      <span class="st-stepper__indicator">
        {#if clickable}
          <button
            type="button"
            class="st-stepper__circle st-stepper__circle--button"
            onclick={() => handleClick(index)}
            aria-label={step.label}
          >
            {#if state === "complete"}
              <Check size={14} strokeWidth={2.5} aria-hidden="true" />
            {:else}
              <span class="st-stepper__index">{index + 1}</span>
            {/if}
          </button>
        {:else}
          <span class="st-stepper__circle">
            {#if state === "complete"}
              <Check size={14} strokeWidth={2.5} aria-hidden="true" />
            {:else}
              <span class="st-stepper__index">{index + 1}</span>
            {/if}
          </span>
        {/if}
        {#if !isLast}
          <span class="st-stepper__connector"></span>
        {/if}
      </span>
      <span class="st-stepper__text">
        <span class="st-stepper__label">{step.label}</span>
        {#if step.description}
          <span class="st-stepper__description">{step.description}</span>
        {/if}
      </span>
    </li>
  {/each}
</ol>

<style>
  .st-stepper {
    color: var(--st-semantic-text-primary);
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .st-stepper--horizontal {
    align-items: flex-start;
    flex-direction: row;
  }

  .st-stepper--vertical {
    flex-direction: column;
  }

  .st-stepper__step {
    display: flex;
    flex: 1 1 0;
    gap: var(--st-spacing-2, 0.5rem);
    min-width: 0;
    position: relative;
  }

  .st-stepper--horizontal .st-stepper__step {
    align-items: flex-start;
    flex-direction: column;
  }

  .st-stepper--vertical .st-stepper__step {
    align-items: flex-start;
    flex: 0 0 auto;
    flex-direction: row;
  }

  .st-stepper__indicator {
    align-items: center;
    display: flex;
    flex: 0 0 auto;
    justify-content: center;
    position: relative;
  }

  .st-stepper--horizontal .st-stepper__indicator {
    flex-direction: row;
    width: 100%;
  }

  .st-stepper--vertical .st-stepper__indicator {
    flex-direction: column;
    min-height: 3rem;
  }

  .st-stepper__circle {
    align-items: center;
    background: var(--st-semantic-surface-default);
    border: 1.5px solid var(--st-semantic-border-strong);
    border-radius: 50%;
    color: var(--st-semantic-text-secondary);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.75rem;
    font-weight: 600;
    height: 1.5rem;
    justify-content: center;
    line-height: 1;
    width: 1.5rem;
    z-index: 1;
  }

  .st-stepper__circle--button {
    cursor: pointer;
    font: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0;
    transition:
      background var(--st-motion-fast, 120ms) var(--st-motion-easing, ease),
      border-color var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-stepper__circle--button:hover {
    border-color: var(--st-semantic-action-primary);
  }

  .st-stepper__circle--button:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive, var(--st-semantic-action-primary));
    outline-offset: 2px;
  }

  .st-stepper__index {
    line-height: 1;
  }

  .st-stepper__connector {
    background: var(--st-semantic-border-subtle);
    flex: 1 1 auto;
  }

  .st-stepper--horizontal .st-stepper__connector {
    height: 2px;
    margin-top: calc(0.75rem - 1px);
  }

  .st-stepper--vertical .st-stepper__connector {
    margin-left: calc(0.75rem - 1px);
    min-height: 1.5rem;
    width: 2px;
  }

  .st-stepper__text {
    display: grid;
    gap: 0.125rem;
    min-width: 0;
  }

  .st-stepper--horizontal .st-stepper__text {
    padding-right: var(--st-spacing-3, 0.75rem);
    padding-top: var(--st-spacing-2, 0.5rem);
  }

  .st-stepper--vertical .st-stepper__text {
    padding-bottom: var(--st-spacing-3, 0.75rem);
  }

  .st-stepper__label {
    color: var(--st-semantic-text-primary);
    font-size: 0.875rem;
    font-weight: 600;
  }

  .st-stepper__description {
    color: var(--st-semantic-text-secondary);
    font-size: 0.8125rem;
  }

  /* State: complete */
  .st-stepper__step--complete .st-stepper__circle {
    background: var(--st-semantic-action-primary);
    border-color: var(--st-semantic-action-primary);
    color: var(--st-semantic-action-primaryText);
  }

  .st-stepper__step--complete .st-stepper__connector {
    background: var(--st-semantic-action-primary);
  }

  /* State: current */
  .st-stepper__step--current .st-stepper__circle {
    border-color: var(--st-semantic-action-primary);
    color: var(--st-semantic-action-primary);
  }

  .st-stepper__step--current .st-stepper__label {
    color: var(--st-semantic-action-primary);
  }
</style>
