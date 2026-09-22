<script lang="ts" module>
  export type FormatNumberInputProps = {
    label: string;
    value?: number | undefined;
    min?: number | undefined;
    step?: number | undefined;
    onValue: (value: number | null) => void;
  };
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { NumberInput } from '@sentropic/design-system-svelte';

  let { label, value, min, step, onValue }: FormatNumberInputProps = $props();
  let draft = $state<number | null>(untrack(() => value ?? null));
  let ready = false;

  $effect(() => {
    const next = draft;
    if (!ready) {
      ready = true;
      return;
    }
    onValue(next);
  });
</script>

<NumberInput {label} aria-label={label} bind:value={draft} {min} {step} />
