<!--
  TabbedExample — un exemple documentaire « par onglet de framework ».

  Layout choisi par l'owner (pas d'empilement des 3 rendus) :
    1. titre optionnel ;
    2. barre d'onglets [Svelte | React | Vue] ;
    3. UN SEUL rendu affiché à la fois (celui de l'onglet actif) ;
    4. un <details> « Voir le code (<fw>) » dépliable montrant le code de
       l'exemple dans le framework de l'onglet actif.

  L'onglet actif EST l'état global unique (framework.value), lui-même reflété
  dans l'URL `?framework=` (cf. +layout.svelte). Cliquer un onglet bascule donc
  TOUTES les démos de la page + le switcher du header + la route, en un seul état
  partagé (pas d'override local divergent).

  Rendus :
    • svelte → inline via SvelteNode (aucune île, aucun coût runtime) ;
    • react  → île montée via react-island (createRoot) ;
    • vue    → île montée via vue-island (createApp).
  Les îles React/Vue sont strictement client (import dynamique, garde browser,
  montage en $effect) ; une seule île est montée à la fois et démontée proprement
  au changement d'onglet.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { framework, FRAMEWORKS, type FrameworkId } from "$lib/framework.svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "./examples";
  import type { IslandHandle } from "./react-island";
  import { nodeToCode } from "./nodeToCode";
  import SvelteNode from "./SvelteNode.svelte";

  let { nodes, title }: { nodes: NodeSpec[]; title?: string } = $props();

  const fr = $derived(locale.value === "fr");

  // Onglet actif = état global unique (route-backed). Pas de copie locale.
  const active = $derived(framework.value);

  const fwLabel = (id: FrameworkId) =>
    FRAMEWORKS.find((entry) => entry.id === id)?.label ?? id;

  let islandHost = $state<HTMLDivElement | null>(null);

  // Montage/démontage des îles React/Vue, piloté par l'onglet actif.
  $effect(() => {
    const fw = active;
    const host = islandHost;
    const ns = nodes;
    if (!browser || !host) return;
    if (fw === "svelte") return; // Svelte est rendu inline (cf. template).

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

  const code = $derived(nodeToCode(nodes, active));
  const codeOpenLabel = $derived(
    fr ? `Voir le code (${fwLabel(active)})` : `View code (${fwLabel(active)})`
  );

  let copied = $state(false);
  async function copyCode() {
    if (!browser || !code) return;
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => (copied = false), 1600);
    } catch {
      copied = false;
    }
  }
</script>

<section class="tex" aria-label={title}>
  {#if title}
    <h3 class="tex__title">{title}</h3>
  {/if}

  <div class="tex__tabs" role="tablist" aria-label={fr ? "Framework" : "Framework"}>
    {#each FRAMEWORKS as fw (fw.id)}
      <button
        type="button"
        role="tab"
        class="tex__tab"
        class:tex__tab--active={active === fw.id}
        data-framework={fw.id}
        aria-selected={active === fw.id}
        onclick={() => (framework.value = fw.id)}
      >
        <span class="tex__dot" aria-hidden="true"></span>
        {fw.label}
      </button>
    {/each}
  </div>

  <div class="tex__stage">
    {#if active === "svelte"}
      <div class="tex__render">
        {#each nodes as node, i (i)}
          <SvelteNode {node} />
        {/each}
      </div>
    {:else}
      <!-- Hôte d'île React/Vue : rempli côté client uniquement. -->
      <div class="tex__render" bind:this={islandHost}></div>
    {/if}
  </div>

  <details class="tex__code">
    <summary class="tex__code-summary">{codeOpenLabel}</summary>
    <div class="tex__code-body">
      <button type="button" class="tex__copy" onclick={copyCode}>
        {#if copied}
          {fr ? "Copié" : "Copied"}
        {:else}
          {fr ? "Copier" : "Copy"}
        {/if}
      </button>
      <pre class="tex__pre"><code>{code}</code></pre>
    </div>
  </details>
</section>

<style>
  .tex {
    border: 1px solid var(--docs-line, #e2e8f0);
    border-radius: 0.75rem;
    /* visible: les menus/overlays absolus des composants (combobox, dropdown,
       date-picker, select, menu...) doivent pouvoir déborder du cadre sans être
       coupés. Le clip du radius est reporté sur les blocs internes qui en ont besoin. */
    overflow: visible;
    background: #ffffff;
    margin-bottom: 1.5rem;
  }

  .tex__title {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
    padding: 0.75rem 1rem 0;
    color: var(--docs-ink, #0f172a);
  }

  .tex__tabs {
    display: flex;
    gap: 0.25rem;
    padding: 0.75rem 1rem 0;
  }

  .tex__tab {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-bottom: none;
    border-radius: 0.5rem 0.5rem 0 0;
    color: var(--docs-muted, #475569);
    cursor: pointer;
    display: inline-flex;
    font-size: 0.78rem;
    font-weight: 600;
    gap: 0.4rem;
    letter-spacing: 0.01em;
    padding: 0.4rem 0.75rem;
  }

  .tex__tab:hover {
    color: var(--docs-ink, #0f172a);
  }

  .tex__tab--active {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border-color: var(--docs-line, #e2e8f0);
    color: var(--docs-ink, #0f172a);
  }

  .tex__dot {
    background: #ff3e00; /* Svelte */
    border-radius: 50%;
    height: 0.5rem;
    width: 0.5rem;
  }

  .tex__tab[data-framework="react"] .tex__dot {
    background: #149eca;
  }

  .tex__tab[data-framework="vue"] .tex__dot {
    background: #42b883;
  }

  .tex__stage {
    border-top: 1px solid var(--docs-line, #e2e8f0);
    padding: 1.5rem;
  }

  .tex__render {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .tex__stage :global(.fp-row) {
    /* Top-align: dans une rangée de champs de hauteurs inegales (label seul vs
       label+aide vs label+erreur), center decalait le champ court vers le bas.
       flex-start aligne les controles par le haut (Lot INP). */
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
  }

  .tex__stage :global(.fp-stack) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .tex__stage :global(.fp-card-title) {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.35rem;
  }

  .tex__stage :global(.fp-card-text) {
    color: var(--docs-muted, #475569);
    font-size: 0.9rem;
    margin: 0;
  }

  .tex__code {
    border-top: 1px solid var(--docs-line, #e2e8f0);
  }

  .tex__code-summary {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    color: var(--docs-ink, #0f172a);
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    list-style: none;
    padding: 0.55rem 0.9rem;
    user-select: none;
  }

  .tex__code-summary::-webkit-details-marker {
    display: none;
  }

  .tex__code-summary::before {
    content: "▸";
    display: inline-block;
    margin-right: 0.4rem;
    transition: transform 120ms ease;
  }

  .tex__code[open] .tex__code-summary::before {
    transform: rotate(90deg);
  }

  .tex__code-body {
    position: relative;
  }

  .tex__copy {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 0.35rem;
    color: #e2e8f0;
    cursor: pointer;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    position: absolute;
    right: 0.6rem;
    top: 0.6rem;
    z-index: 1;
  }

  .tex__copy:hover {
    background: rgba(255, 255, 255, 0.16);
  }

  .tex__pre {
    background: #0f172a;
    color: #e2e8f0;
    font-size: 0.82rem;
    line-height: 1.55;
    margin: 0;
    overflow-x: auto;
    padding: 1rem 1.1rem;
  }

  .tex__pre code {
    font-family: var(--st-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    white-space: pre;
  }
</style>
