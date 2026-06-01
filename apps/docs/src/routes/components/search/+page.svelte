<script lang="ts">
  import { Badge, Search } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  let smValue = $state("");
  let mdValue = $state("");
  let lgValue = $state("");
  let placeholderValue = $state("");
  let disabledValue = $state("");
  let value = $state("");
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaire</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "searchTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "searchIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <div class="docs-example" aria-label={t(locale.value, "sizes")}>
      <Search size="sm" bind:value={smValue} placeholder="Rechercher (sm)" />
      <Search size="md" bind:value={mdValue} placeholder="Rechercher (md)" />
      <Search size="lg" bind:value={lgValue} placeholder="Rechercher (lg)" />
    </div>
    <div class="docs-example" aria-label={t(locale.value, "states")}>
      <Search bind:value={placeholderValue} placeholder="Rechercher un composant…" />
      <Search bind:value={disabledValue} placeholder="Champ désactivé" disabled />
    </div>
    <div class="docs-example" aria-label="Liaison bidirectionnelle">
      <Search bind:value placeholder="Tapez puis effacez" />
      <p>
        Valeur courante :
        <code>{value === "" ? "(vide)" : value}</code>
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
        <tr><td><code>placeholder</code></td><td><code>string</code></td><td><code>"Search"</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>errorText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>invalid</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>clearLabel</code></td><td><code>string</code></td><td><code>"Clear search"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
      </tbody>
    </table>
    <p>
      Le composant rend un <code>&lt;input type="search"&gt;</code> natif (rôle <code>searchbox</code>
      implicite), accompagné d'une icône Lucide <code>Search</code> et d'un bouton clear (icône Lucide
      <code>X</code>) affiché dès que <code>value</code> n'est pas vide. La remise à zéro se fait via
      <code>bind:value</code> : le bouton clear assigne <code>value = ""</code>, ce qui propage la
      mise à jour au parent sans callback dédié.
    </p>
  </section>
</div>
