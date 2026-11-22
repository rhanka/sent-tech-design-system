<svelte:options customElement={{ tag: "st-time-series-chart", shadow: "open" }} />
<script lang="ts">
  import { onMount } from "svelte";
  import TimeSeriesChart from "./time-series-chart.svelte";
  import { createElementRuntime, type HostConfig } from "./element-runtime.svelte.js";
  import { themedRoot, themeIdOf, colorModeOf } from "./element-action.js";
  import { envelopeIslandInput, readHostConfigIsland } from "./input.js";
  import ErrorPanel from "./error-panel.svelte";

  let { envelope, hostConfig }: { envelope?: unknown; hostConfig?: HostConfig } = $props();

  const runtime = createElementRuntime("TimeSeriesChart");

  let islandEnvelope = $state<unknown>(undefined);
  let islandHostConfig = $state<HostConfig | undefined>(undefined);
  // The island scan happens in mount effects; the ingest effect waits for it
  // so an island-provided envelope is never transiently refused as missing.
  let islandsScanned = $state(false);

  onMount(() => {
    islandHostConfig = readHostConfigIsland(globalThis.document) as HostConfig | undefined;
    islandsScanned = true;
  });

  const effectiveEnvelope = $derived(envelope ?? islandEnvelope);
  const effectiveHostConfig = $derived(hostConfig ?? islandHostConfig);

  $effect(() => {
    if (effectiveEnvelope === undefined && !islandsScanned) return;
    void runtime.ingest(effectiveEnvelope, effectiveHostConfig);
  });
</script>

<div
  class="st-element__root"
  data-st-theme={themeIdOf(effectiveHostConfig?.theme)}
  data-color-mode={colorModeOf(effectiveHostConfig?.colorScheme)}
  use:themedRoot={{ runtime, theme: effectiveHostConfig?.theme, colorScheme: effectiveHostConfig?.colorScheme }}
  use:envelopeIslandInput={{ apply: (value) => (islandEnvelope = value) }}
>
  {#if runtime.state === "refused"}
    <ErrorPanel diagnostics={runtime.diagnostics} />
  {:else if runtime.payload?.kind === "time-series-chart"}
    <TimeSeriesChart {...runtime.payload.props} />
  {/if}
</div>

<style>
  .st-element__root {
    display: block;
  }
</style>
