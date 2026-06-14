<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock neutres (paramètres / administration) ────────────────────

  const SECTIONS = $derived([
    { label: fr ? "Général" : "General", href: "#", active: true },
    { label: fr ? "Profil" : "Profile", href: "#" },
    { label: fr ? "Sécurité" : "Security", href: "#" },
    { label: fr ? "Notifications" : "Notifications", href: "#" },
    { label: fr ? "Facturation" : "Billing", href: "#" },
    { label: fr ? "Membres" : "Members", href: "#" },
    { label: "API", href: "#" }
  ]);

  const LANG_OPTIONS = [
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
    { value: "es", label: "Español" }
  ];

  const TIMEZONE_OPTIONS = [
    { value: "america-montreal", label: "America/Montreal (UTC−5)" },
    { value: "europe-paris", label: "Europe/Paris (UTC+1)" },
    { value: "utc", label: "UTC" }
  ];

  const DATEFMT_OPTIONS = [
    { value: "iso", label: "AAAA-MM-JJ" },
    { value: "fr", label: "JJ/MM/AAAA" },
    { value: "us", label: "MM/JJ/AAAA" }
  ];

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "st-shell" },
      children: [
        // Volet gauche : sous-sections de réglages
        {
          el: "aside",
          props: { class: "st-aside" },
          children: [
            { el: "h3", props: { class: "st-aside-title" }, children: [fr ? "Paramètres" : "Settings"] },
            {
              comp: "SideNav",
              props: {
                items: SECTIONS.map((s) => ({ label: s.label, href: s.href, active: s.active }))
              }
            }
          ]
        },
        // Volet droit : panneau de réglages
        {
          el: "main",
          props: { class: "st-main" },
          children: [
            {
              el: "div",
              props: { class: "st-main-head" },
              children: [
                { el: "h2", props: { class: "st-main-title" }, children: [fr ? "Général" : "General"] },
                { comp: "Badge", props: { tone: "info" }, children: [fr ? "Espace : Sent Tech" : "Workspace: Sent Tech"] }
              ]
            },
            // Onglets de catégories
            {
              comp: "Tabs",
              props: {
                items: [
                  { id: "preferences", label: fr ? "Préférences" : "Preferences", content: fr ? "Langue, fuseau horaire et format de date de l'espace." : "Workspace language, timezone and date format." },
                  { id: "features", label: fr ? "Fonctionnalités" : "Features", content: fr ? "Activation des modules optionnels." : "Toggle optional modules." },
                  { id: "advanced", label: fr ? "Avancé" : "Advanced", content: fr ? "Réglages réservés aux administrateurs." : "Administrator-only settings." }
                ]
              }
            },
            // Formulaire de réglages
            {
              comp: "Form",
              props: { status: "idle" },
              children: [
                {
                  comp: "FormGroup",
                  props: {
                    legend: fr ? "Localisation" : "Localization",
                    helperText: fr ? "Appliqué à tous les membres de l'espace." : "Applied to every workspace member."
                  },
                  children: [
                    { comp: "Select", props: { label: fr ? "Langue de l'interface" : "Interface language", value: "fr", options: LANG_OPTIONS } },
                    { comp: "Select", props: { label: fr ? "Fuseau horaire" : "Timezone", value: "america-montreal", options: TIMEZONE_OPTIONS } },
                    { comp: "Select", props: { label: fr ? "Format de date" : "Date format", value: "iso", options: DATEFMT_OPTIONS } }
                  ]
                },
                {
                  comp: "FormGroup",
                  props: {
                    legend: fr ? "Identité de l'espace" : "Workspace identity"
                  },
                  children: [
                    { comp: "Input", props: { label: fr ? "Nom de l'espace" : "Workspace name", value: "Sent Tech" } },
                    { comp: "Input", props: { label: fr ? "Domaine personnalisé" : "Custom domain", value: "app.sent-tech.ca", helperText: fr ? "Un changement nécessite une nouvelle vérification DNS." : "Changing this requires re-verifying DNS." } }
                  ]
                },
                {
                  comp: "FormGroup",
                  props: {
                    legend: fr ? "Comportements" : "Behaviors"
                  },
                  children: [
                    { comp: "Toggle", props: { label: fr ? "Mode sombre par défaut" : "Default to dark mode" } },
                    { comp: "Switch", props: { label: fr ? "Sauvegarde automatique" : "Automatic save", checked: true, helperText: fr ? "Enregistre les modifications toutes les 30 secondes." : "Saves changes every 30 seconds." } },
                    { comp: "Switch", props: { label: fr ? "Journal d'audit" : "Audit log", checked: true } }
                  ]
                }
              ]
            },
            // Barre d'enregistrement (Save-bar)
            {
              el: "div",
              props: { class: "st-savebar" },
              children: [
                { el: "span", props: { class: "st-savebar-hint" }, children: [fr ? "Modifications non enregistrées" : "Unsaved changes"] },
                {
                  comp: "ButtonGroup",
                  props: { label: fr ? "Actions d'enregistrement" : "Save actions" },
                  children: [
                    { comp: "Button", props: { variant: "ghost", size: "sm" }, children: [fr ? "Annuler" : "Cancel"] },
                    { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Enregistrer" : "Save changes"] }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "SideNav", slug: "side-nav" },
    { name: "Tabs", slug: "tabs" },
    { name: "Badge", slug: "badge" },
    { name: "Form", slug: "form" },
    { name: "FormGroup", slug: "form-group" },
    { name: "Input", slug: "input" },
    { name: "Select", slug: "select" },
    { name: "Toggle", slug: "toggle" },
    { name: "Switch", slug: "switch" },
    { name: "ButtonGroup", slug: "button-group" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Administration" : "View · Admin"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Paramètres / Administration" : "Settings / Admin"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Patron d'administration master-détail : <code>SideNav</code> de sous-sections à gauche,
        <code>Tabs</code> de catégories, <code>Form</code>/<code>FormGroup</code>
        (<code>Select</code>, <code>Input</code>, <code>Toggle</code>, <code>Switch</code>) et une
        barre d'enregistrement (<code>ButtonGroup</code>). Un seul <code>NodeSpec</code> → rendu
        identique en Svelte, React, Vue et Angular.
      {:else}
        The master-detail admin pattern: a sub-section <code>SideNav</code> on the left, category
        <code>Tabs</code>, a <code>Form</code>/<code>FormGroup</code> (<code>Select</code>,
        <code>Input</code>, <code>Toggle</code>, <code>Switch</code>) and a save bar
        (<code>ButtonGroup</code>). One <code>NodeSpec</code> → identical render in Svelte, React,
        and Vue.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <p class="section-desc">
      {fr
        ? "Utilisez les onglets pour basculer entre Svelte, React, Vue et Angular. Le rendu et le code copié reflètent le framework sélectionné."
        : "Use the tabs to switch between Svelte, React, Vue, and Angular. The render and copied code reflect the selected framework."}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Paramètres : espace de travail (données mock)" : "Settings : workspace (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="st-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .section-desc {
    color: var(--st-semantic-text-secondary);
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    max-width: 800px;
  }

  .st-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout Settings (global → propagé dans les îles React/Vue/Angular) ─────────── */
  :global(.st-shell) {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 0;
    width: 100%;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--st-semantic-surface-raised, #fff);
    align-items: stretch;
  }

  :global(.st-aside) {
    border-right: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-subtle, #f8fafc);
    padding: 1rem;
    min-width: 0;
  }

  :global(.st-aside-title) {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--st-semantic-text-secondary, #475569);
    margin: 0 0 0.75rem;
  }

  :global(.st-main) {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem;
    min-width: 0;
  }

  :global(.st-main-head) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  :global(.st-main-title) {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.st-savebar) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 0.85rem 1rem;
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: 0.5rem;
    background: var(--st-semantic-surface-subtle, #f8fafc);
  }

  :global(.st-savebar-hint) {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--st-semantic-text-secondary, #475569);
  }

  @media (max-width: 760px) {
    :global(.st-shell) {
      grid-template-columns: 1fr;
    }
    :global(.st-aside) {
      border-right: none;
      border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    }
  }
</style>
