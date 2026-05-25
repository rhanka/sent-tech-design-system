<script lang="ts">
  import { Badge, SkeletonText } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

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
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Feedback" : "Component · Feedback"}
    </p>
    <h1>
      SkeletonText
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div
      class="docs-example"
      aria-label={text().basic}
    >
      <SkeletonText />
    </div>

    <div
      class="docs-example"
      aria-label={text().heading}
    >
      <SkeletonText heading width="10rem" />
      <SkeletonText width="70%" />
      <SkeletonText width="58%" />
    </div>

    <div
      class="docs-example"
      aria-label={text().paragraph}
    >
      <SkeletonText lines={4} paragraph />
    </div>

    <div
      class="docs-example"
      aria-label={text().custom}
    >
      <SkeletonText lines={3} width="100%" />
      <SkeletonText lines={2} width={locale.value === "fr" ? "85%" : "85%"} />
    </div>
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
