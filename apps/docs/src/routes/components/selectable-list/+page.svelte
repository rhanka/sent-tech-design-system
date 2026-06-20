<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const singleDemo = $derived<NodeSpec[]>([
    {
      comp: "SelectableList",
      props: { label: fr ? "Région" : "Region", value: "ca-qc" },
      children: [
        { comp: "SelectableRow", props: { value: "ca-qc" }, children: ["Canada, Québec"] },
        { comp: "SelectableRow", props: { value: "ca-on" }, children: ["Canada, Ontario"] },
        { comp: "SelectableRow", props: { value: "us-east" }, children: [fr ? "États-Unis, Est" : "United States, East"] },
        { comp: "SelectableRow", props: { value: "eu-west" }, children: [fr ? "Europe, Ouest" : "Europe, West"] }
      ]
    }
  ]);

  const multipleDemo = $derived<NodeSpec[]>([
    {
      comp: "SelectableList",
      props: { label: fr ? "Canaux" : "Channels", multiple: true, value: ["email", "chat"] },
      children: [
        { comp: "SelectableRow", props: { value: "email" }, children: [fr ? "Courriel" : "Email"] },
        { comp: "SelectableRow", props: { value: "chat" }, children: ["Chat"] },
        { comp: "SelectableRow", props: { value: "tickets" }, children: ["Tickets"] },
        { comp: "SelectableRow", props: { value: "calendar" }, children: [fr ? "Calendrier" : "Calendar"] }
      ]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Formulaires" : "Component · Forms"}</p>
    <div class="docs-hero-title">
      <h1>SelectableList</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Listbox accessible qui possède la sélection et un roving tabindex pour ses SelectableRow. Les flèches / Début / Fin déplacent le focus ; Espace / Entrée / clic basculent la rangée focalisée. Sélection unique par défaut ; multiple bascule chaque rangée indépendamment. Contrôlée via value / onchange, sinon elle garde sa sélection interne."
        : "Accessible listbox that owns selection and a roving tabindex for its SelectableRow children. Arrow / Home / End move focus; Space / Enter / click toggle the focused row. Single-select by default; multiple toggles each row independently. Controlled via value / onchange, otherwise it keeps its own internal selection."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={singleDemo} title={fr ? "Sélection unique" : "Single select"} />
    <TabbedExample nodes={multipleDemo} title="multiple" />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>label</code></td><td><code>string</code></td><td><em>–</em></td></tr>
        <tr><td><code>labelledby</code></td><td><code>string</code></td><td><em>–</em></td></tr>
        <tr><td><code>multiple</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>value</code></td><td><code>string | string[] | null</code></td><td><em>–</em></td></tr>
        <tr><td><code>onchange</code> / <code>onChange</code></td><td><code>(value: string | string[] | null) =&gt; void</code></td><td><em>–</em></td></tr>
      </tbody>
    </table>
    <p>{fr
      ? "Fournir label ou labelledby pour nommer la listbox (requis pour les lecteurs d'écran). En multiple, value est un string[] et aria-multiselectable est ajouté. Navigation clavier : ↑ / ↓ (et ← / →) déplacent le focus parmi les rangées, Début / Fin sautent à la première / dernière, Espace / Entrée basculent la sélection."
      : "Provide label or labelledby to name the listbox (required for screen readers). In multiple mode, value is a string[] and aria-multiselectable is added. Keyboard navigation: ↑ / ↓ (and ← / →) move focus across rows, Home / End jump to the first / last, Space / Enter toggle selection."}</p>
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
