<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const gapDemo: NodeSpec[] = [
    {
      comp: "Stack",
      props: { gap: 1 },
      children: [
        { comp: "Badge", props: { tone: "info" }, children: ["gap=1"] },
        { comp: "Badge", props: { tone: "info" }, children: ["gap=1"] },
        { comp: "Badge", props: { tone: "info" }, children: ["gap=1"] }
      ]
    }
  ];
  const alignDemo: NodeSpec[] = [
    {
      comp: "Stack",
      props: { gap: 2, align: "center" },
      children: [
        { comp: "Badge", children: ["Centré"] },
        { comp: "Badge", props: { tone: "success" }, children: ["Aligné au centre"] }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Structure" : "Component · Layout"}</p>
    <div class="docs-hero-title">
      <h1>Stack</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Empilement vertical à gap homogène. Raccourci de Flex en direction colonne, idéal pour des sections successives."
        : "Vertical stack with uniform gap. A Flex column shorthand, ideal for successive sections."}
    </p>
  </section>

  <TriRender nodes={getExample("stack")?.nodes ?? []} label={fr ? "Aperçu live" : "Live preview"} />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TriRender nodes={gapDemo} label={fr ? "Gap serré" : "Tight gap"} />
    <TriRender nodes={alignDemo} label={fr ? "align=\"center\"" : "align=\"center\""} />
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
        <tr><td><code>as</code></td><td><code>string</code></td><td><code>"div"</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Stack force direction=\"column\" sur Flex." : "Stack forces direction=\"column\" on Flex."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-spacing-1</code> … <code>--st-spacing-12</code></li>
    </ul>
  </section>
</div>
