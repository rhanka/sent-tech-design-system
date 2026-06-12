<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  const horizontalDemo: NodeSpec[] = [
    {
      comp: "Stepper",
      props: {
        current: 1,
        label: fr ? "Commande" : "Checkout",
        steps: [
          { label: fr ? "Panier" : "Cart" },
          { label: fr ? "Livraison" : "Shipping" },
          { label: fr ? "Paiement" : "Payment" }
        ]
      }
    }
  ];
  const verticalDemo: NodeSpec[] = [
    {
      comp: "Stepper",
      props: {
        current: 2,
        orientation: "vertical",
        label: fr ? "Intégration" : "Onboarding",
        steps: [
          { label: fr ? "Compte" : "Account", description: fr ? "Terminé" : "Done" },
          { label: fr ? "Équipe" : "Team", description: fr ? "Terminé" : "Done" },
          { label: fr ? "Projet" : "Project", description: fr ? "En cours" : "In progress" },
          { label: fr ? "Invitations" : "Invites" }
        ]
      }
    }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Composant · Navigation" : "Component · Navigation"}</p>
    <div class="docs-hero-title">
      <h1>Stepper</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr
        ? "Indicateur de progression d'un parcours en étapes. Les états (terminé, courant, à venir) sont dérivés de current ; orientations horizontale et verticale."
        : "Progress indicator for a step-based flow. States (complete, current, upcoming) are derived from current; horizontal and vertical orientations."}
    </p>
  </section>


  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>
    <TabbedExample nodes={horizontalDemo} title={fr ? "Horizontal" : "Horizontal"} />
    <TabbedExample nodes={verticalDemo} title={fr ? "orientation=\"vertical\"" : "orientation=\"vertical\""} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>steps</code></td><td><code>{`{ label: string; description?: string }[]`}</code></td><td><em>{fr ? "requis" : "required"}</em></td></tr>
        <tr><td><code>current</code></td><td><code>number</code> ({fr ? "index 0-based" : "0-based index"})</td><td><code>0</code></td></tr>
        <tr><td><code>orientation</code></td><td><code>"horizontal" | "vertical"</code></td><td><code>"horizontal"</code></td></tr>
        <tr><td><code>clickable</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>onStepClick</code></td><td><code>(index: number) =&gt; void</code></td><td><em>–</em></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Progression"</code></td></tr>
      </tbody>
    </table>
    <p>{fr ? "Rend une liste ordonnée ; l'étape courante porte aria-current=\"step\". Avec clickable, chaque cercle devient un bouton." : "Renders an ordered list; the current step carries aria-current=\"step\". With clickable, each circle becomes a button."}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
    </ul>
  </section>
</div>
