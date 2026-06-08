<!--
  Démo Svelte interactive du Modal — rendue inline par TabbedLiveExample (aucune
  île). Reproduit les deux exemples de la page Modal : dialogue simple +
  dialogue avec pied d'actions. État local, fermeture Escape/bouton via onclose.
-->
<script lang="ts">
  import { Button, Modal } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  let confirmOpen = $state(false);
  let footerOpen = $state(false);
</script>

<div class="ld-row">
  <Button onclick={() => (confirmOpen = true)}>{fr("Ouvrir le dialogue", "Open dialog")}</Button>
  <Button variant="secondary" onclick={() => (footerOpen = true)}>{fr("Ouvrir avec actions", "Open with actions")}</Button>

  <Modal
    open={confirmOpen}
    title={fr("Confirmer l'action", "Confirm action")}
    description={fr("Cette action recompile le thème du tenant.", "This action recompiles the tenant theme.")}
    closeLabel={fr("Fermer", "Close")}
    onclose={() => (confirmOpen = false)}
  >
    <p>{fr("Le contenu du modal reste neutre et fourni par l'application hôte.", "Modal content stays product-neutral and is supplied by the host application.")}</p>
  </Modal>

  <Modal
    open={footerOpen}
    title={fr("Publier le tenant", "Publish tenant")}
    description={fr("Les changements seront visibles immédiatement.", "Changes will be visible immediately.")}
    closeLabel={fr("Fermer", "Close")}
    onclose={() => (footerOpen = false)}
  >
    <p>{fr("Vérifiez la configuration avant de publier.", "Review the configuration before publishing.")}</p>
    {#snippet footer()}
      <Button variant="secondary" onclick={() => (footerOpen = false)}>{fr("Annuler", "Cancel")}</Button>
      <Button onclick={() => (footerOpen = false)}>{fr("Publier", "Publish")}</Button>
    {/snippet}
  </Modal>
</div>
