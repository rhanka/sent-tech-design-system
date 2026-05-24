import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const docsRoot = resolve(__dirname, "../..");
const layoutSource = readFileSync(resolve(docsRoot, "src/routes/+layout.svelte"), "utf8");
const appCss = readFileSync(resolve(docsRoot, "src/app.css"), "utf8");
const appHtml = readFileSync(resolve(docsRoot, "src/app.html"), "utf8");

describe("docs header alignment contract", () => {
  it("uses the official SENT wordmark without a product subtitle in the header", () => {
    expect(layoutSource).toContain('src="/SENT-logo.svg"');
    expect(layoutSource).not.toContain("docs-brand-product");
    expect(layoutSource).not.toContain("docs-brand-copy");
  });

  it("keeps the shared header metrics and favicon contract", () => {
    expect(appCss).toContain("--docs-header-height: 5rem;");
    expect(appHtml).toContain('href="/SENT-logo-squared.svg"');
  });

  it("renders account access as an icon popover, not a visible text CTA", () => {
    expect(layoutSource).not.toContain('"Connexion"');
    expect(layoutSource).not.toContain('"Sign In"');
    expect(layoutSource).toContain('class="docs-auth-trigger"');
  });
});
