<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const dotsDemo: NodeSpec[] = [
    {
      comp: "SlideIndicator",
      props: { count: 5, current: 1, label: fr ? "Diapositive" : "Slide" }
    }
  ];
  const barsDemo: NodeSpec[] = [
    {
      comp: "SlideIndicator",
      props: { count: 4, current: 2, variant: "bars", label: fr ? "Diapositive" : "Slide" }
    }
  ];
  const sizeDemo: NodeSpec[] = [
    {
      comp: "SlideIndicator",
      props: { count: 6, current: 0, size: "lg", label: fr ? "Diapositive" : "Slide" }
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Navigation" : "Component · Navigation"}</p>
    <div class="docs-hero-title">
      <h1>SlideIndicator</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Points ou barres signalant la diapositive courante d'un carrousel. Chaque repère est cliquable et navigable au clavier (flèches, Début/Fin)."
        : "Dots or bars marking the current slide of a carousel. Each marker is clickable and keyboard-navigable (arrows, Home/End)."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={dotsDemo} title={fr ? "Points" : "Dots"} />
    <TabbedExample nodes={barsDemo} title="variant=&quot;bars&quot;" />
    <TabbedExample nodes={sizeDemo} title="size=&quot;lg&quot;" />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>count</code></td><td><code>number</code></td><td><em>{fr ? "requis" : "required"}</em></td></tr>
        <tr><td><code>current</code></td><td><code>number</code> ({fr ? "index 0-based" : "0-based index"})</td><td><code>0</code></td></tr>
        <tr><td><code>onChange</code></td><td><code>(index: number) =&gt; void</code></td><td><em>—</em></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>variant</code></td><td><code>"dots" | "bars"</code></td><td><code>"dots"</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Diapositive"</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Rend une liste de boutons avec role=\"tablist\" ; le repère courant porte aria-current. label préfixe l'étiquette accessible de chaque repère." : "Renders a button list with role=\"tablist\"; the current marker carries aria-current. label prefixes each marker's accessible name."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
    </ul>
  </section>
</div>
