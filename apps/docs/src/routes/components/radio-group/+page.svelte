<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const verticalDemo: NodeSpec[] = [
    {
      comp: "RadioGroup",
      props: {
        legend: fr ? "Livraison" : "Shipping",
        name: "shipping",
        value: "standard",
        helperText: fr ? "Choisissez un mode unique." : "Pick a single mode.",
        options: [
          { label: fr ? "Standard (3–5 j)" : "Standard (3–5 d)", value: "standard" },
          { label: fr ? "Express (24 h)" : "Express (24 h)", value: "express" },
          { label: fr ? "Retrait en point relais" : "Pickup point", value: "pickup" }
        ]
      }
    }
  ];
  const horizontalDemo: NodeSpec[] = [
    {
      comp: "RadioGroup",
      props: {
        legend: fr ? "Taille" : "Size",
        name: "size",
        orientation: "horizontal",
        value: "m",
        options: [
          { label: "S", value: "s" },
          { label: "M", value: "m" },
          { label: "L", value: "l" }
        ]
      }
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Formulaire" : "Component · Form"}</p>
    <div class="docs-hero-title">
      <h1>RadioGroup</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Choix exclusif parmi plusieurs options. Le name partagé garantit l'exclusivité radio ; valeur contrôlée unique et légende fieldset."
        : "Exclusive choice among options. A shared name guarantees radio exclusivity; single controlled value and fieldset legend."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={verticalDemo} title={fr ? "Vertical (par défaut)" : "Vertical (default)"} />
    <TabbedExample nodes={horizontalDemo} title={fr ? "orientation=\"horizontal\"" : "orientation=\"horizontal\""} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>legend</code></td><td><code>string</code></td><td><em>{fr ? "requis" : "required"}</em></td></tr>
        <tr><td><code>name</code></td><td><code>string</code></td><td><em>{fr ? "requis" : "required"}</em></td></tr>
        <tr><td><code>options</code></td><td><code>{`{ label, value, disabled?, helperText? }[]`}</code></td><td><code>[]</code></td></tr>
        <tr><td><code>value</code></td><td><code>string</code></td><td><em>—</em></td></tr>
        <tr><td><code>onchange</code> / <code>onChange</code></td><td><code>(value: string) =&gt; void</code></td><td><em>—</em></td></tr>
        <tr><td><code>orientation</code></td><td><code>"vertical" | "horizontal"</code></td><td><code>"vertical"</code></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>—</em></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Rend un fieldset/legend natif. React expose onChange ; Svelte/Vue exposent onchange (ou @change)." : "Renders a native fieldset/legend. React exposes onChange; Svelte/Vue expose onchange (or @change)."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-spacing-1</code> … <code>--st-spacing-12</code></li>
    </ul>
  </section>
</div>
