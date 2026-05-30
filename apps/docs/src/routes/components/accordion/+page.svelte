<script lang="ts">
  import { Badge, Accordion } from "@sentropic/design-system-svelte";
  import type { AccordionItem } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      intro:
        "Liste de panneaux pliables avec en-têtes accessibles (`aria-expanded`, `aria-controls`, région labellisée). En mode `multiple`, plusieurs panneaux restent ouverts ; sinon l’ouverture est exclusive.",
      usageTitle: "Notes d’usage",
      usageNote1:
        "`items` est typé `AccordionItem` (`{ id, title, content, disabled? }`). `open` est `$bindable<string[]>` et liste les `id` ouverts ; `onchange` reçoit le nouveau tableau.",
      usageNote2:
        "`multiple={false}` (défaut) ferme les autres panneaux à l’ouverture d’un nouveau. `multiple={true}` les empile. Un item `disabled` ne réagit pas au clic.",
      usageNote3:
        "`align` place le chevron : `end` (défaut, titre à gauche / chevron à droite) ou `start` (chevron avant le titre). Le chevron pivote de 180° à l’ouverture.",
      multipleLabel: "Ouverture multiple",
      sizeLabel: "Tailles",
      stateLabel: "Alignement start et item désactivé",
      openLabel: "Panneaux ouverts"
    },
    en: {
      intro:
        "List of collapsible panels with accessible headers (`aria-expanded`, `aria-controls`, labelled region). In `multiple` mode several panels stay open; otherwise expansion is exclusive.",
      usageTitle: "Usage notes",
      usageNote1:
        "`items` is typed `AccordionItem` (`{ id, title, content, disabled? }`). `open` is `$bindable<string[]>` listing open `id`s; `onchange` receives the new array.",
      usageNote2:
        "`multiple={false}` (default) closes other panels when one opens. `multiple={true}` stacks them. A `disabled` item ignores clicks.",
      usageNote3:
        "`align` places the chevron: `end` (default, title left / chevron right) or `start` (chevron before the title). The chevron rotates 180° when open.",
      multipleLabel: "Multiple expansion",
      sizeLabel: "Sizes",
      stateLabel: "Start alignment and disabled item",
      openLabel: "Open panels"
    }
  } as const;

  const text = () => copy[locale.value];

  const faqItems: AccordionItem[] = [
    {
      id: "billing",
      title: locale.value === "fr" ? "Facturation" : "Billing",
      content:
        locale.value === "fr"
          ? "Les factures sont émises le premier jour de chaque mois et disponibles dans l’espace client."
          : "Invoices are issued on the first day of each month and available in the customer area."
    },
    {
      id: "limits",
      title: locale.value === "fr" ? "Limites du plan" : "Plan limits",
      content:
        locale.value === "fr"
          ? "Chaque plan fixe un quota mensuel ; le dépassement est facturé à l’usage."
          : "Each plan sets a monthly quota; overage is billed on usage."
    },
    {
      id: "support",
      title: locale.value === "fr" ? "Support" : "Support",
      content:
        locale.value === "fr"
          ? "Le support est joignable par chat en heures ouvrées et par e-mail en continu."
          : "Support is reachable via chat during business hours and email at all times."
    }
  ];

  const stateItems: AccordionItem[] = [
    {
      id: "active",
      title: locale.value === "fr" ? "Section active" : "Active section",
      content: locale.value === "fr" ? "Contenu pliable standard." : "Standard collapsible content."
    },
    {
      id: "locked",
      title: locale.value === "fr" ? "Section verrouillée" : "Locked section",
      content: locale.value === "fr" ? "Non accessible." : "Not accessible.",
      disabled: true
    }
  ];

  let multiOpen = $state<string[]>(["billing", "support"]);
  let smOpen = $state<string[]>(["billing"]);
  let mdOpen = $state<string[]>(["billing"]);
  let lgOpen = $state<string[]>(["billing"]);
  let stateOpen = $state<string[]>(["active"]);
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · {locale.value === "fr" ? "Structure" : "Layout"}</p>
    <h1>
      Accordion
      <Badge tone="success">{t(locale.value, "statusStable")}</Badge>
    </h1>
    <p>{text().intro}</p>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Quand l'utiliser" : "When to use"}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{locale.value === "fr" ? "Condenser un contenu long en sections repliables (FAQ, paramètres avancés)." : "Condense long content into collapsible sections (FAQ, advanced settings)."}</li>
      <li>{locale.value === "fr" ? "multiple={false} pour un focus sur une section à la fois ; multiple pour comparer." : "multiple={false} to focus on one section at a time; multiple to compare."}</li>
      <li>{locale.value === "fr" ? "Pour basculer entre des vues d'un même objet, préférez Tabs." : "To switch between views of the same object, prefer Tabs."}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "examplesTitle")}</h2>

    <div class="docs-example" aria-label={text().multipleLabel}>
      <Accordion items={faqItems} multiple bind:open={multiOpen} />
      <p class="docs-demo-note">
        {text().openLabel}: <code>{multiOpen.join(", ") || "—"}</code>
      </p>
    </div>

    <div class="docs-example" aria-label={t(locale.value, "sizes")}>
      <Accordion items={faqItems} size="sm" bind:open={smOpen} />
      <Accordion items={faqItems} size="md" bind:open={mdOpen} />
      <Accordion items={faqItems} size="lg" bind:open={lgOpen} />
    </div>

    <div class="docs-example" aria-label={text().stateLabel}>
      <Accordion items={stateItems} align="start" bind:open={stateOpen} />
    </div>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "apiTitle")}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
      </thead>
      <tbody>
        <tr><td><code>items</code></td><td><code>AccordionItem[]</code></td><td><em>{locale.value === "fr" ? "requis" : "required"}</em></td></tr>
        <tr><td><code>multiple</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
        <tr><td><code>open</code></td><td><code>string[]</code> (<code>$bindable</code>)</td><td><code>[]</code></td></tr>
        <tr><td><code>align</code></td><td><code>"start" | "end"</code></td><td><code>"end"</code></td></tr>
        <tr><td><code>size</code></td><td><code>"sm" | "md" | "lg"</code></td><td><code>"md"</code></td></tr>
        <tr><td><code>onchange</code></td><td><code>(open: string[]) =&gt; void</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td><em>{locale.value === "fr" ? "optionnel" : "optional"}</em></td></tr>
        <tr><td colspan="3"><em>{locale.value === "fr" ? "+ attributs HTMLDivElement transmis (...rest)" : "+ forwarded HTMLDivElement attributes (...rest)"}</em></td></tr>
      </tbody>
    </table>

    <h3>AccordionItem</h3>
    <table class="docs-table">
      <thead>
        <tr><th>{locale.value === "fr" ? "Champ" : "Field"}</th><th>Type</th></tr>
      </thead>
      <tbody>
        <tr><td><code>id</code></td><td><code>string</code></td></tr>
        <tr><td><code>title</code></td><td><code>string</code></td></tr>
        <tr><td><code>content</code></td><td><code>string</code></td></tr>
        <tr><td><code>disabled</code></td><td><code>boolean</code> (<em>{locale.value === "fr" ? "optionnel" : "optional"}</em>)</td></tr>
      </tbody>
    </table>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Anatomie" : "Anatomy"}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{locale.value === "fr" ? "Item (.st-accordion__item) : un en-tête + un panneau pliable." : "Item (.st-accordion__item): a header + a collapsible panel."}</li>
      <li>{locale.value === "fr" ? "Déclencheur (.st-accordion__trigger) : un <button> dans un <h3>, avec chevron qui pivote." : "Trigger (.st-accordion__trigger): a <button> inside an <h3>, with a rotating chevron."}</li>
      <li>{locale.value === "fr" ? "Panneau (.st-accordion__panel, role=\"region\") : le contenu, rendu seulement si ouvert." : "Panel (.st-accordion__panel, role=\"region\"): the content, rendered only when open."}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Accessibilité" : "Accessibility"}</h2>
    <ul class="docs-list docs-list--plain">
      <li>{locale.value === "fr" ? "Chaque déclencheur expose aria-expanded et aria-controls vers son panneau." : "Each trigger exposes aria-expanded and aria-controls pointing to its panel."}</li>
      <li>{locale.value === "fr" ? "Le panneau a role=\"region\" et aria-labelledby vers son en-tête." : "The panel has role=\"region\" and aria-labelledby pointing to its header."}</li>
      <li>{locale.value === "fr" ? "Les en-têtes sont des <button> dans des <h3> : navigables et activables au clavier." : "Headers are <button>s inside <h3>s: keyboard-navigable and activatable."}</li>
      <li>{locale.value === "fr" ? "Un item disabled est non focusable et ignore le clic." : "A disabled item is non-focusable and ignores clicks."}</li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>{locale.value === "fr" ? "Lignes directrices" : "Guidelines"}</h2>
    <div class="docs-guidelines">
      <div class="docs-guideline docs-guideline--do">
        <p class="docs-guideline__tag">{locale.value === "fr" ? "À faire" : "Do"}</p>
        <ul>
          <li>{locale.value === "fr" ? "Des titres de section clairs et autoportants." : "Clear, self-explanatory section titles."}</li>
          <li>{locale.value === "fr" ? "Ouvrir par défaut la section la plus utile." : "Open the most useful section by default."}</li>
        </ul>
      </div>
      <div class="docs-guideline docs-guideline--dont">
        <p class="docs-guideline__tag">{locale.value === "fr" ? "À éviter" : "Don't"}</p>
        <ul>
          <li>{locale.value === "fr" ? "Cacher du contenu critique derrière un pli." : "Hide critical content behind a fold."}</li>
          <li>{locale.value === "fr" ? "Imbriquer des accordéons sur plusieurs niveaux." : "Nest accordions across multiple levels."}</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="docs-section">
    <h2>{text().usageTitle}</h2>
    <p class="docs-demo-note">{text().usageNote1}</p>
    <p class="docs-demo-note">{text().usageNote2}</p>
    <p class="docs-demo-note">{text().usageNote3}</p>
  </section>

  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-control-border</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
      <li><code>--st-component-control-focusRing</code></li>
      <li><code>--st-semantic-text-primary</code></li>
      <li><code>--st-semantic-text-secondary</code></li>
      <li><code>--st-semantic-text-muted</code></li>
      <li><code>--st-semantic-border-subtle</code></li>
      <li><code>--st-semantic-border-interactive</code></li>
      <li><code>--st-semantic-surface-subtle</code></li>
      <li><code>--st-motion-fast</code></li>
      <li><code>--st-motion-easing</code></li>
    </ul>
  </section>
</div>
