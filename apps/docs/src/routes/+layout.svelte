<script lang="ts">
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { replaceState, afterNavigate } from "$app/navigation";
  import { tick, untrack } from "svelte";
  import "../app.css";
  // CSS global des composants (classes .st-*) pour styler les îles React/Vue/Angular :
  // le Svelte a ses styles scoped, mais les rendus React/Vue/Angular n'ont que les classes
  // sans règles tant que ce stylesheet global (identique entre frameworks) n'est pas chargé.
  import "@sentropic/design-system-react/styles.css";
  import { Boxes, ChevronDown, Github, Globe, Menu, Moon, Palette, Sun, User, X } from "@lucide/svelte";
  import { Header, IdentityMenu, Menu as DsMenu } from "@sentropic/design-system-svelte";
  import { auth } from "$lib/auth/auth.svelte";
  import {
    sentTechTheme,
    type TenantTheme
  } from "@sentropic/design-system-themes";
  import { compileThemeModes } from "$lib/compile-modes";
  import { colorMode, type ColorMode } from "$lib/color-mode.svelte";
  import { dsfrTheme } from "@sentropic/design-system-theme-dsfr";
  import { carbonTheme } from "@sentropic/design-system-theme-carbon";
  import { airbusTheme } from "@sentropic/design-system-theme-airbus";
  import { canadaTheme } from "@sentropic/design-system-theme-canada";
  import { quebecTheme } from "@sentropic/design-system-theme-quebec";
  import { ssenseTheme } from "@sentropic/design-system-theme-ssense";
  import { lightspeedTheme } from "@sentropic/design-system-theme-lightspeed";
  import { desjardinsTheme } from "@sentropic/design-system-theme-desjardins";
  import { nationalBankTheme } from "@sentropic/design-system-theme-national-bank";
  import { cirqueDuSoleilTheme } from "@sentropic/design-system-theme-cirque-du-soleil";
  import { ubisoftTheme } from "@sentropic/design-system-theme-ubisoft";
  import { bombardierTheme } from "@sentropic/design-system-theme-bombardier";
  import { caeTheme } from "@sentropic/design-system-theme-cae";
  import { saqTheme } from "@sentropic/design-system-theme-saq";
  import { cgiTheme } from "@sentropic/design-system-theme-cgi";
  import { stmTheme } from "@sentropic/design-system-theme-stm";
  import { nuveiTheme } from "@sentropic/design-system-theme-nuvei";
  import { coveoTheme } from "@sentropic/design-system-theme-coveo";
  import { circleKTheme } from "@sentropic/design-system-theme-circle-k";
  import { aldoTheme } from "@sentropic/design-system-theme-aldo";
  import { brpTheme } from "@sentropic/design-system-theme-brp";
  import { miregoTheme } from "@sentropic/design-system-theme-mirego";
  import { ellioTheme } from "@sentropic/design-system-theme-ellio";
  import { airCanadaTheme } from "@sentropic/design-system-theme-air-canada";
  import { cascadesTheme } from "@sentropic/design-system-theme-cascades";
  import { hopperTheme } from "@sentropic/design-system-theme-hopper";
  import { dialogueTheme } from "@sentropic/design-system-theme-dialogue";
  import { momentFactoryTheme } from "@sentropic/design-system-theme-moment-factory";
  import { lionElectricTheme } from "@sentropic/design-system-theme-lion-electric";
  import { genetecTheme } from "@sentropic/design-system-theme-genetec";
  import { videotronTheme } from "@sentropic/design-system-theme-videotron";
  import { saputoTheme } from "@sentropic/design-system-theme-saputo";
  import { metroTheme } from "@sentropic/design-system-theme-metro";
  import { workleapTheme } from "@sentropic/design-system-theme-workleap";
  import { frankAndOakTheme } from "@sentropic/design-system-theme-frank-and-oak";
  import { sidLeeTheme } from "@sentropic/design-system-theme-sid-lee";
  import { simonsTheme } from "@sentropic/design-system-theme-simons";
  import { laVieEnRoseTheme } from "@sentropic/design-system-theme-la-vie-en-rose";
  import { dollaramaTheme } from "@sentropic/design-system-theme-dollarama";
  import { bellTheme } from "@sentropic/design-system-theme-bell";
  import { behaviourInteractiveTheme } from "@sentropic/design-system-theme-behaviour-interactive";
  import { ronaTheme } from "@sentropic/design-system-theme-rona";
  import { gameloftTheme } from "@sentropic/design-system-theme-gameloft";
  import { cossetteTheme } from "@sentropic/design-system-theme-cossette";
  import { eidosMontrealTheme } from "@sentropic/design-system-theme-eidos-montreal";
  import { stingrayTheme } from "@sentropic/design-system-theme-stingray";
  import { lg2Theme } from "@sentropic/design-system-theme-lg2";
  import { sonderTheme } from "@sentropic/design-system-theme-sonder";
  import { plusgradeTheme } from "@sentropic/design-system-theme-plusgrade";
  import { gildanTheme } from "@sentropic/design-system-theme-gildan";
  import { quebecorTheme } from "@sentropic/design-system-theme-quebecor";
  import { cogecoTheme } from "@sentropic/design-system-theme-cogeco";
  import { iaTheme } from "@sentropic/design-system-theme-ia";
  import { laurentianBankTheme } from "@sentropic/design-system-theme-laurentian-bank";
  import { jeanCoutuTheme } from "@sentropic/design-system-theme-jean-coutu";
  import { reitmansTheme } from "@sentropic/design-system-theme-reitmans";
  import { stHubertTheme } from "@sentropic/design-system-theme-st-hubert";
  import { benevaTheme } from "@sentropic/design-system-theme-beneva";
  import { airTransatTheme } from "@sentropic/design-system-theme-air-transat";
  import { birksTheme } from "@sentropic/design-system-theme-birks";
  import { lufaFarmsTheme } from "@sentropic/design-system-theme-lufa-farms";
  import { hydroQuebecTheme } from "@sentropic/design-system-theme-hydro-quebec";
  import { energirTheme } from "@sentropic/design-system-theme-energir";
  import { agropurTheme } from "@sentropic/design-system-theme-agropur";
  import { vanHoutteTheme } from "@sentropic/design-system-theme-van-houtte";
  import { dynamiteTheme } from "@sentropic/design-system-theme-dynamite";
  import { lvmhTheme } from "@sentropic/design-system-theme-lvmh";
  import { lorealTheme } from "@sentropic/design-system-theme-loreal";
  import { totalenergiesTheme } from "@sentropic/design-system-theme-totalenergies";
  import { sanofiTheme } from "@sentropic/design-system-theme-sanofi";
  import { bnpParibasTheme } from "@sentropic/design-system-theme-bnp-paribas";
  import { hermesTheme } from "@sentropic/design-system-theme-hermes";
  import { keringTheme } from "@sentropic/design-system-theme-kering";
  import { pernodRicardTheme } from "@sentropic/design-system-theme-pernod-ricard";
  import { danoneTheme } from "@sentropic/design-system-theme-danone";
  import { accorTheme } from "@sentropic/design-system-theme-accor";
  import { axaTheme } from "@sentropic/design-system-theme-axa";
  import { societeGeneraleTheme } from "@sentropic/design-system-theme-societe-generale";
  import { creditAgricoleTheme } from "@sentropic/design-system-theme-credit-agricole";
  import { edenredTheme } from "@sentropic/design-system-theme-edenred";
  import { worldlineTheme } from "@sentropic/design-system-theme-worldline";
  import { airLiquideTheme } from "@sentropic/design-system-theme-air-liquide";
  import { schneiderElectricTheme } from "@sentropic/design-system-theme-schneider-electric";
  import { saintGobainTheme } from "@sentropic/design-system-theme-saint-gobain";
  import { engieTheme } from "@sentropic/design-system-theme-engie";
  import { edfTheme } from "@sentropic/design-system-theme-edf";
  import { dassaultSystemesTheme } from "@sentropic/design-system-theme-dassault-systemes";
  import { thalesTheme } from "@sentropic/design-system-theme-thales";
  import { safranTheme } from "@sentropic/design-system-theme-safran";
  import { capgeminiTheme } from "@sentropic/design-system-theme-capgemini";
  import { orangeTheme } from "@sentropic/design-system-theme-orange";
  import { vinciTheme } from "@sentropic/design-system-theme-vinci";
  import { bouyguesTheme } from "@sentropic/design-system-theme-bouygues";
  import { veoliaTheme } from "@sentropic/design-system-theme-veolia";
  import { publicisTheme } from "@sentropic/design-system-theme-publicis";
  import { renaultTheme } from "@sentropic/design-system-theme-renault";
  import {
    DOCS_UTILITY_NAV,
    DOCS_VERSION,
    buildFoundationNav,
    buildComponentNavGroups,
    buildViewsNav,
    buildLayoutsNav,
    buildTopNav,
    resolveBreadcrumb,
    type ComponentNavItem,
    type ViewNavItem,
    type LayoutNavItem
  } from "$lib/docs-navigation";
  import { locale } from "$lib/locale.svelte";
  import {
    FRAMEWORKS,
    framework,
    FRAMEWORK_STORAGE_KEY,
    type FrameworkId
  } from "$lib/framework.svelte";
  import {
    readUrlParams,
    resolveTheme,
    resolveFramework,
    reconcileTheme,
    reconcileFramework,
    buildUpdatedSearch,
    type ThemeId as UrlThemeId
  } from "$lib/url-state";
  import CompareButton from "$lib/compare/CompareButton.svelte";
  import CompareTriptych from "$lib/compare/CompareTriptych.svelte";
  import ChatWidget from "$lib/chat/ChatWidget.svelte";
  // Chromes thématisés — importés conditionnellement côté client uniquement.
  import ChromeCarbon from "$lib/chrome/ChromeCarbon.svelte";
  import ChromeDsfr from "$lib/chrome/ChromeDsfr.svelte";
  import ChromeAirbus from "$lib/chrome/ChromeAirbus.svelte";
  import ChromeCanada from "$lib/chrome/ChromeCanada.svelte";
  import ChromeQuebec from "$lib/chrome/ChromeQuebec.svelte";
  import ChromeLightspeed from "$lib/chrome/ChromeLightspeed.svelte";
  import ChromeDesjardins from "$lib/chrome/ChromeDesjardins.svelte";
  import ChromeSsense from "$lib/chrome/ChromeSsense.svelte";
  import ChromeUbisoft from "$lib/chrome/ChromeUbisoft.svelte";
  import ChromeCirqueDuSoleil from "$lib/chrome/ChromeCirqueDuSoleil.svelte";
  import ChromeCgi from "$lib/chrome/ChromeCgi.svelte";
  import ChromeNationalBank from "$lib/chrome/ChromeNationalBank.svelte";
  import ChromeBombardier from "$lib/chrome/ChromeBombardier.svelte";
  import ChromeSaq from "$lib/chrome/ChromeSaq.svelte";
  import ChromeNuvei from "$lib/chrome/ChromeNuvei.svelte";
  import ChromeCoveo from "$lib/chrome/ChromeCoveo.svelte";
  import ChromeCae from "$lib/chrome/ChromeCae.svelte";
  import ChromeStm from "$lib/chrome/ChromeStm.svelte";
  import ChromeCircleK from "$lib/chrome/ChromeCircleK.svelte";
  import ChromeAldo from "$lib/chrome/ChromeAldo.svelte";
  import ChromeBrp from "$lib/chrome/ChromeBrp.svelte";
  import ChromeAirCanada from "$lib/chrome/ChromeAirCanada.svelte";
  import ChromeMetro from "$lib/chrome/ChromeMetro.svelte";
  import ChromeHopper from "$lib/chrome/ChromeHopper.svelte";
  import ChromeCascades from "$lib/chrome/ChromeCascades.svelte";
  import ChromeDialogue from "$lib/chrome/ChromeDialogue.svelte";
  import ChromeMomentFactory from "$lib/chrome/ChromeMomentFactory.svelte";
  import ChromeGenetec from "$lib/chrome/ChromeGenetec.svelte";
  import ChromeSaputo from "$lib/chrome/ChromeSaputo.svelte";
  import ChromeMirego from "$lib/chrome/ChromeMirego.svelte";
  import ChromeEllio from "$lib/chrome/ChromeEllio.svelte";
  import ChromeLionElectric from "$lib/chrome/ChromeLionElectric.svelte";
  import ChromeVideotron from "$lib/chrome/ChromeVideotron.svelte";
  import ChromeFrankAndOak from "$lib/chrome/ChromeFrankAndOak.svelte";
  import ChromeSidLee from "$lib/chrome/ChromeSidLee.svelte";
  import ChromeWorkleap from "$lib/chrome/ChromeWorkleap.svelte";
  import ChromeSimons from "$lib/chrome/ChromeSimons.svelte";
  import ChromeLaVieEnRose from "$lib/chrome/ChromeLaVieEnRose.svelte";
  import ChromeDollarama from "$lib/chrome/ChromeDollarama.svelte";
  import ChromeBell from "$lib/chrome/ChromeBell.svelte";
  import ChromeBehaviourInteractive from "$lib/chrome/ChromeBehaviourInteractive.svelte";
  import ChromeRona from "$lib/chrome/ChromeRona.svelte";
  import ChromeGameloft from "$lib/chrome/ChromeGameloft.svelte";
  import ChromeCossette from "$lib/chrome/ChromeCossette.svelte";
  import ChromeEidosMontreal from "$lib/chrome/ChromeEidosMontreal.svelte";
  import ChromeStingray from "$lib/chrome/ChromeStingray.svelte";
  import ChromeLg2 from "$lib/chrome/ChromeLg2.svelte";
  import ChromeSonder from "$lib/chrome/ChromeSonder.svelte";
  import ChromePlusgrade from "$lib/chrome/ChromePlusgrade.svelte";
  import ChromeGildan from "$lib/chrome/ChromeGildan.svelte";
  import ChromeQuebecor from "$lib/chrome/ChromeQuebecor.svelte";
  import ChromeCogeco from "$lib/chrome/ChromeCogeco.svelte";
  import ChromeIa from "$lib/chrome/ChromeIa.svelte";
  import ChromeLaurentianBank from "$lib/chrome/ChromeLaurentianBank.svelte";
  import ChromeJeanCoutu from "$lib/chrome/ChromeJeanCoutu.svelte";
  import ChromeReitmans from "$lib/chrome/ChromeReitmans.svelte";
  import ChromeStHubert from "$lib/chrome/ChromeStHubert.svelte";
  import ChromeBeneva from "$lib/chrome/ChromeBeneva.svelte";
  import ChromeAirTransat from "$lib/chrome/ChromeAirTransat.svelte";
  import ChromeBirks from "$lib/chrome/ChromeBirks.svelte";
  import ChromeLufaFarms from "$lib/chrome/ChromeLufaFarms.svelte";
  import ChromeHydroQuebec from "$lib/chrome/ChromeHydroQuebec.svelte";
  import ChromeEnergir from "$lib/chrome/ChromeEnergir.svelte";
  import ChromeAgropur from "$lib/chrome/ChromeAgropur.svelte";
  import ChromeVanHoutte from "$lib/chrome/ChromeVanHoutte.svelte";
  import ChromeDynamite from "$lib/chrome/ChromeDynamite.svelte";
  import DocsSearch from "$lib/chat/DocsSearch.svelte";
  import { Search as SearchIcon } from "@lucide/svelte";
  // Bascule A/B du header unique « app-shell » (?shell=v2) : wrapper SSR-safe
  // (import dynamique du Web Component au montage) + contrat siteConfig.
  import { AppShell } from "@sentropic/design-system-svelte";
  import type { SiteConfig } from "@sentropic/design-system-svelte";


  let { children } = $props();

  // Palette de recherche (Read the Docs) : barre dans le header -> overlay DocsSearch.
  let searchOpen = $state(false);
  let searchOverlayPanel = $state<HTMLDivElement | null>(null);

  const topNavItems = $derived(buildTopNav(locale.value));
  const foundationNavItems = $derived(buildFoundationNav(locale.value));
  const componentGroups = $derived(buildComponentNavGroups(locale.value));
  const viewsGroups = $derived(buildViewsNav(locale.value));
  const layoutsGroups = $derived(buildLayoutsNav(locale.value));
  const breadcrumbs = $derived(resolveBreadcrumb(page.url.pathname, locale.value));
  // Le sélecteur de framework n'a d'effet que là où des composants sont rendus
  // (pages composant + galerie /preview). Ailleurs (home, fondations, tokens,
  // thèmes, contrats) il ne bascule rien -> on le masque pour ne pas paraître cassé.
  const showFrameworkSwitcher = $derived(
    page.url.pathname.startsWith("/components") ||
    page.url.pathname === "/preview" ||
    page.url.pathname.startsWith("/views") ||
    page.url.pathname.startsWith("/layouts")
  );

  // Thèmes proposés : le DS Sentropic de référence + les 2 mappings tiers
  // (DSFR/Carbon) + le thème client Airbus (port d'anatomie).
  // (forge/entropic sont des tenants de démo internes — exclus du sélecteur.)
  const THEMES: TenantTheme[] = [sentTechTheme, dsfrTheme, carbonTheme, airbusTheme, canadaTheme, quebecTheme, ssenseTheme, lightspeedTheme, desjardinsTheme, nationalBankTheme, cirqueDuSoleilTheme, ubisoftTheme, bombardierTheme, caeTheme, saqTheme, cgiTheme, stmTheme, nuveiTheme, coveoTheme, circleKTheme, aldoTheme, brpTheme, miregoTheme, ellioTheme, airCanadaTheme, cascadesTheme, hopperTheme, dialogueTheme, momentFactoryTheme, lionElectricTheme, genetecTheme, videotronTheme, saputoTheme, metroTheme, workleapTheme, frankAndOakTheme, sidLeeTheme, simonsTheme, laVieEnRoseTheme, dollaramaTheme, bellTheme, behaviourInteractiveTheme, ronaTheme, gameloftTheme, cossetteTheme, eidosMontrealTheme, stingrayTheme, lg2Theme, sonderTheme, plusgradeTheme, gildanTheme, quebecorTheme, cogecoTheme, iaTheme, laurentianBankTheme, jeanCoutuTheme, reitmansTheme, stHubertTheme, benevaTheme, airTransatTheme, birksTheme, lufaFarmsTheme, hydroQuebecTheme, energirTheme, agropurTheme, vanHoutteTheme, dynamiteTheme, lvmhTheme, lorealTheme, totalenergiesTheme, sanofiTheme, bnpParibasTheme, hermesTheme, keringTheme, pernodRicardTheme, danoneTheme, accorTheme, axaTheme, societeGeneraleTheme, creditAgricoleTheme, edenredTheme, worldlineTheme, airLiquideTheme, schneiderElectricTheme, saintGobainTheme, engieTheme, edfTheme, dassaultSystemesTheme, thalesTheme, safranTheme, capgeminiTheme, orangeTheme, vinciTheme, bouyguesTheme, veoliaTheme, publicisTheme, renaultTheme];
  const THEME_STORAGE_KEY = "st-docs-theme";
  // ── Mode démo (anonymisation pour visiteurs externes) ─────────────────────
  // Les thèmes "tiers" (clones de marques privées : Carbon/IBM, Airbus, …) sont
  // CACHÉS du sélecteur public ; on les révèle en "mode démo", basculé via
  // Ctrl+Shift+X et persisté en localStorage. Les DS publics/gouvernementaux et
  // nos thèmes propres restent visibles (thirdParty non défini).
  const DEMO_MODE_STORAGE_KEY = "st-docs-demo-mode";
  // Thèmes tiers (clones de marques privées) masqués du sélecteur public, révélés
  // en mode démo. Ajouter ici l'id de chaque nouveau thème de société privée.
  const HIDDEN_THEME_IDS = new Set<string>(["carbon", "airbus", "ssense", "lightspeed", "desjardins", "national-bank", "cirque-du-soleil", "ubisoft", "bombardier", "cae", "saq", "cgi", "stm", "nuvei", "coveo", "circle-k", "aldo", "brp", "mirego", "ellio", "air-canada", "cascades", "hopper", "dialogue", "moment-factory", "lion-electric", "genetec", "videotron", "saputo", "metro", "workleap", "frank-and-oak", "sid-lee", "simons", "la-vie-en-rose", "dollarama", "bell", "behaviour-interactive", "rona", "gameloft", "cossette", "eidos-montreal", "stingray", "lg2", "sonder", "plusgrade", "gildan", "quebecor", "cogeco", "ia", "laurentian-bank", "jean-coutu", "reitmans", "st-hubert", "beneva", "air-transat", "birks", "lufa-farms", "hydro-quebec", "energir", "agropur", "van-houtte", "dynamite", "lvmh", "loreal", "totalenergies", "sanofi", "bnp-paribas", "hermes", "kering", "pernod-ricard", "danone", "accor", "axa", "societe-generale", "credit-agricole", "edenred", "worldline", "air-liquide", "schneider-electric", "saint-gobain", "engie", "edf", "dassault-systemes", "thales", "safran", "capgemini", "orange", "vinci", "bouygues", "veolia", "publicis", "renault"]);
  // Lire la valeur initiale de demoMode AVANT de créer les $state pour éviter
  // state_referenced_locally (on ne peut pas référencer un $state dans l'init d'un autre $state).
  const initialDemoMode = browser ? localStorage.getItem(DEMO_MODE_STORAGE_KEY) === "true" : false;
  let demoMode = $state(initialDemoMode);
  // Balise <style> du thème de base, injectée en SSR pour le premier rendu.
  // Utilise compileThemeWithModes pour émettre 3 blocs (light + auto dark + explicit dark).
  // (Construite dans le script pour éviter un littéral <style> dans le markup.)
  const baseThemeStyle = `<style data-st-base-theme>${compileThemeModes(sentTechTheme, { selector: ":root" })}</style>`;

  // Amorce SYNCHRONE depuis l'URL (source de vérité) côté client. Le script
  // anti-FOUC de app.html a déjà réécrit l'URL (?theme/?framework) depuis
  // localStorage AVANT l'hydratation : readUrlParams() voit donc l'état réel dès
  // l'init. En initialisant activeThemeId à cette valeur, le TOUT PREMIER rendu
  // client choisit directement le bon chrome par-thème — plus de bascule de chrome
  // post-hydratation (fin de la course : Airbus/DSFR/… ratait son chrome ~1 fois
  // sur N). En SSR (prerender, pas de window) on retombe sur le thème par défaut.
  const rawInitialTheme = browser
    ? resolveTheme(readUrlParams().theme, THEME_STORAGE_KEY)
    : sentTechTheme.id;
  if (browser) {
    framework.value = resolveFramework(readUrlParams().framework, FRAMEWORK_STORAGE_KEY);
  }

  // Anonymisation : un thème tiers deep-linké (?theme=carbon) est ignoré hors
  // mode démo — on retombe sur le thème par défaut au premier rendu.
  // Utilise initialDemoMode (valeur scalaire) pour éviter state_referenced_locally.
  let activeThemeId = $state(
    !initialDemoMode && HIDDEN_THEME_IDS.has(rawInitialTheme) ? sentTechTheme.id : rawInitialTheme
  );
  const activeTheme = $derived(
    THEMES.find((theme) => theme.id === activeThemeId) ?? sentTechTheme
  );
  // Sélecteur public : masque les thèmes tiers hors mode démo (réactif au flag).
  const visibleThemes = $derived(THEMES.filter((theme) => !HIDDEN_THEME_IDS.has(theme.id) || demoMode));
  // Garde runtime : si on quitte le mode démo alors qu'un thème tiers est actif,
  // on revient au thème par défaut (anonymisation affichage + URL).
  $effect(() => {
    if (!browser) return;
    if (!demoMode && HIDDEN_THEME_IDS.has(activeThemeId)) {
      activeThemeId = sentTechTheme.id;
    }
  });

  // ═══ URL = SOURCE DE VÉRITÉ pour thème + framework ═══════════════════════
  // L'URL fait foi ; le store MIROIR l'URL (jamais l'inverse). localStorage ne
  // sert qu'à AMORCER le tout premier chargement : le script anti-FOUC de
  // app.html lit localStorage et RÉÉCRIT l'URL (?theme/?framework) AVANT
  // l'hydratation, de sorte que page.url porte déjà l'état au montage. Le store
  // est amorcé SYNCHRONEMENT ci-dessus (initialTheme / framework.value), donc le
  // chrome par-thème est choisi dès le 1er rendu client — fin de la course
  // d'hydratation (Airbus/DSFR/… ne « rate » plus son chrome).
  //
  // Sync ENTRANTE (URL -> store), réactive à page.url.search, pour le RUNTIME :
  //  • deep-link / partage / back-forward : le param présent fait autorité ;
  //  • nav interne « nue » (lien sans param) : on CONSERVE l'état courant le
  //    temps que `afterNavigate` ré-inscrive le param dans l'URL (pas de flash).
  // Amorcé à `browser` : le store est déjà initialisé depuis l'URL au montage,
  // donc dès le 1er passage on emprunte la branche de réconciliation (jamais de
  // ré-init au défaut).
  let urlStateInitialized = $state(browser);
  $effect(() => {
    if (!browser) return;
    // Dépendance réactive explicite : tout changement d'URL relit l'état.
    void page.url.search;
    const { theme: urlTheme, framework: urlFramework } = readUrlParams();

    // Lecture/écriture de l'état dans untrack() : cet effet ne doit dépendre QUE de
    // page.url.search. Sans untrack, lire framework.value/activeThemeId ici les rend
    // dépendances réactives -> cliquer un onglet (qui change framework.value) re-déclenche
    // cet effet AVANT que la sync sortante n'ait écrit l'URL, relit une URL encore vide
    // et réinitialise au défaut (boucle de feedback : le clic était écrasé en svelte).
    untrack(() => {
      // Param présent => autorité URL ; absent => on conserve l'état courant
      // (afterNavigate ré-estampille). On n'écrit que si différent (anti-boucle).
      const nextTheme = reconcileTheme(urlTheme, activeThemeId as UrlThemeId);
      if (nextTheme !== activeThemeId) activeThemeId = nextTheme;
      const nextFramework = reconcileFramework(urlFramework, framework.value);
      if (nextFramework !== framework.value) framework.value = nextFramework;
    });
  });

  // Sync SORTANTE à la navigation (store -> URL). Les liens de nav internes
  // (sidebar/top-nav) sont des href STATIQUES sans param : après navigation,
  // l'URL les perd. `afterNavigate` ré-inscrit alors thème + framework courants
  // dans la nouvelle URL (replaceState, pas d'entrée historique), pour que l'URL
  // reste la source de vérité, partageable et deep-linkable. Garde `browser`.
  afterNavigate(() => {
    if (!browser) return;
    // Toute navigation (ex. clic sur un résultat de recherche) ferme la palette.
    searchOpen = false;
    // Le store est amorcé SYNCHRONEMENT depuis l'URL au montage : sur la
    // navigation initiale, buildUpdatedSearch reproduit la search courante => no-op
    // (aucun risque d'écraser le ?theme/?framework du deep-link). Sur une nav
    // interne « nue », il ré-inscrit l'état courant dans la nouvelle URL.
    const newSearch = buildUpdatedSearch(activeThemeId as UrlThemeId, framework.value);
    if (newSearch !== window.location.search) {
      replaceState(window.location.pathname + newSearch, page.state);
    }
  });

  // Init du mode couleur (restaure localStorage, applique data-color-mode).
  // Exécuté une seule fois côté client.
  $effect(() => {
    colorMode.init();
  });

  // Applique le thème actif sur :root via un <style> géré (réactif et fiable),
  // et persiste le choix. Utilise compileThemeWithModes pour émettre 3 blocs.
  $effect(() => {
    const STYLE_ID = "st-docs-active-theme";
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = compileThemeModes(activeTheme, { selector: ":root" });
    document.documentElement.setAttribute("data-st-theme", activeThemeId);
    localStorage.setItem(THEME_STORAGE_KEY, activeThemeId);
  });

  // Reflète le framework actif sur <html data-st-framework> et persiste le choix.
  $effect(() => {
    framework.value; // dépendance explicite pour la réactivité
    framework.persist();
  });

  // Sync SORTANTE au CHANGEMENT de thème/framework (store -> URL) : un clic sur
  // un sélecteur ne navigue pas, donc afterNavigate ne se déclenche pas — cet
  // effet ré-inscrit l'état dans l'URL via replaceState (pas d'entrée historique).
  // Dépendances réactives EXPLICITES : thème + framework UNIQUEMENT (PAS l'URL,
  // dont l'écriture est gérée par afterNavigate) ; tracker page.url.search ici
  // re-déclencherait l'effet sur sa propre écriture et « consommerait » le
  // tracking de framework.value (depuis le défaut svelte, le 1er clic vers react
  // n'écrivait jamais l'URL). page.state lu en untrack.
  $effect(() => {
    const theme = activeThemeId as UrlThemeId;
    const fw = framework.value;
    if (!browser) return;
    const newSearch = buildUpdatedSearch(theme, fw);
    if (newSearch !== window.location.search) {
      untrack(() => replaceState(window.location.pathname + newSearch, page.state));
    }
  });

  let isOpen = $state(false);
  let isThemeOpen = $state(false);
  let isFrameworkOpen = $state(false);
  let isMobileMenuOpen = $state(false);
  let isSidebarOpen = $state(false);

  // ── Identité (OAuth RP, phase 1) ──────────────────────────────────────────
  // Mappe le store auth (clé d'identité = iss+sub) vers la forme attendue par
  // l'IdentityMenu du DS (affichage uniquement). L'email n'est que décoratif.
  const identityUser = $derived(
    auth.user
      ? { displayName: auth.user.name ?? auth.user.sub, email: auth.user.email, id: auth.user.sub }
      : null
  );

  function isActive(href: string): boolean {
    const pathname = page.url.pathname;
    const hash = page.url.hash;

    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/#components") {
      return pathname.startsWith("/components") || (pathname === "/" && hash === "#components");
    }

    if (href.startsWith("/#")) {
      return pathname === "/" && hash === href.slice(1);
    }

    const route = href.split("#")[0];
    return pathname === route || (route !== "/" && pathname.startsWith(route));
  }

  function isComponentActive(item: ComponentNavItem): boolean {
    return page.url.pathname === `/components/${item.slug}`;
  }

  function isSidebarDocActive(href: string): boolean {
    if (href === "/") {
      return page.url.pathname === "/" && !page.url.hash;
    }

    if (href.startsWith("/#")) {
      return page.url.pathname === "/" && page.url.hash === href.slice(1);
    }

    return isActive(href);
  }

  function isGroupOpen(items: ComponentNavItem[]): boolean {
    return items.some((item) => isComponentActive(item));
  }

  function isViewActive(item: ViewNavItem): boolean {
    return page.url.pathname === `/views/${item.slug}`;
  }

  function isViewGroupOpen(items: ViewNavItem[]): boolean {
    return items.some((item) => isViewActive(item));
  }

  function isLayoutActive(item: LayoutNavItem): boolean {
    return page.url.pathname === `/layouts/${item.slug}`;
  }

  function isLayoutGroupOpen(items: LayoutNavItem[]): boolean {
    return items.some((item) => isLayoutActive(item));
  }

  function openSearch() {
    searchOpen = true;
  }

  async function focusSearchInput() {
    await tick();
    searchOverlayPanel
      ?.querySelector<HTMLInputElement>(".docs-search input[type='search']")
      ?.focus();
  }

  $effect(() => {
    if (!browser || !searchOpen) return;
    void focusSearchInput();
  });

  // ── Mode compare (Lot 2) ─────────────────────────────────────────────────
  // Toute la logique compare est CLIENT-ONLY : les query params ne sont pas
  // présents au SSR (prerender=true → page canonique sans params).
  // On utilise browser pour éviter tout accès localStorage/URL au SSR.

  const compareActive = $derived(
    browser && page.url.searchParams.get("compare") === "1"
  );
  const compareThemeId = $derived(
    browser ? (page.url.searchParams.get("theme") ?? null) : null
  );
  const compareScenarioId = $derived(
    browser ? (page.url.searchParams.get("scenario") ?? null) : null
  );
  const compareComponent = $derived(
    (() => {
      const match = page.url.pathname.match(/\/components\/([^/]+)/);
      if (!match) return null;
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    })()
  );

  // ── Chrome par thème ────────────────────────────────────────────────────
  // SSR rend toujours le chrome sent-tech (pas d'accès localStorage).
  // Côté client, activeThemeId est restauré depuis localStorage et le chrome
  // bascule réactivement.
  // Les chromes Carbon/DSFR/Airbus encapsulent leur propre header + sidebar.
  // Le chrome sent-tech utilise le Header du composant DS + la sidebar existante.

  // ── Bascule A/B « app-shell » (?shell=v2) ─────────────────────────────────
  // Flag d'URL réversible : `?shell=v2` rend le NOUVEAU header partagé
  // (<sentropic-app-shell>) À LA PLACE du header actuel, en CONSERVANT le corps
  // (sidebar + contenu + palette de recherche). Sans le flag, RIEN ne change.
  // Quand actif, on force la branche « chrome sent-tech » (les chromes tiers sont
  // court-circuités) puis on substitue le <Header> par <AppShell>. SSR-safe :
  // le wrapper importe le Web Component dynamiquement au montage. browser-gardé
  // pour rester aligné sur le défaut prérendu (zéro flash de header au SSR).
  const shellV2 = $derived(browser && page.url.searchParams.get("shell") === "v2");

  const useCustomChrome = $derived(
    !shellV2 && browser && (activeThemeId === "carbon" || activeThemeId === "dsfr" || activeThemeId === "airbus" || activeThemeId === "canada" || activeThemeId === "quebec" || activeThemeId === "lightspeed" || activeThemeId === "desjardins" || activeThemeId === "ssense" || activeThemeId === "ubisoft" || activeThemeId === "cirque-du-soleil" || activeThemeId === "cgi" || activeThemeId === "national-bank" || activeThemeId === "bombardier" || activeThemeId === "saq" || activeThemeId === "nuvei" || activeThemeId === "coveo" || activeThemeId === "cae" || activeThemeId === "stm" || activeThemeId === "circle-k" || activeThemeId === "aldo" || activeThemeId === "brp" || activeThemeId === "air-canada" || activeThemeId === "metro" || activeThemeId === "hopper" || activeThemeId === "cascades" || activeThemeId === "dialogue" || activeThemeId === "moment-factory" || activeThemeId === "genetec" || activeThemeId === "saputo" || activeThemeId === "mirego" || activeThemeId === "ellio" || activeThemeId === "lion-electric" || activeThemeId === "videotron" || activeThemeId === "frank-and-oak" || activeThemeId === "sid-lee" || activeThemeId === "workleap" || activeThemeId === "simons" || activeThemeId === "la-vie-en-rose" || activeThemeId === "dollarama" || activeThemeId === "bell" || activeThemeId === "behaviour-interactive" || activeThemeId === "rona" || activeThemeId === "gameloft" || activeThemeId === "cossette" || activeThemeId === "eidos-montreal" || activeThemeId === "stingray" || activeThemeId === "lg2" || activeThemeId === "sonder" || activeThemeId === "plusgrade" || activeThemeId === "gildan" || activeThemeId === "quebecor" || activeThemeId === "cogeco" || activeThemeId === "ia" || activeThemeId === "laurentian-bank" || activeThemeId === "jean-coutu" || activeThemeId === "reitmans" || activeThemeId === "st-hubert" || activeThemeId === "beneva" || activeThemeId === "air-transat" || activeThemeId === "birks" || activeThemeId === "lufa-farms" || activeThemeId === "hydro-quebec" || activeThemeId === "energir" || activeThemeId === "agropur" || activeThemeId === "van-houtte" || activeThemeId === "dynamite")
  );

  // siteConfig du shell, câblé au mécanisme EXISTANT du layout (thème
  // `activeThemeId`, framework store, locale store, mode couleur, palette de
  // recherche, identité OAuth). Réutilise le contrat de la page d'aperçu A/B.
  const shellConfig = $derived<SiteConfig>({
    schemaVersion: 1,
    brand: { name: "Sentropic", productName: "Design System", logoSrc: "/SENT-logo-squared.svg", href: "/" },
    nav: topNavItems.map((i) => ({ label: i.label, href: i.href })),
    activePath: page.url.pathname,
    search: {
      enabled: true,
      mode: "callback",
      placeholder: locale.value === "fr" ? "Rechercher…" : "Search…",
      onSearch: () => openSearch(),
    },
    frameworkSwitcher: {
      // ISO réf : le header de référence affiche le switcher framework INCONDITIONNELLEMENT.
      enabled: true,
      current: framework.value,
      available: FRAMEWORKS.map((f) => ({ id: f.id, label: f.label })),
      mode: "callback",
      onChange: (id) => (framework.value = id as typeof framework.value),
    },
    theming: {
      themes: visibleThemes.map((t) => ({ id: t.id, label: t.label })),
      theme: activeThemeId,
      colorMode: colorMode.value,
      onThemeChange: (id) => (activeThemeId = id),
      onColorModeChange: (mode) => (colorMode.value = mode),
      themeLabel: locale.value === "fr" ? "Changer le thème" : "Change theme",
    },
    locale: {
      current: locale.value,
      available: [{ code: "fr", label: "Français" }, { code: "en", label: "English" }],
      onChange: (code) => (locale.value = code as "fr" | "en"),
    },
    identity: auth.status === "authed"
      ? { state: "authenticated", label: identityUser?.displayName, onSignOut: () => auth.logout() }
      : { state: "anonymous", onSignIn: () => auth.login() },
  });
