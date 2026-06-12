import { createComponent } from "@sentropic/design-system-themes";
import type { TenantTheme } from "@sentropic/design-system-themes";

/**
 * Gouvernement du Québec — Système de design gouvernemental (SDG) theme for
 * the Sentropic token structure.
 *
 * All values below are taken from the PUBLIC SDG design tokens (`--qc-*`)
 * distributed under the MIT licence by Quebecca/qc_trousse_sdg. Only font
 * *names* are referenced (Open Sans), never font binaries. Sources and the full
 * mapping table are in MAPPING.md. Where the SDG has no direct equivalent for a
 * Sentropic role, the closest SDG token is used and the choice is noted
 * "à confirmer" in MAPPING.md.
 *
 * SDG colour reference (thème clair) — public/css/qc-sdg-design-tokens.css :
 *   Bleu PIV (brand / action / lien)    #095797   --qc-color-blue-piv
 *   Bleu medium (hover primaire)        #19406C   --qc-color-blue-medium
 *   Bleu dark (surface inverse/bandeau) #223654   --qc-color-blue-dark
 *   Bleu regular (interactif / focus)   #1472bf   --qc-color-blue-regular
 *   Bleu light                          #4a98d9   --qc-color-blue-light
 *   Bleu pale (teinte claire)           #dae6f0   --qc-color-blue-pale
 *   Violet (accent / lien visité)       #6b4fa1   --qc-color-purple
 *   Rouge (danger/erreur)               #cb381f   --qc-color-red-regular
 *   Vert (succès)                       #4f813d   --qc-color-green-regular
 *   Jaune AA (warning sur blanc)        #ad781c   (--qc-color-yellow-regular assombri)
 *   Rose (accent décoratif)             #e58271   --qc-color-pink-regular
 *   Gris 50 (surface alt)               #f1f1f2   --qc-color-grey-pale
 *   Gris 200 (bordure subtile)          #c5cad2   --qc-color-grey-light
 *   Gris 400 (bordure forte)            #8893a2   --qc-color-grey-regular
 *   Gris 600 (texte secondaire)         #6b778a   --qc-color-grey-medium
 *   Gris 700 (texte secondaire foncé)   #4e5662   --qc-color-grey-dark
 *   Gris 900 (texte primaire)           #1c2025   (à confirmer via --qc-color-text-primary)
 */

// --- SDG raw colour palette (public design tokens --qc-*) -------------------
const quebecColor = {
  blue: {
    piv: "#095797", // --qc-color-blue-piv (signature / action primaire / lien)
    medium: "#19406C", // --qc-color-blue-medium (hover primaire)
    dark: "#223654", // --qc-color-blue-dark (surface inverse / bandeau)
    regular: "#1472bf", // --qc-color-blue-regular (interactif / focus)
    light: "#4a98d9", // --qc-color-blue-light
    pale: "#dae6f0" // --qc-color-blue-pale (teinte claire)
  },
  purple: "#6b4fa1", // --qc-color-purple (accent / lien visité)
  grey: {
    0: "#ffffff",
    50: "#f1f1f2", // --qc-color-grey-pale (surface alt)
    200: "#c5cad2", // --qc-color-grey-light (bordure subtile)
    400: "#8893a2", // --qc-color-grey-regular (bordure forte)
    600: "#6b778a", // --qc-color-grey-medium (texte secondaire)
    700: "#4e5662", // --qc-color-grey-dark (texte secondaire foncé)
    900: "#1c2025" // texte primaire (à confirmer via --qc-color-text-primary)
  },
  system: {
    success: "#4f813d", // --qc-color-green-regular
    error: "#cb381f", // --qc-color-red-regular
    warning: "#ad781c", // --qc-color-yellow-regular assombri pour WCAG AA sur blanc
    info: "#095797" // --qc-color-blue-piv (info = bleu de marque)
  },
  accent: "#e58271" // --qc-color-pink-regular (décoratif)
} as const;

