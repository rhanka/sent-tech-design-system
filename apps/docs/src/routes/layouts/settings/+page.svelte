<script lang="ts">
  // Écran Settings — AppChrome + Header + SideNav, contenu = FormGroup avec
  // Select, Toggle et Slider. Page complète auto-contenue à partir des composants DS.
  import {
    AppChrome,
    Header,
    SideNav,
    FormGroup,
    Select,
    Toggle,
    Slider,
    Button
  } from "@sentropic/design-system-svelte";
  import type { SideNavItem } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  const navItems = $derived<SideNavItem[]>([
    { label: fr ? "Profil" : "Profile", href: "#" },
    { label: fr ? "Préférences" : "Preferences", href: "#", active: true },
    { label: fr ? "Notifications" : "Notifications", href: "#" },
    { label: fr ? "Sécurité" : "Security", href: "#" },
    { label: fr ? "Facturation" : "Billing", href: "#" }
  ]);

  let theme = $state("auto");
  // Initialisation avec la locale courante (locale.value est une string stable à l'init)
  let language = $state(locale.value);
  let emailNotifs = $state(true);
  let compactMode = $state(false);
  let density = $state(60);
</script>

<div class="set-shell">
  <AppChrome
    brandName="Sent Tech"
    productName={fr ? "Paramètres" : "Settings"}
    nav={navItems.map((i) => ({ label: i.label, href: i.href, active: i.active }))}
  />
  <Header title={fr ? "Paramètres" : "Settings"} sticky={false} />

    <div class="set-body">
      <aside class="set-side">
        <SideNav items={navItems} label={fr ? "Sections" : "Sections"} />
      </aside>

      <main class="set-main">
        <h2 class="set-title">{fr ? "Préférences" : "Preferences"}</h2>

        <form class="set-form" onsubmit={(e) => e.preventDefault()}>
          <FormGroup legend={fr ? "Apparence" : "Appearance"}>
            <div class="set-fields">
              <Select
                label={fr ? "Thème" : "Theme"}
                bind:value={theme}
              >
                <option value="light">{fr ? "Clair" : "Light"}</option>
                <option value="dark">{fr ? "Sombre" : "Dark"}</option>
                <option value="auto">{fr ? "Automatique" : "Automatic"}</option>
              </Select>

              <Select
                label={fr ? "Langue" : "Language"}
                bind:value={language}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </Select>

              <Toggle
                label={fr ? "Mode compact" : "Compact mode"}
                helperText={fr
                  ? "Réduit l'espacement pour afficher plus de contenu."
                  : "Reduces spacing to show more content."}
                bind:checked={compactMode}
              />

              <Slider
                label={fr ? "Densité d'affichage" : "Display density"}
                min={0}
                max={100}
                step={10}
                showValue
                valueFormatter={(v) => `${v}%`}
                bind:value={density}
              />
            </div>
          </FormGroup>

          <FormGroup legend={fr ? "Notifications" : "Notifications"}>
            <div class="set-fields">
              <Toggle
                label={fr ? "Notifications par courriel" : "Email notifications"}
                helperText={fr
                  ? "Recevez un résumé quotidien par courriel."
                  : "Receive a daily summary by email."}
                bind:checked={emailNotifs}
              />
            </div>
          </FormGroup>

          <div class="set-actions">
            <Button type="submit" variant="primary">
              {fr ? "Enregistrer" : "Save changes"}
            </Button>
            <Button type="reset" variant="ghost">
              {fr ? "Annuler" : "Cancel"}
            </Button>
          </div>
        </form>
      </main>
    </div>
</div>

<style>
  .set-shell {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 480px;
  }

  .set-body {
    display: grid;
    grid-template-columns: 220px 1fr;
    flex: 1;
    min-height: 0;
  }

  .set-side {
    border-right: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    background: var(--st-semantic-surface-subtle, #f8fafc);
    padding: 1rem 0.75rem;
  }

  .set-main {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem;
    min-width: 0;
    max-width: 640px;
  }

  .set-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  .set-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .set-fields {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .set-actions {
    display: flex;
    gap: 0.75rem;
  }

  @media (max-width: 860px) {
    .set-body {
      grid-template-columns: 1fr;
    }
    .set-side {
      border-right: none;
      border-bottom: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    }
  }
</style>
