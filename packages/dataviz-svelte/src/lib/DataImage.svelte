<script lang="ts" module>
  import type { DataImageConfig, Row } from '@sentropic/dataviz-core';

  export type DataImageProps = {
    image: DataImageConfig;
    row?: Row;
    class?: string;
  };
</script>

<script lang="ts">
  import { resolveDataImage } from '@sentropic/dataviz-core';

  let { image, row, class: className }: DataImageProps = $props();

  const resolved = $derived(resolveDataImage(image, row));
</script>

<img src={resolved.src} alt={resolved.alt} class={className} />
