<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import { Badge, MultiSelect } from "@sentropic/design-system-svelte";
  import type { MultiSelectOption } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      intro:
        "Sélection multiple avec champ de recherche filtrant, options en liste `listbox`, jetons supprimables pour les valeurs choisies et compteur de sélection.",
      basicTitle: "Sélection avec recherche",
      preselectedTitle: "Valeurs pré-sélectionnées et option désactivée",
      errorTitle: "État invalide",
      disabledTitle: "Désactivé",
      usageTitle: "Notes d’usage",
      usageNote1:
        "`selected` est un tableau de `value` liable ; chaque bascule réémet `onchange(selected)` avec le tableau à jour.",
      usageNote2:
        "Les libellés d’interface (`placeholder`, `searchPlaceholder`, `noResultsLabel`, `toggleLabel`, `removeLabel`) ont des valeurs anglaises par défaut ; fournissez-les pour localiser.",
      usageNote3:
        "Une option avec `disabled: true` reste visible mais non sélectionnable.",
      teamLabel: "Membres de l’équipe",
      teamHelper: "Filtrez puis cochez les personnes.",
      stackLabel: "Stack technique",
      regionLabel: "Régions de déploiement",
      regionError: "Sélectionnez au moins une région.",
      lockedLabel: "Permissions (verrouillé)",
      placeholder: "Sélectionner…",
      searchPlaceholder: "Filtrer",
      noResults: "Aucun résultat",
      toggle: "Afficher les options",
      remove: "Retirer"
    },
    en: {
      intro:
        "Multi-select with a filtering search field, options in a `listbox`, removable tags for chosen values and a selection counter.",
      basicTitle: "Selection with search",
      preselectedTitle: "Pre-selected values and a disabled option",
      errorTitle: "Invalid state",
      disabledTitle: "Disabled",
      usageTitle: "Usage notes",
      usageNote1:
        "`selected` is a bindable array of `value`s; every toggle re-emits `onchange(selected)` with the updated array.",
      usageNote2:
        "UI labels (`placeholder`, `searchPlaceholder`, `noResultsLabel`, `toggleLabel`, `removeLabel`) default to English strings; provide them to localize.",
      usageNote3:
        "An option with `disabled: true` stays visible but cannot be selected.",
      teamLabel: "Team members",
      teamHelper: "Filter then check people.",
      stackLabel: "Tech stack",
      regionLabel: "Deployment regions",
      regionError: "Select at least one region.",
      lockedLabel: "Permissions (locked)",
      placeholder: "Select…",
      searchPlaceholder: "Filter",
      noResults: "No results",
      toggle: "Toggle options",
      remove: "Remove"
    }
  } as const;

  const text = () => copy[locale.value];

  const teamOptions: MultiSelectOption[] = [
    { label: "Avery", value: "avery" },
    { label: "Bao", value: "bao" },
    { label: "Chiara", value: "chiara" },
    { label: "Diego", value: "diego" },
    { label: "Esme", value: "esme" }
  ];

  const stackOptions: MultiSelectOption[] = [
    { label: "Svelte", value: "svelte" },
    { label: "TypeScript", value: "ts" },
    { label: "Vite", value: "vite" },
    { label: "Legacy jQuery", value: "jquery", disabled: true }
  ];

  const regionOptions: MultiSelectOption[] = [
    { label: "Montréal (ca-mtl)", value: "ca-mtl" },
    { label: "Paris (eu-par)", value: "eu-par" },
    { label: "Singapore (ap-sgp)", value: "ap-sgp" }
  ];

  let team = $state<string[]>([]);
  let stack = $state<string[]>(["svelte", "ts"]);
  let regions = $state<string[]>([]);
  let lastTeamChange = $state<string[]>([]);

  function handleTeamChange(next: string[]) {
    lastTeamChange = next;
  }
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaire</p>
    <div class="docs-hero-title">
      <h1>MultiSelect</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <TabbedExample nodes={getExample("multiselect")?.nodes ?? []} />


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example docs-demo-block" aria-label={text().basicTitle}>
      <h3>{text().basicTitle}</h3>
      <MultiSelect
        label={text().teamLabel}
        helperText={text().teamHelper}
        options={teamOptions}
        bind:selected={team}
        onchange={handleTeamChange}
        placeholder={text().placeholder}
        searchPlaceholder={text().searchPlaceholder}
        noResultsLabel={text().noResults}
        toggleLabel={text().toggle}
        removeLabel={text().remove}
      />
      <p class="docs-demo-note">
        {locale.value === "fr" ? "Dernier `onchange`" : "Last `onchange`"}
        : <code>{JSON.stringify(lastTeamChange)}</code>
      </p>
    </div>

    <div class="docs-example docs-demo-block" aria-label={text().preselectedTitle}>
      <h3>{text().preselectedTitle}</h3>
      <MultiSelect
        label={text().stackLabel}
        options={stackOptions}
        bind:selected={stack}
        placeholder={text().placeholder}
        searchPlaceholder={text().searchPlaceholder}
        noResultsLabel={text().noResults}
        toggleLabel={text().toggle}
        removeLabel={text().remove}
      />
    </div>

    <div class="docs-example docs-demo-block" aria-label={text().errorTitle}>
      <h3>{text().errorTitle}</h3>
      <MultiSelect
        label={text().regionLabel}
        size="sm"
        options={regionOptions}
        bind:selected={regions}
        errorText={text().regionError}
        placeholder={text().placeholder}
        searchPlaceholder={text().searchPlaceholder}
        noResultsLabel={text().noResults}
        toggleLabel={text().toggle}
        removeLabel={text().remove}
      />
    </div>

    <div class="docs-example docs-demo-block" aria-label={text().disabledTitle}>
      <h3>{text().disabledTitle}</h3>
      <MultiSelect
        label={text().lockedLabel}
        options={regionOptions}
        selected={["eu-par"]}
        disabled
        placeholder={text().placeholder}
        toggleLabel={text().toggle}
        removeLabel={text().remove}
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>options</code></td><td><code>MultiSelectOption[]</code></td><td><em>requis</em></td></tr>
        <tr><td><code>selected</code></td><td><code>string[]</code> (<code>$bindable</code>)</td><td><code>[]</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>errorText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>placeholder</code></td><td><code>string</code></td><td><code>"Select items"</code></td></tr>
        <tr><td><code>searchPlaceholder</code></td><td><code>string</code></td><td><code>"Filter"</code></td></tr>
        <tr><td><code>noResultsLabel</code></td><td><code>string</code></td><td><code>"No results"</code></td></tr>
        <tr><td><code>toggleLabel</code></td><td><code>string</code></td><td><code>"Toggle options"</code></td></tr>
        <tr><td><code>removeLabel</code></td><td><code>string</code></td><td><code>"Remove"</code></td></tr>
        <tr><td><code>listLabel</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>onchange</code></td><td><code>(selected: string[]) =&gt; void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>...rest</code></td><td><code>HTMLAttributes&lt;HTMLDivElement&gt;</code> (sauf <code>class</code> / <code>onchange</code>)</td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
    <p class="docs-demo-note">
      <code>MultiSelectOption</code> : <code>{"{ label: string; value: string; disabled?: boolean }"}</code>
    </p>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote1}</p>
    <p class="docs-demo-note">{text().usageNote2}</p>
    <p class="docs-demo-note">{text().usageNote3}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-field-gap</code></li>
      <li><code>--st-component-field-labelText</code></li>
      <li><code>--st-component-field-helpText</code></li>
      <li><code>--st-component-field-errorText</code></li>
      <li><code>--st-component-field-maxWidth</code></li>
      <li><code>--st-component-control-background</code></li>
      <li><code>--st-component-control-border</code></li>
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
      <li><code>--st-component-control-radius</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-control-mdHeight</code></li>
      <li><code>--st-component-dropdown-background</code></li>
      <li><code>--st-component-dropdown-border</code></li>
      <li><code>--st-component-dropdown-shadow</code></li>
      <li><code>--st-component-dropdown-optionHoverBackground</code></li>
      <li><code>--st-component-popover-zIndex</code></li>
      <li><code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-semantic-action-primary</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-feedback-error</code></li>
      <li><code>--st-radius-pill</code></li>
      <li><code>--st-motion-fast</code></li>
      <li><code>--st-motion-easing</code></li>
    </ul>
  </section>
</div>
