<script lang="ts">
  // Écran Dashboard — AppChrome + Header + SideNav, zone principale avec 3 KpiCard
  // et une DataTable. Page complète auto-contenue construite à partir des composants DS.
  import {
    AppChrome,
    Header,
    SideNav,
    KpiCard,
    DataTable
  } from "@sentropic/design-system-svelte";
  import type {
    SideNavItem,
    DataTableColumn,
    DataTableRow
  } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  const navItems = $derived<SideNavItem[]>([
    { label: fr ? "Tableau de bord" : "Dashboard", href: "#", active: true },
    { label: fr ? "Clients" : "Customers", href: "#" },
    { label: fr ? "Factures" : "Invoices", href: "#" },
    { label: fr ? "Rapports" : "Reports", href: "#" },
    { label: fr ? "Paramètres" : "Settings", href: "#" }
  ]);

  const columns = $derived<DataTableColumn[]>([
    { key: "name", label: fr ? "Client" : "Customer", sortable: true },
    { key: "plan", label: fr ? "Forfait" : "Plan", sortable: true },
    { key: "mrr", label: fr ? "Revenu mensuel" : "MRR", align: "end", sortable: true },
    { key: "status", label: fr ? "Statut" : "Status" }
  ]);

  const rows = $derived<DataTableRow[]>([
    { id: "1", name: "Acme Inc.", plan: fr ? "Entreprise" : "Enterprise", mrr: "4 200 $", status: fr ? "Actif" : "Active" },
    { id: "2", name: "Globex Corp.", plan: "Pro", mrr: "1 100 $", status: fr ? "Actif" : "Active" },
    { id: "3", name: "Initech SA", plan: fr ? "Démarrage" : "Starter", mrr: "320 $", status: fr ? "En essai" : "Trial" },
    { id: "4", name: "Umbrella Co.", plan: "Pro", mrr: "1 100 $", status: fr ? "Suspendu" : "Suspended" },
    { id: "5", name: "Hooli LLC", plan: fr ? "Entreprise" : "Enterprise", mrr: "5 800 $", status: fr ? "Actif" : "Active" }
  ]);
</script>

<div class="dash-shell">
  <AppChrome
    brandName="Sent Tech"
    productName={fr ? "Console" : "Console"}
    nav={navItems.map((i) => ({ label: i.label, href: i.href, active: i.active }))}
  />
  <Header title={fr ? "Tableau de bord" : "Dashboard"} sticky={false} />

    <div class="dash-body">
      <aside class="dash-side">
        <SideNav items={navItems} label={fr ? "Navigation" : "Navigation"} />
      </aside>

      <main class="dash-main">
        <section class="dash-kpis" aria-label={fr ? "Indicateurs clés" : "Key metrics"}>
          <KpiCard
            label={fr ? "Revenu mensuel" : "Monthly revenue"}
            value={48200}
            format="currency"
            currency="CAD"
            delta={12.4}
            tone="category1"
          />
          <KpiCard
            label={fr ? "Clients actifs" : "Active customers"}
            value={1284}
            delta={3.1}
            tone="category2"
          />
          <KpiCard
            label={fr ? "Taux d'attrition" : "Churn rate"}
            value={2.3}
            format="percent"
            delta={-0.4}
            tone="category3"
          />
        </section>

        <section class="dash-table" aria-label={fr ? "Clients récents" : "Recent customers"}>
          <h2 class="dash-section-title">{fr ? "Clients récents" : "Recent customers"}</h2>
          <DataTable {columns} {rows} caption={fr ? "Clients récents" : "Recent customers"} />
        </section>
      </main>
    </div>
</div>

<style>
  .dash-shell {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 480px;
  }

  .dash-body {
    display: grid;
    grid-template-columns: 220px 1fr;
    flex: 1;
    min-height: 0;
  }

  .dash-side {
    border-right: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-subtle, #f8fafc);
    padding: 1rem 0.75rem;
  }

  .dash-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    min-width: 0;
  }

  .dash-kpis {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .dash-table {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .dash-section-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  @media (max-width: 860px) {
    .dash-body {
      grid-template-columns: 1fr;
    }
    .dash-side {
      border-right: none;
      border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    }
    .dash-kpis {
      grid-template-columns: 1fr;
    }
  }
</style>
