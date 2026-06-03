<script lang="ts">
  import { Badge, Button, Toast } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Feedback", "Component · Feedback")}</p>
    <div class="docs-hero-title">
      <h1>Toast</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Notification éphémère qui confirme le résultat d'une action sans interrompre la tâche en cours. Brève, non bloquante, elle s'efface seule ; l'application hôte gère l'apparition, la pile et la durée.",
        "Ephemeral notification that confirms the outcome of an action without interrupting the current task. Brief and non-blocking, it dismisses itself; the host application owns appearance, stacking, and timing."
      )}
    </p>
  </section>
  <FrameworkPreview example="toast" title="Aperçu live" />


  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Confirmer le succès ou l'échec d'une action ponctuelle (enregistrement, envoi, compilation).", "Confirm the success or failure of a discrete action (save, send, compile).")}</li>
      <li>{fr("Donner un retour court qui ne requiert pas de décision immédiate.", "Provide short feedback that needs no immediate decision.")}</li>
      <li>{fr("Pour un message persistant qui reste à l'écran, utilisez Alert.", "For a persistent message that stays on screen, use Alert.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand ne pas l'utiliser", "When not to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour une erreur bloquante exigeant une action : utilisez Modal ou Alert dans le flux.", "For a blocking error requiring action: use Modal or an inline Alert.")}</li>
      <li>{fr("Pour une information de fond contextuelle et durable : utilisez Alert.", "For durable, contextual background information: use Alert.")}</li>
      <li>{fr("Ne cachez jamais une information critique uniquement dans un toast éphémère.", "Never hide critical information solely in an ephemeral toast.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Tonalités", "Tones")}</h2>
    <p>{fr("Quatre tonalités sémantiques ; le filet de gauche en prend la couleur.", "Four semantic tones; the left rule takes their color.")}</p>
    <div class="docs-example docs-example--stack">
      <Toast tone="info" title={fr("Synchronisation lancée", "Sync started")} message={fr("La synchronisation du tenant est en cours.", "The tenant sync is running.")} />
      <Toast tone="success" title={fr("Enregistré", "Saved")} message={fr("Le thème du tenant a été compilé.", "The tenant theme was compiled.")} />
      <Toast tone="warning" title={fr("Quota proche", "Quota near limit")} message={fr("Il reste 10 % de l'espace alloué.", "10% of allotted space remains.")} />
      <Toast tone="error" title={fr("Échec", "Failed")} message={fr("Le mappage de l'adaptateur est incomplet.", "The adapter mapping is incomplete.")} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Avec actions", "With actions")}</h2>
    <p>{fr("Le snippet actions accueille un bouton court (annuler, réessayer) aligné à droite.", "The actions snippet hosts a short button (undo, retry) right-aligned.")}</p>
    <div class="docs-example docs-example--stack">
      <Toast tone="success" title={fr("Élément supprimé", "Item deleted")} message={fr("L'élément a été retiré de la liste.", "The item was removed from the list.")}>
        {#snippet actions()}
          <Button variant="ghost">{fr("Annuler", "Undo")}</Button>
        {/snippet}
      </Toast>
      <Toast tone="error" title={fr("Envoi échoué", "Send failed")} message={fr("La connexion a été interrompue.", "The connection was interrupted.")}>
        {#snippet actions()}
          <Button variant="ghost">{fr("Réessayer", "Retry")}</Button>
        {/snippet}
      </Toast>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Titre seul", "Title only")}</h2>
    <p>{fr("Le message est optionnel : un titre seul suffit pour une confirmation minimale.", "The message is optional: a title alone suffices for a minimal confirmation.")}</p>
    <div class="docs-example docs-example--stack">
      <Toast tone="success" title={fr("Copié dans le presse-papier", "Copied to clipboard")} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur (.st-toast, .st-toast--<tone>) : surface avec filet de gauche coloré de 0,25 rem.", "Container (.st-toast, .st-toast--<tone>): surface with a 0.25 rem colored left rule.")}</li>
      <li>{fr("Contenu (.st-toast__content) : titre et message optionnel empilés.", "Content (.st-toast__content): title and optional message stacked.")}</li>
      <li>{fr("Titre (.st-toast__title) : libellé court, obligatoire.", "Title (.st-toast__title): short label, required.")}</li>
      <li>{fr("Actions (.st-toast__actions) : zone optionnelle alignée à droite.", "Actions (.st-toast__actions): optional area right-aligned.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Les tonalités info/success/warning utilisent role=\"status\" (annonce polie).", "Info/success/warning tones use role=\"status\" (polite announcement).")}</li>
      <li>{fr("La tonalité error utilise role=\"alert\" (annonce assertive immédiate).", "The error tone uses role=\"alert\" (immediate assertive announcement).")}</li>
      <li>{fr("L'application hôte doit garantir une durée d'affichage suffisante avant la disparition.", "The host application must ensure a long enough display time before dismissal.")}</li>
      <li>{fr("La couleur du filet ne porte pas seule le sens : le titre énonce le résultat.", "The rule color does not carry meaning alone: the title states the outcome.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Énoncer le résultat dans le titre, en une phrase.", "State the outcome in the title, in one sentence.")}</li>
          <li>{fr("Réserver error à un échec réel et actionnable.", "Reserve error for a real, actionable failure.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Empiler de longs paragraphes : le toast doit rester bref.", "Stack long paragraphs: the toast must stay brief.")}</li>
          <li>{fr("Y placer la seule trace d'une information critique.", "Make it the only record of critical information.")}</li>
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
        <tr><td><code>tone</code></td><td><code>"info" | "success" | "warning" | "error"</code></td><td><code>"info"</code></td><td>{fr("Tonalité sémantique ; pilote la couleur du filet et le rôle ARIA.", "Semantic tone; drives the rule color and the ARIA role.")}</td></tr>
        <tr><td><code>title</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Libellé principal.", "Primary label.")}</td></tr>
        <tr><td><code>message</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Texte secondaire sous le titre.", "Secondary text under the title.")}</td></tr>
        <tr><td><code>actions</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Zone d'actions à droite.", "Right-aligned actions area.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le conteneur.", "Class(es) on the container.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td><td>N/A</td><td>{fr("Propagés sur le <section> conteneur.", "Spread onto the <section> container.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-toast-background</code></li>
      <li><code>--st-component-toast-border</code></li>
      <li><code>--st-component-toast-text</code></li>
      <li><code>--st-component-toast-shadow</code></li>
      <li><code>--st-component-toast-zIndex</code></li>
      <li><code>--st-component-toast-infoBorder</code></li>
      <li><code>--st-component-toast-successBorder</code></li>
      <li><code>--st-component-toast-warningBorder</code></li>
      <li><code>--st-component-toast-errorBorder</code></li>
    </ul>
  </section>
</div>
