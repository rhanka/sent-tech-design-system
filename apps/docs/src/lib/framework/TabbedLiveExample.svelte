<!--
  TabbedLiveExample — variante INTERACTIVE de TabbedExample.

  Certaines démos (Modal, Drawer, …) sont interactives : un bouton déclencheur
  ouvre un overlay. Elles ne s'expriment pas en NodeSpec déclaratif ; on les
  écrit donc PAR FRAMEWORK (Svelte inline, React via île, Vue via île).

  Même UX d'onglets que TabbedExample :
    1. titre optionnel ;
    2. barre d'onglets [Svelte | React | Vue] ;
    3. UN SEUL framework monté à la fois (celui de l'onglet actif).

  L'onglet actif EST l'état global unique (framework.value), reflété dans l'URL
  `?framework=` (cf. +layout.svelte) : cliquer un onglet bascule toutes les démos
  de la page + le switcher du header + la route ensemble (pas d'override local).

  Comme un seul framework est monté à la fois, un seul jeu d'overlays/portails
  existe à un instant donné -> aucune superposition de modals/drawers.

  Les îles React/Vue sont strictement client (import dynamique, garde browser,
  montage en $effect) ; démontage propre au changement d'onglet.
-->
<script lang="ts">
  import type { Component } from "svelte";
  import { browser } from "$app/environment";
  import { framework, FRAMEWORKS } from "$lib/framework.svelte";
  import { locale } from "$lib/locale.svelte";
  import type { IslandHandle } from "./react-island";
  import type { LiveDemoKey } from "./live-island";
  import SvelteModalDemo from "./live-demos/svelte/ModalDemo.svelte";
  import SvelteDrawerDemo from "./live-demos/svelte/DrawerDemo.svelte";

  let { demo, title }: { demo: LiveDemoKey; title?: string } = $props();

  const fr = $derived(locale.value === "fr");

  // Registre des démos Svelte (rendues inline, aucune île).
  const SVELTE_DEMOS: Record<LiveDemoKey, Component> = {
    modal: SvelteModalDemo,
    drawer: SvelteDrawerDemo
  };
  const SvelteDemo = $derived(SVELTE_DEMOS[demo]);

  // Onglet actif = état global unique (route-backed). Pas de copie locale.
  const active = $derived(framework.value);

  let islandHost = $state<HTMLDivElement | null>(null);

  // Montage/démontage des îles React/Vue, piloté par l'onglet actif + la locale.
  $effect(() => {
    const fw = active;
    const host = islandHost;
    const key = demo;
    const isFr = fr;
    if (!browser || !host) return;
    if (fw === "svelte") return; // Svelte est rendu inline (cf. template).

    let handle: IslandHandle | null = null;
    let disposed = false;

    const mount = async () => {
      if (fw === "react") {
        const { mountReactLiveDemo } = await import("./live-island");
        if (disposed) return;
        handle = await mountReactLiveDemo(host, key, isFr);
      } else if (fw === "vue") {
        const { mountVueLiveDemo } = await import("./live-island");
        if (disposed) return;
        handle = await mountVueLiveDemo(host, key, isFr);
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

<section class="tex" aria-label={title}>
  {#if title}
    <h3 class="tex__title">{title}</h3>
  {/if}

  <div class="tex__tabs" role="tablist" aria-label="Framework">
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
      <!-- key sur (demo) : remonte la démo Svelte si la clé change. -->
      {#key demo}
        <div class="tex__render">
          <SvelteDemo />
        </div>
      {/key}
    {:else}
      <!-- Hôte d'île React/Vue : rempli côté client uniquement. -->
      <div class="tex__render" bind:this={islandHost}></div>
    {/if}
  </div>
</section>

<style>
  .tex {
    border: 1px solid var(--docs-line, #e2e8f0);
    border-radius: 0.75rem;
    /* visible: laisser les overlays/menus absolus déborder sans être coupés. */
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

  /* Rangée de boutons déclencheurs, partagée par les démos Svelte/React/Vue. */
  .tex__stage :global(.ld-row) {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
  }
</style>
