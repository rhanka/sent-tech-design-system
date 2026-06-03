<script lang="ts">
  import { Badge, Card, Button } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

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
    <div class="docs-hero-title">
      <h1>Card</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <FrameworkPreview example="card" title="Aperçu live" />

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Quand l'utiliser" : "When to use"}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{locale.value === "fr" ? "Regrouper visuellement un bloc de contenu autonome (résumé, plan, élément de liste riche)." : "Visually group a self-contained block of content (summary, plan, rich list item)."}</li>
      <li>{locale.value === "fr" ? "Utilisez interactive uniquement si toute la carte mène à une action ou une destination." : "Use interactive only when the whole card leads to a single action or destination."}</li>
      <li>{locale.value === "fr" ? "N'imbriquez pas une carte dans une autre carte." : "Don't nest a card inside another card."}</li>
    </ul>
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
    <h2>{locale.value === "fr" ? "Anatomie" : "Anatomy"}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{locale.value === "fr" ? "Élément racine : un <section> (classe st-card) avec bordure, rayon et ombre." : "Root element: a <section> (class st-card) with border, radius, and shadow."}</li>
      <li>{locale.value === "fr" ? "Contenu : entièrement libre, via le slot children." : "Content: fully free-form, via the children slot."}</li>
      <li>{locale.value === "fr" ? "Variante interactive : ajoute une élévation et une translation au survol." : "Interactive variant: adds elevation and a lift on hover."}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Accessibilité" : "Accessibility"}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{locale.value === "fr" ? "La carte est un <section> neutre : ce n'est pas un contrôle par défaut." : "The card is a neutral <section>: it is not a control by default."}</li>
      <li>{locale.value === "fr" ? "Pour une carte cliquable, câblez role/tabindex/onclick (ou englobez un seul lien/bouton) et assurez un focus visible." : "For a clickable card, wire role/tabindex/onclick (or wrap a single link/button) and ensure a visible focus."}</li>
      <li>{locale.value === "fr" ? "Ne reposez pas l'interactivité sur le seul effet de survol : prévoyez un état focus." : "Don't rely on hover alone for interactivity: provide a focus state."}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Lignes directrices" : "Guidelines"}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{locale.value === "fr" ? "À faire" : "Do"}</p>
        <ul>
          <li>{locale.value === "fr" ? "Une seule action principale par carte interactive." : "A single primary action per interactive card."}</li>
          <li>{locale.value === "fr" ? "Aligner les cartes sur une grille régulière." : "Align cards on a consistent grid."}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{locale.value === "fr" ? "À éviter" : "Don't"}</p>
        <ul>
          <li>{locale.value === "fr" ? "Imbriquer des cartes ou empiler des ombres." : "Nest cards or stack shadows."}</li>
          <li>{locale.value === "fr" ? "Marquer interactive sans cible cliquable réelle." : "Mark interactive without a real clickable target."}</li>
        </ul>
      </div>
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
      <li><code>--st-component-card-anatomy-states-hover-bg</code></li>
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
