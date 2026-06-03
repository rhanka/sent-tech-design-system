<script lang="ts">
  import { Badge, Breadcrumb, type BreadcrumbItem } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  const trail: BreadcrumbItem[] = $derived([
    { label: fr("Accueil", "Home"), href: "#" },
    { label: fr("Projets", "Projects"), href: "#" },
    { label: "Forge", href: "#" },
    { label: fr("Paramètres", "Settings"), current: true }
  ]);

  const shortTrail: BreadcrumbItem[] = $derived([
    { label: fr("Catalogue", "Catalog"), href: "#" },
    { label: "Breadcrumb", current: true }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Navigation", "Component · Navigation")}</p>
    <div class="docs-hero-title">
      <h1>Breadcrumb</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Fil d'Ariane indiquant la position de la page courante dans la hiérarchie et permettant de remonter. Rendu sémantique : <nav> + liste ordonnée, dernier élément marqué comme page courante.",
        "Breadcrumb trail showing the current page's position in the hierarchy and letting users go back up. Semantic markup: <nav> + ordered list, last item flagged as the current page."
      )}
    </p>
  </section>

  <FrameworkPreview example="breadcrumb" title="Aperçu live" />

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour des hiérarchies profondes (≥ 2 niveaux) où l'utilisateur doit pouvoir remonter.", "For deep hierarchies (≥ 2 levels) where users may need to climb back up.")}</li>
      <li>{fr("En complément de la navigation principale, pas à sa place.", "As a complement to the main navigation, not a replacement.")}</li>
      <li>{fr("Inutile sur une page de premier niveau.", "Unnecessary on a top-level page.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Exemples", "Examples")}</h2>
    <div class="docs-example docs-example--stack">
      <h3>{fr("Hiérarchie profonde", "Deep hierarchy")}</h3>
      <Breadcrumb items={trail} label={fr("Fil d'Ariane", "Breadcrumb")} />
      <h3>{fr("Deux niveaux", "Two levels")}</h3>
      <Breadcrumb items={shortTrail} label={fr("Fil d'Ariane court", "Short breadcrumb")} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur : <nav aria-label> contenant une liste ordonnée <ol>.", "Container: <nav aria-label> wrapping an ordered list <ol>.")}</li>
      <li>{fr("Maillons : chaque item est un <a> (si href et non courant) ou un <span>.", "Crumbs: each item is an <a> (when href and not current) or a <span>.")}</li>
      <li>{fr("Séparateur : un « / » décoratif (aria-hidden) entre les maillons.", "Separator: a decorative \"/\" (aria-hidden) between crumbs.")}</li>
      <li>{fr("Page courante : <span aria-current=\"page\">, non cliquable.", "Current page: <span aria-current=\"page\">, not clickable.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Le <nav> reçoit un aria-label via la prop label.", "The <nav> gets an aria-label via the label prop.")}</li>
      <li>{fr("Le maillon courant porte aria-current=\"page\" et n'est pas un lien.", "The current crumb carries aria-current=\"page\" and is not a link.")}</li>
      <li>{fr("Les séparateurs sont aria-hidden : ils ne sont pas annoncés.", "Separators are aria-hidden: they are not announced.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Refléter la vraie hiérarchie de navigation.", "Mirror the real navigation hierarchy.")}</li>
          <li>{fr("Marquer le dernier élément comme current.", "Flag the last item as current.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Rendre la page courante cliquable.", "Make the current page clickable.")}</li>
          <li>{fr("Y mettre l'historique de navigation plutôt que la hiérarchie.", "Put browsing history instead of the hierarchy.")}</li>
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
        <tr><td><code>items</code></td><td><code>BreadcrumbItem[]</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Maillons du fil, dans l'ordre.", "Trail crumbs, in order.")}</td></tr>
        <tr><td><code>label</code></td><td><code>string</code></td><td><code>"Breadcrumb"</code></td><td>{fr("aria-label du <nav>.", "aria-label of the <nav>.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) supplémentaire(s).", "Additional class(es).")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td><td>N/A</td><td>{fr("Propagés sur le <nav>.", "Spread onto the <nav>.")}</td></tr>
      </tbody>
    </table>

    <h3>{fr("Type BreadcrumbItem", "BreadcrumbItem type")}</h3>
    <table class="docs-table">
      <thead>
        <tr><th>{fr("Champ", "Field")}</th><th>Type</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>label</code></td><td><code>string</code></td><td>{fr("Texte du maillon.", "Crumb text.")}</td></tr>
        <tr><td><code>href</code></td><td><code>string?</code></td><td>{fr("Lien ; rend un <a> si présent et non courant.", "Link; renders an <a> when present and not current.")}</td></tr>
        <tr><td><code>current</code></td><td><code>boolean?</code></td><td>{fr("Marque la page courante (aria-current).", "Marks the current page (aria-current).")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-breadcrumb-text</code></li>
      <li><code>--st-component-breadcrumb-linkText</code></li>
      <li><code>--st-component-breadcrumb-currentText</code></li>
      <li><code>--st-component-breadcrumb-separator</code></li>
    </ul>
  </section>
</div>
