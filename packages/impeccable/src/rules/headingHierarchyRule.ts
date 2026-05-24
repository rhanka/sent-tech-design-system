import type { Finding, Rule, RuleContext } from "../types.js";
import { createFindingFromElement } from "./utils.js";

export const headingHierarchyRule: Rule = {
  id: "heading-hierarchy",
  description: "Enforce correct semantic heading hierarchy (H1-H6) and exactly one H1 per page for SEO and a11y.",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const headings = Array.from(
      context.document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    );

    if (headings.length === 0) {
      return findings;
    }

    // Rule 1: Exactly one H1 per page
    const h1s = headings.filter((h) => h.tagName === "H1");
    if (h1s.length === 0) {
      // Find the first heading to attach the finding
      findings.push({
        ruleId: this.id,
        severity: "medium",
        message: "No H1 heading found on the page. Exactly one H1 is required for SEO and accessibility hierarchy.",
        location: "body",
        suggestion: "Add a single, descriptive H1 heading at the top of the main content."
      });
    } else if (h1s.length > 1) {
      for (let i = 1; i < h1s.length; i++) {
        findings.push(
          createFindingFromElement(
            this.id,
            "medium",
            `Multiple H1 headings detected. Only one H1 heading is allowed per page for proper SEO structural hierarchy.`,
            h1s[i],
            "Change this secondary H1 heading to an H2 or H3."
          )
        );
      }
    }

    // Rule 2: Heading levels should not be skipped (e.g. H1 to H3)
    let lastLevel = 0;
    for (const heading of headings) {
      const level = parseInt(heading.tagName.substring(1), 10);
      
      // If we are nesting deeper than 1 level at a time (e.g., last was H1 (1), current is H3 (3))
      if (lastLevel > 0 && level > lastLevel + 1) {
        findings.push(
          createFindingFromElement(
            this.id,
            "medium",
            `Skipped heading level detected (H${lastLevel} directly to H${level}). Headings must form a consecutive hierarchical tree.`,
            heading,
            `Change this heading to H${lastLevel + 1} or insert an intermediate H${lastLevel + 1} heading before it.`
          )
        );
      }
      lastLevel = level;
    }

    return findings;
  }
};
