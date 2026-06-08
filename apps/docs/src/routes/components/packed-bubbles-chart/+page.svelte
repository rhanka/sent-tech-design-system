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
        "PackedBubblesChart tasse des cercles dont l'aire est proportionnelle à la valeur. Le rayon suit sqrt(value) et le placement est déterministe, sans dépendance externe.",
      examplesTitle: "Exemples",
      usageGraphTitle: "Langages par usage",
      usageGraphDesc: "Aire ∝ valeur ; les plus grosses bulles occupent le centre.",
      tonesTitle: "Tons explicites",
      tonesDesc: "Chaque bulle peut fixer son `tone` ; sinon la palette catégorielle tourne.",
      apiTitle: "API du composant",
      defaultLabel: "Par défaut",
      required: "requis",
      optional: "optionnel",
      a11yTitle: "Accessibilité",
      a11yNote:
        "`label` nomme le graphique (role=img). Chaque bulle est exposée dans une liste accessible au format « libellé : valeur ».",
      usageTitle: "Notes d'usage",
      usageNote:
        "Les valeurs non finies ou négatives/nulles sont ignorées. Les libellés n'apparaissent que dans les bulles suffisamment grandes, avec une couleur de texte calculée par contraste.",
      tokensTitle: "Tokens"
    },
    en: {
      kicker: "Component · Data",
      badge: "Documented",
      previewTitle: "Live preview",
      intro:
        "PackedBubblesChart packs circles whose area is proportional to value. The radius follows sqrt(value) and placement is deterministic, with no external dependency.",
      examplesTitle: "Examples",
      usageGraphTitle: "Languages by usage",
      usageGraphDesc: "Area ∝ value; the largest bubbles sit in the center.",
      tonesTitle: "Explicit tones",
      tonesDesc: "Each bubble may set its `tone`; otherwise the categorical palette cycles.",
      apiTitle: "Component API",
      defaultLabel: "Default",
      required: "required",
      optional: "optional",
      a11yTitle: "Accessibility",
      a11yNote:
        "`label` names the chart (role=img). Each bubble is exposed in an accessible list as “label: value”.",
      usageTitle: "Usage notes",
      usageNote:
        "Non-finite or non-positive values are ignored. Labels only appear in bubbles large enough, with a contrast-aware text color.",
      tokensTitle: "Tokens"
    }
  } as const;

  const text = () => copy[locale.value];

  const usageData = [
    { label: "TypeScript", value: 120, tone: "category1" },
    { label: "Python", value: 80, tone: "category2" },
    { label: "Rust", value: 45, tone: "category3" },
    { label: "Go", value: 30, tone: "category4" },
    { label: "Elixir", value: 14, tone: "category5" }
  ];

  const tonesData = [
    { label: "Design", value: 60, tone: "category6" },
    { label: "Ingénierie", value: 90, tone: "category7" },
    { label: "Produit", value: 40, tone: "category8" }
  ];

  const usageDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper chart-wrapper--radial" },
      children: [
        {
          comp: "PackedBubblesChart",
          props: {
            label: locale.value === "fr" ? "Langages par usage" : "Languages by usage",
            data: usageData
          }
        }
      ]
    }
  ]);

  const tonesDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "chart-wrapper chart-wrapper--radial" },
      children: [
        {
          comp: "PackedBubblesChart",
          props: {
            label: locale.value === "fr" ? "Tons explicites" : "Explicit tones",
            data: tonesData
          }
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>PackedBubblesChart</h1>
      <Badge tone="neutral">{text().badge}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <TriRender nodes={getExample("packedbubbleschart")?.nodes ?? []} label={text().previewTitle} />

  <section class="docs-section">
    <h2>{text().examplesTitle}</h2>

    <h3 class="docs-demo-title">{text().usageGraphTitle}</h3>
    <p class="docs-demo-note">{text().usageGraphDesc}</p>
    <TriRender nodes={usageDemo} label={text().usageGraphTitle} />

    <h3 class="docs-demo-title">{text().tonesTitle}</h3>
    <p class="docs-demo-note">{text().tonesDesc}</p>
    <TriRender nodes={tonesDemo} label={text().tonesTitle} />
  </section>

  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{text().defaultLabel}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>data</code></td><td><code>PackedBubblesChartDatum[]</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{text().required}</em></td></tr>
        <tr><td><code>width</code></td><td><code>number</code></td><td><code>360</code></td></tr>
        <tr><td><code>height</code></td><td><code>number</code></td><td><code>360</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{text().optional}</em></td></tr>
      </tbody>
    </table>

    <p class="docs-demo-note">
      <code>PackedBubblesChartDatum</code> = <code>{`{ label: string; value: number; tone?: PackedBubblesChartTone }`}</code>
      ·
      <code>PackedBubblesChartTone</code> = <code>"category1" | ... | "category8"</code>.
    </p>
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
      <li><code>--st-semantic-data-category1</code> ... <code>--st-semantic-data-category8</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-surface-inverse</code></li>
      <li><code>--st-semantic-text-inverse</code></li>
      <li><code>--st-radius-sm</code></li>
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

  :global(.chart-wrapper) {
    width: 100%;
    max-width: 560px;
    margin-top: 0.75rem;
  }

  :global(.chart-wrapper--radial) {
    max-width: 420px;
  }
</style>
