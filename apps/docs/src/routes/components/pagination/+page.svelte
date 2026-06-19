<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Navigation", "Component · Navigation")}</p>
    <div class="docs-hero-title">
      <h1>Pagination</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Navigation de pages numérotées avec contrôles Précédent / Suivant. La page courante est mise en valeur et annoncée ; idéale pour un faible nombre de pages.",
        "Numbered page navigation with Previous / Next controls. The current page is highlighted and announced; best for a small number of pages."
      )}
    </p>
  </section>

  <TabbedExample nodes={getExample("pagination")?.nodes ?? []} />

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Parcourir un jeu de résultats découpé en pages de taille fixe.", "Browse a result set split into fixed-size pages.")}</li>
      <li>{fr("Quand le nombre total de pages est petit (toutes les pages sont rendues).", "When the total page count is small (all pages are rendered).")}</li>
      <li>{fr("Pour de grands volumes avec ellipses, utilisez PaginationNav.", "For large volumes with ellipses, use PaginationNav.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Exemple interactif", "Interactive example")}</h2>
    <p>{fr("onpagechange remonte la page demandée ; le parent contrôle l'état.", "onpagechange reports the requested page; the parent controls state.")}</p>
    <TabbedExample nodes={getExample("pagination-interactive")?.nodes ?? []} code={getExample("pagination-interactive")?.code} />
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "states")}</h2>
    <p>{fr("Sur la première page, « Précédent » est désactivé ; sur la dernière, « Suivant ».", "On the first page, \"Previous\" is disabled; on the last, \"Next\".")}</p>
    <TabbedExample nodes={getExample("pagination-states")?.nodes ?? []} code={getExample("pagination-states")?.code} />
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur : <nav aria-label=\"Pagination\"> contenant des boutons.", "Container: <nav aria-label=\"Pagination\"> wrapping buttons.")}</li>
      <li>{fr("Bouton Précédent : désactivé sur la première page.", "Previous button: disabled on the first page.")}</li>
      <li>{fr("Boutons de page : un par page ; la courante est mise en évidence.", "Page buttons: one per page; the current one is highlighted.")}</li>
      <li>{fr("Bouton Suivant : désactivé sur la dernière page.", "Next button: disabled on the last page.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Le <nav> porte aria-label=\"Pagination\".", "The <nav> carries aria-label=\"Pagination\".")}</li>
      <li>{fr("Chaque bouton de page a un aria-label « Page N » ; la courante reçoit aria-current=\"page\".", "Each page button has an aria-label \"Page N\"; the current one gets aria-current=\"page\".")}</li>
      <li>{fr("Les contrôles aux extrémités sont disabled, donc retirés du focus.", "End controls are disabled, hence removed from focus.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Traduire previousLabel / nextLabel selon la langue.", "Translate previousLabel / nextLabel per locale.")}</li>
          <li>{fr("Garder la page courante toujours visible et distincte.", "Keep the current page always visible and distinct.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Rendre des dizaines de pages : passez à PaginationNav.", "Render dozens of pages: switch to PaginationNav.")}</li>
          <li>{fr("Oublier de mettre à jour page après onpagechange.", "Forget to update page after onpagechange.")}</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{fr("Défaut", "Default")}</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>page</code></td><td><code>number</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Page courante (1-indexée).", "Current page (1-indexed).")}</td></tr>
        <tr><td><code>pageCount</code></td><td><code>number</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Nombre total de pages.", "Total number of pages.")}</td></tr>
        <tr><td><code>previousLabel</code></td><td><code>string</code></td><td><code>"Previous"</code></td><td>{fr("Libellé du bouton précédent.", "Previous button label.")}</td></tr>
        <tr><td><code>nextLabel</code></td><td><code>string</code></td><td><code>"Next"</code></td><td>{fr("Libellé du bouton suivant.", "Next button label.")}</td></tr>
        <tr><td><code>onpagechange</code></td><td><code>(page: number) => void</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Appelé avec la page demandée.", "Called with the requested page.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) supplémentaire(s).", "Additional class(es).")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td><td>N/A</td><td>{fr("Propagés sur le <nav>.", "Spread onto the <nav>.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-pagination-background</code></li>
      <li><code>--st-component-pagination-border</code></li>
      <li><code>--st-component-pagination-text</code></li>
      <li><code>--st-component-pagination-activeBackground</code></li>
      <li><code>--st-component-pagination-activeText</code></li>
      <li><code>--st-component-pagination-disabledText</code></li>
      <li><code>--st-component-pagination-radius</code></li>
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>
</div>
