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
  <!-- Utilise les classes globales DS (.st-button) car Button DS est un <button>,
       pas un <a>. Les styles sont fournis par @sentropic/design-system-react/styles.css
       déjà chargé dans +layout.svelte. -->
  <a
    href={compareUrl}
    class="st-button st-button--secondary st-button--sm compare-btn-link"
    aria-label="Comparer avec {REFERENCE_THEMES[activeThemeId]?.label ?? activeThemeId}"
  >
    <span aria-hidden="true">⧉</span>
    <span>Compare</span>
  </a>
{/if}

<style>
  /* Seul override local : supprimer la text-decoration héritée du <a> global */
  .compare-btn-link {
    text-decoration: none;
    white-space: nowrap;
  }

  .compare-btn-link:hover {
    text-decoration: none;
  }
</style>
