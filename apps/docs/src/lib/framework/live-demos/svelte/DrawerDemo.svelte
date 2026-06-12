<!--
  Démo Svelte interactive du Drawer : rendue inline par TabbedLiveExample (aucune
  île). Reproduit les exemples de la page Drawer : panneau droite, panneau gauche
  (prop side), et panneau avec pied d'actions. État local, bind:open.
-->
<script lang="ts">
  import { Button, Drawer } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  let rightOpen = $state(false);
  let leftOpen = $state(false);
  let footerOpen = $state(false);
</script>

<div class="ld-row">
  <Button variant="secondary" onclick={() => (rightOpen = true)}>{fr("Ouvrir à droite", "Open right")}</Button>
  <Button variant="secondary" onclick={() => (leftOpen = true)}>{fr("Ouvrir à gauche", "Open left")}</Button>
  <Button onclick={() => (footerOpen = true)}>{fr("Configurer le service", "Configure service")}</Button>

  <Drawer
    bind:open={rightOpen}
    side="right"
    title={fr("Détails du service", "Service details")}
    description={fr("Panneau ancré à droite, le défaut.", "Panel anchored to the right, the default.")}
    closeLabel={fr("Fermer", "Close")}
  >
    <p>{fr("Le drawer accueille inspection, configuration et revue côte à côte.", "The drawer hosts inspection, configuration, and side-by-side review.")}</p>
  </Drawer>

  <Drawer
    bind:open={leftOpen}
    side="left"
    title={fr("Filtres", "Filters")}
    description={fr("Panneau ancré à gauche.", "Panel anchored to the left.")}
    closeLabel={fr("Fermer", "Close")}
  >
    <p>{fr("Utilisez le côté gauche pour la navigation ou le filtrage.", "Use the left side for navigation or filtering.")}</p>
  </Drawer>

  <Drawer
    bind:open={footerOpen}
    title={fr("Configurer le service", "Configure service")}
    description={fr("Ajustez les paramètres puis enregistrez.", "Adjust the settings, then save.")}
    closeLabel={fr("Fermer", "Close")}
  >
    <p>{fr("Le corps défile indépendamment de l'en-tête et du pied.", "The body scrolls independently of the header and footer.")}</p>
    {#snippet footer()}
      <Button variant="secondary" onclick={() => (footerOpen = false)}>{fr("Annuler", "Cancel")}</Button>
      <Button onclick={() => (footerOpen = false)}>{fr("Enregistrer", "Save")}</Button>
    {/snippet}
  </Drawer>
</div>
