<!--
  TabbedLiveExample : variante INTERACTIVE de TabbedExample.

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
  import { framework, FRAMEWORKS, type FrameworkId } from "$lib/framework.svelte";
  import { locale } from "$lib/locale.svelte";
  import type { IslandHandle } from "./react-island";
  import type { LiveDemoKey } from "./live-island";
  import SvelteModalDemo from "./live-demos/svelte/ModalDemo.svelte";
  import SvelteDrawerDemo from "./live-demos/svelte/DrawerDemo.svelte";
  import { ContentSwitcher } from "@sentropic/design-system-svelte";

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

  <div class="tex__tabs">
    <ContentSwitcher
      size="sm"
      label="Framework"
      items={FRAMEWORKS.map((fw) => ({ value: fw.id, label: fw.label }))}
      value={active}
      onchange={(v) => (framework.value = v as FrameworkId)}
    />
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

  /* ContentSwitcher DS porte la barre d'onglets. On ajuste uniquement le padding
     documentaire. */
  .tex__tabs {
    padding: 0.75rem 1rem 0;
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
