<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      previewTitle: "Aperçu live",
      intro:
        "SelectionChip est un chip compact signalant qu'une dimension est sélectionnée. Il affiche un libellé, un compteur optionnel entre parenthèses et un bouton d'effacement.",
      examplesTitle: "Exemples",
      tonesTitle: "Tonalités",
      tonesDesc: "Cinq tonalités sémantiques : neutral (défaut), success, warning, error, info.",
      withCountTitle: "Avec compteur",
      withCountDesc: "Passez `count` (entier fini) pour afficher le nombre d'éléments sélectionnés.",
      withClearTitle: "Avec bouton d'effacement",
      withClearDesc: "Passez `onClear` pour afficher le bouton ✕. Le callback déclenche l'effacement de la sélection.",
      disabledTitle: "État désactivé",
      disabledDesc: "L'état `disabled` réduit l'opacité et désactive le bouton d'effacement.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "Le span reçoit `aria-disabled` quand disabled. Le compteur est enveloppé dans un `aria-label` pour que les lecteurs d'écran l'annoncent entre parenthèses. Le bouton d'effacement a un `aria-label` explicite.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Idéal pour indiquer des sélections dans des filtres, colonnes de tableau ou barres de contrôle. Combinez avec FilterBar pour des interfaces de filtrage riches.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "SelectionChip is a compact chip indicating that a dimension has active selections. It shows a label, an optional count in parentheses, and a clear button.",
      examplesTitle: "Examples",
      tonesTitle: "Tones",
      tonesDesc: "Five semantic tones: neutral (default), success, warning, error, info.",
      withCountTitle: "With count",
      withCountDesc: "Pass `count` (finite integer) to display the number of selected items.",
      withClearTitle: "With clear button",
      withClearDesc: "Pass `onClear` to show the ✕ button. The callback fires to clear the selection.",
      disabledTitle: "Disabled state",
      disabledDesc: "The `disabled` state reduces opacity and disables the clear button.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "The span receives `aria-disabled` when disabled. The count is wrapped in an `aria-label` for screen readers to announce it in parentheses. The clear button has an explicit `aria-label`.",
      usageTitle: "Usage notes",
      usageNote:
        "Ideal for indicating selections in filters, table columns, or control bars. Combine with FilterBar for rich filtering interfaces.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const tonesDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "fp-row" },
      children: [
        { comp: "SelectionChip", props: { label: "Neutral", count: 3, tone: "neutral" } },
        { comp: "SelectionChip", props: { label: "Success", count: 5, tone: "success" } },
        { comp: "SelectionChip", props: { label: "Warning", count: 2, tone: "warning" } },
        { comp: "SelectionChip", props: { label: "Error", count: 1, tone: "error" } },
        { comp: "SelectionChip", props: { label: "Info", count: 8, tone: "info" } }
      ]
    }
  ]);

  const withCountDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "fp-row" },
      children: [
        { comp: "SelectionChip", props: { label: locale.value === "fr" ? "Sélection" : "Selection", count: 42 } },
        { comp: "SelectionChip", props: { label: locale.value === "fr" ? "Catégorie" : "Category", count: 5, tone: "success" } },
        { comp: "SelectionChip", props: { label: locale.value === "fr" ? "Région" : "Region", count: 3, tone: "info" } },
        { comp: "SelectionChip", props: { label: locale.value === "fr" ? "Tous" : "All" } }
      ]
    }
  ]);

  const disabledDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "fp-row" },
      children: [
        { comp: "SelectionChip", props: { label: locale.value === "fr" ? "Verrouillé" : "Locked", count: 7, disabled: true } },
        { comp: "SelectionChip", props: { label: locale.value === "fr" ? "Archive" : "Archive", count: 12, tone: "error", disabled: true } }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>SelectionChip</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>


  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().tonesTitle}</h3>
    <p class="docs-demo-note">{text().tonesDesc}</p>
    <TabbedExample nodes={tonesDemo} title={text().tonesTitle} />

    <h3 class="docs-demo-title">{text().withCountTitle}</h3>
    <p class="docs-demo-note">{text().withCountDesc}</p>
    <TabbedExample nodes={withCountDemo} title={text().withCountTitle} />

    <h3 class="docs-demo-title">{text().disabledTitle}</h3>
    <p class="docs-demo-note">{text().disabledDesc}</p>
    <TabbedExample nodes={disabledDemo} title={text().disabledTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>count</code></td><td><code>number</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>tone</code></td><td><code>"neutral" | "success" | "warning" | "error" | "info"</code></td><td><code>"neutral"</code></td></tr>
        <tr><td><code>onClear</code></td><td><code>() =&gt; void</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
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
      <li><code>--st-radius-pill</code></li>
      <li><code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-feedback-success</code></li>
      <li><code>--st-semantic-feedback-warning</code></li>
      <li><code>--st-semantic-feedback-error</code></li>
      <li><code>--st-semantic-feedback-info</code></li>
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
