<script lang="ts">
  import { Badge, Toggletip } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      intro:
        "Infobulle activable au clic et persistante : contrairement au Tooltip (survol/focus), la bulle reste affichée jusqu’à un nouveau clic ou Escape. Adaptée à un contenu lisible au lecteur d’écran (`aria-live=\"polite\"`).",
      usageTitle: "Notes d’usage",
      usageNote1:
        "Le déclencheur est un bouton rond « i ». `open` est `$bindable` : le clic bascule l’état, Escape ferme (géré via `svelte:window`).",
      usageNote2:
        "`content` est la chaîne affichée dans la bulle ; `label` ajoute un sur-titre optionnel. L’`aria-label` du bouton utilise `triggerLabel ?? label ?? \"More information\"`.",
      usageNote3:
        "`placement` positionne la bulle : `top` (défaut), `bottom`, `start`, `end`. Le slot `children` permet d’ajouter du contenu (ex. un libellé) avant le déclencheur.",
      placementLabel: "Placements",
      labelLabel: "Avec sur-titre et contenu enfant",
      inlineLabel: "Toggletip inline dans un libellé"
    },
    en: {
      intro:
        "Click-activated, persistent tip: unlike Tooltip (hover/focus), the bubble stays open until another click or Escape. Suited to screen-reader-readable content (`aria-live=\"polite\"`).",
      usageTitle: "Usage notes",
      usageNote1:
        "The trigger is a round “i” button. `open` is `$bindable`: clicking toggles it, Escape closes (handled via `svelte:window`).",
      usageNote2:
        "`content` is the string rendered in the bubble; `label` adds an optional overline. The button `aria-label` uses `triggerLabel ?? label ?? \"More information\"`.",
      usageNote3:
        "`placement` positions the bubble: `top` (default), `bottom`, `start`, `end`. The `children` slot renders content (e.g. a label) before the trigger.",
      placementLabel: "Placements",
      labelLabel: "With overline and child content",
      inlineLabel: "Inline toggletip within a label"
    }
  } as const;

  const text = () => copy[locale.value];

  let topOpen = $state(false);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · {t(locale.value, "overlaysTitle")}</p>
    <h1>
      Toggletip
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example" aria-label={text().labelLabel}>
      <Toggletip
        bind:open={topOpen}
        label={locale.value === "fr" ? "Aide" : "Help"}
        content={locale.value === "fr"
          ? "La bulle reste ouverte jusqu’à un nouveau clic ou à la touche Escape."
          : "The bubble stays open until you click again or press Escape."}
        triggerLabel={locale.value === "fr" ? "Plus d’informations" : "More information"}
      >
        <span>{locale.value === "fr" ? "Quota mensuel" : "Monthly quota"}</span>
      </Toggletip>
      <p class="docs-demo-note">
        {locale.value === "fr" ? "État ouvert (binding)" : "Open state (binding)"}
        : <code>{topOpen}</code>
      </p>
    </div>

    <div class="docs-example" aria-label={text().placementLabel}>
      <Toggletip
        placement="top"
        content={locale.value === "fr" ? "Placement top" : "Top placement"}
        triggerLabel="top"
      >
        <span>top</span>
      </Toggletip>
      <Toggletip
        placement="bottom"
        content={locale.value === "fr" ? "Placement bottom" : "Bottom placement"}
        triggerLabel="bottom"
      >
        <span>bottom</span>
      </Toggletip>
      <Toggletip
        placement="start"
        content={locale.value === "fr" ? "Placement start" : "Start placement"}
        triggerLabel="start"
      >
        <span>start</span>
      </Toggletip>
      <Toggletip
        placement="end"
        content={locale.value === "fr" ? "Placement end" : "End placement"}
        triggerLabel="end"
      >
        <span>end</span>
      </Toggletip>
    </div>

    <div class="docs-demo-inline" aria-label={text().inlineLabel}>
      <span>{locale.value === "fr" ? "Taux d’occupation" : "Occupancy rate"}</span>
      <Toggletip
        content={locale.value === "fr"
          ? "Pourcentage de places réservées sur la capacité totale."
          : "Share of booked seats over total capacity."}
        triggerLabel={locale.value === "fr" ? "Définition" : "Definition"}
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>content</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "requis" : "required"}</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
        <tr><td><code>placement</code></td><td><code>"top" | "bottom" | "start" | "end"</code></td><td><code>"top"</code></td></tr>
        <tr><td><code>open</code></td><td><code>boolean</code> (<code>$bindable</code>)</td><td><code>false</code></td></tr>
        <tr><td><code>triggerLabel</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
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
      <li><code>--st-component-selection-switchTrack</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-border-strong</code></li>
      <li><code>--st-semantic-border-interactive</code></li>
      <li><code>--st-radius-md</code></li>
      <li><code>--st-shadow-sm</code></li>
      <li><code>--st-zindex-overlay</code></li>
    </ul>
  </section>
</div>
