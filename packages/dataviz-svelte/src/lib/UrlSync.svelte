<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';
  import type { UrlSyncOptions } from './url-sync.js';

  export type UrlSyncProps = {
    /** The dashboard store to deep-link to the URL query string. */
    store: DashboardStore;
    /** Sync options (param name, debounce, push/replace). */
    options?: UrlSyncOptions;
  };
</script>

<script lang="ts">
  import { useUrlSync } from './useUrlSync.js';

  let { store, options }: UrlSyncProps = $props();

  // Declarative deep-linking: wiring only, renders nothing. The binding is
  // established once during component init and lives for the component's
  // lifetime (parity with the React hook / Vue composable, where the store
  // identity is likewise captured once). Reading the initial prop values here is
  // therefore intentional.
  // svelte-ignore state_referenced_locally
  useUrlSync(store, options);
</script>
