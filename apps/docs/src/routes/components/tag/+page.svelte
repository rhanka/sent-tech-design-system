<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc Aperçu live).
  const tonesDemo: NodeSpec[] = [
    { comp: "Tag", props: { tone: "neutral" }, children: ["Neutral"] },
    { comp: "Tag", props: { tone: "success" }, children: ["Success"] },
    { comp: "Tag", props: { tone: "warning" }, children: ["Warning"] },
    { comp: "Tag", props: { tone: "error" }, children: ["Error"] },
    { comp: "Tag", props: { tone: "info" }, children: ["Info"] }
  ];
  const sizesDemo: NodeSpec[] = [
    { comp: "Tag", props: { tone: "info", size: "sm" }, children: ["Small"] },
    { comp: "Tag", props: { tone: "info", size: "md" }, children: ["Medium"] }
  ];
  // Version statique de la démo interactive (tags fermables) : on montre les
  // trois tags fermables côte à côte plutôt qu'un retrait live piloté par état.
  const dismissibleDemo: NodeSpec[] = $derived([
    { comp: "Tag", props: { tone: "success", dismissible: true, dismissLabel: locale.value === "fr" ? "Retirer alpha" : "Remove alpha" }, children: ["alpha"] },
    { comp: "Tag", props: { tone: "success", dismissible: true, dismissLabel: locale.value === "fr" ? "Retirer beta" : "Remove beta" }, children: ["beta"] },
    { comp: "Tag", props: { tone: "success", dismissible: true, dismissLabel: locale.value === "fr" ? "Retirer gamma" : "Remove gamma" }, children: ["gamma"] }
  ]);
  const disabledDemo: NodeSpec[] = [
    { comp: "Tag", props: { tone: "warning", dismissible: true, disabled: true }, children: ["Read-only"] },
    { comp: "Tag", props: { tone: "error", disabled: true }, children: ["Archived"] }
  ];
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

  <FrameworkPreview example="tag" title="Aperçu live" />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <FrameworkDemo nodes={tonesDemo} label={locale.value === "fr" ? "Tonalités" : "Tones"} />
    <p class="docs-example__caption">
      {locale.value === "fr"
        ? "Cinq tonalités sémantiques alignées sur les feedback tokens."
        : "Five semantic tones aligned with feedback tokens."}
    </p>

    <FrameworkDemo nodes={sizesDemo} label={locale.value === "fr" ? "Tailles" : "Sizes"} />
    <p class="docs-example__caption">
      {locale.value === "fr"
        ? "Tailles sm (0.6875rem) et md (0.75rem)."
        : "Sizes sm (0.6875rem) and md (0.75rem)."}
    </p>

    <FrameworkDemo
      nodes={dismissibleDemo}
      label={locale.value === "fr" ? "Tags fermables" : "Dismissible tags"}
    />
    <p class="docs-example__caption">
      {locale.value === "fr"
        ? "Les tags fermables exposent un bouton de retrait (icône X) qui déclenche onDismiss. Câblez la suppression dans l’état de votre application."
        : "Dismissible tags expose a remove button (X icon) that fires onDismiss. Wire the removal into your application state."}
    </p>

    <FrameworkDemo
      nodes={disabledDemo}
      label={locale.value === "fr" ? "État désactivé" : "Disabled state"}
    />
    <p class="docs-example__caption">
      {locale.value === "fr"
        ? "L’option dismissible reste rendue mais le bouton est inactif."
        : "The dismissible affordance is rendered but the button is inert."}
    </p>
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
  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>

</div>
