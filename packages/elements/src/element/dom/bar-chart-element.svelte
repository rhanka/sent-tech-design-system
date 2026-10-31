<!--
  The `<st-bar-chart>` wrapper (§6.2): the §5.1 plain-data pilot, rendered
  by the Svelte `BarChart` compiled into the CORE chunk (§6.6). The envelope
  arrives through the `envelope` JS property or a child JSON island; the L1
  validator refuses it into the §4.5 panel; the component's selection
  callbacks leave ONLY as the §4.6 `st-intent` event. The theme is set on
  this internal root (§6.3) from the host configuration (§6.5), never from
  the envelope.
-->
<svelte:options customElement={{ tag: "st-bar-chart", shadow: "open" }} />
<script lang="ts">
  import { onMount } from "svelte";
  import { BarChart } from "./bar-chart-source.js";
  import { createElementRuntime, type HostConfig } from "./element-runtime.svelte.js";
  import { themedRoot, themeIdOf, colorModeOf } from "./element-action.js";
  import { envelopeIslandInput, readHostConfigIsland } from "./input.js";
  import { dispatchIntent } from "./intents.js";
  import ErrorPanel from "./error-panel.svelte";

  let { envelope, hostConfig }: { envelope?: unknown; hostConfig?: HostConfig } = $props();

  const runtime = createElementRuntime("BarChart");

  let themedNode: HTMLElement | undefined = $state();
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
  bind:this={themedNode}
  data-st-theme={themeIdOf(effectiveHostConfig?.theme)}
  data-color-mode={colorModeOf(effectiveHostConfig?.colorScheme)}
  use:themedRoot={{ runtime, theme: effectiveHostConfig?.theme, colorScheme: effectiveHostConfig?.colorScheme }}
  use:envelopeIslandInput={{ apply: (value) => (islandEnvelope = value) }}
>
  {#if runtime.state === "refused"}
    <ErrorPanel diagnostics={runtime.diagnostics} />
  {:else if runtime.payload?.kind === "bar-chart"}
    <BarChart
      {...runtime.payload.props}
      onSelect={(key) => {
        if (themedNode !== undefined) dispatchIntent(themedNode, "select", key);
      }}
      onSelectKey={(key) => {
        if (key !== null && themedNode !== undefined) dispatchIntent(themedNode, "select", key);
      }}
    />
  {/if}
</div>

<style>
  .st-element__root {
    display: block;
  }
</style>
