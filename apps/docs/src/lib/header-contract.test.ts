import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_THEMES, THEMES } from "./theme-catalog";

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

/**
 * Extrait `var PUBLIC_BOOT_THEMES = [...]` du script pré-hydratation de
 * app.html. Lecture TOLÉRANTE : elle rend `null` quand la déclaration est
 * absente ou n'est pas un littéral de chaînes simples, pour que le test
 * ÉCHOUE avec un message lisible au lieu de lever une exception de parsing.
 */
function readBootAllowlist(source: string): string[] | null {
  const literal = source.match(/var PUBLIC_BOOT_THEMES = \[([\s\S]*?)\];/)?.[1];
  if (literal === undefined) return null;
  const entries = literal
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "");
  const ids = entries.map((entry) => /^"([^"]+)"$/.exec(entry)?.[1]);
  return ids.every((id): id is string => id !== undefined) ? ids : null;
}

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
    expect(THEMES.map((theme) => theme.id)).toEqual(
      expect.arrayContaining(["airbus", "canada", "quebec", "desjardins", "national-bank", "hydro-quebec"])
    );
  });

  // ── Confidentialité des thèmes tiers ────────────────────────────────────
  // Le COMPORTEMENT de la porte Ctrl+Shift+X se teste dans theme-access.test.ts,
  // sur des fonctions pures. Il ne reste ici que ce qu'un test comportemental
  // ne peut pas atteindre : le CÂBLAGE du layout vers ce module, et le script
  // pré-hydratation de app.html, qui s'exécute hors de tout module.

  it("wires every theme surface to the public list or to the pure access module", () => {
    // Surfaces publiques (menu mobile, configuration AppShell) : liste publique,
    // sans condition. Sélecteur : la seule liste que theme-access calcule.
    expect(layoutSource).toContain("const visibleThemes = PUBLIC_THEMES;");
    expect(layoutSource).toContain("themesForPicker(access, THEMES)");
    expect(layoutSource).toContain("themes={pickerThemes}");
    expect(layoutSource).not.toContain("themes={THEMES}");
    // L'accès ne se persiste pas : un seul geste ne doit pas ouvrir la porte
    // pour toutes les sessions futures de ce navigateur.
    expect(layoutSource).not.toContain("st-docs-demo-mode");
    expect(appHtml).not.toContain("st-docs-demo-mode");
  });

  it("closes the theme picker on navigation, by the same transition as any close", () => {
    // Un sélecteur ouvert par Ctrl+Shift+X ne doit pas suivre le visiteur d'une
    // page à l'autre avec le catalogue complet. La fermeture passe par
    // `closePicker`, comme Échap / ✕ / fond : elle rétrécit la portée sans
    // rien remasquer. Ce câblage-là ne se voit pas depuis les fonctions pures.
    const afterNavigateBody = layoutSource.match(/afterNavigate\(\(\) => \{([\s\S]*?)\n  \}\);/)?.[1];
    expect(afterNavigateBody, "bloc afterNavigate introuvable dans +layout.svelte").toBeDefined();
    expect(afterNavigateBody).toContain("searchOpen = false;");
    expect(afterNavigateBody).toContain("access = closePicker(access);");
  });

  it("keeps the pre-hydration theme allowlist EQUAL to the public list", () => {
    // app.html pose data-st-theme et amorce ?theme AVANT l'hydratation, à
    // partir d'un localStorage qui peut très bien contenir une marque privée
    // (choisie pendant une démonstration). Sa liste en dur est donc une
    // frontière de confidentialité, pas une commodité.
    //
    // ÉGALITÉ, pas inclusion : une liste trop LARGE laisserait fuiter une
    // marque privée, une liste trop ÉTROITE priverait d'amorce d'URL des
    // thèmes publics parfaitement légitimes — et déplacerait silencieusement
    // l'ensemble des chargements qui empruntent le chemin sans param. Un test
    // d'inclusion laisserait passer `["sent-tech"]` seul ; celui-ci non.
    const allowlist = readBootAllowlist(appHtml);
    expect(
      allowlist,
      "var PUBLIC_BOOT_THEMES = [...] introuvable ou pas un littéral de chaînes dans app.html"
    ).not.toBeNull();

    const publicIds = PUBLIC_THEMES.map((theme) => theme.id);
    // Comparaison triée des deux côtés : l'ordre de la liste d'amorce n'a
    // aucun sens fonctionnel, mais tout écart d'appartenance ou de cardinalité
    // (oubli, ajout, doublon) fait échouer.
    expect([...allowlist!].sort()).toEqual([...publicIds].sort());

    // L'attribut ET l'amorce d'URL passent par le même verdict.
    expect(appHtml).toContain("var themeIsPublic = PUBLIC_BOOT_THEMES.indexOf(theme) !== -1;");
    expect(appHtml).toMatch(
      /if \(themeIsPublic\) \{\s*document\.documentElement\.setAttribute\("data-st-theme", theme\);/
    );
    expect(appHtml).toContain('if (!params.has("theme") && themeIsPublic && theme !== "sent-tech") {');
    // Plus de drapeau persisté : la décision se fonde sur la liste publique.
    expect(appHtml).not.toContain("st-docs-theme-public");
    expect(layoutSource).not.toContain("st-docs-theme-public");
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
    expect(layoutSource).toContain('browser && (activeThemeId === "saint-gobain" || activeThemeId === "dassault-systemes" || activeThemeId === "thales" || activeThemeId === "safran" || activeThemeId === "capgemini" || activeThemeId === "pernod-ricard" || activeThemeId === "credit-agricole" || activeThemeId === "societe-generale" || activeThemeId === "edenred" || activeThemeId === "worldline" || activeThemeId === "vinci" || activeThemeId === "bouygues" || activeThemeId === "veolia" || activeThemeId === "publicis" || activeThemeId === "renault" || activeThemeId === "accor" || activeThemeId === "air-liquide" || activeThemeId === "schneider-electric" || activeThemeId === "engie" || activeThemeId === "edf" || activeThemeId === "loreal" || activeThemeId === "sanofi" || activeThemeId === "danone" || activeThemeId === "hermes" || activeThemeId === "kering" || activeThemeId === "lvmh" || activeThemeId === "orange" || activeThemeId === "bnp-paribas" || activeThemeId === "axa" || activeThemeId === "totalenergies" || activeThemeId === "carbon" || activeThemeId === "dsfr" || activeThemeId === "airbus" || activeThemeId === "canada" || activeThemeId === "quebec" || activeThemeId === "lightspeed" || activeThemeId === "desjardins" || activeThemeId === "ssense" || activeThemeId === "ubisoft" || activeThemeId === "cirque-du-soleil" || activeThemeId === "cgi" || activeThemeId === "national-bank" || activeThemeId === "bombardier" || activeThemeId === "saq" || activeThemeId === "nuvei" || activeThemeId === "coveo" || activeThemeId === "cae" || activeThemeId === "stm" || activeThemeId === "circle-k" || activeThemeId === "aldo" || activeThemeId === "brp" || activeThemeId === "air-canada" || activeThemeId === "metro" || activeThemeId === "hopper" || activeThemeId === "cascades" || activeThemeId === "dialogue" || activeThemeId === "moment-factory" || activeThemeId === "genetec" || activeThemeId === "saputo" || activeThemeId === "mirego" || activeThemeId === "ellio" || activeThemeId === "lion-electric" || activeThemeId === "videotron" || activeThemeId === "frank-and-oak" || activeThemeId === "sid-lee" || activeThemeId === "workleap" || activeThemeId === "simons" || activeThemeId === "la-vie-en-rose" || activeThemeId === "dollarama" || activeThemeId === "bell" || activeThemeId === "behaviour-interactive" || activeThemeId === "rona" || activeThemeId === "gameloft" || activeThemeId === "cossette" || activeThemeId === "eidos-montreal" || activeThemeId === "stingray" || activeThemeId === "lg2" || activeThemeId === "sonder" || activeThemeId === "plusgrade" || activeThemeId === "gildan" || activeThemeId === "quebecor" || activeThemeId === "cogeco" || activeThemeId === "ia" || activeThemeId === "laurentian-bank" || activeThemeId === "jean-coutu" || activeThemeId === "reitmans" || activeThemeId === "st-hubert" || activeThemeId === "beneva" || activeThemeId === "air-transat" || activeThemeId === "birks" || activeThemeId === "lufa-farms" || activeThemeId === "hydro-quebec" || activeThemeId === "energir" || activeThemeId === "agropur" || activeThemeId === "van-houtte" || activeThemeId === "dynamite" || activeThemeId === "anthropic" || activeThemeId === "openai" || activeThemeId === "gemini" || activeThemeId === "github" || activeThemeId === "mistral" || activeThemeId === "perplexity" || activeThemeId === "copilot" || activeThemeId === "palantir" || activeThemeId === "nous-hermes" || activeThemeId === "amazon" || activeThemeId === "vercel" || activeThemeId === "assistant-ui" || activeThemeId === "cohere" || activeThemeId === "xai" || activeThemeId === "meta" || activeThemeId === "together" || activeThemeId === "deepseek" || activeThemeId === "databricks" || activeThemeId === "ai21" || activeThemeId === "stability" || activeThemeId === "groq" || activeThemeId === "replicate" || activeThemeId === "huggingface" || activeThemeId === "character-ai" || activeThemeId === "inflection" || activeThemeId === "you" || activeThemeId === "openrouter" || activeThemeId === "writer" || activeThemeId === "poe" || activeThemeId === "fireworks")');
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
