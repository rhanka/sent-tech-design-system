<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const horizontalSteps = [
    { value: "account", label: "Compte", description: "Identité créée", status: "complete" },
    { value: "profile", label: "Profil", description: "En cours", status: "current" },
    { value: "billing", label: "Facturation", status: "upcoming" },
    { value: "review", label: "Vérification", status: "upcoming" }
  ];

  const verticalSteps = [
    { value: "draft", label: "Brouillon", status: "complete" },
    { value: "validation", label: "Validation", description: "Erreur de saisie", status: "invalid" },
    { value: "publish", label: "Publication", status: "upcoming" },
    { value: "archive", label: "Archivage", status: "disabled" }
  ];

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc Aperçu live).
  const horizontalDemo: NodeSpec[] = $derived([
    {
      comp: "ProgressIndicator",
      props: { items: horizontalSteps, label: locale.value === "fr" ? "Création de compte" : "Account creation" }
    }
  ]);
  const verticalDemo: NodeSpec[] = $derived([
    {
      comp: "ProgressIndicator",
      props: { vertical: true, items: verticalSteps, label: locale.value === "fr" ? "Publication" : "Publication" }
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Feedback</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "progressIndicatorTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "progressIndicatorIntro")}</p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <TabbedExample
      nodes={horizontalDemo}
      title={locale.value === "fr" ? "Orientation horizontale" : "Horizontal orientation"}
    />

    <TabbedExample
      nodes={verticalDemo}
      title={locale.value === "fr" ? "Orientation verticale" : "Vertical orientation"}
    />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>items</code></td><td><code>ProgressIndicatorItem[]</code></td><td><em>requis</em></td></tr>
        <tr><td><code>vertical</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Progress"</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
    <p>
      Le composant rend une <code>&lt;ol aria-label&gt;</code> dont chaque
      <code>&lt;li&gt;</code> reçoit <code>aria-current="step"</code> pour le
      statut <code>current</code>. Chaque item suit la forme
      <code>{`{ value, label, description?, status? }`}</code> où
      <code>status</code> vaut <code>"complete" | "current" | "upcoming" | "invalid" | "disabled"</code>
      (défaut <code>"upcoming"</code>). Les icônes Lucide affichées sont
      <code>Check</code> (complete) et <code>X</code> (invalid) ; les autres
      statuts utilisent le numéro de l’étape ou un point CSS pour
      <code>current</code>. Les autres props <code>&lt;ol&gt;</code> HTML sont
      transmises via spread.
    </p>
  </section>
</div>
