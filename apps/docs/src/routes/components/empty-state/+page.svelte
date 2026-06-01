<script lang="ts">
  import { Badge, Button, EmptyState, Link } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Feedback", "Component · Feedback")}</p>
    <div class="docs-hero-title">
      <h1>EmptyState</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Bloc centré affiché quand une zone n'a pas encore de contenu : il explique pourquoi c'est vide et propose une action principale claire pour avancer. À distinguer d'une erreur : l'état vide est attendu et constructif.",
        "Centered block shown when an area has no content yet: it explains why it is empty and offers a clear primary action to move forward. Distinct from an error: the empty state is expected and constructive."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Premier lancement : aucune donnée n'a encore été créée.", "First run: no data has been created yet.")}</li>
      <li>{fr("Résultat de filtre ou de recherche vide, avec un moyen de réinitialiser.", "Empty filter or search result, with a way to reset.")}</li>
      <li>{fr("Une liste ou une table sans entrée, pour guider la première action.", "A list or table with no entry, to guide the first action.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand ne pas l'utiliser", "When not to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour une erreur de chargement : utilisez Alert ou un message d'erreur dédié.", "For a loading error: use Alert or a dedicated error message.")}</li>
      <li>{fr("Pendant un chargement : utilisez LoadingState ou SkeletonText.", "During loading: use LoadingState or SkeletonText.")}</li>
      <li>{fr("Pour un simple champ optionnel non rempli : aucun état vide n'est nécessaire.", "For a plain optional field left blank: no empty state is needed.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Avec action principale", "With primary action")}</h2>
    <p>{fr("Le snippet action accueille le bouton qui débloque la première étape.", "The action snippet hosts the button that unblocks the first step.")}</p>
    <div class="docs-example docs-example--stack">
      <EmptyState
        title={fr("Aucun service configuré", "No service configured")}
        message={fr("Créez le premier service avant de publier l'espace du tenant.", "Create the first service before publishing the tenant workspace.")}
      >
        {#snippet action()}
          <Button>{fr("Créer un service", "Create service")}</Button>
        {/snippet}
      </EmptyState>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Sans action", "Without action")}</h2>
    <p>{fr("L'action est optionnelle : un état vide peut se limiter à un titre et un message.", "The action is optional: an empty state can be just a title and a message.")}</p>
    <div class="docs-example docs-example--stack">
      <EmptyState
        title={fr("Aucun résultat", "No results")}
        message={fr("Aucune entrée ne correspond à ces filtres. Élargissez la recherche.", "No entry matches these filters. Broaden your search.")}
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Avec contenu personnalisé", "With custom content")}</h2>
    <p>{fr("Le snippet children insère un contenu libre entre le message et l'action.", "The children snippet inserts free content between the message and the action.")}</p>
    <div class="docs-example docs-example--stack">
      <EmptyState
        title={fr("Tableau de bord vide", "Empty dashboard")}
        message={fr("Connectez une source de données pour afficher des graphiques.", "Connect a data source to display charts.")}
      >
        <p><Link href="/components/data-table">{fr("Voir la documentation des tables", "See table documentation")}</Link></p>
        {#snippet action()}
          <Button>{fr("Connecter une source", "Connect a source")}</Button>
        {/snippet}
      </EmptyState>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur (.st-empty-state) : surface centrée, texte centré, padding généreux.", "Container (.st-empty-state): centered surface, centered text, generous padding.")}</li>
      <li>{fr("Contenu (.st-empty-state__content) : titre, message optionnel et children.", "Content (.st-empty-state__content): title, optional message, and children.")}</li>
      <li>{fr("Titre (.st-empty-state__title) : énonce l'état, obligatoire.", "Title (.st-empty-state__title): states the situation, required.")}</li>
      <li>{fr("Action (.st-empty-state__action) : zone centrée pour le bouton principal.", "Action (.st-empty-state__action): centered area for the primary button.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Le titre est rendu dans un <h2> : respectez la hiérarchie de titres de la page.", "The title renders in an <h2>: respect the page's heading hierarchy.")}</li>
      <li>{fr("L'action est un vrai bouton ou lien focusable, atteignable au clavier.", "The action is a real focusable button or link, reachable by keyboard.")}</li>
      <li>{fr("Le message explique la cause et la suite, pas seulement « rien ici ».", "The message explains the cause and next step, not just \"nothing here\".")}</li>
      <li>{fr("N'employez pas de tonalité d'erreur : l'état vide est attendu et neutre.", "Do not use an error tone: the empty state is expected and neutral.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Proposer une action principale unique et évidente.", "Offer a single, obvious primary action.")}</li>
          <li>{fr("Expliquer pourquoi la zone est vide.", "Explain why the area is empty.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Multiplier les boutons concurrents.", "Pile up competing buttons.")}</li>
          <li>{fr("Confondre état vide et message d'erreur.", "Conflate the empty state with an error message.")}</li>
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
        <tr><td><code>title</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Titre de l'état vide (h2).", "Empty-state title (h2).")}</td></tr>
        <tr><td><code>message</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Texte explicatif sous le titre.", "Explanatory text under the title.")}</td></tr>
        <tr><td><code>action</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Zone d'action principale.", "Primary action area.")}</td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Contenu libre entre message et action.", "Free content between message and action.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le conteneur.", "Class(es) on the container.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td><td>N/A</td><td>{fr("Propagés sur le <section> conteneur.", "Spread onto the <section> container.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-emptyState-background</code></li>
      <li><code>--st-component-emptyState-border</code></li>
      <li><code>--st-component-emptyState-radius</code></li>
      <li><code>--st-component-emptyState-titleText</code></li>
      <li><code>--st-component-emptyState-messageText</code></li>
    </ul>
  </section>
</div>
