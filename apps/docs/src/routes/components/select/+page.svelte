<script lang="ts">
  import { Badge, Select } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  let tenant = $state("forge");
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Formulaire", "Component · Form")}</p>
    <div class="docs-hero-title">
      <h1>Select</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Sélecteur natif <select> stylé, avec libellé, texte d'aide, état d'erreur et trois tailles. Les options sont passées en enfants comme des <option> natives.",
        "Styled native <select> with label, helper text, error state, and three sizes. Options are passed as children, as native <option> elements."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Choisir une seule valeur dans une liste fermée et connue (5 à ~15 options).", "Pick a single value from a closed, known list (about 5 to 15 options).")}</li>
      <li>{fr("Pour 2 ou 3 choix exclusifs, préférez des boutons radio ; pour une recherche dans une longue liste, le Combobox.", "For 2-3 exclusive choices, prefer radio buttons; for searching a long list, the Combobox.")}</li>
      <li>{fr("Pour une sélection multiple, utilisez MultiSelect.", "For multiple selection, use MultiSelect.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "states")}</h2>
    <div class="docs-example docs-example--stack">
      <h3>{fr("Défaut", "Default")}</h3>
      <Select label={fr("Tenant", "Tenant")} bind:value={tenant}>
        <option value="forge">Forge</option>
        <option value="entropic">Entropic</option>
        <option value="graphify">Graphify</option>
      </Select>
      <p class="docs-demo-note">{fr("Sélection", "Selection")}: <code>{tenant}</code></p>
      <h3>{fr("Avec option vide (placeholder)", "With empty option (placeholder)")}</h3>
      <Select label={fr("Tenant", "Tenant")} helperText={fr("Choisissez un tenant.", "Choose a tenant.")}>
        <option value="">{fr("Sélectionner…", "Select…")}</option>
        <option value="forge">Forge</option>
        <option value="entropic">Entropic</option>
      </Select>
      <h3>{fr("Désactivé", "Disabled")}</h3>
      <Select label={fr("Tenant", "Tenant")} disabled>
        <option value="forge">Forge</option>
      </Select>
      <h3>{fr("Erreur", "Error")}</h3>
      <Select label={fr("Tenant", "Tenant")} invalid errorText={fr("Le tenant est requis.", "Tenant is required.")}>
        <option value="">{fr("Sélectionner…", "Select…")}</option>
        <option value="forge">Forge</option>
      </Select>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "sizes")}</h2>
    <p>{fr("sm (2 rem), md (2,5 rem, défaut), lg (3 rem).", "sm (2 rem), md (2.5 rem, default), lg (3 rem).")}</p>
    <div class="docs-example docs-example--stack">
      <Select label="Small" size="sm"><option>sm</option></Select>
      <Select label="Medium" size="md"><option>md</option></Select>
      <Select label="Large" size="lg"><option>lg</option></Select>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur (.st-field) : libellé + contrôle + message empilés.", "Container (.st-field): label + control + message stacked.")}</li>
      <li>{fr("Contrôle (.st-select) : un <select> natif ; le chevron est natif (base) ou redessiné selon le thème.", "Control (.st-select): a native <select>; the chevron is native (base) or redrawn depending on theme.")}</li>
      <li>{fr("Options : <option> passées en enfants (children).", "Options: <option> elements passed as children.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Élément <select> natif : navigation clavier (flèches), recherche par frappe, et ouverture native.", "Native <select> element: keyboard navigation (arrows), type-ahead, and native open behavior.")}</li>
      <li>{fr("Le libellé englobe le contrôle : association native.", "The label wraps the control: native association.")}</li>
      <li>{fr("aria-invalid=\"true\" en erreur.", "aria-invalid=\"true\" in the error state.")}</li>
      <li>{fr("Une option « vide » sert de placeholder accessible (valeur \"\").", "An empty option acts as an accessible placeholder (value \"\").")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Ordonner les options logiquement (alphabétique ou fréquence).", "Order options logically (alphabetical or by frequency).")}</li>
          <li>{fr("Présélectionner la valeur la plus courante quand c'est sûr.", "Pre-select the most common value when it's safe.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Mettre une longue liste à parcourir : préférez Combobox.", "Use a long scroll list: prefer Combobox.")}</li>
          <li>{fr("N'avoir que 2 options : des radios sont plus lisibles.", "Offer only 2 options: radios are clearer.")}</li>
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
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td><td>{fr("Hauteur du contrôle.", "Control height.")}</td></tr>
        <tr><td><code>value</code></td><td><code>string | string[] | number | null</code></td><td><code>""</code></td><td>{fr("Valeur sélectionnée, bindable.", "Selected value, bindable.")}</td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{fr("options", "options")}</em></td><td>{fr("Les <option> du sélecteur.", "The select's <option> elements.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) du conteneur.", "Container class(es).")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLSelectAttributes</code></td><td>—</td><td>{fr("Propagés sur le <select> (required, name, disabled…).", "Spread onto the <select> (required, name, disabled…).")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-control-background</code></li>
      <li><code>--st-component-control-border</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-control-invalidBorder</code></li>
      <li><code>--st-component-control-anatomy-field-selectChevron</code></li>
      <li><code>--st-component-control-anatomy-field-selectPaddingRight</code></li>
      <li><code>--st-component-field-labelText</code></li>
      <li><code>--st-component-field-helpText</code></li>
    </ul>
  </section>
</div>
