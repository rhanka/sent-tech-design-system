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
    fontLinks:
      `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` +
      `<link rel="stylesheet" href="${DSFR_CDN}/utility/utility.min.css">`,
    brandFont: "Marianne, system-ui, sans-serif",
    lang: "fr",
  },
  carbon: {
    label: "Carbon Design System (IBM)",
    cssUrl: `${CARBON_CDN}/css/carbon-components.min.css`,
    fontLinks: "",
    brandFont: "'IBM Plex Sans', system-ui, sans-serif",
    lang: "en",
  },
};
