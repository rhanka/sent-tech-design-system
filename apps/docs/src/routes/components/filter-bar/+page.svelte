<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      previewTitle: "Aperçu live",
      intro:
        "FilterBar regroupe des composants FilterPill dans une barre horizontale avec retour à la ligne. Elle offre un bouton optionnel « Tout effacer » câblé via `onClearAll`.",
      examplesTitle: "Exemples",
      basicTitle: "Barre de filtres",
      basicDesc: "Une FilterBar avec trois FilterPill actives et un bouton « Tout effacer ».",
      noClearTitle: "Sans bouton d'effacement",
      noClearDesc: "Omettez `onClearAll` pour masquer le bouton d'effacement global.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "Le conteneur est un `<div role=\"group\">` avec `aria-label`. Il isole les filtres actifs pour les utilisateurs de lecteur d'écran.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Placez des FilterPill comme enfants directs. Le `clearAllLabel` est personnalisable si votre contexte nécessite un libellé différent.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "FilterBar groups FilterPill components in a wrapping horizontal bar. It offers an optional clear-all button wired via `onClearAll`.",
      examplesTitle: "Examples",
      basicTitle: "Filter bar",
      basicDesc: "A FilterBar with three active FilterPills and a clear-all button.",
      noClearTitle: "Without clear-all button",
      noClearDesc: "Omit `onClearAll` to hide the global clear button.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "The container is a `<div role=\"group\">` with `aria-label`. It isolates active filters for screen reader users.",
      usageTitle: "Usage notes",
      usageNote:
        "Place FilterPills as direct children. The `clearAllLabel` is customizable if your context needs a different label.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const basicDemo = $derived<NodeSpec[]>([
    {
      comp: "FilterBar",
      props: { label: locale.value === "fr" ? "Filtres actifs" : "Active filters" },
      children: [
        { comp: "FilterPill", props: { field: "Pays", operator: "in", value: "France, Italie", active: true, removable: true } },
        { comp: "FilterPill", props: { field: "Statut", value: "Actif", active: true, removable: true } },
        { comp: "FilterPill", props: { field: "Date", operator: ">=", value: "2025-01-01", active: true, removable: true } }
      ]
    }
  ]);

  const noClearDemo = $derived<NodeSpec[]>([
    {
      comp: "FilterBar",
      props: { label: locale.value === "fr" ? "Filtres appliqués" : "Applied filters" },
      children: [
        { comp: "FilterPill", props: { field: "Type", value: "Import CSV", active: true, removable: true, tone: "info" } },
        { comp: "FilterPill", props: { field: "Période", value: "T1 2025", active: true, removable: false } }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>FilterBar</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <FrameworkPreview example="filterbar" title={text().previewTitle} />

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().basicTitle}</h3>
    <p class="docs-demo-note">{text().basicDesc}</p>
    <FrameworkDemo nodes={basicDemo} label={text().basicTitle} />

    <h3 class="docs-demo-title">{text().noClearTitle}</h3>
    <p class="docs-demo-note">{text().noClearDesc}</p>
    <FrameworkDemo nodes={noClearDemo} label={text().noClearTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>onClearAll</code></td><td><code>() =&gt; void</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>clearAllLabel</code></td><td><code>string</code></td><td><code>"Tout effacer"</code></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{text().a11yTitle}</h2>
    <p class="docs-demo-note">{text().a11yNote}</p>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote}</p>
  </section>

  <section class="docs-section">
    <h2>{text().tokensTitle}</h2>
    <ul class="docs-token-list">
      <li><code>--st-spacing-2</code></li>
      <li><code>--st-semantic-text-link</code></li>
      <li><code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-semantic-action-primaryHover</code></li>
      <li><code>--st-semantic-border-interactive</code></li>
      <li><code>--st-radius-md</code></li>
      <li><code>--st-motion-fast</code></li>
      <li><code>--st-motion-easing</code></li>
    </ul>
  </section>
</div>

<style>
  .docs-demo-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    color: var(--st-semantic-text-primary);
  }
</style>
