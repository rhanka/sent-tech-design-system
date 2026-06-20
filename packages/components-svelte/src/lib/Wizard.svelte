<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface WizardStep {
    label: string;
    description?: string;
  }

  export type WizardProps = {
    stepperLabel?: string;
    steps: WizardStep[];
    currentStep?: number;
    stepTitle: string;
    cancelLabel?: string;
    backLabel?: string;
    nextLabel?: string;
    finishLabel?: string;
    isLast?: boolean;
    children?: Snippet;
    oncancel?: () => void;
    onback?: () => void;
    onnext?: () => void;
    onfinish?: () => void;
  };
</script>

<script lang="ts">
  import Stepper from "./Stepper.svelte";
  import Button from "./Button.svelte";

  let {
    stepperLabel = "Étapes",
    steps,
    currentStep = 0,
    stepTitle,
    cancelLabel = "Annuler",
    backLabel = "Retour",
    nextLabel = "Suivant",
    finishLabel = "Terminer",
    isLast = false,
    children,
    oncancel,
    onback,
    onnext,
    onfinish,
  }: WizardProps = $props();
</script>

<div class="st-wz">
  <div class="st-wz__stepper">
    <Stepper {steps} current={currentStep} label={stepperLabel} />
  </div>
  <div class="st-wz__body">
    <h3 class="st-wz__stepTitle">{stepTitle}</h3>
    {#if children}
      <div class="st-wz__content">
        {@render children()}
      </div>
    {/if}
  </div>
  <div class="st-wz__footer">
    <div class="st-wz__footerLeft">
      <Button variant="ghost" onclick={oncancel}>{cancelLabel}</Button>
    </div>
    <div class="st-wz__footerRight">
      {#if currentStep > 0}
        <Button variant="secondary" onclick={onback}>{backLabel}</Button>
      {/if}
      {#if isLast}
        <Button variant="primary" onclick={onfinish}>{finishLabel}</Button>
      {:else}
        <Button variant="primary" onclick={onnext}>{nextLabel}</Button>
      {/if}
    </div>
  </div>
</div>

<style>
  .st-wz {
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-block-size: 100vh;
    background: var(--st-semantic-surface-default);
    color: var(--st-semantic-text-primary);
  }
  .st-wz__stepper {
    padding: var(--st-spacing-6, 1.5rem);
    border-block-end: 1px solid var(--st-semantic-border-subtle);
    background: var(--st-semantic-surface-raised);
  }
  .st-wz__body {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
    padding: var(--st-spacing-8, 2rem) var(--st-spacing-6, 1.5rem);
    overflow-y: auto;
  }
  .st-wz__stepTitle {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary);
  }
  .st-wz__content {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
  }
  .st-wz__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--st-spacing-4, 1rem) var(--st-spacing-6, 1.5rem);
    border-block-start: 1px solid var(--st-semantic-border-subtle);
    background: var(--st-semantic-surface-raised);
  }
  .st-wz__footerLeft {
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
  }
  .st-wz__footerRight {
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
  }
</style>
