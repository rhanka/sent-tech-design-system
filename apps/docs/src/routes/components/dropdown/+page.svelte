<script lang="ts">
  import { Badge, Dropdown } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  let product = $state("forge");
  let plan = $state<string | undefined>(undefined);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Formulaire", "Component · Form")}</p>
    <div class="docs-hero-title">
      <h1>Dropdown</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Liste déroulante de sélection d'une valeur unique parmi des options (pattern listbox). Le déclencheur affiche l'étiquette et la valeur courante ; la liste s'ouvre au clic et se referme au choix, sur Escape ou au clic extérieur.",
        "Single-value selection dropdown over a list of options (listbox pattern). The trigger shows the label and current value; the list opens on click and closes on selection, on Escape, or on outside click."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Choisir une valeur parmi un ensemble court à moyen d'options mutuellement exclusives.", "Pick one value from a short-to-medium set of mutually exclusive options.")}</li>
      <li>{fr("Quand un libellé persistant (« Produit : Forge ») aide à comprendre la sélection.", "When a persistent label (\"Product: Forge\") helps make sense of the selection.")}</li>
      <li>{fr("Pour la sélection multiple, utilisez MultiSelect ; pour le natif simple, Select.", "For multi-select, use MultiSelect; for a plain native control, Select.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand ne pas l'utiliser", "When not to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour une liste d'actions (et non de valeurs) : utilisez Menu.", "For a list of actions (not values): use Menu.")}</li>
      <li>{fr("Pour deux ou trois choix visibles en permanence : préférez Radio ou ContentSwitcher.", "For two or three always-visible choices: prefer Radio or ContentSwitcher.")}</li>
      <li>{fr("Pour de très longues listes avec recherche : utilisez Combobox.", "For very long lists with search: use Combobox.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Avec valeur initiale", "With initial value")}</h2>
    <p>{fr("La prop value fixe la sélection de départ ; onselect remonte le choix.", "The value prop sets the initial selection; onselect bubbles the choice up.")}</p>
    <div class="docs-example docs-example--stack">
      <Dropdown
        label={fr("Produit", "Product")}
        value={product}
        options={[
          { label: "Forge", value: "forge" },
          { label: "Entropic", value: "entropic" },
          { label: "Graphify", value: "graphify" }
        ]}
        onselect={(value) => (product = value)}
      />
      <p class="docs-demo-note">{fr("Sélection", "Selection")} : <code>{product}</code></p>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Placeholder et option désactivée", "Placeholder and disabled option")}</h2>
    <p>{fr("Sans value, le placeholder s'affiche. Une option peut être marquée disabled.", "With no value, the placeholder shows. An option can be marked disabled.")}</p>
    <div class="docs-example docs-example--stack">
      <Dropdown
        label={fr("Forfait", "Plan")}
        placeholder={fr("Choisir un forfait", "Choose a plan")}
        value={plan}
        options={[
          { label: fr("Découverte", "Starter"), value: "starter" },
          { label: fr("Équipe", "Team"), value: "team" },
          { label: fr("Entreprise (bientôt)", "Enterprise (soon)"), value: "enterprise", disabled: true }
        ]}
        onselect={(value) => (plan = value)}
      />
      <p class="docs-demo-note">{fr("Sélection", "Selection")} : <code>{plan ?? "—"}</code></p>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur (.st-dropdown) : enveloppe inline positionnée en relatif.", "Container (.st-dropdown): inline wrapper positioned relatively.")}</li>
      <li>{fr("Déclencheur (.st-dropdown__button) : bouton affichant « label : valeur » et un chevron.", "Trigger (.st-dropdown__button): button showing \"label: value\" and a chevron.")}</li>
      <li>{fr("Liste (.st-dropdown__list, role=\"listbox\") : panneau flottant des options.", "List (.st-dropdown__list, role=\"listbox\"): floating panel of options.")}</li>
      <li>{fr("Option (.st-dropdown__option, role=\"option\") : bouton avec aria-selected.", "Option (.st-dropdown__option, role=\"option\"): button with aria-selected.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Le déclencheur porte aria-haspopup=\"listbox\" et aria-expanded reflétant l'état.", "The trigger carries aria-haspopup=\"listbox\" and aria-expanded reflecting the state.")}</li>
      <li>{fr("La liste a role=\"listbox\" avec aria-label ; chaque option a role=\"option\".", "The list has role=\"listbox\" with aria-label; each option has role=\"option\".")}</li>
      <li>{fr("L'option courante porte aria-selected=\"true\".", "The current option carries aria-selected=\"true\".")}</li>
      <li>{fr("Escape ferme la liste ; un clic en dehors la ferme aussi.", "Escape closes the list; a click outside closes it too.")}</li>
      <li>{fr("Les options désactivées ont aria-disabled=\"true\" et ne sont pas sélectionnables.", "Disabled options carry aria-disabled=\"true\" and are not selectable.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Donner un label clair décrivant le type de valeur choisie.", "Give a clear label describing the kind of value chosen.")}</li>
          <li>{fr("Ordonner les options de façon prévisible (alphabétique ou fréquence).", "Order options predictably (alphabetical or by frequency).")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Y placer des actions (utilisez Menu pour cela).", "Place actions in it (use Menu for that).")}</li>
          <li>{fr("Charger des dizaines d'options sans recherche : préférez Combobox.", "Load dozens of options without search: prefer Combobox.")}</li>
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
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Étiquette affichée et aria-label de la liste.", "Displayed label and the list's aria-label.")}</td></tr>
        <tr><td><code>options</code></td><td><code>DropdownOption[]</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Options { label, value, disabled? }.", "Options { label, value, disabled? }.")}</td></tr>
        <tr><td><code>value</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Valeur sélectionnée initiale.", "Initial selected value.")}</td></tr>
        <tr><td><code>placeholder</code></td><td><code>string</code></td><td><code>"Select"</code></td><td>{fr("Texte affiché sans sélection.", "Text shown with no selection.")}</td></tr>
        <tr><td><code>open</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("Ouvre la liste à l'initialisation.", "Opens the list on init.")}</td></tr>
        <tr><td><code>onselect</code></td><td><code>(value: string) =&gt; void</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Appelé avec la valeur choisie.", "Called with the chosen value.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le conteneur.", "Class(es) on the container.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLDivElement&gt;</code></td><td>—</td><td>{fr("Propagés sur le <div> conteneur.", "Spread onto the <div> container.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-dropdown-background</code></li>
      <li><code>--st-component-dropdown-border</code></li>
      <li><code>--st-component-dropdown-radius</code></li>
      <li><code>--st-component-dropdown-text</code></li>
      <li><code>--st-component-dropdown-shadow</code></li>
      <li><code>--st-component-dropdown-optionHoverBackground</code></li>
      <li><code>--st-component-dropdown-selectedBackground</code></li>
      <li><code>--st-component-dropdown-selectedText</code></li>
      <li><code>--st-component-control-focusRing</code></li>
    </ul>
  </section>
</div>
