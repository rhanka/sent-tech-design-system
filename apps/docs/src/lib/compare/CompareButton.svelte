<script lang="ts">
  // CompareButton.svelte — bouton « Compare » dans l'en-tête.
  // AFFICHÉ SEULEMENT si :
  //   1. Le thème actif a une entrée dans REFERENCE_THEMES (thème d'import).
  //   2. La page courante est une page de composant (/components/<slug>).
  //   3. Le manifeste a des scénarios pour ce thème/composant.
  //
  // CLIENT-ONLY : le thème actif est lu après hydratation (localStorage),
  // jamais au SSR. Utilise browser de $app/environment pour rester sûr.
  //
  // Génère un deep-link ?compare=1&theme=<id>&scenario=<id>.

  import { browser } from "$app/environment";
  import { REFERENCE_THEMES } from "./reference-themes.mjs";
  import { buildCompareUrl, listScenarios } from "./compare-store.svelte";

  interface Props {
    /** Thème actif (de +layout.svelte, client-only après hydratation). */
    activeThemeId: string;
    /** URL pathname courante (de page.url.pathname). */
    pathname: string;
  }

  let { activeThemeId, pathname }: Props = $props();

  // Déduit le nom du composant depuis le chemin (ex. /components/button → Button).
  const componentSlug = $derived(
    (() => { const m = pathname.match(/\/components\/([^/]+)/); return m ? m[1] : null; })()
  );

  const componentName = $derived(
    componentSlug
      ? componentSlug.charAt(0).toUpperCase() + componentSlug.slice(1)
      : null
  );

  // Vérifie que le thème actif est un thème d'import (REFERENCE_THEMES).
  const isImport = $derived(browser && activeThemeId in REFERENCE_THEMES);

  // Scénarios disponibles pour ce thème + composant.
  const scenariosList = $derived(
    isImport && componentName ? listScenarios(activeThemeId, componentName) : []
  );

  // Premier scénario disponible (pour le deep-link par défaut).
  const defaultScenario = $derived(scenariosList[0] ?? null);

  // Le bouton est visible ssi tous les critères sont réunis.
  const visible = $derived(browser && isImport && scenariosList.length > 0 && !!defaultScenario);

  const compareUrl = $derived(
    visible ? buildCompareUrl(pathname, activeThemeId, defaultScenario!) : "#"
  );
</script>

{#if visible}
  <a
    href={compareUrl}
    class="compare-btn"
    aria-label="Comparer avec {REFERENCE_THEMES[activeThemeId]?.label ?? activeThemeId}"
  >
    <span class="compare-btn__icon" aria-hidden="true">⧉</span>
    <span class="compare-btn__label">Compare</span>
  </a>
{/if}

<style>
  .compare-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.3125rem;
    padding: 0.25rem 0.625rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #1e40af;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    text-decoration: none;
    transition: background 0.1s, color 0.1s, border-color 0.1s;
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .compare-btn {
      transition: none;
    }
  }

  .compare-btn:hover {
    background: #dbeafe;
    color: #1e3a8a;
    border-color: #93c5fd;
  }

  .compare-btn:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .compare-btn__icon {
    font-size: 0.875rem;
    line-height: 1;
  }

  .compare-btn__label {
    line-height: 1;
  }
</style>
