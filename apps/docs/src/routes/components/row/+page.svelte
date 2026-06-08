<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const col = (span: number, label: string): NodeSpec => ({
    comp: "Col",
    props: { span },
    children: [{ comp: "Card", children: [{ el: "p", props: { class: "fp-card-text" }, children: [label] }] }]
  });

  const gutterDemo: NodeSpec[] = [
    { comp: "Row", props: { gutter: 6 }, children: [col(6, "span=6"), col(6, "span=6")] }
  ];
  const mixedDemo: NodeSpec[] = [
    { comp: "Row", props: { gutter: 4 }, children: [col(3, "3"), col(3, "3"), col(3, "3"), col(3, "3")] }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Structure" : "Component · Layout"}</p>
    <div class="docs-hero-title">
      <h1>Row</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Ligne d'une grille à 12 colonnes. La gouttière (gutter) est partagée avec les Col enfants pour un calcul de largeur cohérent."
        : "Row of a 12-column grid. The gutter is shared with child Cols for consistent width math."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={gutterDemo} title={fr ? "Deux colonnes 6/6, gutter=6" : "Two 6/6 columns, gutter=6"} />
    <TabbedExample nodes={mixedDemo} title={fr ? "Quatre colonnes 3/3/3/3" : "Four 3/3/3/3 columns"} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>gutter</code></td><td><code>number</code> ({fr ? "pas 0–12" : "step 0–12"})</td><td><code>4</code></td></tr>
        <tr><td><code>align</code></td><td><code>"start" | "center" | "end" | "stretch" | "baseline"</code></td><td><em>—</em></td></tr>
        <tr><td><code>justify</code></td><td><code>"start" | "center" | "end" | "between" | "around" | "evenly"</code></td><td><em>—</em></td></tr>
        <tr><td><code>wrap</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>as</code></td><td><code>string</code></td><td><code>"div"</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Row expose --st-row-gutter, lu par chaque Col pour soustraire sa part de gouttière." : "Row exposes --st-row-gutter, read by each Col to subtract its gutter share."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-spacing-1</code> … <code>--st-spacing-12</code></li>
      <li><code>--st-row-gutter</code> ({fr ? "calculé" : "computed"})</li>
    </ul>
  </section>
</div>
