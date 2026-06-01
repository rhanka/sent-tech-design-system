<script lang="ts">
  import { Badge, Button, Tooltip } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Overlay", "Component · Overlay")}</p>
    <div class="docs-hero-title">
      <h1>Tooltip</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Bulle d'aide contextuelle qui apparaît au survol ou au focus d'un élément. Non interactive et purement informative ; le contenu doit rester court.",
        "Contextual hint bubble shown on hover or focus of an element. Non-interactive and purely informative; content must stay short."
      )}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Expliquer brièvement une icône, un terme ou un contrôle ambigu.", "Briefly explain an icon, a term, or an ambiguous control.")}</li>
      <li>{fr("Pour un contenu cliquable ou persistant, utilisez Toggletip ou Popover.", "For clickable or persistent content, use Toggletip or Popover.")}</li>
      <li>{fr("Ne mettez jamais une information essentielle uniquement dans un tooltip.", "Never put essential information only in a tooltip.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Placement", "Placement")}</h2>
    <p>{fr("Le tooltip s'affiche au-dessus (top, défaut) ou en dessous (bottom) du déclencheur.", "The tooltip appears above (top, default) or below (bottom) the trigger.")}</p>
    <div class="docs-example">
      <Tooltip content={fr("Affiché au-dessus", "Shown above")} placement="top">
        <Button variant="secondary">{fr("Survol haut", "Hover top")}</Button>
      </Tooltip>
      <Tooltip content={fr("Affiché en dessous", "Shown below")} placement="bottom">
        <Button variant="secondary">{fr("Survol bas", "Hover bottom")}</Button>
      </Tooltip>
    </div>
  </section>

  <section class="docs-section" id="tooltip-demo">
    <h2>{fr("Déclencheurs", "Triggers")}</h2>
    <p>{fr("Le tooltip apparaît au survol et au focus du déclencheur (clavier inclus).", "The tooltip appears on hover and on focus of the trigger (keyboard included).")}</p>
    <div class="docs-example">
      <Tooltip content={fr("Synchroniser maintenant", "Sync now")}>
        <Button>{fr("Action", "Action")}</Button>
      </Tooltip>
      <Tooltip content={fr("Aide sur ce champ : tabulez jusqu'ici pour voir la bulle au focus.", "Help on this field: tab here to see the bubble on focus.")}>
        <a href="#tooltip-demo">{fr("Lien focusable", "Focusable link")}</a>
      </Tooltip>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Conteneur (.st-tooltip) : enveloppe inline positionnée en relatif.", "Container (.st-tooltip): inline wrapper, relatively positioned.")}</li>
      <li>{fr("Déclencheur (.st-tooltip__trigger) : l'élément enfant survolé/focusé.", "Trigger (.st-tooltip__trigger): the hovered/focused child element.")}</li>
      <li>{fr("Bulle (.st-tooltip__content, role=\"tooltip\") : surface inversée, max 16 rem de large.", "Bubble (.st-tooltip__content, role=\"tooltip\"): inverse surface, max 16 rem wide.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("La bulle a role=\"tooltip\".", "The bubble has role=\"tooltip\".")}</li>
      <li>{fr("Elle apparaît au :hover ET au :focus-within : accessible au clavier si le déclencheur est focusable.", "It appears on :hover AND :focus-within: keyboard-accessible when the trigger is focusable.")}</li>
      <li>{fr("Placez un élément focusable (bouton, lien) comme enfant pour la rendre atteignable sans souris.", "Place a focusable element (button, link) as the child to reach it without a mouse.")}</li>
      <li>{fr("Pour relier explicitement le tooltip au déclencheur, ajoutez aria-describedby côté déclencheur.", "To explicitly link the tooltip to the trigger, add aria-describedby on the trigger.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Texte court, une phrase au maximum.", "Short text, one sentence at most.")}</li>
          <li>{fr("Attacher le tooltip à un élément focusable.", "Attach the tooltip to a focusable element.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Mettre des liens ou boutons dans la bulle (non interactive).", "Put links or buttons inside the bubble (non-interactive).")}</li>
          <li>{fr("Y cacher une instruction indispensable à la tâche.", "Hide an instruction essential to the task.")}</li>
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
        <tr><td><code>content</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Texte de la bulle.", "Bubble text.")}</td></tr>
        <tr><td><code>placement</code></td><td><code>"top" | "bottom"</code></td><td><code>"top"</code></td><td>{fr("Position de la bulle par rapport au déclencheur.", "Bubble position relative to the trigger.")}</td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{fr("déclencheur", "trigger")}</em></td><td>{fr("L'élément qui déclenche le tooltip.", "The element that triggers the tooltip.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) sur le conteneur.", "Class(es) on the container.")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAttributes&lt;HTMLSpanElement&gt;</code></td><td>N/A</td><td>{fr("Propagés sur le <span> conteneur.", "Spread onto the container <span>.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-tooltip-background</code></li>
      <li><code>--st-component-tooltip-text</code></li>
      <li><code>--st-component-tooltip-radius</code></li>
      <li><code>--st-component-tooltip-shadow</code></li>
      <li><code>--st-component-tooltip-zIndex</code></li>
    </ul>
  </section>
</div>
