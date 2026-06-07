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
