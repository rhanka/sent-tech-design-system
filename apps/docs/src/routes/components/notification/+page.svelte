<script lang="ts">
  import { getExample } from "$lib/framework/examples";
  import TriRender from "$lib/framework/TriRender.svelte";
  import { Badge, Button, Notification } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  const dismissAction = () => {
    // Host application handles removing the notification from DOM.
  };
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Feedback", "Component · Feedback")}</p>
    <div class="docs-hero-title">
      <h1>Notification</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Message inline persistant avec tonalité, titre obligatoire, message optionnel et zone d’actions/actionnable, destiné à la zone courante de l’interface.",
        "Persistent inline message with tone, required title, optional message, and optional action slot, suitable for current-page context."
      )}
    </p>
  </section>
  <TriRender nodes={getExample("notification")?.nodes ?? []} label="Aperçu live" />


  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Informer l’utilisateur sans interrompre, avec éventuellement une action immédiate.", "Inform the user without interruption, with optional immediate action.")}</li>
      <li>{fr("Préférer cette forme à Toast pour un message qui reste visible tant que le contexte n’est pas résolu.", "Prefer this form over Toast when the message should remain visible until context is resolved.")}</li>
      <li>{fr("Idéale pour annuler, réessayer, ouvrir un détail, ou rappeler une étape restante.", "Good for undo, retry, opening details, or reminding remaining steps.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Tonalités", "Tones")}</h2>
    <div class="docs-example docs-example--stack">
      <Notification tone="info" title={fr("Info", "Info")} message={fr("Une version mineure a été publiée.", "A minor release was published.")} />
      <Notification tone="success" title={fr("Sauvegardé", "Saved")} message={fr("Les modifications ont été prises en compte.", "Your changes were applied.")} />
      <Notification tone="warning" title={fr("Attention", "Warning")} message={fr("Le quota approche des limites.", "Quota is nearing limits.")} />
      <Notification tone="error" title={fr("Échec", "Error")} message={fr("Le chargement a échoué.", "Loading failed.")} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Avec actions", "With actions")}</h2>
    <p>{fr("Le slot `actions` aligne des boutons à droite du message.", "The `actions` slot aligns action buttons on the right of the message.")}</p>
    <div class="docs-example docs-example--stack">
      <Notification
        tone="warning"
        title={fr("Session incomplète", "Incomplete session")}
        message={fr("Vous avez des changements non validés.", "You have unsaved changes.")}
      >
        {#snippet actions()}
          <Button variant="ghost">{fr("Réessayer", "Retry")}</Button>
        {/snippet}
      </Notification>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Avec fermeture", "With dismiss")}</h2>
    <p>{fr("La fermeture est contrôlée par le parent via `onDismiss`.", "Dismiss is controlled by parent logic via `onDismiss`.")}</p>
    <div class="docs-example docs-example--stack">
      <Notification
        tone="error"
        title={fr("Connexion perdue", "Connection lost")}
        message={fr("Essayez une nouvelle synchronisation.", "Try a fresh sync.")}
        dismissible
        onDismiss={dismissAction}
      />
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur `.st-notification` : accent couleur par tonalité et rôle ARIA associé.", "Container `.st-notification`: tone accent and matching ARIA role.")}</li>
      <li>{fr("Contenu `.st-notification__content` : titre + message + enfants additionnels.", "Content `.st-notification__content`: title, message, and optional children.")}</li>
      <li>{fr("Panneau `.st-notification__meta` : actions + fermeture.", "Panel `.st-notification__meta`: actions and optional dismiss control.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Rôle ARIA : `alert` pour error, `status` sinon.", "ARIA role: `alert` for error, `status` otherwise.")}</li>
      <li>{fr("Le libellé de fermeture doit rester localisable via `dismissLabel`.", "Dismiss label should remain localized via `dismissLabel`.")}</li>
      <li>{fr("La couleur n’est pas le seul indice : le titre doit exprimer le résultat.", "Color is never the only cue: title should carry the result.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>{fr("Défaut", "Default")}</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>tone</code></td><td><code>"info" | "success" | "warning" | "error"</code></td><td><code>"info"</code></td><td>{fr("Tonalité sémantique.", "Semantic tone.")}</td></tr>
        <tr><td><code>title</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Titre obligatoire de la notification.", "Required notification title.")}</td></tr>
        <tr><td><code>message</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Texte secondaire optionnel.", "Optional secondary text.")}</td></tr>
        <tr><td><code>actions</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Zone d’actions à droite.", "Right-side action area.")}</td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Contenu additionnel sous le message.", "Additional content below message text.")}</td></tr>
        <tr><td><code>dismissible</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("Affiche le bouton fermer (uniquement si `onDismiss` est défini).", "Shows dismiss button only when `onDismiss` is provided.")}</td></tr>
        <tr><td><code>dismissLabel</code></td><td><code>string</code></td><td><code>"Dismiss"</code></td><td>{fr("Libellé accessible du bouton fermer.", "Accessible label for dismiss button.")}</td></tr>
        <tr><td><code>onDismiss</code></td><td><code>() => void</code></td><td>N/A</td><td>{fr("Callback au clic du bouton fermer.", "Callback invoked when dismiss button is clicked.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-notification-background</code></li>
      <li><code>--st-component-notification-border</code></li>
      <li><code>--st-component-notification-text</code></li>
      <li><code>--st-component-notification-accentWidth</code></li>
      <li><code>--st-component-notification-infoAccent</code></li>
      <li><code>--st-component-notification-successAccent</code></li>
      <li><code>--st-component-notification-warningAccent</code></li>
      <li><code>--st-component-notification-errorAccent</code></li>
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>
</div>
