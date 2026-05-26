import { openDom } from "./openDom.js";
import { defaultRules } from "../rules/index.js";
import type { AuditOptions, AuditReport, AuditTarget, Finding } from "../types.js";

export async function audit(target: AuditTarget, options: AuditOptions = {}): Promise<AuditReport> {
  const start = Date.now();
  const dom = await openDom(target);
  const rules = options.rules ?? defaultRules;
  const findings: Finding[] = [];

  for (const rule of rules) {
    try {
      findings.push(...rule.evaluate({ document: dom.window.document, target }));
    } catch (error) {
      if (error instanceof Error) {
        findings.push({
          ruleId: rule.id,
          severity: "low",
          message: `Rule '${rule.id}' threw: ${error.message}`,
          location: ":root"
        });
      } else {
        findings.push({
          ruleId: rule.id,
          severity: "low",
          message: `Rule '${rule.id}' threw an unknown error`,
          location: ":root"
        });
      }
    }
  }

  dom.window.close();

  return {
    target,
    findings,
    durationMs: Date.now() - start
  };
}