</script>

<svelte:window onclick={(e) => {
  const target = e.target as Element | null;
  if (isOpen && target && !target.closest(".docs-locale-wrapper")) {
    isOpen = false;
  }
  if (isThemeOpen && target && !target.closest(".docs-theme-wrapper")) {
    isThemeOpen = false;
  }
  if (isFrameworkOpen && target && !target.closest(".docs-framework-wrapper")) {
    isFrameworkOpen = false;
  }
}} onkeydown={(e) => {
  if (e.key === "Escape") {
    isOpen = false;
    isThemeOpen = false;
    isFrameworkOpen = false;
    isMobileMenuOpen = false;
    isSidebarOpen = false;
    searchOpen = false;
  }
  // "/" ouvre la palette de recherche (sauf si on tape déjà dans un champ).
  const el = e.target as HTMLElement | null;
  const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
  if (e.key === "/" && !typing && !searchOpen) {
    e.preventDefault();
    openSearch();
  }
  // Ctrl+Shift+X : bascule le mode démo (révèle/masque les thèmes tiers privés).
  if (e.ctrlKey && e.shiftKey && e.code === "KeyX") {
    e.preventDefault();
    demoMode = !demoMode;
    if (browser) localStorage.setItem(DEMO_MODE_STORAGE_KEY, demoMode ? "true" : "false");
  }
}} />

