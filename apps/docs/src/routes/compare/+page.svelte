<script lang="ts">
  // Fidelity bench (spec §5) — banc réservé aux THÈMES IMPORTÉS : pour chacun,
  // NOTRE composant mappé À CÔTÉ du VRAI composant officiel (CSS + markup
  // d'origine, isolés en iframe). Sent Tech (notre marque) n'a pas de pendant
  // externe → exclu de ce banc. Langue cohérente par DS (DSFR=FR, Carbon=EN).
  // Hors nav.
  //
  // G5 — couverture élargie : au-delà des 7 composants de base, on compare un
  // maximum de variants/états (Button secondaire/désactivé, Input erreur/
  // désactivé) et de nouveaux composants (Checkbox, Radio, Toggle, Tag, Badge,
  // Alert, Accordion, Breadcrumb, Pagination, Search, Quote, Highlight) — pour
  // chacun le vrai markup officiel DSFR/Carbon dans la langue du thème. Quand un
  // composant n'a pas d'équivalent officiel pour un thème (ex. Quote/Highlight =
  // DSFR seulement ; Badge = DSFR seulement), on ne fabrique PAS de fausse paire.
  //
  // G4 — banc propre : grille à colonnes fixes, mêmes gouttières/padding des deux
  // côtés, contenu aligné sur la même origine, iframes calées en haut.
  // NB : import par espace de noms (et non destructuré) — un bug d'élision
  // d'import de Vite/Rollup laissait tomber le DERNIER composant destructuré
  // (`Highlight`) à la compilation SSR (`ReferenceError: Highlight is not
  // defined` au prerender). L'accès via `Ds.Highlight` est immunisé : aucun
  // identifiant n'est tree-shaké individuellement.
  import * as Ds from "@sentropic/design-system-svelte";
  const {
    Accordion,
    Alert,
    Badge,
    Breadcrumb,
    Button,
    Card,
    Checkbox,
    Highlight,
    Input,
    Link,
    Pagination,
    Quote,
    Radio,
    Search,
    Select,
    Tabs,
    Tag,
    Textarea,
    Toggle
  } = Ds;
  import { compileTheme, type TenantTheme } from "@sentropic/design-system-themes";
  import { dsfrTheme } from "@sentropic/design-system-theme-dsfr";
  import { carbonTheme } from "@sentropic/design-system-theme-carbon";
  import docsPkg from "../../../package.json";
  // Source unique pinée (C8) : CDN/polices de référence sortis dans un registre
  // docs-local, partagé avec l'oracle de fidélité.
  import { REFERENCE_THEMES } from "$lib/compare/reference-themes.mjs";

  // Thèmes importés uniquement.
  const THEMES: TenantTheme[] = [dsfrTheme, carbonTheme];
  const scopedCss = THEMES.map((t) => compileTheme(t, { selector: `.cmp-scope--${t.id}` })).join("\n");

  // Versions (source = deps épinglées du docs) : DS Sentropic + thème.
  const dsVersion = docsPkg.dependencies["@sentropic/design-system-themes"];
  const themeVersion = (id: string): string =>
    (docsPkg.dependencies as Record<string, string>)[`@sentropic/design-system-theme-${id}`] ?? "?";

  // Libellés dans la langue native du DS (DSFR=FR, Carbon=EN) des DEUX côtés.
  type L = {
    primary: string; secondary: string; disabled: string;
    email: string; helper: string; placeholder: string; errorText: string;
    inline: string; standalone: string; cardTitle: string; cardBody: string;
    message: string; messagePlaceholder: string; selectLabel: string;
    options: { value: string; label: string }[];
    tabs: { value: string; label: string; content: string; disabled?: boolean }[];
    check: string; checkHelp: string; radio: string; toggle: string; toggleOn: string; toggleOff: string;
    tag: string; badge: string;
    alertTitle: string; alertMessage: string;
    accordion: { id: string; title: string; content: string }[];
    crumbs: { label: string; href?: string; current?: boolean }[];
    searchLabel: string; searchPlaceholder: string;
    quote: string; quoteAuthor: string; quoteSource: string;
    highlightTitle: string; highlightBody: string;
  };
  const LABELS: Record<string, L> = {
    dsfr: {
      primary: "Primaire", secondary: "Secondaire", disabled: "Désactivé",
      email: "Email", helper: "Texte d'aide", placeholder: "nom@exemple.org",
      errorText: "Adresse invalide",
      inline: "Lien inline", standalone: "Lien standalone",
      cardTitle: "Titre de carte", cardBody: "Contenu de la carte.",
      message: "Message", messagePlaceholder: "Votre message…", selectLabel: "Région",
      options: [
        { value: "idf", label: "Île-de-France" },
        { value: "bre", label: "Bretagne" },
        { value: "occ", label: "Occitanie" }
      ],
      tabs: [
        { value: "a", label: "Actif", content: "Panneau actif" },
        { value: "b", label: "Second", content: "Second panneau" },
        { value: "c", label: "Désactivé", content: "Panneau désactivé", disabled: true }
      ],
      check: "J'accepte les conditions", checkHelp: "Texte d'aide",
      radio: "Option A", toggle: "Activer les notifications", toggleOn: "Activé", toggleOff: "Désactivé",
      tag: "Étiquette", badge: "Nouveau",
      alertTitle: "Information", alertMessage: "Votre demande a bien été enregistrée.",
      accordion: [
        { id: "a", title: "Première section", content: "Contenu de la première section." },
        { id: "b", title: "Deuxième section", content: "Contenu de la deuxième section." }
      ],
      crumbs: [
        { label: "Accueil", href: "#cmp" },
        { label: "Démarches", href: "#cmp" },
        { label: "Page courante", current: true }
      ],
      searchLabel: "Rechercher", searchPlaceholder: "Rechercher",
      quote: "La sobriété numérique est un impératif d'avenir.",
      quoteAuthor: "Auteur", quoteSource: "Référence",
      highlightTitle: "À retenir", highlightBody: "Un encart de mise en avant éditoriale."
    },
    carbon: {
      primary: "Primary", secondary: "Secondary", disabled: "Disabled",
      email: "Email", helper: "Helper text", placeholder: "name@example.org",
      errorText: "Invalid address",
      inline: "Inline link", standalone: "Standalone link",
      cardTitle: "Card title", cardBody: "Card body content.",
      message: "Message", messagePlaceholder: "Your message…", selectLabel: "Region",
      options: [
        { value: "north", label: "North" },
        { value: "south", label: "South" },
        { value: "east", label: "East" }
      ],
      tabs: [
        { value: "a", label: "Active", content: "Active panel" },
        { value: "b", label: "Second", content: "Second panel" },
        { value: "c", label: "Disabled", content: "Disabled panel", disabled: true }
      ],
      check: "I accept the terms", checkHelp: "Helper text",
      radio: "Option A", toggle: "Enable notifications", toggleOn: "On", toggleOff: "Off",
      tag: "Tag", badge: "New",
      alertTitle: "Notification", alertMessage: "Your request has been saved.",
      accordion: [
        { id: "a", title: "First section", content: "First section content." },
        { id: "b", title: "Second section", content: "Second section content." }
      ],
      crumbs: [
        { label: "Home", href: "#cmp" },
        { label: "Catalog", href: "#cmp" },
        { label: "Current page", current: true }
      ],
      searchLabel: "Search", searchPlaceholder: "Search",
      quote: "Carbon has no editorial quote component.",
      quoteAuthor: "Author", quoteSource: "Source",
      highlightTitle: "Note", highlightBody: "Carbon has no editorial highlight component."
    }
  };

  // F2 / C8 — CDN (pinés) + polices de marque chargées RÉELLEMENT des deux côtés
  // du banc, dérivés de la source unique `reference-themes.mjs` (mêmes valeurs
  // épinglées que celles mesurées par l'oracle → registre reproductible).
  // DSFR : Marianne via la CSS utilitaire DSFR. Carbon : IBM Plex Sans via Google
  // Fonts (Carbon ne sert pas la police). On force aussi la chaîne `font-family`
  // de marque côté <body> de l'iframe, sinon `system-ui` masquait Marianne /
  // IBM Plex Sans et faussait la comparaison (fallback asymétrique).
  const CDN: Record<string, string> = Object.fromEntries(
    Object.entries(REFERENCE_THEMES).map(([id, t]) => [id, t.cssUrl])
  );
  const FONT_LINKS: Record<string, string> = Object.fromEntries(
    Object.entries(REFERENCE_THEMES).map(([id, t]) => [id, t.fontLinks])
  );
  const BRAND_FONT: Record<string, string> = Object.fromEntries(
    Object.entries(REFERENCE_THEMES).map(([id, t]) => [id, t.brandFont])
  );

  // @font-face Marianne (URLs CDN absolues) pour NOTRE côté DSFR. On évite
  // d'injecter tout dsfr.min.css (qui contient un reset global qui fausserait
  // les mesures de boîte) : on charge SEULEMENT la police. IBM Plex Sans est
  // chargée via le <link> Google Fonts ci-dessous.
  const MARIANNE_CDN = "https://cdn.jsdelivr.net/npm/@gouvfr/dsfr/dist/fonts";
  const MARIANNE_FACES: [number, string, string?][] = [
    [400, "Marianne-Regular"],
    [400, "Marianne-Regular_Italic", "italic"],
    [500, "Marianne-Medium"],
    [700, "Marianne-Bold"]
  ];
  const ourFontFaces = MARIANNE_FACES.map(
    ([weight, file, style]) =>
      `@font-face{font-display:swap;font-family:Marianne;font-style:${style ?? "normal"};font-weight:${weight};src:url("${MARIANNE_CDN}/${file}.woff2") format("woff2"),url("${MARIANNE_CDN}/${file}.woff") format("woff")}`
  ).join("");

  // F1 — banc apples-to-apples : largeur de rendu commune aux DEUX côtés.
  // Les champs pleine largeur (Input/Textarea/Select/Search) remplissent
  // exactement BENCH_WIDTH des deux côtés ; les composants à largeur intrinsèque
  // (Button/Link/Tabs/Tag…) disposent du même contexte de largeur ; la carte est
  // rendue dans le même contexte de 18rem que la référence officielle.
  const BENCH_WIDTH = 320; // px — largeur de contenu identique des deux côtés
  const IFRAME_PAD = 14; // px — padding du <body> de l'iframe (cf. refDoc)

  // ---------------------------------------------------------------------------
  // Catalogue du banc : chaque entrée = une paire « notre composant mappé » vs
  // « vrai composant officiel ». `key` = identifiant stable partagé avec la CLI.
  // `themes` = thèmes pour lesquels un VRAI équivalent officiel existe (sinon on
  // n'affiche pas de fausse paire). `full` = champ pleine largeur ; `card` =
  // contexte 18rem.
  // ---------------------------------------------------------------------------
  type Entry = {
    key: string;
    label: string;
    themes?: string[]; // défaut = tous
    full?: boolean;
    card?: boolean;
  };
  const ALL = ["dsfr", "carbon"];
  const ENTRIES: Entry[] = [
    { key: "Button", label: "Button — primaire + secondaire" },
    { key: "ButtonDisabled", label: "Button — désactivé" },
    { key: "Input", label: "Input", full: true },
    { key: "InputError", label: "Input — erreur", full: true },
    { key: "InputDisabled", label: "Input — désactivé", full: true },
    { key: "Textarea", label: "Textarea", full: true },
    { key: "Select", label: "Select", full: true },
    { key: "Search", label: "Search", full: true },
    { key: "Link", label: "Link" },
    { key: "Checkbox", label: "Checkbox" },
    { key: "Radio", label: "Radio" },
    { key: "Toggle", label: "Toggle / Switch" },
    { key: "Tag", label: "Tag" },
    { key: "Badge", label: "Badge", themes: ["dsfr"] },
    { key: "Alert", label: "Alert / Notification" },
    { key: "Accordion", label: "Accordion" },
    { key: "Breadcrumb", label: "Breadcrumb" },
    { key: "Pagination", label: "Pagination" },
    { key: "Card", label: "Card", card: true },
    { key: "Tabs", label: "Tabs" },
    { key: "Quote", label: "Quote", themes: ["dsfr"] },
    { key: "Highlight", label: "Highlight / Mise en avant", themes: ["dsfr"] }
  ];
  const hasTheme = (e: Entry, id: string) => (e.themes ?? ALL).includes(id);

  // Markup officiel par (thème, clé), dans la langue du DS. Quand une clé n'a pas
  // d'entrée pour un thème, c'est qu'aucun équivalent officiel propre n'existe.
  const REF: Record<string, Record<string, string>> = {
    dsfr: {
      Button: `<button class="fr-btn">Primaire</button> <button class="fr-btn fr-btn--secondary">Secondaire</button>`,
      ButtonDisabled: `<button class="fr-btn" disabled>Désactivé</button>`,
      Input: `<div class="fr-input-group"><label class="fr-label" for="d">Email<span class="fr-hint-text">Texte d'aide</span></label><input class="fr-input" id="d" placeholder="nom@exemple.org"></div>`,
      InputError: `<div class="fr-input-group fr-input-group--error"><label class="fr-label" for="de">Email<span class="fr-hint-text">Texte d'aide</span></label><input class="fr-input fr-input--error" id="de" aria-describedby="de-err" placeholder="nom@exemple.org"><p id="de-err" class="fr-error-text">Adresse invalide</p></div>`,
      InputDisabled: `<div class="fr-input-group fr-input-group--disabled"><label class="fr-label" for="dd">Email</label><input class="fr-input" id="dd" disabled placeholder="nom@exemple.org"></div>`,
      Textarea: `<div class="fr-input-group"><label class="fr-label" for="dt">Message</label><textarea class="fr-input" id="dt" rows="3" placeholder="Votre message…"></textarea></div>`,
      Select: `<div class="fr-select-group"><label class="fr-label" for="ds">Région</label><select class="fr-select" id="ds"><option value="idf">Île-de-France</option><option value="bre">Bretagne</option><option value="occ">Occitanie</option></select></div>`,
      Search: `<div class="fr-search-bar"><label class="fr-label" for="dsearch">Rechercher</label><input class="fr-input" id="dsearch" type="search" placeholder="Rechercher"><button class="fr-btn" title="Rechercher">Rechercher</button></div>`,
      Link: `<a class="fr-link" href="#">Lien inline</a><br><a class="fr-link fr-link--lg" href="#">Lien standalone</a>`,
      Checkbox: `<div class="fr-checkbox-group"><input type="checkbox" id="dcb" name="dcb"><label class="fr-label" for="dcb">J'accepte les conditions<span class="fr-hint-text">Texte d'aide</span></label></div>`,
      Radio: `<div class="fr-radio-group"><input type="radio" id="drb" name="drb" checked><label class="fr-label" for="drb">Option A</label></div>`,
      Toggle: `<div class="fr-toggle"><input type="checkbox" class="fr-toggle__input" id="dtg" checked><label class="fr-toggle__label" for="dtg" data-fr-checked-label="Activé" data-fr-unchecked-label="Désactivé">Activer les notifications</label></div>`,
      Tag: `<p class="fr-tag">Étiquette</p>`,
      Badge: `<p class="fr-badge">Nouveau</p>`,
      Alert: `<div class="fr-alert fr-alert--info"><h3 class="fr-alert__title">Information</h3><p>Votre demande a bien été enregistrée.</p></div>`,
      Accordion: `<section class="fr-accordion"><h3 class="fr-accordion__title"><button class="fr-accordion__btn" aria-expanded="false" aria-controls="dacc">Première section</button></h3><div class="fr-collapse" id="dacc"><p>Contenu de la première section.</p></div></section>`,
      Breadcrumb: `<nav class="fr-breadcrumb" aria-label="vous êtes ici :"><ol class="fr-breadcrumb__list"><li><a class="fr-breadcrumb__link" href="#">Accueil</a></li><li><a class="fr-breadcrumb__link" href="#">Démarches</a></li><li><a class="fr-breadcrumb__link" aria-current="page">Page courante</a></li></ol></nav>`,
      Pagination: `<nav class="fr-pagination" role="navigation" aria-label="Pagination"><ul class="fr-pagination__list"><li><a class="fr-pagination__link" href="#">1</a></li><li><a class="fr-pagination__link" aria-current="page" href="#">2</a></li><li><a class="fr-pagination__link" href="#">3</a></li></ul></nav>`,
      Card: `<div class="fr-card fr-card--sm" style="max-width:18rem"><div class="fr-card__body"><div class="fr-card__content"><h3 class="fr-card__title">Titre de carte</h3><p class="fr-card__desc">Contenu de la carte.</p></div></div></div>`,
      Tabs: `<div class="fr-tabs"><ul class="fr-tabs__list" role="tablist"><li role="presentation"><button class="fr-tabs__tab" role="tab" aria-selected="true">Actif</button></li><li role="presentation"><button class="fr-tabs__tab" role="tab" aria-selected="false">Second</button></li></ul></div>`,
      Quote: `<figure class="fr-quote"><blockquote><p>La sobriété numérique est un impératif d'avenir.</p></blockquote><figcaption><p class="fr-quote__author">Auteur</p><cite>Référence</cite></figcaption></figure>`,
      Highlight: `<div class="fr-highlight"><p>Un encart de mise en avant éditoriale.</p></div>`
    },
    carbon: {
      Button: `<button class="bx--btn bx--btn--primary">Primary</button> <button class="bx--btn bx--btn--secondary">Secondary</button>`,
      ButtonDisabled: `<button class="bx--btn bx--btn--primary" disabled>Disabled</button>`,
      Input: `<div class="bx--form-item"><label class="bx--label" for="c">Email</label><input class="bx--text-input" id="c" placeholder="name@example.org"><div class="bx--form__helper-text">Helper text</div></div>`,
      InputError: `<div class="bx--form-item"><label class="bx--label" for="ce">Email</label><div class="bx--text-input__field-wrapper bx--text-input__field-wrapper--invalid"><input class="bx--text-input bx--text-input--invalid" id="ce" aria-invalid="true" placeholder="name@example.org"></div><div class="bx--form-requirement">Invalid address</div></div>`,
      InputDisabled: `<div class="bx--form-item"><label class="bx--label bx--label--disabled" for="cd">Email</label><input class="bx--text-input" id="cd" disabled placeholder="name@example.org"></div>`,
      Textarea: `<div class="bx--form-item"><label class="bx--label" for="cta">Message</label><textarea class="bx--text-area" id="cta" rows="3" placeholder="Your message…"></textarea></div>`,
      Select: `<div class="bx--form-item"><div class="bx--select"><label class="bx--label" for="cse">Region</label><div class="bx--select-input__wrapper"><select class="bx--select-input" id="cse"><option class="bx--select-option" value="north">North</option><option class="bx--select-option" value="south">South</option><option class="bx--select-option" value="east">East</option></select></div></div></div>`,
      Search: `<div class="bx--search bx--search--lg" role="search"><div class="bx--search-magnifier"></div><label class="bx--label" for="csearch">Search</label><input class="bx--search-input" id="csearch" type="text" placeholder="Search"></div>`,
      Link: `<a class="bx--link" href="#">Inline link</a>`,
      Checkbox: `<fieldset class="bx--fieldset"><div class="bx--form-item bx--checkbox-wrapper"><input type="checkbox" class="bx--checkbox" id="ccb" checked><label for="ccb" class="bx--checkbox-label"><span class="bx--checkbox-label-text">I accept the terms</span></label></div></fieldset>`,
      Radio: `<fieldset class="bx--fieldset"><div class="bx--radio-button-group bx--radio-button-group--vertical"><div class="bx--radio-button-wrapper"><input type="radio" class="bx--radio-button" id="crb" name="crb" checked><label for="crb" class="bx--radio-button__label"><span class="bx--radio-button__appearance"></span><span class="bx--radio-button__label-text">Option A</span></label></div></div></fieldset>`,
      Toggle: `<div class="bx--form-item"><input type="checkbox" id="ctg" class="bx--toggle-input" checked><label class="bx--toggle-input__label" for="ctg">Enable notifications<span class="bx--toggle__switch"><span class="bx--toggle__text--off">Off</span><span class="bx--toggle__text--on">On</span></span></label></div>`,
      Tag: `<div class="bx--tag bx--tag--gray"><span class="bx--tag__label">Tag</span></div>`,
      Alert: `<div class="bx--inline-notification bx--inline-notification--info" role="status"><div class="bx--inline-notification__details"><div class="bx--inline-notification__text-wrapper"><p class="bx--inline-notification__title">Notification</p><p class="bx--inline-notification__subtitle">Your request has been saved.</p></div></div></div>`,
      Accordion: `<ul class="bx--accordion"><li class="bx--accordion__item"><button class="bx--accordion__heading" aria-expanded="false" type="button"><svg class="bx--accordion__arrow" width="16" height="16" viewBox="0 0 16 16"></svg><div class="bx--accordion__title">First section</div></button><div class="bx--accordion__content"><p>First section content.</p></div></li></ul>`,
      Breadcrumb: `<nav class="bx--breadcrumb" aria-label="Breadcrumb"><div class="bx--breadcrumb-item"><a class="bx--link" href="#">Home</a></div><div class="bx--breadcrumb-item"><a class="bx--link" href="#">Catalog</a></div><div class="bx--breadcrumb-item bx--breadcrumb-item--current"><a class="bx--link" aria-current="page" href="#">Current page</a></div></nav>`,
      Pagination: `<nav class="bx--pagination-nav" aria-label="pagination"><ul class="bx--pagination-nav__list"><li class="bx--pagination-nav__list-item"><button class="bx--pagination-nav__page" type="button">1</button></li><li class="bx--pagination-nav__list-item"><button class="bx--pagination-nav__page bx--pagination-nav__page--active" type="button" aria-current="page">2</button></li><li class="bx--pagination-nav__list-item"><button class="bx--pagination-nav__page" type="button">3</button></li></ul></nav>`,
      Card: `<div class="bx--tile" style="max-width:18rem"><h3 style="margin:0 0 .5rem">Card title</h3><p style="margin:0">Card body content.</p></div>`,
      Tabs: `<nav class="bx--tabs"><ul class="bx--tabs__nav" role="tablist"><li class="bx--tabs__nav-item bx--tabs__nav-item--selected" role="tab"><a class="bx--tabs__nav-link" href="#">Active</a></li><li class="bx--tabs__nav-item" role="tab"><a class="bx--tabs__nav-link" href="#">Second</a></li></ul></nav>`
    }
  };

  function refDoc(themeId: string, key: string): string {
    const href = CDN[themeId];
    const body = REF[themeId]?.[key] ?? "";
    const fontLinks = FONT_LINKS[themeId] ?? "";
    const brandFont = BRAND_FONT[themeId] ?? "system-ui, sans-serif";
    // body width = BENCH_WIDTH + 2*IFRAME_PAD (box-sizing:border-box) pour que
    // la zone de contenu de référence fasse exactement BENCH_WIDTH px →
    // apples-to-apples avec notre côté.
    return `<!doctype html><html lang="${themeId === "dsfr" ? "fr" : "en"}"><head><meta charset="utf-8"><link rel="stylesheet" href="${href}">${fontLinks}<style>html,body{box-sizing:border-box}*,*::before,*::after{box-sizing:inherit}body{margin:0;padding:${IFRAME_PAD}px;font-family:${brandFont};background:#fff}</style></head><body>${body}</body></html>`;
  }
