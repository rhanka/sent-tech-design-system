import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const docsRoot = resolve(__dirname, "../..");
const layoutSource = readFileSync(resolve(docsRoot, "src/routes/+layout.svelte"), "utf8");
const navigationSource = readFileSync(resolve(docsRoot, "src/lib/docs-navigation.ts"), "utf8");
const frameworkSource = readFileSync(resolve(docsRoot, "src/lib/framework.svelte.ts"), "utf8");
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
const canadaChromeSource = readFileSync(
  resolve(docsRoot, "src/lib/chrome/ChromeCanada.svelte"),
  "utf8"
);
const quebecChromeSource = readFileSync(
  resolve(docsRoot, "src/lib/chrome/ChromeQuebec.svelte"),
  "utf8"
);
const airbusChromeSource = readFileSync(
  resolve(docsRoot, "src/lib/chrome/ChromeAirbus.svelte"),
  "utf8"
);

function cssRule(source: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`))?.[1] ?? "";
}

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

  it("offers Angular in the shared framework selector and initial URL bootstrap", () => {
    expect(frameworkSource).toContain('{ id: "angular", label: "Angular" }');
    expect(appHtml).toContain('fw === "angular"');
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

  it("includes the imported tenants (Airbus, Canada, Québec) in the theme picker", () => {
    expect(layoutSource).toContain('const THEMES: TenantTheme[] = [sentTechTheme, dsfrTheme, carbonTheme, airbusTheme, canadaTheme, quebecTheme, ssenseTheme, lightspeedTheme, desjardinsTheme, nationalBankTheme, cirqueDuSoleilTheme, ubisoftTheme, bombardierTheme, caeTheme, saqTheme, cgiTheme, stmTheme, nuveiTheme, coveoTheme, circleKTheme, aldoTheme, brpTheme, miregoTheme, ellioTheme, airCanadaTheme, cascadesTheme, hopperTheme, dialogueTheme, momentFactoryTheme, lionElectricTheme, genetecTheme, videotronTheme, saputoTheme, metroTheme, workleapTheme, frankAndOakTheme, sidLeeTheme, simonsTheme, laVieEnRoseTheme, dollaramaTheme, bellTheme, behaviourInteractiveTheme, ronaTheme, gameloftTheme, cossetteTheme, eidosMontrealTheme, stingrayTheme, lg2Theme, sonderTheme, plusgradeTheme, gildanTheme, quebecorTheme, cogecoTheme, iaTheme, laurentianBankTheme, jeanCoutuTheme, reitmansTheme, stHubertTheme, benevaTheme, airTransatTheme, birksTheme, lufaFarmsTheme, hydroQuebecTheme, energirTheme, agropurTheme, vanHoutteTheme, dynamiteTheme, lvmhTheme, lorealTheme, totalenergiesTheme, sanofiTheme, bnpParibasTheme, hermesTheme, keringTheme, pernodRicardTheme, danoneTheme, accorTheme, axaTheme, societeGeneraleTheme, creditAgricoleTheme, edenredTheme, worldlineTheme, airLiquideTheme, schneiderElectricTheme, saintGobainTheme, engieTheme, edfTheme, dassaultSystemesTheme, thalesTheme, safranTheme, capgeminiTheme, orangeTheme, vinciTheme, bouyguesTheme, veoliaTheme, publicisTheme, renaultTheme]');
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
    expect(layoutSource).toContain('browser && (activeThemeId === "accor" || activeThemeId === "air-liquide" || activeThemeId === "schneider-electric" || activeThemeId === "engie" || activeThemeId === "edf" || activeThemeId === "loreal" || activeThemeId === "sanofi" || activeThemeId === "danone" || activeThemeId === "hermes" || activeThemeId === "kering" || activeThemeId === "lvmh" || activeThemeId === "orange" || activeThemeId === "bnp-paribas" || activeThemeId === "axa" || activeThemeId === "totalenergies" || activeThemeId === "carbon" || activeThemeId === "dsfr" || activeThemeId === "airbus" || activeThemeId === "canada" || activeThemeId === "quebec" || activeThemeId === "lightspeed" || activeThemeId === "desjardins" || activeThemeId === "ssense" || activeThemeId === "ubisoft" || activeThemeId === "cirque-du-soleil" || activeThemeId === "cgi" || activeThemeId === "national-bank" || activeThemeId === "bombardier" || activeThemeId === "saq" || activeThemeId === "nuvei" || activeThemeId === "coveo" || activeThemeId === "cae" || activeThemeId === "stm" || activeThemeId === "circle-k" || activeThemeId === "aldo" || activeThemeId === "brp" || activeThemeId === "air-canada" || activeThemeId === "metro" || activeThemeId === "hopper" || activeThemeId === "cascades" || activeThemeId === "dialogue" || activeThemeId === "moment-factory" || activeThemeId === "genetec" || activeThemeId === "saputo" || activeThemeId === "mirego" || activeThemeId === "ellio" || activeThemeId === "lion-electric" || activeThemeId === "videotron" || activeThemeId === "frank-and-oak" || activeThemeId === "sid-lee" || activeThemeId === "workleap" || activeThemeId === "simons" || activeThemeId === "la-vie-en-rose" || activeThemeId === "dollarama" || activeThemeId === "bell" || activeThemeId === "behaviour-interactive" || activeThemeId === "rona" || activeThemeId === "gameloft" || activeThemeId === "cossette" || activeThemeId === "eidos-montreal" || activeThemeId === "stingray" || activeThemeId === "lg2" || activeThemeId === "sonder" || activeThemeId === "plusgrade" || activeThemeId === "gildan" || activeThemeId === "quebecor" || activeThemeId === "cogeco" || activeThemeId === "ia" || activeThemeId === "laurentian-bank" || activeThemeId === "jean-coutu" || activeThemeId === "reitmans" || activeThemeId === "st-hubert" || activeThemeId === "beneva" || activeThemeId === "air-transat" || activeThemeId === "birks" || activeThemeId === "lufa-farms" || activeThemeId === "hydro-quebec" || activeThemeId === "energir" || activeThemeId === "agropur" || activeThemeId === "van-houtte" || activeThemeId === "dynamite")');
    expect(layoutSource).toContain("<ChromeCarbon");
    expect(layoutSource).toContain("<ChromeLightspeed");
    expect(layoutSource).toContain("<ChromeDesjardins");
    expect(layoutSource).toContain("<ChromeSsense");
    expect(layoutSource).toContain("<ChromeUbisoft");
    expect(layoutSource).toContain("<ChromeCirqueDuSoleil");
    expect(layoutSource).toContain("<ChromeCgi");
    expect(layoutSource).toContain("<ChromeNationalBank");
    expect(layoutSource).toContain("<ChromeBombardier");
    expect(layoutSource).toContain("<ChromeSaq");
    expect(layoutSource).toContain("<ChromeNuvei");
    expect(layoutSource).toContain("<ChromeCoveo");
    expect(layoutSource).toContain("<ChromeCae");
    expect(layoutSource).toContain("<ChromeStm");
    expect(layoutSource).toContain("<ChromeCircleK");
    expect(layoutSource).toContain("<ChromeAldo");
    expect(layoutSource).toContain("<ChromeBrp");
    expect(layoutSource).toContain("<ChromeAirCanada");
    expect(layoutSource).toContain("<ChromeMetro");
    expect(layoutSource).toContain("<ChromeHopper");
    expect(layoutSource).toContain("<ChromeCascades");
    expect(layoutSource).toContain("<ChromeDialogue");
    expect(layoutSource).toContain("<ChromeMomentFactory");
    expect(layoutSource).toContain("<ChromeGenetec");
    expect(layoutSource).toContain("<ChromeSaputo");
    expect(layoutSource).toContain("<ChromeMirego");
    expect(layoutSource).toContain("<ChromeEllio");
    expect(layoutSource).toContain("<ChromeLionElectric");
    expect(layoutSource).toContain("<ChromeVideotron");
    expect(layoutSource).toContain("<ChromeFrankAndOak");
    expect(layoutSource).toContain("<ChromeSidLee");
    expect(layoutSource).toContain("<ChromeWorkleap");
    expect(layoutSource).toContain("<ChromeSimons");
    expect(layoutSource).toContain("<ChromeLaVieEnRose");
    expect(layoutSource).toContain("<ChromeDollarama");
    expect(layoutSource).toContain("<ChromeBell");
    expect(layoutSource).toContain("<ChromeBehaviourInteractive");
    expect(layoutSource).toContain("<ChromeRona");
    expect(layoutSource).toContain("<ChromeGameloft");
    expect(layoutSource).toContain("<ChromeCossette");
    expect(layoutSource).toContain("<ChromeEidosMontreal");
    expect(layoutSource).toContain("<ChromeStingray");
    expect(layoutSource).toContain("<ChromeLg2");
    expect(layoutSource).toContain("<ChromeSonder");
    expect(layoutSource).toContain("<ChromePlusgrade");
    expect(layoutSource).toContain("<ChromeGildan");
    expect(layoutSource).toContain("<ChromeQuebecor");
    expect(layoutSource).toContain("<ChromeCogeco");
    expect(layoutSource).toContain("<ChromeIa");
    expect(layoutSource).toContain("<ChromeLaurentianBank");
    expect(layoutSource).toContain("<ChromeJeanCoutu");
    expect(layoutSource).toContain("<ChromeReitmans");
    expect(layoutSource).toContain("<ChromeStHubert");
    expect(layoutSource).toContain("<ChromeBeneva");
    expect(layoutSource).toContain("<ChromeAirTransat");
    expect(layoutSource).toContain("<ChromeBirks");
    expect(layoutSource).toContain("<ChromeLufaFarms");
    expect(layoutSource).toContain("<ChromeHydroQuebec");
    expect(layoutSource).toContain("<ChromeEnergir");
    expect(layoutSource).toContain("<ChromeAgropur");
    expect(layoutSource).toContain("<ChromeVanHoutte");
    expect(layoutSource).toContain("<ChromeDynamite");
    expect(layoutSource).toContain("<ChromeDsfr");
    expect(layoutSource).toContain("<ChromeAirbus");
    expect(layoutSource).toContain("<ChromeCanada");
    expect(layoutSource).toContain("<ChromeQuebec");
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
    expect(carbonChromeSource).toContain('class="cbn-header__search-btn"');
    expect(carbonChromeSource).not.toContain('href="https://www.carbondesignsystem.com/search/"');
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
    expect(airbusChromeSource).toContain('class="abus-header__search-input"');
    expect(airbusChromeSource).toContain('class="abus-header__search-btn"');
    expect(airbusChromeSource).toContain('href="/components/notification"');
    expect(airbusChromeSource).toContain('href="/components/overlays"');
    expect(airbusChromeSource).not.toContain('abus-header__contact-btn');
    expect(airbusChromeSource).not.toContain('mailto:contact@airbus.com?subject=Contact%20documentation%20design%20system');
  });

  it("opens the docs search palette from native themed search controls", () => {
    expect(layoutSource).toContain("function openSearch()");
    expect(layoutSource).toContain("function focusSearchInput()");
    expect(layoutSource).toContain("bind:this={searchOverlayPanel}");
    expect(layoutSource).toContain("onSearchOpen={openSearch}");

    for (const source of [
      carbonChromeSource,
      dsfrChromeSource,
      canadaChromeSource,
      quebecChromeSource,
      airbusChromeSource
    ]) {
      expect(source).toContain("onSearchOpen");
      expect(source).toContain("onclick={onSearchOpen}");
      expect(source).not.toContain("searchTrigger");
      expect(source).not.toContain(":global(.docs-search-trigger)");
    }

    expect(dsfrChromeSource).toContain('class="dsfr-search__input"');
    expect(dsfrChromeSource).toContain('class="dsfr-search__btn"');
    expect(canadaChromeSource).toContain('class="gc-search__input"');
    expect(canadaChromeSource).toContain('class="gc-search__btn"');
    expect(quebecChromeSource).toContain('class="qc-search__input"');
    expect(quebecChromeSource).toContain('class="qc-search__btn"');
  });

  it("keeps active side-nav labels vertically centered in DSFR, Canada and Quebec", () => {
    for (const [source, selector] of [
      [dsfrChromeSource, ".dsfr-side-link"],
      [canadaChromeSource, ".gc-side-link"],
      [quebecChromeSource, ".qc-side-link"]
    ] as const) {
      const rule = cssRule(source, selector);
      expect(rule).toContain("align-items: center;");
      expect(rule).toContain("display: flex;");
      expect(rule).toContain("box-sizing: border-box;");
    }
  });
});
