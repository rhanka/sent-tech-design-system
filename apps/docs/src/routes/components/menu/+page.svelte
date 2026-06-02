<script lang="ts">
  import { Badge, Menu } from "@sentropic/design-system-svelte";
  import { Archive, Copy, Pencil, Share2, Trash2 } from "@lucide/svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  let lastAction = $state("N/A");

  const actionItems = [
    { kind: "group" as const, label: fr("Édition", "Edit") },
    { label: fr("Éditer", "Edit"), value: "edit", icon: Pencil },
    { label: fr("Dupliquer", "Duplicate"), value: "duplicate", icon: Copy },
    { kind: "divider" as const },
    { kind: "group" as const, label: fr("Distribuer", "Distribute") },
    { label: fr("Partager", "Share"), value: "share", icon: Share2 },
    { label: fr("Archiver", "Archive"), value: "archive", icon: Archive },
    { kind: "divider" as const },
    { label: fr("Supprimer", "Delete"), value: "delete", icon: Trash2, danger: true }
  ];

  const stateItems = [
    { label: fr("Action normale", "Normal action"), value: "normal", icon: Pencil },
    { label: fr("Action désactivée", "Disabled action"), value: "disabled", icon: Copy, disabled: true },
    { kind: "divider" as const },
    { label: fr("Action destructive", "Destructive action"), value: "destroy", icon: Trash2, danger: true }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Navigation", "Component · Navigation")}</p>
    <div class="docs-hero-title">
      <h1>Menu</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Liste verticale d'actions (role=\"menu\") avec icônes Lucide optionnelles, groupes titrés, séparateurs et items destructifs ou désactivés. Le surface visuelle est partagée avec MenuPopover ; pour ancrer le menu à un déclencheur flottant, combinez les deux.",
        "Vertical list of actions (role=\"menu\") with optional Lucide icons, titled groups, dividers, and destructive or disabled items. Its visual surface is shared with MenuPopover; to anchor the menu to a floating trigger, combine the two."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Regrouper des actions sur un objet (éditer, dupliquer, partager, supprimer).", "Group actions on an object (edit, duplicate, share, delete).")}</li>
      <li>{fr("Structurer ces actions par groupes et séparateurs pour les hiérarchiser.", "Structure those actions into groups and dividers to give them hierarchy.")}</li>
      <li>{fr("Pour sélectionner une valeur (et non lancer une action), utilisez Dropdown.", "To pick a value (not run an action), use Dropdown.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand ne pas l'utiliser", "When not to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour une navigation principale persistante : utilisez SideNav ou Tabs.", "For persistent primary navigation: use SideNav or Tabs.")}</li>
      <li>{fr("Pour un seul bouton d'action : un Button suffit.", "For a single action button: a Button suffices.")}</li>
      <li>{fr("Pour un menu de débordement compact en bout de ligne : utilisez OverflowMenu.", "For a compact end-of-row overflow menu: use OverflowMenu.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Groupes, séparateurs et item destructif", "Groups, dividers, and destructive item")}</h2>
    <p>{fr("Les items group titrent des sections, divider les sépare, et danger colore une action destructive.", "Group items title sections, dividers separate them, and danger tints a destructive action.")}</p>
    <div class="docs-example docs-example--stack">
      <Menu label={fr("Actions", "Actions")} items={actionItems} onselect={(value) => (lastAction = value)} />
      <p class="docs-demo-note">{fr("Dernière action", "Last action")} : <code>{lastAction}</code></p>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("États des items et densité", "Item states and density")}</h2>
    <p>{fr("Un item peut être désactivé (non sélectionnable) ou destructif. La prop dense réduit la hauteur des items.", "An item can be disabled (not selectable) or destructive. The dense prop reduces item height.")}</p>
    <div class="docs-example docs-example--stack">
      <Menu label={fr("États", "States")} items={stateItems} />
      <Menu label={fr("Dense", "Dense")} items={stateItems} dense />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur (.st-menu, role=\"menu\") : surface avec min 12 rem / max 18 rem de large.", "Container (.st-menu, role=\"menu\"): surface 12 rem min / 18 rem max wide.")}</li>
      <li>{fr("Item (.st-menu__item, role=\"menuitem\") : bouton avec icône optionnelle et libellé.", "Item (.st-menu__item, role=\"menuitem\"): button with optional icon and label.")}</li>
      <li>{fr("Groupe (.st-menu__group) : titre de section en petites capitales.", "Group (.st-menu__group): small-caps section heading.")}</li>
      <li>{fr("Séparateur (.st-menu__divider, role=\"separator\") : filet horizontal.", "Divider (.st-menu__divider, role=\"separator\"): horizontal rule.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Le conteneur a role=\"menu\" et un aria-label fourni par label.", "The container has role=\"menu\" and an aria-label supplied by label.")}</li>
      <li>{fr("Chaque action a role=\"menuitem\" ; les items désactivés portent aria-disabled.", "Each action has role=\"menuitem\"; disabled items carry aria-disabled.")}</li>
      <li>{fr("Navigation clavier : fleches haut/bas pour parcourir, Home/End pour aller aux bornes, Enter/Espace pour activer.", "Keyboard navigation: up/down arrows to move, Home/End to jump, Enter/Space to activate.")}</li>
      <li>{fr("Avec dismissOnSelect, Escape et le clic extérieur ferment le menu.", "With dismissOnSelect, Escape and outside clicks close the menu.")}</li>
      <li>{fr("Les groupes et séparateurs sont décoratifs (presentation / aria-hidden).", "Groups and dividers are decorative (presentation / aria-hidden).")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Placer l'action destructive en bas, isolée par un séparateur.", "Place the destructive action at the bottom, isolated by a divider.")}</li>
          <li>{fr("Utiliser des verbes d'action concis pour chaque item.", "Use concise action verbs for each item.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Multiplier les items au-delà de ce qui se lit en un coup d'œil.", "Pile up items beyond what reads at a glance.")}</li>
          <li>{fr("Mélanger actions et choix de valeurs dans le même menu.", "Mix actions and value choices in the same menu.")}</li>
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
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("aria-label du menu.", "aria-label of the menu.")}</td></tr>
        <tr><td><code>items</code></td><td><code>MenuItem[]</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Actions, groupes et séparateurs.", "Actions, groups, and dividers.")}</td></tr>
        <tr><td><code>open</code></td><td><code>boolean</code> ({fr("bindable", "bindable")})</td><td><code>true</code></td><td>{fr("Affiche le menu.", "Renders the menu.")}</td></tr>
        <tr><td><code>dismissOnSelect</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("Ferme le menu après sélection ; active Escape et clic extérieur.", "Closes the menu after selection; enables Escape and outside click.")}</td></tr>
        <tr><td><code>dense</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("Réduit la hauteur des items.", "Reduces item height.")}</td></tr>
        <tr><td><code>onselect</code></td><td><code>(value: string) =&gt; void</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Appelé avec la valeur de l'item choisi.", "Called with the chosen item's value.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le conteneur.", "Class(es) on the container.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLDivElement&gt;</code></td><td>N/A</td><td>{fr("Propagés sur le <div> conteneur.", "Spread onto the <div> container.")}</td></tr>
      </tbody>
    </table>
    <p>{fr("Un item (MenuActionItem) accepte : ", "An item (MenuActionItem) accepts: ")}<code>label</code>, <code>value</code>, <code>icon?</code>, <code>disabled?</code>, <code>danger?</code>. {fr("Un MenuGroupItem porte ", "A MenuGroupItem carries ")}<code>kind: "group"</code> {fr("et", "and")} <code>label</code> ; {fr("un MenuDividerItem porte ", "a MenuDividerItem carries ")}<code>kind: "divider"</code>.</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-menu-background</code></li>
      <li><code>--st-component-menu-border</code></li>
      <li><code>--st-component-menu-radius</code></li>
      <li><code>--st-component-menu-text</code></li>
      <li><code>--st-component-menu-shadow</code></li>
      <li><code>--st-component-menu-minWidth</code></li>
      <li><code>--st-component-menu-maxWidth</code></li>
      <li><code>--st-component-menu-itemHoverBackground</code></li>
      <li><code>--st-component-menu-disabledText</code></li>
      <li><code>--st-component-menu-dangerText</code></li>
      <li><code>--st-component-menu-dangerHoverBackground</code></li>
      <li><code>--st-component-menu-groupText</code></li>
    </ul>
  </section>
</div>
