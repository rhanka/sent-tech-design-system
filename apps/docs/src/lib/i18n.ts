export type Locale = "fr" | "en";

const copy = {
  fr: {
    title: "Sent Tech Design System",
    subtitle: "Composants Svelte, tokens, marque blanche et thèmes tenant.",
    overview: "Fondations",
    overviewBody:
      "La V1 expose des tokens stables, un compilateur de thèmes runtime/build-time et des primitives Svelte prêtes pour Forge et Entropic.",
    components: "Composants",
    buttonTitle: "Button",
    buttonIntro: "Action principale, secondaire, fantôme ou destructive.",
    formsTitle: "Forms",
    formsIntro:
      "Champs, sélections et contrôles binaires pour interfaces produit denses et white-label.",
    overlaysTitle: "Overlays",
    overlaysIntro:
      "Dialogues, infobulles et notifications pour actions ponctuelles sans couplage produit.",
    statusStable: "Stable",
    examplesTitle: "Exemples",
    apiTitle: "API",
    tokensTitle: "Tokens utilisés",
    tokenPolicyTitle: "Contrat marque blanche",
    tokenPolicyBody:
      "Les composants ne consomment que des variables sémantiques et component tokens afin de pouvoir adapter un tenant ou un design system externe sans réécrire les composants.",
    variants: "Variantes",
    sizes: "Tailles",
    states: "États",
    validation: "Validation",
    selectionControls: "Contrôles de sélection",
    feedback: "Feedback"
  },
  en: {
    title: "Sent Tech Design System",
    subtitle: "Svelte components, tokens, white-labeling, and tenant themes.",
    overview: "Foundations",
    overviewBody:
      "V1 exposes stable tokens, a runtime/build-time theme compiler, and Svelte primitives ready for Forge and Entropic.",
    components: "Components",
    buttonTitle: "Button",
    buttonIntro: "Primary, secondary, ghost, or destructive action.",
    formsTitle: "Forms",
    formsIntro: "Fields, selections, and binary controls for dense white-label product UIs.",
    overlaysTitle: "Overlays",
    overlaysIntro: "Dialogs, tooltips, and notifications for focused product interactions.",
    statusStable: "Stable",
    examplesTitle: "Examples",
    apiTitle: "API",
    tokensTitle: "Used tokens",
    tokenPolicyTitle: "White-label contract",
    tokenPolicyBody:
      "Components only consume semantic variables and component tokens, so a tenant or external design system can be adapted without rewriting components.",
    variants: "Variants",
    sizes: "Sizes",
    states: "States",
    validation: "Validation",
    selectionControls: "Selection controls",
    feedback: "Feedback"
  }
} as const;

export function t(locale: Locale, key: keyof typeof copy.fr): string {
  return copy[locale][key];
}
