<script lang="ts">
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

  const fr = (frText: string, enText: string) => (locale.value === "fr" ? frText : enText);

  let clicks = $state(0);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr("Composant · Action", "Component · Action")}</p>
    <div class="docs-hero-title">
      <h1>Link</h1>
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </div>
    <p>
      {fr(
        "Lien stylé cohérent avec le DS pour naviguer vers une autre URL. Trois variantes (inline, standalone, muted), prise en charge des liens externes et d'un état désactivé.",
        "Styled link consistent with the DS for navigating to another URL. Three variants (inline, standalone, muted), external-link handling, and a disabled state."
      )}
    </p>
  </section>

  <FrameworkPreview example="link" title="Aperçu live" />

  <section class="docs-section">
    <h2>{fr("Quand l'utiliser", "When to use")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Pour naviguer vers une autre page ou ressource (interne ou externe).", "To navigate to another page or resource (internal or external).")}</li>
      <li>{fr("Pour déclencher une action sur la page courante, utilisez plutôt Button.", "To trigger an action on the current page, use Button instead.")}</li>
      <li>{fr("inline dans un paragraphe ; standalone pour un lien isolé en gras.", "inline within a paragraph; standalone for a standalone, bold link.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Variantes", "Variants")}</h2>
    <div class="docs-example docs-example--stack">
      <h3>inline</h3>
      <p>
        {fr("Lisez la ", "Read the ")}<Link href="#link-demo">{fr("documentation des tokens", "tokens documentation")}</Link>{fr(" pour comprendre le contrat marque blanche.", " to understand the white-label contract.")}
      </p>
      <h3>standalone</h3>
      <Link href="#link-demo" variant="standalone">{fr("Voir tous les composants", "View all components")}</Link>
      <h3>muted</h3>
      <Link href="#link-demo" variant="muted">{fr("Mentions légales", "Legal notice")}</Link>
    </div>
  </section>

  <section class="docs-section" id="link-demo">
    <h2>{t(locale.value, "states")}</h2>
    <div class="docs-example docs-example--stack">
      <h3>{fr("Externe", "External")}</h3>
      <Link href="https://github.com/rhanka/sent-tech-design-system" external variant="standalone">
        {fr("Dépôt GitHub", "GitHub repository")}
      </Link>
      <p class="docs-demo-note">{fr("external pose target=\"_blank\" et rel=\"noreferrer\".", "external sets target=\"_blank\" and rel=\"noreferrer\".")}</p>
      <h3>{fr("Désactivé", "Disabled")}</h3>
      <Link href="#link-demo" disabled>{fr("Lien désactivé", "Disabled link")}</Link>
      <p class="docs-demo-note">{fr("disabled retire le href, pose aria-disabled et bloque le clic.", "disabled removes href, sets aria-disabled, and blocks the click.")}</p>
      <h3>onclick</h3>
      <Link href="#link-demo" onclick={() => (clicks += 1)}>{fr("Lien avec onclick", "Link with onclick")}</Link>
      <p class="docs-demo-note">{fr("Clics", "Clicks")}: <code>{clicks}</code></p>
    </div>
  </section>

  <section class="docs-section">
    <h2>{fr("Anatomie", "Anatomy")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Élément racine : un <a> natif (classe st-link + variante).", "Root element: a native <a> (class st-link + variant).")}</li>
      <li>{fr("inline : souligné, hérite de la taille de texte ; standalone : inline-flex en gras avec gap d'icône.", "inline: underlined, inherits text size; standalone: bold inline-flex with an icon gap.")}</li>
      <li>{fr("L'état disabled retire le href : l'élément n'est plus un lien actif.", "The disabled state removes href: the element is no longer an active link.")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Accessibilité", "Accessibility")}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{fr("Élément <a> natif : navigable au clavier, activable avec Entrée.", "Native <a> element: keyboard-navigable, activated with Enter.")}</li>
      <li>{fr("Focus toujours visible (outline thémé + léger rayon).", "Focus always visible (themed outline + small radius).")}</li>
      <li>{fr("disabled pose aria-disabled=\"true\" et empêche la navigation.", "disabled sets aria-disabled=\"true\" and prevents navigation.")}</li>
      <li>{fr("Le libellé doit décrire la destination : évitez « cliquez ici ».", "The label must describe the destination: avoid \"click here\".")}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{fr("Lignes directrices", "Guidelines")}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{fr("À faire", "Do")}</p>
        <ul>
          <li>{fr("Libellés explicites décrivant la cible.", "Explicit labels describing the target.")}</li>
          <li>{fr("external pour les liens ouvrant un nouvel onglet.", "external for links opening a new tab.")}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{fr("À éviter", "Don't")}</p>
        <ul>
          <li>{fr("Styliser un Button en lien pour une action.", "Style a Button as a link for an action.")}</li>
          <li>{fr("Des libellés vagues (« ici », « lire la suite ») isolés.", "Vague labels (\"here\", \"read more\") in isolation.")}</li>
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
        <tr><td><code>href</code></td><td><code>string</code></td><td><em>{fr("requis", "required")}</em></td><td>{fr("Destination du lien.", "Link destination.")}</td></tr>
        <tr><td><code>variant</code></td><td><code>"inline" | "standalone" | "muted"</code></td><td><code>"inline"</code></td><td>{fr("Style du lien.", "Link style.")}</td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("Désactive le lien (retire href).", "Disables the link (removes href).")}</td></tr>
        <tr><td><code>external</code></td><td><code>boolean</code></td><td><code>false</code></td><td>{fr("Ouvre dans un nouvel onglet (target/rel).", "Opens in a new tab (target/rel).")}</td></tr>
        <tr><td><code>target</code></td><td><code>string</code></td><td><em>{fr("auto", "auto")}</em></td><td>{fr("Cible explicite (sinon dérivée de external).", "Explicit target (otherwise derived from external).")}</td></tr>
        <tr><td><code>rel</code></td><td><code>string</code></td><td><em>{fr("auto", "auto")}</em></td><td>{fr("rel explicite (sinon dérivé de external).", "Explicit rel (otherwise derived from external).")}</td></tr>
        <tr><td><code>onclick</code></td><td><code>(e: MouseEvent) => void</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Bloqué si disabled.", "Blocked when disabled.")}</td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code></td><td><em>{fr("libellé", "label")}</em></td><td>{fr("Contenu du lien.", "Link content.")}</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{fr("optionnel", "optional")}</em></td><td>{fr("Classe(s) supplémentaire(s).", "Additional class(es).")}</td></tr>
        <tr><td>{fr("Autres attributs", "Other attributes")}</td><td><code>HTMLAnchorAttributes</code></td><td>N/A</td><td>{fr("Propagés sur l'<a>.", "Spread onto the <a>.")}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-link-text</code></li>
      <li><code>--st-component-link-hoverText</code></li>
      <li><code>--st-component-link-disabledText</code></li>
      <li><code>--st-component-link-anatomy-typography-textDecoration</code></li>
      <li><code>--st-component-link-anatomy-focus-outline</code></li>
      <li><code>--st-semantic-text-link</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
    </ul>
  </section>
</div>
