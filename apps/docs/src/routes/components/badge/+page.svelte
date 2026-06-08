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
    { comp: "Badge", children: ["Neutral"] },
    { comp: "Badge", props: { tone: "success" }, children: ["Success"] },
    { comp: "Badge", props: { tone: "warning" }, children: ["Warning"] },
    { comp: "Badge", props: { tone: "error" }, children: ["Error"] },
    { comp: "Badge", props: { tone: "info" }, children: ["Info"] }
  ];
  const contextDemo: NodeSpec[] = $derived([
    { el: "span", children: [locale.value === "fr" ? "Export terminé : " : "Export finished : "] },
    { comp: "Badge", props: { tone: "success" }, children: ["Completed"] },
    { el: "span", children: ["•"] },
    { el: "span", children: [locale.value === "fr" ? "Validation requise : " : "Requires validation : "] },
    { comp: "Badge", props: { tone: "warning" }, children: ["Pending"] }
  ]);

  const copy = {
    fr: {
      intro: "Puce compacte pour les labels de statut, de catégorie ou d’état produit.",
      usageTitle: "Notes d’usage",
      usageTone: "La tonalité couvre une intention visuelle (neutral, success, warning, error, info), pas une hiérarchie métier.",
      usageSpread:
        "Le composant ne gère ni état actif, ni suppression. Pour une interaction, utilisez Tag ou un contrôle dédié.",
      usageA11y:
        "Le composant rend un <span>; utilisez `aria-label` si le texte est masqué par contexte visuel."
    },
    en: {
      intro: "Compact chip for status, category, or product state labels.",
      usageTitle: "Usage notes",
      usageTone: "Tone maps semantic meaning only (neutral, success, warning, error, info), not business flow state.",
      usageSpread:
        "The component does not handle active actions or dismiss behavior. Use Tag or a dedicated control for that.",
      usageA11y:
        "The component renders as a <span>; use `aria-label` when the visual label is not visible in context."
    }
  } as const;

  const text = () => copy[locale.value];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Données" : "Component · Data"}
    </p>
    <div class="docs-hero-title">
      <h1>Badge</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>

  <FrameworkPreview example="badge" title="Aperçu live" />

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Quand l'utiliser" : "When to use"}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{locale.value === "fr" ? "Étiqueter un statut, une catégorie ou un état (ex. « Stable », « Pending »)." : "Label a status, category, or state (e.g. \"Stable\", \"Pending\")."}</li>
      <li>{locale.value === "fr" ? "Badge est non interactif. Pour un chip fermable ou cliquable, utilisez Tag." : "Badge is non-interactive. For a dismissible or clickable chip, use Tag."}</li>
      <li>{locale.value === "fr" ? "Choisissez la tonalité selon le sens, pas une hiérarchie métier." : "Choose tone by meaning, not by business hierarchy."}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <FrameworkDemo nodes={tonesDemo} label={locale.value === "fr" ? "Tonalités" : "Tones"} />

    <FrameworkDemo
      nodes={contextDemo}
      label={locale.value === "fr" ? "Usage en contexte" : "In-context usage"}
    />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>tone</code></td><td><code>"neutral" | "success" | "warning" | "error" | "info"</code></td><td><code>"neutral"</code></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>contenu</em></td></tr>
        <tr><td><code>...props</code></td><td><code>HTMLAttributes&lt;HTMLSpanElement&gt;</code></td><td><em>transmis</em></td></tr>
      </tbody>
    </table>
    <p>
      Le composant rend un <code>&lt;span&gt;</code> en mode inline avec classes
      d’état pré-définies. Il ne fournit ni interaction ni logique métier :
      utilisez-le comme label visuel.
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Accessibilité" : "Accessibility"}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{locale.value === "fr" ? "Le composant rend un <span> inline : le texte est lu tel quel." : "The component renders an inline <span>: the text is read as-is."}</li>
      <li>{locale.value === "fr" ? "La couleur n'est jamais le seul indice : le libellé porte le sens." : "Color is never the only cue: the label carries the meaning."}</li>
      <li>{locale.value === "fr" ? "Si le badge est purement décoratif à côté d'un texte explicite, ajoutez aria-hidden." : "If the badge is purely decorative next to explicit text, add aria-hidden."}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{locale.value === "fr" ? "À faire" : "Do"}</p>
        <ul>
          <li>{locale.value === "fr" ? "Un libellé court, un ou deux mots." : "A short label, one or two words."}</li>
          <li>{locale.value === "fr" ? "Une tonalité cohérente entre badges de même nature." : "A consistent tone across badges of the same kind."}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{locale.value === "fr" ? "À éviter" : "Don't"}</p>
        <ul>
          <li>{locale.value === "fr" ? "Y câbler une action : utilisez Tag ou un bouton." : "Wire an action onto it: use Tag or a button."}</li>
          <li>{locale.value === "fr" ? "Des phrases entières dans un badge." : "Full sentences inside a badge."}</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-feedback-success</code></li>
      <li><code>--st-semantic-feedback-warning</code></li>
      <li><code>--st-semantic-feedback-error</code></li>
      <li><code>--st-semantic-feedback-info</code></li>
      <li><code>--st-radius-pill</code></li>
    </ul>
  </section>
</div>
