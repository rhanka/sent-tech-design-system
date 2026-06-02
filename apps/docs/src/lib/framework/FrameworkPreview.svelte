<!--
  FrameworkPreview — aperçu « live » multi-frameworks (A + C).

  C — rendu en place : selon framework.value, l'aperçu rend le composant avec le
      VRAI package du framework choisi.
        • svelte → rendu inline via SvelteNode (composants Svelte du DS).
        • react  → île montée via createRoot (@sentropic/design-system-react).
        • vue    → île montée via createApp (@sentropic/design-system-vue).
      Les îles React/Vue sont strictement client (import dynamique, garde
      `browser`, montage en $effect) afin que le prerender reste vide et que le
      build adapter-static reste statique. Démontage/remontage propre à chaque
      changement de framework.

  A — snippet par framework : le code d'usage affiché correspond au framework
      actif (Svelte / React / Vue), depuis le registre d'exemples.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { framework, type FrameworkId } from "$lib/framework.svelte";
  import { locale } from "$lib/locale.svelte";
  import { getExample } from "./examples";
  import type { IslandHandle } from "./react-island";
  import SvelteNode from "./SvelteNode.svelte";

  let { example: exampleId, title }: { example: string; title?: string } = $props();

  const example = $derived(getExample(exampleId));
  const fr = $derived(locale.value === "fr");
  const active = $derived(framework.value);

  let islandHost = $state<HTMLDivElement | null>(null);
  let copied = $state(false);

  // Montage/démontage des îles React/Vue, piloté réactivement par le framework.
  $effect(() => {
    // Lectures réactives explicites (framework + exemple + hôte DOM).
    const fw = active;
    const host = islandHost;
    const ex = example;

    if (!browser || !host || !ex) return;
    if (fw === "svelte") return; // Svelte est rendu inline (cf. template).

    let handle: IslandHandle | null = null;
    let disposed = false;

    const mount = async () => {
      if (fw === "react") {
        const { mountReactIsland } = await import("./react-island");
        if (disposed) return;
        handle = await mountReactIsland(host, ex.nodes);
      } else if (fw === "vue") {
        const { mountVueIsland } = await import("./vue-island");
        if (disposed) return;
        handle = await mountVueIsland(host, ex.nodes);
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

  const code = $derived(example ? example.code[active as FrameworkId] : "");

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

  const implLabel = $derived(
    active === "react" ? "React" : active === "vue" ? "Vue" : "Svelte"
  );
  const pkg = $derived(
    active === "react"
      ? "@sentropic/design-system-react"
      : active === "vue"
        ? "@sentropic/design-system-vue"
        : "@sentropic/design-system-svelte"
  );
</script>

{#if example}
  <section class="fp" data-framework={active} aria-label={title ?? exampleId}>
    <header class="fp__bar">
      <span class="fp__title">{title ?? (fr ? "Aperçu live" : "Live preview")}</span>
      <span class="fp__impl" data-framework={active}>
        <span class="fp__impl-dot" aria-hidden="true"></span>
        {implLabel}
      </span>
    </header>

    <div class="fp__stage">
      {#if active === "svelte"}
        <div class="fp__svelte">
          {#each example.nodes as node, i (i)}
            <SvelteNode {node} />
          {/each}
        </div>
      {:else}
        <!-- Hôte des îles React/Vue : rempli côté client uniquement. -->
        <div class="fp__island" bind:this={islandHost}></div>
      {/if}
    </div>

    <figure class="fp__code">
      <figcaption class="fp__code-head">
        <code class="fp__pkg">{pkg}</code>
        <button type="button" class="fp__copy" onclick={copyCode}>
          {#if copied}
            {fr ? "Copié" : "Copied"}
          {:else}
            {fr ? "Copier" : "Copy"}
          {/if}
        </button>
      </figcaption>
      <pre class="fp__pre"><code>{code}</code></pre>
    </figure>
  </section>
{/if}

<style>
  .fp {
    border: 1px solid var(--docs-line, #e2e8f0);
    border-radius: 0.75rem;
    overflow: hidden;
    background: #ffffff;
    margin-bottom: 1.5rem;
  }

  .fp__bar {
    align-items: center;
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border-bottom: 1px solid var(--docs-line, #e2e8f0);
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.55rem 0.9rem;
  }

  .fp__title {
    color: var(--docs-ink, #0f172a);
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .fp__impl {
    align-items: center;
    color: var(--docs-muted, #475569);
    display: inline-flex;
    font-size: 0.72rem;
    font-weight: 600;
    gap: 0.4rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .fp__impl-dot {
    background: #ff3e00; /* Svelte */
    border-radius: 50%;
    height: 0.5rem;
    width: 0.5rem;
  }

  .fp__impl[data-framework="react"] .fp__impl-dot {
    background: #149eca;
  }

  .fp__impl[data-framework="vue"] .fp__impl-dot {
    background: #42b883;
  }

  .fp__stage {
    padding: 1.5rem;
  }

  .fp__svelte,
  .fp__island {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  /* Les exemples « pile » (Alert, …) posent un wrapper .fp-stack interne. */
  .fp__stage :global(.fp-row) {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
  }

  .fp__stage :global(.fp-stack) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .fp__stage :global(.fp-card-title) {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.35rem;
  }

  .fp__stage :global(.fp-card-text) {
    color: var(--docs-muted, #475569);
    font-size: 0.9rem;
    margin: 0;
  }

  .fp__code {
    border-top: 1px solid var(--docs-line, #e2e8f0);
    margin: 0;
  }

  .fp__code-head {
    align-items: center;
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border-bottom: 1px solid var(--docs-line, #e2e8f0);
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.4rem 0.9rem;
  }

  .fp__pkg {
    color: var(--docs-muted, #475569);
    font-size: 0.78rem;
  }

  .fp__copy {
    background: transparent;
    border: 1px solid var(--docs-line, #e2e8f0);
    border-radius: 0.35rem;
    color: var(--docs-ink, #0f172a);
    cursor: pointer;
    font-size: 0.74rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
  }

  .fp__copy:hover {
    background: #ffffff;
  }

  .fp__pre {
    background: #0f172a;
    color: #e2e8f0;
    font-size: 0.82rem;
    line-height: 1.55;
    margin: 0;
    overflow-x: auto;
    padding: 1rem 1.1rem;
  }

  .fp__pre code {
    font-family: var(--st-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    white-space: pre;
  }
</style>
