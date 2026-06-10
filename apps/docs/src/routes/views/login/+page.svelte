<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { Badge, Link } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";
  import type { NodeSpec } from "$lib/framework/examples";

  const fr = $derived(locale.value === "fr");

  // ── NodeSpec ──────────────────────────────────────────────────────────────

  const demoNodes = $derived<NodeSpec[]>([
    {
      el: "div",
      props: { class: "lg-wrap" },
      children: [
        {
          comp: "Card",
          props: { class: "lg-card" },
          children: [
            // En-tête de la carte
            {
              el: "div",
              props: { class: "lg-head" },
              children: [
                { el: "h2", props: { class: "lg-title" }, children: [fr ? "Connexion" : "Sign in"] },
                { el: "p", props: { class: "lg-subtitle" }, children: [fr ? "Accédez à votre espace Sent Tech." : "Access your Sent Tech workspace."] }
              ]
            },
            // Alerte d'erreur (essai précédent)
            {
              comp: "Alert",
              props: {
                tone: "error",
                title: fr ? "Échec de connexion" : "Sign-in failed",
                message: fr ? "Identifiant ou mot de passe incorrect." : "Incorrect email or password."
              }
            },
            // Formulaire
            {
              comp: "Form",
              props: { status: "idle" },
              children: [
                {
                  comp: "Input",
                  props: {
                    label: fr ? "Adresse e-mail" : "Email address",
                    type: "email",
                    placeholder: "vous@exemple.com",
                    value: "fabien@sent-tech.ca"
                  }
                },
                {
                  comp: "PasswordInput",
                  props: {
                    label: fr ? "Mot de passe" : "Password",
                    placeholder: "••••••••",
                    showLabel: fr ? "Afficher" : "Show",
                    hideLabel: fr ? "Masquer" : "Hide"
                  }
                },
                {
                  el: "div",
                  props: { class: "lg-row" },
                  children: [
                    { comp: "Checkbox", props: { label: fr ? "Se souvenir de moi" : "Remember me" } },
                    { comp: "Link", props: { href: "#" }, children: [fr ? "Mot de passe oublié ?" : "Forgot password?"] }
                  ]
                },
                { comp: "Button", props: { variant: "primary", type: "submit", class: "lg-submit" }, children: [fr ? "Se connecter" : "Sign in"] }
              ]
            },
            // Pied : lien d'inscription
            {
              el: "p",
              props: { class: "lg-foot" },
              children: [
                fr ? "Pas encore de compte ? " : "No account yet? ",
                { comp: "Link", props: { href: "#" }, children: [fr ? "Créer un compte" : "Create one"] }
              ]
            }
          ]
        }
      ]
    }
  ]);

  // ── Composants DS utilisés ────────────────────────────────────────────────
  const DS_COMPONENTS = [
    { name: "Card", slug: "card" },
    { name: "Form", slug: "form" },
    { name: "Input", slug: "input" },
    { name: "PasswordInput", slug: "password-input" },
    { name: "Checkbox", slug: "checkbox" },
    { name: "Button", slug: "button" },
    { name: "Alert", slug: "alert" },
    { name: "Link", slug: "link" }
  ];
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{fr ? "Vue · Authentification" : "View · Authentication"}</p>
    <div class="docs-hero-title">
      <h1>{fr ? "Connexion / Auth" : "Login / Auth"}</h1>
      <Badge tone="success">{fr ? "Disponible" : "Available"}</Badge>
    </div>
    <p>
      {#if fr}
        Quick-win universel : <code>Card</code> centrée + <code>Form</code> avec
        <code>Input</code> e-mail + <code>PasswordInput</code> + <code>Checkbox</code>
        « se souvenir » + <code>Button</code> + <code>Alert</code> d'erreur + <code>Link</code>
        (mot de passe oublié, inscription). Un seul <code>NodeSpec</code> → rendu identique
        en Svelte, React et Vue.
      {:else}
        Universal quick-win: a centered <code>Card</code> + a <code>Form</code> with an email
        <code>Input</code> + <code>PasswordInput</code> + a “remember me” <code>Checkbox</code>
        + <code>Button</code> + an error <code>Alert</code> + <code>Link</code>s (forgot password,
        sign up). One <code>NodeSpec</code> → identical render in Svelte, React, and Vue.
      {/if}
    </p>
  </section>

  <section class="docs-section">
    <h2>{fr ? "Rendu tri-framework" : "Tri-framework render"}</h2>
    <p class="section-desc">
      {fr
        ? "Utilisez les onglets pour basculer entre Svelte, React et Vue. Le rendu et le code copié reflètent le framework sélectionné."
        : "Use the tabs to switch between Svelte, React, and Vue. The render and copied code reflect the selected framework."}
    </p>
    <TabbedExample
      nodes={demoNodes}
      title={fr ? "Connexion — carte centrée (données mock)" : "Login — centered card (mock data)"}
    />
  </section>

  <section class="docs-section">
    <h2>{fr ? "Composants DS utilisés" : "DS components used"}</h2>
    <ul class="lg-comp-list">
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

  .lg-comp-list {
    list-style: disc;
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.95rem;
  }

  /* ── Layout Login (global → propagé dans les îles React/Vue) ───────────── */
  :global(.lg-wrap) {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 1.5rem 0;
    background:
      radial-gradient(circle at 30% 0%, var(--st-semantic-surface-subtle, #f1f5f9), transparent 70%);
  }

  :global(.lg-card) {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  :global(.lg-head) {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  :global(.lg-title) {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.lg-subtitle) {
    font-size: 0.9rem;
    margin: 0;
    color: var(--st-semantic-text-secondary, #475569);
  }

  :global(.lg-row) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 0.85rem;
  }

  :global(.lg-submit) {
    width: 100%;
  }

  :global(.lg-foot) {
    font-size: 0.85rem;
    text-align: center;
    margin: 0;
    color: var(--st-semantic-text-secondary, #475569);
  }
</style>
