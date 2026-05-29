<script lang="ts">
  // Fidelity bench (spec §5) — banc réservé aux THÈMES IMPORTÉS : pour chacun,
  // NOTRE composant mappé À CÔTÉ du VRAI composant officiel (CSS + markup
  // d'origine, isolés en iframe). Sent Tech (notre marque) n'a pas de pendant
  // externe → exclu de ce banc. Langue cohérente par DS (DSFR=FR, Carbon=EN).
  // Hors nav.
  import { Button, Card, Input, Link, Select, Tabs, Textarea } from "@sentropic/design-system-svelte";
  import { compileTheme, type TenantTheme } from "@sentropic/design-system-themes";
  import { dsfrTheme } from "@sentropic/design-system-theme-dsfr";
  import { carbonTheme } from "@sentropic/design-system-theme-carbon";
  import docsPkg from "../../../package.json";

  // Thèmes importés uniquement.
  const THEMES: TenantTheme[] = [dsfrTheme, carbonTheme];
  const scopedCss = THEMES.map((t) => compileTheme(t, { selector: `.cmp-scope--${t.id}` })).join("\n");

  // Versions (source = deps épinglées du docs) : DS Sentropic + thème.
  const dsVersion = docsPkg.dependencies["@sentropic/design-system-themes"];
  const themeVersion = (id: string): string =>
    (docsPkg.dependencies as Record<string, string>)[`@sentropic/design-system-theme-${id}`] ?? "?";

  // Libellés dans la langue native du DS (DSFR=FR, Carbon=EN) des DEUX côtés.
  type L = {
    primary: string; secondary: string; email: string; helper: string; placeholder: string;
    inline: string; standalone: string; cardTitle: string; cardBody: string;
    message: string; messagePlaceholder: string; selectLabel: string;
    options: { value: string; label: string }[];
    tabs: { value: string; label: string; content: string; disabled?: boolean }[];
  };
  const LABELS: Record<string, L> = {
    dsfr: {
      primary: "Primaire", secondary: "Secondaire", email: "Email", helper: "Texte d'aide",
      placeholder: "nom@exemple.org", inline: "Lien inline", standalone: "Lien standalone",
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
      ]
    },
    carbon: {
      primary: "Primary", secondary: "Secondary", email: "Email", helper: "Helper text",
      placeholder: "name@example.org", inline: "Inline link", standalone: "Standalone link",
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
      ]
    }
  };

  const CDN: Record<string, string> = {
    dsfr: "https://cdn.jsdelivr.net/npm/@gouvfr/dsfr/dist/dsfr.min.css",
    carbon: "https://cdn.jsdelivr.net/npm/carbon-components/css/carbon-components.min.css"
  };

  // F2 — police de marque chargée RÉELLEMENT des deux côtés du banc.
  // DSFR : Marianne via les @font-face de la feuille DSFR (CDN) + la CSS
  // utilitaire des polices. Carbon : IBM Plex Sans via Google Fonts (en plus
  // des @font-face de Carbon). On force aussi la chaîne `font-family` de marque
  // côté <body> de l'iframe, sinon le `font-family:system-ui` inline masquait
  // Marianne / IBM Plex Sans et faussait la comparaison (fallback asymétrique).
  const FONT_LINKS: Record<string, string> = {
    dsfr: `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@gouvfr/dsfr/dist/utility/utility.min.css">`,
    carbon: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap">`
  };

  // Chaîne `font-family` de marque appliquée au <body> de l'iframe de référence,
  // pour que la référence rende la MÊME famille que notre côté (plus de fallback
  // system-ui asymétrique).
  const BRAND_FONT: Record<string, string> = {
    dsfr: "Marianne, arial, system-ui, sans-serif",
    carbon: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif"
  };

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

  // F1 — banc apples-to-apples : largeur de rendu commune aux DEUX côtés.
  // Les champs pleine largeur (Input/Textarea/Select) remplissent exactement
  // BENCH_WIDTH des deux côtés ; les composants à largeur intrinsèque
  // (Button/Link/Tabs) disposent du même contexte de largeur ; la carte est
  // rendue dans le même contexte de 18rem que la référence officielle.
  const BENCH_WIDTH = 320; // px — largeur de contenu identique des deux côtés
  const IFRAME_PAD = 14; // px — padding du <body> de l'iframe (cf. refDoc)

  // Markup officiel par (thème, composant), dans la langue du DS.
  const REF: Record<string, Record<string, string>> = {
    dsfr: {
      Button: `<button class="fr-btn">Primaire</button> <button class="fr-btn fr-btn--secondary">Secondaire</button>`,
      Input: `<div class="fr-input-group"><label class="fr-label" for="d">Email<span class="fr-hint-text">Texte d'aide</span></label><input class="fr-input" id="d" placeholder="nom@exemple.org"></div>`,
      Textarea: `<div class="fr-input-group"><label class="fr-label" for="dt">Message</label><textarea class="fr-input" id="dt" rows="3" placeholder="Votre message…"></textarea></div>`,
      Select: `<div class="fr-select-group"><label class="fr-label" for="ds">Région</label><select class="fr-select" id="ds"><option value="idf">Île-de-France</option><option value="bre">Bretagne</option><option value="occ">Occitanie</option></select></div>`,
      Link: `<a class="fr-link" href="#">Lien inline</a><br><a class="fr-link fr-link--lg" href="#">Lien standalone</a>`,
      Card: `<div class="fr-card fr-card--sm" style="max-width:18rem"><div class="fr-card__body"><div class="fr-card__content"><h3 class="fr-card__title">Titre de carte</h3><p class="fr-card__desc">Contenu de la carte.</p></div></div></div>`,
      Tabs: `<div class="fr-tabs"><ul class="fr-tabs__list" role="tablist"><li role="presentation"><button class="fr-tabs__tab" role="tab" aria-selected="true">Actif</button></li><li role="presentation"><button class="fr-tabs__tab" role="tab" aria-selected="false">Second</button></li></ul></div>`
    },
    carbon: {
      Button: `<button class="bx--btn bx--btn--primary">Primary</button> <button class="bx--btn bx--btn--secondary">Secondary</button>`,
      Input: `<div class="bx--form-item"><label class="bx--label" for="c">Email</label><input class="bx--text-input" id="c" placeholder="name@example.org"><div class="bx--form__helper-text">Helper text</div></div>`,
      Textarea: `<div class="bx--form-item"><label class="bx--label" for="cta">Message</label><textarea class="bx--text-area" id="cta" rows="3" placeholder="Your message…"></textarea></div>`,
      Select: `<div class="bx--form-item"><div class="bx--select"><label class="bx--label" for="cse">Region</label><div class="bx--select-input__wrapper"><select class="bx--select-input" id="cse"><option class="bx--select-option" value="north">North</option><option class="bx--select-option" value="south">South</option><option class="bx--select-option" value="east">East</option></select></div></div></div>`,
      Link: `<a class="bx--link" href="#">Inline link</a>`,
      Card: `<div class="bx--tile" style="max-width:18rem"><h3 style="margin:0 0 .5rem">Card title</h3><p style="margin:0">Card body content.</p></div>`,
      Tabs: `<nav class="bx--tabs"><ul class="bx--tabs__nav" role="tablist"><li class="bx--tabs__nav-item bx--tabs__nav-item--selected" role="tab"><a class="bx--tabs__nav-link" href="#">Active</a></li><li class="bx--tabs__nav-item" role="tab"><a class="bx--tabs__nav-link" href="#">Second</a></li></ul></nav>`
    }
  };

  const COMPONENTS = ["Button", "Input", "Textarea", "Select", "Link", "Card", "Tabs"] as const;

  // Composants à largeur 100% : remplissent exactement BENCH_WIDTH des deux
  // côtés → box width/height directement comparables.
  const FULL_WIDTH = new Set(["Input", "Textarea", "Select"]);

  function refDoc(themeId: string, comp: string): string {
    const href = CDN[themeId];
    const body = REF[themeId]?.[comp] ?? "";
    const fontLinks = FONT_LINKS[themeId] ?? "";
    const brandFont = BRAND_FONT[themeId] ?? "system-ui, sans-serif";
    // body width = BENCH_WIDTH + 2*IFRAME_PAD (box-sizing:border-box) pour que
    // la zone de contenu de référence fasse exactement BENCH_WIDTH px →
    // apples-to-apples avec notre côté.
    return `<!doctype html><html lang="${themeId === "dsfr" ? "fr" : "en"}"><head><meta charset="utf-8"><link rel="stylesheet" href="${href}">${fontLinks}<style>html,body{box-sizing:border-box}*,*::before,*::after{box-sizing:inherit}body{margin:0;padding:${IFRAME_PAD}px;font-family:${brandFont};background:#fff}</style></head><body>${body}</body></html>`;
  }
