<script lang="ts">
  // Fidelity bench (spec §5) — banc réservé aux THÈMES IMPORTÉS : pour chacun,
  // NOTRE composant mappé À CÔTÉ du VRAI composant officiel (CSS + markup
  // d'origine, isolés en iframe). Sent Tech (notre marque) n'a pas de pendant
  // externe → exclu de ce banc. Langue cohérente par DS (DSFR=FR, Carbon=EN).
  // Hors nav.
  import { Button, Card, Input, Link, Tabs } from "@sentropic/design-system-svelte";
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
    tabs: { value: string; label: string; content: string; disabled?: boolean }[];
  };
  const LABELS: Record<string, L> = {
    dsfr: {
      primary: "Primaire", secondary: "Secondaire", email: "Email", helper: "Texte d'aide",
      placeholder: "nom@exemple.org", inline: "Lien inline", standalone: "Lien standalone",
      cardTitle: "Titre de carte", cardBody: "Contenu de la carte.",
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

  // Markup officiel par (thème, composant), dans la langue du DS.
  const REF: Record<string, Record<string, string>> = {
    dsfr: {
      Button: `<button class="fr-btn">Primaire</button> <button class="fr-btn fr-btn--secondary">Secondaire</button>`,
      Input: `<div class="fr-input-group"><label class="fr-label" for="d">Email<span class="fr-hint-text">Texte d'aide</span></label><input class="fr-input" id="d" placeholder="nom@exemple.org"></div>`,
      Link: `<a class="fr-link" href="#">Lien inline</a><br><a class="fr-link fr-link--lg" href="#">Lien standalone</a>`,
      Card: `<div class="fr-card fr-card--sm" style="max-width:18rem"><div class="fr-card__body"><div class="fr-card__content"><h3 class="fr-card__title">Titre de carte</h3><p class="fr-card__desc">Contenu de la carte.</p></div></div></div>`,
      Tabs: `<div class="fr-tabs"><ul class="fr-tabs__list" role="tablist"><li role="presentation"><button class="fr-tabs__tab" role="tab" aria-selected="true">Actif</button></li><li role="presentation"><button class="fr-tabs__tab" role="tab" aria-selected="false">Second</button></li></ul></div>`
    },
    carbon: {
      Button: `<button class="bx--btn bx--btn--primary">Primary</button> <button class="bx--btn bx--btn--secondary">Secondary</button>`,
      Input: `<div class="bx--form-item"><label class="bx--label" for="c">Email</label><input class="bx--text-input" id="c" placeholder="name@example.org"><div class="bx--form__helper-text">Helper text</div></div>`,
      Link: `<a class="bx--link" href="#">Inline link</a>`,
      Card: `<div class="bx--tile" style="max-width:18rem"><h3 style="margin:0 0 .5rem">Card title</h3><p style="margin:0">Card body content.</p></div>`,
      Tabs: `<nav class="bx--tabs"><ul class="bx--tabs__nav" role="tablist"><li class="bx--tabs__nav-item bx--tabs__nav-item--selected" role="tab"><a class="bx--tabs__nav-link" href="#">Active</a></li><li class="bx--tabs__nav-item" role="tab"><a class="bx--tabs__nav-link" href="#">Second</a></li></ul></nav>`
    }
  };

  const COMPONENTS = ["Button", "Input", "Link", "Card", "Tabs"] as const;

  function refDoc(themeId: string, comp: string): string {
    const href = CDN[themeId];
    const body = REF[themeId]?.[comp] ?? "";
    return `<!doctype html><html lang="${themeId === "dsfr" ? "fr" : "en"}"><head><meta charset="utf-8"><link rel="stylesheet" href="${href}"><style>body{margin:0;padding:14px;font-family:system-ui,sans-serif;background:#fff}</style></head><body>${body}</body></html>`;
  }
</script>

<svelte:head>
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
            <div class="cmp-cell__body">
              {#if comp === "Button"}
                <div class="cmp-stack">
                  <Button>{lab.primary}</Button>
                  <Button variant="secondary">{lab.secondary}</Button>
                </div>
              {:else if comp === "Input"}
                <Input label={lab.email} placeholder={lab.placeholder} helperText={lab.helper} />
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
            <iframe class="cmp-frame" title="{theme.label} officiel — {comp}" srcdoc={refDoc(theme.id, comp)}></iframe>
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
  .cmp-stack { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
  .cmp-cell__tag {
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748b;
  }
  .cmp-frame {
    flex: 1;
    width: 100%;
    min-height: 8rem;
    border: 0;
    background: #fff;
  }
</style>
