// apps/docs/src/lib/compare/reference-themes.mjs
// Docs-local reference registry. Presence of an entry = "import theme" → enables
// (client-side) the Compare button + the "gaps" nav item. NOT part of the
// published npm API (correction C2). CDN URLs are pinned for reproducibility (C8).

const DSFR_CDN = "https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.14.4/dist";
const CARBON_CDN = "https://cdn.jsdelivr.net/npm/carbon-components@10.58.15";

export const REFERENCE_THEMES = {
  dsfr: {
    label: "Système de Design de l'État (DSFR)",
    cssUrl: `${DSFR_CDN}/dsfr.min.css`,
    // Marianne via les @font-face de la CSS utilitaire DSFR (pinée).
    fontLinks:
      `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` +
      `<link rel="stylesheet" href="${DSFR_CDN}/utility/utility.min.css">`,
    // Chaîne de marque appliquée au <body> de l'iframe de référence (mêmes
    // fallbacks que notre côté → comparaison sans fallback asymétrique).
    brandFont: "Marianne, arial, system-ui, sans-serif",
    lang: "fr",
  },
  carbon: {
    label: "Carbon Design System (IBM)",
    cssUrl: `${CARBON_CDN}/css/carbon-components.min.css`,
    // IBM Plex Sans via Google Fonts (Carbon ne sert pas la police lui-même) —
    // sans quoi la référence retombe sur un fallback système (régression G6).
    fontLinks:
      `<link rel="preconnect" href="https://fonts.googleapis.com">` +
      `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` +
      `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap">`,
    brandFont: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
    lang: "en",
  },
};
