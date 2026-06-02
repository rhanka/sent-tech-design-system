<script lang="ts">
  import { Badge, Toggle } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      intro:
        "Bascule compacte en mode switch avec libellé d’état \"On/Off\" (ou labels personnalisés), dimensions sm/md et liaison contrôlée.",
      usageTitle: "Notes d’usage",
      usageNote1:
        "Le composant expose `role=\"switch\"` côté input HTML pour conserver le modèle d’accessibilité attendu."
    },
    en: {
      intro:
        "Compact toggle with a native `switch` role, optional on/off labels, sm/md sizing, and controlled binding.",
      usageTitle: "Usage notes",
      usageNote1:
        "The component exposes `role=\"switch\"` on the underlying input to keep the expected accessibility contract."
    }
  } as const;

  const text = () => copy[locale.value];

  let emailAlerts = $state(false);
  let compactMode = $state(true);
  let darkMode = $state(false);
  let archiveMode = $state(false);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Formulaire</p>
    <div class="docs-hero-title">
      <h1>Toggle</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example" aria-label={t(locale.value, "variants")}>
      <Toggle
        label={locale.value === "fr" ? "Notifications e-mail" : "Email notifications"}
        bind:checked={emailAlerts}
      />
      <Toggle
        label={locale.value === "fr" ? "Mode compact (sm)" : "Compact mode (sm)"}
        bind:checked={compactMode}
        size="sm"
      />
      <Toggle
        label={locale.value === "fr" ? "Mode compact désactivé" : "Compact mode disabled"}
        bind:checked={archiveMode}
        disabled
      />
      <p class="docs-demo-note">
        {locale.value === "fr" ? "Notifications" : "Notifications"} :
        <code>{emailAlerts ? (locale.value === "fr" ? "On" : "On") : (locale.value === "fr" ? "Off" : "Off")}</code>
        · {locale.value === "fr" ? "Mode compact" : "Compact mode"} :
        <code>{compactMode ? "On" : "Off"}</code>
      </p>
    </div>

    <div class="docs-example" aria-label={locale.value === "fr" ? "Libellés personnalisés" : "Custom labels"}>
      <Toggle
        label={locale.value === "fr" ? "Dark mode" : "Dark mode"}
        bind:checked={darkMode}
        labelOn={locale.value === "fr" ? "Activé" : "Enabled"}
        labelOff={locale.value === "fr" ? "Désactivé" : "Disabled"}
      />
      <p class="docs-demo-note">
        {locale.value === "fr" ? "État actuel" : "Current state"} :
        <code>{darkMode ? (locale.value === "fr" ? "Activé" : "Enabled") : (locale.value === "fr" ? "Désactivé" : "Disabled")}</code>
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
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>required</em></td></tr>
        <tr><td><code>labelOn</code></td><td><code>string</code></td><td><code>"On"</code></td></tr>
        <tr><td><code>labelOff</code></td><td><code>string</code></td><td><code>"Off"</code></td></tr>
        <tr><td><code>helperText</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>checked</code></td><td><code>boolean</code> (<code>$bindable</code>)</td><td><code>false</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote1}</p>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "Utiliser `checked` en binding si l’état doit être piloté par un store parent ; le composant n’émet pas d’événement métier dédié."
        : "Use `checked` as a bindable prop when parent state owns the toggle; there is no dedicated business event callback."}
    </p>
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "Pour des libellés d’état plus complexes, laissez un `helperText` dédié en dehors de la ligne principale."
        : "For richer contextual state text, prefer an external `helperText` or surrounding explanatory UI."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-field-labelText</code></li>
      <li><code>--st-component-field-helpText</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
      <li><code>--st-component-selection-switchTrack</code></li>
      <li><code>--st-component-selection-switchThumb</code></li>
      <li><code>--st-component-selection-switchTrackChecked</code></li>
      <li><code>--st-semantic-action-primary</code></li>
      <li><code>--st-semantic-border-interactive</code></li>
      <li><code>--st-semantic-border-strong</code></li>
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-toggle-trackWidth</code></li>
      <li><code>--st-toggle-trackHeight</code></li>
      <li><code>--st-toggle-thumbSize</code></li>
      <li><code>--st-motion-fast</code></li>
      <li><code>--st-motion-easing</code></li>
      <li><code>--st-radius-pill</code></li>
      <li><code>--st-component-control-hoverBorder</code></li>
    </ul>
  </section>
</div>
