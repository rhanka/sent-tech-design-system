<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // Démo sûre : `disabled` rend le contenu en place (aucune téléportation),
  // donc rien ne dépend de mesures DOM au prérendu.
  const inlineDemo: NodeSpec[] = [
    {
      comp: "Portal",
      props: { disabled: true },
      children: [
        {
          comp: "Badge",
          props: { tone: "info" },
          children: [fr ? "Rendu en place (disabled)" : "Rendered in place (disabled)"]
        }
      ]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Primitive · Autres" : "Primitive · Other"}</p>
    <div class="docs-hero-title">
      <h1>Portal</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Téléporte ses enfants ailleurs dans le DOM (par défaut le <body>), tout en gardant la logique au point d'appel. SSR-safe : rien n'est téléporté pendant le rendu serveur ni au premier rendu client. Avec disabled, le contenu est rendu en place, sans téléportation."
        : "Teleports its children elsewhere in the DOM (defaults to <body>) while keeping the logic at the call site. SSR-safe: nothing is portalled during the server render or first client render. With disabled, content renders in place, without teleportation."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={inlineDemo} title="disabled" />
    <p>
      {fr
        ? "L'aperçu utilise disabled : true pour un rendu en place, déterministe au prérendu. En usage réel, omettez disabled pour téléporter vers target (par défaut le <body>)."
        : "The preview uses disabled: true for a deterministic, in-place render at prerender time. In real usage, omit disabled to teleport into target (defaults to <body>)."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>target</code></td><td><code>string | HTMLElement</code></td><td><code>"body"</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>–</em></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet | ReactNode | slot</code></td><td><em>–</em></td></tr>
      </tbody>
    </table>
    <p>
      {fr
        ? "target accepte un sélecteur CSS ou un HTMLElement ; un sélecteur introuvable retombe sur le <body>. La résolution n'a lieu qu'après le montage côté client."
        : "target accepts a CSS selector or an HTMLElement; a missing selector falls back to <body>. Resolution only happens after the client mount."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <p>
      {fr
        ? "Portal est une primitive sans style : il n'applique aucun token et n'introduit qu'un conteneur neutre data-st-portal."
        : "Portal is an unstyled primitive: it applies no tokens and only introduces a neutral data-st-portal container."}
    </p>
  </section>
</div>
