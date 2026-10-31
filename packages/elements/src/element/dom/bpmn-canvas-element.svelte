<!--
  The `<st-bpmn-canvas>` wrapper (§6.2): a LAZY chunk (§6.6) — the engine
  (F1 hydration + the bpmn-canvas port) is dynamically imported only when
  this element renders, so `st-bar-chart` pages never download it. The F1
  document in the envelope is serialized to BPMN 2.0 XML by the engine, the
  canvas is mounted read-only through the engine's `render`, and the engine
  warnings (watermark, asset rule) are appended as §4.5 diagnostics. The
  contract module has no callbacks: this element emits no intent.
-->
<svelte:options customElement={{ tag: "st-bpmn-canvas", shadow: "open" }} />
<script lang="ts">
  import { onMount } from "svelte";
  import { createElementRuntime, type HostConfig } from "./element-runtime.svelte.js";
  import { themedRoot, themeIdOf, colorModeOf } from "./element-action.js";
  import { envelopeIslandInput, readHostConfigIsland } from "./input.js";
  import { renderBpmnAction } from "./render-action.js";
  import ErrorPanel from "./error-panel.svelte";

  let { envelope, hostConfig }: { envelope?: unknown; hostConfig?: HostConfig } = $props();

  const runtime = createElementRuntime("BpmnCanvas");

  let islandEnvelope = $state<unknown>(undefined);
  let islandHostConfig = $state<HostConfig | undefined>(undefined);
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
  {:else if runtime.payload?.kind === "bpmn"}
    <div class="st-element__body" use:renderBpmnAction={{ runtime }}></div>
  {/if}
</div>

<style>
  .st-element__root {
    display: block;
  }
  .st-element__body {
    min-height: 120px;
  }
</style>