<svelte:head>
  {@html baseThemeStyle}
</svelte:head>

{#snippet docsBrand()}
  <a class="docs-brand" href="/" aria-label="Sentropic Design System">
    <img class="docs-brand-mark" src="/SENT-logo-squared.svg" alt="Sentropic Design System" />
    <span class="docs-brand-copy">
      <span class="docs-brand-name">Sentropic</span>
      <span class="docs-brand-product">Design System</span>
    </span>
  </a>
{/snippet}

{#snippet docsTopNav()}
  <nav class="docs-top-nav" aria-label="Documentation principale">
    {#each topNavItems as item (item.href)}
      <a href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
        {item.label}
      </a>
    {/each}
  </nav>
{/snippet}

{#snippet docsUtilityNav()}
  <nav class="docs-utility-nav" aria-label="Liens utiles">
    {@render searchTrigger()}

    {@render frameworkSelector()}

    {@render themeSelector()}

    <!-- Bouton Compare — client-only, visible ssi thème d'import + page composant -->
    <CompareButton activeThemeId={activeThemeId} pathname={page.url.pathname} />

    {@render colorModeToggle()}

    {@render langSelector()}

    <!-- Identité (contrat header §3 droite) : en anonyme un CONTRÔLE DU SOCLE
         (icône User, même densité que thème/langue), pas un bouton plein qui
         casse l'homogénéité. Connecté -> menu compte (IdentityMenu). -->
    {#if auth.status === "authed"}
      <IdentityMenu isAuthenticated={true} user={identityUser} onLogout={() => auth.logout()} compact={true} />
    {:else}
      <button
        type="button"
        class="docs-header-control docs-header-menuButton docs-login-trigger"
        onclick={() => auth.login()}
        aria-label={locale.value === "fr" ? "Se connecter" : "Sign in"}
      >
        <User size={16} strokeWidth={2.1} aria-hidden="true" />
      </button>
    {/if}
  </nav>

  <button
    type="button"
    class="docs-mobile-menu-trigger"
    onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    aria-expanded={isMobileMenuOpen}
    aria-label="Menu principal"
  >
    {#if isMobileMenuOpen}
      <X size={20} />
    {:else}
      <Menu size={20} />
    {/if}
  </button>
{/snippet}

<!-- ── Snippet partagé : barre de recherche (Read the Docs) ───────────── -->
{#snippet searchTrigger()}
  <button
    type="button"
    class="docs-header-control docs-search-trigger"
    onclick={openSearch}
    aria-label={locale.value === "fr" ? "Rechercher dans la documentation" : "Search the documentation"}
    aria-haspopup="dialog"
  >
    <SearchIcon size={16} strokeWidth={2.1} aria-hidden="true" />
  </button>
{/snippet}

<!-- ── Snippet partagé : sélecteur de thème ──────────────────────────── -->
{#snippet themeSelector()}
  <div class="docs-theme-wrapper">
    <button
      type="button"
      class="docs-header-control docs-header-menuButton docs-locale-trigger docs-theme-trigger"
      onclick={() => (isThemeOpen = !isThemeOpen)}
      aria-expanded={isThemeOpen}
      aria-haspopup="menu"
      aria-label={locale.value === "fr" ? "Changer le thème" : "Change theme"}
    >
      <Palette size={14} aria-hidden="true" />
      <span class="docs-theme-trigger-label">{activeTheme.label}</span>
      <ChevronDown size={12} class="docs-locale-trigger-chevron {isThemeOpen ? 'rotated' : ''}" aria-hidden="true" />
    </button>

    <div class="docs-dropdown-panel">
      <DsMenu
        label={locale.value === "fr" ? "Changer le thème" : "Change theme"}
        dense={true}
        open={isThemeOpen}
        items={visibleThemes.map(theme => ({
          value: theme.id,
          label: theme.label,
          icon: activeThemeId === theme.id ? "✓" : " "
        }))}
        onselect={(id) => { activeThemeId = id; isThemeOpen = false; }}
      />
    </div>
  </div>
{/snippet}

<!-- ── Snippet partagé : sélecteur de framework (Svelte/React/Vue/Angular) ────── -->
{#snippet frameworkSelector()}
  <div class="docs-framework-wrapper">
    <button
      type="button"
      class="docs-header-control docs-header-menuButton docs-locale-trigger docs-framework-trigger"
      onclick={() => (isFrameworkOpen = !isFrameworkOpen)}
      aria-expanded={isFrameworkOpen}
      aria-haspopup="menu"
      aria-label={locale.value === "fr" ? "Changer de framework" : "Change framework"}
    >
      <Boxes size={14} aria-hidden="true" />
      <span>{framework.option.label}</span>
      <ChevronDown size={12} class="docs-locale-trigger-chevron {isFrameworkOpen ? 'rotated' : ''}" aria-hidden="true" />
    </button>

    <div class="docs-dropdown-panel">
      <DsMenu
        label={locale.value === "fr" ? "Changer de framework" : "Change framework"}
        dense={true}
        open={isFrameworkOpen}
        items={FRAMEWORKS.map(option => ({
          value: option.id,
          label: option.label,
          icon: framework.value === option.id ? "✓" : " "
        }))}
        onselect={(id) => { framework.value = id as FrameworkId; isFrameworkOpen = false; }}
      />
    </div>
  </div>
{/snippet}

<!-- ── Snippet partagé : toggle de mode couleur (clair/sombre/auto) ──── -->
{#snippet colorModeToggle()}
  <button
    type="button"
    class="docs-header-control docs-header-menuButton docs-header-iconLink docs-color-mode-toggle"
    onclick={() => {
      const next: ColorMode = colorMode.value === "light" ? "dark" : colorMode.value === "dark" ? "auto" : "light";
      colorMode.value = next;
    }}
    aria-label={
      colorMode.value === "light"
        ? (locale.value === "fr" ? "Mode sombre" : "Dark mode")
        : colorMode.value === "dark"
          ? (locale.value === "fr" ? "Mode auto (système)" : "Auto mode (system)")
          : (locale.value === "fr" ? "Mode clair" : "Light mode")
    }
    title={
      colorMode.value === "light"
        ? (locale.value === "fr" ? "Actuellement : clair — passer au sombre" : "Currently: light — switch to dark")
        : colorMode.value === "dark"
          ? (locale.value === "fr" ? "Actuellement : sombre — passer à auto" : "Currently: dark — switch to auto")
          : (locale.value === "fr" ? "Actuellement : auto — passer au clair" : "Currently: auto — switch to light")
    }
  >
    {#if colorMode.value === "dark"}
      <Moon size={16} strokeWidth={2} aria-hidden="true" />
    {:else if colorMode.value === "light"}
      <Sun size={16} strokeWidth={2} aria-hidden="true" />
    {:else}
      <!-- auto: icône mi-soleil mi-lune (on utilise Sun avec un style différencié) -->
      <Sun size={16} strokeWidth={1.5} aria-hidden="true" style="opacity: 0.65;" />
    {/if}
  </button>
{/snippet}

<!-- ── Snippet partagé : sélecteur de langue ─────────────────────────── -->
{#snippet langSelector()}
  <div class="docs-locale-wrapper">
    <button
      type="button"
      class="docs-header-control docs-header-menuButton docs-locale-trigger"
      onclick={() => (isOpen = !isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      aria-label={locale.value === "fr" ? "Changer la langue" : "Change language"}
    >
      <Globe size={14} class="docs-locale-trigger-icon" aria-hidden="true" />
      <span>{locale.value.toUpperCase()}</span>
      <ChevronDown size={12} class="docs-locale-trigger-chevron {isOpen ? 'rotated' : ''}" aria-hidden="true" />
    </button>

    <div class="docs-dropdown-panel">
      <DsMenu
        label={locale.value === "fr" ? "Changer la langue" : "Change language"}
        dense={true}
        open={isOpen}
        items={[
          { value: "fr", label: "Français", icon: locale.value === "fr" ? "✓" : " " },
          { value: "en", label: "English", icon: locale.value === "en" ? "✓" : " " }
        ]}
        onselect={(v) => { locale.value = v as "fr" | "en"; isOpen = false; }}
      />
    </div>
  </div>
{/snippet}

<!-- ── Snippet partagé : bouton Compare (passé aux chromes tiers) ─────── -->
{#snippet sharedCompareButton()}
  <CompareButton activeThemeId={activeThemeId} pathname={page.url.pathname} />
{/snippet}

<!-- ── Contenu de page (encapsulé avec le mode compare Lot 2) ────────── -->
{#snippet pageContent()}
  <div class="docs-content-area" class:docs-content-area--compare={compareActive}>
    <nav class="docs-breadcrumb" aria-label="Fil d'Ariane">
      <ol>
        {#each breadcrumbs as crumb, index (crumb.href)}
          <li>
            {#if index === breadcrumbs.length - 1}
              <span aria-current="page">{crumb.label}</span>
            {:else}
              <a href={crumb.href}>{crumb.label}</a>
            {/if}
          </li>
        {/each}
      </ol>
    </nav>

    {#if compareActive && compareThemeId && compareScenarioId && compareComponent}
      <!-- Mode compare : triptyque plein-écran sous la breadcrumb.
           Le panneau (a) rend le contenu normal de la page (notre composant live).
           Le panneau (b) rend l'iframe officielle CDN (visuelle uniquement).
           Le panneau (c) = rail de gaps lus du registre JSON. -->
      <div class="docs-compare-wrap">
        {#snippet ourLive()}
          <main class="docs-main docs-main--compare" id="main-content">
            {@render children()}
          </main>
        {/snippet}
        <CompareTriptych
          themeId={compareThemeId}
          scenarioId={compareScenarioId}
          component={compareComponent}
          pathname={page.url.pathname}
          liveSlot={ourLive}
        />
      </div>
    {:else}
      <main class="docs-main" id="main-content">
        {@render children()}
      </main>
    {/if}
  </div>
{/snippet}

<!-- ═══════════════════════════════════════════════════════════════════════
     RENDU : chrome tiers (Carbon/DSFR/Airbus) ou chrome sent-tech par défaut.
     Le chrome tiers encapsule entièrement header + sidebar + contenu.
     Le chrome sent-tech conserve exactement la structure d'origine.
     ═══════════════════════════════════════════════════════════════════════ -->

{#if useCustomChrome && activeThemeId === "carbon"}
  <div data-st-theme={activeThemeId}>
    <ChromeCarbon
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeCarbon>
  </div>

{:else if useCustomChrome && activeThemeId === "dsfr"}
  <div data-st-theme={activeThemeId}>
    <ChromeDsfr
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeDsfr>
  </div>

{:else if useCustomChrome && activeThemeId === "airbus"}
  <div data-st-theme={activeThemeId}>
    <ChromeAirbus
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeAirbus>
  </div>

{:else if useCustomChrome && activeThemeId === "canada"}
  <div data-st-theme={activeThemeId}>
    <ChromeCanada
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeCanada>
  </div>

{:else if useCustomChrome && activeThemeId === "quebec"}
  <div data-st-theme={activeThemeId}>
    <ChromeQuebec
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeQuebec>
  </div>

{:else if useCustomChrome && activeThemeId === "lightspeed"}
  <div data-st-theme={activeThemeId}>
    <ChromeLightspeed
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeLightspeed>
  </div>

{:else if useCustomChrome && activeThemeId === "desjardins"}
  <div data-st-theme={activeThemeId}>
    <ChromeDesjardins
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeDesjardins>
  </div>

{:else if useCustomChrome && activeThemeId === "ssense"}
  <div data-st-theme={activeThemeId}>
    <ChromeSsense
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeSsense>
  </div>

{:else if useCustomChrome && activeThemeId === "ubisoft"}
  <div data-st-theme={activeThemeId}>
    <ChromeUbisoft
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeUbisoft>
  </div>

{:else if useCustomChrome && activeThemeId === "cirque-du-soleil"}
  <div data-st-theme={activeThemeId}>
    <ChromeCirqueDuSoleil
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeCirqueDuSoleil>
  </div>

{:else if useCustomChrome && activeThemeId === "cgi"}
  <div data-st-theme={activeThemeId}>
    <ChromeCgi
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeCgi>
  </div>

{:else if useCustomChrome && activeThemeId === "national-bank"}
  <div data-st-theme={activeThemeId}>
    <ChromeNationalBank
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeNationalBank>
  </div>

{:else if useCustomChrome && activeThemeId === "bombardier"}
  <div data-st-theme={activeThemeId}>
    <ChromeBombardier
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeBombardier>
  </div>

{:else if useCustomChrome && activeThemeId === "saq"}
  <div data-st-theme={activeThemeId}>
    <ChromeSaq
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeSaq>
  </div>

{:else if useCustomChrome && activeThemeId === "nuvei"}
  <div data-st-theme={activeThemeId}>
    <ChromeNuvei
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeNuvei>
  </div>

{:else if useCustomChrome && activeThemeId === "coveo"}
  <div data-st-theme={activeThemeId}>
    <ChromeCoveo
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeCoveo>
  </div>

{:else if useCustomChrome && activeThemeId === "cae"}
  <div data-st-theme={activeThemeId}>
    <ChromeCae
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeCae>
  </div>

{:else if useCustomChrome && activeThemeId === "stm"}
  <div data-st-theme={activeThemeId}>
    <ChromeStm
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeStm>
  </div>

{:else if useCustomChrome && activeThemeId === "circle-k"}
  <div data-st-theme={activeThemeId}>
    <ChromeCircleK
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeCircleK>
  </div>

{:else if useCustomChrome && activeThemeId === "aldo"}
  <div data-st-theme={activeThemeId}>
    <ChromeAldo
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeAldo>
  </div>

{:else if useCustomChrome && activeThemeId === "brp"}
  <div data-st-theme={activeThemeId}>
    <ChromeBrp
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeBrp>
  </div>

{:else if useCustomChrome && activeThemeId === "air-canada"}
  <div data-st-theme={activeThemeId}>
    <ChromeAirCanada
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeAirCanada>
  </div>

{:else if useCustomChrome && activeThemeId === "metro"}
  <div data-st-theme={activeThemeId}>
    <ChromeMetro
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeMetro>
  </div>

{:else if useCustomChrome && activeThemeId === "hopper"}
  <div data-st-theme={activeThemeId}>
    <ChromeHopper
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeHopper>
  </div>

{:else if useCustomChrome && activeThemeId === "cascades"}
  <div data-st-theme={activeThemeId}>
    <ChromeCascades
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeCascades>
  </div>

{:else if useCustomChrome && activeThemeId === "dialogue"}
  <div data-st-theme={activeThemeId}>
    <ChromeDialogue
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeDialogue>
  </div>

{:else if useCustomChrome && activeThemeId === "moment-factory"}
  <div data-st-theme={activeThemeId}>
    <ChromeMomentFactory
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeMomentFactory>
  </div>

{:else if useCustomChrome && activeThemeId === "genetec"}
  <div data-st-theme={activeThemeId}>
    <ChromeGenetec
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeGenetec>
  </div>

{:else if useCustomChrome && activeThemeId === "saputo"}
  <div data-st-theme={activeThemeId}>
    <ChromeSaputo
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeSaputo>
  </div>

{:else if useCustomChrome && activeThemeId === "mirego"}
  <div data-st-theme={activeThemeId}>
    <ChromeMirego
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeMirego>
  </div>

{:else if useCustomChrome && activeThemeId === "ellio"}
  <div data-st-theme={activeThemeId}>
    <ChromeEllio
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeEllio>
  </div>

{:else if useCustomChrome && activeThemeId === "lion-electric"}
  <div data-st-theme={activeThemeId}>
    <ChromeLionElectric
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeLionElectric>
  </div>

{:else if useCustomChrome && activeThemeId === "videotron"}
  <div data-st-theme={activeThemeId}>
    <ChromeVideotron
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeVideotron>
  </div>

{:else if useCustomChrome && activeThemeId === "frank-and-oak"}
  <div data-st-theme={activeThemeId}>
    <ChromeFrankAndOak
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeFrankAndOak>
  </div>

{:else if useCustomChrome && activeThemeId === "sid-lee"}
  <div data-st-theme={activeThemeId}>
    <ChromeSidLee
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeSidLee>
  </div>

{:else if useCustomChrome && activeThemeId === "workleap"}
  <div data-st-theme={activeThemeId}>
    <ChromeWorkleap
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeWorkleap>
  </div>

{:else if useCustomChrome && activeThemeId === "simons"}
  <div data-st-theme={activeThemeId}>
    <ChromeSimons
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeSimons>
  </div>

{:else if useCustomChrome && activeThemeId === "la-vie-en-rose"}
  <div data-st-theme={activeThemeId}>
    <ChromeLaVieEnRose
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeLaVieEnRose>
  </div>

{:else if useCustomChrome && activeThemeId === "dollarama"}
  <div data-st-theme={activeThemeId}>
    <ChromeDollarama
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeDollarama>
  </div>

{:else if useCustomChrome && activeThemeId === "bell"}
  <div data-st-theme={activeThemeId}>
    <ChromeBell
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeBell>
  </div>

{:else if useCustomChrome && activeThemeId === "behaviour-interactive"}
  <div data-st-theme={activeThemeId}>
    <ChromeBehaviourInteractive
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeBehaviourInteractive>
  </div>

{:else if useCustomChrome && activeThemeId === "rona"}
  <div data-st-theme={activeThemeId}>
    <ChromeRona
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeRona>
  </div>

{:else if useCustomChrome && activeThemeId === "gameloft"}
  <div data-st-theme={activeThemeId}>
    <ChromeGameloft
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeGameloft>
  </div>

{:else if useCustomChrome && activeThemeId === "cossette"}
  <div data-st-theme={activeThemeId}>
    <ChromeCossette
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeCossette>
  </div>

{:else if useCustomChrome && activeThemeId === "eidos-montreal"}
  <div data-st-theme={activeThemeId}>
    <ChromeEidosMontreal
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeEidosMontreal>
  </div>

{:else if useCustomChrome && activeThemeId === "stingray"}
  <div data-st-theme={activeThemeId}>
    <ChromeStingray
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeStingray>
  </div>

{:else if useCustomChrome && activeThemeId === "lg2"}
  <div data-st-theme={activeThemeId}>
    <ChromeLg2
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeLg2>
  </div>

{:else if useCustomChrome && activeThemeId === "sonder"}
  <div data-st-theme={activeThemeId}>
    <ChromeSonder
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeSonder>
  </div>

{:else if useCustomChrome && activeThemeId === "plusgrade"}
  <div data-st-theme={activeThemeId}>
    <ChromePlusgrade
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromePlusgrade>
  </div>

{:else if useCustomChrome && activeThemeId === "gildan"}
  <div data-st-theme={activeThemeId}>
    <ChromeGildan
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeGildan>
  </div>

{:else if useCustomChrome && activeThemeId === "quebecor"}
  <div data-st-theme={activeThemeId}>
    <ChromeQuebecor
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeQuebecor>
  </div>

{:else if useCustomChrome && activeThemeId === "cogeco"}
  <div data-st-theme={activeThemeId}>
    <ChromeCogeco
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeCogeco>
  </div>

{:else if useCustomChrome && activeThemeId === "ia"}
  <div data-st-theme={activeThemeId}>
    <ChromeIa
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeIa>
  </div>

{:else if useCustomChrome && activeThemeId === "laurentian-bank"}
  <div data-st-theme={activeThemeId}>
    <ChromeLaurentianBank
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeLaurentianBank>
  </div>

{:else if useCustomChrome && activeThemeId === "jean-coutu"}
  <div data-st-theme={activeThemeId}>
    <ChromeJeanCoutu
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeJeanCoutu>
  </div>

{:else if useCustomChrome && activeThemeId === "reitmans"}
  <div data-st-theme={activeThemeId}>
    <ChromeReitmans
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeReitmans>
  </div>

{:else if useCustomChrome && activeThemeId === "st-hubert"}
  <div data-st-theme={activeThemeId}>
    <ChromeStHubert
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeStHubert>
  </div>

{:else if useCustomChrome && activeThemeId === "beneva"}
  <div data-st-theme={activeThemeId}>
    <ChromeBeneva
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeBeneva>
  </div>

{:else if useCustomChrome && activeThemeId === "air-transat"}
  <div data-st-theme={activeThemeId}>
    <ChromeAirTransat
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeAirTransat>
  </div>

{:else if useCustomChrome && activeThemeId === "birks"}
  <div data-st-theme={activeThemeId}>
    <ChromeBirks
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeBirks>
  </div>

{:else if useCustomChrome && activeThemeId === "lufa-farms"}
  <div data-st-theme={activeThemeId}>
    <ChromeLufaFarms
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeLufaFarms>
  </div>

{:else if useCustomChrome && activeThemeId === "hydro-quebec"}
  <div data-st-theme={activeThemeId}>
    <ChromeHydroQuebec
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeHydroQuebec>
  </div>

{:else if useCustomChrome && activeThemeId === "energir"}
  <div data-st-theme={activeThemeId}>
    <ChromeEnergir
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeEnergir>
  </div>

{:else if useCustomChrome && activeThemeId === "agropur"}
  <div data-st-theme={activeThemeId}>
    <ChromeAgropur
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeAgropur>
  </div>

{:else if useCustomChrome && activeThemeId === "van-houtte"}
  <div data-st-theme={activeThemeId}>
    <ChromeVanHoutte
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeVanHoutte>
  </div>

{:else if useCustomChrome && activeThemeId === "dynamite"}
  <div data-st-theme={activeThemeId}>
    <ChromeDynamite
      activeThemeId={activeThemeId}
      isThemeOpen={isThemeOpen}
      onThemeToggle={() => (isThemeOpen = !isThemeOpen)}
      onSearchOpen={openSearch}
      themeSwitcher={themeSelector}
      frameworkSwitcher={frameworkSelector}
      localeSwitcher={langSelector}
      compareButton={sharedCompareButton}
      colorModeToggle={colorModeToggle}
      mobileMenuOpen={isMobileMenuOpen}
      onMobileMenuToggle={() => (isMobileMenuOpen = !isMobileMenuOpen)}
    >
      {#snippet children()}
        {@render pageContent()}
      {/snippet}
    </ChromeDynamite>
  </div>

{:else}
  <!-- ── Chrome sent-tech par défaut (SSR + thème sent-tech) ── -->
  <a class="docs-skip-link" href="#main-content">Aller au contenu</a>
  <div class="docs-shell" data-st-theme={activeThemeId}>
    {#if shellV2}
      <!-- Bascule A/B : NOUVEAU header unique <sentropic-app-shell> à la place du
           Header actuel. Le corps (sidebar + contenu + palette) reste identique. -->
      <AppShell config={shellConfig} />
    {:else}
      <!-- Barre du haut : composant Header complet et porté (logo + navigation + actions). -->
      <Header
        class="docs-header"
        label="En-tête de la documentation Sentropic"
        logo={docsBrand}
        navigation={docsTopNav}
        actions={docsUtilityNav}
      />
    {/if}

    {#if isMobileMenuOpen}
      <nav class="docs-mobile-nav" aria-label="Menu mobile">
        <div class="docs-mobile-nav-section">
          <span class="docs-mobile-nav-label">{locale.value === "fr" ? "Navigation" : "Navigation"}</span>
          {#each topNavItems as item (item.href)}
            <a
              href={item.href}
              onclick={() => (isMobileMenuOpen = false)}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {#if item.label === "GitHub"}
                <Github size={15} strokeWidth={2.1} aria-hidden="true" />
              {/if}
              <span>{item.label}</span>
            </a>
          {/each}
        </div>
        <div class="docs-mobile-nav-section">
          <span class="docs-mobile-nav-label">{locale.value === "fr" ? "Liens utiles" : "Useful links"}</span>
          <span class="docs-header-control docs-version docs-mobile-version">{DOCS_VERSION}</span>
          {#each DOCS_UTILITY_NAV as item (item.href)}
            <a
              href={item.href}
              onclick={() => (isMobileMenuOpen = false)}
              rel={item.external ? "noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              {item.label}
            </a>
          {/each}

          <span class="docs-mobile-nav-label">{locale.value === "fr" ? "Framework" : "Framework"}</span>
          <div class="docs-mobile-locale-switcher docs-mobile-framework-switcher">
            {#each FRAMEWORKS as option (option.id)}
              <button
                type="button"
                class="docs-mobile-locale-btn"
                class:active={framework.value === option.id}
                onclick={() => { framework.value = option.id; isMobileMenuOpen = false; }}
              >
                {option.label}
              </button>
            {/each}
          </div>

          <span class="docs-mobile-nav-label">{locale.value === "fr" ? "Mode couleur" : "Color mode"}</span>
          <div class="docs-mobile-locale-switcher docs-mobile-color-mode-switcher">
            {#each (["light", "dark", "auto"] as ColorMode[]) as mode (mode)}
              <button
                type="button"
                class="docs-mobile-locale-btn"
                class:active={colorMode.value === mode}
                onclick={() => { colorMode.value = mode; }}
              >
                {mode === "light" ? (locale.value === "fr" ? "Clair" : "Light") : mode === "dark" ? (locale.value === "fr" ? "Sombre" : "Dark") : "Auto"}
              </button>
            {/each}
          </div>

          <span class="docs-mobile-nav-label">{locale.value === "fr" ? "Thème" : "Theme"}</span>
          <div class="docs-mobile-locale-switcher docs-mobile-theme-switcher">
            {#each visibleThemes as theme (theme.id)}
              <button
                type="button"
                class="docs-mobile-locale-btn"
                class:active={activeThemeId === theme.id}
                onclick={() => { activeThemeId = theme.id; isMobileMenuOpen = false; }}
              >
                {theme.label}
              </button>
            {/each}
          </div>

          <div class="docs-mobile-locale-switcher">
            <button
              type="button"
              class="docs-mobile-locale-btn"
              class:active={locale.value === "fr"}
              onclick={() => { locale.value = "fr"; isMobileMenuOpen = false; }}
            >
              Français
            </button>
            <button
              type="button"
              class="docs-mobile-locale-btn"
              class:active={locale.value === "en"}
              onclick={() => { locale.value = "en"; isMobileMenuOpen = false; }}
            >
              English
            </button>
          </div>

          <span class="docs-mobile-nav-label">{locale.value === "fr" ? "Identité" : "Identity"}</span>
          {#if auth.status === "authed"}
            <IdentityMenu
              variant="accordion"
              isAuthenticated={true}
              user={identityUser}
              onLogout={() => { auth.logout(); isMobileMenuOpen = false; }}
            />
          {:else}
            <button
              type="button"
              class="docs-header-control docs-header-menuButton docs-locale-trigger"
              onclick={() => auth.login()}
              aria-label={locale.value === "fr" ? "Se connecter" : "Sign in"}
            >
              <User size={16} aria-hidden="true" />
              <span>{locale.value === "fr" ? "Se connecter" : "Sign in"}</span>
            </button>
          {/if}
        </div>
      </nav>
    {/if}


    <div class="docs-body">
      <!-- Déclencheur "Sommaire" visible uniquement sur mobile (≤ 768px) -->
      <div class="docs-sidebar-mobile-trigger-wrap">
        <button
          type="button"
          class="docs-sidebar-mobile-trigger"
          onclick={() => (isSidebarOpen = !isSidebarOpen)}
          aria-expanded={isSidebarOpen}
          aria-controls="docs-sidebar"
        >
          <span>{isSidebarOpen ? "▲" : "▼"}</span>
          <span>{isSidebarOpen ? (locale.value === "fr" ? "Masquer le sommaire" : "Hide table of contents") : (locale.value === "fr" ? "Sommaire / Table des matières" : "Table of contents")}</span>
        </button>
      </div>
      <aside class="docs-sidebar" id="docs-sidebar" class:docs-sidebar--open={isSidebarOpen}>
        <nav class="docs-side-nav" aria-label="Navigation de la documentation">
          <section class="docs-side-section" aria-labelledby="docs-foundations-heading">
            <h2 id="docs-foundations-heading">
              <a
                class="docs-side-section-link"
                href="/"
                aria-current={page.url.pathname === "/" ? "page" : undefined}
              >
                {locale.value === "fr" ? "Documentation" : "Documentation"}
              </a>
            </h2>
            <ul>
              {#each foundationNavItems as item (item.href)}
                <li>
                  <a
                    class="docs-side-link docs-side-link--docs"
                    href={item.href}
                    aria-current={isSidebarDocActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              {/each}
            </ul>
          </section>

          <section class="docs-side-section" aria-labelledby="docs-components-heading">
            <h2 id="docs-components-heading">
              <a
                class="docs-side-section-link"
                href="/components"
                aria-current={isActive("/components") ? "page" : undefined}
              >
                {locale.value === "fr" ? "Composants" : "Components"}
              </a>
            </h2>
            {#each componentGroups as group (group.label)}
              <details class="docs-side-group" open={isGroupOpen(group.items)}>
                <summary>
                  <ChevronDown class="docs-side-group-icon" size={16} strokeWidth={2.25} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul>
                  {#each group.items as item (item.label)}
                    <li>
                      <a
                        class="docs-side-link docs-side-link--component"
                        href={item.href}
                        aria-current={isComponentActive(item) ? "page" : undefined}
                      >
                        <span
                          class:docs-side-status--documented={item.status === "documented"}
                          class="docs-side-status"
                          aria-hidden="true"
                        ></span>
                        <span>{item.label}</span>
                      </a>
                    </li>
                  {/each}
                </ul>
              </details>
            {/each}
          </section>

          <section class="docs-side-section" aria-labelledby="docs-views-heading">
            <h2 id="docs-views-heading">
              <a
                class="docs-side-section-link"
                href="/views"
                aria-current={isActive("/views") ? "page" : undefined}
              >
                {locale.value === "fr" ? "Vues" : "Views"}
              </a>
            </h2>
            {#each viewsGroups as group (group.label)}
              <details class="docs-side-group" open={isViewGroupOpen(group.items)}>
                <summary>
                  <ChevronDown class="docs-side-group-icon" size={16} strokeWidth={2.25} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul>
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="docs-side-link docs-side-link--view"
                        href={item.href}
                        aria-current={isViewActive(item) ? "page" : undefined}
                      >
                        <span>{item.label}</span>
                      </a>
                    </li>
                  {/each}
                </ul>
              </details>
            {/each}
          </section>

          <section class="docs-side-section" aria-labelledby="docs-layouts-heading">
            <h2 id="docs-layouts-heading">
              <a
                class="docs-side-section-link"
                href="/layouts"
                aria-current={isActive("/layouts") ? "page" : undefined}
              >
                {locale.value === "fr" ? "Gabarits" : "Layouts"}
              </a>
            </h2>
            {#each layoutsGroups as group (group.label)}
              <details class="docs-side-group" open={isLayoutGroupOpen(group.items)}>
                <summary>
                  <ChevronDown class="docs-side-group-icon" size={16} strokeWidth={2.25} aria-hidden="true" />
                  <span>{group.label}</span>
                </summary>
                <ul>
                  {#each group.items as item (item.slug)}
                    <li>
                      <a
                        class="docs-side-link docs-side-link--view"
                        href={item.href}
                        aria-current={isLayoutActive(item) ? "page" : undefined}
                      >
                        <span>{item.label}</span>
                      </a>
                    </li>
                  {/each}
                </ul>
              </details>
            {/each}
          </section>
        </nav>

        <!-- Pied de barre latérale : version + lien GitHub (déplacés du header). -->
        <div class="docs-sidebar-footer">
          <span class="docs-sidebar-version">{DOCS_VERSION}</span>
          {#each DOCS_UTILITY_NAV as item (item.href)}
            <a
              class="docs-sidebar-github"
              href={item.href}
              rel={item.external ? "noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
              aria-label={item.label}
            >
              {#if item.label === "GitHub"}
                <Github size={16} strokeWidth={2.1} aria-hidden="true" />
              {/if}
              <span>{item.label}</span>
            </a>
          {/each}
        </div>
      </aside>

      {@render pageContent()}
    </div>
  </div>
{/if}

<!-- Palette de recherche (Read the Docs) : overlay DocsSearch, ouvert depuis la
     barre du header ou la touche « / ». Fermé par le bouton, le backdrop ou Échap. -->
{#if searchOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="docs-search-overlay"
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-label={locale.value === "fr" ? "Recherche de la documentation" : "Documentation search"}
    onclick={(e) => { if (e.target === e.currentTarget) searchOpen = false; }}
  >
    <div class="docs-search-overlay__panel" bind:this={searchOverlayPanel}>
      <button
        type="button"
        class="docs-search-overlay__close"
        onclick={() => (searchOpen = false)}
        aria-label={locale.value === "fr" ? "Fermer la recherche" : "Close search"}
      >
        <X size={18} aria-hidden="true" />
      </button>
      <DocsSearch />
    </div>
  </div>
{/if}

<!-- Widget de chat « light-auth » — persistant sur toutes les routes/thèmes.
     Client-only (rendu gardé par `browser`), positionné en fixed bottom-right. -->
<ChatWidget />
