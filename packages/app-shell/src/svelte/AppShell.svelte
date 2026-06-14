<script lang="ts">
  // Wrapper svelte FIN du noyau <sentropic-app-shell> : zéro markup, zéro CSS.
  // Il ne fait que (1) enregistrer le custom element (import à effet de bord) et
  // (2) passer le siteConfig par PROPRIÉTÉ DOM (supporte les callbacks). Tout le
  // rendu/comportement vit dans le noyau unique => aucune surface de dérive ici.
  import "../sentropic-app-shell.js";
  import type { SiteConfig } from "../site-config";

  let { config }: { config: SiteConfig } = $props();

  let el = $state<HTMLElement | null>(null);

  // Réassigne la propriété `config` à chaque changement (le noyau re-render).
  $effect(() => {
    if (el) (el as unknown as { config: SiteConfig }).config = config;
  });
</script>

<sentropic-app-shell bind:this={el}></sentropic-app-shell>
