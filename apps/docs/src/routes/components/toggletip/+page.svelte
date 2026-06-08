<script lang="ts">
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      intro:
        "Infobulle activable au clic et persistante : contrairement au Tooltip (survol/focus), la bulle reste affichée jusqu’à un nouveau clic ou Escape. Adaptée à un contenu lisible au lecteur d’écran (`aria-live=\"polite\"`).",
      usageTitle: "Notes d’usage",
      usageNote1:
        "Le déclencheur est un bouton rond « i » (Svelte). `open` est `$bindable` : le clic bascule l’état, Escape ferme (géré via `svelte:window`).",
      usageNote2:
        "`content` est la chaîne affichée dans la bulle ; `label` ajoute un sur-titre optionnel. L’`aria-label` du bouton utilise `triggerLabel ?? label ?? \"More information\"`.",
      usageNote3:
        "`placement` positionne la bulle : `top` (défaut), `bottom`, `start`, `end`. Le slot `children` (Svelte) permet d’ajouter du contenu (ex. un libellé) avant le déclencheur ; en React/Vue, `label` sert de texte du bouton.",
      placementLabel: "Placements",
      labelLabel: "Avec sur-titre et contenu",
      inlineLabel: "Toggletip inline"
    },
    en: {
      intro:
        "Click-activated, persistent tip: unlike Tooltip (hover/focus), the bubble stays open until another click or Escape. Suited to screen-reader-readable content (`aria-live=\"polite\"`).",
      usageTitle: "Usage notes",
      usageNote1:
        "The trigger is a round “i” button (Svelte). `open` is `$bindable`: clicking toggles it, Escape closes (handled via `svelte:window`).",
      usageNote2:
        "`content` is the string rendered in the bubble; `label` adds an optional overline. The button `aria-label` uses `triggerLabel ?? label ?? \"More information\"`.",
      usageNote3:
        "`placement` positions the bubble: `top` (default), `bottom`, `start`, `end`. The `children` slot (Svelte) renders content (e.g. a label) before the trigger; in React/Vue, `label` is the button text.",
      placementLabel: "Placements",
      labelLabel: "With overline and content",
      inlineLabel: "Inline toggletip"
    }
  } as const;

  const text = () => copy[locale.value];

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc « Aperçu live »). État
  // statique : pas de binding live (note en prose). Divergence de moteur :
  // Svelte rend une icône « i » et utilise `triggerLabel` comme aria-label ;
  // React/Vue rendent `label` comme texte du bouton. On passe les deux
  // (l'extra est ignoré).
  const labelDemo: NodeSpec[] = $derived([
    {
      comp: "Toggletip",
      props: {
        label: locale.value === "fr" ? "Aide" : "Help",
        content:
          locale.value === "fr"
            ? "La bulle reste ouverte jusqu’à un nouveau clic ou à la touche Escape."
            : "The bubble stays open until you click again or press Escape.",
        triggerLabel: locale.value === "fr" ? "Plus d’informations" : "More information"
      }
    }
  ]);

  const placementDemo: NodeSpec[] = $derived([
    {
      comp: "Toggletip",
      props: {
        placement: "top",
        label: "top",
        content: locale.value === "fr" ? "Placement top" : "Top placement",
        triggerLabel: "top"
      }
    },
    {
      comp: "Toggletip",
      props: {
        placement: "bottom",
        label: "bottom",
        content: locale.value === "fr" ? "Placement bottom" : "Bottom placement",
        triggerLabel: "bottom"
      }
    },
    {
      comp: "Toggletip",
      props: {
        placement: "start",
        label: "start",
        content: locale.value === "fr" ? "Placement start" : "Start placement",
        triggerLabel: "start"
      }
    },
    {
      comp: "Toggletip",
      props: {
        placement: "end",
        label: "end",
        content: locale.value === "fr" ? "Placement end" : "End placement",
        triggerLabel: "end"
      }
    }
  ]);

  const inlineDemo: NodeSpec[] = $derived([
    {
      comp: "Toggletip",
      props: {
        label: locale.value === "fr" ? "Taux d’occupation" : "Occupancy rate",
        content:
          locale.value === "fr"
            ? "Pourcentage de places réservées sur la capacité totale."
            : "Share of booked seats over total capacity.",
        triggerLabel: locale.value === "fr" ? "Définition" : "Definition"
      }
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · {t(locale.value, "overlaysTitle")}</p>
    <div class="docs-hero-title">
      <h1>Toggletip</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <FrameworkPreview example="toggletip" title="Aperçu live" />


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <FrameworkDemo nodes={labelDemo} label={text().labelLabel} />
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "État fermé par défaut : cliquez le déclencheur pour ouvrir la bulle (open est bindable)."
        : "Closed by default: click the trigger to open the bubble (open is bindable)."}
    </p>

    <FrameworkDemo nodes={placementDemo} label={text().placementLabel} />

    <FrameworkDemo nodes={inlineDemo} label={text().inlineLabel} />
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "Sans slot children, le déclencheur s’affiche seul (icône « i » en Svelte, texte label en React/Vue)."
        : "With no children slot, the trigger stands alone (an “i” icon in Svelte, the label text in React/Vue)."}
    </p>
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
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>
</div>
