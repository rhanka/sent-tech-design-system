<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // Rangées dans une SelectableList : la sélection thémée (surface teintée +
  // texte accentué, contraste ~8,8:1) est pilotée par la liste. Parité stricte
  // des 3 moteurs (leading/trailing slot-only en Vue : montrés dans le code).
  const selectedDemo = $derived<NodeSpec[]>([
    {
      comp: "SelectableList",
      props: { label: fr ? "Environnement" : "Environment", value: "staging" },
      children: [
        { comp: "SelectableRow", props: { value: "prod" }, children: ["Production"] },
        { comp: "SelectableRow", props: { value: "staging" }, children: ["Staging"] },
        { comp: "SelectableRow", props: { value: "dev" }, children: [fr ? "Développement" : "Development"] }
      ]
    }
  ]);

  const accentBarDemo = $derived<NodeSpec[]>([
    {
      comp: "SelectableList",
      props: { label: fr ? "Branche déployée" : "Deployed branch", value: "main" },
      children: [
        { comp: "SelectableRow", props: { value: "main", accentBar: true }, children: ["main"] },
        { comp: "SelectableRow", props: { value: "next", accentBar: true }, children: ["next"] },
        { comp: "SelectableRow", props: { value: "edge", accentBar: true }, children: ["edge"] }
      ]
    }
  ]);

  const disabledDemo = $derived<NodeSpec[]>([
    {
      comp: "SelectableList",
      props: { label: fr ? "Offres" : "Plans", value: "pro" },
      children: [
        { comp: "SelectableRow", props: { value: "starter" }, children: ["Starter"] },
        { comp: "SelectableRow", props: { value: "pro" }, children: ["Pro"] },
        { comp: "SelectableRow", props: { value: "enterprise", disabled: true }, children: [fr ? "Entreprise (nous contacter)" : "Enterprise (contact us)"] }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Formulaires" : "Component · Forms"}</p>
    <div class="docs-hero-title">
      <h1>SelectableRow</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Rangée sélectionnable pleine largeur. L'état sélectionné est thémé par deux signaux calmes, surface teintée et texte accentué (contraste ~8,8:1), au lieu d'une boîte hors-thème. La barre d'accent gauche est optionnelle. role=\"option\" + aria-selected, activable au clavier (Entrée / Espace). Dans une SelectableList, la liste pilote la sélection et le roving tabindex."
        : "Full-width selectable row. The selected state is themed with two calm signals, a tinted surface and accented text (~8.8:1 contrast), instead of an off-theme box. The left accent bar is opt-in. role=\"option\" + aria-selected, keyboard-activatable (Enter / Space). Inside a SelectableList, the list owns selection and the roving tabindex."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={selectedDemo} title={fr ? "État sélectionné (thémé)" : "Selected state (themed)"} />
    <TabbedExample nodes={accentBarDemo} title="accentBar" />
    <TabbedExample nodes={disabledDemo} title="disabled" />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>selected</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>onselect</code> / <code>onSelect</code></td><td><code>(selected: boolean) =&gt; void</code></td><td><em>–</em></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>value</code></td><td><code>string</code></td><td><em>–</em></td></tr>
        <tr><td><code>accentBar</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>role</code></td><td><code>string</code></td><td><code>"button"</code></td></tr>
        <tr><td><code>leading</code> / <code>trailing</code></td><td><code>{fr ? "slot / nœud" : "slot / node"}</code></td><td><em>–</em></td></tr>
      </tbody>
    </table>
    <p>{fr
      ? "Utilisée seule (standalone), la rangée gère son propre état selected et émet onselect à chaque bascule. Dans une SelectableList, ces props sont ignorées : la liste est la source de vérité. L'état sélectionné atteint un contraste texte ~8,8:1. leading/trailing sont des slots en Svelte/Vue, des nœuds en React."
      : "Used standalone, the row owns its selected state and emits onselect on each toggle. Inside a SelectableList these props are ignored: the list is the source of truth. The selected state reaches ~8.8:1 text contrast. leading/trailing are slots in Svelte/Vue, nodes in React."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-surface-selected</code></li>
      <li><code>--st-semantic-text-accent</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
    </ul>
  </section>
</div>
