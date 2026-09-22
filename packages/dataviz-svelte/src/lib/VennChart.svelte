<script lang="ts" module>
  import type { VennChartArea } from '@sentropic/design-system-svelte';

  export type VennChartProps = {
    areas: VennChartArea[];
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { VennChart as DsVennChart } from '@sentropic/design-system-svelte';

  let {
    areas,
    width,
    height,
    label,
    class: className,
  }: VennChartProps = $props();
</script>

<DsVennChart
  data={areas}
  {label}
  {width}
  {height}
  class={className}
/>