// --- foundation (SDG-specific values) ----------------------------------------
const foundation = {
  color: {
    // Sentropic "blue" role family → famille bleue SDG (bleu PIV = primaire)
    blue: {
      10: quebecColor.blue.pale, // #dae6f0 — teinte claire (hover secondaire)
      60: quebecColor.blue.piv, // #095797 — action primaire / lien
      80: quebecColor.blue.dark // #223654 — surface inverse / bandeau
    },
    // Sentropic "cyan" slot → accent purple/rose SDG (le SDG n'a pas de cyan)
    cyan: {
      10: quebecColor.blue.pale, // #dae6f0 — tint clair
      50: quebecColor.purple, // #6b4fa1 — violet accent / lien visité
      70: quebecColor.blue.medium // #19406C — hover accent sombre
    },
    // Sentropic "slate" → échelle de gris SDG
    slate: {
      0: quebecColor.grey[0], // #ffffff — blanc
      10: quebecColor.grey[50], // #f1f1f2 — surface alt
      20: quebecColor.grey[200], // #c5cad2 — bordure subtile
      60: quebecColor.grey[600], // #6b778a — texte secondaire
      80: quebecColor.grey[900], // #1c2025 — texte primaire
      90: quebecColor.grey[700] // #4e5662 — gris foncé (darkest accessible)
    },
    feedback: {
      success: quebecColor.system.success,
      warning: quebecColor.system.warning,
      error: quebecColor.system.error,
      info: quebecColor.system.info
    }
  },
  // SDG utilise Open Sans pour les titres ET le corps de texte (pas de police
  // d'affichage distincte). Mono : fallback système uniquement.
  font: {
    sans: "'Open Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Open Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  // Échelle d'espacement harmonisée — la grille SDG utilise une base 4px comparable.
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    12: "3rem", // 48px
    16: "4rem" // 64px
  },
  // SDG : contrôles légèrement arrondis (4px) ; pill = 999px.
  radius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.25rem", // 4px — boutons / inputs / tabs
    lg: "0.25rem", // 4px — cartes
    pill: "999px" // tags / pills
  },
  shadow: {
    subtle: "0 1px 2px rgb(28 32 37 / 0.10)",
    medium: "0 4px 12px rgb(28 32 37 / 0.14)",
    floating: "0 8px 24px rgb(28 32 37 / 0.18)"
  },
  motion: {
    fast: "120ms",
    normal: "180ms",
    slow: "280ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  z: {
    header: 50,
    toast: 60,
    overlay: 80,
    modal: 100,
    chat: 110
  },
  // --- Primitives anatomiques (SDG) -----------------------------------------
  borderWidth: {
    none: "0",
    thin: "1px",
    thick: "2px"
  },
  borderStyle: { solid: "solid" },
  // SDG : densité proche du GC — md cible 44px de hauteur de contrôle.
  density: {
    sm: { controlHeight: "2.25rem", paddingBlock: "0", paddingInline: "1rem", gap: "0.5rem", minWidth: "2.25rem", fontSize: "0.875rem" },
    md: { controlHeight: "2.75rem", paddingBlock: "0.5rem", paddingInline: "1.5rem", gap: "0.5rem", minWidth: "2.75rem", fontSize: "1rem" },
    lg: { controlHeight: "3.25rem", paddingBlock: "0", paddingInline: "2rem", gap: "0.5rem", minWidth: "3.25rem", fontSize: "1.125rem" }
  },
  // SDG n'a qu'une seule famille de polices (Open Sans) pour contrôles ET corps.
  typography: {
    control: { family: "'Open Sans', system-ui, sans-serif", size: "1rem", weight: "600", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    field: { family: "'Open Sans', system-ui, sans-serif", size: "1rem", weight: "400", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    label: { family: "'Open Sans', system-ui, sans-serif", size: "1rem", weight: "700", lineHeight: "1.5", letterSpacing: "0", textTransform: "none", textDecoration: "none", decorationThickness: "auto", decorationOffset: "auto" },
    // SDG : liens soulignés ; le soulignement s'épaissit au hover.
    link: {
      family: "inherit", size: "inherit", weight: "inherit", lineHeight: "inherit", letterSpacing: "0", textTransform: "none",
      textDecoration: "underline", decorationThickness: "0.08em", decorationOffset: "0.15em",
      textDecorationHover: "underline", decorationThicknessHover: "0.14em", decorationOffsetHover: "0.15em"
    }
  },
  disabledOpacity: "0.55",
  transition: { property: "background-color, border-color, color, outline-color", duration: "150ms", easing: "ease" },
  cursor: { interactive: "pointer", disabled: "not-allowed", text: "text" },
  iconSize: { sm: "1rem", md: "1.125rem", lg: "1.25rem" },
  // SDG FOCUS : outline épais haute-contraste dans le bleu régulier (#1472bf).
  focus: {
    strategy: "outline",
    width: "3px",
    offset: "1px",
    color: quebecColor.blue.regular, // #1472bf — bleu interactif / focus
    inset: "0"
  },
  // SDG champs : style "outline" — fond blanc, bordure 1px gris.400, rayon 4px.
  field: {
    style: "outline",
    fillBg: quebecColor.grey[0], // #ffffff
    underlineColor: quebecColor.grey[400], // #8893a2 (unused for outline, kept for completeness)
    underlineWidth: "1px",
    // Chevron select redessiné en bleu PIV SDG (#095797).
    selectAppearance: "none",
    selectChevron:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23095797' d='M8 11L3 6l1-1 4 4 4-4 1 1z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center",
    selectPaddingRight: "2.5rem"
  },
  // SDG cartes : bordure 1px gris, rayon 4px, hover = teinte gris pale.
  card: {
    borderWidth: "1px",
    lineHeight: "1.5",
    hoverBackground: quebecColor.grey[50] // #f1f1f2
  },
  // SDG bouton secondaire = outlined (fond transparent, bordure + texte PIV,
  // fill pale-bleu au hover).
  buttonSecondary: {
    background: "transparent",
    border: quebecColor.blue.piv, // #095797
    hoverBackground: quebecColor.blue.pale // #dae6f0
  },
  // SDG tabs : onglet actif = label bleu gras + soulignement bas bleu PIV.
  tabs: {
    activeText: quebecColor.blue.piv, // #095797
    activeBackground: "transparent",
    inactiveBackground: "transparent",
    activeWeight: "700",
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    fontSize: "1rem",
    lineHeight: "1.5rem",
    indicatorSide: "bottom",
    indicatorMode: "border"
  },
  // SDG pagination : liens bleu sans bordure ; page active = fond bleu PIV.
  pagination: {
    background: "transparent",
    border: "transparent",
    borderWidth: "0",
    text: quebecColor.blue.piv, // #095797
    activeBackground: quebecColor.blue.piv, // #095797
    activeText: quebecColor.grey[0], // blanc sur bleu
    activeBorderWidth: "0",
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
    minSize: "2.25rem",
    fontSize: "1rem",
    lineHeight: "1.5rem"
  },
  // SDG fil d'Ariane : liens bleu PIV, page courante = texte primaire.
  breadcrumb: {
    linkText: quebecColor.blue.piv, // #095797
    text: quebecColor.grey[600], // #6b778a
    currentText: quebecColor.grey[900], // #1c2025
    separator: quebecColor.grey[400], // #8893a2
    fontSize: "0.875rem",
    lineHeight: "1.5rem",
    currentWeight: "700"
  },
  // SDG alertes/notices : filet gauche coloré sur fond transparent.
  alert: {
    background: "transparent",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    accentWidth: "0",
    filetWidth: "0.25rem",
    paddingTop: "1rem",
    paddingRight: "1rem",
    paddingBottom: "1rem",
    paddingLeft: "1.25rem",
    fontSize: "1rem",
    lineHeight: "1.5rem"
  },
  // SDG accordéon : label summary gras foncé.
  accordion: {
    text: quebecColor.grey[900], // #1c2025
    paddingBlock: "0.75rem",
    paddingInline: "1rem",
    fontSize: "1rem",
    fontWeight: "700",
    lineHeight: "1.5rem"
  },
  // SDG tag : chip gris arrondi 4px.
  tag: {
    radius: "4px",
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "400",
    lineHeight: "1.5rem",
    minHeight: "1.5rem",
    neutralBackground: quebecColor.grey[50], // #f1f1f2
    neutralText: quebecColor.grey[900] // #1c2025
  },
  // SDG badge : 4px radius, fond bleu PIV, texte blanc.
  badge: {
    radius: "4px",
    paddingBlock: "0",
    paddingInline: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "700",
    lineHeight: "1.5rem",
    textTransform: "none",
    minHeight: "1.5rem",
    infoBackground: quebecColor.blue.piv, // #095797
    infoText: quebecColor.grey[0] // blanc
  },
  // SDG checkbox/radio : label standard.
  choice: {
    labelFontSize: "1rem",
    labelLineHeight: "1.5rem",
    radioLineHeight: "1.5rem",
    labelColor: quebecColor.grey[900] // #1c2025
  },
  // SDG champ de recherche.
  search: {
    paddingBlock: "0.5rem",
    paddingInline: "1rem",
    fontSize: "1rem",
    lineHeight: "1.5rem"
  },
  // SDG toggle / interrupteur.
  toggle: {
    trackPadding: "0",
    lineHeight: "1.5rem",
    textColor: quebecColor.grey[900] // #1c2025
  }
} as const;

// --- semantic (SDG-specific role mapping) ------------------------------------
const semantic = {
  surface: {
    default: quebecColor.grey[0], // #ffffff
    subtle: quebecColor.grey[50], // #f1f1f2 — surface alt
    raised: quebecColor.grey[0], // #ffffff
    inverse: quebecColor.blue.dark, // #223654 — bandeau/surface inverse
    overlay: "rgb(34 54 84 / 0.6)" // backdrop modal (teinte bleu foncé SDG)
  },
  text: {
    primary: quebecColor.grey[900], // #1c2025
    secondary: quebecColor.grey[600], // #6b778a
    muted: quebecColor.grey[400], // #8893a2
    inverse: quebecColor.grey[0], // blanc sur surfaces foncées
    link: quebecColor.blue.piv // #095797 (--qc-color-blue-piv)
  },
  border: {
    subtle: quebecColor.grey[200], // #c5cad2
    strong: quebecColor.grey[400], // #8893a2 (--qc-color-grey-regular)
    interactive: quebecColor.blue.piv // #095797
  },
  action: {
    primary: quebecColor.blue.piv, // #095797 — bouton primaire
    primaryHover: quebecColor.blue.medium, // #19406C — hover primaire
    primaryText: quebecColor.grey[0], // blanc sur bleu
    secondary: quebecColor.grey[50], // #f1f1f2 — surface secondaire
    secondaryHover: quebecColor.grey[200], // #c5cad2
    secondaryText: quebecColor.blue.piv, // #095797
    danger: quebecColor.system.error // #cb381f
  },
  feedback: {
    success: quebecColor.system.success,
    warning: quebecColor.system.warning,
    error: quebecColor.system.error,
    info: quebecColor.system.info
  },
  status: {
    pending: quebecColor.system.warning,
    processing: quebecColor.system.info,
    completed: quebecColor.system.success,
    failed: quebecColor.system.error
  },
  // Palette catégorielle dataviz SDG — proposition cohérente depuis les teintes
  // SDG ; non publiée officiellement (à confirmer).
  data: {
    category1: quebecColor.blue.piv, // bleu PIV signature
    category2: quebecColor.system.error, // rouge
    category3: quebecColor.system.success, // vert
    category4: quebecColor.blue.dark, // bleu foncé
    category5: quebecColor.purple, // violet
    category6: quebecColor.blue.regular, // bleu régulier
    category7: quebecColor.grey[600], // gris
    category8: quebecColor.system.warning // jaune/ambre
  }
} as const;

/**
 * Thème Gouvernement du Québec (SDG) pour le design system Sentropic.
 * Les `tokens` sont complets : `foundation` et `semantic` portent les valeurs
 * SDG-spécifiques, et la couche `component` est RECONSTRUITE depuis ce thème
 * via `createComponent` — la marque Québec atteint ainsi les composants
 * (boutons, tabs, pagination, bulles de chat…), pas seulement les éléments qui
 * lisent directement les vars sémantiques.
 */
export const quebecTheme: TenantTheme = {
  id: "quebec",
  label: "Gouvernement du Québec",
  mode: "light",
  tokens: {
    foundation,
    semantic,
    component: createComponent(semantic, foundation)
  }
};

export default quebecTheme;
