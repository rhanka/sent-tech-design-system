<script lang="ts">
  import { Badge, Checkbox, FormGroup, Input, Radio } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

  const copy = {
    fr: {
      intro:
        "Regroupe des champs liés dans un `<fieldset>` accessible, avec une légende optionnelle, un texte d’aide et un état désactivé propagé à tous les contrôles enfants.",
      addressTitle: "Groupe de champs avec légende et aide",
      consentTitle: "Groupe de cases à cocher",
      disabledTitle: "Groupe désactivé",
      usageTitle: "Notes d’usage",
      usageNote1:
        "`disabled` est appliqué directement sur le `<fieldset>`, ce qui désactive nativement tous les champs internes sans logique supplémentaire.",
      usageNote2:
        "`legend` rend un `<legend>` et `helperText` un paragraphe d’aide ; les deux sont optionnels et omis si non fournis.",
      legendAddress: "Adresse de livraison",
      helperAddress: "Utilisée uniquement pour l’expédition.",
      streetLabel: "Rue",
      cityLabel: "Ville",
      legendConsent: "Préférences de contact",
      helperConsent: "Vous pouvez modifier ces choix à tout moment.",
      consentEmail: "Recevoir les courriels produit",
      consentSms: "Recevoir les SMS",
      legendLocked: "Plan (verrouillé)",
      helperLocked: "Contactez le support pour changer de plan.",
      planA: "Plan Équipe",
      planB: "Plan Entreprise"
    },
    en: {
      intro:
        "Groups related fields inside an accessible `<fieldset>`, with an optional legend, helper text and a disabled state propagated to every child control.",
      addressTitle: "Field group with legend and helper",
      consentTitle: "Checkbox group",
      disabledTitle: "Disabled group",
      usageTitle: "Usage notes",
      usageNote1:
        "`disabled` is applied directly on the `<fieldset>`, which natively disables every nested field with no extra logic.",
      usageNote2:
        "`legend` renders a `<legend>` and `helperText` a helper paragraph; both are optional and omitted when not provided.",
      legendAddress: "Shipping address",
      helperAddress: "Used for shipping only.",
      streetLabel: "Street",
      cityLabel: "City",
      legendConsent: "Contact preferences",
      helperConsent: "You can change these choices anytime.",
      consentEmail: "Receive product emails",
      consentSms: "Receive SMS",
      legendLocked: "Plan (locked)",
      helperLocked: "Contact support to change plan.",
      planA: "Team plan",
      planB: "Enterprise plan"
    }
  } as const;

  const text = () => copy[locale.value];

  let street = $state("");
  let city = $state("");
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaire</p>
    <div class="docs-hero-title">
      <h1>FormGroup</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <FrameworkPreview example="formgroup" title="Aperçu live" />


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example docs-demo-block" aria-label={text().addressTitle}>
      <h3>{text().addressTitle}</h3>
      <FormGroup legend={text().legendAddress} helperText={text().helperAddress}>
        <Input label={text().streetLabel} bind:value={street} name="street" />
        <Input label={text().cityLabel} bind:value={city} name="city" />
      </FormGroup>
    </div>

    <div class="docs-example docs-demo-block" aria-label={text().consentTitle}>
      <h3>{text().consentTitle}</h3>
      <FormGroup legend={text().legendConsent} helperText={text().helperConsent}>
        <Checkbox label={text().consentEmail} name="consent-email" checked />
        <Checkbox label={text().consentSms} name="consent-sms" />
      </FormGroup>
    </div>

    <div class="docs-example docs-demo-block" aria-label={text().disabledTitle}>
      <h3>{text().disabledTitle}</h3>
      <FormGroup legend={text().legendLocked} helperText={text().helperLocked} disabled>
        <Radio name="plan-locked" value="team" label={text().planA} checked />
        <Radio name="plan-locked" value="enterprise" label={text().planB} />
      </FormGroup>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>legend</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>requis</em></td></tr>
        <tr><td><code>...rest</code></td><td><code>HTMLFieldsetAttributes</code> (sauf <code>class</code>)</td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote1}</p>
    <p class="docs-demo-note">{text().usageNote2}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-formGroup-border</code></li>
      <li><code>--st-component-formGroup-radius</code></li>
      <li><code>--st-component-formGroup-padding</code></li>
      <li><code>--st-component-formGroup-gap</code></li>
      <li><code>--st-component-formGroup-fieldGap</code></li>
      <li><code>--st-component-formGroup-helpText</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
    </ul>
  </section>
</div>
