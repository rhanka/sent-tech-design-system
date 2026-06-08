<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const copy = {
    fr: {
      intro:
        "Champ nombre avec boutons incrément/décrément, min/max, pas de pas, états d’erreur et liaison bidirectionnelle.",
      usageTitle: "Notes d’usage",
      usageNote1:
        "Le bouton `+`/`-` déclenche le clamp interne (bornes respectées) ; l’édition manuelle garde la saisie native du navigateur.",
      usageNote2:
        "`value` est bindable (`number | null`) et peut rester `null` quand le champ est vidé."
    },
    en: {
      intro:
        "Numeric input with increment/decrement buttons, bounds, step size, validation states, and two-way binding.",
      usageTitle: "Usage notes",
      usageNote1:
        "The `+`/`-` controls clamp values to `min` and `max`; manual typing follows native number input behavior.",
      usageNote2:
        "`value` is bindable as (`number | null`) and stays `null` when the field is cleared."
    }
  } as const;

  const text = () => copy[locale.value];

  // Démos en arbre NodeSpec neutre -> rendues dans le framework actif.
  // État statique : la valeur initiale est figée. Les noms de prop diffèrent par
  // moteur (Svelte `value`, React `defaultValue`, Vue `modelValue`) : on les passe
  // tous pour afficher la même valeur partout sans binding live (note en prose).
  const sizesDemo: NodeSpec[] = $derived([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        {
          comp: "NumberInput",
          props: {
            size: "sm",
            label: locale.value === "fr" ? "Taille sm" : "Small",
            value: 8,
            defaultValue: 8,
            modelValue: 8,
            placeholder: locale.value === "fr" ? "Valeur sm" : "Small value"
          }
        },
        {
          comp: "NumberInput",
          props: {
            size: "md",
            label: locale.value === "fr" ? "Taille md" : "Medium",
            value: 16,
            defaultValue: 16,
            modelValue: 16,
            placeholder: locale.value === "fr" ? "Valeur md" : "Medium value"
          }
        },
        {
          comp: "NumberInput",
          props: {
            size: "lg",
            label: locale.value === "fr" ? "Taille lg" : "Large",
            value: 128,
            defaultValue: 128,
            modelValue: 128,
            placeholder: locale.value === "fr" ? "Valeur lg" : "Large value"
          }
        }
      ]
    }
  ]);

  const validationDemo: NodeSpec[] = $derived([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        {
          comp: "NumberInput",
          props: {
            label: locale.value === "fr" ? "Bornes + pas" : "Bounds + step",
            value: 42,
            defaultValue: 42,
            modelValue: 42,
            min: 0,
            max: 100,
            step: 10,
            helperText: locale.value === "fr" ? "min 0, max 100, pas 10" : "min 0, max 100, step 10"
          }
        },
        {
          comp: "NumberInput",
          props: {
            label: locale.value === "fr" ? "Erreur" : "Error",
            min: 1,
            max: 10,
            step: 1,
            placeholder: locale.value === "fr" ? "Doit être entre 1 et 10" : "Must be between 1 and 10",
            invalid: true,
            errorText: locale.value === "fr" ? "La valeur est hors plage." : "Value is out of range."
          }
        },
        {
          comp: "NumberInput",
          props: {
            label: locale.value === "fr" ? "Désactivé" : "Disabled",
            value: 10,
            defaultValue: 10,
            modelValue: 10,
            disabled: true
          }
        }
      ]
    }
  ]);

  const customDemo: NodeSpec[] = $derived([
    {
      comp: "NumberInput",
      props: {
        label: locale.value === "fr" ? "Étiquettes personnalisées" : "Custom button labels",
        min: 0,
        max: 9,
        incrementLabel: locale.value === "fr" ? "Augmenter" : "Increase",
        decrementLabel: locale.value === "fr" ? "Diminuer" : "Decrease"
      }
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaire</p>
    <div class="docs-hero-title">
      <h1>NumberInput</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <FrameworkPreview example="numberinput" title="Aperçu live" />


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <FrameworkDemo nodes={sizesDemo} label={t(locale.value, "sizes")} />

    <FrameworkDemo nodes={validationDemo} label={t(locale.value, "validation")} />

    <FrameworkDemo nodes={customDemo} label={locale.value === "fr" ? "Boutons custom" : "Custom buttons"} />
    <p class="docs-demo-note">
      {locale.value === "fr" ? "Valeur courante" : "Current value"} :
      <code>null</code>
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>value</code></td><td><code>number | null</code> (<code>$bindable</code>)</td><td><code>null</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>errorText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>min</code></td><td><code>number</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>max</code></td><td><code>number</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>step</code></td><td><code>number</code></td><td><code>1</code></td></tr>
        <tr><td><code>incrementLabel</code></td><td><code>string</code></td><td><code>"Increment value"</code></td></tr>
        <tr><td><code>decrementLabel</code></td><td><code>string</code></td><td><code>"Decrement value"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote1}</p>
    <p class="docs-demo-note">{text().usageNote2}</p>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "La valeur est rendue via un `<input type=\"number\">`; vous pouvez remapper `oninput` / `onchange` sur le composant grâce au spread des props HTML natives."
        : "Value is rendered with `<input type=\"number\">`; you can still map native `oninput` / `onchange` through prop spreading."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-control-background</code></li>
      <li><code>--st-component-control-border</code></li>
      <li><code>--st-component-control-text</code></li>
      <li><code>--st-component-control-radius</code></li>
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-control-invalidBorder</code></li>
      <li><code>--st-component-control-disabledText</code></li>
      <li><code>--st-component-control-smHeight</code></li>
      <li><code>--st-component-control-mdHeight</code></li>
      <li><code>--st-component-control-lgHeight</code></li>
      <li><code>--st-component-field-labelText</code></li>
      <li><code>--st-component-field-gap</code></li>
      <li><code>--st-component-field-helpText</code></li>
      <li><code>--st-component-field-errorText</code></li>
      <li><code>--st-component-field-maxWidth</code></li>
      <li><code>--st-semantic-text-muted</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-border-strong</code></li>
      <li><code>--st-motion-fast</code></li>
      <li><code>--st-motion-easing</code></li>
      <li><code>--st-semantic-feedback-error</code></li>
    </ul>
  </section>
</div>
