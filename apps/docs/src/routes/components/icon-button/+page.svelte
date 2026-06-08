<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc Aperçu live). L'icône passe en
  // glyphe texte (children) pour rester identique dans les trois frameworks, là
  // où l'usage réel injecterait une icône Lucide.
  const variantsDemo: NodeSpec[] = [
    { comp: "IconButton", props: { "aria-label": "Copier" }, children: ["⧉"] },
    { comp: "IconButton", props: { variant: "secondary", "aria-label": "Modifier" }, children: ["✎"] },
    { comp: "IconButton", props: { variant: "ghost", "aria-label": "Rejouer" }, children: ["↺"] },
    { comp: "IconButton", props: { variant: "danger", "aria-label": "Supprimer" }, children: ["✕"] }
  ];
  const sizesDemo: NodeSpec[] = [
    { comp: "IconButton", props: { size: "sm", "aria-label": "Copier (petit)" }, children: ["⧉"] },
    { comp: "IconButton", props: { size: "md", "aria-label": "Copier (moyen)" }, children: ["⧉"] },
    { comp: "IconButton", props: { size: "lg", "aria-label": "Copier (grand)" }, children: ["⧉"] }
  ];
  const statesDemo: NodeSpec[] = [
    { comp: "IconButton", props: { "aria-label": "Désactivé", disabled: true }, children: ["⧉"] },
    { comp: "IconButton", props: { variant: "secondary", "aria-label": "Modifier désactivé", disabled: true }, children: ["✎"] },
    { comp: "IconButton", props: { variant: "danger", "aria-label": "Supprimer désactivé", disabled: true }, children: ["✕"] }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Action</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "iconButtonTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "iconButtonIntro")}</p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={variantsDemo} title={t(locale.value, "variants")} />
    <TabbedExample nodes={sizesDemo} title={t(locale.value, "sizes")} />
    <TabbedExample nodes={statesDemo} title={t(locale.value, "states")} />
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "Les icônes sont représentées ici par des glyphes texte pour rester identiques dans les trois frameworks ; en usage réel, injectez une icône (ex. Lucide) en children."
        : "Icons are shown here as text glyphs to stay identical across the three frameworks; in real usage, inject an icon (e.g. Lucide) as children."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>aria-label</code></td><td><code>string</code></td><td><em>required</em></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>variant</code></td><td><code>"ghost" | "secondary" | "danger"</code></td><td><code>"ghost"</code></td></tr>
        <tr><td><code>type</code></td><td><code>"button" | "submit" | "reset"</code></td><td><code>"button"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>title</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-iconButton-radius</code></li>
      <li><code>--st-component-iconButton-smSize</code></li>
      <li><code>--st-component-iconButton-mdSize</code></li>
      <li><code>--st-component-iconButton-lgSize</code></li>
      <li><code>--st-component-iconButton-hoverBackground</code></li>
      <li><code>--st-component-iconButton-focusRing</code></li>
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>
</div>
