<script lang="ts">
  // Écran Login — page complète auto-contenue construite à partir des composants DS.
  // Logo centré + Card contenant un Form (email + PasswordInput + Button) et un
  // lien « Mot de passe oublié ».
  import {
    Card,
    Form,
    Input,
    PasswordInput,
    Button,
    Link
  } from "@sentropic/design-system-svelte";
  import { locale } from "$lib/locale.svelte";

  const fr = $derived(locale.value === "fr");

  let email = $state("");
  let password = $state("");
  let submitting = $state(false);

  async function handleSubmit() {
    submitting = true;
    // Démo : on simule un appel réseau puis on relâche l'état.
    await new Promise((r) => setTimeout(r, 600));
    submitting = false;
  }
</script>

<div class="login-screen">
  <div class="login-shell">
    <div class="login-brand">
      <span class="login-logo" aria-hidden="true">S</span>
      <span class="login-wordmark">Sent&nbsp;Tech</span>
    </div>

    <Card class="login-card">
      <header class="login-head">
        <h1 class="login-title">{fr ? "Connexion" : "Sign in"}</h1>
        <p class="login-sub">
          {fr
            ? "Accédez à votre espace de travail."
            : "Access your workspace."}
        </p>
      </header>

      <Form onsubmit={handleSubmit} {submitting}>
        <div class="login-fields">
          <Input
            type="email"
            name="email"
            label={fr ? "Adresse courriel" : "Email address"}
            placeholder="nom@exemple.com"
            autocomplete="email"
            required
            bind:value={email}
          />
          <PasswordInput
            name="password"
            label={fr ? "Mot de passe" : "Password"}
            autocomplete="current-password"
            required
            bind:value={password}
          />
          <div class="login-forgot">
            <Link href="#">{fr ? "Mot de passe oublié&nbsp;?" : "Forgot password?"}</Link>
          </div>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting
              ? fr
                ? "Connexion…"
                : "Signing in…"
              : fr
                ? "Se connecter"
                : "Sign in"}
          </Button>
        </div>
      </Form>
    </Card>

    <p class="login-foot">
      {fr ? "Pas encore de compte&nbsp;?" : "No account yet?"}
      <Link href="#">{fr ? "Créer un compte" : "Create one"}</Link>
    </p>
  </div>
</div>

<style>
  .login-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: 3rem 1rem;
    background: var(--st-semantic-surface-subtle, #f8fafc);
  }

  .login-shell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
    max-width: 380px;
  }

  .login-brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .login-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.6rem;
    background: var(--st-semantic-color-brand, #6366f1);
    color: #fff;
    font-weight: 800;
    font-size: 1.25rem;
  }

  .login-wordmark {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  :global(.login-card) {
    width: 100%;
    padding: 1.75rem;
  }

  .login-head {
    margin-bottom: 1.25rem;
    text-align: center;
  }

  .login-title {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--st-semantic-text-primary, #0f172a);
  }

  .login-sub {
    margin: 0.35rem 0 0;
    font-size: 0.9rem;
    color: var(--st-semantic-text-secondary, #475569);
  }

  .login-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .login-forgot {
    display: flex;
    justify-content: flex-end;
    font-size: 0.85rem;
    margin-top: -0.25rem;
  }

  .login-foot {
    margin: 0;
    font-size: 0.875rem;
    color: var(--st-semantic-text-secondary, #475569);
  }
</style>
