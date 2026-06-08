<!--
  TriRender — rend le MÊME arbre NodeSpec dans les TROIS frameworks à la fois.

  Contrairement à FrameworkPreview (qui rend un seul framework selon le switcher
  global, encore utilisé par la galerie /preview), TriRender empile trois panneaux visibles
  SIMULTANÉMENT — Svelte, React, Vue — chacun étiqueté. L'audit visuel se fait
  donc sur les trois rendus côte à côte, sans dépendre du switcher.

    • Svelte → rendu inline via SvelteNode (composants Svelte du DS).
    • React  → île montée via createRoot (@sentropic/design-system-react).
    • Vue    → île montée via createApp (@sentropic/design-system-vue).

  Les îles React/Vue sont strictement client (import dynamique, garde `browser`,
  montage en $effect, démontage propre) afin que le prerender reste vide et que
  le build adapter-static reste statique. TriRender IGNORE le switcher global :
  il rend les trois quoi qu'il arrive.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import type { NodeSpec } from "./examples";
  import type { IslandHandle } from "./react-island";
  import SvelteNode from "./SvelteNode.svelte";

  let { nodes, label }: { nodes: NodeSpec[]; label?: string } = $props();

  let reactHost = $state<HTMLDivElement | null>(null);
  let vueHost = $state<HTMLDivElement | null>(null);

  // Île React : montée/démontée côté client uniquement.
  $effect(() => {
    const host = reactHost;
    const ns = nodes;
    if (!browser || !host) return;

    let handle: IslandHandle | null = null;
    let disposed = false;

    void (async () => {
      const { mountReactIsland } = await import("./react-island");
      if (disposed) return;
      handle = await mountReactIsland(host, ns);
      if (disposed) handle?.unmount();
    })();

    return () => {
      disposed = true;
      handle?.unmount();
      handle = null;
    };
  });

  // Île Vue : montée/démontée côté client uniquement.
  $effect(() => {
    const host = vueHost;
    const ns = nodes;
    if (!browser || !host) return;

    let handle: IslandHandle | null = null;
    let disposed = false;

    void (async () => {
      const { mountVueIsland } = await import("./vue-island");
      if (disposed) return;
      handle = await mountVueIsland(host, ns);
      if (disposed) handle?.unmount();
    })();

    return () => {
      disposed = true;
      handle?.unmount();
      handle = null;
    };
  });
</script>

<div class="tri" aria-label={label}>
  <section class="tri__pane" data-framework="svelte">
    <span class="tri__label" data-framework="svelte">
      <span class="tri__dot" aria-hidden="true"></span>Svelte
    </span>
    <div class="docs-example">
      {#each nodes as node, i (i)}
        <SvelteNode {node} />
      {/each}
    </div>
  </section>

  <section class="tri__pane" data-framework="react">
    <span class="tri__label" data-framework="react">
      <span class="tri__dot" aria-hidden="true"></span>React
    </span>
    <!-- Hôte d'île React : rempli côté client uniquement. -->
    <div class="docs-example" bind:this={reactHost}></div>
  </section>

  <section class="tri__pane" data-framework="vue">
    <span class="tri__label" data-framework="vue">
      <span class="tri__dot" aria-hidden="true"></span>Vue
    </span>
    <!-- Hôte d'île Vue : rempli côté client uniquement. -->
    <div class="docs-example" bind:this={vueHost}></div>
  </section>
</div>

<style>
  .tri {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .tri__pane {
    display: grid;
    gap: 0.5rem;
  }

  .tri__label {
    align-items: center;
    color: var(--docs-muted, #475569);
    display: inline-flex;
    font-size: 0.72rem;
    font-weight: 600;
    gap: 0.4rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .tri__dot {
    background: #ff3e00; /* Svelte */
    border-radius: 50%;
    height: 0.5rem;
    width: 0.5rem;
  }

  .tri__label[data-framework="react"] .tri__dot {
    background: #149eca;
  }

  .tri__label[data-framework="vue"] .tri__dot {
    background: #42b883;
  }

  /* Compatibilité avec les exemples « pile » / « ligne » exprimés en NodeSpec
     (mêmes wrappers que le registre d'exemples : wrap() -> .fp-row,
     stack() -> .fp-stack). Permet un rollout vers des démos enveloppées. */
  .tri :global(.fp-row) {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
  }

  .tri :global(.fp-stack) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .tri :global(.fp-card-title) {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.35rem;
  }

  .tri :global(.fp-card-text) {
    color: var(--docs-muted, #475569);
    font-size: 0.9rem;
    margin: 0;
  }
</style>
