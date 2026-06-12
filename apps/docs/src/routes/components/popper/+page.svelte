<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Primitive · Overlay" : "Primitive · Overlay"}</p>
    <div class="docs-hero-title">
      <h1>Popper</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Positionne un panneau flottant à côté d'une ancre. Géométrie pure et partagée entre frameworks : flip vers le côté opposé en cas de débordement, shift sur l'axe transverse, arrow optionnelle. Le repositionnement suit le scroll et le resize. SSR-safe : tout accès au DOM se fait dans des effets."
        : "Positions a floating panel next to an anchor. Pure geometry shared across frameworks: flip to the opposite side on overflow, shift along the cross axis, optional arrow. Repositioning follows scroll and resize. SSR-safe: all DOM access happens inside effects."}
    </p>
  </section>

  <TabbedExample nodes={getExample("popper")?.nodes ?? []} />

  <section class="docs-section">
    <h2>{fr ? "Une primitive ancrée" : "An anchored primitive"}</h2>
    <p>
      {fr
        ? "Popper ne rend rien tant qu'il n'a pas à la fois open=true et une ancre (un HTMLElement réel). L'aperçu live ci-dessus est volontairement ouvert sans ancre : il se rend proprement à vide. Basculez le sélecteur de framework de l'aperçu pour comparer l'usage réel (Svelte / React / Vue) : on lie une ancre via une ref puis on bascule open."
        : "Popper renders nothing until it has both open=true and an anchor (a real HTMLElement). The live preview above is intentionally open without an anchor: it renders cleanly empty. Switch the preview's framework selector to compare real usage (Svelte / React / Vue): bind an anchor via a ref then toggle open."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>anchor</code></td><td><code>HTMLElement | null</code></td><td><em>–</em></td></tr>
        <tr><td><code>open</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>placement</code></td><td><code>"top" | "bottom" | "left" | "right" | "*-start" | "*-end"</code></td><td><code>"bottom"</code></td></tr>
        <tr><td><code>offset</code></td><td><code>number</code></td><td><code>8</code></td></tr>
        <tr><td><code>flip</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>shift</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>arrow</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>strategy</code></td><td><code>"absolute" | "fixed"</code></td><td><code>"absolute"</code></td></tr>
        <tr><td><code>portal</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>onPlacementChange</code></td><td><code>(placement) =&gt; void</code></td><td><em>–</em></td></tr>
      </tbody>
    </table>
    <p>
      {fr
        ? "Le placement résolu peut différer du placement demandé après un flip ; onPlacementChange notifie ce changement. Avec portal=true (défaut) le panneau est rendu dans le <body> pour échapper aux conteneurs à overflow."
        : "The resolved placement may differ from the requested one after a flip; onPlacementChange reports that change. With portal=true (default) the panel renders into <body> to escape overflow-clipping containers."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-surface-raised</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
    </ul>
    <p>
      {fr
        ? "Popper se contente de positionner ; l'apparence du panneau (surface, ombre, rayon) vient de votre contenu et des tokens du thème."
        : "Popper only positions; the panel's appearance (surface, shadow, radius) comes from your content and the theme tokens."}
    </p>
  </section>
</div>