</script>

<svelte:head>
  <!-- F2 — polices de marque chargées RÉELLEMENT de NOTRE côté aussi.
       Marianne (DSFR) : @font-face servis par le CDN (URLs absolues), sans
       injecter le reset global de dsfr.min.css. IBM Plex Sans (Carbon) :
       Google Fonts. Sans cela, notre côté retombait sur un fallback alors
       qu'il déclare Marianne / IBM Plex Sans (comparaison asymétrique). -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin="anonymous" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap"
  />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<style>${ourFontFaces}</style>`}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<style>${scopedCss}</style>`}
</svelte:head>

<div class="cmp">
  <header class="cmp-head">
    <h1>Banc de fidélité — notre DS mappé vs DS officiel</h1>
    <p>
      Thèmes importés uniquement. Pour chacun : <strong>notre composant mappé</strong> à gauche,
      le <strong>vrai composant officiel</strong> (CSS+markup d'origine, en iframe isolée) à droite.
      Langue native du DS des deux côtés. Survole / Tab pour voir hover/focus.
      Couverture élargie (G5) : variants/états + composants additionnels.
    </p>
  </header>

  {#each THEMES as theme (theme.id)}
    {@const lab = LABELS[theme.id]}
    <section class="cmp-theme cmp-scope--{theme.id}" data-st-theme={theme.id}>
      <h2 class="cmp-theme__name">
        {theme.label} <code>({theme.id})</code>
        <span class="cmp-theme__ver">Sentropic DS v{dsVersion} · thème v{themeVersion(theme.id)}</span>
      </h2>

      {#each ENTRIES.filter((e) => hasTheme(e, theme.id)) as entry (entry.key)}
        <div class="cmp-row" data-compare-theme={theme.id} data-compare-component={entry.key} data-compare-scenario={entry.key}>
          <div class="cmp-row__label">{entry.label}</div>

          <div class="cmp-cell">
            <span class="cmp-cell__tag">Sentropic → {theme.id}</span>
            <div
              class="cmp-cell__body"
              class:cmp-cell__body--field={entry.full}
              class:cmp-cell__body--card={entry.card}
            >
              {#if entry.key === "Button"}
                <div class="cmp-stack">
                  <Button>{lab.primary}</Button>
                  <Button variant="secondary">{lab.secondary}</Button>
                </div>
              {:else if entry.key === "ButtonDisabled"}
                <Button disabled>{lab.disabled}</Button>
              {:else if entry.key === "Input"}
                <Input label={lab.email} placeholder={lab.placeholder} helperText={lab.helper} />
              {:else if entry.key === "InputError"}
                <Input label={lab.email} placeholder={lab.placeholder} helperText={lab.helper} errorText={lab.errorText} />
              {:else if entry.key === "InputDisabled"}
                <Input label={lab.email} placeholder={lab.placeholder} disabled />
              {:else if entry.key === "Textarea"}
                <Textarea label={lab.message} placeholder={lab.messagePlaceholder} rows={3} />
              {:else if entry.key === "Select"}
                <Select label={lab.selectLabel}>
                  {#each lab.options as o}
                    <option value={o.value}>{o.label}</option>
                  {/each}
                </Select>
              {:else if entry.key === "Search"}
                <Search label={lab.searchLabel} placeholder={lab.searchPlaceholder} />
              {:else if entry.key === "Link"}
                <div class="cmp-stack">
                  <Link href="#cmp">{lab.inline}</Link>
                  <Link href="#cmp" variant="standalone">{lab.standalone}</Link>
                </div>
              {:else if entry.key === "Checkbox"}
                <Checkbox label={lab.check} helperText={lab.checkHelp} checked />
              {:else if entry.key === "Radio"}
                <Radio label={lab.radio} name="cmp-radio-{theme.id}" checked />
              {:else if entry.key === "Toggle"}
                <Toggle label={lab.toggle} labelOn={lab.toggleOn} labelOff={lab.toggleOff} checked />
              {:else if entry.key === "Tag"}
                <Tag>{lab.tag}</Tag>
              {:else if entry.key === "Badge"}
                <Badge tone="info">{lab.badge}</Badge>
              {:else if entry.key === "Alert"}
                <Alert tone="info" title={lab.alertTitle} message={lab.alertMessage} />
              {:else if entry.key === "Accordion"}
                <Accordion items={lab.accordion} />
              {:else if entry.key === "Breadcrumb"}
                <Breadcrumb items={lab.crumbs} />
              {:else if entry.key === "Pagination"}
                <Pagination page={2} pageCount={3} />
              {:else if entry.key === "Card"}
                <Card interactive>
                  <strong>{lab.cardTitle}</strong>
                  <p style="margin:0">{lab.cardBody}</p>
                </Card>
              {:else if entry.key === "Tabs"}
                <Tabs items={lab.tabs} label="Demo tabs" />
              {:else if entry.key === "Quote"}
                <Quote author={lab.quoteAuthor} source={lab.quoteSource}>{lab.quote}</Quote>
              {:else if entry.key === "Highlight"}
                <Highlight title={lab.highlightTitle}>{lab.highlightBody}</Highlight>
              {/if}
            </div>
          </div>

          <div class="cmp-cell cmp-cell--ref">
            <span class="cmp-cell__tag">{theme.label} officiel</span>
            <div class="cmp-cell__body cmp-cell__body--ref">
              <iframe
                class="cmp-frame"
                style="width:{BENCH_WIDTH + 2 * IFRAME_PAD}px"
                title="{theme.label} officiel — {entry.label}"
                srcdoc={refDoc(theme.id, entry.key)}
              ></iframe>
            </div>
          </div>
        </div>
      {/each}
    </section>
  {/each}
</div>

<style>
  .cmp {
    padding: 2rem;
    display: grid;
    gap: 2rem;
    font-family: system-ui, sans-serif;
  }
  .cmp-head h1 { margin: 0 0 0.5rem; }
  .cmp-head p { max-width: 70ch; color: #475569; }
  .cmp-theme {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    display: grid;
    gap: 1rem;
    background: var(--st-semantic-surface-default, #fff);
    color: var(--st-semantic-text-primary, #0f172a);
  }
  /* F2 — la chaîne `font-family` de marque du thème s'applique à TOUT le scope
     (comme dans le DS réel) : Link/Card, qui n'imposent pas leur propre famille,
     héritent ainsi de Marianne / IBM Plex Sans — identique au <body> de marque
     de l'iframe de référence, plus de fallback system-ui asymétrique. */
  .cmp-scope--dsfr,
  .cmp-scope--carbon {
    font-family: var(--st-font-sans, system-ui, sans-serif);
  }
  .cmp-theme__name {
    margin: 0;
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .cmp-theme__ver {
    font-size: 0.75rem;
    font-weight: 500;
    color: #64748b;
  }
  /* G4 — grille propre : 3 colonnes fixes (libellé · nous · réf). Les deux
     cellules de comparaison ont EXACTEMENT la même largeur (1fr/1fr) et la même
     origine de contenu. `align-items:stretch` → boîtes de même hauteur. */
  .cmp-row {
    display: grid;
    grid-template-columns: 12rem minmax(0, 1fr) minmax(0, 1fr);
    gap: 1rem;
    align-items: stretch;
    border-top: 1px solid #eef2f7;
    padding-top: 1rem;
  }
  /* Libellé aligné en haut, sur la même ligne que le tag « Sentropic → » des
     cellules (pas de flottement vertical). */
  .cmp-row__label {
    font-weight: 700;
    font-size: 0.9375rem;
    line-height: 1.3;
    color: #1e293b;
  }
  .cmp-cell {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
    padding: 0.75rem;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
    min-width: 0;
  }
  .cmp-cell--ref { background: #fbfcfe; }
  /* G4 — corps de cellule : MÊME origine des deux côtés. Le contenu démarre en
     haut-gauche (flex-start/flex-start) de façon identique à l'iframe, qui rend
     son markup à partir de son coin haut-gauche → libellés et boîtes alignés. */
  .cmp-cell__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: flex-start;
    align-items: flex-start;
  }
  /* La cellule de référence n'a qu'une iframe : on la cale en haut-gauche,
     même origine que notre contenu. */
  .cmp-cell__body--ref {
    align-items: flex-start;
  }
  /* F1 — banc apples-to-apples : les champs pleine largeur remplissent
     exactement BENCH_WIDTH (320px), identique à la zone de contenu de
     l'iframe de référence (largeur iframe − 2×14px de padding). */
  .cmp-cell__body--field {
    align-items: stretch;
  }
  .cmp-cell__body--field > :global(*) {
    width: 320px;
    max-width: 320px;
  }
  /* Card : la référence officielle est rendue avec `max-width:18rem` (288px) et
     remplit la largeur de son body. On rend NOTRE carte dans le MÊME contexte
     de largeur (18rem) pour une comparaison apples-to-apples ; tout résidu de
     largeur restant est alors une vraie différence d'anatomie, pas un artefact
     de mise en page. */
  .cmp-cell__body--card {
    align-items: stretch;
  }
  .cmp-cell__body--card > :global(*) {
    width: 18rem;
    max-width: 18rem;
  }
  .cmp-stack { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
  .cmp-cell__tag {
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748b;
  }
  .cmp-frame {
    /* Largeur fixée en ligne (BENCH_WIDTH + 2×padding) pour rendre la zone de
       contenu de référence à BENCH_WIDTH, identique à notre côté. Calée en haut,
       même origine que notre contenu (G4). */
    flex: 0 0 auto;
    min-height: 7rem;
    width: 100%;
    max-width: 100%;
    border: 0;
    background: #fff;
  }
</style>
