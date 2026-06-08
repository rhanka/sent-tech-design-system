<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const justifyDemo: NodeSpec[] = [
    {
      comp: "Flex",
      props: { gap: 2, justify: "between", align: "center" },
      children: [
        { comp: "Badge", children: ["A"] },
        { comp: "Badge", children: ["B"] },
        { comp: "Badge", children: ["C"] }
      ]
    }
  ];
  const columnDemo: NodeSpec[] = [
    {
      comp: "Flex",
      props: { direction: "column", gap: 2 },
      children: [
        { comp: "Badge", props: { tone: "info" }, children: ["Haut"] },
        { comp: "Badge", props: { tone: "info" }, children: ["Milieu"] },
        { comp: "Badge", props: { tone: "info" }, children: ["Bas"] }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Structure" : "Component · Layout"}</p>
    <div class="docs-hero-title">
      <h1>Flex</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Primitive flexbox : direction, gap sur l'échelle d'espacement, alignement et justification. Base de Stack, Inline et Row."
        : "Flexbox primitive: direction, spacing-scale gap, alignment, and justification. The foundation of Stack, Inline, and Row."}
    </p>
  </section>

  <FrameworkPreview example="flex" title={fr ? "Aperçu live" : "Live preview"} />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <FrameworkDemo nodes={justifyDemo} label={fr ? "justify=\"between\"" : "justify=\"between\""} />
    <FrameworkDemo nodes={columnDemo} label={fr ? "direction=\"column\"" : "direction=\"column\""} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>direction</code></td><td><code>"row" | "column" | "row-reverse" | "column-reverse"</code></td><td><code>"row"</code></td></tr>
        <tr><td><code>gap</code></td><td><code>number</code> ({fr ? "pas 0–12" : "step 0–12"})</td><td><em>—</em></td></tr>
        <tr><td><code>align</code></td><td><code>"start" | "center" | "end" | "stretch" | "baseline"</code></td><td><em>—</em></td></tr>
        <tr><td><code>justify</code></td><td><code>"start" | "center" | "end" | "between" | "around" | "evenly"</code></td><td><em>—</em></td></tr>
        <tr><td><code>wrap</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>inline</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>as</code></td><td><code>string</code></td><td><code>"div"</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Le gap est résolu en var(--st-spacing-N) avec repli rem." : "Gap resolves to var(--st-spacing-N) with a rem fallback."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-spacing-1</code> … <code>--st-spacing-12</code></li>
    </ul>
  </section>
</div>
