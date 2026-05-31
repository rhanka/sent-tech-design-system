// apps/docs/src/lib/compare/manifest.mjs
// Pour brancher des thèmes privés locaux, voir local-overlays.mjs +
// scripts/ensure-compare-local-overlays.mjs.
// Single source of truth for the compare bench + oracle: theme → key →
// {component, scenario, state, ourSelector, refSelector, refMarkup, lang, note?}.
// Replaces the duplicated maps in fidelity.mjs and the REF object in
// compare/+page.svelte (correction C6 — kills the row-index `--component` bug).
//
// Migration rules applied to each key:
// - component = parent component (ButtonDisabled→Button, InputError/InputDisabled→Input)
// - scenario = readable identifier (Button→primary, ButtonDisabled→disabled, etc.)
// - state ∈ rest|focus|disabled|error|selected
// - ourSelector = OUR_SELECTOR[key]
// - refSelector = REF_SELECTOR[theme][key]
// - refMarkup = REF[theme][key] verbatim
// - lang = dsfr?"fr":"en"
// - note = REF_SELECTOR_NOTE[theme]?.[key] if present

import { COMPARE_MANIFEST_LOCAL, mergeManifestOverlay } from "./local-overlays.mjs";

export const COMPARE_MANIFEST = {
  dsfr: {
    Button: {
      component: "Button", scenario: "primary", state: "rest",
      ourSelector: ".st-button", refSelector: ".fr-btn", lang: "fr",
      refMarkup: `<button class="fr-btn">Primaire</button> <button class="fr-btn fr-btn--secondary">Secondaire</button>`,
    },
    ButtonDisabled: {
      component: "Button", scenario: "disabled", state: "disabled",
      ourSelector: ".st-button:disabled", refSelector: ".fr-btn:disabled", lang: "fr",
      refMarkup: `<button class="fr-btn" disabled>Désactivé</button>`,
    },
    Input: {
      component: "Input", scenario: "default", state: "rest",
      ourSelector: ".st-control", refSelector: ".fr-input", lang: "fr",
      refMarkup: `<div class="fr-input-group"><label class="fr-label" for="d">Email<span class="fr-hint-text">Texte d'aide</span></label><input class="fr-input" id="d" placeholder="nom@exemple.org"></div>`,
    },
    InputError: {
      component: "Input", scenario: "error", state: "error",
      ourSelector: `.st-control[aria-invalid="true"]`, refSelector: ".fr-input--error", lang: "fr",
      refMarkup: `<div class="fr-input-group fr-input-group--error"><label class="fr-label" for="de">Email<span class="fr-hint-text">Texte d'aide</span></label><input class="fr-input fr-input--error" id="de" aria-describedby="de-err" placeholder="nom@exemple.org"><p id="de-err" class="fr-error-text">Adresse invalide</p></div>`,
    },
    InputDisabled: {
      component: "Input", scenario: "disabled", state: "disabled",
      ourSelector: ".st-control:disabled", refSelector: ".fr-input:disabled", lang: "fr",
      refMarkup: `<div class="fr-input-group fr-input-group--disabled"><label class="fr-label" for="dd">Email</label><input class="fr-input" id="dd" disabled placeholder="nom@exemple.org"></div>`,
    },
    Textarea: {
      component: "Textarea", scenario: "default", state: "rest",
      ourSelector: ".st-textarea", refSelector: "textarea.fr-input", lang: "fr",
      refMarkup: `<div class="fr-input-group"><label class="fr-label" for="dt">Message</label><textarea class="fr-input" id="dt" rows="3" placeholder="Votre message…"></textarea></div>`,
    },
    Select: {
      component: "Select", scenario: "default", state: "rest",
      ourSelector: ".st-select", refSelector: ".fr-select", lang: "fr",
      refMarkup: `<div class="fr-select-group"><label class="fr-label" for="ds">Région</label><select class="fr-select" id="ds"><option value="idf">Île-de-France</option><option value="bre">Bretagne</option><option value="occ">Occitanie</option></select></div>`,
    },
    Search: {
      component: "Search", scenario: "default", state: "rest",
      ourSelector: ".st-search", refSelector: ".fr-search-bar .fr-input", lang: "fr",
      refMarkup: `<div class="fr-search-bar"><label class="fr-label" for="dsearch">Rechercher</label><input class="fr-input" id="dsearch" type="search" placeholder="Rechercher"><button class="fr-btn" title="Rechercher">Rechercher</button></div>`,
    },
    Link: {
      component: "Link", scenario: "default", state: "rest",
      ourSelector: ".st-link", refSelector: ".fr-link", lang: "fr",
      refMarkup: `<a class="fr-link" href="#">Lien inline</a><br><a class="fr-link fr-link--lg" href="#">Lien standalone</a>`,
    },
    Checkbox: {
      component: "Checkbox", scenario: "default", state: "rest",
      ourSelector: ".st-choice__label", refSelector: ".fr-checkbox-group label", lang: "fr",
      refMarkup: `<div class="fr-checkbox-group"><input type="checkbox" id="dcb" name="dcb"><label class="fr-label" for="dcb">J'accepte les conditions<span class="fr-hint-text">Texte d'aide</span></label></div>`,
      note: "Le contrôle visuel DSFR est dessiné en `::before` sur le label (non mesurable). On compare le LABEL (`.fr-checkbox-group label`) — la typo/couleur réellement peintes.",
    },
    Radio: {
      component: "Radio", scenario: "default", state: "rest",
      ourSelector: ".st-choice__label", refSelector: ".fr-radio-group label", lang: "fr",
      refMarkup: `<div class="fr-radio-group"><input type="radio" id="drb" name="drb" checked><label class="fr-label" for="drb">Option A</label></div>`,
      note: "Idem checkbox : contrôle en pseudo-élément. On compare le label (`.fr-radio-group label`).",
    },
    Toggle: {
      component: "Toggle", scenario: "default", state: "rest",
      ourSelector: ".st-toggle__track", refSelector: ".fr-toggle__label", lang: "fr",
      refMarkup: `<div class="fr-toggle"><input type="checkbox" class="fr-toggle__input" id="dtg" checked><label class="fr-toggle__label" for="dtg" data-fr-checked-label="Activé" data-fr-unchecked-label="Désactivé">Activer les notifications</label></div>`,
      note: "L'interrupteur DSFR est dessiné en `::before/::after` sur le label. On compare le label (`.fr-toggle__label`) — typo/couleur comparables.",
    },
    Tag: {
      component: "Tag", scenario: "default", state: "rest",
      ourSelector: ".st-tag", refSelector: ".fr-tag", lang: "fr",
      refMarkup: `<p class="fr-tag">Étiquette</p>`,
    },
    Badge: {
      component: "Badge", scenario: "default", state: "rest",
      ourSelector: ".st-badge", refSelector: ".fr-badge", lang: "fr",
      refMarkup: `<p class="fr-badge">Nouveau</p>`,
    },
    Alert: {
      component: "Alert", scenario: "default", state: "rest",
      ourSelector: ".st-alert", refSelector: ".fr-alert", lang: "fr",
      refMarkup: `<div class="fr-alert fr-alert--info"><h3 class="fr-alert__title">Information</h3><p>Votre demande a bien été enregistrée.</p></div>`,
    },
    Accordion: {
      component: "Accordion", scenario: "default", state: "rest",
      ourSelector: ".st-accordion__trigger", refSelector: ".fr-accordion__btn", lang: "fr",
      refMarkup: `<section class="fr-accordion"><h3 class="fr-accordion__title"><button class="fr-accordion__btn" aria-expanded="false" aria-controls="dacc">Première section</button></h3><div class="fr-collapse" id="dacc"><p>Contenu de la première section.</p></div></section>`,
    },
    Breadcrumb: {
      component: "Breadcrumb", scenario: "default", state: "rest",
      ourSelector: ".st-breadcrumb a", refSelector: ".fr-breadcrumb__link", lang: "fr",
      refMarkup: `<nav class="fr-breadcrumb" aria-label="vous êtes ici :"><ol class="fr-breadcrumb__list"><li><a class="fr-breadcrumb__link" href="#">Accueil</a></li><li><a class="fr-breadcrumb__link" href="#">Démarches</a></li><li><a class="fr-breadcrumb__link" aria-current="page">Page courante</a></li></ol></nav>`,
    },
    Pagination: {
      component: "Pagination", scenario: "default", state: "selected",
      ourSelector: ".st-pagination__page--active", refSelector: `.fr-pagination__link[aria-current="page"]`, lang: "fr",
      refMarkup: `<nav class="fr-pagination" role="navigation" aria-label="Pagination"><ul class="fr-pagination__list"><li><a class="fr-pagination__link" href="#">1</a></li><li><a class="fr-pagination__link" aria-current="page" href="#">2</a></li><li><a class="fr-pagination__link" href="#">3</a></li></ul></nav>`,
      note: `Page active = \`.fr-pagination__link[aria-current="page"]\` (lien rempli Bleu France).`,
    },
    Card: {
      component: "Card", scenario: "default", state: "rest",
      ourSelector: ".st-card", refSelector: ".fr-card", lang: "fr",
      refMarkup: `<div class="fr-card fr-card--sm" style="max-width:18rem"><div class="fr-card__body"><div class="fr-card__content"><h3 class="fr-card__title">Titre de carte</h3><p class="fr-card__desc">Contenu de la carte.</p></div></div></div>`,
    },
    Tabs: {
      component: "Tabs", scenario: "default", state: "selected",
      ourSelector: `.st-tabs__tab[aria-selected="true"]`, refSelector: `.fr-tabs__tab[aria-selected="true"]`, lang: "fr",
      refMarkup: `<div class="fr-tabs"><ul class="fr-tabs__list" role="tablist"><li role="presentation"><button class="fr-tabs__tab" role="tab" aria-selected="true">Actif</button></li><li role="presentation"><button class="fr-tabs__tab" role="tab" aria-selected="false">Second</button></li></ul></div>`,
    },
    Quote: {
      component: "Quote", scenario: "default", state: "rest",
      ourSelector: ".st-quote", refSelector: ".fr-quote", lang: "fr",
      refMarkup: `<figure class="fr-quote"><blockquote><p>La sobriété numérique est un impératif d'avenir.</p></blockquote><figcaption><p class="fr-quote__author">Auteur</p><cite>Référence</cite></figcaption></figure>`,
    },
    Highlight: {
      component: "Highlight", scenario: "default", state: "rest",
      ourSelector: ".st-highlight", refSelector: ".fr-highlight", lang: "fr",
      refMarkup: `<div class="fr-highlight"><p>Un encart de mise en avant éditoriale.</p></div>`,
    },
  },
  carbon: {
    Button: {
      component: "Button", scenario: "primary", state: "rest",
      ourSelector: ".st-button", refSelector: ".bx--btn--primary", lang: "en",
      refMarkup: `<button class="bx--btn bx--btn--primary">Primary</button> <button class="bx--btn bx--btn--secondary">Secondary</button>`,
    },
    ButtonDisabled: {
      component: "Button", scenario: "disabled", state: "disabled",
      ourSelector: ".st-button:disabled", refSelector: ".bx--btn--primary:disabled", lang: "en",
      refMarkup: `<button class="bx--btn bx--btn--primary" disabled>Disabled</button>`,
    },
    Input: {
      component: "Input", scenario: "default", state: "rest",
      ourSelector: ".st-control", refSelector: ".bx--text-input", lang: "en",
      refMarkup: `<div class="bx--form-item"><label class="bx--label" for="c">Email</label><input class="bx--text-input" id="c" placeholder="name@example.org"><div class="bx--form__helper-text">Helper text</div></div>`,
    },
    InputError: {
      component: "Input", scenario: "error", state: "error",
      ourSelector: `.st-control[aria-invalid="true"]`, refSelector: ".bx--text-input--invalid", lang: "en",
      refMarkup: `<div class="bx--form-item"><label class="bx--label" for="ce">Email</label><div class="bx--text-input__field-wrapper bx--text-input__field-wrapper--invalid"><input class="bx--text-input bx--text-input--invalid" id="ce" aria-invalid="true" placeholder="name@example.org"></div><div class="bx--form-requirement">Invalid address</div></div>`,
    },
    InputDisabled: {
      component: "Input", scenario: "disabled", state: "disabled",
      ourSelector: ".st-control:disabled", refSelector: ".bx--text-input:disabled", lang: "en",
      refMarkup: `<div class="bx--form-item"><label class="bx--label bx--label--disabled" for="cd">Email</label><input class="bx--text-input" id="cd" disabled placeholder="name@example.org"></div>`,
    },
    Textarea: {
      component: "Textarea", scenario: "default", state: "rest",
      ourSelector: ".st-textarea", refSelector: ".bx--text-area", lang: "en",
      refMarkup: `<div class="bx--form-item"><label class="bx--label" for="cta">Message</label><textarea class="bx--text-area" id="cta" rows="3" placeholder="Your message…"></textarea></div>`,
    },
    Select: {
      component: "Select", scenario: "default", state: "rest",
      ourSelector: ".st-select", refSelector: ".bx--select-input", lang: "en",
      refMarkup: `<div class="bx--form-item"><div class="bx--select"><label class="bx--label" for="cse">Region</label><div class="bx--select-input__wrapper"><select class="bx--select-input" id="cse"><option class="bx--select-option" value="north">North</option><option class="bx--select-option" value="south">South</option><option class="bx--select-option" value="east">East</option></select></div></div></div>`,
    },
    Search: {
      component: "Search", scenario: "default", state: "rest",
      ourSelector: ".st-search", refSelector: ".bx--search-input", lang: "en",
      refMarkup: `<div class="bx--search bx--search--lg" role="search"><div class="bx--search-magnifier"></div><label class="bx--label" for="csearch">Search</label><input class="bx--search-input" id="csearch" type="text" placeholder="Search"></div>`,
    },
    Link: {
      component: "Link", scenario: "default", state: "rest",
      ourSelector: ".st-link", refSelector: ".bx--link", lang: "en",
      refMarkup: `<a class="bx--link" href="#">Inline link</a>`,
    },
    Checkbox: {
      component: "Checkbox", scenario: "default", state: "rest",
      ourSelector: ".st-choice__label", refSelector: ".bx--checkbox-label-text", lang: "en",
      refMarkup: `<fieldset class="bx--fieldset"><div class="bx--form-item bx--checkbox-wrapper"><input type="checkbox" class="bx--checkbox" id="ccb" checked><label for="ccb" class="bx--checkbox-label"><span class="bx--checkbox-label-text">I accept the terms</span></label></div></fieldset>`,
      note: "Carbon checkbox control is a `::before` on the label. Measuring the label text (`.bx--checkbox-label-text`) — the comparable typography/colour.",
    },
    Radio: {
      component: "Radio", scenario: "default", state: "rest",
      ourSelector: ".st-choice__label", refSelector: ".bx--radio-button__label-text", lang: "en",
      refMarkup: `<fieldset class="bx--fieldset"><div class="bx--radio-button-group bx--radio-button-group--vertical"><div class="bx--radio-button-wrapper"><input type="radio" class="bx--radio-button" id="crb" name="crb" checked><label for="crb" class="bx--radio-button__label"><span class="bx--radio-button__appearance"></span><span class="bx--radio-button__label-text">Option A</span></label></div></div></fieldset>`,
      note: "Carbon radio control is `.bx--radio-button__appearance` (a circle). Measuring the label text (`.bx--radio-button__label-text`) — comparable typography/colour.",
    },
    Toggle: {
      component: "Toggle", scenario: "default", state: "rest",
      ourSelector: ".st-toggle__track", refSelector: ".bx--toggle__switch", lang: "en",
      refMarkup: `<div class="bx--form-item"><input type="checkbox" id="ctg" class="bx--toggle-input" checked><label class="bx--toggle-input__label" for="ctg">Enable notifications<span class="bx--toggle__switch"><span class="bx--toggle__text--off">Off</span><span class="bx--toggle__text--on">On</span></span></label></div>`,
    },
    Tag: {
      component: "Tag", scenario: "default", state: "rest",
      ourSelector: ".st-tag", refSelector: ".bx--tag", lang: "en",
      refMarkup: `<div class="bx--tag bx--tag--gray"><span class="bx--tag__label">Tag</span></div>`,
    },
    Alert: {
      component: "Alert", scenario: "default", state: "rest",
      ourSelector: ".st-alert", refSelector: ".bx--inline-notification", lang: "en",
      refMarkup: `<div class="bx--inline-notification bx--inline-notification--info" role="status"><div class="bx--inline-notification__details"><div class="bx--inline-notification__text-wrapper"><p class="bx--inline-notification__title">Notification</p><p class="bx--inline-notification__subtitle">Your request has been saved.</p></div></div></div>`,
    },
    Accordion: {
      component: "Accordion", scenario: "default", state: "rest",
      ourSelector: ".st-accordion__trigger", refSelector: ".bx--accordion__heading", lang: "en",
      refMarkup: `<ul class="bx--accordion"><li class="bx--accordion__item"><button class="bx--accordion__heading" aria-expanded="false" type="button"><svg class="bx--accordion__arrow" width="16" height="16" viewBox="0 0 16 16"></svg><div class="bx--accordion__title">First section</div></button><div class="bx--accordion__content"><p>First section content.</p></div></li></ul>`,
    },
    Breadcrumb: {
      component: "Breadcrumb", scenario: "default", state: "rest",
      ourSelector: ".st-breadcrumb a", refSelector: ".bx--breadcrumb-item .bx--link", lang: "en",
      refMarkup: `<nav class="bx--breadcrumb" aria-label="Breadcrumb"><div class="bx--breadcrumb-item"><a class="bx--link" href="#">Home</a></div><div class="bx--breadcrumb-item"><a class="bx--link" href="#">Catalog</a></div><div class="bx--breadcrumb-item bx--breadcrumb-item--current"><a class="bx--link" aria-current="page" href="#">Current page</a></div></nav>`,
    },
    Pagination: {
      component: "Pagination", scenario: "default", state: "selected",
      ourSelector: ".st-pagination__page--active", refSelector: ".bx--pagination-nav__page--active", lang: "en",
      refMarkup: `<nav class="bx--pagination-nav" aria-label="pagination"><ul class="bx--pagination-nav__list"><li class="bx--pagination-nav__list-item"><button class="bx--pagination-nav__page" type="button">1</button></li><li class="bx--pagination-nav__list-item"><button class="bx--pagination-nav__page bx--pagination-nav__page--active" type="button" aria-current="page">2</button></li><li class="bx--pagination-nav__list-item"><button class="bx--pagination-nav__page" type="button">3</button></li></ul></nav>`,
      note: "Active page = `.bx--pagination-nav__page--active` (the styled active page button).",
    },
    Card: {
      component: "Card", scenario: "default", state: "rest",
      ourSelector: ".st-card", refSelector: ".bx--tile", lang: "en",
      refMarkup: `<div class="bx--tile" style="max-width:18rem"><h3 style="margin:0 0 .5rem">Card title</h3><p style="margin:0">Card body content.</p></div>`,
    },
    Tabs: {
      component: "Tabs", scenario: "selected", state: "selected",
      ourSelector: `.st-tabs__tab[aria-selected="true"]`,
      refSelector: ".bx--tabs__nav-item--selected .bx--tabs__nav-link", lang: "en",
      refMarkup: `<nav class="bx--tabs"><ul class="bx--tabs__nav" role="tablist"><li class="bx--tabs__nav-item bx--tabs__nav-item--selected" role="tab"><a class="bx--tabs__nav-link" href="#">Active</a></li><li class="bx--tabs__nav-item" role="tab"><a class="bx--tabs__nav-link" href="#">Second</a></li></ul></nav>`,
      note: "Spec selector `.bx--tabs__nav-item--selected` is the `<li>` wrapper (0×0 box). Measuring its inner `.bx--tabs__nav-link` — the actual styled tab.",
    },
  },
};

/**
 * Retourne le manifest de comparaison, optionnellement enrichi de l'overlay
 * privé local (thèmes gitignorés, ex. Airbus).
 *
 * @param {{ includeLocal?: boolean }} [opts]
 * @returns {Record<string, Record<string, import('./manifest.d.ts').CompareEntry>>}
 */
export function getCompareManifest({ includeLocal = false } = {}) {
  if (!includeLocal) return COMPARE_MANIFEST;
  return mergeManifestOverlay(COMPARE_MANIFEST, COMPARE_MANIFEST_LOCAL);
}
