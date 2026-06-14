// PROTOTYPE — Web Component d'app-shell, piloté par `siteConfig` (voir site-config.ts).
// Shadow DOM (CSS encapsulé byte-unique) + tokens --st-* hérités du :root hôte
// (recoloration par thème, structure invariante). Recherche/framework/thème/langue/
// identité sont first-class. Contrôlé : émet des callbacks / suit des href, n'applique rien.
//
// Config : via propriété DOM `el.config = {...}` (préférée, supporte les callbacks) ou
// attribut `config='<json>'`. Tolérant : clés inconnues ignorées, défauts pour absentes.

const STYLE = `
  :host { display:block; position:sticky; top:0; z-index:30; font-family: var(--st-font-sans, system-ui, sans-serif); }
  *, *::before, *::after { box-sizing: border-box; }
  .bar { display:flex; align-items:center; gap: var(--st-spacing-4, 1rem); height:3.5rem;
    padding:0 var(--st-spacing-6, 1.5rem);
    background: color-mix(in srgb, var(--st-semantic-surface-default, #fff) 96%, transparent);
    border-bottom:1px solid var(--st-semantic-border-subtle, #e2e8f0);
    color: var(--st-semantic-text-primary, #0f172a); backdrop-filter: blur(8px); }
  .brand { display:inline-flex; align-items:center; gap:.5rem; text-decoration:none; color:inherit; flex:0 0 auto; }
  .brand img { width:1.75rem; height:1.75rem; }
  .brand .copy { display:flex; flex-direction:column; line-height:1.1; }
  .brand .name { font-weight:700; font-size:1rem; }
  .brand .product { font-weight:400; font-size:.75rem; color: var(--st-semantic-text-secondary, #475569); }
  nav.main { display:flex; gap: var(--st-spacing-4, 1rem); margin-left: var(--st-spacing-6, 1.5rem); }
  nav.main a { color: var(--st-semantic-text-secondary, #475569); text-decoration:none; font-size:.9375rem; padding:.25rem 0; }
  nav.main a[aria-current="page"] { color: var(--st-semantic-text-primary, #0f172a); font-weight:650; }
  .spacer { flex:1; }
  .actions { display:flex; align-items:center; gap:.5rem; }
  .control { height:2.25rem; display:inline-flex; align-items:center; gap:.375rem; padding:0 .75rem;
    border-radius:.5rem; cursor:pointer; font:inherit; font-size:.875rem;
    border:1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-default, #fff); color: var(--st-semantic-text-primary, #0f172a); }
  .control.icon { width:2.25rem; padding:0; justify-content:center; }
  .menuWrap { position:relative; }
  .menu { position:absolute; top:calc(100% + .25rem); right:0; min-width:11rem; padding:.25rem;
    background: var(--st-semantic-surface-default, #fff); border:1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius:.5rem; box-shadow: var(--st-shadow-lg, 0 10px 40px rgba(15,23,42,.18)); z-index:1; }
  .menu button { display:flex; width:100%; gap:.5rem; align-items:center; padding:.4rem .5rem; border:0;
    background:transparent; color:inherit; font:inherit; font-size:.875rem; cursor:pointer; border-radius:.375rem; text-align:left; }
  .menu button:hover { background: color-mix(in srgb, var(--st-semantic-text-primary,#0f172a) 6%, transparent); }
  .check { width:1rem; }
  #palette { inset:0; width:100vw; height:100vh; max-width:none; max-height:none; margin:0; padding:8vh 1rem 0;
    border:0; background:transparent; overflow:hidden; }
  #palette::backdrop { background: color-mix(in srgb, var(--st-semantic-text-primary, #0f172a) 35%, transparent); backdrop-filter: blur(4px); }
  #palette .panel { max-width:44rem; margin:0 auto; padding:1rem; background: var(--st-semantic-surface-default, #fff);
    border:1px solid var(--st-semantic-border-subtle, #e2e8f0); border-radius:.75rem;
    box-shadow: var(--st-shadow-lg, 0 10px 40px rgba(15,23,42,.18)); }
  #palette input { width:100%; height:2.75rem; padding:0 .75rem; font:inherit; font-size:1rem;
    border:1px solid var(--st-semantic-border-subtle, #e2e8f0); border-radius:.5rem;
    background: var(--st-semantic-surface-default, #fff); color: var(--st-semantic-text-primary, #0f172a); }
`;

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

