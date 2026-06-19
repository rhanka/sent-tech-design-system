<script lang="ts">
  // Écran Profile — Avatar + Card contenant un Form d'édition de profil.
  // Page complète auto-contenue construite à partir des composants DS.
  import {
    Avatar,
    Card,
    Form,
    Input,
    Select,
    Button
  } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  let firstName = $state("Marie");
  let lastName = $state("Dupont");
  let email = $state("marie.dupont@exemple.com");
  let role = $state("admin");
  let submitting = $state(false);

  const fullName = $derived(`${firstName} ${lastName}`.trim());

  async function handleSubmit() {
    submitting = true;
    await new Promise((r) => setTimeout(r, 600));
    submitting = false;
  }
</script>

<div class="prof-screen">
  <div class="prof-shell">
    <header class="prof-head">
      <Avatar name={fullName} size="xl" tone="category2" />
      <div class="prof-id">
        <h1 class="prof-name">{fullName}</h1>
        <p class="prof-email">{email}</p>
      </div>
    </header>

    <Card class="prof-card">
      <h2 class="prof-card-title">{fr ? "Modifier le profil" : "Edit profile"}</h2>

      <Form onsubmit={handleSubmit} {submitting}>
        <div class="prof-fields">
          <div class="prof-row">
            <Input
              label={fr ? "Prénom" : "First name"}
              name="firstName"
              autocomplete="given-name"
              bind:value={firstName}
            />
            <Input
              label={fr ? "Nom" : "Last name"}
              name="lastName"
              autocomplete="family-name"
              bind:value={lastName}
            />
          </div>

          <Input
            type="email"
            label={fr ? "Adresse courriel" : "Email address"}
            name="email"
            autocomplete="email"
            bind:value={email}
          />

          <Select label={fr ? "Rôle" : "Role"} bind:value={role}>
            <option value="admin">{fr ? "Administrateur" : "Administrator"}</option>
            <option value="editor">{fr ? "Éditeur" : "Editor"}</option>
            <option value="viewer">{fr ? "Lecteur" : "Viewer"}</option>
          </Select>

          <div class="prof-actions">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting
                ? fr
                  ? "Enregistrement…"
                  : "Saving…"
                : fr
                  ? "Enregistrer"
                  : "Save changes"}
            </Button>
            <Button type="reset" variant="ghost">
              {fr ? "Annuler" : "Cancel"}
            </Button>
          </div>
        </div>
      </Form>
    </Card>
  </div>
</div>

<style>
  .prof-screen {
    display: flex;
    justify-content: center;
    min-height: 100%;
    padding: 2.5rem 1rem;
    background: var(--st-semantic-surface-subtle, #f8fafc);
  }

  .prof-shell {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 560px;
  }

  .prof-head {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .prof-id {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .prof-name {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  .prof-email {
    margin: 0;
    font-size: 0.9rem;
    color: var(--st-semantic-text-secondary, #475569);
  }

  :global(.prof-card) {
    padding: 1.75rem;
  }

  .prof-card-title {
    margin: 0 0 1.25rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  .prof-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .prof-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .prof-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.25rem;
  }

  @media (max-width: 520px) {
    .prof-row {
      grid-template-columns: 1fr;
    }
  }
</style>
