<script lang="ts">
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc « Aperçu live »). État
  // statique : pas de liaison bidirectionnelle live (note conservée en prose).
  // Le nom de prop de valeur diffère par moteur : Svelte/React `value`, Vue
  // `modelValue`. On passe les deux pour figer le même état initial (props
  // inconnues ignorées).
  const sizesDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "PasswordInput", props: { size: "sm", placeholder: "Mot de passe (sm)" } },
        { comp: "PasswordInput", props: { size: "md", placeholder: "Mot de passe (md)" } },
        { comp: "PasswordInput", props: { size: "lg", placeholder: "Mot de passe (lg)" } }
      ]
    }
  ];

  const validationDemo: NodeSpec[] = [
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        {
          comp: "PasswordInput",
          props: {
            label: "Mot de passe",
            placeholder: "Au moins 8 caractères",
            helperText: "Mélangez majuscules, minuscules et chiffres."
          }
        },
        {
          comp: "PasswordInput",
          props: {
            label: "Mot de passe",
            placeholder: "Mot de passe",
            errorText: "Le mot de passe est trop court.",
            invalid: true
          }
        }
      ]
    }
  ];

  const statesDemo: NodeSpec[] = [
    { comp: "PasswordInput", props: { placeholder: "Champ désactivé", disabled: true } }
  ];

  const bindingDemo: NodeSpec[] = [
    {
      comp: "PasswordInput",
      props: { placeholder: "Tapez votre mot de passe", value: "secret42", modelValue: "secret42" }
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaire</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "passwordInputTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "passwordInputIntro")}</p>
  </section>
  <FrameworkPreview example="passwordinput" title="Aperçu live" />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <FrameworkDemo nodes={sizesDemo} label={t(locale.value, "sizes")} />
    <FrameworkDemo nodes={validationDemo} label={t(locale.value, "validation")} />
    <FrameworkDemo nodes={statesDemo} label={t(locale.value, "states")} />
    <FrameworkDemo nodes={bindingDemo} label="Liaison bidirectionnelle" />
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "La valeur est bindable (value en Svelte/React, modelValue en Vue) ; figée ici pour la démonstration. Le bouton œil bascule la visibilité."
        : "The value is bindable (value in Svelte/React, modelValue in Vue); frozen here for the demo. The eye button toggles visibility."}
    </p>
  </section>
  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>value</code></td><td><code>string</code> (<code>$bindable</code>)</td><td><code>""</code></td></tr>
        <tr><td><code>visible</code></td><td><code>boolean</code> (<code>$bindable</code>)</td><td><code>false</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>errorText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>showLabel</code></td><td><code>string</code></td><td><code>"Show password"</code></td></tr>
        <tr><td><code>hideLabel</code></td><td><code>string</code></td><td><code>"Hide password"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
      </tbody>
    </table>
    <p>
      Le composant rend un <code>&lt;input type="password"&gt;</code> qui bascule vers
      <code>type="text"</code> quand <code>visible</code> passe à <code>true</code>. L'icône
      Lucide <code>Eye</code> (mot de passe masqué) ou <code>EyeOff</code> (mot de passe
      révélé) est rendue dans un bouton accessible : <code>aria-pressed</code> reflète
      l'état courant et <code>aria-label</code> bascule entre <code>showLabel</code> et
      <code>hideLabel</code>. <code>autocomplete="current-password"</code> est appliqué
      par défaut. La visibilité expose elle aussi <code>$bindable</code> pour piloter le
      toggle depuis le parent si nécessaire.
    </p>
  </section>
  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>

</div>
