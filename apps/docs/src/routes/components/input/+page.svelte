<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import type { NodeSpec } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la section bascule en onglets svelte/react/vue, comme password-input).
  // État statique : la valeur est figée pour la démonstration multi-framework.
  const statesDemo: NodeSpec[] = $derived([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "Input", props: { label: fr("Titre du projet", "Project title"), placeholder: "Sent Tech Forge" } },
        {
          comp: "Input",
          props: {
            label: fr("Identifiant d'espace", "Workspace slug"),
            placeholder: "forge-playground",
            helperText: fr("Minuscules, chiffres et tirets uniquement.", "Lowercase letters, digits, and dashes only.")
          }
        },
        { comp: "Input", props: { label: fr("Titre du projet", "Project title"), value: fr("Lecture seule", "Read-only"), disabled: true } },
        {
          comp: "Input",
          props: {
            label: fr("Adresse e-mail", "Contact email"),
            value: "user@@domain",
            invalid: true,
            errorText: fr("Adresse e-mail invalide.", "Invalid email address.")
          }
        }
      ]
    }
  ]);

  const bindingDemo: NodeSpec[] = $derived([
    {
      comp: "Input",
      props: {
        label: fr("Recherche", "Search"),
        value: "forge-playground",
        modelValue: "forge-playground",
        placeholder: fr("Tapez…", "Type…")
      }
    }
  ]);

  const sizesDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "Input", props: { label: "Small", size: "sm", placeholder: "sm" } },
        { comp: "Input", props: { label: "Medium", size: "md", placeholder: "md" } },
        { comp: "Input", props: { label: "Large", size: "lg", placeholder: "lg" } }
      ]
    }
  ];

  const typesDemo: NodeSpec[] = $derived([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "Input", props: { label: "Email", type: "email", placeholder: "user@domain.com", autocomplete: "email" } },
        { comp: "Input", props: { label: fr("Téléphone", "Phone"), type: "tel", inputmode: "tel", placeholder: "+1 555 010 0101" } },
        { comp: "Input", props: { label: fr("Quantité", "Quantity"), type: "number", min: 0, max: 99, placeholder: "0" } }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Formulaire", "Component · Form")}</p>
    <div class="docs-hero-title">
      <h1>Input</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Champ de saisie texte sur une ligne, avec libellé, texte d'aide, état d'erreur et trois tailles. Construit sur un <input> natif lié à son <label>.",
        "Single-line text field with label, helper text, error state, and three sizes. Built on a native <input> tied to its <label>."
      )}
    </p>
  </section>

  <TabbedExample nodes={getExample("input")?.nodes ?? []} />

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Saisir une valeur courte sur une ligne : nom, e-mail, identifiant, URL.", "Capture a short single-line value: name, email, slug, URL.")}</li>
      <li>{fr("Pour un texte multi-ligne, utilisez Textarea ; pour un choix dans une liste, Select.", "For multi-line text use Textarea; for choosing from a list, Select.")}</li>
      <li>{fr("Toujours fournir un libellé visible (prop label), pas seulement un placeholder.", "Always provide a visible label (label prop), not just a placeholder.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "states")}</h2>
    <p>
      {fr(
        "Défaut, focus (anneau thémé), saisie, désactivé, et erreur. L'erreur s'active via invalid et/ou errorText ; errorText remplace alors le helperText.",
        "Default, focus (themed ring), filled, disabled, and error. Error is triggered via invalid and/or errorText; errorText then replaces helperText."
      )}
    </p>
    <TabbedExample
      nodes={statesDemo}
      title={fr("Défaut · aide · désactivé · erreur", "Default · helper · disabled · error")}
    />
    <TabbedExample nodes={bindingDemo} title={fr("Saisie liée (bind)", "Bound value (bind)")} />
    <p class="docs-demo-note">
      {fr(
        "La valeur est bindable (value en Svelte/React, modelValue en Vue) ; figée ici pour la démonstration multi-framework.",
        "The value is bindable (value in Svelte/React, modelValue in Vue); frozen here for the multi-framework demo."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "sizes")}</h2>
    <p>{fr("sm (2 rem), md (2,5 rem, défaut), lg (3 rem).", "sm (2 rem), md (2.5 rem, default), lg (3 rem).")}</p>
    <TabbedExample nodes={sizesDemo} title={t(locale.value, "sizes")} />
  </section>

  <section class="docs-section">
    <h2>{fr("Types HTML", "HTML types")}</h2>
    <p>
      {fr(
        "Tous les attributs natifs sont propagés : passez type, required, autocomplete, inputmode, maxlength, etc.",
        "All native attributes are spread: pass type, required, autocomplete, inputmode, maxlength, and so on."
      )}
    </p>
    <TabbedExample nodes={typesDemo} title={fr("Types HTML", "HTML types")} />
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur (.st-field) : libellé + contrôle + message empilés.", "Container (.st-field): label + control + message stacked.")}</li>
      <li>{fr("Libellé (.st-field__label) lié au champ par le <label> englobant.", "Label (.st-field__label) tied to the field by the wrapping <label>.")}</li>
      <li>{fr("Contrôle (.st-control) : la boîte de saisie, avec bordure, focus et états.", "Control (.st-control): the input box, with border, focus, and states.")}</li>
      <li>{fr("Message : helperText (secondaire) ou errorText (rouge), jamais les deux.", "Message: helperText (secondary) or errorText (red), never both.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Le libellé est rendu dans un <label> qui englobe l'<input> : association native, pas besoin de for/id.", "The label is rendered inside a <label> wrapping the <input>: native association, no for/id needed.")}</li>
      <li>{fr("En erreur, aria-invalid=\"true\" est posé sur le champ.", "In the error state, aria-invalid=\"true\" is set on the field.")}</li>
      <li>{fr("Le focus est toujours visible (bordure + anneau selon le thème).", "Focus is always visible (border + ring depending on theme).")}</li>
      <li>{fr("N'utilisez pas le placeholder comme libellé : il disparaît à la saisie.", "Don't use the placeholder as a label: it disappears once typing starts.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Libellé court et explicite au-dessus du champ.", "Short, explicit label above the field.")}</li>
          <li>{fr("Message d'erreur actionnable décrivant comment corriger.", "Actionable error message describing how to fix it.")}</li>
          <li>{fr("Texte d'aide pour les formats attendus.", "Helper text for expected formats.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Remplacer le libellé par un simple placeholder.", "Replace the label with a placeholder only.")}</li>
          <li>{fr("Afficher helperText et errorText en même temps.", "Show helperText and errorText at the same time.")}</li>
          <li>{fr("Désactiver un champ sans expliquer pourquoi.", "Disable a field without explaining why.")}</li>
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
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Libellé visible du champ.", "Visible field label.")}</td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Texte d'aide sous le champ (masqué si errorText).", "Helper text below the field (hidden when errorText is set).")}</td></tr>
        <tr><td><code>errorText</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Message d'erreur ; active aussi l'état invalide.", "Error message; also triggers the invalid state.")}</td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("Force l'état erreur (aria-invalid).", "Forces the error state (aria-invalid).")}</td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td><td>{fr("Hauteur du contrôle.", "Control height.")}</td></tr>
        <tr><td><code>value</code></td><td><code>string | number | null</code></td><td><code>""</code></td><td>{fr("Valeur, bindable via bind:value.", "Value, bindable via bind:value.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) ajoutée(s) au conteneur.", "Class(es) added to the container.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLInputAttributes</code></td><td>N/A</td><td>{fr("Propagés sur l'<input> (type, placeholder, required, autocomplete…).", "Spread onto the <input> (type, placeholder, required, autocomplete…).")}</td></tr>
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
      <li><code>--st-component-control-placeholderText</code></li>
    </ul>
  </section>
</div>
