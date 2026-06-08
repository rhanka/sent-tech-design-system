<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Démos en arbre NodeSpec neutre -> rendues dans le framework actif.
  // État statique : valeurs figées (pas de binding live ; note prose).
  const sizesDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "Search", props: { size: "sm", placeholder: "Rechercher (sm)" } },
        { comp: "Search", props: { size: "md", placeholder: "Rechercher (md)" } },
        { comp: "Search", props: { size: "lg", placeholder: "Rechercher (lg)" } }
      ]
    }
  ];

  const statesDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "Search", props: { placeholder: "Rechercher un composant…" } },
        { comp: "Search", props: { placeholder: "Champ désactivé", disabled: true } }
      ]
    }
  ];

  // Démo « liaison bidirectionnelle » : version statique avec valeur figée.
  // Noms de prop par moteur (Svelte `value`, React `defaultValue`, Vue
  // `modelValue`) tous passés pour afficher la même valeur partout.
  const bindingDemo: NodeSpec[] = [
    {
      comp: "Search",
      props: { value: "design", defaultValue: "design", modelValue: "design", placeholder: "Tapez puis effacez" }
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaire</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "searchTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "searchIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={sizesDemo} title={t(locale.value, "sizes")} />
    <TabbedExample nodes={statesDemo} title={t(locale.value, "states")} />
    <TabbedExample nodes={bindingDemo} title="Liaison bidirectionnelle" />
    <p class="docs-demo-note">
      Valeur courante :
      <code>design</code>
    </p>
  </section>
  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>value</code></td><td><code>string</code> (<code>$bindable</code>)</td><td><code>""</code></td></tr>
        <tr><td><code>placeholder</code></td><td><code>string</code></td><td><code>"Search"</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>errorText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>clearLabel</code></td><td><code>string</code></td><td><code>"Clear search"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
      </tbody>
    </table>
    <p>
      Le composant rend un <code>&lt;input type="search"&gt;</code> natif (rôle <code>searchbox</code>
      implicite), accompagné d'une icône Lucide <code>Search</code> et d'un bouton clear (icône Lucide
      <code>X</code>) affiché dès que <code>value</code> n'est pas vide. La remise à zéro se fait via
      <code>bind:value</code> : le bouton clear assigne <code>value = ""</code>, ce qui propage la
      mise à jour au parent sans callback dédié.
    </p>
  </section>
  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>

</div>
