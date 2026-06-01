<script lang="ts">
  import { Badge, Checkbox } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Formulaire", "Component · Form")}</p>
    <div class="docs-hero-title">
      <h1>Checkbox</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Case à cocher pour un choix binaire indépendant ou une sélection multiple dans une liste. Case <input type=\"checkbox\"> native, stylée par accent-color, avec libellé requis et texte d'aide optionnel.",
        "Checkbox for an independent binary choice or multi-selection in a list. Native <input type=\"checkbox\"> styled via accent-color, with a required label and optional helper text."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Activer/désactiver une option indépendante (consentement, préférence).", "Toggle an independent option (consent, preference).")}</li>
      <li>{fr("Sélectionner plusieurs éléments dans une liste où les choix ne s'excluent pas.", "Select several items in a list where choices are not mutually exclusive.")}</li>
      <li>{fr("Pour des choix exclusifs, utilisez Radio ; pour un réglage instantané, Toggle/Switch.", "For exclusive choices use Radio; for an instant setting, Toggle/Switch.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "states")}</h2>
    <div class="docs-example docs-example--stack">
      <h3>{fr("Défaut (décoché)", "Default (unchecked)")}</h3>
      <Checkbox label={fr("Activer les modèles d'espace", "Enable workspace templates")} />
      <h3>{fr("Coché", "Checked")}</h3>
      <Checkbox label={fr("Activer les modèles d'espace", "Enable workspace templates")} checked />
      <h3>{fr("Avec texte d'aide", "With helper text")}</h3>
      <Checkbox
        label={fr("Recevoir les e-mails produit", "Receive product emails")}
        helperText={fr("Vous pourrez vous désabonner à tout moment.", "You can unsubscribe at any time.")}
      />
      <h3>{fr("Désactivé", "Disabled")}</h3>
      <Checkbox label={fr("Verrouillé par la politique", "Locked by policy")} disabled />
      <Checkbox label={fr("Verrouillé (coché)", "Locked (checked)")} checked disabled />
      <h3>{fr("Erreur", "Error")}</h3>
      <Checkbox
        label={fr("Accepter les conditions", "Accept the terms")}
        invalid
        helperText={fr("Vous devez accepter pour continuer.", "You must accept to continue.")}
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Élément racine : un <label> englobant (classe st-choice).", "Root element: a wrapping <label> (class st-choice).")}</li>
      <li>{fr("Case (.st-choice__input) : <input type=\"checkbox\"> native, couleur via accent-color.", "Box (.st-choice__input): native <input type=\"checkbox\">, color via accent-color.")}</li>
      <li>{fr("Contenu : libellé (requis) + texte d'aide optionnel.", "Content: label (required) + optional helper text.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Case native : focusable au clavier, basculée avec Espace.", "Native checkbox: keyboard-focusable, toggled with Space.")}</li>
      <li>{fr("Le libellé englobe l'input : cliquer le texte coche la case.", "The label wraps the input: clicking the text toggles the box.")}</li>
      <li>{fr("aria-invalid=\"true\" est posé en erreur, la couleur d'accent passe au rouge.", "aria-invalid=\"true\" is set in the error state, accent color turns red.")}</li>
      <li>{fr("Le libellé est obligatoire (prop label) : pas de case sans texte.", "The label is mandatory (label prop): no box without text.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Formuler le libellé positivement (« Activer X »).", "Phrase the label positively (\"Enable X\").")}</li>
          <li>{fr("Grouper les cases liées sous une légende (FormGroup).", "Group related checkboxes under a legend (FormGroup).")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Employer une case pour un réglage appliqué immédiatement : utilisez Toggle.", "Use a checkbox for an instantly applied setting: use Toggle.")}</li>
          <li>{fr("Des libellés à la double négation.", "Double-negative labels.")}</li>
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
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Libellé visible de la case.", "Visible label of the checkbox.")}</td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Texte d'aide sous le libellé.", "Helper text below the label.")}</td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("Active l'état erreur (aria-invalid).", "Triggers the error state (aria-invalid).")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le <label>.", "Class(es) on the <label>.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLInputAttributes</code></td><td>N/A</td><td>{fr("Propagés sur l'<input> (checked, disabled, name, onchange…).", "Spread onto the <input> (checked, disabled, name, onchange…).")}</td></tr>
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
