<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc « Aperçu live »). État
  // statique : expanded/open est figé (pas de bascule live, note en prose).
  //
  // Le nom de l'état ouvert diffère par moteur : Svelte `expanded`, React/Vue
  // `open`. On passe les deux pour figer le même état (props inconnues
  // ignorées). Les icônes Lucide sont remplacées par un glyphe texte en
  // children (motif icon-button) : React/Vue ne rendent que les children, donc
  // un glyphe garantit la parité visuelle (Svelte n'affiche son chevron par
  // défaut que sans children).
  const defaultDemo: NodeSpec[] = [
    {
      comp: "MenuTriggerButton",
      props: { "aria-label": "Ouvrir le menu", expanded: false, open: false },
      children: ["⌄"]
    }
  ];

  const customIconDemo: NodeSpec[] = [
    { comp: "MenuTriggerButton", props: { "aria-label": "Plus d'options" }, children: ["⋯"] },
    { comp: "MenuTriggerButton", props: { "aria-label": "Autres actions" }, children: ["⋯"] },
    {
      comp: "MenuTriggerButton",
      props: { "aria-label": "Paramètres", variant: "secondary" },
      children: ["⚙"]
    }
  ];

  const sizesDemo: NodeSpec[] = [
    { comp: "MenuTriggerButton", props: { "aria-label": "Petit", size: "sm" }, children: ["⌄"] },
    { comp: "MenuTriggerButton", props: { "aria-label": "Moyen", size: "md" }, children: ["⌄"] },
    { comp: "MenuTriggerButton", props: { "aria-label": "Grand", size: "lg" }, children: ["⌄"] }
  ];

  const statesDemo: NodeSpec[] = [
    {
      comp: "MenuTriggerButton",
      props: { "aria-label": "Ouvert", expanded: true, open: true, variant: "secondary" },
      children: ["⌄"]
    },
    {
      comp: "MenuTriggerButton",
      props: { "aria-label": "Désactivé", disabled: true },
      children: ["⌄"]
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Navigation</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "menuTriggerButtonTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "menuTriggerButtonIntro")}</p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={defaultDemo} title="Default chevron icon" />
    <TabbedExample nodes={customIconDemo} title="Custom icon" />
    <TabbedExample nodes={sizesDemo} title={t(locale.value, "sizes")} />
    <TabbedExample nodes={statesDemo} title={t(locale.value, "states")} />
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "L'état ouvert (expanded en Svelte, open en React/Vue) est figé pour la démonstration. Passez une icône en enfant pour remplacer le chevron par défaut."
        : "The open state (expanded in Svelte, open in React/Vue) is frozen for the demo. Pass an icon child to replace the default chevron."}
    </p>
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
