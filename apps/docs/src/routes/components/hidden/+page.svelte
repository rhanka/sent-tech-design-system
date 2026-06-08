<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const belowDemo: NodeSpec[] = [
    {
      comp: "Hidden",
      props: { below: "lg" },
      children: [{ comp: "Badge", props: { tone: "info" }, children: ["Visible ≥ lg (1024 px)"] }]
    }
  ];
  const aboveDemo: NodeSpec[] = [
    {
      comp: "Hidden",
      props: { above: "sm" },
      children: [{ comp: "Badge", props: { tone: "warning" }, children: ["Visible < sm (640 px)"] }]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Structure" : "Component · Layout"}</p>
    <div class="docs-hero-title">
      <h1>Hidden</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Masque son contenu au-dessus ou en-dessous d'un breakpoint (sm 640 / md 768 / lg 1024 / xl 1280) via CSS uniquement. Redimensionnez la fenêtre pour observer."
        : "Hides its content above or below a breakpoint (sm 640 / md 768 / lg 1024 / xl 1280) via CSS only. Resize the window to observe."}
    </p>
  </section>

  <TriRender nodes={getExample("hidden")?.nodes ?? []} label={fr ? "Aperçu live" : "Live preview"} />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TriRender nodes={belowDemo} label={fr ? "below=\"lg\"" : "below=\"lg\""} />
    <TriRender nodes={aboveDemo} label={fr ? "above=\"sm\"" : "above=\"sm\""} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>below</code></td><td><code>"sm" | "md" | "lg" | "xl"</code></td><td><em>—</em></td></tr>
        <tr><td><code>above</code></td><td><code>"sm" | "md" | "lg" | "xl"</code></td><td><em>—</em></td></tr>
        <tr><td><code>as</code></td><td><code>string</code></td><td><code>"div"</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Le wrapper rend display: contents : aucun nœud de mise en page superflu quand il est visible." : "The wrapper renders display: contents: no extra layout node when visible."}</p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Accessibilité" : "Accessibility"}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr ? "Le masquage est purement visuel (display: none) : le contenu masqué est aussi retiré de l'arbre d'accessibilité." : "Hiding is purely visual (display: none): hidden content is also removed from the accessibility tree."}</li>
      <li>{fr ? "Ne pas l'utiliser pour cacher du contenu critique à un seul jeu d'utilisateurs sans alternative." : "Do not use it to hide content critical to one set of users without an alternative."}</li>
    </ul>
  </section>
</div>
