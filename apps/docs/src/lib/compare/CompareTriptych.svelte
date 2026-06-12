<script lang="ts">
  // CompareTriptych.svelte : vue triptyque compare (Lot 2).
  // Trois panneaux : (a) notre composant live, (b) iframe officielle CDN visuelle,
  // (c) rail de gaps lus du registre.
  //
  // INVARIANT : aucune mesure de style côté navigateur.
  // L'iframe est PUREMENT VISUELLE. Les Δ viennent UNIQUEMENT de compare-gaps.json.
  // Notes rendues en interpolation texte Svelte (jamais {@html}).

  import { type Snippet } from "svelte";
  import { REFERENCE_THEMES } from "./reference-themes.mjs";
  import { COMPARE_MANIFEST } from "./manifest.mjs";
  import { resolveManifestEntry, listScenarios, buildCompareUrl } from "./compare-store.svelte";
  import GapRail from "./GapRail.svelte";

  interface Props {
    themeId: string;
    scenarioId: string;
    component: string;
    pathname: string;
    /** Le rendu live de notre composant (slot passé par la page parente). */
    liveSlot?: Snippet;
  }

  let { themeId, scenarioId, component, pathname, liveSlot }: Props = $props();

  const refTheme = $derived(REFERENCE_THEMES[themeId]);
  const entry = $derived(resolveManifestEntry(themeId, scenarioId));
  const scenarios = $derived(listScenarios(themeId, component));

  // Calcul de l'iframe officielle de référence (visuelle uniquement).
  // Réutilise la même logique que /compare/+page.svelte (refDoc).
  const BENCH_WIDTH = 320;
  const IFRAME_PAD = 14;

  const refIframeSrc = $derived((): string => {
    if (!refTheme || !entry) return "";
    const href = refTheme.cssUrl;
    const fontLinks = refTheme.fontLinks ?? "";
    const brandFont = refTheme.brandFont ?? "system-ui, sans-serif";
    const lang = refTheme.lang ?? "fr";
    const body = entry.refMarkup;
    return (
      `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">` +
      `<link rel="stylesheet" href="${href}">${fontLinks}` +
      `<style>html,body{box-sizing:border-box}*,*::before,*::after{box-sizing:inherit}` +
      `body{margin:0;padding:${IFRAME_PAD}px;font-family:${brandFont};background:#fff}</style>` +
      `</head><body>${body}</body></html>`
    );
  });

  let railCollapsed = $state(false);

  // Libellé du thème de référence.
  const themeLabel = $derived(refTheme?.label ?? themeId);
</script>

