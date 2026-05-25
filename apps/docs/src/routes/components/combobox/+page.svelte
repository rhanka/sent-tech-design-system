<script lang="ts">
  import { Badge, Combobox, type ComboboxOption } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      intro:
        "Champ texte avec autocomplete, liste filtrée et raccourcis clavier pour aller rapidement de la saisie libre à la sélection.",
      usageTitle: "Notes d’usage",
      usageNote1:
        "La prop `options` définit la source. `value` contient toujours le libellé affiché dans l’input ; utilisez `onselect` pour récupérer la valeur métier (`value` de chaque option).",
      usageNote2:
        "`allowCustomValue=false` garde la saisie possible mais évite l’émission côté `onchange` ; la valeur ne peut être validée que par sélection."
    },
    en: {
      intro:
        "Autocomplete text field with a filtered option list and keyboard flow from typing to selection.",
      usageTitle: "Usage notes",
      usageNote1:
        "`options` is the source of truth. `value` always stores the rendered label; use `onselect` when you need the option payload (`value` for each option).",
      usageNote2:
        "`allowCustomValue=false` still allows typing but suppresses `onchange` emission; the value should be accepted only when an option is selected."
    }
  } as const;

  const text = () => copy[locale.value];

  const envOptions: ComboboxOption[] = [
    { label: "Forge", value: "forge" },
    { label: "Entropic", value: "entropic" },
    { label: "Graphify", value: "graphify" },
    { label: "Pulse", value: "pulse", disabled: true },
    { label: "Relay", value: "relay" },
    { label: "Nova", value: "nova" }
  ];

  let smValue = $state("");
  let mdValue = $state("");
  let lgValue = $state("");
  let searchValue = $state("");
  let strictValue = $state("");
  let errorValue = $state("");
  let disabledValue = $state("");
  let lastSelection = $state<string | null>(null);
  let lastInput = $state("");

  function handleSelect(value: string | Event) {
    if (typeof value === "string") {
      lastSelection = value;
    }
  }

  function handleChange(value: string | Event) {
    if (typeof value === "string") {
      lastInput = value;
    }
  }
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaire</p>
    <h1>
      Combobox
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example" aria-label={t(locale.value, "sizes")}>
      <Combobox
        size="sm"
        label="Environnement (sm)"
        bind:value={smValue}
        options={envOptions}
        placeholder="Tapez Forge…"
      />
      <Combobox
        size="md"
        label="Environnement (md)"
        bind:value={mdValue}
        options={envOptions}
      />
      <Combobox
        size="lg"
        label="Environnement (lg)"
        bind:value={lgValue}
        options={envOptions}
      />
    </div>

    <div class="docs-example" aria-label={t(locale.value, "states")}>
      <Combobox
        label="Sélection contrôlée"
        bind:value={searchValue}
        options={envOptions}
        placeholder="Tapez puis choisissez"
        onselect={handleSelect}
        onchange={handleChange}
      />
      <Combobox
        label="Avec erreur"
        bind:value={errorValue}
        placeholder="Projet requis"
        options={envOptions}
        invalid
        errorText="Un environnement est requis."
      />
      <Combobox
        label="Désactivé"
        bind:value={disabledValue}
        options={envOptions}
        disabled
      />
    </div>

    <div class="docs-example" aria-label={t(locale.value, "validation")}>
      <Combobox
        label={locale.value === "fr" ? "Sélection stricte" : "Strict selection"}
        bind:value={strictValue}
        options={envOptions}
        placeholder={locale.value === "fr" ? "Tapez un environnement" : "Type an environment"}
        allowCustomValue={false}
        clearLabel={locale.value === "fr" ? "Effacer" : "Clear selection"}
        toggleLabel={locale.value === "fr" ? "Afficher les options" : "Toggle options"}
        listLabel={locale.value === "fr" ? "Environnements disponibles" : "Available environments"}
        noResultsLabel={locale.value === "fr" ? "Aucun résultat" : "No results"}
      />
      <p class="docs-demo-note">
        {locale.value === "fr" ? "Dernière option validée" : "Last selected option"} :
        <code>{lastSelection ?? "n/a"}</code> ·
        {locale.value === "fr" ? "dernière saisie" : "last input"} :
        <code>{lastInput === "" ? "n/a" : lastInput}</code>
      </p>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>options</code></td><td><code>ComboboxOption[]</code></td><td><em>required</em></td></tr>
        <tr><td><code>value</code></td><td><code>string</code> (<code>$bindable</code>)</td><td><code>""</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>errorText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>placeholder</code></td><td><code>string</code></td><td><code>"Select or type"</code></td></tr>
        <tr><td><code>allowCustomValue</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>noResultsLabel</code></td><td><code>string</code></td><td><code>"No results"</code></td></tr>
        <tr><td><code>clearLabel</code></td><td><code>string</code></td><td><code>"Clear selection"</code></td></tr>
        <tr><td><code>toggleLabel</code></td><td><code>string</code></td><td><code>"Toggle options"</code></td></tr>
        <tr><td><code>listLabel</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>onselect</code></td><td><code>(value: string) =&gt; void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>onchange</code></td><td><code>(value: string) =&gt; void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote1}</p>
    <p class="docs-demo-note">{text().usageNote2}</p>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "La navigation clavier supporte ArrowDown/ArrowUp, Entrée pour valider l’option active et Escape pour fermer."
        : "Keyboard interactions support ArrowDown/ArrowUp, Enter for active option, and Escape to close."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-field-labelText</code></li>
      <li><code>--st-component-field-helpText</code></li>
      <li><code>--st-component-field-errorText</code></li>
      <li><code>--st-component-field-gap</code></li>
      <li><code>--st-component-field-maxWidth</code></li>
      <li><code>--st-component-control-background</code></li>
      <li><code>--st-component-control-border</code></li>
      <li><code>--st-component-control-radius</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
      <li><code>--st-component-control-invalidBorder</code></li>
      <li><code>--st-component-dropdown-background</code></li>
      <li><code>--st-component-dropdown-border</code></li>
      <li><code>--st-component-dropdown-radius</code></li>
      <li><code>--st-component-dropdown-selectedBackground</code></li>
      <li><code>--st-component-dropdown-selectedText</code></li>
      <li><code>--st-component-dropdown-shadow</code></li>
      <li><code>--st-component-dropdown-text</code></li>
      <li><code>--st-component-control-disabledText</code></li>
      <li><code>--st-component-popover-zIndex</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-text-muted</code></li>
    </ul>
  </section>
</div>
