<script lang="ts">
  import { Badge, ContentSwitcher } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

  const copy = {
    fr: {
      intro:
        "Bascule segmentée (`role=\"tablist\"`) entre plusieurs vues mutuellement exclusives. La valeur sélectionnée est bindable et navigable au clavier (flèches, Home/End).",
      usageTitle: "Notes d’usage",
      usageNote1:
        "`items` est un tableau `{ value, label, disabled? }`. `value` est `$bindable` et identifie l’option active ; `onchange` reçoit la nouvelle `value` uniquement quand elle change.",
      usageNote2:
        "Le clavier est câblé : `ArrowRight`/`ArrowLeft` cyclent (wrap), `Home`/`End` vont aux extrémités. Les items `disabled` sont ignorés à la sélection.",
      usageNote3:
        "Le composant ne rend que la barre de bascule ; l’affichage du contenu associé est piloté côté consommateur via la `value` liée.",
      basicLabel: "Bascule simple",
      sizeLabel: "Tailles",
      stateLabel: "Option désactivée",
      viewportLabel: "Vue active"
    },
    en: {
      intro:
        "Segmented switcher (`role=\"tablist\"`) between mutually exclusive views. The selected value is bindable and keyboard-navigable (arrows, Home/End).",
      usageTitle: "Usage notes",
      usageNote1:
        "`items` is an array of `{ value, label, disabled? }`. `value` is `$bindable` and identifies the active option; `onchange` fires with the new `value` only when it changes.",
      usageNote2:
        "Keyboard is wired: `ArrowRight`/`ArrowLeft` cycle (wrap), `Home`/`End` jump to ends. `disabled` items are skipped on selection.",
      usageNote3:
        "The component renders the switcher bar only; rendering the matching content is the consumer’s responsibility, driven by the bound `value`.",
      basicLabel: "Basic switcher",
      sizeLabel: "Sizes",
      stateLabel: "Disabled option",
      viewportLabel: "Active view"
    }
  } as const;

  const text = () => copy[locale.value];

  const viewItems = [
    { value: "list", label: locale.value === "fr" ? "Liste" : "List" },
    { value: "board", label: locale.value === "fr" ? "Tableau" : "Board" },
    { value: "calendar", label: locale.value === "fr" ? "Calendrier" : "Calendar" }
  ];

  const sizeItems = [
    { value: "all", label: locale.value === "fr" ? "Tout" : "All" },
    { value: "mine", label: locale.value === "fr" ? "À moi" : "Mine" }
  ];

  const stateItems = [
    { value: "draft", label: locale.value === "fr" ? "Brouillon" : "Draft" },
    { value: "review", label: locale.value === "fr" ? "Revue" : "Review" },
    { value: "archived", label: locale.value === "fr" ? "Archivé" : "Archived", disabled: true }
  ];

  let view = $state("list");
  let smView = $state("all");
  let mdView = $state("all");
  let lgView = $state("all");
  let stateView = $state("draft");
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · {t(locale.value, "navigation")}</p>
    <div class="docs-hero-title">
      <h1>ContentSwitcher</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <FrameworkPreview example="contentswitcher" title="Aperçu live" />


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example" aria-label={text().basicLabel}>
      <ContentSwitcher
        items={viewItems}
        bind:value={view}
        label={locale.value === "fr" ? "Mode d’affichage" : "View mode"}
      />
      <p class="docs-demo-note">
        {text().viewportLabel}: <code>{view}</code>
      </p>
    </div>

    <div class="docs-example" aria-label={t(locale.value, "sizes")}>
      <ContentSwitcher
        items={sizeItems}
        size="sm"
        bind:value={smView}
        label="sm"
      />
      <ContentSwitcher
        items={sizeItems}
        size="md"
        bind:value={mdView}
        label="md"
      />
      <ContentSwitcher
        items={sizeItems}
        size="lg"
        bind:value={lgView}
        label="lg"
      />
    </div>

    <div class="docs-example" aria-label={text().stateLabel}>
      <ContentSwitcher
        items={stateItems}
        bind:value={stateView}
        label={locale.value === "fr" ? "Statut" : "Status"}
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
        <tr><td><code>items</code></td><td><code>{`{ value: string; label: string; disabled?: boolean }[]`}</code></td><td><em>{locale.value === "fr" ? "requis" : "required"}</em></td></tr>
        <tr><td><code>value</code></td><td><code>string</code> (<code>$bindable</code>)</td><td><code>""</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>onchange</code></td><td><code>(value: string) =&gt; void</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
      </tbody>
    </table>
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
      <li><code>--st-component-control-radius</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-border-interactive</code></li>
      <li><code>--st-motion-fast</code></li>
      <li><code>--st-motion-easing</code></li>
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>
</div>
