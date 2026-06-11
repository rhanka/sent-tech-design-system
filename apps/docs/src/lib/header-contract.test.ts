import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const docsRoot = resolve(__dirname, "../..");
const layoutSource = readFileSync(resolve(docsRoot, "src/routes/+layout.svelte"), "utf8");
const navigationSource = readFileSync(resolve(docsRoot, "src/lib/docs-navigation.ts"), "utf8");
const appCss = readFileSync(resolve(docsRoot, "src/app.css"), "utf8");
const appHtml = readFileSync(resolve(docsRoot, "src/app.html"), "utf8");
const carbonChromeSource = readFileSync(
  resolve(docsRoot, "src/lib/chrome/ChromeCarbon.svelte"),
  "utf8"
);
const dsfrChromeSource = readFileSync(
  resolve(docsRoot, "src/lib/chrome/ChromeDsfr.svelte"),
  "utf8"
);
const airbusChromeSource = readFileSync(
  resolve(docsRoot, "src/lib/chrome/ChromeAirbus.svelte"),
  "utf8"
);

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

  it("keeps right-side controls aligned and exposes a framework switcher", () => {
    expect(layoutSource).toContain("Github");
    expect(layoutSource).not.toContain("ExternalLink");
    // Le sélecteur de framework reprend la mécanique du sélecteur de langue/thème.
    expect(layoutSource).toContain(
      'class="docs-header-control docs-header-menuButton docs-locale-trigger docs-framework-trigger"'
    );
    expect(layoutSource).toContain("frameworkSelector");
    expect(layoutSource).toContain(
      'class="docs-header-control docs-header-menuButton docs-locale-trigger"'
    );
    expect(appCss).toContain(".docs-header-menuButton:hover");
    expect(appCss).toContain(".docs-header-menuButton[aria-expanded=\"true\"]");
    expect(layoutSource).not.toContain("sent-tech.ca");
    expect(navigationSource).not.toContain("sent-tech.ca");
    expect(navigationSource).toContain('label: "GitHub"');
  });

  it("moves the version + GitHub link to the bottom of the left sidebar", () => {
    // Plus de version ni de lien utilitaire GitHub dans la barre du header.
    expect(layoutSource).not.toContain('class="docs-header-control docs-version"');
    expect(layoutSource).not.toContain(
      'class="docs-header-control docs-header-menuButton docs-header-iconLink"'
    );
    // Pied de barre latérale par défaut.
    expect(layoutSource).toContain('class="docs-sidebar-footer"');
    expect(layoutSource).toContain('class="docs-sidebar-version"');
    expect(layoutSource).toContain('class="docs-sidebar-github"');
    expect(appCss).toContain(".docs-sidebar-footer");
    // Pied de barre latérale dans chaque chrome tiers.
    expect(carbonChromeSource).toContain('class="cbn-sidebar-footer"');
    expect(dsfrChromeSource).toContain('class="dsfr-sidebar-footer"');
    expect(airbusChromeSource).toContain('class="abus-sidebar-footer"');
  });

  it("renders the framework switcher in every themed chrome header", () => {
    expect(carbonChromeSource).toContain("frameworkSwitcher");
    expect(dsfrChromeSource).toContain("frameworkSwitcher");
    expect(airbusChromeSource).toContain("frameworkSwitcher");
  });

  it("includes the imported tenants (Airbus, Canada) in the theme picker", () => {
    expect(layoutSource).toContain('const THEMES: TenantTheme[] = [sentTechTheme, dsfrTheme, carbonTheme, airbusTheme, canadaTheme]');
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

describe("docs themed chrome contract", () => {
  it("wires dedicated chrome shells for mapped import themes", () => {
    expect(layoutSource).toContain('const useCustomChrome = $derived(');
    expect(layoutSource).toContain('browser && (activeThemeId === "carbon" || activeThemeId === "dsfr" || activeThemeId === "airbus" || activeThemeId === "canada")');
    expect(layoutSource).toContain("<ChromeCarbon");
    expect(layoutSource).toContain("<ChromeDsfr");
    expect(layoutSource).toContain("<ChromeAirbus");
    expect(layoutSource).toContain("<ChromeCanada");
  });

  it("keeps sent-tech shell as default chrome contract", () => {
    expect(layoutSource).toContain('class="docs-shell"');
  });

  it("documents carbon chrome structure without a brand logo (Carbon ships none)", () => {
    expect(carbonChromeSource).toContain('class="cbn-shell"');
    expect(carbonChromeSource).not.toContain('src="/chrome/carbon/logo.svg"');
    expect(carbonChromeSource).toContain('class="cbn-header__brand-name">Carbon Design System');
    expect(carbonChromeSource).toContain("class=\"cbn-header\"");
    expect(carbonChromeSource).toContain("class=\"cbn-sidebar\"");
    expect(carbonChromeSource).toContain('href="https://www.carbondesignsystem.com/search/"');
    expect(carbonChromeSource).toContain('href="https://www.ibm.com/design/"');
    expect(carbonChromeSource).not.toContain('Wire-up réel en attente');
  });

  it("documents dsfr chrome structure and brand asset", () => {
    expect(dsfrChromeSource).toContain('class="dsfr-shell"');
    expect(dsfrChromeSource).toContain('src="/chrome/dsfr/logo-rf.svg"');
    expect(dsfrChromeSource).toContain("class=\"dsfr-header\"");
    expect(dsfrChromeSource).toContain("class=\"dsfr-sidebar\"");
    expect(dsfrChromeSource).toContain("class=\"dsfr-nav\"");
  });

  it("documents airbus chrome structure and brand asset", () => {
    expect(airbusChromeSource).toContain('class="abus-shell"');
    expect(airbusChromeSource).toContain('src="/chrome/airbus/logo-white.svg"');
    expect(airbusChromeSource).toContain("class=\"abus-header\"");
    expect(airbusChromeSource).toContain("class=\"abus-sidebar\"");
    expect(airbusChromeSource).toContain("class=\"abus-breadcrumb\"");
    expect(airbusChromeSource).toContain('href="/components/search"');
    expect(airbusChromeSource).toContain('href="/components/notification"');
    expect(airbusChromeSource).toContain('href="/components/overlays"');
    expect(airbusChromeSource).toContain('mailto:contact@airbus.com?subject=Contact%20documentation%20design%20system');
  });
});