</script>

<svelte:head>
  <!-- F2 — polices de marque chargées RÉELLEMENT de NOTRE côté aussi.
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

<div class="cmp">
  <header class="cmp-head">
    <h1>Banc de fidélité — notre DS mappé vs DS officiel</h1>
    <p>
      Thèmes importés uniquement. Pour chacun : <strong>notre composant mappé</strong> à gauche,
      le <strong>vrai composant officiel</strong> (CSS+markup d'origine, en iframe isolée) à droite.
      Langue native du DS des deux côtés. Survole / Tab pour voir hover/focus.
    </p>
  </header>

  {#each THEMES as theme (theme.id)}
    {@const lab = LABELS[theme.id]}
    <section class="cmp-theme cmp-scope--{theme.id}" data-st-theme={theme.id}>
      <h2 class="cmp-theme__name">
        {theme.label} <code>({theme.id})</code>
        <span class="cmp-theme__ver">Sentropic DS v{dsVersion} · thème v{themeVersion(theme.id)}</span>
      </h2>

      {#each COMPONENTS as comp}
        <div class="cmp-row">
          <div class="cmp-row__label">{comp}</div>

          <div class="cmp-cell">
            <span class="cmp-cell__tag">Sentropic → {theme.id}</span>
            <div
              class="cmp-cell__body"
              class:cmp-cell__body--field={FULL_WIDTH.has(comp)}
              class:cmp-cell__body--card={comp === "Card"}
            >
              {#if comp === "Button"}
                <div class="cmp-stack">
                  <Button>{lab.primary}</Button>
                  <Button variant="secondary">{lab.secondary}</Button>
                </div>
              {:else if comp === "Input"}
                <Input label={lab.email} placeholder={lab.placeholder} helperText={lab.helper} />
              {:else if comp === "Textarea"}
                <Textarea label={lab.message} placeholder={lab.messagePlaceholder} rows={3} />
              {:else if comp === "Select"}
                <Select label={lab.selectLabel}>
                  {#each lab.options as o}
                    <option value={o.value}>{o.label}</option>
                  {/each}
                </Select>
              {:else if comp === "Link"}
                <div class="cmp-stack">
                  <Link href="#cmp">{lab.inline}</Link>
                  <Link href="#cmp" variant="standalone">{lab.standalone}</Link>
                </div>
              {:else if comp === "Card"}
                <Card interactive>
                  <strong>{lab.cardTitle}</strong>
                  <p style="margin:0">{lab.cardBody}</p>
                </Card>
              {:else if comp === "Tabs"}
                <Tabs items={lab.tabs} label="Demo tabs" />
              {/if}
            </div>
          </div>

          <div class="cmp-cell cmp-cell--ref">
            <span class="cmp-cell__tag">{theme.label} officiel</span>
            <iframe
              class="cmp-frame"
              style="width:{BENCH_WIDTH + 2 * IFRAME_PAD}px"
              title="{theme.label} officiel — {comp}"
              srcdoc={refDoc(theme.id, comp)}
            ></iframe>
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
    gap: 1.25rem;
    background: var(--st-semantic-surface-default, #fff);
    color: var(--st-semantic-text-primary, #0f172a);
  }
  /* F2 — la chaîne `font-family` de marque du thème s'applique à TOUT le scope
     (comme dans le DS réel) : Link/Card, qui n'imposent pas leur propre famille,
     héritent ainsi de Marianne / IBM Plex Sans — identique au <body> de marque
     de l'iframe de référence, plus de fallback system-ui asymétrique. */
  .cmp-scope--dsfr,
  .cmp-scope--carbon {
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
  .cmp-row {
    display: grid;
    grid-template-columns: 5rem 1fr 1fr;
    gap: 1rem;
    align-items: stretch; /* boîtes gauche/droite de même hauteur */
    border-top: 1px solid #eef2f7;
    padding-top: 1rem;
  }
  .cmp-row__label { font-weight: 700; padding-top: 1.5rem; }
  .cmp-cell {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
    padding: 0.75rem;
    border: 1px dashed #cbd5e1;
    border-radius: 6px;
  }
  .cmp-cell--ref { background: #fbfcfe; }
  .cmp-cell__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
    align-items: flex-start;
  }
  /* F1 — banc apples-to-apples : les champs pleine largeur remplissent
     exactement BENCH_WIDTH (320px), identique à la zone de contenu de
     l'iframe de référence (largeur iframe − 2×14px de padding). */
  .cmp-cell__body--field {
    align-items: stretch;
  }
  .cmp-cell__body--field > :global(*) {
    width: 320px;
    max-width: 320px;
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
       contenu de référence à BENCH_WIDTH, identique à notre côté. */
    flex: 0 0 auto;
    min-height: 8rem;
    max-width: 100%;
    border: 0;
    background: #fff;
  }
</style>
