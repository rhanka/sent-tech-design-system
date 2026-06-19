<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock ERP / Stock ──────────────────────────────────────────────

  const STEPS = $derived([
    { label: fr ? "Bon de commande" : "Purchase Order", description: fr ? "Terminé" : "Done" },
    { label: fr ? "Contrôle quantités" : "Qty check", description: fr ? "En cours" : "Current" },
    { label: fr ? "Écarts" : "Discrepancies" },
    { label: fr ? "Bon de livraison" : "Delivery note" }
  ]);

  const LINE_COLUMNS = $derived([
    { key: "ref", label: fr ? "Référence" : "Reference" },
    { key: "designation", label: fr ? "Désignation" : "Description" },
    { key: "attendu", label: fr ? "Attendu" : "Expected", align: "end" as const },
    { key: "recu", label: fr ? "Reçu" : "Received", align: "end" as const },
    { key: "ecart", label: fr ? "Écart" : "Variance", align: "end" as const }
  ]);

  const LINE_ROWS = $derived([
    { id: "1", ref: "ART-00412", designation: fr ? "Capteur de pression PX400" : "PX400 pressure sensor", attendu: "50", recu: "50", ecart: "0" },
    { id: "2", ref: "ART-00587", designation: fr ? "Connecteur M12 4 broches" : "M12 4-pin connector", attendu: "200", recu: "185", ecart: "-15" },
    { id: "3", ref: "ART-00291", designation: fr ? "Câble blindé 3 m" : "Shielded cable 3 m", attendu: "100", recu: "100", ecart: "0" },
    { id: "4", ref: "ART-00634", designation: fr ? "Module relais 24 V" : "24 V relay module", attendu: "30", recu: "28", ecart: "-2" }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "gr-shell" },
      children: [
        // Stepper de progression
        {
          comp: "Stepper",
          props: {
            current: 1,
            label: fr ? "Réception de marchandises" : "Goods receipt",
            steps: STEPS
          }
        },
        // Barre de progression globale
        {
          el: "div",
          props: { class: "gr-progress" },
          children: [
            { el: "span", props: { class: "gr-progress-label" }, children: [fr ? "Avancement de la réception" : "Receipt progress"] },
            { comp: "Progress", props: { value: 50, max: 100, label: fr ? "Avancement" : "Progress" } }
          ]
        },
        // Rappel du bon de commande
        {
          el: "div",
          props: { class: "gr-section" },
          children: [
            { el: "h3", props: { class: "gr-section-title" }, children: [fr ? "Étape 2 · Contrôle des quantités — PO-2026-0831" : "Step 2 · Quantity check — PO-2026-0831"] },
            {
              comp: "Table",
              props: {
                caption: fr ? "Articles attendus vs reçus" : "Expected vs received items",
                columns: LINE_COLUMNS,
                rows: LINE_ROWS,
                size: "sm"
              }
            }
          ]
        },
        // Alerte écart
        {
          comp: "Alert",
          props: {
            tone: "warning",
            title: fr ? "2 écarts détectés" : "2 discrepancies detected"
          },
          children: [fr ? "ART-00587 : −15 unités · ART-00634 : −2 unités. Veuillez justifier ou signaler au fournisseur avant de valider." : "ART-00587 : −15 units · ART-00634 : −2 units. Please justify or report to the supplier before confirming."]
        },
        // Champs de saisie justification + dépôt BL
        {
          el: "div",
          props: { class: "gr-section" },
          children: [
            { el: "h3", props: { class: "gr-section-title" }, children: [fr ? "Justification des écarts" : "Discrepancy justification"] },
            {
              comp: "Input",
              props: {
                label: fr ? "Commentaire" : "Comment",
                placeholder: fr ? "Ex. : lot incomplet signalé par le transporteur" : "e.g. incomplete batch reported by carrier",
                value: ""
              }
            },
            {
              comp: "FileUploader",
              props: {
                label: fr ? "Bon de livraison (PDF ou image)" : "Delivery note (PDF or image)",
                accept: ".pdf,.png,.jpg",
                buttonLabel: fr ? "Choisir un fichier" : "Choose file"
              }
            }
          ]
        },
        // Navigation
        {
          comp: "ButtonGroup",
          props: { label: fr ? "Navigation de l'assistant" : "Wizard navigation", class: "gr-nav" },
          children: [
            { comp: "Button", props: { variant: "secondary" }, children: [fr ? "Précédent" : "Previous"] },
            { comp: "Button", props: { variant: "primary" }, children: [fr ? "Valider la réception" : "Confirm receipt"] }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Stepper", slug: "stepper" },
    { name: "Progress", slug: "progress" },
    { name: "Table", slug: "table" },
    { name: "Alert", slug: "alert" },
    { name: "Input", slug: "input" },
    { name: "FileUploader", slug: "file-uploader" },
    { name: "ButtonGroup", slug: "button-group" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "ERP / Stock" : "ERP / Stock"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Réception de marchandises" : "Goods Receipt"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Assistant de réception en étapes : rappel de l'ordre d'achat, contrôle des quantités reçues
        vs attendues, signalement d'écarts par <code>Alert</code>, dépôt du bon de livraison via
        <code>FileUploader</code>. Pour enregistrer l'entrée physique des articles en entrepôt.
      {:else}
        Stepped receiving wizard: purchase order recall, received vs expected quantity check via
        <code>Table</code>, discrepancy alerting with <code>Alert</code>, delivery note upload
        through <code>FileUploader</code>. To record the physical arrival of items into a warehouse.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Réception de marchandises : PO-2026-0831 (données mock)" : "Goods Receipt : PO-2026-0831 (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="gr-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .gr-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  :global(.gr-shell) {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }

  :global(.gr-progress) {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  :global(.gr-progress-label) {
    font-size: 0.85rem;
    color: var(--st-semantic-text-secondary, #64748b);
  }

  :global(.gr-section) {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  :global(.gr-section-title) {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.gr-nav) {
    justify-content: flex-end;
  }
</style>
