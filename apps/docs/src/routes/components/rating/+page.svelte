<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const interactiveDemo: NodeSpec[] = [
    {
      comp: "Rating",
      props: { value: 3, max: 5, label: fr ? "Note du produit" : "Product rating" }
    }
  ];
  const halfDemo: NodeSpec[] = [
    {
      comp: "Rating",
      props: { value: 3.5, max: 5, allowHalf: true, label: fr ? "Avis" : "Review" }
    }
  ];
  const readonlyDemo: NodeSpec[] = [
    {
      comp: "Rating",
      props: { value: 4, max: 5, readonly: true, size: "sm", label: fr ? "Moyenne" : "Average" }
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Feedback" : "Component · Feedback"}</p>
    <div class="docs-hero-title">
      <h1>Rating</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Note par étoiles, contrôlée par value. Cliquable et navigable au clavier, ou en lecture seule ; option de demi-étoiles."
        : "Star rating controlled by value. Clickable and keyboard-navigable, or read-only; optional half-star precision."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={interactiveDemo} title={fr ? "Interactif" : "Interactive"} />
    <TabbedExample nodes={halfDemo} title="allowHalf" />
    <TabbedExample nodes={readonlyDemo} title="readonly" />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>value</code></td><td><code>number</code></td><td><code>0</code></td></tr>
        <tr><td><code>max</code></td><td><code>number</code></td><td><code>5</code></td></tr>
        <tr><td><code>onChange</code></td><td><code>(value: number) =&gt; void</code></td><td><em>—</em></td></tr>
        <tr><td><code>readonly</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>allowHalf</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>—</em></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Recliquer l'étoile déjà sélectionnée remet la note à zéro. Le groupe expose un rôle accessible étiqueté par label." : "Clicking the already-selected star resets to zero. The group exposes an accessible role labelled by label."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
    </ul>
  </section>
</div>
