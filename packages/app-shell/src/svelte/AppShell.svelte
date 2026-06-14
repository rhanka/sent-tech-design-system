<script lang="ts">
  // Wrapper svelte FIN du noyau <sentropic-app-shell> : zéro markup, zéro CSS.
  // SSR-safe : le noyau (un custom element, `class extends HTMLElement`) n'existe
  // qu'au navigateur — on l'importe DYNAMIQUEMENT dans onMount, jamais au module
  // (sinon le prérendu SvelteKit/Node planterait). En SSR la balise rend vide ;
  // à l'hydratation, le noyau s'enregistre et reçoit `config` par propriété DOM.
  import { onMount } from "svelte";
  import type { SiteConfig } from "../site-config";

  let { config }: { config: SiteConfig } = $props();

  let el = $state<HTMLElement | null>(null);
  let ready = $state(false);

  onMount(async () => {
    await import("../sentropic-app-shell.js"); // enregistrement browser-only
    ready = true;
  });

  // Réassigne `config` dès que le noyau est prêt et à chaque changement.
  $effect(() => {
    if (ready && el) (el as unknown as { config: SiteConfig }).config = config;
  });
</script>

<sentropic-app-shell bind:this={el}></sentropic-app-shell>
