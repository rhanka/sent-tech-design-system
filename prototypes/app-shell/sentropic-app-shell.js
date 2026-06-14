// PROTOTYPE go/no-go — Web Component d'app-shell en Shadow DOM.
// But : valider que (1) les tokens --st-* du :root de l'hôte percolent dans le
// Shadow DOM (recoloration par thème sans toucher la structure) et (2) un overlay
// (palette de recherche) rendu via `popover` (top layer) franchit le z-index du
// document ET la frontière shadow. Si les deux passent => Shadow DOM viable
// (WC-first encapsulé). Sinon => même WC en light DOM (dégradation gracieuse).
const TEMPLATE = `
<style>
  :host {
    display: block;
    position: sticky;
    top: 0;
    z-index: 30;
    font-family: var(--st-font-sans, system-ui, sans-serif);
  }
  .bar {
    display: flex;
    align-items: center;
    gap: var(--st-spacing-4, 1rem);
    height: 3.5rem;
    padding: 0 var(--st-spacing-6, 1.5rem);
    background: color-mix(in srgb, var(--st-semantic-surface-default, #ffffff) 96%, transparent);
    border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    color: var(--st-semantic-text-primary, #0f172a);
    backdrop-filter: blur(8px);
  }
  .brand { font-weight: 700; font-size: 1rem; line-height: 1.1; }
  .brand small { display: block; font-weight: 400; font-size: 0.75rem; color: var(--st-semantic-text-secondary, #475569); }
  nav { display: flex; gap: var(--st-spacing-4, 1rem); margin-left: var(--st-spacing-6, 1.5rem); }
  nav a { color: var(--st-semantic-text-secondary, #475569); text-decoration: none; font-size: 0.9375rem; }
  nav a[aria-current="page"] { color: var(--st-semantic-text-primary, #0f172a); font-weight: 650; }
  .spacer { flex: 1; }
  .control {
    height: 2.25rem;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-default, #ffffff);
    color: var(--st-semantic-text-primary, #0f172a);
    font: inherit;
    font-size: 0.875rem;
  }
  /* PALETTE : popover => top layer ; franchit le z-index du document ET le shadow. */
  #palette {
    inset: 0;
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 8vh 1rem 0;
    border: 0;
    background: transparent;
    overflow: hidden;
  }
  #palette::backdrop {
    background: color-mix(in srgb, var(--st-semantic-text-primary, #0f172a) 35%, transparent);
    backdrop-filter: blur(4px);
  }
  #palette .panel {
    max-width: 44rem;
    margin: 0 auto;
    padding: 1rem;
    background: var(--st-semantic-surface-default, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.75rem;
    box-shadow: var(--st-shadow-lg, 0 10px 40px rgba(15, 23, 42, 0.18));
  }
  #palette input {
    width: 100%;
    height: 2.75rem;
    padding: 0 0.75rem;
    font: inherit;
    font-size: 1rem;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    background: var(--st-semantic-surface-default, #ffffff);
    color: var(--st-semantic-text-primary, #0f172a);
    box-sizing: border-box;
  }
</style>
<header class="bar" part="bar">
  <span class="brand">Sentropic<small>app-shell</small></span>
  <nav>
    <a href="#" aria-current="page">Accueil</a>
    <a href="#">Composants</a>
    <a href="#">Thèmes</a>
  </nav>
  <span class="spacer"></span>
  <button class="control" id="search" popovertarget="palette" aria-haspopup="dialog">Rechercher…</button>
  <button class="control" id="theme">Thème</button>
</header>
<div id="palette" popover="auto" role="dialog" aria-label="Recherche">
  <div class="panel">
    <input type="search" placeholder="Rechercher un composant, un guide…" />
  </div>
</div>
`;

class SentropicAppShell extends HTMLElement {
  connectedCallback() {
    if (this._initialised) return;
    this._initialised = true;
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = TEMPLATE;
  }
}

if (!customElements.get("sentropic-app-shell")) {
  customElements.define("sentropic-app-shell", SentropicAppShell);
}
