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
  .bar { display:flex; align-items:center; gap: var(--st-spacing-4, 1rem); height:5rem;
    padding:0 var(--st-spacing-6, 1.5rem);
    background: color-mix(in srgb, var(--st-semantic-surface-default, #fff) 96%, transparent);
    border-bottom:1px solid var(--st-semantic-border-subtle, #e2e8f0);
    color: var(--st-semantic-text-primary, #0f172a); backdrop-filter: blur(8px); }
  .brand { display:inline-flex; align-items:center; gap: var(--st-spacing-3, .75rem); text-decoration:none; color:inherit; flex:0 0 auto; }
  .brand img { width:2rem; height:2rem; }
  .brand .copy { display:flex; flex-direction:column; gap:.08rem; line-height:1; }
  .brand .name { font-weight:760; font-size:1rem; }
  .brand .product { font-weight:650; font-size:.75rem; color: var(--st-semantic-text-secondary, #475569); }
  nav.main { display:flex; align-items:center; gap: var(--st-spacing-1, .25rem); margin-left: var(--st-spacing-6, 1.5rem); }
  nav.main a { color: var(--st-semantic-text-secondary, #475569); text-decoration:none; font-size:.875rem; line-height:1; padding:.38rem .75rem; display:inline-flex; align-items:center; gap:.35rem; }
  nav.main a[aria-current="page"] { color: var(--st-semantic-text-primary, #0f172a); font-weight:650; }
  .spacer { flex:1; }
  .actions { display:flex; align-items:center; gap:.5rem; }
  .control { height:2.25rem; display:inline-flex; align-items:center; gap:.375rem; padding:0 .75rem;
    border-radius:.375rem; cursor:pointer; font:inherit; font-size:.875rem;
    border:1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-default, #fff); color: var(--st-semantic-text-primary, #0f172a); }
  .control.icon { width:2.25rem; min-width:2.25rem; padding:0; justify-content:center; }
  .control svg { flex-shrink:0; }
  #search { gap: var(--st-spacing-2, .5rem); }
  .chev { display:inline-flex; transition: transform .15s ease; }
  .menuWrap.open .chev { transform: rotate(180deg); }
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

// Icônes lucide INLINE (chemins identiques au header de référence @lucide/svelte) :
// pas d'emoji => rendu vectoriel exact, recoloré par currentColor (donc par tokens).
const ICONS = {
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  palette: '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>',
  boxes: '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
};
const icon = (name, size = 16, sw = 2) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

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
    // Icônes = SVG lucide INLINE (mêmes chemins que le header de référence), pas d'emoji.
    const chev = `<span class="chev">${icon("chevron-down", 12)}</span>`;
    const searchHtml = search && search.enabled
      ? `<button class="control" id="search" popovertarget="palette" aria-haspopup="dialog">${icon("search", 16, 2.1)}<span>${esc(search.placeholder || "Rechercher…")}</span></button>` : "";
    const fwHtml = fw && fw.enabled
      ? `<div class="menuWrap"><button class="control" data-menu="fw" aria-haspopup="true">${icon("boxes", 14)}<span>${esc((fw.available.find((o) => o.id === fw.current) || {}).label || fw.current)}</span>${chev}</button></div>` : "";
    const themeHtml = (t.themes && t.themes.length)
      ? `<div class="menuWrap"><button class="control" data-menu="theme" aria-haspopup="true">${icon("palette", 14)}<span>${esc(activeTheme ? activeTheme.label : "")}</span>${chev}</button></div>` : "";
    const cmHtml = t.colorMode
      ? `<button class="control icon" data-action="colormode" aria-label="Mode couleur">${t.colorMode === "dark" ? icon("moon", 16) : icon("sun", 16)}</button>` : "";
    const locHtml = loc
      ? `<div class="menuWrap"><button class="control" data-menu="locale" aria-haspopup="true">${icon("globe", 14)}<span>${esc((loc.current || "").toUpperCase())}</span>${chev}</button></div>` : "";
    const idHtml = identity
      ? `<button class="control icon" data-action="${identity.state === "authenticated" ? "identity" : "signin"}" aria-label="${esc(identity.label || (identity.state === "authenticated" ? "Compte" : "Se connecter"))}">${icon("user", 16, 2.1)}</button>`
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
    wrap.classList.add("open");
    wrap.appendChild(menu);
  }
  _closeMenus() {
    this.shadowRoot?.querySelectorAll(".menuWrap.open").forEach((w) => w.classList.remove("open"));
    this.shadowRoot?.querySelectorAll(".menu").forEach((m) => m.remove());
  }
}

if (!customElements.get("sentropic-app-shell")) customElements.define("sentropic-app-shell", SentropicAppShell);
