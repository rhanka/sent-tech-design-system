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
        "Barres de progression déterminée et indéterminée avec label, message de support, valeurs et options visuelles.",
      completeLabel: "Import documents",
      validationLabel: "Validation",
      warningLabel: "Contrôles qualité",
      errorLabel: "Échec de l’import",
      errorValueText: "3 / 12",
      indeterminateLabel: "Traitement en cours",
      indeterminateHelper: "Statut en attente d’un back-end de fin de lot.",
      usageTitle: "Notes d’usage"
    },
    en: {
      intro:
        "Determinate and indeterminate progress bars with label, helper text, value display and tone variants.",
      completeLabel: "Import documents",
      validationLabel: "Validation",
      warningLabel: "Quality checks",
      errorLabel: "Import failed",
      errorValueText: "3 / 12",
      indeterminateLabel: "Processing",
      indeterminateHelper: "Status waiting for final batch completion from backend.",
      usageTitle: "Usage notes"
    }
  } as const;

  const text = () => copy[locale.value];

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc « Aperçu live »).
  const statesDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "ProgressBar", props: { label: text().completeLabel, value: 74, max: 100, showValue: true } },
        {
          comp: "ProgressBar",
          props: {
            label: text().validationLabel,
            value: 88,
            max: 100,
            tone: "success",
            size: "lg",
            showValue: true,
            helperText: locale.value === "fr" ? "Validé par QA" : "Validated by QA"
          }
        },
        { comp: "ProgressBar", props: { label: text().warningLabel, value: 34, max: 100, tone: "warning", size: "sm", showValue: true } },
        {
          comp: "ProgressBar",
          props: {
            label: text().errorLabel,
            value: 34,
            max: 100,
            tone: "error",
            valueText: text().errorValueText,
            helperText: locale.value === "fr" ? "3 tâches bloquantes" : "3 blocking items",
            showValue: true
          }
        }
      ]
    }
  ]);

  const indeterminateDemo = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "ProgressBar", props: { indeterminate: true, label: text().indeterminateLabel, helperText: text().indeterminateHelper } },
        {
          comp: "ProgressBar",
          props: {
            label: locale.value === "fr" ? "File d’attente vide" : "Empty queue",
            value: 0,
            max: 1,
            tone: "neutral",
            showValue: false
          }
        }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Feedback" : "Component · Feedback"}
    </p>
    <div class="docs-hero-title">
      <h1>ProgressBar</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <TriRender nodes={getExample("progressbar")?.nodes ?? []} label="Aperçu live" />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <TriRender nodes={statesDemo} label={t(locale.value, "states")} />
    <TriRender
      nodes={indeterminateDemo}
      label={locale.value === "fr" ? "État indéterminé" : "Indeterminate state"}
    />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>value</code></td><td><code>number</code></td><td><code>0</code></td></tr>
        <tr><td><code>max</code></td><td><code>number</code></td><td><code>100</code></td></tr>
        <tr><td><code>indeterminate</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>tone</code></td><td><code>"neutral" | "success" | "warning" | "error"</code></td><td><code>"neutral"</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>showValue</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>valueText</code></td><td><code>string</code></td><td><code>auto</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>...props</code></td><td><code>HTMLAttributes&lt;HTMLDivElement&gt;</code></td><td><em>transmis</em></td></tr>
      </tbody>
    </table>
    <p>
      Le composant met en forme un <code>&lt;div role="progressbar"&gt;</code>.
      Quand <code>indeterminate</code> est vrai, <code>aria-valuemin</code>,
      <code>aria-valuemax</code> et <code>aria-valuenow</code> ne sont pas fournis.
      La valeur est bornée entre <code>0</code> et <code>max</code>.
    </p>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <ul class="docs-token-list">
      <li>
        Utilisez <code>showValue</code> quand la progression chiffrée est utile pour
        l’utilisateur; sinon laissez la valeur implicite en clair via le label seul.
      </li>
      <li>
        Réservez le mode <code>indeterminate</code> aux traitements sans borne
        connue en nombre d’étapes.
      </li>
      <li>
        Le rendu d’animation du mode indéterminé est désactivé avec
        <code>prefers-reduced-motion</code>.
      </li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-radius-pill</code></li>
      <li><code>--st-semantic-action-primary</code></li>
      <li><code>--st-semantic-feedback-success</code></li>
      <li><code>--st-semantic-feedback-warning</code></li>
      <li><code>--st-semantic-feedback-error</code></li>
      <li><code>--st-component-field-helpText</code></li>
      <li><code>--st-motion-fast</code></li>
      <li><code>--st-motion-easing</code></li>
      <li><code>--st-progressBar-color</code></li>
    </ul>
  </section>
</div>
