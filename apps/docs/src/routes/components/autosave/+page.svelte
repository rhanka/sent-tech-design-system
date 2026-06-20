<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const savedDemo = $derived<NodeSpec[]>([
    {
      comp: "Autosave",
      props: { status: "saved", lastSaved: "2026-06-04T12:00:00.000Z", locale: fr ? "fr-FR" : "en-US" }
    }
  ]);
  const savingDemo = $derived<NodeSpec[]>([
    {
      comp: "Autosave",
      props: { status: "saving", locale: fr ? "fr-FR" : "en-US" }
    }
  ]);
  const errorDemo = $derived<NodeSpec[]>([
    {
      comp: "Autosave",
      props: { status: "error", locale: fr ? "fr-FR" : "en-US" }
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Feedback" : "Component · Feedback"}</p>
    <div class="docs-hero-title">
      <h1>Autosave</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Indicateur d'enregistrement automatique : repos, en cours, enregistré (avec heure relative) ou échec (avec bouton Réessayer). Statut annoncé par aria-live."
        : "Autosave indicator: idle, saving, saved (with relative time) or error (with Retry button). Status announced via aria-live."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={savedDemo} title="status=&quot;saved&quot;" />
    <TabbedExample nodes={savingDemo} title="status=&quot;saving&quot;" />
    <TabbedExample nodes={errorDemo} title="status=&quot;error&quot;" />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>status</code></td><td><code>"idle" | "saving" | "saved" | "error"</code></td><td><code>"idle"</code></td></tr>
        <tr><td><code>lastSaved</code></td><td><code>string | Date</code></td><td><em>–</em></td></tr>
        <tr><td><code>onRetry</code></td><td><code>() =&gt; void</code></td><td><em>–</em></td></tr>
        <tr><td><code>labels</code></td><td><code>{`{ idle?, saving?, saved?, error? }`}</code></td><td><em>–</em></td></tr>
        <tr><td><code>retryLabel</code></td><td><code>string</code></td><td><em>–</em></td></tr>
        <tr><td><code>locale</code></td><td><code>string</code></td><td><code>"fr-FR"</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Sur error, le rôle passe à alert et un bouton Réessayer appelle onRetry. lastSaved est rendu en heure relative sur les statuts idle et saved." : "On error, the role becomes alert and a Retry button calls onRetry. lastSaved renders as relative time on the idle and saved statuses."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
    </ul>
  </section>
</div>
