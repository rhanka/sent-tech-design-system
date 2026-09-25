<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { dataImageDemoNodes, type NodeSpec } from "$lib/framework/examples";
  import { Badge, CodeSnippet, Link } from "@sentropic/design-system-svelte";
  import {
    createDashboardStore,
    type DataImageConfig,
    type DataModel
  } from "@sentropic/dataviz-core";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  // Minimal real store (never a mock): the demo row comes from store data.
  const model: DataModel = {
    dimensions: [{ id: "product", label: "Product", type: "discrete" }],
    measures: [{ id: "revenue", label: "Revenue", aggregation: "sum" }]
  };
  const store = createDashboardStore({
    model,
    data: [
      { product: "Atlas", revenue: 120 },
      { product: "Beacon", revenue: 80 }
    ]
  });
  const row = store.data[0] ?? {};

  const image: DataImageConfig = {
    srcTemplate:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 200'%3E%3Crect width='320' height='200' fill='%23eef2f7'/%3E%3Cpath d='M42 144h236L214 71l-46 54-32-37z' fill='%234e79a7'/%3E%3Ccircle cx='92' cy='66' r='20' fill='%23f28e2b'/%3E%3Ctext x='16' y='182' font-family='sans-serif' font-size='20' fill='%230f172a'%3E{{product}}%3C/text%3E%3C/svg%3E",
    altTemplate: "Product chart for {{product}}",
    fallbackSrc:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 200'%3E%3Crect width='320' height='200' fill='%23eef2f7'/%3E%3C/svg%3E"
  };

  const demo = $derived<NodeSpec[]>(dataImageDemoNodes(image, row));

  const notes = $derived({
    angular: fr
      ? "Aucun adaptateur DataImage côté Angular."
      : "No DataImage adapter in Angular."
  });

  const storeCode = `import { createDashboardStore } from "@sentropic/dataviz-core";
import { DataImage } from "@sentropic/dataviz-svelte";

const store = createDashboardStore({
  model: {
    dimensions: [{ id: "product", label: "Product", type: "discrete" }],
    measures: [{ id: "revenue", label: "Revenue", aggregation: "sum" }]
  },
  data: [
    { product: "Atlas", revenue: 120 },
    { product: "Beacon", revenue: 80 }
  ]
});

// The row wired into the demo comes from the live store.
const row = store.data[0];`;
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{t(locale.value, "datavizKicker")}</p>
    <div class="docs-hero-title">
      <h1>DataImage</h1>
      <Badge tone="neutral">{fr ? "Documenté" : "Documented"}</Badge>
    </div>
    <p>
      {#if fr}
        Image résolue depuis une ligne de données : <code>image</code> décrit comment
        construire <code>src</code> et <code>alt</code> (valeur fixe, champ de ligne ou
        gabarit <code>{"{{champ}}"}</code>), <code>row</code> fournit la ligne. Sans
        import DS : l’adaptateur rend sa propre <code>&lt;img&gt;</code>.
      {:else}
        Image resolved from a data row: <code>image</code> describes how to build
        <code>src</code> and <code>alt</code> (fixed value, row field, or
        <code>{"{{field}}"}</code> template), <code>row</code> supplies the row. No DS
        import: the adapter renders its own <code>&lt;img&gt;</code>.
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
          <td>{fr ? "Composant DataImage (démo live ci-dessous)." : "DataImage component (live demo below)."}</td>
        </tr>
        <tr>
          <td><code>React</code></td>
          <td>{fr ? "Composant DataImage (démo live ci-dessous, attributs img natifs en plus)." : "DataImage component (live demo below, plus native img attributes)."}</td>
        </tr>
        <tr>
          <td><code>Vue</code></td>
          <td>{fr ? "Composant DataImage (démo live ci-dessous)." : "DataImage component (live demo below)."}</td>
        </tr>
        <tr>
          <td><code>Angular</code></td>
          <td>{fr ? "Absent : aucun adaptateur." : "Missing: no adapter."}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Exemples" : "Examples"}</h2>
    <p class="section-desc">
      {#if fr}
        La ligne <code>Atlas</code> d’un vrai store minimal alimente le gabarit :
        le nom du produit est inscrit dans l’image et son texte alternatif.
      {:else}
        The <code>Atlas</code> row of a real minimal store feeds the template: the
        product name is written into the image and its alternative text.
      {/if}
    </p>
    <TabbedExample
      nodes={demo}
      {notes}
      title={fr ? "Image liée à une ligne" : "Row-bound image"}
    />
    <p>
      <Link href="/components/data-image">
        {fr ? "DataImage natif (props src/alt)" : "Native DataImage (src/alt props)"}
      </Link>
    </p>
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
          <td><code>image.src</code> / <code>srcField</code> / <code>srcTemplate</code></td>
          <td><code>string</code></td>
          <td><code>fallbackSrc</code> {fr ? "puis" : "then"} <code>""</code></td>
          <td>
            {fr
              ? "Source, par priorité : gabarit, champ de ligne, valeur fixe."
              : "Source, by priority: template, row field, fixed value."}
          </td>
        </tr>
        <tr>
          <td><code>image.alt</code> / <code>altField</code> / <code>altTemplate</code></td>
          <td><code>string</code></td>
          <td><code>""</code></td>
          <td>
            {fr
              ? "Texte alternatif, même priorité (gabarit, champ, valeur)."
              : "Alternative text, same priority (template, field, value)."}
          </td>
        </tr>
        <tr>
          <td><code>image.fallbackSrc</code></td>
          <td><code>string</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>
            {fr
              ? "Source de repli quand aucune source ne se résout."
              : "Fallback source when no source resolves."}
          </td>
        </tr>
        <tr>
          <td><code>row</code></td>
          <td><code>Row</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>
            {fr
              ? "Ligne alimentant champs et gabarits (tokens {{champ}})."
              : "Row feeding fields and templates ({{field}} tokens)."}
          </td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>{fr ? "non défini" : "unset"}</td>
          <td>
            {fr
              ? "Classe transmise à l’img (attributs img natifs en plus côté React)."
              : "Class forwarded to the img (plus native img attributes in React)."}
          </td>
        </tr>
      </tbody>
    </table>
    <p class="docs-demo-context">
      {#if fr}
        Faux ami assumé : l’homonyme natif <code>DataImage</code> (src, alt, width,
        height, fit, radius, loading, decoding) prend une URL directe ; cette page
        documente l’adaptateur dataviz, qui résout son image depuis une ligne et ne
        compose aucun composant DS.
      {:else}
        Deliberate false friend: the native namesake <code>DataImage</code> (src, alt,
        width, height, fit, radius, loading, decoding) takes a direct URL; this page
        documents the dataviz adapter, which resolves its image from a row and
        composes no DS component.
      {/if}
    </p>
  </section>
</div>
