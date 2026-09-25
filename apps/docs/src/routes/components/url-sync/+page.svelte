<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { urlSyncDemoNodes, type NodeSpec } from "$lib/framework/examples";
  import { Badge, CodeSnippet } from "@sentropic/design-system-svelte";
  import { createDashboardStore, type DataModel } from "@sentropic/dataviz-core";
  import { stateToQuery } from "@sentropic/dataviz-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  // Minimal real store (never a mock): one discrete dimension, one measure.
  const model: DataModel = {
    dimensions: [{ id: "country", label: "Country", type: "discrete" }],
    measures: [{ id: "revenue", label: "Revenue", aggregation: "sum" }]
  };
  const store = createDashboardStore({
    model,
    data: [
      { country: "FR", revenue: 120 },
      { country: "BE", revenue: 80 }
    ]
  });
  store.setFilter("country", { kind: "include", values: ["FR"] });

  // The exact query string the binding mirrors into the URL.
  const query = stateToQuery(store.getState());

  const demo = $derived<NodeSpec[]>([
    ...urlSyncDemoNodes(store),
    {
      el: "p",
      props: { class: "docs-demo-context" },
      children: [`${fr ? "État encodé dans l’URL" : "URL-encoded state"} : ?${query}`]
    }
  ]);

  const notes = $derived({
    react: fr
      ? "Pas de composant <UrlSync> côté React : appelez useUrlSync(store, options) du paquet @sentropic/dataviz-react. La démo live ci-dessus rend le composant Svelte."
      : "No <UrlSync> component in React: call useUrlSync(store, options) from @sentropic/dataviz-react. The live demo above renders the Svelte component.",
    vue: fr
      ? "Pas de composant <UrlSync> côté Vue : appelez le composable useUrlSync(store, options) du paquet @sentropic/dataviz-vue. La démo live ci-dessus rend le composant Svelte."
      : "No <UrlSync> component in Vue: call the useUrlSync(store, options) composable from @sentropic/dataviz-vue. The live demo above renders the Svelte component.",
    angular: fr
      ? "Aucun adaptateur UrlSync côté Angular : ni composant, ni hook."
      : "No UrlSync adapter in Angular: neither a component nor a hook."
  });

  const storeCode = `import { createDashboardStore } from "@sentropic/dataviz-core";
import { UrlSync } from "@sentropic/dataviz-svelte";

const store = createDashboardStore({
  model: {
    dimensions: [{ id: "country", label: "Country", type: "discrete" }],
    measures: [{ id: "revenue", label: "Revenue", aggregation: "sum" }]
  },
  data: [
    { country: "FR", revenue: 120 },
    { country: "BE", revenue: 80 }
  ]
});`;
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{t(locale.value, "datavizKicker")}</p>
    <div class="docs-hero-title">
      <h1>UrlSync</h1>
      <Badge tone="neutral">{fr ? "Documenté" : "Documented"}</Badge>
    </div>
    <p>
      {#if fr}
        Synchronisation déclarative entre un <code>DashboardStore</code> et la chaîne de
        requête de l’URL (deep-linking) : <code>&lt;UrlSync store /&gt;</code> hydrate le
        store depuis l’URL au montage, y répercute les mutations du store et se
        réhydrate sur <code>popstate</code>. Ne rend rien : c’est du câblage, pas du
        balisage.
      {:else}
        Declarative sync between a <code>DashboardStore</code> and the URL query string
        (deep-linking): <code>&lt;UrlSync store /&gt;</code> hydrates the store from the
        URL on mount, mirrors store mutations back into it, and re-hydrates on
        <code>popstate</code>. It renders nothing: wiring, not markup.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "datavizCoverageTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Framework</th>
          <th>{t(locale.value, "datavizFrameworkShape")}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>Svelte</code></td>
          <td>{fr ? "Composant <UrlSync> (démo live ci-dessous)." : "<UrlSync> component (live demo below)."}</td>
        </tr>
        <tr>
          <td><code>React</code></td>
          <td>{fr ? "Pas de composant : hook useUrlSync(store, options)." : "No component: useUrlSync(store, options) hook."}</td>
        </tr>
        <tr>
          <td><code>Vue</code></td>
          <td>{fr ? "Pas de composant : composable useUrlSync(store, options)." : "No component: useUrlSync(store, options) composable."}</td>
        </tr>
        <tr>
          <td><code>Angular</code></td>
          <td>{fr ? "Absent : ni composant, ni hook." : "Missing: neither a component nor a hook."}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if fr}
        Un vrai <code>DashboardStore</code> minimal, filtré sur la France : la ligne sous
        la démo montre la chaîne de requête exacte que la liaison écrit dans l’URL.
      {:else}
        A real minimal <code>DashboardStore</code>, filtered to France: the line below the
        demo shows the exact query string the binding writes into the URL.
      {/if}
    </p>
    <TabbedExample
      nodes={demo}
      {notes}
      title={fr ? "Store synchronisé avec l’URL" : "URL-synced store"}
    />
    <h3 class="docs-demo-title">{t(locale.value, "datavizBootstrapTitle")}</h3>
    <CodeSnippet
      code={storeCode}
      language="ts"
      copyLabel={fr ? "Copier" : "Copy"}
      copiedLabel={fr ? "Copié" : "Copied"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "API du composant" : "Component API"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>{fr ? "Défaut" : "Default"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>store</code></td>
          <td><code>DashboardStore</code></td>
          <td><em>{fr ? "requis" : "required"}</em></td>
          <td>
            {fr
              ? "Le store à synchroniser avec la requête (identité capturée une fois)."
              : "The store to sync with the query string (identity captured once)."}
          </td>
        </tr>
        <tr>
          <td><code>options.param</code></td>
          <td><code>string</code></td>
          <td><code>"dash"</code></td>
          <td>
            {fr
              ? "Nom du paramètre de requête lu et écrit."
              : "Query parameter name read and written."}
          </td>
        </tr>
        <tr>
          <td><code>options.debounceMs</code></td>
          <td><code>number</code></td>
          <td><code>0</code></td>
          <td>
            {fr
              ? "Fenêtre anti-rebond (ms) avant d’écrire les mutations rapides."
              : "Debounce window (ms) before writing rapid mutations."}
          </td>
        </tr>
        <tr>
          <td><code>options.history</code></td>
          <td><code>"replace" | "push"</code></td>
          <td><code>"replace"</code></td>
          <td>
            {fr
              ? "Stratégie d’historique : replaceState par défaut, pushState sur demande."
              : "History strategy: replaceState by default, pushState on demand."}
          </td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      {#if fr}
        Sans composant DS sous-jacent : il n’y a ni table de props héritée, ni tokens.
        L’état est entièrement sérialisable (filtres, sélections, drill) via
        <code>stateToQuery</code> / <code>queryToState</code>.
      {:else}
        No underlying DS component: there is no inherited props table and no tokens.
        The state is fully serializable (filters, selections, drill) through
        <code>stateToQuery</code> / <code>queryToState</code>.
      {/if}
    </p>
  </section>
</div>
