<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      intro: "Puce compacte pour les labels de statut, de catégorie ou d’état produit.",
      usageTitle: "Notes d’usage",
      usageTone: "La tonalité couvre une intention visuelle (neutral, success, warning, error, info), pas une hiérarchie métier.",
      usageSpread:
        "Le composant ne gère ni état actif, ni suppression. Pour une interaction, utilisez Tag ou un contrôle dédié.",
      usageA11y:
        "Le composant rend un <span>; utilisez `aria-label` si le texte est masqué par contexte visuel."
    },
    en: {
      intro: "Compact chip for status, category, or product state labels.",
      usageTitle: "Usage notes",
      usageTone: "Tone maps semantic meaning only (neutral, success, warning, error, info), not business flow state.",
      usageSpread:
        "The component does not handle active actions or dismiss behavior. Use Tag or a dedicated control for that.",
      usageA11y:
        "The component renders as a <span>; use `aria-label` when the visual label is not visible in context."
    }
  } as const;

  const text = () => copy[locale.value];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Données" : "Component · Data"}
    </p>
    <h1>
      Badge
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example" aria-label={locale.value === "fr" ? "Tonalités" : "Tones"}>
      <Badge>Neutral</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="error">Error</Badge>
      <Badge tone="info">Info</Badge>
    </div>

    <div
      class="docs-example"
      aria-label={locale.value === "fr" ? "Usage en contexte" : "In-context usage"}
    >
      <span>Export {locale.value === "fr" ? "terminé" : "finished"} : </span>
      <Badge tone="success">Completed</Badge>
      <span>•</span>
      <span>{locale.value === "fr" ? "Validation requise" : "Requires validation"} : </span>
      <Badge tone="warning">Pending</Badge>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>tone</code></td><td><code>"neutral" | "success" | "warning" | "error" | "info"</code></td><td><code>"neutral"</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>contenu</em></td></tr>
        <tr><td><code>...props</code></td><td><code>HTMLAttributes&lt;HTMLSpanElement&gt;</code></td><td><em>transmis</em></td></tr>
      </tbody>
    </table>
    <p>
      Le composant rend un <code>&lt;span&gt;</code> en mode inline avec classes
      d’état pré-définies. Il ne fournit ni interaction ni logique métier :
      utilisez-le comme label visuel.
    </p>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <ul class="docs-token-list">
      <li>{text().usageTone}</li>
      <li>{text().usageSpread}</li>
      <li>{text().usageA11y}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-feedback-success</code></li>
      <li><code>--st-semantic-feedback-warning</code></li>
      <li><code>--st-semantic-feedback-error</code></li>
      <li><code>--st-semantic-feedback-info</code></li>
      <li><code>--st-radius-pill</code></li>
    </ul>
  </section>
</div>
