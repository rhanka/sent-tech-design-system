<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      kicker: "Composant · Données",
      badge: "Documenté",
      previewTitle: "Aperçu live",
      intro:
        "FilterPill représente un filtre actif sous forme de pilule. Elle affiche un champ, un opérateur optionnel et la valeur sélectionnée, avec un bouton de retrait accessible.",
      examplesTitle: "Exemples",
      tonesTitle: "Tonalités",
      tonesDesc: "Cinq tonalités sémantiques alignées sur les feedback tokens : neutral (défaut), success, warning, error, info.",
      statesTitle: "États",
      statesDesc: "Active (aria-pressed), inactive, disabled. L'état disabled réduit l'opacité et désactive les interactions.",
      noRemoveTitle: "Sans bouton de retrait",
      noRemoveDesc: "Passez removable={false} pour masquer le bouton ✕.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "Le conteneur est un `<span role=\"group\">` non focusable. Le corps est un `<button aria-pressed>` et le bouton de retrait a un `aria-label` explicite. Suppr/Backspace sur le corps déclenche `onRemove`.",
      usageTitle: "Notes d'usage",
      usageNote:
        "Utilisez FilterBar pour regrouper plusieurs FilterPill avec un bouton « Tout effacer ». Câblez `onRemove` dans l'état de votre application pour retirer le filtre.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "FilterPill represents an active filter as a pill. It shows a field, an optional operator, and the selected value, with an accessible remove button.",
      examplesTitle: "Examples",
      tonesTitle: "Tones",
      tonesDesc: "Five semantic tones aligned with feedback tokens: neutral (default), success, warning, error, info.",
      statesTitle: "States",
      statesDesc: "Active (aria-pressed), inactive, disabled. Disabled state reduces opacity and disables interactions.",
      noRemoveTitle: "Without remove button",
      noRemoveDesc: "Pass removable={false} to hide the ✕ button.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "The container is a non-focusable `<span role=\"group\">`. The body is a `<button aria-pressed>` and the remove button has an explicit `aria-label`. Delete/Backspace on the body fires `onRemove`.",
      usageTitle: "Usage notes",
      usageNote:
        "Use FilterBar to group multiple FilterPills with a clear-all button. Wire `onRemove` into your application state to remove the filter.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const tonesDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "fp-row" },
      children: [
        { comp: "FilterPill", props: { field: "Pays", value: "France", tone: "neutral", active: true, removable: true } },
        { comp: "FilterPill", props: { field: "Statut", value: "Validé", tone: "success", active: true, removable: true } },
        { comp: "FilterPill", props: { field: "Quota", value: "Élevé", tone: "warning", active: true, removable: true } },
        { comp: "FilterPill", props: { field: "Erreur", value: "404", tone: "error", active: true, removable: true } },
        { comp: "FilterPill", props: { field: "Type", value: "Info", tone: "info", active: true, removable: true } }
      ]
    }
  ]);

  const statesDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "fp-row" },
      children: [
        { comp: "FilterPill", props: { field: "Pays", operator: "in", value: "France, Italie, Espagne", active: true, removable: true } },
        { comp: "FilterPill", props: { field: "Statut", value: "Actif", active: false, removable: true } },
        { comp: "FilterPill", props: { field: "Région", value: "Nord", active: true, removable: true, disabled: true } }
      ]
    }
  ]);

  const noRemoveDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "fp-row" },
      children: [
        { comp: "FilterPill", props: { field: "Période", operator: ">=", value: "2025-01-01", active: true, removable: false } },
        { comp: "FilterPill", props: { field: "Source", value: "Import CSV", active: true, removable: false, tone: "info" } }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>FilterPill</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <TriRender nodes={getExample("filterpill")?.nodes ?? []} label={text().previewTitle} />

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().tonesTitle}</h3>
    <p class="docs-demo-note">{text().tonesDesc}</p>
    <TriRender nodes={tonesDemo} label={text().tonesTitle} />

    <h3 class="docs-demo-title">{text().statesTitle}</h3>
    <p class="docs-demo-note">{text().statesDesc}</p>
    <TriRender nodes={statesDemo} label={text().statesTitle} />

    <h3 class="docs-demo-title">{text().noRemoveTitle}</h3>
    <p class="docs-demo-note">{text().noRemoveDesc}</p>
    <TriRender nodes={noRemoveDemo} label={text().noRemoveTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>field</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>value</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>operator</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>active</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>removable</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>tone</code></td><td><code>"neutral" | "success" | "warning" | "error" | "info"</code></td><td><code>"neutral"</code></td></tr>
        <tr><td><code>onClick</code></td><td><code>() =&gt; void</code></td><td><em>{text().optional}</em></td></tr>
        <tr><td><code>onRemove</code></td><td><code>() =&gt; void</code></td><td><em>{text().optional}</em></td></tr>
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
      <li><code>--st-semantic-border-interactive</code></li>
      <li><code>--st-semantic-action-primary</code></li>
      <li><code>--st-semantic-feedback-success</code></li>
      <li><code>--st-semantic-feedback-warning</code></li>
      <li><code>--st-semantic-feedback-error</code></li>
      <li><code>--st-semantic-feedback-info</code></li>
      <li><code>--st-component-filterPill-activeBackground</code></li>
      <li><code>--st-component-filterPill-activeText</code></li>
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
