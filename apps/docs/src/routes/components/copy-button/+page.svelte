<script lang="ts">
  import { Badge, CopyButton } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Action</p>
    <h1>
      {t(locale.value, "copyButtonTitle")}
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{t(locale.value, "copyButtonIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <div class="docs-example" aria-label={t(locale.value, "sizes")}>
      <CopyButton value="npm install @sentropic/design-system-svelte" size="sm" label="Copier" copiedLabel="Copié" />
      <CopyButton value="npm install @sentropic/design-system-svelte" size="md" label="Copier" copiedLabel="Copié" />
      <CopyButton value="npm install @sentropic/design-system-svelte" size="lg" label="Copier" copiedLabel="Copié" />
    </div>
    <div class="docs-example" aria-label="Copier différentes valeurs">
      <CopyButton value="sent-tech.ca" label="Copier le domaine" copiedLabel="Copié" />
      <CopyButton value="contact@sent-tech.ca" label="Copier l'email" copiedLabel="Copié" />
      <CopyButton value="ST-2026-0001" label="Copier l'identifiant" copiedLabel="Copié" />
    </div>
    <div class="docs-example" aria-label={t(locale.value, "states")}>
      <CopyButton value="désactivé" label="Désactivé" copiedLabel="Copié" disabled />
    </div>
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
</div>
