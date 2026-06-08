<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const tags = (n: number): NodeSpec[] =>
    Array.from({ length: n }, (_, i) => ({ comp: "Tag", children: [`tag-${i + 1}`] }) as NodeSpec);

  const wrapDemo: NodeSpec[] = [
    { comp: "Inline", props: { gap: 2 }, children: tags(12) }
  ];
  const nowrapDemo: NodeSpec[] = [
    { comp: "Inline", props: { gap: 2, wrap: false }, children: tags(4) }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Structure" : "Component · Layout"}</p>
    <div class="docs-hero-title">
      <h1>Inline</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Flux horizontal à gap homogène qui passe à la ligne par défaut. Parfait pour des listes de chips, de tags ou d'actions."
        : "Horizontal flow with uniform gap that wraps by default. Ideal for chip, tag, or action rows."}
    </p>
  </section>

  <FrameworkPreview example="inline" title={fr ? "Aperçu live" : "Live preview"} />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <FrameworkDemo nodes={wrapDemo} label={fr ? "Retour à la ligne (wrap)" : "Wrapping flow"} />
    <FrameworkDemo nodes={nowrapDemo} label={fr ? "wrap={false}" : "wrap={false}"} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>gap</code></td><td><code>number</code> ({fr ? "pas 0–12" : "step 0–12"})</td><td><em>—</em></td></tr>
        <tr><td><code>align</code></td><td><code>"start" | "center" | "end" | "stretch" | "baseline"</code></td><td><em>—</em></td></tr>
        <tr><td><code>justify</code></td><td><code>"start" | "center" | "end" | "between" | "around" | "evenly"</code></td><td><em>—</em></td></tr>
        <tr><td><code>wrap</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>as</code></td><td><code>string</code></td><td><code>"div"</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Inline force direction=\"row\" et wrap=true par défaut." : "Inline forces direction=\"row\" with wrap=true by default."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-spacing-1</code> … <code>--st-spacing-12</code></li>
    </ul>
  </section>
</div>
