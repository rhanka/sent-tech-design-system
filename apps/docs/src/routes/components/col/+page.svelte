<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const card = (label: string): NodeSpec => ({
    comp: "Card",
    children: [{ el: "p", props: { class: "fp-card-text" }, children: [label] }]
  });

  const offsetDemo: NodeSpec[] = [
    {
      comp: "Row",
      props: { gutter: 4 },
      children: [
        { comp: "Col", props: { span: 4, offset: 4 }, children: [card("span=4 offset=4")] }
      ]
    }
  ];
  const autoDemo: NodeSpec[] = [
    {
      comp: "Row",
      props: { gutter: 4 },
      children: [
        { comp: "Col", props: { span: "auto" }, children: [card("auto")] },
        { comp: "Col", props: { span: 6 }, children: [card("span=6")] }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Structure" : "Component · Layout"}</p>
    <div class="docs-hero-title">
      <h1>Col</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Colonne d'une grille à 12 : span (1–12 ou « auto »), offset et surcharges responsives sm/md/lg. À utiliser dans une Row."
        : "Column of a 12-grid: span (1–12 or \"auto\"), offset, and responsive sm/md/lg overrides. Use inside a Row."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={offsetDemo} title={fr ? "offset=4" : "offset=4"} />
    <TabbedExample nodes={autoDemo} title={fr ? "span=\"auto\" + span=6" : "span=\"auto\" + span=6"} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>span</code></td><td><code>number | "auto"</code></td><td><code>"auto"</code></td></tr>
        <tr><td><code>offset</code></td><td><code>number</code> (0–11)</td><td><code>0</code></td></tr>
        <tr><td><code>sm</code> / <code>md</code> / <code>lg</code></td><td><code>number | "auto"</code></td><td><em>–</em></td></tr>
        <tr><td><code>as</code></td><td><code>string</code></td><td><code>"div"</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "La largeur tient compte de --st-row-gutter pour que 12 colonnes tiennent sur une ligne." : "Width accounts for --st-row-gutter so 12 columns fit on one line."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-row-gutter</code> ({fr ? "hérité de Row" : "inherited from Row"})</li>
    </ul>
  </section>
</div>
