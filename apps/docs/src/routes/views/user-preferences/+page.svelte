<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── Données mock bilingues ────────────────────────────────────────────────

  const LANG_OPTIONS = [
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "de", label: "Deutsch" }
  ];

  const TZ_OPTIONS = [
    { value: "america-montreal", label: "America/Montreal (UTC−5)" },
    { value: "america-new_york", label: "America/New_York (UTC−5)" },
    { value: "europe-paris", label: "Europe/Paris (UTC+1)" },
    { value: "utc", label: "UTC" }
  ];

  const DATEFMT_OPTIONS = [
    { value: "iso", label: "AAAA-MM-JJ" },
    { value: "fr", label: "JJ/MM/AAAA" },
    { value: "us", label: "MM/JJ/AAAA" }
  ];

  const NOTIF_ROWS = $derived([
    {
      id: "mentions",
      label: fr ? "Mentions et réponses" : "Mentions & replies",
      email: true,
      push: true,
      inapp: true
    },
    {
      id: "tasks",
      label: fr ? "Tâches assignées" : "Assigned tasks",
      email: true,
      push: false,
      inapp: true
    },
    {
      id: "updates",
      label: fr ? "Mises à jour de projet" : "Project updates",
      email: false,
      push: false,
      inapp: true
    },
    {
      id: "security",
      label: fr ? "Alertes de sécurité" : "Security alerts",
      email: true,
      push: true,
      inapp: true
    }
  ]);

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "up-shell" },
      children: [
        // Carte profil
        {
          comp: "Card",
          props: { class: "up-profile-card" },
          children: [
            {
              el: "div",
              props: { class: "up-profile-row" },
              children: [
                { comp: "Avatar", props: { name: "Sophie Larochelle", size: "xl", tone: "category3" } },
                {
                  el: "div",
                  props: { class: "up-profile-info" },
                  children: [
                    { el: "h2", props: { class: "up-profile-name" }, children: ["Sophie Larochelle"] },
                    { el: "p", props: { class: "up-profile-role" }, children: [fr ? "Gestionnaire de produit · Sent Tech" : "Product Manager · Sent Tech"] },
                    { comp: "Badge", props: { tone: "success" }, children: [fr ? "Actif" : "Active"] }
                  ]
                },
                { comp: "Button", props: { variant: "secondary", size: "sm" }, children: [fr ? "Modifier le profil" : "Edit profile"] }
              ]
            }
          ]
        },
        // Réglages langue / fuseau / format
        {
          comp: "FieldCard",
          props: { label: fr ? "Localisation & affichage" : "Localization & display", variant: "bordered" },
          children: [
            {
              el: "div",
              props: { class: "up-selects" },
              children: [
                { comp: "Select", props: { label: fr ? "Langue de l'interface" : "Interface language", value: "fr", options: LANG_OPTIONS } },
                { comp: "Select", props: { label: fr ? "Fuseau horaire" : "Timezone", value: "america-montreal", options: TZ_OPTIONS } },
                { comp: "Select", props: { label: fr ? "Format de date" : "Date format", value: "iso", options: DATEFMT_OPTIONS } }
              ]
            }
          ]
        },
        // Coordonnées
        {
          comp: "FieldCard",
          props: { label: fr ? "Coordonnées" : "Contact details", variant: "bordered" },
          children: [
            {
              el: "div",
              props: { class: "up-selects" },
              children: [
                { comp: "Input", props: { label: fr ? "Courriel" : "Email", value: "s.larochelle@sent-tech.ca", type: "email" } },
                { comp: "Input", props: { label: fr ? "Téléphone" : "Phone", value: "+1 514 555 0142", type: "tel" } }
              ]
            }
          ]
        },
        // Canaux de notification par catégorie
        {
          comp: "FieldCard",
          props: { label: fr ? "Notifications" : "Notifications", variant: "bordered" },
          children: [
            { el: "p" as const, props: { class: "up-notif-desc" }, children: [fr ? "Choisissez les canaux par catégorie d'événement." : "Choose channels per event category."] },
            ...NOTIF_ROWS.map((row) => ({
              el: "div" as const,
              props: { class: "up-notif-row" },
              children: [
                { el: "span", props: { class: "up-notif-label" }, children: [row.label] },
                { comp: "Badge" as const, props: { tone: row.email ? ("info" as const) : ("neutral" as const) }, children: ["Email"] },
                { comp: "Badge" as const, props: { tone: row.push ? ("warning" as const) : ("neutral" as const) }, children: ["Push"] },
                { comp: "Badge" as const, props: { tone: row.inapp ? ("success" as const) : ("neutral" as const) }, children: [fr ? "In-app" : "In-app"] }
              ]
            }))
          ]
        },
        // Barre d'enregistrement
        {
          el: "div",
          props: { class: "up-savebar" },
          children: [
            { el: "span", props: { class: "up-savebar-hint" }, children: [fr ? "Modifications non enregistrées" : "Unsaved changes"] },
            { comp: "Button", props: { variant: "ghost", size: "sm" }, children: [fr ? "Annuler" : "Cancel"] },
            { comp: "Button", props: { variant: "primary", size: "sm" }, children: [fr ? "Enregistrer" : "Save"] }
          ]
        }
      ]
    }
  ]);

  const DS_COMPONENTS = [
    { name: "Card", slug: "card" },
    { name: "Avatar", slug: "avatar" },
    { name: "Badge", slug: "badge" },
    { name: "Select", slug: "select" },
    { name: "Input", slug: "input" },
    { name: "FieldCard", slug: "field-card" },
    { name: "Button", slug: "button" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Transversal" : "Transversal"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Préférences utilisateur" : "User Preferences"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {fr
        ? "Page de préférences : carte profil avec avatar, réglages langue/fuseau/format via selects, canaux de notification par catégorie et fiches de configuration. Pour personnaliser compte et notifications."
        : "Preferences page: profile card with avatar, language/timezone/format settings via selects, per-category notification channels and configuration cards. For personalizing account and notifications."}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu multi-framework" : "Multi-framework render"}</h2>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Préférences utilisateur : Sophie Larochelle (données mock)" : "User Preferences: Sophie Larochelle (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="up-comp-list">
      {#each DS_COMPONENTS as comp (comp.slug)}
        <li><Link href="/components/{comp.slug}">{comp.name}</Link></li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .up-comp-list { list-style: disc; margin: 0; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.95rem; }
  :global(.up-shell) { display: flex; flex-direction: column; gap: 1.25rem; width: 100%; }
  :global(.up-profile-card) { padding: 1.25rem; }
  :global(.up-profile-row) { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
  :global(.up-profile-info) { display: flex; flex-direction: column; gap: 0.35rem; flex: 1; }
  :global(.up-profile-name) { font-size: 1.25rem; font-weight: 700; margin: 0; color: var(--st-semantic-text-primary, #0f172a); }
  :global(.up-profile-role) { font-size: 0.875rem; margin: 0; color: var(--st-semantic-text-secondary, #64748b); }
  :global(.up-selects) { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
  :global(.up-notif-desc) { margin: 0 0 0.5rem; font-size: 0.85rem; color: var(--st-semantic-text-secondary, #475569); }
  :global(.up-notif-row) { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0); flex-wrap: wrap; }
  :global(.up-notif-row:last-child) { border-bottom: none; }
  :global(.up-notif-label) { flex: 1; font-size: 0.875rem; color: var(--st-semantic-text-primary, #0f172a); min-width: 160px; }
  :global(.up-savebar) { display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem; flex-wrap: wrap; padding: 0.85rem 1rem; border: 1px solid var(--st-semantic-border-subtle, #e2e8f0); border-radius: 0.5rem; background: var(--st-semantic-surface-subtle, #f8fafc); }
  :global(.up-savebar-hint) { flex: 1; font-size: 0.85rem; font-weight: 600; color: var(--st-semantic-text-secondary, #475569); }
</style>
