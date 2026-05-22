<script lang="ts">
  import { Badge, MenuTriggerButton } from "@sentropic/design-system-svelte";
  import { Ellipsis, MoreHorizontal, Settings } from "@lucide/svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  let expandedDefault = $state(false);
  let expandedSecondary = $state(false);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Navigation</p>
    <h1>
      {t(locale.value, "menuTriggerButtonTitle")}
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{t(locale.value, "menuTriggerButtonIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <div class="docs-example" aria-label="Default chevron icon">
      <MenuTriggerButton
        aria-label="Ouvrir le menu"
        expanded={expandedDefault}
        onclick={() => (expandedDefault = !expandedDefault)}
      />
    </div>
    <div class="docs-example" aria-label="Custom icon">
      <MenuTriggerButton aria-label="Plus d'options">
        <Ellipsis size={18} strokeWidth={2} aria-hidden="true" />
      </MenuTriggerButton>
      <MenuTriggerButton aria-label="Autres actions">
        <MoreHorizontal size={18} strokeWidth={2} aria-hidden="true" />
      </MenuTriggerButton>
      <MenuTriggerButton aria-label="Paramètres" variant="secondary">
        <Settings size={18} strokeWidth={2} aria-hidden="true" />
      </MenuTriggerButton>
    </div>
    <div class="docs-example" aria-label={t(locale.value, "sizes")}>
      <MenuTriggerButton aria-label="Petit" size="sm" />
      <MenuTriggerButton aria-label="Moyen" size="md" />
      <MenuTriggerButton aria-label="Grand" size="lg" />
    </div>
    <div class="docs-example" aria-label={t(locale.value, "states")}>
      <MenuTriggerButton
        aria-label="Ouvert"
        expanded={expandedSecondary}
        variant="secondary"
        onclick={() => (expandedSecondary = !expandedSecondary)}
      />
      <MenuTriggerButton aria-label="Désactivé" disabled />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>aria-label</code></td><td><code>string</code></td><td><em>required</em></td></tr>
        <tr><td><code>expanded</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>aria-controls</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>variant</code></td><td><code>"ghost" | "secondary"</code></td><td><code>"ghost"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
      </tbody>
    </table>
    <p>
      Le composant câble automatiquement <code>aria-haspopup="menu"</code> et
      <code>aria-expanded</code>. Passe une icône Lucide en enfant pour remplacer le chevron par défaut.
    </p>
  </section>
</div>
