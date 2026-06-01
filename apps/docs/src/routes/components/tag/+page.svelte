<script lang="ts">
  import { Badge, Tag } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  let tags = $state(["alpha", "beta", "gamma"]);

  function removeTag(value: string) {
    tags = tags.filter((tag) => tag !== value);
  }

  function resetTags() {
    tags = ["alpha", "beta", "gamma"];
  }
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Données</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "tagTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "tagIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div
      class="docs-example"
      aria-label={locale.value === "fr" ? "Tonalités" : "Tones"}
    >
      <div class="docs-example__row">
        <Tag tone="neutral">Neutral</Tag>
        <Tag tone="success">Success</Tag>
        <Tag tone="warning">Warning</Tag>
        <Tag tone="error">Error</Tag>
        <Tag tone="info">Info</Tag>
      </div>
      <p class="docs-example__caption">
        {locale.value === "fr"
          ? "Cinq tonalités sémantiques alignées sur les feedback tokens."
          : "Five semantic tones aligned with feedback tokens."}
      </p>
    </div>

    <div
      class="docs-example"
      aria-label={locale.value === "fr" ? "Tailles" : "Sizes"}
    >
      <div class="docs-example__row">
        <Tag tone="info" size="sm">Small</Tag>
        <Tag tone="info" size="md">Medium</Tag>
      </div>
      <p class="docs-example__caption">
        {locale.value === "fr"
          ? "Tailles sm (0.6875rem) et md (0.75rem)."
          : "Sizes sm (0.6875rem) and md (0.75rem)."}
      </p>
    </div>

    <div
      class="docs-example"
      aria-label={locale.value === "fr" ? "Tags fermables" : "Dismissible tags"}
    >
      <div class="docs-example__row">
        {#each tags as label (label)}
          <Tag
            tone="success"
            dismissible
            dismissLabel={locale.value === "fr" ? `Retirer ${label}` : `Remove ${label}`}
            onDismiss={() => removeTag(label)}
          >
            {label}
          </Tag>
        {/each}
        {#if tags.length === 0}
          <span class="docs-example__empty">
            {locale.value === "fr" ? "Aucun tag restant." : "No tags left."}
          </span>
        {/if}
      </div>
      <p class="docs-example__caption">
        <button type="button" class="docs-example__reset" onclick={resetTags}>
          {locale.value === "fr" ? "Réinitialiser" : "Reset"}
        </button>
        · {locale.value === "fr" ? "Tags restants" : "Remaining tags"} :
        <code>{tags.length}</code>
      </p>
    </div>

    <div
      class="docs-example"
      aria-label={locale.value === "fr" ? "État désactivé" : "Disabled state"}
    >
      <div class="docs-example__row">
        <Tag tone="warning" dismissible disabled>Read-only</Tag>
        <Tag tone="error" disabled>Archived</Tag>
      </div>
      <p class="docs-example__caption">
        {locale.value === "fr"
          ? "L’option dismissible reste rendue mais le bouton est inactif."
          : "The dismissible affordance is rendered but the button is inert."}
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
        <tr><td><code>tone</code></td><td><code>"neutral" | "success" | "warning" | "error" | "info"</code></td><td><code>"neutral"</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>dismissible</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>dismissLabel</code></td><td><code>string</code></td><td><code>"Dismiss"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>onDismiss</code></td><td><code>(event: MouseEvent) =&gt; void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>contenu du tag</em></td></tr>
      </tbody>
    </table>
    <p>
      Le composant rend un <code>&lt;span class="st-tag"&gt;</code> contenant un
      libellé enfant. Quand <code>dismissible</code> est <code>true</code>, un
      <code>&lt;button type="button"&gt;</code> est rendu avec l’icône Lucide
      <code>X</code> (<code>size=14</code>, <code>strokeWidth=2</code>) et déclenche
      <code>onDismiss</code>. La prop <code>dismissLabel</code> alimente l’attribut
      <code>aria-label</code> du bouton et doit décrire l’action explicitement. Quand
      <code>disabled</code> est <code>true</code>, le span reçoit
      <code>aria-disabled="true"</code> et le bouton dismiss est inactif. Les autres
      attributs HTML <code>&lt;span&gt;</code> sont transmis via spread.
    </p>
  </section>
</div>

<style>
  .docs-example__row {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .docs-example__empty {
    color: var(--st-semantic-text-muted);
    font-size: 0.875rem;
  }

  .docs-example__reset {
    background: transparent;
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-sm, 0.25rem);
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    font: inherit;
    font-size: 0.8125rem;
    padding: 0.125rem 0.5rem;
  }

  .docs-example__reset:hover {
    background: var(--st-semantic-surface-subtle);
  }
</style>
