<script lang="ts">
  // Fidelity bench (spec §5) : banc réservé aux THÈMES IMPORTÉS : pour chacun,
  // NOTRE composant mappé À CÔTÉ du VRAI composant officiel (CSS + markup
  // d'origine, isolés en iframe). Sent Tech (notre marque) n'a pas de pendant
  // externe → exclu de ce banc. Langue cohérente par DS (DSFR=FR, Carbon=EN).
  // Hors nav.
  //
  // G5 : couverture élargie : au-delà des 7 composants de base, on compare un
  // maximum de variants/états (Button secondaire/désactivé, Input erreur/
  // désactivé) et de nouveaux composants (Checkbox, Radio, Toggle, Tag, Badge,
  // Alert, Accordion, Breadcrumb, Pagination, Search, Quote, Highlight) : pour
  // chacun le vrai markup officiel DSFR/Carbon dans la langue du thème. Quand un
  // composant n'a pas d'équivalent officiel pour un thème (ex. Quote/Highlight =
  // DSFR seulement ; Badge = DSFR seulement), on ne fabrique PAS de fausse paire.
  //
  // G4 : banc propre : grille à colonnes fixes, mêmes gouttières/padding des deux
  // côtés, contenu aligné sur la même origine, iframes calées en haut.
  // NB : import par espace de noms (et non destructuré) : un bug d'élision
  // d'import de Vite/Rollup laissait tomber le DERNIER composant destructuré
  // (`Highlight`) à la compilation SSR (`ReferenceError: Highlight is not
  // defined` au prerender). L'accès via `Ds.Highlight` est immunisé : aucun
  // identifiant n'est tree-shaké individuellement.
  import * as Ds from "@sentropic/design-system-svelte";
  const {
    Accordion,
    Alert,
    Badge,
    Breadcrumb,
    Button,
    Card,
    Checkbox,
    Highlight,
    Input,
    Link,
    Pagination,
    Quote,
    Radio,
    Switch,
    Search,
    Select,
    Tabs,
    Tag,
    Textarea,
    Toggle
  } = Ds;
  import { compileTheme, type TenantTheme } from "@sentropic/design-system-themes";
  import { dsfrTheme } from "@sentropic/design-system-theme-dsfr";
  import { carbonTheme } from "@sentropic/design-system-theme-carbon";
  import { airbusTheme } from "@sentropic/design-system-theme-airbus";
  import docsPkg from "../../../package.json";
  // Source unique pinée (C8) : CDN/polices de référence sortis dans un registre
  // docs-local, partagé avec l'oracle de fidélité.
  // getReferenceThemes({includeLocal:true}) intègre les overlays privés locaux
  // (ex. Airbus) si présents (gitignorés, stubs créés par prebuild).
  import { getReferenceThemes } from "$lib/compare/reference-themes.mjs";
  // getCompareManifest({includeLocal:true}) intègre les scénarios privés locaux.
  import { getCompareManifest } from "$lib/compare/manifest.mjs";

  // Registre des thèmes de référence (public + overlay local si présent).
  const ALL_REF_THEMES = getReferenceThemes({ includeLocal: true });
  // Manifest complet (public + overlay local si présent).
  const MANIFEST = getCompareManifest({ includeLocal: true });

  // Registre des TenantTheme (objets Svelte compilés). Seuls les IDs présents
  // dans ALL_REF_THEMES seront inclus dans le rendu → garantit que si un overlay
  // local est absent, airbus est ignoré sans casser le build public.
  const TENANT_REGISTRY: Record<string, TenantTheme> = {
    dsfr: dsfrTheme,
    carbon: carbonTheme,
    airbus: airbusTheme,
  };

  // Thèmes importés dans l'ordre : dsfr, carbon, puis tout overlay local connu.
  // L'ordre est déterminé par l'ordre des clés dans ALL_REF_THEMES (insertion).
  const THEMES: TenantTheme[] = Object.keys(ALL_REF_THEMES)
    .filter((id) => TENANT_REGISTRY[id] != null)
    .map((id) => TENANT_REGISTRY[id]);

  const scopedCss = THEMES.map((t) => compileTheme(t, { selector: `.cmp-scope--${t.id}` })).join("\n");

  // Versions (source = deps épinglées du docs) : DS Sentropic + thème.
  const dsVersion = docsPkg.dependencies["@sentropic/design-system-themes"];
  const themeVersion = (id: string): string =>
    (docsPkg.dependencies as Record<string, string>)[`@sentropic/design-system-theme-${id}`] ?? "?";

  // Libellés dans la langue native du DS (DSFR=FR, Carbon=EN) des DEUX côtés.
  type L = {
    primary: string; secondary: string; disabled: string;
    email: string; helper: string; placeholder: string; errorText: string;
    inline: string; standalone: string; cardTitle: string; cardBody: string;
    message: string; messagePlaceholder: string; selectLabel: string;
    options: { value: string; label: string }[];
    tabs: { value: string; label: string; content: string; disabled?: boolean }[];
    check: string; checkHelp: string; radio: string; toggle: string; toggleOn: string; toggleOff: string; switchLabel: string;
    tag: string; badge: string;
    alertTitle: string; alertMessage: string;
    accordion: { id: string; title: string; content: string }[];
    crumbs: { label: string; href?: string; current?: boolean }[];
    searchLabel: string; searchPlaceholder: string;
    quote: string; quoteAuthor: string; quoteSource: string;
    highlightTitle: string; highlightBody: string;
  };
  const LABELS: Record<string, L> = {
    dsfr: {
      primary: "Primaire", secondary: "Secondaire", disabled: "Désactivé",
      email: "Email", helper: "Texte d'aide", placeholder: "nom@exemple.org",
      errorText: "Adresse invalide",
      inline: "Lien inline", standalone: "Lien standalone",
      cardTitle: "Titre de carte", cardBody: "Contenu de la carte.",
      message: "Message", messagePlaceholder: "Votre message…", selectLabel: "Région",
      options: [
        { value: "idf", label: "Île-de-France" },
        { value: "bre", label: "Bretagne" },
        { value: "occ", label: "Occitanie" }
      ],
      tabs: [
        { value: "a", label: "Actif", content: "Panneau actif" },
        { value: "b", label: "Second", content: "Second panneau" },
        { value: "c", label: "Désactivé", content: "Panneau désactivé", disabled: true }
      ],
      check: "J'accepte les conditions", checkHelp: "Texte d'aide",
      radio: "Option A", toggle: "Activer les notifications", toggleOn: "Activé", toggleOff: "Désactivé",
      switchLabel: "Désactiver le mode silencieux",
      tag: "Étiquette", badge: "Nouveau",
      alertTitle: "Information", alertMessage: "Votre demande a bien été enregistrée.",
      accordion: [
        { id: "a", title: "Première section", content: "Contenu de la première section." },
        { id: "b", title: "Deuxième section", content: "Contenu de la deuxième section." }
      ],
      crumbs: [
        { label: "Accueil", href: "#cmp" },
        { label: "Démarches", href: "#cmp" },
        { label: "Page courante", current: true }
      ],
      searchLabel: "Rechercher", searchPlaceholder: "Rechercher",
      quote: "La sobriété numérique est un impératif d'avenir.",
      quoteAuthor: "Auteur", quoteSource: "Référence",
      highlightTitle: "À retenir", highlightBody: "Un encart de mise en avant éditoriale."
    },
    carbon: {
      primary: "Primary", secondary: "Secondary", disabled: "Disabled",
      email: "Email", helper: "Helper text", placeholder: "name@example.org",
      errorText: "Invalid address",
      inline: "Inline link", standalone: "Standalone link",
      cardTitle: "Card title", cardBody: "Card body content.",
      message: "Message", messagePlaceholder: "Your message…", selectLabel: "Region",
      options: [
        { value: "north", label: "North" },
        { value: "south", label: "South" },
        { value: "east", label: "East" }
      ],
      tabs: [
        { value: "a", label: "Active", content: "Active panel" },
        { value: "b", label: "Second", content: "Second panel" },
        { value: "c", label: "Disabled", content: "Disabled panel", disabled: true }
      ],
      check: "I accept the terms", checkHelp: "Helper text",
      radio: "Option A", toggle: "Enable notifications", toggleOn: "On", toggleOff: "Off",
      switchLabel: "Enable silent mode",
      tag: "Tag", badge: "New",
      alertTitle: "Notification", alertMessage: "Your request has been saved.",
      accordion: [
        { id: "a", title: "First section", content: "First section content." },
        { id: "b", title: "Second section", content: "Second section content." }
      ],
      crumbs: [
        { label: "Home", href: "#cmp" },
        { label: "Catalog", href: "#cmp" },
        { label: "Current page", current: true }
      ],
      searchLabel: "Search", searchPlaceholder: "Search",
      quote: "Carbon has no editorial quote component.",
      quoteAuthor: "Author", quoteSource: "Source",
      highlightTitle: "Note", highlightBody: "Carbon has no editorial highlight component."
    },
    // Airbus utilise l'anglais : libellés identiques à Carbon.
    airbus: {
      primary: "Primary", secondary: "Secondary", disabled: "Disabled",
      email: "Email", helper: "Helper text", placeholder: "name@example.org",
      errorText: "Invalid address",
      inline: "Inline link", standalone: "Standalone link",
      cardTitle: "Card title", cardBody: "Card body content.",
      message: "Message", messagePlaceholder: "Your message…", selectLabel: "Region",
      options: [
        { value: "north", label: "North" },
        { value: "south", label: "South" },
        { value: "east", label: "East" }
      ],
      tabs: [
        { value: "a", label: "Active", content: "Active panel" },
        { value: "b", label: "Second", content: "Second panel" },
        { value: "c", label: "Disabled", content: "Disabled panel", disabled: true }
      ],
      check: "I accept the terms", checkHelp: "Helper text",
      radio: "Option A", toggle: "Enable notifications", toggleOn: "On", toggleOff: "Off",
      switchLabel: "Enable silent mode",
      tag: "Tag", badge: "New",
      alertTitle: "Notification", alertMessage: "Your request has been saved.",
      accordion: [
        { id: "a", title: "First section", content: "First section content." },
        { id: "b", title: "Second section", content: "Second section content." }
      ],
      crumbs: [
        { label: "Home", href: "#cmp" },
        { label: "Catalog", href: "#cmp" },
        { label: "Current page", current: true }
      ],
      searchLabel: "Search", searchPlaceholder: "Search",
      quote: "Airbus has no editorial quote component.",
      quoteAuthor: "Author", quoteSource: "Source",
      highlightTitle: "Note", highlightBody: "Airbus has no editorial highlight component."
    }
  };

  // F2 / C8 : CDN (pinés) + polices de marque chargées RÉELLEMENT des deux côtés
  // du banc, dérivés de ALL_REF_THEMES (source unique : même source que l'oracle).
  const CDN: Record<string, string> = Object.fromEntries(
    Object.entries(ALL_REF_THEMES).map(([id, t]) => [id, t.cssUrl])
  );
  const FONT_LINKS: Record<string, string> = Object.fromEntries(
    Object.entries(ALL_REF_THEMES).map(([id, t]) => [id, t.fontLinks])
  );
  const BRAND_FONT: Record<string, string> = Object.fromEntries(
    Object.entries(ALL_REF_THEMES).map(([id, t]) => [id, t.brandFont])
  );

  // @font-face Marianne (URLs CDN absolues) pour NOTRE côté DSFR. On évite
  // d'injecter tout dsfr.min.css (qui contient un reset global qui fausserait
  // les mesures de boîte) : on charge SEULEMENT la police. IBM Plex Sans est
  // chargée via le <link> Google Fonts ci-dessous.
  const MARIANNE_CDN = "https://cdn.jsdelivr.net/npm/@gouvfr/dsfr/dist/fonts";
  const MARIANNE_FACES: [number, string, string?][] = [
    [400, "Marianne-Regular"],
    [400, "Marianne-Regular_Italic", "italic"],
    [500, "Marianne-Medium"],
    [700, "Marianne-Bold"]
  ];
  const ourFontFaces = MARIANNE_FACES.map(
    ([weight, file, style]) =>
      `@font-face{font-display:swap;font-family:Marianne;font-style:${style ?? "normal"};font-weight:${weight};src:url("${MARIANNE_CDN}/${file}.woff2") format("woff2"),url("${MARIANNE_CDN}/${file}.woff") format("woff")}`
  ).join("");

  // F1 : banc apples-to-apples : largeur de rendu commune aux DEUX côtés.
  // Les champs pleine largeur (Input/Textarea/Select/Search) remplissent
  // exactement BENCH_WIDTH des deux côtés ; les composants à largeur intrinsèque
  // (Button/Link/Tabs/Tag…) disposent du même contexte de largeur ; la carte est
  // rendue dans le même contexte de 18rem que la référence officielle.
  const BENCH_WIDTH = 320; // px : largeur de contenu identique des deux côtés
  const IFRAME_PAD = 14; // px : padding du <body> de l'iframe (cf. refDoc)

  // ---------------------------------------------------------------------------
  // Catalogue du banc dérivé du manifest.
  // Chaque Entry = identifiant stable partagé avec la CLI.
  // `themesFor` = ensemble des thèmes pour lesquels un VRAI équivalent officiel
  // existe (déduit du manifest). `full` et `card` sont inférés par nom de clé.
  // ---------------------------------------------------------------------------
  type Entry = {
    key: string;
    label: string;
    themesFor: Set<string>;
    full?: boolean;
    card?: boolean;
  };

  // Ordre canonique des clés : préserve exactement l'ordre historique dsfr/carbon,
  // puis ajoute les clés exclusives à d'autres thèmes à la fin.
  const CANONICAL_ORDER = [
    "Button", "ButtonDisabled",
    "Input", "InputError", "InputDisabled",
    "Textarea", "Select", "Search",
    "Link", "Checkbox", "Radio", "Toggle", "Switch",
    "Tag", "Badge",
    "Alert", "Accordion", "Breadcrumb", "Pagination",
    "Card", "Tabs",
    "Quote", "Highlight"
  ];

  // Construit l'ensemble des clés présentes dans le manifest (tous thèmes confondus)
  // dans l'ordre canonique, puis les clés supplémentaires non prévues.
  const allManifestKeys = new Set(
    Object.values(MANIFEST).flatMap((entries) => Object.keys(entries))
  );
  const ENTRY_KEYS = [
    ...CANONICAL_ORDER.filter((k) => allManifestKeys.has(k)),
    ...[...allManifestKeys].filter((k) => !CANONICAL_ORDER.includes(k))
  ];

  // Libellés lisibles par clé (invariants entre thèmes).
  const ENTRY_LABELS: Record<string, string> = {
    Button: "Button: primaire + secondaire",
    ButtonDisabled: "Button: désactivé",
    Input: "Input",
    InputError: "Input: erreur",
    InputDisabled: "Input: désactivé",
    Textarea: "Textarea",
    Select: "Select",
    Search: "Search",
    Link: "Link",
    Checkbox: "Checkbox",
    Radio: "Radio",
    Toggle: "Toggle / Switch",
    Switch: "Switch",
    Tag: "Tag",
    Badge: "Badge",
    Alert: "Alert / Notification",
    Accordion: "Accordion",
    Breadcrumb: "Breadcrumb",
    Pagination: "Pagination",
    Card: "Card",
    Tabs: "Tabs",
    Quote: "Quote",
    Highlight: "Highlight / Mise en avant",
  };

  // Clés à largeur pleine ou contexte carte.
  const FULL_KEYS = new Set(["Input", "InputError", "InputDisabled", "Textarea", "Select", "Search"]);
  const CARD_KEYS = new Set(["Card"]);

  // Construit les entrées en déduisant les thèmes supportés depuis le manifest.
  const ENTRIES: Entry[] = ENTRY_KEYS.map((key) => ({
    key,
    label: ENTRY_LABELS[key] ?? key,
    themesFor: new Set(
      Object.entries(MANIFEST)
        .filter(([, entries]) => key in entries)
        .map(([theme]) => theme)
    ),
    full: FULL_KEYS.has(key),
    card: CARD_KEYS.has(key),
  }));

  // Markup officiel de référence pour (thème, clé) : extrait du manifest.
  function refMarkupFor(themeId: string, key: string): string {
    return (MANIFEST[themeId]?.[key] as { refMarkup?: string } | undefined)?.refMarkup ?? "";
  }

  // Lang de l'iframe pour un thème donné (depuis le manifest si disponible,
  // sinon depuis ALL_REF_THEMES).
  function refLang(themeId: string): string {
    const firstEntry = Object.values(MANIFEST[themeId] ?? {})[0] as { lang?: string } | undefined;
    return firstEntry?.lang ?? (ALL_REF_THEMES[themeId] as { lang?: string })?.lang ?? "en";
  }

  function refDoc(themeId: string, key: string): string {
    const href = CDN[themeId];
    const body = refMarkupFor(themeId, key);
    const fontLinks = FONT_LINKS[themeId] ?? "";
    const brandFont = BRAND_FONT[themeId] ?? "system-ui, sans-serif";
    const lang = refLang(themeId);
    // body width = BENCH_WIDTH + 2*IFRAME_PAD (box-sizing:border-box) pour que
    // la zone de contenu de référence fasse exactement BENCH_WIDTH px →
    // apples-to-apples avec notre côté.
    return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><link rel="stylesheet" href="${href}">${fontLinks}<style>html,body{box-sizing:border-box}*,*::before,*::after{box-sizing:inherit}body{margin:0;padding:${IFRAME_PAD}px;font-family:${brandFont};background:#fff}</style></head><body>${body}</body></html>`;
  }

  // Fallback de labels pour les thèmes sans entrée dans LABELS.
  function labelsFor(themeId: string): L {
    return LABELS[themeId] ?? LABELS["carbon"];
  }
</script>

<svelte:head>
  <!-- F2 : polices de marque chargées RÉELLEMENT de NOTRE côté aussi.
       Marianne (DSFR) : @font-face servis par le CDN (URLs absolues), sans
       injecter le reset global de dsfr.min.css. IBM Plex Sans (Carbon) :
       Google Fonts. Sans cela, notre côté retombait sur un fallback alors
       qu'il déclare Marianne / IBM Plex Sans (comparaison asymétrique). -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin="anonymous" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap"
  />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<style>${ourFontFaces}</style>`}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<style>${scopedCss}</style>`}
