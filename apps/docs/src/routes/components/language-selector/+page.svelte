<script lang="ts">
  import { Badge, LanguageSelector } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

  let lang = $state("fr");
  const options = [
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
    { value: "es", label: "Español" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Navigation · i18n</p>
    <div class="docs-hero-title">
      <h1>LanguageSelector</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Sélecteur de langue compact : affiche la langue courante et ouvre un menu
      (<code>listbox</code>) des langues disponibles. État <code>value</code> bindable,
      fermeture au clic extérieur / <kbd>Échap</kbd>.
    </p>
  </section>
  <FrameworkPreview example="languageselector" title="Aperçu live" />

  <section class="docs-section">
    <h2>Démo</h2>
    <p class="docs-demo-context">Langue courante : <strong>{lang}</strong></p>
    <LanguageSelector bind:value={lang} {options} />
  </section>
  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Par défaut</th></tr>
      </thead>
      <tbody>
        <tr><td><code>value</code></td><td><code>string</code> (bindable)</td><td><code>""</code></td></tr>
        <tr><td><code>options</code></td><td><code>{`{ value: string; label: string }[]`}</code></td><td>requis</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Choisir la langue"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>onchange</code></td><td><code>(value: string) =&gt; void</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>
  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>

</div>
