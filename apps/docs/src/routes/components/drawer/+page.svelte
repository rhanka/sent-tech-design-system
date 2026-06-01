<script lang="ts">
  import { Badge, Button, Drawer } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  let rightOpen = $state(false);
  let leftOpen = $state(false);
  let footerOpen = $state(false);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Overlay", "Component · Overlay")}</p>
    <div class="docs-hero-title">
      <h1>Drawer</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Panneau latéral coulissant pour un workflow secondaire — inspection, configuration, revue côte à côte — sans quitter l'écran courant. Il s'ouvre à droite (défaut) ou à gauche et garde le contexte visible derrière le fond.",
        "Sliding side panel for a secondary workflow — inspection, configuration, side-by-side review — without leaving the current screen. It opens on the right (default) or left and keeps the context visible behind the backdrop."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Afficher les détails d'un élément sélectionné dans une liste ou une table.", "Show the details of an item selected in a list or table.")}</li>
      <li>{fr("Présenter un formulaire de configuration plus long qu'un modal.", "Present a configuration form longer than a modal.")}</li>
      <li>{fr("Permettre une revue côte à côte sans perdre le contexte de l'écran.", "Allow side-by-side review without losing the screen context.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand ne pas l'utiliser", "When not to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour une décision courte et bloquante : utilisez Modal.", "For a short, blocking decision: use Modal.")}</li>
      <li>{fr("Pour un détail compact ancré à un déclencheur : utilisez Popover.", "For compact detail anchored to a trigger: use Popover.")}</li>
      <li>{fr("Pour une notification éphémère : utilisez Toast.", "For an ephemeral notification: use Toast.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Côtés", "Sides")}</h2>
    <p>{fr("Le panneau s'ancre à droite (défaut) ou à gauche via la prop side.", "The panel anchors to the right (default) or left via the side prop.")}</p>
    <div class="docs-example docs-example--stack">
      <Button variant="secondary" onclick={() => (rightOpen = true)}>{fr("Ouvrir à droite", "Open right")}</Button>
      <Button variant="secondary" onclick={() => (leftOpen = true)}>{fr("Ouvrir à gauche", "Open left")}</Button>
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
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Avec pied d'actions", "With action footer")}</h2>
    <p>{fr("Le snippet footer fixe une rangée d'actions en bas du panneau.", "The footer snippet pins an actions row at the bottom of the panel.")}</p>
    <div class="docs-example docs-example--stack">
      <Button onclick={() => (footerOpen = true)}>{fr("Configurer le service", "Configure service")}</Button>
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
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Fond (.st-drawer__backdrop) : calque plein écran ; un clic dessus ferme le panneau.", "Backdrop (.st-drawer__backdrop): full-screen layer; clicking it closes the panel.")}</li>
      <li>{fr("Panneau (.st-drawer, role=\"dialog\", aria-modal) : largeur 24 rem par défaut, hauteur pleine.", "Panel (.st-drawer, role=\"dialog\", aria-modal): 24 rem wide by default, full height.")}</li>
      <li>{fr("En-tête (.st-drawer__header) : titre, description optionnelle et bouton de fermeture.", "Header (.st-drawer__header): title, optional description, and close button.")}</li>
      <li>{fr("Corps (.st-drawer__body) : contenu défilable.", "Body (.st-drawer__body): scrollable content.")}</li>
      <li>{fr("Pied (.st-drawer__footer) : zone d'actions optionnelle, alignée à droite.", "Footer (.st-drawer__footer): optional actions area, right-aligned.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Le panneau a role=\"dialog\" et aria-modal=\"true\" ; aria-label reprend le titre.", "The panel has role=\"dialog\" and aria-modal=\"true\"; aria-label mirrors the title.")}</li>
      <li>{fr("Escape ferme le panneau ; un clic sur le fond le ferme également.", "Escape closes the panel; clicking the backdrop also closes it.")}</li>
      <li>{fr("La prop open est bindable : pilotez l'ouverture avec bind:open.", "The open prop is bindable: drive opening with bind:open.")}</li>
      <li>{fr("Prévoyez un déclencheur focusable et restituez-lui le focus à la fermeture côté hôte.", "Provide a focusable trigger and return focus to it on close in the host app.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Garder le contexte principal lisible derrière le panneau.", "Keep the main context legible behind the panel.")}</li>
          <li>{fr("Fixer les actions principales dans le pied.", "Pin the primary actions in the footer.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Ouvrir plusieurs drawers en cascade.", "Open multiple cascading drawers.")}</li>
          <li>{fr("Y reproduire la navigation principale de l'application.", "Reproduce the app's primary navigation inside it.")}</li>
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
        <tr><td><code>open</code></td><td><code>boolean</code> ({fr("bindable", "bindable")})</td><td><code>false</code></td><td>{fr("Affiche le panneau et son fond.", "Renders the panel and its backdrop.")}</td></tr>
        <tr><td><code>title</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Titre du panneau, repris dans aria-label.", "Panel title, mirrored in aria-label.")}</td></tr>
        <tr><td><code>description</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Texte secondaire sous le titre.", "Secondary text under the title.")}</td></tr>
        <tr><td><code>side</code></td><td><code>"left" | "right"</code></td><td><code>"right"</code></td><td>{fr("Côté d'ancrage du panneau.", "Side the panel anchors to.")}</td></tr>
        <tr><td><code>closeLabel</code></td><td><code>string</code></td><td><code>"Close"</code></td><td>{fr("aria-label du bouton de fermeture.", "aria-label of the close button.")}</td></tr>
        <tr><td><code>onclose</code></td><td><code>() =&gt; void</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Appelé à la fermeture (Escape, clic fond ou bouton).", "Called on close (Escape, backdrop click, or button).")}</td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Contenu du corps.", "Body content.")}</td></tr>
        <tr><td><code>footer</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Zone d'actions en pied.", "Footer actions area.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le panneau.", "Class(es) on the panel.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td><td>—</td><td>{fr("Propagés sur le <aside> panneau.", "Spread onto the <aside> panel.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-drawer-backdrop</code></li>
      <li><code>--st-component-drawer-zIndex</code></li>
      <li><code>--st-component-drawer-surface</code></li>
      <li><code>--st-component-drawer-border</code></li>
      <li><code>--st-component-drawer-shadow</code></li>
      <li><code>--st-component-drawer-width</code></li>
    </ul>
  </section>
</div>
