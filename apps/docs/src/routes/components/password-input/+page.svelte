<script lang="ts">
  import { Badge, PasswordInput } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  let smValue = $state("");
  let mdValue = $state("");
  let lgValue = $state("");
  let placeholderValue = $state("");
  let disabledValue = $state("");
  let invalidValue = $state("");
  let value = $state("");
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

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <div class="docs-example" aria-label={t(locale.value, "sizes")}>
      <PasswordInput size="sm" bind:value={smValue} placeholder="Mot de passe (sm)" />
      <PasswordInput size="md" bind:value={mdValue} placeholder="Mot de passe (md)" />
      <PasswordInput size="lg" bind:value={lgValue} placeholder="Mot de passe (lg)" />
    </div>
    <div class="docs-example" aria-label={t(locale.value, "validation")}>
      <PasswordInput
        label="Mot de passe"
        bind:value={placeholderValue}
        placeholder="Au moins 8 caractères"
        helperText="Mélangez majuscules, minuscules et chiffres."
      />
      <PasswordInput
        label="Mot de passe"
        bind:value={invalidValue}
        placeholder="Mot de passe"
        errorText="Le mot de passe est trop court."
        invalid
      />
    </div>
    <div class="docs-example" aria-label={t(locale.value, "states")}>
      <PasswordInput
        bind:value={disabledValue}
        placeholder="Champ désactivé"
        disabled
      />
    </div>
    <div class="docs-example" aria-label="Liaison bidirectionnelle">
      <PasswordInput bind:value placeholder="Tapez votre mot de passe" />
      <p>
        Longueur courante :
        <code>{value.length}</code>
      </p>
    </div>
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
</div>