</svelte:head>

<div class="cmp" id="cmp">
  <header class="cmp-head">
    <h1>Banc de fidélité: notre DS mappé vs DS officiel</h1>
    <p>
      Thèmes importés uniquement. Pour chacun : <strong>notre composant mappé</strong> à gauche,
      le <strong>vrai composant officiel</strong> (CSS+markup d'origine, en iframe isolée) à droite.
      Langue native du DS des deux côtés. Survole / Tab pour voir hover/focus.
      Couverture élargie (G5) : variants/états + composants additionnels.
    </p>
  </header>

  {#each THEMES as theme (theme.id)}
    {@const lab = labelsFor(theme.id)}
    <section class="cmp-theme cmp-scope--{theme.id}" data-st-theme={theme.id}>
      <h2 class="cmp-theme__name">
        {theme.label} <code>({theme.id})</code>
        <span class="cmp-theme__ver">Sentropic DS v{dsVersion} · thème v{themeVersion(theme.id)}</span>
      </h2>

      {#each ENTRIES.filter((e) => e.themesFor.has(theme.id)) as entry (entry.key)}
        <div class="cmp-row" data-compare-theme={theme.id} data-compare-component={entry.key} data-compare-scenario={entry.key}>
          <div class="cmp-row__label">{entry.label}</div>

          <div class="cmp-cell">
            <span class="cmp-cell__tag">Sentropic → {theme.id}</span>
            <div
              class="cmp-cell__body"
              class:cmp-cell__body--field={entry.full}
              class:cmp-cell__body--card={entry.card}
            >
              {#if entry.key === "Button"}
                <div class="cmp-stack">
                  <Button>{lab.primary}</Button>
                  <Button variant="secondary">{lab.secondary}</Button>
                </div>
              {:else if entry.key === "ButtonDisabled"}
                <Button disabled>{lab.disabled}</Button>
              {:else if entry.key === "Input"}
                <Input label={lab.email} placeholder={lab.placeholder} helperText={lab.helper} />
              {:else if entry.key === "InputError"}
                <Input label={lab.email} placeholder={lab.placeholder} helperText={lab.helper} errorText={lab.errorText} />
              {:else if entry.key === "InputDisabled"}
                <Input label={lab.email} placeholder={lab.placeholder} disabled />
              {:else if entry.key === "Textarea"}
                <Textarea label={lab.message} placeholder={lab.messagePlaceholder} rows={3} />
              {:else if entry.key === "Select"}
                <Select label={lab.selectLabel}>
                  {#each lab.options as o}
                    <option value={o.value}>{o.label}</option>
                  {/each}
                </Select>
              {:else if entry.key === "Search"}
                <Search label={lab.searchLabel} placeholder={lab.searchPlaceholder} />
              {:else if entry.key === "Link"}
                <div class="cmp-stack">
                  <Link href="#cmp">{lab.inline}</Link>
                  <Link href="#cmp" variant="standalone">{lab.standalone}</Link>
                </div>
              {:else if entry.key === "Checkbox"}
                <Checkbox label={lab.check} helperText={lab.checkHelp} checked />
              {:else if entry.key === "Radio"}
                <Radio label={lab.radio} name="cmp-radio-{theme.id}" checked />
              {:else if entry.key === "Toggle"}
                <Toggle label={lab.toggle} labelOn={lab.toggleOn} labelOff={lab.toggleOff} checked />
              {:else if entry.key === "Switch"}
                <Switch label={lab.switchLabel} checked />
              {:else if entry.key === "Tag"}
                <Tag>{lab.tag}</Tag>
              {:else if entry.key === "Badge"}
                <Badge tone="info">{lab.badge}</Badge>
              {:else if entry.key === "Alert"}
                <Alert tone="info" title={lab.alertTitle} message={lab.alertMessage} />
              {:else if entry.key === "Accordion"}
                <Accordion items={lab.accordion} />
              {:else if entry.key === "Breadcrumb"}
                <Breadcrumb items={lab.crumbs} />
              {:else if entry.key === "Pagination"}
                <Pagination page={2} pageCount={3} />
              {:else if entry.key === "Card"}
                <Card interactive>
                  <strong>{lab.cardTitle}</strong>
                  <p style="margin:0">{lab.cardBody}</p>
                </Card>
              {:else if entry.key === "Tabs"}
                <Tabs items={lab.tabs} label="Demo tabs" />
              {:else if entry.key === "Quote"}
                <Quote author={lab.quoteAuthor} source={lab.quoteSource}>{lab.quote}</Quote>
              {:else if entry.key === "Highlight"}
                <Highlight title={lab.highlightTitle}>{lab.highlightBody}</Highlight>
              {/if}
            </div>
          </div>

          <div class="cmp-cell cmp-cell--ref">
            <span class="cmp-cell__tag">{theme.label} officiel</span>
            <div class="cmp-cell__body cmp-cell__body--ref">
              <iframe
                class="cmp-frame"
                style="width:{BENCH_WIDTH + 2 * IFRAME_PAD}px"
                title="{theme.label} officiel: {entry.label}"
                srcdoc={refDoc(theme.id, entry.key)}
              ></iframe>
            </div>
          </div>
        </div>
      {/each}
    </section>
  {/each}
</div>

<style>
  .cmp {
    padding: 2rem;
    display: grid;
    gap: 2rem;
    font-family: system-ui, sans-serif;
  }
  .cmp-head h1 { margin: 0 0 0.5rem; }
  .cmp-head p { max-width: 70ch; color: #475569; }
  .cmp-theme {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    display: grid;
    gap: 1rem;
    background: var(--st-semantic-surface-default, #fff);
    color: var(--st-semantic-text-primary, #0f172a);
  }
  /* F2 : la chaîne `font-family` de marque du thème s'applique à TOUT le scope
     (comme dans le DS réel) : Link/Card, qui n'imposent pas leur propre famille,
     héritent ainsi de Marianne / IBM Plex Sans : identique au <body> de marque
     de l'iframe de référence, plus de fallback system-ui asymétrique. */
  .cmp-scope--dsfr,
  .cmp-scope--carbon,
  .cmp-scope--airbus {
    font-family: var(--st-font-sans, system-ui, sans-serif);
  }
  .cmp-theme__name {
    margin: 0;
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .cmp-theme__ver {
    font-size: 0.75rem;
    font-weight: 500;
    color: #64748b;
  }
  /* G4 : grille propre : 3 colonnes fixes (libellé · nous · réf). Les deux
     cellules de comparaison ont EXACTEMENT la même largeur (1fr/1fr) et la même
     origine de contenu. `align-items:stretch` → boîtes de même hauteur. */
  .cmp-row {
    display: grid;
    grid-template-columns: 12rem minmax(0, 1fr) minmax(0, 1fr);
    gap: 1rem;
    align-items: stretch;
    border-top: 1px solid #eef2f7;
    padding-top: 1rem;
  }
  /* Libellé aligné en haut, sur la même ligne que le tag « Sentropic → » des
     cellules (pas de flottement vertical). */
  .cmp-row__label {
    font-weight: 700;
    font-size: 0.9375rem;
    line-height: 1.3;
    color: #1e293b;
  }
  .cmp-cell {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
    padding: 0.75rem;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
    min-width: 0;
  }
  .cmp-cell--ref { background: #fbfcfe; }
  /* G4 : corps de cellule : MÊME origine des deux côtés. Le contenu démarre en
     haut-gauche (flex-start/flex-start) de façon identique à l'iframe, qui rend
     son markup à partir de son coin haut-gauche → libellés et boîtes alignés. */
  .cmp-cell__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: flex-start;
    align-items: flex-start;
  }
  /* La cellule de référence n'a qu'une iframe : on la cale en haut-gauche,
     même origine que notre contenu. */
  .cmp-cell__body--ref {
    align-items: flex-start;
  }
  /* F1 : banc apples-to-apples : les champs pleine largeur remplissent
     exactement BENCH_WIDTH (320px), identique à la zone de contenu de
     l'iframe de référence (largeur iframe − 2×14px de padding). */
  .cmp-cell__body--field {
    align-items: stretch;
  }
  .cmp-cell__body--field > :global(*) {
    width: min(320px, var(--st-component-field-maxWidth, 320px));
    max-width: min(320px, var(--st-component-field-maxWidth, 320px));
  }
  /* Card : la référence officielle est rendue avec `max-width:18rem` (288px) et
     remplit la largeur de son body. On rend NOTRE carte dans le MÊME contexte
     de largeur (18rem) pour une comparaison apples-to-apples ; tout résidu de
     largeur restant est alors une vraie différence d'anatomie, pas un artefact
     de mise en page. */
  .cmp-cell__body--card {
    align-items: stretch;
  }
  .cmp-cell__body--card > :global(*) {
    width: 18rem;
    max-width: 18rem;
  }
  .cmp-stack { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
  .cmp-cell__tag {
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748b;
  }
  .cmp-frame {
    /* Largeur fixée en ligne (BENCH_WIDTH + 2×padding) pour rendre la zone de
       contenu de référence à BENCH_WIDTH, identique à notre côté. Calée en haut,
       même origine que notre contenu (G4). */
    flex: 0 0 auto;
    min-height: 7rem;
    width: 100%;
    max-width: 100%;
    border: 0;
    background: #fff;
  }
</style>
