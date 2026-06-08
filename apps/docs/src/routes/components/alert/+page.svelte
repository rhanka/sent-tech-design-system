<script lang="ts">
  import { Badge } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";
  import FrameworkDemo from "$lib/framework/FrameworkDemo.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  // Démos décrites en arbre NodeSpec neutre -> rendues dans le framework actif
  // (toute la page bascule, pas seulement le bloc Aperçu live).
  const tonesDemo: NodeSpec[] = $derived([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        { comp: "Alert", props: { tone: "info", title: "Info", message: fr("Une synchronisation est planifiée pour ce soir.", "A sync is scheduled for tonight.") } },
        { comp: "Alert", props: { tone: "success", title: fr("Succès", "Success"), message: fr("Les modifications ont été enregistrées.", "Your changes were saved.") } },
        { comp: "Alert", props: { tone: "warning", title: fr("Avertissement", "Warning"), message: fr("Votre quota approche de la limite.", "Your quota is nearing the limit.") } },
        { comp: "Alert", props: { tone: "error", title: fr("Erreur", "Error"), message: fr("Impossible de contacter le serveur.", "Could not reach the server.") } }
      ]
    }
  ]);
  // La zone actions (Snippet) n'est pas exprimable en NodeSpec neutre : on rend
  // le bouton d'action via children (sous le message), équivalent visuel proche.
  const actionsDemo: NodeSpec[] = $derived([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [
        {
          comp: "Alert",
          props: {
            tone: "error",
            title: fr("Échec du déploiement", "Deployment failed"),
            message: fr("La build a échoué à l'étape de tests.", "The build failed at the test step.")
          },
          children: [{ comp: "Button", props: { size: "sm", variant: "secondary" }, children: [fr("Réessayer", "Retry")] }]
        }
      ]
    }
  ]);
  const titleOnlyDemo: NodeSpec[] = $derived([
    {
      el: "div",
      props: { class: "docs-demo-stack" },
      children: [{ comp: "Alert", props: { tone: "success", title: fr("Connexion réussie.", "Signed in successfully.") } }]
    }
  ]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Feedback", "Component · Feedback")}</p>
    <div class="docs-hero-title">
      <h1>Alert</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Bandeau d'information persistant lié au contexte de la page : info, succès, avertissement ou erreur. Titre obligatoire, message optionnel, et zone d'actions optionnelle.",
        "Persistent in-context message banner: info, success, warning, or error. Mandatory title, optional message, and an optional actions slot."
      )}
    </p>
  </section>

  <FrameworkPreview example="alert" title="Aperçu live" />

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Communiquer un état persistant dans le flux de la page (résultat, avertissement, blocage).", "Communicate a persistent state in the page flow (result, warning, blocker).")}</li>
      <li>{fr("Pour une notification éphémère, utilisez Toast ; pour une info au survol, Tooltip.", "For an ephemeral notification use Toast; for hover info, Tooltip.")}</li>
      <li>{fr("Choisissez la tonalité selon la gravité : info < success < warning < error.", "Choose tone by severity: info < success < warning < error.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Tonalités", "Tones")}</h2>
    <p>{fr("Quatre tonalités, marquées par un filet coloré à gauche.", "Four tones, marked by a colored left rule.")}</p>
    <FrameworkDemo nodes={tonesDemo} label={fr("Tonalités", "Tones")} />
  </section>

  <section class="docs-section">
    <h2>{fr("Avec actions", "With actions")}</h2>
    <p>{fr("La zone actions (snippet) accueille des boutons à droite du message.", "The actions slot (snippet) hosts buttons to the right of the message.")}</p>
    <FrameworkDemo nodes={actionsDemo} label={fr("Avec actions", "With actions")} />
    <p class="docs-demo-note">
      {fr(
        "La zone actions est un Snippet dédié (à droite du message). Cette démo neutre rend le bouton via children pour rester identique dans les trois frameworks ; en usage réel, passez-le à la prop actions.",
        "The actions area is a dedicated Snippet (to the right of the message). This neutral demo renders the button via children to stay identical across the three frameworks; in real usage, pass it to the actions prop."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Titre seul", "Title only")}</h2>
    <p>{fr("Le message est optionnel : un titre suffit pour une alerte courte.", "The message is optional: a title alone works for a short alert.")}</p>
    <FrameworkDemo nodes={titleOnlyDemo} label={fr("Titre seul", "Title only")} />
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur (.st-alert) : <section> avec un filet de tonalité à gauche.", "Container (.st-alert): a <section> with a tone rule on the left.")}</li>
      <li>{fr("Contenu : titre (<h2>) + message optionnel + children éventuels.", "Content: title (<h2>) + optional message + optional children.")}</li>
      <li>{fr("Actions (.st-alert__actions) : zone optionnelle à droite.", "Actions (.st-alert__actions): optional slot on the right.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Le rôle est automatique : role=\"alert\" pour warning/error (annonce immédiate), role=\"status\" pour info/success (annonce polie).", "Role is automatic: role=\"alert\" for warning/error (assertive), role=\"status\" for info/success (polite).")}</li>
      <li>{fr("La couleur n'est jamais le seul indice : le titre porte le sens.", "Color is never the only cue: the title carries meaning.")}</li>
      <li>{fr("Le contraste du filet et du texte suit les tokens feedback.", "Rule and text contrast follow the feedback tokens.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Titre concis qui résume l'état.", "Concise title summarizing the state.")}</li>
          <li>{fr("Message qui indique la cause et l'action possible.", "Message stating the cause and a possible action.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Empiler de nombreuses alertes simultanées.", "Stack many simultaneous alerts.")}</li>
          <li>{fr("Utiliser error pour un simple avertissement.", "Use error for a mere warning.")}</li>
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
        <tr><td><code>tone</code></td><td><code>"info" | "success" | "warning" | "error"</code></td><td><code>"info"</code></td><td>{fr("Tonalité ; détermine aussi le rôle ARIA.", "Tone; also determines the ARIA role.")}</td></tr>
        <tr><td><code>title</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Titre de l'alerte.", "Alert title.")}</td></tr>
        <tr><td><code>message</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Texte secondaire sous le titre.", "Secondary text below the title.")}</td></tr>
        <tr><td><code>actions</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Boutons d'action à droite.", "Action buttons on the right.")}</td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Contenu additionnel sous le message.", "Extra content below the message.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) supplémentaire(s).", "Additional class(es).")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td><td>N/A</td><td>{fr("Propagés sur la <section>.", "Spread onto the <section>.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-alert-background</code></li>
      <li><code>--st-component-alert-border</code></li>
      <li><code>--st-component-alert-text</code></li>
      <li><code>--st-component-alert-infoBorder</code></li>
      <li><code>--st-component-alert-successBorder</code></li>
      <li><code>--st-component-alert-warningBorder</code></li>
      <li><code>--st-component-alert-errorBorder</code></li>
    </ul>
  </section>
</div>
