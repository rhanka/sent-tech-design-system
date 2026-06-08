<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc Aperçu live).
  const sizesDemo: NodeSpec[] = [
    { comp: "CopyButton", props: { value: "npm install @sentropic/design-system-svelte", size: "sm", label: "Copier", copiedLabel: "Copié" } },
    { comp: "CopyButton", props: { value: "npm install @sentropic/design-system-svelte", size: "md", label: "Copier", copiedLabel: "Copié" } },
    { comp: "CopyButton", props: { value: "npm install @sentropic/design-system-svelte", size: "lg", label: "Copier", copiedLabel: "Copié" } }
  ];
  const valuesDemo: NodeSpec[] = [
    { comp: "CopyButton", props: { value: "sent-tech.ca", label: "Copier le domaine", copiedLabel: "Copié" } },
    { comp: "CopyButton", props: { value: "contact@sent-tech.ca", label: "Copier l'email", copiedLabel: "Copié" } },
    { comp: "CopyButton", props: { value: "ST-2026-0001", label: "Copier l'identifiant", copiedLabel: "Copié" } }
  ];
  const statesDemo: NodeSpec[] = [
    { comp: "CopyButton", props: { value: "désactivé", label: "Désactivé", copiedLabel: "Copié", disabled: true } }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Action</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "copyButtonTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "copyButtonIntro")}</p>
  </section>
  <FrameworkPreview example="copybutton" title="Aperçu live" />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <FrameworkDemo nodes={sizesDemo} label={t(locale.value, "sizes")} />
    <FrameworkDemo nodes={valuesDemo} label="Copier différentes valeurs" />
    <FrameworkDemo nodes={statesDemo} label={t(locale.value, "states")} />
  </section>
  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>value</code></td><td><code>string</code></td><td><em>required</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Copy"</code></td></tr>
        <tr><td><code>copiedLabel</code></td><td><code>string</code></td><td><code>"Copied"</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>feedbackTimeoutMs</code></td><td><code>number</code></td><td><code>1500</code></td></tr>
        <tr><td><code>onCopied</code></td><td><code>(value: string) =&gt; void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>onError</code></td><td><code>(err: unknown) =&gt; void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
      </tbody>
    </table>
    <p>
      Le bouton utilise <code>navigator.clipboard.writeText</code> et bascule l'icône Lucide
      <code>Copy</code> vers <code>Check</code> pendant <code>feedbackTimeoutMs</code> millisecondes,
      avec <code>aria-live="polite"</code> pour annoncer l'état copié.
    </p>
  </section>
  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>

</div>
