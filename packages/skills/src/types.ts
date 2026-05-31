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
