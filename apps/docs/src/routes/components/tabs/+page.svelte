<script lang="ts">
  import { Badge, Tabs, type TabItem } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  const items: TabItem[] = $derived([
    {
      value: "overview",
      label: fr("Aperçu", "Overview"),
      content: fr(
        "Vue d'ensemble du projet : statut, métriques clés et activité récente.",
        "Project overview: status, key metrics, and recent activity."
      )
    },
    {
      value: "members",
      label: fr("Membres", "Members"),
      content: fr("Liste des membres et de leurs rôles.", "List of members and their roles.")
    },
    {
      value: "settings",
      label: fr("Paramètres", "Settings"),
      content: fr("Réglages du projet et intégrations.", "Project settings and integrations.")
    },
    {
      value: "billing",
      label: fr("Facturation", "Billing"),
      content: fr("Indisponible sur ce plan.", "Unavailable on this plan."),
      disabled: true
    }
  ]);

  let lastChanged = $state<string>("");
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Navigation", "Component · Navigation")}</p>
    <div class="docs-hero-title">
      <h1>Tabs</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Onglets pour basculer entre plusieurs vues d'un même contexte sans quitter la page. Implémente le motif ARIA tablist / tab / tabpanel ; un onglet peut être désactivé.",
        "Tabs to switch between several views of the same context without leaving the page. Implements the ARIA tablist / tab / tabpanel pattern; a tab can be disabled."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Organiser un contenu apparenté en sections alternatives (aperçu, membres, paramètres).", "Organize related content into alternative sections (overview, members, settings).")}</li>
      <li>{fr("Quand une seule section est utile à la fois et que l'utilisateur reste dans le même objet.", "When only one section is useful at a time and the user stays within the same object.")}</li>
      <li>{fr("Pour une navigation entre pages distinctes, utilisez plutôt des liens.", "For navigation between distinct pages, use links instead.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Exemple interactif", "Interactive example")}</h2>
    <p>{fr("Le dernier onglet est désactivé. onchange remonte la valeur sélectionnée.", "The last tab is disabled. onchange reports the selected value.")}</p>
    <div class="docs-example docs-example--stack">
      <Tabs
        {items}
        label={fr("Sections du projet", "Project sections")}
        onchange={(value) => (lastChanged = value)}
      />
      <p class="docs-demo-note">onchange → <code>{lastChanged || "N/A"}</code></p>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Onglet actif initial", "Initial active tab")}</h2>
    <p>{fr("activeValue fixe l'onglet sélectionné au montage.", "activeValue sets the selected tab on mount.")}</p>
    <div class="docs-example docs-example--stack">
      <Tabs {items} activeValue="settings" label={fr("Avec onglet initial", "With initial tab")} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Liste d'onglets (.st-tabs__list, role=\"tablist\") : les boutons d'onglet.", "Tab list (.st-tabs__list, role=\"tablist\"): the tab buttons.")}</li>
      <li>{fr("Onglet (.st-tabs__tab, role=\"tab\") : indicateur d'état actif (filet haut ou bas selon le thème).", "Tab (.st-tabs__tab, role=\"tab\"): active indicator (top or bottom rule depending on theme).")}</li>
      <li>{fr("Panneau (.st-tabs__panel, role=\"tabpanel\") : le contenu de l'onglet courant.", "Panel (.st-tabs__panel, role=\"tabpanel\"): content of the current tab.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Motif tablist/tab/tabpanel : aria-selected suit l'onglet actif.", "tablist/tab/tabpanel pattern: aria-selected follows the active tab.")}</li>
      <li>{fr("La liste reçoit un aria-label via la prop label.", "The list gets an aria-label via the label prop.")}</li>
      <li>{fr("Le focus clavier est visible sur chaque onglet (outline thémé).", "Keyboard focus is visible on each tab (themed outline).")}</li>
      <li>{fr("Un onglet désactivé (disabled) n'est pas activable et est ignoré par la sélection par défaut.", "A disabled tab is not activatable and is skipped by the default selection.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Des libellés courts d'un ou deux mots.", "Short one- or two-word labels.")}</li>
          <li>{fr("Garder un nombre d'onglets raisonnable (≤ 6).", "Keep the tab count reasonable (≤ 6).")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Cacher une étape obligatoire d'un flux dans un onglet.", "Hide a required flow step inside a tab.")}</li>
          <li>{fr("Utiliser des onglets pour naviguer vers d'autres pages.", "Use tabs to navigate to other pages.")}</li>
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
        <tr><td><code>items</code></td><td><code>TabItem[]</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Onglets à rendre.", "Tabs to render.")}</td></tr>
        <tr><td><code>activeValue</code></td><td><code>string</code></td><td><em>{fr("1er actif", "first enabled")}</em></td><td>{fr("Valeur de l'onglet initialement actif.", "Value of the initially active tab.")}</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Tabs"</code></td><td>{fr("aria-label de la tablist.", "aria-label of the tablist.")}</td></tr>
        <tr><td><code>onchange</code></td><td><code>(value: string) => void</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Appelé au changement d'onglet.", "Called when the active tab changes.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) supplémentaire(s).", "Additional class(es).")}</td></tr>
      </tbody>
    </table>

    <h3>{fr("Type TabItem", "TabItem type")}</h3>
    <table class="docs-table">
      <thead>
        <tr><th>{fr("Champ", "Field")}</th><th>Type</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>value</code></td><td><code>string</code></td><td>{fr("Identifiant unique de l'onglet.", "Unique tab identifier.")}</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td>{fr("Libellé affiché sur l'onglet.", "Label shown on the tab.")}</td></tr>
        <tr><td><code>content</code></td><td><code>string</code></td><td>{fr("Contenu du panneau (texte).", "Panel content (text).")}</td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean?</code></td><td>{fr("Désactive l'onglet.", "Disables the tab.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-tabs-indicator</code></li>
      <li><code>--st-component-tabs-activeText</code></li>
      <li><code>--st-component-tabs-inactiveText</code></li>
      <li><code>--st-component-tabs-inactiveBackground</code></li>
      <li><code>--st-component-tabs-border</code></li>
      <li><code>--st-component-tabs-panelBackground</code></li>
      <li><code>--st-component-tabs-anatomy-focus-outline</code></li>
    </ul>
  </section>
</div>
