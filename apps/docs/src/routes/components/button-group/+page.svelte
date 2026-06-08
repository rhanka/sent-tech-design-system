<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const attachedDemo: NodeSpec[] = [
    {
      comp: "ButtonGroup",
      props: { attached: true, label: fr ? "Vue" : "View" },
      children: [
        { comp: "Button", props: { variant: "secondary" }, children: [fr ? "Jour" : "Day"] },
        { comp: "Button", props: { variant: "secondary" }, children: [fr ? "Semaine" : "Week"] },
        { comp: "Button", props: { variant: "secondary" }, children: [fr ? "Mois" : "Month"] }
      ]
    }
  ];
  const spacedDemo: NodeSpec[] = [
    {
      comp: "ButtonGroup",
      props: { gap: 2, label: "Actions" },
      children: [
        { comp: "Button", props: { variant: "ghost" }, children: [fr ? "Annuler" : "Cancel"] },
        { comp: "Button", props: { variant: "primary" }, children: [fr ? "Enregistrer" : "Save"] }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Action" : "Component · Action"}</p>
    <div class="docs-hero-title">
      <h1>ButtonGroup</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Regroupe des Button : look segmenté joint (attached) ou simplement espacé via gap. Expose role=\"group\" avec un libellé a11y."
        : "Groups Buttons: an attached segmented look or simply spaced via gap. Exposes role=\"group\" with an a11y label."}
    </p>
  </section>

  <FrameworkPreview example="button-group" title={fr ? "Aperçu live" : "Live preview"} />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <FrameworkDemo nodes={attachedDemo} label={fr ? "attached (segmenté)" : "attached (segmented)"} />
    <FrameworkDemo nodes={spacedDemo} label={fr ? "gap=2 (espacé)" : "gap=2 (spaced)"} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>orientation</code></td><td><code>"horizontal" | "vertical"</code></td><td><code>"horizontal"</code></td></tr>
        <tr><td><code>attached</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>gap</code></td><td><code>number</code> ({fr ? "pas 0–12, ignoré si attached" : "step 0–12, ignored when attached"})</td><td><em>—</em></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>—</em></td></tr>
      </tbody>
    </table>
    <p>{fr ? "En mode attached, seuls les coins extrêmes sont arrondis. Le gap suit l'échelle d'espacement." : "When attached, only the outer corners are rounded. The gap follows the spacing scale."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-spacing-1</code> … <code>--st-spacing-12</code></li>
    </ul>
  </section>
</div>
