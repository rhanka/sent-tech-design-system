export type Severity = "high" | "medium" | "low";

export interface AuditTarget {
  kind: "url" | "html" | "file";
  value: string;
}

export interface Finding {
  ruleId: string;
  severity: Severity;
  message: string;
  location: string;
  suggestion?: string;
}

export interface RuleContext {
  document: Document;
  target: AuditTarget;
}

export interface Rule {
  id: string;
  description: string;
  principle?: string;
  wp7Finding?: string;
  severity: Severity;
  evaluate(context: RuleContext): Finding[];
}

export interface AuditOptions {
  rules?: Rule[];
}

export interface AuditReport {
  target: AuditTarget;
  findings: Finding[];
  durationMs: number;
}

export type VisualLocale = "fr" | "en";

/** Rapport visuel d'une seule page composant rendue dans le navigateur. */
export interface VisualPageReport {
  slug: string;
  url: string;
  /** Chemin du screenshot pleine page (vide si la page a échoué). */
  screenshot: string;
  findings: Finding[];
}

/** Rapport agrégé d'un audit visuel headless multi-pages. */
export interface VisualAuditReport {
  target: string;
  locale: VisualLocale;
  engine: "playwright-chromium";
  browser: { headless: boolean; executablePath?: string };
  outDir: string;
  pages: VisualPageReport[];
  totalFindings: number;
  score: number;
  durationMs: number;
}

export type FrameworkId = "svelte" | "react" | "vue";

/** Diff pixel d'un bloc d'exemple entre deux frameworks. */
export interface ParityComparison {
  /** Ratio de pixels différents (0..1). */
  ratio: number;
  /** Nombre de pixels différents. */
  diffPixels: number;
  /** Surface comparée en pixels (width*height de l'intersection). */
  totalPixels: number;
  /** true si ratio > threshold OU dimensions divergentes. */
  flagged: boolean;
  /** Chemin de la heatmap PNG (vide si non générée). */
  heatmap: string;
  /** Renseigné si les deux captures n'ont pas les mêmes dimensions. */
  dimsMismatch?: { a: { w: number; h: number }; b: { w: number; h: number } };
}

/** Rapport de parité d'un bloc d'exemple `.tex` (les 3 captures + 2 diffs). */
export interface ParityBlockReport {
  index: number;
  /** Titre humain du bloc (h3.tex__title) si présent. */
  title?: string;
  /** Captures par framework (chemins relatifs au outDir). */
  shots: Partial<Record<FrameworkId, string>>;
  parity: {
    svelteVsReact: ParityComparison | null;
    svelteVsVue: ParityComparison | null;
  };
}

/** Rapport de parité d'une page composant complète. */
export interface ParityPageReport {
  slug: string;
  url: string;
  blocks: ParityBlockReport[];
  /** Findings DOM/CSS déterministes (couche 2), tous frameworks confondus. */
  dom: Finding[];
  /** Score de parité de la page (0..100). */
  parityScore: number;
  /** Nombre de blocs flaggés pour écart de parité. */
  flaggedBlocks: number;
  error?: string;
}

/** Rapport agrégé d'un audit de parité tri-framework. */
export interface ParityAuditReport {
  target: string;
  locale: VisualLocale;
  engine: "playwright-chromium";
  browser: { headless: boolean; executablePath?: string };
  outDir: string;
  threshold: number;
  frameworks: FrameworkId[];
  pages: ParityPageReport[];
  /** Total de blocs comparés sur toutes les pages. */
  totalBlocks: number;
  /** Total de blocs flaggés (parité). */
  totalFlaggedBlocks: number;
  /** Total de findings DOM. */
  totalDomFindings: number;
  /** Score de parité global (0..100). */
  parityScore: number;
  durationMs: number;
}
