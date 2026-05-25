import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const docsRoot = resolve(__dirname, "../..");
const layoutSource = readFileSync(resolve(docsRoot, "src/routes/+layout.svelte"), "utf8");
const navigationSource = readFileSync(resolve(docsRoot, "src/lib/docs-navigation.ts"), "utf8");
const appCss = readFileSync(resolve(docsRoot, "src/app.css"), "utf8");
const appHtml = readFileSync(resolve(docsRoot, "src/app.html"), "utf8");

describe("docs header alignment contract", () => {
  it("uses the square SENT mark with the Sentropic service title", () => {
    expect(layoutSource).toContain('src="/SENT-logo-squared.svg"');
    expect(layoutSource).toContain('class="docs-brand-copy"');
    expect(layoutSource).toContain('class="docs-brand-name">Sentropic</span>');
    expect(layoutSource).toContain('class="docs-brand-product">Design System</span>');
    expect(layoutSource).not.toContain('src="/SENT-logo.svg"');
  });

  it("keeps the shared header metrics and favicon contract", () => {
    expect(appCss).toContain("--docs-header-height: 5rem;");
    expect(appCss).toContain("--docs-header-control-height: 2.25rem;");
    expect(appHtml).toContain('href="/SENT-logo-squared.svg"');
  });

  it("keeps right-side controls aligned and limits utility links to GitHub", () => {
    expect(layoutSource).toContain("Github");
    expect(layoutSource).not.toContain("ExternalLink");
    expect(layoutSource).toContain('class="docs-header-control docs-version"');
    expect(layoutSource).toContain('class="docs-header-control docs-header-menuButton docs-header-iconLink"');
    expect(layoutSource).toContain(
      'class="docs-header-control docs-header-menuButton docs-locale-trigger"'
    );
    expect(appCss).toContain(".docs-header-menuButton:hover");
    expect(appCss).toContain(".docs-header-menuButton[aria-expanded=\"true\"]");
    expect(layoutSource).not.toContain("sent-tech.ca");
    expect(navigationSource).not.toContain("sent-tech.ca");
    expect(navigationSource).toContain('label: "GitHub"');
  });

  it("does not render fake auth access in the public docs header", () => {
    expect(layoutSource).not.toContain('"Connexion"');
    expect(layoutSource).not.toContain('"Sign In"');
    expect(layoutSource).not.toContain("docs-auth-trigger");
    expect(layoutSource).not.toContain("docs-auth-popover");
    expect(layoutSource).not.toContain("isLoggedIn");
    expect(layoutSource).not.toContain("jm.sentropic@example.com");
  });

  it("keeps native browser tooltips out of header controls", () => {
    expect(layoutSource).not.toContain("title={item.label}");
    expect(layoutSource).not.toContain("title={locale.value");
  });
});
