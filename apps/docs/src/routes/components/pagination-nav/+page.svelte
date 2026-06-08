<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import TriRender from "$lib/framework/TriRender.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc « Aperçu live »). État
  // statique : la page courante bindable n'est pas live (note conservée en
  // prose). Le nom du total diffère par moteur : Svelte `pageCount`, React/Vue
  // `totalPages`. On passe les deux pour figer le même état (props inconnues
  // ignorées).
  const shortDemo: NodeSpec[] = $derived([
    {
      comp: "PaginationNav",
      props: {
        page: 1,
        pageCount: 5,
        totalPages: 5,
        label: locale.value === "fr" ? "Pagination courte" : "Short pagination",
        previousLabel: locale.value === "fr" ? "Page précédente" : "Previous page",
        nextLabel: locale.value === "fr" ? "Page suivante" : "Next page"
      }
    }
  ]);

  const longDemo: NodeSpec[] = $derived([
    {
      comp: "PaginationNav",
      props: {
        page: 12,
        pageCount: 30,
        totalPages: 30,
        label: locale.value === "fr" ? "Pagination longue" : "Long pagination",
        previousLabel: locale.value === "fr" ? "Page précédente" : "Previous page",
        nextLabel: locale.value === "fr" ? "Page suivante" : "Next page"
      }
    }
  ]);

  const compactDemo: NodeSpec[] = $derived([
    {
      comp: "PaginationNav",
      props: {
        page: 1,
        pageCount: 3,
        totalPages: 3,
        label: locale.value === "fr" ? "Pagination compacte" : "Compact pagination",
        previousLabel: locale.value === "fr" ? "Page précédente" : "Previous page",
        nextLabel: locale.value === "fr" ? "Page suivante" : "Next page"
      }
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Navigation</p>
    <div class="docs-hero-title">
      <h1>{t(locale.value, "paginationNavTitle")}</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>{t(locale.value, "paginationNavIntro")}</p>
  </section>
  <TriRender nodes={getExample("paginationnav")?.nodes ?? []} label="Aperçu live" />

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <TriRender
      nodes={shortDemo}
      label={locale.value === "fr" ? "Pagination courte" : "Short pagination"}
    />
    <p class="docs-demo-note">
      {locale.value === "fr" ? "Page courante figée" : "Frozen current page"} : <code>1</code>
      · {locale.value === "fr" ? "« Précédent » désactivé à la borne" : "“Previous” disabled at the boundary"}
    </p>

    <TriRender
      nodes={longDemo}
      label={locale.value === "fr" ? "Pagination longue avec ellipses" : "Long pagination with ellipses"}
    />
    <p class="docs-demo-note">
      {locale.value === "fr" ? "Page courante figée" : "Frozen current page"} : <code>12</code>
      · {locale.value === "fr" ? "ellipses automatiques aux extrémités" : "automatic ellipses at the ends"}
    </p>

    <TriRender
      nodes={compactDemo}
      label={locale.value === "fr" ? "Bornes désactivées" : "Disabled boundaries"}
    />
    <p class="docs-demo-note">
      {locale.value === "fr" ? "Page courante figée" : "Frozen current page"} : <code>1</code>
      · {locale.value === "fr" ? "« Précédent » désactivé" : "“Previous” disabled"}
    </p>
  </section>
  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>page</code></td><td><code>number</code> (<code>$bindable</code>)</td><td><code>1</code></td></tr>
        <tr><td><code>pageCount</code></td><td><code>number</code></td><td><em>requis</em></td></tr>
        <tr><td><code>siblings</code></td><td><code>number</code></td><td><code>1</code></td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Pagination"</code></td></tr>
        <tr><td><code>previousLabel</code></td><td><code>string</code></td><td><code>"Previous page"</code></td></tr>
        <tr><td><code>nextLabel</code></td><td><code>string</code></td><td><code>"Next page"</code></td></tr>
        <tr><td><code>onPageChange</code></td><td><code>(page: number) =&gt; void</code></td><td><em>optionnel</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>optionnel</em></td></tr>
      </tbody>
    </table>
    <p>
      Le composant rend une <code>&lt;nav aria-label&gt;</code> contenant une
      liste <code>&lt;ul&gt;</code> de boutons. La page active reçoit
      <code>aria-current="page"</code>, et les boutons précédent/suivant sont
      désactivés aux bornes (<code>page === 1</code> ou
      <code>page === pageCount</code>). Le nombre de voisins affichés autour de
      la page courante est contrôlé par <code>siblings</code> ; les ellipses
      apparaissent automatiquement dès que <code>pageCount</code> dépasse
      <code>siblings * 2 + 5</code>. Les icônes Lucide utilisées sont
      <code>ChevronLeft</code>, <code>ChevronRight</code> et
      <code>Ellipsis</code>. Les autres attributs HTML
      <code>&lt;nav&gt;</code> sont transmis via spread.
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
