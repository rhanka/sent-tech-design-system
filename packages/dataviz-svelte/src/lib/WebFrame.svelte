<script lang="ts" module>
  import type { WebFrameConfig } from '@sentropic/dataviz-core';

  export type WebFrameProps = {
    frame: WebFrameConfig;
    class?: string;
  };
</script>

<script lang="ts">
  import { resolveWebFrame } from '@sentropic/dataviz-core';

  let { frame, class: className }: WebFrameProps = $props();

  const resolved = $derived(resolveWebFrame(frame));
</script>

<iframe
  src={resolved.src}
  title={resolved.title}
  sandbox={resolved.sandbox}
  referrerpolicy={resolved.referrerPolicy}
  loading={resolved.loading}
  allow={resolved.allow}
  class={className}
></iframe>
