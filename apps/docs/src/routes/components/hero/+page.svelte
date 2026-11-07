<script lang="ts">
  import { Badge, Button, Hero, Link } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Structure", "Component · Layout")}</p>
    <div class="docs-hero-title">
      <h1>Hero</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
      <Badge tone="info">{fr("Svelte uniquement", "Svelte only")}</Badge>
    </div>
    <p>
      {fr(
        "Bandeau marketing plein bord : image de fond décorative, voile dégradé tokenisé, titre, sous-titre et actions centrés, contenu libre (grille de cartes) et indicateur de défilement optionnel. Deux tailles : full (accueil, 100vh sous un header fixe) et compact (en-tête d'article, page 404).",
        "Full-bleed marketing banner: decorative background image, tokenised gradient overlay, centered title, subtitle and actions, free content (card grid) and an optional scroll cue. Two sizes: full (home page, 100vh under a fixed header) and compact (article header, 404 page)."
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
    <h3>{fr("Taille full (hauteur réduite pour la démo)", "Full size (height reduced for the demo)")}</h3>
    <div class="docs-example" style="--st-component-hero-fullMinHeight: 28rem;">
      <Hero
        title={fr("Architecture et réalisation IA", "AI architecture and delivery")}
        subtitle={fr("Du PoC au produit en production, avec un design system unique.", "From PoC to production product, on a single design system.")}
        scrollCue
      >
        {#snippet actions()}
          <Button variant="primary">{fr("Nous contacter", "Contact us")}</Button>
          <Button variant="secondary">{fr("Voir les offres", "See the offers")}</Button>
        {/snippet}
      </Hero>
    </div>
    <h3>{fr("Taille compact (en-tête d'article)", "Compact size (article header)")}</h3>
    <div class="docs-example">
      <Hero size="compact" title={fr("Titre de l'article", "Article title")} subtitle="2026-11-06 · 6 min">
        {#snippet leading()}
          <Link href="/components/hero">{fr("Retour au blog", "Back to blog")}</Link>
        {/snippet}
      </Hero>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>size</code></td><td><code>"full" | "compact"</code></td><td><code>"full"</code></td></tr>
        <tr><td><code>image</code></td><td><code>string</code></td><td>—</td></tr>
        <tr><td><code>overlay</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
        <tr><td><code>title</code></td><td><code>string</code></td><td>—</td></tr>
        <tr><td><code>headingLevel</code></td><td><code>1 | 2</code></td><td><code>1</code></td></tr>
        <tr><td><code>subtitle</code></td><td><code>string</code></td><td>—</td></tr>
        <tr><td><code>align</code></td><td><code>"center" | "start"</code></td><td><code>"center"</code> (full) / <code>"start"</code> (compact)</td></tr>
        <tr><td><code>width</code></td><td><code>ContainerSize</code></td><td><code>"lg"</code></td></tr>
        <tr><td><code>contentWidth</code></td><td><code>ContainerSize</code></td><td><code>"xl"</code></td></tr>
        <tr><td><code>scrollCue</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>scrollCueHref</code></td><td><code>string</code></td><td>—</td></tr>
        <tr><td><code>scrollCueLabel</code></td><td><code>string</code></td><td><code>"Faire défiler"</code></td></tr>
        <tr><td><code>leading</code> / <code>actions</code> / <code>children</code></td><td><code>Snippet</code></td><td>—</td></tr>
        <tr><td><code>as</code></td><td><code>string</code></td><td><code>"section"</code></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-hero-overlay</code> → <code>--st-semantic-gradient-hero</code></li>
      <li><code>--st-component-hero-overlayOpacity</code> (0.9)</li>
      <li><code>--st-component-hero-background</code> → <code>--st-semantic-surface-inverse</code></li>
      <li><code>--st-component-hero-text</code> → <code>--st-semantic-text-inverse</code></li>
      <li><code>--st-component-hero-fullMinHeight</code> (100vh), <code>--st-component-hero-fullPaddingTop</code> (5rem)</li>
      <li><code>--st-component-hero-compactPaddingTop</code> (7rem), <code>--st-component-hero-titleSize</code>, <code>--st-component-hero-subtitleSize</code></li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("L'image et le voile sont décoratifs (aria-hidden, alt vide) : le sens est porté par le titre.", "The image and overlay are decorative (aria-hidden, empty alt): meaning is carried by the title.")}</li>
      <li>{fr("Sans scrollCueHref, l'indicateur est décoratif ; avec, c'est un lien nommé par scrollCueLabel.", "Without scrollCueHref the cue is decorative; with it, the cue is a link named by scrollCueLabel.")}</li>
      <li>{fr("Un seul h1 par page : passez headingLevel={2} si la page a déjà un h1.", "One h1 per page: pass headingLevel={2} when the page already has an h1.")}</li>
    </ul>
  </section>
</div>
