<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const labelDemo: NodeSpec[] = [
    {
      comp: "Stack",
      props: { gap: 2 },
      children: [
        { el: "span", props: { class: "fp-card-text" }, children: [fr ? "Connexion par e-mail" : "Sign in with email"] },
        { comp: "Divider", props: { label: fr ? "ou" : "or" } },
        { el: "span", props: { class: "fp-card-text" }, children: [fr ? "Connexion par SSO" : "Sign in with SSO"] }
      ]
    }
  ];
  const dashedDemo: NodeSpec[] = [
    {
      comp: "Stack",
      props: { gap: 2 },
      children: [
        { el: "span", props: { class: "fp-card-text" }, children: [fr ? "Avant" : "Before"] },
        { comp: "Divider", props: { variant: "dashed", spacing: 2 } },
        { el: "span", props: { class: "fp-card-text" }, children: [fr ? "Après" : "After"] }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Structure" : "Component · Layout"}</p>
    <div class="docs-hero-title">
      <h1>Divider</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Séparateur horizontal ou vertical, plein ou pointillé, avec libellé centré optionnel sur l'orientation horizontale."
        : "Horizontal or vertical separator, solid or dashed, with an optional centered label on the horizontal orientation."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={labelDemo} title={fr ? "Avec libellé" : "With label"} />
    <TabbedExample nodes={dashedDemo} title={fr ? "variant=\"dashed\"" : "variant=\"dashed\""} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>orientation</code></td><td><code>"horizontal" | "vertical"</code></td><td><code>"horizontal"</code></td></tr>
        <tr><td><code>variant</code></td><td><code>"solid" | "dashed"</code></td><td><code>"solid"</code></td></tr>
        <tr><td><code>spacing</code></td><td><code>number</code> ({fr ? "pas 0–12" : "step 0–12"})</td><td><em>–</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{fr ? "horizontal seulement" : "horizontal only"}</em></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Rend role=\"separator\" avec aria-orientation. Le libellé n'est rendu qu'à l'horizontale." : "Renders role=\"separator\" with aria-orientation. The label only renders horizontally."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-spacing-1</code> … <code>--st-spacing-12</code></li>
    </ul>
  </section>
</div>
