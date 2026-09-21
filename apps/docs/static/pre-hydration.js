// Script pré-hydratation de la doc (anti-FOUC + amorce d'URL).
//
// Restaure data-color-mode + data-st-theme + data-st-framework sur <html>
// AVANT que le navigateur ne peigne la page, pour éviter un flash
// (blanc→sombre, ou thème par défaut→thème choisi) au chargement initial.
// Lit les MÊMES clés localStorage que les stores (color-mode.svelte.ts,
// +layout.svelte THEME_STORAGE_KEY, framework.svelte.ts).
//
// Servi en FICHIER (et non inline) pour rester compatible avec une CSP
// `script-src 'self'`, sans hash ni nonce. app.html le charge dans <head>, en
// script classique SYNCHRONE (ni defer, ni async, ni module) : il bloque le
// rendu, donc s'exécute avant la première peinture. Contrat vérifié par
// src/lib/header-contract.test.ts, qui exécute aussi ce fichier.
(function () {
  try {
    var mode = localStorage.getItem("st-docs-color-mode");
    if (mode === "dark" || mode === "light") {
      document.documentElement.setAttribute("data-color-mode", mode);
    }
    // Thème : data-st-theme pilote le chrome + les variables :root du thème.
    //
    // COPIE EXACTE de la liste blanche publique de $lib/theme-catalog.
    // Ce script ne peut pas lire le catalogue (il s'exécute avant tout
    // module), donc il embarque les identifiants en dur, et TOUT ce qui
    // n'y figure pas est traité comme privé : hors mode révélé, ni
    // attribut, ni amorce d'URL. Le reste du catalogue est fait de clones
    // mesurés de marques privées, qui ne doivent paraître ni sur <html>
    // ni dans la barre d'adresse — pas même le temps d'un premier rendu.
    //
    // La liste est COMPLÈTE, et pas un sous-ensemble « suffisant » : un
    // thème public absent d'ici ne serait pas seulement appliqué plus
    // tard, il ne serait pas amorcé dans l'URL, ce qui change l'ensemble
    // des chargements qui passent par le chemin sans param. Un test de
    // contrat vérifie l'ÉGALITÉ avec la liste publique, dans les deux
    // sens : voir header-contract.test.ts.
    var PUBLIC_BOOT_THEMES = [
      "canada", "dsfr", "quebec", "sent-tech"
    ];
    // Mode révélé (Ctrl+Shift+X) : même clé et mêmes valeurs que le
    // layout ($lib/theme-access). Lui seul autorise l'amorce d'un thème
    // privé enregistré.
    var revealed = localStorage.getItem("st-docs-demo-mode") === "true";
    var theme = localStorage.getItem("st-docs-theme");
    var themeIsPublic = PUBLIC_BOOT_THEMES.indexOf(theme) !== -1;
    var themeIsBootable = themeIsPublic || (revealed && !!theme);
    if (themeIsBootable) {
      document.documentElement.setAttribute("data-st-theme", theme);
    }
    // Framework : data-st-framework pilote l'affichage des îles docs.
    var fw = localStorage.getItem("docs-framework");
    if (fw === "svelte" || fw === "react" || fw === "vue" || fw === "angular") {
      document.documentElement.setAttribute("data-st-framework", fw);
    }
    // ── URL = source de vérité ────────────────────────────────────────
    // Au TOUT PREMIER chargement (URL sans param), on AMORCE l'URL depuis
    // localStorage AVANT l'hydratation SvelteKit. Ainsi page.url porte déjà
    // ?theme/?framework et le chrome est choisi de façon DÉTERMINISTE
    // (plus de course d'hydratation : SSR rend le chrome par défaut, mais
    // le client lit le même page.url que celui réécrit ici). Si un param
    // est DÉJÀ présent dans l'URL (deep-link/partage), il fait foi : on n'y
    // touche pas. localStorage ne sert qu'à cette amorce.
    var params = new URLSearchParams(location.search);
    var changed = false;
    // Même verdict que pour l'attribut : hors mode révélé, n'amorcer
    // l'URL qu'avec un thème PUBLIC. Un identifiant privé dans la barre
    // d'adresse exposerait la marque avant même l'hydratation.
    // localStorage peut contenir un identifiant privé (choisi en mode
    // révélé) : sans mode révélé persisté, on refuse de le propager.
    if (!params.has("theme") && themeIsBootable && theme !== "sent-tech") {
      params.set("theme", theme); changed = true;
    }
    if (!params.has("framework") && fw && fw !== "svelte") {
      params.set("framework", fw); changed = true;
    }
    if (changed) {
      var qs = params.toString();
      history.replaceState(history.state, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
    }
  } catch (e) { /* accès localStorage impossible (iframe, SSR, etc.) */ }
})();
