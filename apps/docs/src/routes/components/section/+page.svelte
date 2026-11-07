<script lang="ts">
  import { Badge, Card, Section, Typography } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);
  const tones = ["default", "subtle", "gradient", "inverse"] as const;
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Structure", "Component · Layout")}</p>
    <div class="docs-hero-title">
      <h1>Section</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
      <Badge tone="info">{fr("Svelte uniquement", "Svelte only")}</Badge>
    </div>
    <p>
      {fr(
        "Bande de page pleine largeur : fond tokenisé plein bord, rythme vertical tokenisé, en-tête optionnel (titre + chapeau à longueur de ligne lisible) et contenu borné par un Container. Container ne fait que borner la largeur ; Section porte le fond et le rythme, d'où un composant distinct.",
        "Full-width page band: full-bleed tokenised background, tokenised vertical rhythm, optional header (title + lead at a readable line length) and content bounded by a Container. Container only bounds width; Section carries the background and rhythm, hence a separate component."
      )}
    </p>
    <p>
      {fr(
        "Les ports React, Vue et Angular sont des écarts de parité inscrits (packages/component-index/parity-baseline.json).",
        "React, Vue and Angular ports are recorded parity gaps (packages/component-index/parity-baseline.json)."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    {#each tones as tone (tone)}
      <h3><code>tone="{tone}"</code></h3>
      <div class="docs-example">
        <Section {tone} spacing="sm" title={fr("Nos offres", "Our offers")} lead={fr("Un chapeau borné à une longueur de ligne lisible.", "A lead bounded to a readable line length.")}>
          <Card>
            <Typography>{fr("Contenu de la section", "Section content")}</Typography>
          </Card>
        </Section>
      </div>
    {/each}
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>tone</code></td><td><code>"default" | "subtle" | "inverse" | "gradient"</code></td><td><code>"default"</code></td></tr>
        <tr><td><code>spacing</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"lg"</code> (6rem)</td></tr>
        <tr><td><code>width</code></td><td><code>ContainerSize</code></td><td><code>"xl"</code></td></tr>
        <tr><td><code>title</code></td><td><code>string</code></td><td>—</td></tr>
        <tr><td><code>headingLevel</code></td><td><code>2 | 3</code></td><td><code>2</code></td></tr>
        <tr><td><code>lead</code></td><td><code>string</code></td><td>—</td></tr>
        <tr><td><code>align</code></td><td><code>"center" | "start"</code></td><td><code>"center"</code></td></tr>
        <tr><td><code>as</code></td><td><code>string</code></td><td><code>"section"</code></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-section-paddingBlock</code> (6rem), <code>-paddingBlockMd</code> (5rem), <code>-paddingBlockSm</code> (3rem)</li>
      <li><code>--st-component-section-subtleBackground</code> → <code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-component-section-gradientBackground</code> → <code>--st-semantic-gradient-subtle</code></li>
      <li><code>--st-component-section-inverseBackground</code> → <code>--st-semantic-surface-inverse</code>, <code>--st-component-section-inverseText</code> → <code>--st-semantic-text-inverse</code></li>
      <li><code>--st-component-section-measure</code> (48rem), <code>--st-component-section-titleSize</code>, <code>--st-component-section-leadSize</code></li>
      <li><code>--st-component-section-scrollMargin</code> (5rem, header fixe)</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Rendue en <section> : donnez-lui un id pour les ancres ; scroll-margin-top la dégage du header fixe.", "Rendered as <section>: give it an id for anchors; scroll-margin-top clears the fixed header.")}</li>
      <li>{fr("tone=\"inverse\" passe le titre et le chapeau en texte inverse ; dans le contenu, utilisez Typography tone=\"inverse\".", "tone=\"inverse\" switches the title and lead to inverse text; in the content, use Typography tone=\"inverse\".")}</li>
    </ul>
  </section>
</div>
