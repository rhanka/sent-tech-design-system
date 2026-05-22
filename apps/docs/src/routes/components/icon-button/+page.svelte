<script lang="ts">
  import { Badge, IconButton } from "@sentropic/design-system-svelte";
  import { Copy, Pencil, RotateCcw, Trash2 } from "@lucide/svelte";
  import { t, type Locale } from "$lib/i18n";

  let locale = $state<Locale>("fr");
</script>

<div class="docs-page">
  <div class="docs-language" role="group" aria-label="Language">
    <button type="button" aria-pressed={locale === "fr"} onclick={() => (locale = "fr")}>FR</button>
    <button type="button" aria-pressed={locale === "en"} onclick={() => (locale = "en")}>EN</button>
  </div>

  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Action</p>
    <h1>
      {t(locale, "iconButtonTitle")}
      <Badge tone="success">{t(locale, "statusStable")}</Badge>
    </h1>
    <p>{t(locale, "iconButtonIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "examplesTitle")}</h2>
    <div class="docs-example" aria-label={t(locale, "variants")}>
      <IconButton aria-label="Copier">
        <Copy size={18} strokeWidth={2} aria-hidden="true" />
      </IconButton>
      <IconButton variant="secondary" aria-label="Modifier">
        <Pencil size={18} strokeWidth={2} aria-hidden="true" />
      </IconButton>
      <IconButton variant="ghost" aria-label="Rejouer">
        <RotateCcw size={18} strokeWidth={2} aria-hidden="true" />
      </IconButton>
      <IconButton variant="danger" aria-label="Supprimer">
        <Trash2 size={18} strokeWidth={2} aria-hidden="true" />
      </IconButton>
    </div>
    <div class="docs-example" aria-label={t(locale, "sizes")}>
      <IconButton size="sm" aria-label="Copier (petit)">
        <Copy size={16} strokeWidth={2} aria-hidden="true" />
      </IconButton>
      <IconButton size="md" aria-label="Copier (moyen)">
        <Copy size={18} strokeWidth={2} aria-hidden="true" />
      </IconButton>
      <IconButton size="lg" aria-label="Copier (grand)">
        <Copy size={20} strokeWidth={2} aria-hidden="true" />
      </IconButton>
    </div>
    <div class="docs-example" aria-label={t(locale, "states")}>
      <IconButton aria-label="Désactivé" disabled>
        <Copy size={18} strokeWidth={2} aria-hidden="true" />
      </IconButton>
      <IconButton variant="secondary" aria-label="Modifier désactivé" disabled>
        <Pencil size={18} strokeWidth={2} aria-hidden="true" />
      </IconButton>
      <IconButton variant="danger" aria-label="Supprimer désactivé" disabled>
        <Trash2 size={18} strokeWidth={2} aria-hidden="true" />
      </IconButton>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>aria-label</code></td><td><code>string</code></td><td><em>required</em></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>variant</code></td><td><code>"ghost" | "secondary" | "danger"</code></td><td><code>"ghost"</code></td></tr>
        <tr><td><code>type</code></td><td><code>"button" | "submit" | "reset"</code></td><td><code>"button"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>title</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-iconButton-radius</code></li>
      <li><code>--st-component-iconButton-smSize</code></li>
      <li><code>--st-component-iconButton-mdSize</code></li>
      <li><code>--st-component-iconButton-lgSize</code></li>
      <li><code>--st-component-iconButton-hoverBackground</code></li>
      <li><code>--st-component-iconButton-focusRing</code></li>
    </ul>
  </section>
</div>
