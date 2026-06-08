<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const verticalDemo: NodeSpec[] = [
    {
      comp: "CheckboxGroup",
      props: {
        legend: fr ? "Permissions" : "Permissions",
        value: ["read", "write"],
        options: [
          { label: fr ? "Lecture" : "Read", value: "read" },
          { label: fr ? "Écriture" : "Write", value: "write" },
          { label: fr ? "Administration" : "Admin", value: "admin" }
        ]
      }
    }
  ];
  const horizontalDemo: NodeSpec[] = [
    {
      comp: "CheckboxGroup",
      props: {
        legend: fr ? "Jours actifs" : "Active days",
        orientation: "horizontal",
        value: ["mon"],
        options: [
          { label: "Lun", value: "mon" },
          { label: "Mar", value: "tue" },
          { label: "Mer", value: "wed" }
        ]
      }
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Formulaire" : "Component · Form"}</p>
    <div class="docs-hero-title">
      <h1>CheckboxGroup</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Ensemble de cases à cocher dérivé d'une liste d'options. Valeur contrôlée multiple, légende fieldset et description optionnelle."
        : "Set of checkboxes derived from an options list. Controlled multi-value, fieldset legend, and optional description."}
    </p>
  </section>

  <TriRender nodes={getExample("checkbox-group")?.nodes ?? []} label={fr ? "Aperçu live" : "Live preview"} />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TriRender nodes={verticalDemo} label={fr ? "Vertical (par défaut)" : "Vertical (default)"} />
    <TriRender nodes={horizontalDemo} label={fr ? "orientation=\"horizontal\"" : "orientation=\"horizontal\""} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>legend</code></td><td><code>string</code></td><td><em>{fr ? "requis" : "required"}</em></td></tr>
        <tr><td><code>options</code></td><td><code>{`{ label, value, disabled?, helperText? }[]`}</code></td><td><code>[]</code></td></tr>
        <tr><td><code>value</code></td><td><code>string[]</code></td><td><code>[]</code></td></tr>
        <tr><td><code>onchange</code> / <code>onChange</code></td><td><code>(value: string[]) =&gt; void</code></td><td><em>—</em></td></tr>
        <tr><td><code>orientation</code></td><td><code>"vertical" | "horizontal"</code></td><td><code>"vertical"</code></td></tr>
        <tr><td><code>name</code></td><td><code>string</code></td><td><em>—</em></td></tr>
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
