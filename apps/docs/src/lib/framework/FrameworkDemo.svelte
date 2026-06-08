<!--
  FrameworkDemo — rend une démo inline dans le framework ACTIF (Svelte/React/Vue).

  Version allégée de FrameworkPreview, sans le chrome (barre, snippet) : sert à
  faire basculer TOUTES les démos d'une page composant, pas seulement le bloc
  « Aperçu live ». Même arbre NodeSpec partagé par les 3 moteurs.
    • svelte → rendu inline via SvelteNode.
    • react  → île montée via createRoot.
    • vue    → île montée via createApp.
  Les îles React/Vue sont strictement client (import dynamique + garde browser).
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { framework } from "$lib/framework.svelte";
  import type { NodeSpec } from "./examples";
  import type { IslandHandle } from "./react-island";
  import SvelteNode from "./SvelteNode.svelte";

  let { nodes, label }: { nodes: NodeSpec[]; label?: string } = $props();

  const active = $derived(framework.value);
  let islandHost = $state<HTMLDivElement | null>(null);

  $effect(() => {
    const fw = active;
    const host = islandHost;
    const ns = nodes;
    if (!browser || !host) return;
    if (fw === "svelte") return;

    let handle: IslandHandle | null = null;
    let disposed = false;

    const mount = async () => {
      if (fw === "react") {
        const { mountReactIsland } = await import("./react-island");
        if (disposed) return;
        handle = await mountReactIsland(host, ns);
      } else if (fw === "vue") {
        const { mountVueIsland } = await import("./vue-island");
        if (disposed) return;
        handle = await mountVueIsland(host, ns);
      }
      if (disposed) handle?.unmount();
    };

    void mount();

    return () => {
      disposed = true;
      handle?.unmount();
      handle = null;
    };
  });
</script>

{#if active === "svelte"}
  <div class="docs-example" aria-label={label}>
    {#each nodes as node, i (i)}
      <SvelteNode {node} />
    {/each}
  </div>
{:else}
  <!-- Hôte d'île React/Vue : rempli côté client uniquement. Garde la mise en page
       flex de .docs-example pour que les éléments rendus s'alignent comme en Svelte. -->
  <div class="docs-example" aria-label={label} bind:this={islandHost}></div>
{/if}
