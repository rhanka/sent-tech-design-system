<script lang="ts">
  import { Badge, Radio } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Formulaire", "Component · Form")}</p>
    <div class="docs-hero-title">
      <h1>Radio</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Bouton radio pour un choix exclusif parmi plusieurs options. Les radios partageant le même attribut name forment un groupe : une seule sélection possible. Input natif, libellé requis.",
        "Radio button for an exclusive choice among several options. Radios sharing the same name attribute form a group: only one can be selected. Native input, required label."
      )}
    </p>
  </section>

  <FrameworkPreview example="radio" title="Aperçu live" />

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Choisir une seule option parmi 2 à 5 choix exclusifs tous visibles.", "Pick a single option among 2 to 5 exclusive choices, all visible.")}</li>
      <li>{fr("Au-delà de ~6 options, préférez un Select.", "Beyond about 6 options, prefer a Select.")}</li>
      <li>{fr("Pour des choix cumulables, utilisez Checkbox.", "For accumulable choices, use Checkbox.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Groupe", "Group")}</h2>
    <p>{fr("Les radios d'un même name s'excluent mutuellement.", "Radios sharing a name are mutually exclusive.")}</p>
    <div class="docs-example docs-example--stack">
      <Radio label={fr("Runtime principal", "Primary runtime")} name="runtime" value="primary" checked />
      <Radio label={fr("Runtime secondaire", "Secondary runtime")} name="runtime" value="secondary" />
      <Radio label={fr("Runtime expérimental", "Experimental runtime")} name="runtime" value="experimental" />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "states")}</h2>
    <div class="docs-example docs-example--stack">
      <h3>{fr("Défaut / sélectionné", "Default / selected")}</h3>
      <Radio label={fr("Non sélectionné", "Unselected")} name="states-a" />
      <Radio label={fr("Sélectionné", "Selected")} name="states-a" checked />
      <h3>{fr("Avec texte d'aide", "With helper text")}</h3>
      <Radio
        label={fr("Plan Équipe", "Team plan")}
        name="plan"
        helperText={fr("Jusqu'à 20 sièges.", "Up to 20 seats.")}
      />
      <h3>{fr("Désactivé", "Disabled")}</h3>
      <Radio label={fr("Indisponible", "Unavailable")} name="states-b" disabled />
      <Radio label={fr("Indisponible (sélectionné)", "Unavailable (selected)")} name="states-b" checked disabled />
      <h3>{fr("Erreur", "Error")}</h3>
      <Radio label={fr("Choix requis", "Choice required")} name="states-c" invalid />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Élément racine : un <label> englobant (classe st-choice).", "Root element: a wrapping <label> (class st-choice).")}</li>
      <li>{fr("Bouton (.st-choice__input) : <input type=\"radio\"> natif, couleur via accent-color.", "Button (.st-choice__input): native <input type=\"radio\">, color via accent-color.")}</li>
      <li>{fr("Contenu : libellé (requis) + texte d'aide optionnel.", "Content: label (required) + optional helper text.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Radios natifs : les flèches déplacent la sélection dans le groupe (name commun).", "Native radios: arrow keys move the selection within the group (shared name).")}</li>
      <li>{fr("Le libellé englobe l'input : cliquer le texte sélectionne.", "The label wraps the input: clicking the text selects it.")}</li>
      <li>{fr("L'état erreur est visuel sur le radio; appliquez aria-invalid au groupe si toute la question est invalide.", "The error state is visual on the radio; apply aria-invalid to the group when the whole question is invalid.")}</li>
      <li>{fr("Groupez sous un FormGroup avec légende pour un libellé de groupe accessible.", "Group under a FormGroup with a legend for an accessible group label.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Présélectionner une option par défaut quand c'est raisonnable.", "Pre-select a sensible default when reasonable.")}</li>
          <li>{fr("Afficher toutes les options ensemble verticalement.", "Show all options together, vertically.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Utiliser des radios pour activer/désactiver une option unique : Checkbox.", "Use radios to enable/disable a single option: Checkbox.")}</li>
          <li>{fr("Oublier l'attribut name partagé : la sélection ne s'exclut plus.", "Forget the shared name attribute: selection stops being exclusive.")}</li>
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
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Libellé visible du bouton.", "Visible label of the button.")}</td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Texte d'aide sous le libellé.", "Helper text below the label.")}</td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("Active l'état erreur visuel du radio.", "Triggers the radio visual error state.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le <label>.", "Class(es) on the <label>.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLInputAttributes</code></td><td>N/A</td><td>{fr("Propagés sur l'<input> (name, value, checked, disabled…).", "Spread onto the <input> (name, value, checked, disabled…).")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-selection-checkedBackground</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-control-invalidBorder</code></li>
      <li><code>--st-component-field-labelText</code></li>
      <li><code>--st-component-field-helpText</code></li>
      <li><code>--st-component-control-disabledText</code></li>
    </ul>
  </section>
</div>
