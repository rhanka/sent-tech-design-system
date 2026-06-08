<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      intro:
        "Placeholders de texte animés, utilisables pour les chargements partiels de blocs de contenu.",
      basic: "Ligne simple",
      heading: "Titre simulé",
      paragraph: "Paragraphe simulé",
      custom: "Largeurs personnalisées",
      usageTitle: "Notes d’usage"
    },
    en: {
      intro:
        "Animated text placeholders for partial loading states in content blocks.",
      basic: "Single line",
      heading: "Heading placeholder",
      paragraph: "Paragraph placeholder",
      custom: "Custom widths",
      usageTitle: "Usage notes"
    }
  } as const;

  const text = () => copy[locale.value];

  // Démos en arbre NodeSpec neutre -> rendues dans le framework actif.
  // Note : width/heading/paragraph sont honorés par le moteur Svelte ; React/Vue
  // ne supportent que lines/label, donc `lines` reste précis partout.
  const basicDemo: NodeSpec[] = [{ comp: "SkeletonText", props: { lines: 1 } }];

  const headingDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "SkeletonText", props: { lines: 1, heading: true, width: "10rem" } },
        { comp: "SkeletonText", props: { lines: 1, width: "70%" } },
        { comp: "SkeletonText", props: { lines: 1, width: "58%" } }
      ]
    }
  ];

  const paragraphDemo: NodeSpec[] = [{ comp: "SkeletonText", props: { lines: 4, paragraph: true } }];

  const customDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "SkeletonText", props: { lines: 3, width: "100%" } },
        { comp: "SkeletonText", props: { lines: 2, width: "85%" } }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Feedback" : "Component · Feedback"}
    </p>
    <div class="docs-hero-title">
      <h1>SkeletonText</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <TriRender nodes={getExample("skeletontext")?.nodes ?? []} label="Aperçu live" />


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <TriRender nodes={basicDemo} label={text().basic} />

    <TriRender nodes={headingDemo} label={text().heading} />

    <TriRender nodes={paragraphDemo} label={text().paragraph} />

    <TriRender nodes={customDemo} label={text().custom} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>lines</code></td><td><code>number</code></td><td><code>1</code></td></tr>
        <tr><td><code>width</code></td><td><code>string</code></td><td><em>auto</em> (100%)</td></tr>
        <tr><td><code>heading</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>paragraph</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>...props</code></td><td><code>HTMLAttributes&lt;HTMLDivElement&gt;</code></td><td><em>transmis</em></td></tr>
      </tbody>
    </table>
    <p>
      Le composant rend un <code>&lt;div role="status" aria-label="Loading…"
      aria-busy="true"&gt;</code> contenant des lignes <code>span</code>.
      Si <code>paragraph</code> vaut <code>true</code>, <code>lines</code> est
      forcé à au moins <code>3</code>.
    </p>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <ul class="docs-token-list">
      <li>
        Utilisez une largeur explicite pour aligner visuellement le squelette avec le
        texte réel qui remplacera le placeholder.
      </li>
      <li>
        Pour les paragraphes courts, gardez <code>lines</code> bas et <code>paragraph</code>
        désactivé ; pour les blocs de texte long, activez <code>paragraph</code>.
      </li>
      <li>
        Le placeholder est décoratif: conservez un contenu accessible réel sous-jacent si
        la zone contient des données critiques.
      </li>
      <li>
        L’animation de shimmer est arrêtée en mode
        <code>prefers-reduced-motion</code>.
      </li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
    </ul>
  </section>
</div>
