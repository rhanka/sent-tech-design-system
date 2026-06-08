<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const scaleDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "fp-stack" },
      children: [
        { comp: "Typography", props: { variant: "display" }, children: [fr ? "Display" : "Display"] },
        { comp: "Typography", props: { variant: "h2" }, children: [fr ? "Titre h2" : "Heading h2"] },
        { comp: "Typography", props: { variant: "body" }, children: [fr ? "Texte courant body." : "Body text."] },
        { comp: "Typography", props: { variant: "overline", tone: "muted" }, children: ["OVERLINE"] }
      ]
    }
  ];
  const toneDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "fp-stack" },
      children: [
        { comp: "Typography", props: { variant: "body", weight: "bold" }, children: [fr ? "Gras" : "Bold"] },
        { comp: "Typography", props: { variant: "body", tone: "secondary" }, children: [fr ? "Ton secondaire" : "Secondary tone"] },
        { comp: "Typography", props: { variant: "body", tone: "link" }, children: [fr ? "Ton lien" : "Link tone"] },
        { comp: "Typography", props: { variant: "body", align: "end" }, children: [fr ? "Aligné à droite" : "End aligned"] }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Divers" : "Component · Other"}</p>
    <div class="docs-hero-title">
      <h1>Typography</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Composant de texte unique pour toute la hiérarchie : la variante choisit l'échelle et la balise HTML par défaut, surchargeable via as."
        : "A single text component for the whole hierarchy: the variant picks the scale and the default HTML tag, overridable via as."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={scaleDemo} title={fr ? "Échelle de variantes" : "Variant scale"} />
    <TabbedExample nodes={toneDemo} title={fr ? "Poids, ton, alignement" : "Weight, tone, alignment"} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>variant</code></td><td><code>"display" | "h1"…"h6" | "body" | "body-sm" | "caption" | "overline"</code></td><td><code>"body"</code></td></tr>
        <tr><td><code>as</code></td><td><code>string</code></td><td><em>{fr ? "déduit de la variante" : "derived from variant"}</em></td></tr>
        <tr><td><code>weight</code></td><td><code>"regular" | "medium" | "semibold" | "bold"</code></td><td><em>—</em></td></tr>
        <tr><td><code>tone</code></td><td><code>"primary" | "secondary" | "muted" | "inverse" | "link"</code></td><td><em>—</em></td></tr>
        <tr><td><code>align</code></td><td><code>"start" | "center" | "end" | "justify"</code></td><td><em>—</em></td></tr>
        <tr><td><code>truncate</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Chaque variante mappe une balise par défaut (display/h1 → h1, body → p, caption/overline → span), surchargeable via as." : "Each variant maps a default tag (display/h1 → h1, body → p, caption/overline → span), overridable via as."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-text-primary</code> · <code>--st-semantic-text-secondary</code></li>
      <li><code>--st-typography-*</code> ({fr ? "tailles et graisses" : "sizes and weights"})</li>
    </ul>
  </section>
</div>