class SentropicAppShell extends HTMLElement {
  static get observedAttributes() { return ["config"]; }

  set config(value) { this._config = value || {}; this._render(); }
  get config() { return this._config || {}; }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    if (!this._config) {
      const attr = this.getAttribute("config");
      if (attr) { try { this._config = JSON.parse(attr); } catch { this._config = {}; } }
    }
    this._render();
  }
  attributeChangedCallback(name, _old, val) {
    if (name === "config" && val && !this._config) {
      try { this._config = JSON.parse(val); this._render(); } catch { /* ignore */ }
    }
  }

  _render() {
    if (!this.shadowRoot) return;
    const c = this._config || {};
    const brand = c.brand || { name: "Sentropic" };
    const nav = Array.isArray(c.nav) ? c.nav : [];
    const t = c.theming || { themes: [], theme: "" };
    const fw = c.frameworkSwitcher;
    const loc = c.locale;
    const search = c.search;
    const identity = c.identity;

    const isActive = (item) => item.active != null ? item.active
      : (c.activePath != null && (item.href === c.activePath || (item.href !== "/" && c.activePath.startsWith(item.href))));

    const navHtml = nav.map((i) => `<a href="${esc(i.href)}"${isActive(i) ? ' aria-current="page"' : ""}>${esc(i.label)}</a>`).join("");
    const activeTheme = (t.themes || []).find((o) => o.id === t.theme) || (t.themes || [])[0];

    // Ordre de référence : recherche · framework · thème · mode couleur · langue · identité
    const searchHtml = search && search.enabled
      ? `<button class="control" id="search" popovertarget="palette" aria-haspopup="dialog">🔍 <span>${esc(search.placeholder || "Rechercher…")}</span></button>` : "";
    const fwHtml = fw && fw.enabled
      ? `<div class="menuWrap"><button class="control" data-menu="fw" aria-haspopup="true">⬡ <span>${esc((fw.available.find((o) => o.id === fw.current) || {}).label || fw.current)}</span> ▾</button></div>` : "";
    const themeHtml = (t.themes && t.themes.length)
      ? `<div class="menuWrap"><button class="control" data-menu="theme" aria-haspopup="true">◧ <span>${esc(activeTheme ? activeTheme.label : "")}</span> ▾</button></div>` : "";
    const cmHtml = t.colorMode
      ? `<button class="control icon" data-action="colormode" aria-label="Mode couleur">${t.colorMode === "dark" ? "🌙" : "☀"}</button>` : "";
    const locHtml = loc
      ? `<div class="menuWrap"><button class="control" data-menu="locale" aria-haspopup="true">🌐 <span>${esc((loc.current || "").toUpperCase())}</span> ▾</button></div>` : "";
    const idHtml = identity
      ? (identity.state === "authenticated"
          ? `<button class="control icon" data-action="identity" aria-label="${esc(identity.label || "Compte")}">●</button>`
          : `<button class="control icon" data-action="signin" aria-label="${esc(identity.label || "Se connecter")}">☻</button>`)
      : "";

    this.shadowRoot.innerHTML = `<style>${STYLE}</style>
      <header class="bar" part="bar">
        <a class="brand" href="${esc(brand.href || "/")}" aria-label="${esc(brand.label || [brand.name, brand.productName].filter(Boolean).join(" "))}">
          ${brand.logoSrc ? `<img src="${esc(brand.logoSrc)}" alt="" aria-hidden="true" />` : ""}
          <span class="copy">${brand.name ? `<span class="name">${esc(brand.name)}</span>` : ""}${brand.productName ? `<span class="product">${esc(brand.productName)}</span>` : ""}</span>
        </a>
        ${navHtml ? `<nav class="main" aria-label="${esc(c.navLabel || "Navigation")}">${navHtml}</nav>` : ""}
        <span class="spacer"></span>
        <div class="actions">${searchHtml}${fwHtml}${themeHtml}${cmHtml}${locHtml}${idHtml}</div>
      </header>
      <div id="palette" popover="auto" role="dialog" aria-label="${esc((search && search.placeholder) || "Recherche")}">
        <div class="panel"><input type="search" placeholder="${esc((search && search.placeholder) || "Rechercher…")}" /></div>
      </div>`;

    this._wire();
  }

  _wire() {
    const root = this.shadowRoot, c = this._config || {};
    // dropdowns (thème / framework / langue) — légers, dans le shadow
    root.querySelectorAll("[data-menu]").forEach((btn) => {
      btn.addEventListener("click", (e) => { e.stopPropagation(); this._toggleMenu(btn.dataset.menu); });
    });
    root.addEventListener("click", (e) => { if (!e.target.closest("[data-menu]") && !e.target.closest(".menu")) this._closeMenus(); });
    // colormode
    const cm = root.querySelector('[data-action="colormode"]');
    if (cm) cm.addEventListener("click", () => {
      const cur = c.theming?.colorMode, next = cur === "light" ? "dark" : cur === "dark" ? "auto" : "light";
      c.theming?.onColorModeChange?.(next);
    });
    // identity
    const si = root.querySelector('[data-action="signin"]');
    if (si) si.addEventListener("click", () => { c.identity?.onSignIn ? c.identity.onSignIn() : (c.identity?.signInHref && (location.href = c.identity.signInHref)); });
    // search submit
    const input = root.querySelector("#palette input");
    if (input) input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = input.value.trim(); if (!q) return;
        if (c.search?.mode === "navigate" && c.search.hrefTemplate) location.href = c.search.hrefTemplate.replace("{q}", encodeURIComponent(q));
        else c.search?.onSearch?.(q);
      }
    });
  }

  _toggleMenu(kind) {
    const root = this.shadowRoot, c = this._config || {};
    const open = root.querySelector(".menu");
    this._closeMenus();
    if (open && open.dataset.kind === kind) return;
    const wrap = root.querySelector(`[data-menu="${kind}"]`)?.closest(".menuWrap");
    if (!wrap) return;
    let items = [], current = "", onPick = () => {};
    if (kind === "theme") { items = (c.theming?.themes || []).map((o) => ({ id: o.id, label: o.label })); current = c.theming?.theme; onPick = (id) => c.theming?.onThemeChange?.(id); }
    if (kind === "fw") { items = (c.frameworkSwitcher?.available || []); current = c.frameworkSwitcher?.current; onPick = (id) => c.frameworkSwitcher?.onChange?.(id); }
    if (kind === "locale") { items = (c.locale?.available || []).map((o) => ({ id: o.code, label: o.label })); current = c.locale?.current; onPick = (id) => c.locale?.onChange?.(id); }
    const menu = document.createElement("div");
    menu.className = "menu"; menu.dataset.kind = kind; menu.setAttribute("role", "menu");
    menu.innerHTML = items.map((o) => `<button role="menuitem" data-id="${esc(o.id)}"><span class="check">${o.id === current ? "✓" : ""}</span><span>${esc(o.label)}</span></button>`).join("");
    menu.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { onPick(b.dataset.id); this._closeMenus(); }));
    wrap.appendChild(menu);
  }
  _closeMenus() { this.shadowRoot?.querySelectorAll(".menu").forEach((m) => m.remove()); }
}

if (!customElements.get("sentropic-app-shell")) customElements.define("sentropic-app-shell", SentropicAppShell);
