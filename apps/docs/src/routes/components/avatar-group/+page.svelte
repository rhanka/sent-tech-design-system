<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const overflowDemo: NodeSpec[] = [
    {
      comp: "AvatarGroup",
      props: { max: 3, total: 8 },
      children: [
        { comp: "Avatar", props: { name: "Ada Lovelace", tone: "category1" } },
        { comp: "Avatar", props: { name: "Grace Hopper", tone: "category3" } },
        { comp: "Avatar", props: { name: "Alan Turing", tone: "category5" } }
      ]
    }
  ];
  const sizeDemo: NodeSpec[] = [
    {
      comp: "AvatarGroup",
      props: { size: "sm", max: 2, total: 4 },
      children: [
        { comp: "Avatar", props: { name: "Ada Lovelace", size: "sm", tone: "category2" } },
        { comp: "Avatar", props: { name: "Grace Hopper", size: "sm", tone: "category6" } }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Divers" : "Component · Other"}</p>
    <div class="docs-hero-title">
      <h1>AvatarGroup</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Empile des Avatar avec recouvrement. Au-delà de max, un jeton « +N » résume le reste à partir du total réel."
        : "Stacks Avatars with overlap. Past max, a “+N” token summarizes the rest from the real total."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={overflowDemo} title={fr ? "max=3, total=8" : "max=3, total=8"} />
    <TabbedExample nodes={sizeDemo} title={fr ? "size=\"sm\"" : "size=\"sm\""} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>max</code></td><td><code>number</code></td><td><em>—</em></td></tr>
        <tr><td><code>total</code></td><td><code>number</code></td><td><em>—</em></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg" | "xl"</code></td><td><code>"md"</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Le jeton « +N » s'affiche quand total > max. Pensez à passer la même size aux Avatar enfants." : "The “+N” token appears when total > max. Pass the same size to child Avatars for consistency."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-category-1</code> … <code>--st-category-8</code></li>
    </ul>
  </section>
</div>
