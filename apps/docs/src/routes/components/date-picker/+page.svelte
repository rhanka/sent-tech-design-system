<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import type { NodeSpec } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      intro:
        "Sélecteur de date en lecture seule avec popover calendrier : mode date unique ou plage, navigation par mois, bornes min/max, premier jour de semaine déduit de la locale et bouton « Aujourd’hui ».",
      singleTitle: "Date unique",
      rangeTitle: "Plage de dates",
      boundedTitle: "Dates bornées (min / max)",
      errorTitle: "Champ invalide",
      usageTitle: "Notes d’usage",
      usageNote1:
        "En `mode=\"single\"` (défaut) la valeur liée est `Date | null` ; en `mode=\"range\"` c’est un objet `DatePickerRange` `{ start, end }`. Le runtime lit `mode` au moment de l’accès, donc une mauvaise combinaison reste non fatale.",
      usageNote2:
        "Les libellés (`openLabel`, `previousMonthLabel`, `nextMonthLabel`, `todayLabel`) et le `placeholder` sont déduits de `locale` (fr-FR par défaut) si non fournis.",
      usageNote3:
        "Le popover se ferme au clic extérieur et avec la touche Échap ; les dates hors `min`/`max` sont désactivées.",
      singleLabel: "Date de l’événement",
      singleHelper: "Sélectionnez un jour.",
      rangeLabel: "Période de réservation",
      boundedLabel: "Date dans les 30 prochains jours",
      errorLabel: "Date limite",
      errorText: "Une date est requise."
    },
    en: {
      intro:
        "Read-only date field with a calendar popover: single-date or range mode, month navigation, min/max bounds, locale-aware first day of week and a “Today” button.",
      singleTitle: "Single date",
      rangeTitle: "Date range",
      boundedTitle: "Bounded dates (min / max)",
      errorTitle: "Invalid field",
      usageTitle: "Usage notes",
      usageNote1:
        "In `mode=\"single\"` (default) the bound value is `Date | null`; in `mode=\"range\"` it is a `DatePickerRange` object `{ start, end }`. The runtime reads `mode` at access time, so a mismatched combination is non-fatal.",
      usageNote2:
        "Labels (`openLabel`, `previousMonthLabel`, `nextMonthLabel`, `todayLabel`) and the `placeholder` are derived from `locale` (fr-FR by default) when not provided.",
      usageNote3:
        "The popover closes on outside click and on the Escape key; dates outside `min`/`max` are disabled.",
      singleLabel: "Event date",
      singleHelper: "Pick a day.",
      rangeLabel: "Booking period",
      boundedLabel: "Date within the next 30 days",
      errorLabel: "Deadline",
      errorText: "A date is required."
    }
  } as const;

  const text = () => copy[locale.value];

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // Démos réactives au changement de locale : les labels basculent fr/en.
  // Les valeurs ISO restent des chaînes (les islands coercent string -> Date ;
  // SvelteNode.adaptProps fait de même côté Svelte depuis la correction WP16).
  const singleDemo: NodeSpec[] = $derived([
    {
      comp: "DatePicker",
      props: {
        label: text().singleLabel,
        helperText: text().singleHelper,
        value: "2026-06-15"
      }
    }
  ]);

  const rangeDemo: NodeSpec[] = $derived([
    { comp: "DatePicker", props: { label: text().rangeLabel, mode: "range" } }
  ]);

  const boundedDemo: NodeSpec[] = $derived([
    {
      comp: "DatePicker",
      props: {
        label: text().boundedLabel,
        min: "2026-06-01",
        max: "2026-06-30",
        value: "2026-06-15"
      }
    }
  ]);

  const errorDemo: NodeSpec[] = $derived([
    {
      comp: "DatePicker",
      props: {
        label: text().errorLabel,
        size: "sm",
        errorText: text().errorText,
        invalid: true
      }
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaire</p>
    <div class="docs-hero-title">
      <h1>DatePicker</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <TabbedExample nodes={getExample("datepicker")?.nodes ?? []} />


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={singleDemo} title={text().singleTitle} />
    <TabbedExample nodes={rangeDemo} title={text().rangeTitle} />
    <TabbedExample nodes={boundedDemo} title={text().boundedTitle} />
    <TabbedExample nodes={errorDemo} title={text().errorTitle} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>value</code></td><td><code>Date | DatePickerRange | null</code> (<code>$bindable</code>)</td><td><em>déduit du mode</em></td></tr>
        <tr><td><code>mode</code></td><td><code>"single" | "range"</code></td><td><code>"single"</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>errorText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>min</code></td><td><code>Date</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>max</code></td><td><code>Date</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>locale</code></td><td><code>string</code></td><td><code>"fr-FR"</code></td></tr>
        <tr><td><code>placeholder</code></td><td><code>string</code></td><td><em>déduit de la locale</em></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>id</code></td><td><code>string</code></td><td><em>auto-généré</em></td></tr>
        <tr><td><code>openLabel</code></td><td><code>string</code></td><td><em>déduit de la locale</em></td></tr>
        <tr><td><code>previousMonthLabel</code></td><td><code>string</code></td><td><em>déduit de la locale</em></td></tr>
        <tr><td><code>nextMonthLabel</code></td><td><code>string</code></td><td><em>déduit de la locale</em></td></tr>
        <tr><td><code>todayLabel</code></td><td><code>string</code></td><td><em>déduit de la locale</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>...rest</code></td><td><code>HTMLAttributes&lt;HTMLDivElement&gt;</code> (sauf <code>class</code>)</td><td><em>optionnel</em></td></tr>
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
      <li><code>--st-component-field-gap</code></li>
      <li><code>--st-component-field-labelText</code></li>
      <li><code>--st-component-field-helpText</code></li>
      <li><code>--st-component-field-errorText</code></li>
      <li><code>--st-component-field-maxWidth</code></li>
      <li><code>--st-component-control-border</code></li>
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
      <li><code>--st-component-control-radius</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-control-mdHeight</code></li>
      <li><code>--st-component-popover-background</code></li>
      <li><code>--st-component-popover-border</code></li>
      <li><code>--st-component-popover-shadow</code></li>
      <li><code>--st-component-popover-zIndex</code></li>
      <li><code>--st-component-dropdown-selectedBackground</code></li>
      <li><code>--st-component-dropdown-optionHoverBackground</code></li>
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-feedback-error</code></li>
      <li><code>--st-motion-fast</code></li>
      <li><code>--st-motion-easing</code></li>
    </ul>
  </section>
</div>