<div class="ctrip" class:ctrip--rail-collapsed={railCollapsed}>
  <!-- Barre de navigation du scénario -->
  <header class="ctrip__nav">
    <div class="ctrip__nav-left">
      <span class="ctrip__nav-label">Compare</span>
      <span class="ctrip__nav-theme">{themeLabel}</span>
      {#if entry}
        <span class="ctrip__nav-sep">·</span>
        <span class="ctrip__nav-component">{entry.component}</span>
        <span class="ctrip__nav-sep">·</span>
        <span class="ctrip__nav-scenario">{entry.scenario}</span>
      {/if}
    </div>

    {#if scenarios.length > 1}
      <nav class="ctrip__scenario-nav" aria-label="Scénarios de comparaison">
        {#each scenarios as scen (scen)}
          {@const isActive = scen === scenarioId}
          {@const entryForScen = COMPARE_MANIFEST[themeId]?.[scen]}
          <a
            href={buildCompareUrl(pathname, themeId, scen)}
            class="ctrip__scenario-link"
            class:ctrip__scenario-link--active={isActive}
            aria-current={isActive ? "page" : undefined}
          >
            {entryForScen?.scenario ?? scen}
          </a>
        {/each}
      </nav>
    {/if}

    <a
      href={pathname}
      class="ctrip__close-btn"
      aria-label="Fermer le mode comparaison"
    >✕ Fermer</a>
  </header>

  <!-- Triptyque -->
  <div class="ctrip__panels">
    <!-- Panneau (a) : notre composant live -->
    <section class="ctrip__panel ctrip__panel--ours" aria-labelledby="ctrip-ours-label">
      <div class="ctrip__panel-header">
        <span id="ctrip-ours-label" class="ctrip__panel-tag">Sentropic: {themeId}</span>
      </div>
      <div class="ctrip__panel-body">
        {#if liveSlot}
          {@render liveSlot()}
        {:else}
          <p class="ctrip__no-live">Rendu live non disponible pour ce composant.</p>
        {/if}
      </div>
    </section>

    <!-- Panneau (b) : composant officiel en iframe CDN (purement visuelle) -->
    <section class="ctrip__panel ctrip__panel--ref" aria-labelledby="ctrip-ref-label">
      <div class="ctrip__panel-header">
        <span id="ctrip-ref-label" class="ctrip__panel-tag">{themeLabel} officiel</span>
      </div>
      <div class="ctrip__panel-body ctrip__panel-body--ref">
        {#if refIframeSrc()}
          <iframe
            class="ctrip__frame"
            style="width:{BENCH_WIDTH + 2 * IFRAME_PAD}px"
            title="{themeLabel} officiel: {entry?.component ?? component} {entry?.scenario ?? scenarioId}"
            srcdoc={refIframeSrc()}
          ></iframe>
        {:else}
          <p class="ctrip__no-ref">Aucune référence officielle disponible pour ce scénario.</p>
        {/if}
      </div>
    </section>

    <!-- Panneau (c) : rail de gaps -->
    <GapRail
      {themeId}
      {component}
      scenario={entry?.scenario ?? scenarioId}
      bind:collapsed={railCollapsed}
    />
  </div>
</div>

<style>
  .ctrip {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: #f8fafc;
  }

  .ctrip__nav {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding: 0.5rem 1rem;
    background: #fff;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.875rem;
  }

  .ctrip__nav-left {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-wrap: wrap;
    flex: 1;
    min-width: 0;
  }

  .ctrip__nav-label {
    font-weight: 700;
    color: #1e293b;
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ctrip__nav-theme {
    color: #3b82f6;
    font-weight: 600;
    font-size: 0.8125rem;
  }

  .ctrip__nav-sep {
    color: #cbd5e1;
  }

  .ctrip__nav-component {
    color: #475569;
    font-weight: 600;
  }

  .ctrip__nav-scenario {
    color: #64748b;
  }

  .ctrip__scenario-nav {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .ctrip__scenario-link {
    padding: 0.1875rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    color: #475569;
    text-decoration: none;
    border: 1px solid #e2e8f0;
    background: #fff;
    transition: background 0.1s, color 0.1s;
  }

  @media (prefers-reduced-motion: reduce) {
    .ctrip__scenario-link {
      transition: none;
    }
  }

  .ctrip__scenario-link:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .ctrip__scenario-link--active {
    background: #1e40af;
    color: #fff;
    border-color: #1e40af;
    font-weight: 600;
  }

  .ctrip__scenario-link--active:hover {
    background: #1d3faf;
    color: #fff;
  }

  .ctrip__close-btn {
    margin-left: auto;
    padding: 0.25rem 0.625rem;
    border-radius: 4px;
    font-size: 0.75rem;
    color: #64748b;
    text-decoration: none;
    border: 1px solid #cbd5e1;
    background: #fff;
    white-space: nowrap;
  }

  .ctrip__close-btn:hover {
    background: #fef2f2;
    color: #dc2626;
    border-color: #fca5a5;
  }

  /* Triptyque : 3 colonnes : notre live | officiel | rail */
  .ctrip__panels {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 20rem;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .ctrip--rail-collapsed .ctrip__panels {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 2.5rem;
  }

  /* Breakpoint étroit : rail en bas, 2 colonnes ou 1 colonne */
  @media (max-width: 900px) {
    .ctrip__panels {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      grid-template-rows: auto auto;
    }

    .ctrip__panels > :global(.gap-rail) {
      grid-column: 1 / -1;
      border-left: none;
      border-top: 1px solid #e2e8f0;
      min-width: 0;
      max-width: none;
    }
  }

  @media (max-width: 600px) {
    .ctrip__panels {
      grid-template-columns: minmax(0, 1fr);
    }

    .ctrip__panel--ref {
      border-top: 1px solid #e2e8f0;
    }
  }

  .ctrip__panel {
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e2e8f0;
    min-width: 0;
    overflow: auto;
  }

  .ctrip__panel:last-of-type {
    border-right: 0;
  }

  .ctrip__panel-header {
    padding: 0.375rem 0.75rem;
    border-bottom: 1px solid #eef2f7;
    background: #f8fafc;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .ctrip__panel-tag {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748b;
  }

  .ctrip__panel-body {
    flex: 1;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .ctrip__panel-body--ref {
    padding: 0;
    overflow: hidden;
  }

  .ctrip__frame {
    border: 0;
    background: #fff;
    min-height: 10rem;
    width: 100%;
    max-width: 100%;
    display: block;
    flex: 1;
  }

  .ctrip__no-live,
  .ctrip__no-ref {
    color: #94a3b8;
    font-size: 0.8125rem;
    font-style: italic;
    margin: 0;
  }
</style>
