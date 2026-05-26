<script lang="ts">
  import { Badge, Card, Button } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      intro:
        "Conteneur de surface élevée avec bordure, rayon, ombre et padding. Rend un `<section>` et expose un slot `children` ; la variante `interactive` ajoute hover (élévation + translation) et curseur pointeur.",
      usageTitle: "Notes d’usage",
      usageNote1:
        "`interactive` est purement visuel (hover, curseur) : la carte reste un `<section>`. Pour une carte cliquable, câblez l’interaction via les attributs HTML transmis (`...rest`, ex. `onclick`, `role`, `tabindex`).",
      usageNote2:
        "Tout le contenu passe par le slot `children`. Les cartes ne s’imbriquent pas dans d’autres cartes (anti-pattern proscrit) ; présentez plutôt les variantes côte à côte.",
      usageNote3:
        "Le composant ne contraint ni la largeur ni la mise en page interne : composez le contenu (titres, texte, actions) à votre gré dans le slot.",
      staticLabel: "Statique vs interactive (côte à côte)",
      contentLabel: "Carte avec contenu structuré",
      cardTitleA: "Carte statique",
      cardBodyA: "Surface par défaut, sans effet de survol.",
      cardTitleB: "Carte interactive",
      cardBodyB: "Élévation et translation au survol.",
      planTitle: "Plan Équipe",
      planBody: "Quota mensuel partagé, sièges illimités, support prioritaire.",
      planAction: "Choisir ce plan"
    },
    en: {
      intro:
        "Raised surface container with border, radius, shadow, and padding. Renders a `<section>` and exposes a `children` slot; the `interactive` variant adds hover (elevation + lift) and a pointer cursor.",
      usageTitle: "Usage notes",
      usageNote1:
        "`interactive` is purely visual (hover, cursor): the card stays a `<section>`. For a clickable card, wire the interaction through forwarded HTML attributes (`...rest`, e.g. `onclick`, `role`, `tabindex`).",
      usageNote2:
        "All content flows through the `children` slot. Cards must not nest inside other cards (forbidden anti-pattern); present variants side by side instead.",
      usageNote3:
        "The component constrains neither width nor inner layout: compose the content (titles, text, actions) freely inside the slot.",
      staticLabel: "Static vs interactive (side by side)",
      contentLabel: "Card with structured content",
      cardTitleA: "Static card",
      cardBodyA: "Default surface, no hover effect.",
      cardTitleB: "Interactive card",
      cardBodyB: "Elevation and lift on hover.",
      planTitle: "Team plan",
      planBody: "Shared monthly quota, unlimited seats, priority support.",
      planAction: "Choose this plan"
    }
  } as const;

  const text = () => copy[locale.value];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · {locale.value === "fr" ? "Structure" : "Layout"}</p>
    <h1>
      Card
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example" aria-label={text().staticLabel}>
      <Card>
        <h3>{text().cardTitleA}</h3>
        <p>{text().cardBodyA}</p>
      </Card>
      <Card interactive>
        <h3>{text().cardTitleB}</h3>
        <p>{text().cardBodyB}</p>
      </Card>
    </div>

    <div class="docs-example" aria-label={text().contentLabel}>
      <Card>
        <h3>{text().planTitle}</h3>
        <p>{text().planBody}</p>
        <Button variant="primary">{text().planAction}</Button>
      </Card>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>interactive</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
        <tr><td colspan="3"><em>{locale.value === "fr" ? "+ attributs HTMLElement transmis (...rest, ex. onclick, role, id)" : "+ forwarded HTMLElement attributes (...rest, e.g. onclick, role, id)"}</em></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote1}</p>
    <p class="docs-demo-note">{text().usageNote2}</p>
    <p class="docs-demo-note">{text().usageNote3}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-card-background</code></li>
      <li><code>--st-component-card-border</code></li>
      <li><code>--st-component-card-radius</code></li>
      <li><code>--st-component-card-shadow</code></li>
      <li><code>--st-semantic-surface-raised</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-spacing-4</code></li>
      <li><code>--st-shadow-medium</code></li>
      <li><code>--st-motion-normal</code></li>
      <li><code>--st-motion-easing</code></li>
    </ul>
  </section>
</div>
