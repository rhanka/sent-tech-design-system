<!--
  The `<st-decision-dossier>` wrapper (§6.2): a LAZY chunk (§6.6) — the Focus
  validation port AND the minimal renderer live in the `focus` engine chunk.
  L2 renders the document through the minimal lazy renderer (title, prose,
  question, option cards, outcome, amendment trace, diagram as fenced
  text); lot L6 replaces that renderer with the imposed Focus renderer
  defaults F-R0–F-R7. The single interaction — choosing an option — leaves
  as the §4.6 `choose-option` intent.
-->
<svelte:options customElement={{ tag: "st-decision-dossier", shadow: "open" }} />
<script lang="ts">
  import { onMount } from "svelte";
  import { createElementRuntime, type HostConfig } from "./element-runtime.svelte.js";
  import { themedRoot, themeIdOf, colorModeOf } from "./element-action.js";
  import { envelopeIslandInput, readHostConfigIsland } from "./input.js";
  import { renderDossierAction } from "./render-action.js";
  import ErrorPanel from "./error-panel.svelte";

  let { envelope, hostConfig }: { envelope?: unknown; hostConfig?: HostConfig } = $props();

  const runtime = createElementRuntime("DecisionDossier");

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
  {:else if runtime.payload?.kind === "dossier"}
    <div class="st-element__body" use:renderDossierAction={{ runtime }}></div>
  {/if}
</div>

<style>
  .st-element__root {
    display: block;
  }
</style>
