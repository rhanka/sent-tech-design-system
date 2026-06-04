<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc Aperçu live).
  const statesDemo: NodeSpec[] = $derived([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { el: "h3", children: [fr("Défaut", "Default")] },
        {
          comp: "Textarea",
          props: {
            label: fr("Description", "Description"),
            placeholder: fr("Contexte opérationnel court", "Short operational context")
          }
        },
        { el: "h3", children: [fr("Avec texte d'aide et rows", "With helper text and rows")] },
        {
          comp: "Textarea",
          props: {
            label: fr("Notes de version", "Release notes"),
            rows: 4,
            helperText: fr("Markdown pris en charge.", "Markdown is supported.")
          }
        },
        { el: "h3", children: [fr("Désactivé", "Disabled")] },
        {
          comp: "Textarea",
          props: {
            label: fr("Description archivée", "Archived description"),
            value: fr("Lecture seule.", "Read only."),
            disabled: true
          }
        },
        { el: "h3", children: [fr("Erreur", "Error")] },
        {
          comp: "Textarea",
          props: {
            label: fr("Retour", "Feedback"),
            rows: 4,
            invalid: true,
            errorText: fr("Un retour est requis avant l'envoi.", "Feedback is required before submission.")
          }
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Formulaire", "Component · Form")}</p>
    <div class="docs-hero-title">
      <h1>Textarea</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Champ de saisie texte multi-ligne, redimensionnable verticalement, avec libellé, texte d'aide et état d'erreur. Partage l'anatomie de champ de l'Input.",
        "Multi-line text field, vertically resizable, with label, helper text, and error state. Shares the Input field anatomy."
      )}
    </p>
  </section>

  <FrameworkPreview example="textarea" title="Aperçu live" />

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Saisir un texte libre sur plusieurs lignes : description, commentaire, note.", "Capture free-form multi-line text: description, comment, note.")}</li>
      <li>{fr("Pour une seule ligne, utilisez Input.", "For a single line, use Input.")}</li>
      <li>{fr("Réglez la hauteur de départ avec l'attribut rows.", "Set the initial height with the rows attribute.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "states")}</h2>
    <FrameworkDemo nodes={statesDemo} label={t(locale.value, "states")} />
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur (.st-field) : libellé + zone + message empilés.", "Container (.st-field): label + area + message stacked.")}</li>
      <li>{fr("Zone (.st-textarea) : hauteur minimale de 6 rem, resize vertical uniquement.", "Area (.st-textarea): 6 rem minimum height, vertical resize only.")}</li>
      <li>{fr("Message : helperText ou errorText, jamais les deux.", "Message: helperText or errorText, never both.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Le libellé englobe la <textarea> : association native.", "The label wraps the <textarea>: native association.")}</li>
      <li>{fr("aria-invalid=\"true\" est posé en erreur.", "aria-invalid=\"true\" is set in the error state.")}</li>
      <li>{fr("Le resize vertical reste possible pour l'utilisateur ; ne le bloquez pas sans raison.", "Vertical resize stays available to the user; don't disable it without reason.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Dimensionner rows selon le contenu attendu.", "Size rows to the expected content.")}</li>
          <li>{fr("Indiquer une limite de caractères via helperText si pertinent.", "Indicate a character limit via helperText when relevant.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Utiliser une Textarea pour une valeur d'une ligne.", "Use a Textarea for a single-line value.")}</li>
          <li>{fr("Cacher le libellé derrière le placeholder.", "Hide the label behind the placeholder.")}</li>
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
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Libellé visible.", "Visible label.")}</td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Texte d'aide (masqué si errorText).", "Helper text (hidden when errorText is set).")}</td></tr>
        <tr><td><code>errorText</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Message d'erreur ; active l'état invalide.", "Error message; triggers the invalid state.")}</td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("Force l'état erreur.", "Forces the error state.")}</td></tr>
        <tr><td><code>value</code></td><td><code>string | null</code></td><td><code>""</code></td><td>{fr("Valeur, bindable via bind:value.", "Value, bindable via bind:value.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) du conteneur.", "Container class(es).")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLTextareaAttributes</code></td><td>N/A</td><td>{fr("Propagés sur la <textarea> (rows, placeholder, maxlength…).", "Spread onto the <textarea> (rows, placeholder, maxlength…).")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-field-labelText</code></li>
      <li><code>--st-component-field-helpText</code></li>
      <li><code>--st-component-field-errorText</code></li>
      <li><code>--st-component-control-background</code></li>
      <li><code>--st-component-control-border</code></li>
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-control-invalidBorder</code></li>
      <li><code>--st-component-control-disabledBackground</code></li>
    </ul>
  </section>
</div>
