<script lang="ts">
  import { Badge, PaginationNav } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  let shortPage = $state(1);
  let longPage = $state(12);
  let smallPage = $state(1);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Navigation</p>
    <h1>
      {t(locale.value, "paginationNavTitle")}
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{t(locale.value, "paginationNavIntro")}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div
      class="docs-example"
      aria-label={locale.value === "fr" ? "Pagination courte" : "Short pagination"}
    >
      <PaginationNav
        bind:page={shortPage}
        pageCount={5}
        label={locale.value === "fr" ? "Pagination courte" : "Short pagination"}
        previousLabel={locale.value === "fr" ? "Page précédente" : "Previous page"}
        nextLabel={locale.value === "fr" ? "Page suivante" : "Next page"}
      />
      <p class="docs-example__caption">
        {locale.value === "fr" ? "Page courante" : "Current page"} : <code>{shortPage}</code>
      </p>
    </div>

    <div
      class="docs-example"
      aria-label={locale.value === "fr" ? "Pagination longue avec ellipses" : "Long pagination with ellipses"}
    >
      <PaginationNav
        bind:page={longPage}
        pageCount={30}
        label={locale.value === "fr" ? "Pagination longue" : "Long pagination"}
        previousLabel={locale.value === "fr" ? "Page précédente" : "Previous page"}
        nextLabel={locale.value === "fr" ? "Page suivante" : "Next page"}
      />
      <p class="docs-example__caption">
        {locale.value === "fr" ? "Page courante" : "Current page"} : <code>{longPage}</code>
      </p>
    </div>

    <div
      class="docs-example"
      aria-label={locale.value === "fr" ? "Bornes désactivées" : "Disabled boundaries"}
    >
      <PaginationNav
        bind:page={smallPage}
        pageCount={3}
        label={locale.value === "fr" ? "Pagination compacte" : "Compact pagination"}
        previousLabel={locale.value === "fr" ? "Page précédente" : "Previous page"}
        nextLabel={locale.value === "fr" ? "Page suivante" : "Next page"}
      />
      <p class="docs-example__caption">
        {locale.value === "fr" ? "Page courante" : "Current page"} : <code>{smallPage}</code>
        {#if smallPage === 1}
          · {locale.value === "fr" ? "« Précédent » désactivé" : "“Previous” disabled"}
        {:else if smallPage === 3}
          · {locale.value === "fr" ? "« Suivant » désactivé" : "“Next” disabled"}
        {/if}
      </p>
    </div>
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
</div>
