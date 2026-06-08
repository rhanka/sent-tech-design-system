<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const sizesDemo: NodeSpec[] = [
    {
      comp: "Stack",
      props: { gap: 2 },
      children: (["sm", "md", "lg"] as const).map((size) => ({
        comp: "Container",
        props: { size },
        children: [
          {
            comp: "Card",
            children: [{ el: "p", props: { class: "fp-card-text" }, children: [`size="${size}"`] }]
          }
        ]
      }))
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Structure" : "Component · Layout"}</p>
    <div class="docs-hero-title">
      <h1>Container</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Conteneur centré à largeur maximale bornée (sm/md/lg/xl/full) avec padding horizontal optionnel. Cadre la longueur de ligne."
        : "Centered container with bounded max width (sm/md/lg/xl/full) and optional horizontal padding. Frames line length."}
    </p>
  </section>

  <TriRender nodes={getExample("container")?.nodes ?? []} label={fr ? "Aperçu live" : "Live preview"} />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TriRender nodes={sizesDemo} label={fr ? "Tailles sm / md / lg" : "Sizes sm / md / lg"} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg" | "xl" | "full"</code></td><td><code>"lg"</code></td></tr>
        <tr><td><code>padding</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>as</code></td><td><code>string</code></td><td><code>"div"</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Les bornes lisent var(--st-container-*) avec replis rem." : "Bounds read var(--st-container-*) with rem fallbacks."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-container-sm</code></li>
      <li><code>--st-container-md</code></li>
      <li><code>--st-container-lg</code></li>
      <li><code>--st-container-xl</code></li>
    </ul>
  </section>
</div>
