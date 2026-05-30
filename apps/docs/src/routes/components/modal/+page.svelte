<script lang="ts">
  import { Badge, Button, Modal } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  let confirmOpen = $state(false);
  let footerOpen = $state(false);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Overlay", "Component · Overlay")}</p>
    <h1>
      Modal
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>
      {fr(
        "Dialogue modal recentré qui interrompt le flux pour une tâche courte et focalisée : confirmation, formulaire bref ou décision bloquante. Il piège le focus et assombrit l'arrière-plan jusqu'à la fermeture.",
        "Centered modal dialog that interrupts the flow for a short, focused task: confirmation, brief form, or blocking decision. It traps focus and dims the background until dismissed."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Demander une confirmation avant une action conséquente ou destructive.", "Request confirmation before a consequential or destructive action.")}</li>
      <li>{fr("Présenter une tâche brève qui doit être terminée ou annulée avant de continuer.", "Present a short task that must be completed or cancelled before continuing.")}</li>
      <li>{fr("Concentrer l'attention sur une décision unique, sans distraction de l'arrière-plan.", "Focus attention on a single decision, free of background distraction.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand ne pas l'utiliser", "When not to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour un workflow long ou multi-étapes : préférez Drawer ou une page dédiée.", "For a long or multi-step workflow: prefer Drawer or a dedicated page.")}</li>
      <li>{fr("Pour une notification éphémère qui n'attend pas d'action : utilisez Toast.", "For an ephemeral notification that needs no action: use Toast.")}</li>
      <li>{fr("Pour un détail contextuel non bloquant ancré à un déclencheur : utilisez Popover.", "For non-blocking contextual detail anchored to a trigger: use Popover.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Exemple — confirmation", "Example — confirmation")}</h2>
    <p>{fr("Le bouton ouvre un dialogue avec titre, description et corps. Escape ou le bouton de fermeture le referment.", "The button opens a dialog with title, description, and body. Escape or the close button dismiss it.")}</p>
    <div class="docs-example docs-example--stack">
      <Button onclick={() => (confirmOpen = true)}>{fr("Ouvrir le dialogue", "Open dialog")}</Button>
      <Modal
        open={confirmOpen}
        title={fr("Confirmer l'action", "Confirm action")}
        description={fr("Cette action recompile le thème du tenant.", "This action recompiles the tenant theme.")}
        closeLabel={fr("Fermer", "Close")}
        onclose={() => (confirmOpen = false)}
      >
        <p>{fr("Le contenu du modal reste neutre et fourni par l'application hôte.", "Modal content stays product-neutral and is supplied by the host application.")}</p>
      </Modal>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Exemple — avec pied d'actions", "Example — with action footer")}</h2>
    <p>{fr("Le snippet footer accueille les boutons d'action, alignés à droite.", "The footer snippet hosts action buttons, right-aligned.")}</p>
    <div class="docs-example docs-example--stack">
      <Button variant="secondary" onclick={() => (footerOpen = true)}>{fr("Ouvrir avec actions", "Open with actions")}</Button>
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
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Fond (.st-modal__backdrop) : calque plein écran assombrissant l'arrière-plan, position fixe.", "Backdrop (.st-modal__backdrop): full-screen layer dimming the background, fixed position.")}</li>
      <li>{fr("Dialogue (.st-modal, role=\"dialog\", aria-modal) : surface centrée, max 36 rem de large.", "Dialog (.st-modal, role=\"dialog\", aria-modal): centered surface, max 36 rem wide.")}</li>
      <li>{fr("En-tête (.st-modal__header) : titre, description optionnelle et bouton de fermeture.", "Header (.st-modal__header): title, optional description, and close button.")}</li>
      <li>{fr("Corps (.st-modal__body) : contenu défilable fourni via le snippet children.", "Body (.st-modal__body): scrollable content supplied via the children snippet.")}</li>
      <li>{fr("Pied (.st-modal__footer) : zone d'actions optionnelle, alignée à droite.", "Footer (.st-modal__footer): optional actions area, right-aligned.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Le dialogue a role=\"dialog\" et aria-modal=\"true\" ; aria-label reprend le titre.", "The dialog has role=\"dialog\" and aria-modal=\"true\"; aria-label mirrors the title.")}</li>
      <li>{fr("À l'ouverture, le focus se place automatiquement sur le bouton de fermeture.", "On open, focus automatically moves to the close button.")}</li>
      <li>{fr("Le focus est piégé : Tab et Shift+Tab bouclent à l'intérieur du dialogue.", "Focus is trapped: Tab and Shift+Tab cycle within the dialog.")}</li>
      <li>{fr("Escape ferme le dialogue ; à la fermeture, le focus retourne sur l'élément déclencheur.", "Escape closes the dialog; on close, focus returns to the triggering element.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Donner un titre clair décrivant la décision attendue.", "Give a clear title describing the expected decision.")}</li>
          <li>{fr("Placer l'action de confirmation à droite dans le pied.", "Place the confirming action on the right in the footer.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Empiler plusieurs modals : une seule décision à la fois.", "Stack multiple modals: one decision at a time.")}</li>
          <li>{fr("Y loger un long formulaire défilant : préférez une page ou un Drawer.", "Host a long scrolling form: prefer a page or a Drawer.")}</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{fr("Défaut", "Default")}</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>open</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("Affiche le dialogue et son fond.", "Renders the dialog and its backdrop.")}</td></tr>
        <tr><td><code>title</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Titre du dialogue, repris dans aria-label.", "Dialog title, mirrored in aria-label.")}</td></tr>
        <tr><td><code>description</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Texte secondaire sous le titre.", "Secondary text under the title.")}</td></tr>
        <tr><td><code>closeLabel</code></td><td><code>string</code></td><td><code>"Close"</code></td><td>{fr("aria-label du bouton de fermeture.", "aria-label of the close button.")}</td></tr>
        <tr><td><code>onclose</code></td><td><code>() =&gt; void</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Appelé sur Escape ou clic de fermeture.", "Called on Escape or close click.")}</td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Contenu du corps.", "Body content.")}</td></tr>
        <tr><td><code>footer</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Zone d'actions en pied.", "Footer actions area.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le dialogue.", "Class(es) on the dialog.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td><td>—</td><td>{fr("Propagés sur le <section> dialogue.", "Spread onto the <section> dialog.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-overlay-backdrop</code></li>
      <li><code>--st-component-overlay-zIndex</code></li>
      <li><code>--st-component-overlay-surface</code></li>
      <li><code>--st-component-overlay-border</code></li>
      <li><code>--st-component-overlay-radius</code></li>
      <li><code>--st-component-overlay-shadow</code></li>
    </ul>
  </section>
</div>
