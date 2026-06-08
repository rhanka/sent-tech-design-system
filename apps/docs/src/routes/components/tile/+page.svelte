<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc « Aperçu live »). État
  // statique : la sélection bindable n'est pas live (note conservée en prose).
  const variantsDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "Tile", props: { variant: "static", title: "Statique", description: "Conteneur de présentation, non interactif." } },
        { comp: "Tile", props: { variant: "clickable", href: "#tile", title: "Cliquable (lien)", description: "Rend un <a> car href est fourni." } },
        { comp: "Tile", props: { variant: "clickable", title: "Cliquable (bouton)", description: "Rend un <button> sans href." } },
        { comp: "Tile", props: { variant: "selectable", selected: false, title: "Sélectionnable", description: "Cliquer pour sélectionner" } },
        { comp: "Tile", props: { variant: "selectable", selected: true, title: "Sélectionnée par défaut", description: "État initial coché." } },
        { comp: "Tile", props: { variant: "selectable", disabled: true, title: "Désactivée", description: "Non sélectionnable." } }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Layout</p>
    <div class="docs-hero-title">
      <h1>Tile</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      <code>Tile</code> est la tuile <strong>unitaire</strong> (là où <code>TileGroup</code>
      gère un groupe radio). Trois variantes : <code>static</code> (présentation),
      <code>clickable</code> (rend un <code>&lt;a&gt;</code> si <code>href</code>, sinon un
      <code>&lt;button&gt;</code>) et <code>selectable</code> (case à cocher unitaire,
      état <code>selected</code> bindable).
    </p>
  </section>
  <FrameworkPreview example="tile" title="Aperçu live" />


  <section class="docs-section" id="tile">
    <h2>Variantes</h2>
    <FrameworkDemo nodes={variantsDemo} label="Variantes" />
    <p class="docs-demo-note">
      L’état <code>selected</code> est <code>bindable</code> : ici figé pour la
      démonstration (la deuxième tuile sélectionnable est cochée par défaut).
    </p>
  </section>
  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>variant</code></td><td><code>"static" | "clickable" | "selectable"</code></td><td><code>"static"</code></td></tr>
        <tr><td><code>href</code></td><td><code>string</code></td><td><em>optionnel (clickable)</em></td></tr>
        <tr><td><code>selected</code></td><td><code>boolean</code> (bindable)</td><td><code>false</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>title</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>description</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>onclick</code></td><td><code>(e: MouseEvent) =&gt; void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>onselect</code></td><td><code>(selected: boolean) =&gt; void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>optionnel (remplace title/description)</em></td></tr>
      </tbody>
    </table>
  </section>
  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>

</div>
