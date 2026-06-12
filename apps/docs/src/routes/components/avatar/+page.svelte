<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const initialsDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "fp-row" },
      children: [
        { comp: "Avatar", props: { name: "Ada Lovelace", tone: "category1" } },
        { comp: "Avatar", props: { name: "Grace Hopper", tone: "category3" } },
        { comp: "Avatar", props: { name: "Alan Turing", tone: "category5" } }
      ]
    }
  ];
  const sizeDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "fp-row" },
      children: [
        { comp: "Avatar", props: { name: "Sent Tech", size: "sm" } },
        { comp: "Avatar", props: { name: "Sent Tech", size: "md" } },
        { comp: "Avatar", props: { name: "Sent Tech", size: "lg" } },
        { comp: "Avatar", props: { name: "Sent Tech", size: "xl", shape: "square" } }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Divers" : "Component · Other"}</p>
    <div class="docs-hero-title">
      <h1>Avatar</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Vignette d'identité : initiales dérivées du nom sur fond coloré, ou photo si une source est fournie. Quatre tailles et deux formes."
        : "Identity badge: initials derived from the name on a colored background, or a photo when a source is provided. Four sizes and two shapes."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={initialsDemo} title={fr ? "Initiales colorées" : "Colored initials"} />
    <TabbedExample nodes={sizeDemo} title={fr ? "Tailles et formes" : "Sizes and shapes"} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>name</code></td><td><code>string</code></td><td><em>{fr ? "requis" : "required"}</em></td></tr>
        <tr><td><code>src</code></td><td><code>string</code></td><td><em>–</em></td></tr>
        <tr><td><code>alt</code></td><td><code>string</code></td><td><code>name</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg" | "xl"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>shape</code></td><td><code>"circle" | "square"</code></td><td><code>"circle"</code></td></tr>
        <tr><td><code>tone</code></td><td><code>"category1" … "category8"</code></td><td><code>"category1"</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Rend role=\"img\" avec aria-label dérivé de alt ou name. Les initiales sont calculées à partir du nom." : "Renders role=\"img\" with an aria-label from alt or name. Initials are derived from the name."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-category-1</code> … <code>--st-category-8</code></li>
    </ul>
  </section>
</div>
