<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, ICON_NAMES, type IconName } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  // Le jeu est dérivé de ICON_NAMES (exporté par le paquet), jamais recopié :
  // la page ne peut donc pas diverger du jeu gelé côté DS. Le tableau des
  // significations est typé Record<IconName, …>, si bien qu'un nom ajouté au DS
  // sans description ici devient une erreur de type, pas un oubli silencieux.
  const MEANINGS: Record<IconName, { fr: string; en: string }> = {
    settings: { fr: "Réglages, préférences.", en: "Settings, preferences." },
    eye: { fr: "Afficher, rendre visible.", en: "Show, make visible." },
    "eye-off": { fr: "Masquer, rendre invisible.", en: "Hide, make invisible." },
    layers: { fr: "Couches, superposition.", en: "Layers, stacking." },
    target: { fr: "Cible, recentrage, focus.", en: "Target, recenter, focus." },
    close: { fr: "Fermer, retirer.", en: "Close, dismiss." },
    "chevron-down": { fr: "Déplier vers le bas.", en: "Expand downwards." },
    "chevron-right": { fr: "Déplier / naviguer vers la droite.", en: "Expand / navigate rightwards." }
  };

  const cell = (name: IconName): NodeSpec => ({
    el: "div",
    props: {
      style:
        "align-items:center;display:flex;flex-direction:column;gap:0.4rem;min-inline-size:6rem"
    },
    children: [
      { comp: "Icon", props: { name, size: 24 } },
      { el: "code", props: { style: "font-size:0.75rem" }, children: [name] }
    ]
  });

  const setDemo: NodeSpec[] = ICON_NAMES.map(cell);

  const sizeDemo: NodeSpec[] = [16, 18, 24, 32].map((size) => ({
    el: "div",
    props: {
      style: "align-items:center;display:flex;flex-direction:column;gap:0.4rem;min-inline-size:5rem"
    },
    children: [
      { comp: "Icon", props: { name: "layers", size } },
      { el: "code", props: { style: "font-size:0.75rem" }, children: [`size=${size}`] }
    ]
  }));

  const a11yDemo: NodeSpec[] = [
    { comp: "Icon", props: { name: "eye", size: 24, title: "Afficher le mot de passe" } },
    { comp: "Icon", props: { name: "eye-off", size: 24 } }
  ];

  const strokeDemo: NodeSpec[] = [1.5, 2.25, 3].map((strokeWidth) => ({
    el: "div",
    props: {
      style: "align-items:center;display:flex;flex-direction:column;gap:0.4rem;min-inline-size:6rem"
    },
    children: [
      { comp: "Icon", props: { name: "target", size: 28, strokeWidth } },
      {
        el: "code",
        props: { style: "font-size:0.75rem" },
        children: [`strokeWidth=${strokeWidth}`]
      }
    ]
  }));
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">
      {locale.value === "fr" ? "Composant · Autres" : "Component · Other"}
    </p>
    <div class="docs-hero-title">
      <h1>Icon</h1>
      <Badge tone="success">{locale.value === "fr" ? "Stable" : "Stable"}</Badge>
    </div>
    <p>
      {#if locale.value === "fr"}
        Le design system <strong>prescrit un seul jeu d'icônes</strong> et l'expose par
        <code>&lt;Icon&gt;</code>. Les icônes sont adressées par des <strong>noms DS</strong>
        (<code>IconName</code>) — jamais par le nom d'un composant de la bibliothèque source — pour
        que la source visuelle puisse évoluer sans rupture d'API. Les noms sont
        <strong>additifs</strong> : le jeu s'étend, un nom existant ne change jamais de sens.
      {:else}
        The design system <strong>prescribes a single icon set</strong> and exposes it through
        <code>&lt;Icon&gt;</code>. Icons are addressed by <strong>DS-owned names</strong>
        (<code>IconName</code>) — never by the underlying library's component name — so the visual
        source can evolve without breaking the public API. Names are <strong>additive</strong>: the
        set grows, an existing name never changes meaning.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Jeu canonique" : "Canonical set"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Le jeu complet, dans l'ordre de <code>ICON_NAMES</code>. Toute icône du DS s'obtient par
        <code>name</code> ; aucun SVG manuscrit ni emoji n'est attendu dans un produit.
      {:else}
        The full set, in <code>ICON_NAMES</code> order. Every DS icon is reached through
        <code>name</code>; no hand-rolled SVG or emoji is expected in a product.
      {/if}
    </p>
    <TabbedExample
      nodes={setDemo}
      title={locale.value === "fr"
        ? `Les ${ICON_NAMES.length} noms gelés`
        : `The ${ICON_NAMES.length} frozen names`}
    />
    <table class="docs-table">
      <thead>
        <tr>
          <th>{locale.value === "fr" ? "Nom" : "Name"}</th>
          <th>{locale.value === "fr" ? "Emploi attendu" : "Intended use"}</th>
        </tr>
      </thead>
      <tbody>
        {#each ICON_NAMES as name (name)}
          <tr>
            <td><code>{name}</code></td>
            <td>{locale.value === "fr" ? MEANINGS[name].fr : MEANINGS[name].en}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Taille et graisse" : "Size and stroke"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        <code>size</code> vaut 18 px par défaut — la taille de glyphe en ligne standard du DS —
        et <code>strokeWidth</code> 2.25, aligné sur l'usage existant. Les deux se règlent au cas
        par cas plutôt que par une classe CSS.
      {:else}
        <code>size</code> defaults to 18 px — the DS-standard inline glyph size — and
        <code>strokeWidth</code> to 2.25, matching existing usage. Both are set per call rather than
        through a CSS class.
      {/if}
    </p>
    <TabbedExample nodes={sizeDemo} title={locale.value === "fr" ? "Tailles" : "Sizes"} />
    <TabbedExample nodes={strokeDemo} title={locale.value === "fr" ? "Graisses" : "Stroke widths"} />
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Accessibilité" : "Accessibility"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        Une icône <strong>porteuse de sens</strong> reçoit <code>title</code> : elle est alors
        exposée comme image avec ce nom accessible. Sans <code>title</code>, elle est
        <strong>décorative</strong> et passe en <code>aria-hidden</code> — c'est le cas par défaut,
        et le bon choix dès qu'un texte voisin porte déjà l'information.
      {:else}
        A <strong>meaningful</strong> icon takes <code>title</code>: it is then exposed as an image
        carrying that accessible name. Without <code>title</code> it is <strong>decorative</strong>
        and becomes <code>aria-hidden</code> — the default, and the right choice whenever adjacent
        text already carries the meaning.
      {/if}
    </p>
    <TabbedExample
      nodes={a11yDemo}
      title={locale.value === "fr"
        ? "Nommée (title) puis décorative"
        : "Named (title), then decorative"}
    />
    <p class="docs-demo-note">
      {locale.value === "fr"
        ? "Pour une icône cliquable, n'enveloppez pas <Icon> dans un <button> maison : utilisez IconButton, qui impose aria-label et porte les tailles/états de cible tactile du DS."
        : "For a clickable icon, do not wrap <Icon> in a hand-rolled <button>: use IconButton, which enforces aria-label and carries the DS hit-target sizes and states."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "API du composant" : "Component API"}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>{locale.value === "fr" ? "Défaut" : "Default"}</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>name</code></td>
          <td><code>IconName</code></td>
          <td><em>{locale.value === "fr" ? "requis" : "required"}</em></td>
          <td>
            {locale.value === "fr"
              ? "Nom DS canonique de l'icône (voir le jeu ci-dessus)."
              : "Canonical DS icon name (see the set above)."}
          </td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>number</code></td>
          <td><code>18</code></td>
          <td>{locale.value === "fr" ? "Côté du carré, en px." : "Square side, in px."}</td>
        </tr>
        <tr>
          <td><code>strokeWidth</code></td>
          <td><code>number</code></td>
          <td><code>2.25</code></td>
          <td>{locale.value === "fr" ? "Épaisseur du trait." : "Stroke width."}</td>
        </tr>
        <tr>
          <td><code>title</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>
            {locale.value === "fr"
              ? "Nom accessible ; absent, l'icône est aria-hidden."
              : "Accessible name; when absent the icon is aria-hidden."}
          </td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td>—</td>
          <td>
            {locale.value === "fr"
              ? "Classe additionnelle, en plus de .st-icon."
              : "Extra class, on top of .st-icon."}
          </td>
        </tr>
      </tbody>
    </table>
    <h3 class="api-subhead">{locale.value === "fr" ? "Exports associés" : "Related exports"}</h3>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Export</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>IconName</code></td>
          <td><code>type</code></td>
          <td>
            {locale.value === "fr"
              ? "Union des noms canoniques ; à utiliser pour typer une prop d'icône côté produit."
              : "Union of canonical names; use it to type an icon prop in product code."}
          </td>
        </tr>
        <tr>
          <td><code>ICON_NAMES</code></td>
          <td><code>IconName[]</code></td>
          <td>
            {locale.value === "fr"
              ? "Tous les noms, ordonnés — pratique pour un sélecteur ou un catalogue."
              : "Every name, ordered — handy for a picker or a catalog."}
          </td>
        </tr>
        <tr>
          <td><code>ICONS</code></td>
          <td><code>Record&lt;IconName, Component&gt;</code></td>
          <td>
            {locale.value === "fr"
              ? "Nom → glyphe. Échappatoire bas niveau ; préférez <Icon>."
              : "Name → glyph. Low-level escape hatch; prefer <Icon>."}
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Tokens CSS" : "CSS Tokens"}</h2>
    <p class="section-desc">
      {#if locale.value === "fr"}
        <code>&lt;Icon&gt;</code> n'introduit aucun token : le glyphe hérite de
        <code>currentColor</code>. La couleur se pilote donc par le texte du conteneur (par exemple
        <code>--st-semantic-text-secondary</code> sur un en-tête discret).
      {:else}
        <code>&lt;Icon&gt;</code> introduces no token of its own: the glyph inherits
        <code>currentColor</code>. Color is therefore driven by the container's text color (for
        instance <code>--st-semantic-text-secondary</code> on a muted header).
      {/if}
    </p>
    <ul class="docs-token-list">
      <li><code>currentColor</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
    </ul>
  </section>
</div>

<style>
  .section-desc {
    color: var(--st-semantic-text-secondary);
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    max-width: 800px;
  }

  .api-subhead {
    font-size: 1rem;
    margin: 1.5rem 0 0.5rem;
  }

  .docs-demo-note {
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
    margin-top: 0.75rem;
  }
</style>
