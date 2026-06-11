<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import { Badge, ErrorSummary } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  const sampleErrors = $derived([
    { href: "#nom", text: fr("Saisissez votre nom", "Enter your name") },
    { href: "#courriel", text: fr("Courriel invalide", "Invalid email") },
    { href: "#date", text: fr("La date doit être dans le futur", "The date must be in the future") }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Feedback", "Component · Feedback")}</p>
    <div class="docs-hero-title">
      <h1>ErrorSummary</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Bloc récapitulatif placé en haut d'un formulaire après un envoi échoué : il liste toutes les erreurs, chaque entrée étant un lien vers le champ fautif. Inspiré du composant « Error summary » du système de design du gouvernement du Canada (GCDS).",
        "Summary block placed at the top of a form after a failed submission: it lists every error, each entry linking to the offending field. Modeled on the Government of Canada Design System (GCDS) « Error summary » component."
      )}
    </p>
  </section>

  <TabbedExample nodes={getExample("errorsummary")?.nodes ?? []} />

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Après la soumission d'un formulaire comportant une ou plusieurs erreurs de validation.", "After submitting a form that has one or more validation errors.")}</li>
      <li>{fr("Pour les formulaires longs : un point d'entrée unique vers chaque champ à corriger.", "For long forms: a single entry point to each field that needs fixing.")}</li>
      <li>{fr("Conjointement aux messages d'erreur en ligne sur chaque champ (Error message).", "Together with the inline per-field error messages (Error message).")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand ne pas l'utiliser", "When not to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour une seule erreur ponctuelle : un message en ligne sur le champ suffit.", "For a single, isolated error: an inline message on the field is enough.")}</li>
      <li>{fr("Pour une notification système (succès, info) : utilisez Alert ou Notification.", "For a system notification (success, info): use Alert or Notification.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Exemple", "Example")}</h2>
    <p>{fr("Le récapitulatif prend le focus à l'affichage pour annoncer le problème aux lecteurs d'écran.", "The summary takes focus when shown to announce the problem to screen readers.")}</p>
    <div class="docs-example docs-example--stack">
      <ErrorSummary heading={fr("Il y a un problème", "There is a problem")} errors={sampleErrors} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur (.st-error-summary) : bordure d'erreur, role=alert, focusable (tabindex=-1).", "Container (.st-error-summary): error border, role=alert, focusable (tabindex=-1).")}</li>
      <li>{fr("Titre (.st-error-summary__heading) : énonce qu'un problème bloque l'envoi.", "Heading (.st-error-summary__heading): states that a problem blocks submission.")}</li>
      <li>{fr("Liste (.st-error-summary__list) : un lien par erreur vers le champ concerné.", "List (.st-error-summary__list): one link per error to the related field.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("role=alert annonce le récapitulatif dès son apparition.", "role=alert announces the summary as soon as it appears.")}</li>
      <li>{fr("tabindex=-1 permet de déplacer le focus sur le bloc après l'envoi.", "tabindex=-1 lets you move focus to the block after submission.")}</li>
      <li>{fr("Chaque lien cible l'ancre du champ (href=\"#id\") pour y amener l'utilisateur.", "Each link targets the field anchor (href=\"#id\") to bring the user there.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Reprendre le texte exact des erreurs en ligne.", "Reuse the exact wording of the inline errors.")}</li>
          <li>{fr("Placer le récapitulatif en haut du formulaire.", "Place the summary at the top of the form.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Afficher un récapitulatif vide.", "Show an empty summary.")}</li>
          <li>{fr("Omettre les messages d'erreur en ligne sur les champs.", "Drop the inline per-field error messages.")}</li>
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
        <tr><td><code>heading</code></td><td><code>string</code></td><td><code>"There was a problem"</code></td><td>{fr("Titre du récapitulatif (h2).", "Summary heading (h2).")}</td></tr>
        <tr><td><code>errors</code></td><td><code>{`{ href: string; text: string }[]`}</code></td><td><code>[]</code></td><td>{fr("Erreurs listées, chaque entrée reliée à un champ.", "Listed errors, each entry linked to a field.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le conteneur.", "Class(es) on the container.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td><td>N/A</td><td>{fr("Propagés sur le <section> conteneur.", "Spread onto the <section> container.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-semantic-feedback-error</code></li>
      <li><code>--st-semantic-surface-default</code></li>
      <li><code>--st-semantic-text-primary</code></li>
    </ul>
  </section>
</div>
