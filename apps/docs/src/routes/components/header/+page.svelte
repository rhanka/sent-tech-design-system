<script lang="ts">
  import { Badge, Button, Header, Popover } from "@sentropic/design-system-svelte";
  import { ChevronDown } from "@lucide/svelte";

  type DemoSession = {
    name: string;
    email: string;
    initials: string;
    avatarUrl: string | null;
  };

  const sessionWithPhoto: DemoSession = {
    name: "Alex Martin",
    email: "alex.martin@sentropic.app",
    initials: "AM",
    avatarUrl: "/SENT-logo-squared.svg"
  };

  const sessionWithInitials: DemoSession = {
    name: "Camille Noe",
    email: "camille.noe@sentropic.app",
    initials: "CN",
    avatarUrl: null
  };

  let isPhotoPopoverOpen = $state(false);
  let isInitialsPopoverOpen = $state(false);
</script>

{#snippet headerLogo()}
  <span class="docs-header-brand">
    <img
      class="docs-header-brand-mark"
      src="/SENT-logo-squared.svg"
      alt=""
      aria-hidden="true"
    />
    <span>Sentropic Console</span>
  </span>
{/snippet}

{#snippet headerNavigation()}
  <a href="/#components">Composants</a>
  <a href="/#foundations">Fondations</a>
  <a href="/#contracts">Contrats</a>
{/snippet}

{#snippet headerActionsAnonymous()}
  <Button variant="ghost" size="sm">Se connecter</Button>
{/snippet}

{#snippet headerActionsWithPhoto()}
  <Popover
    open={isPhotoPopoverOpen}
    label="Menu utilisateur"
    placement="bottom"
  >
    {#snippet trigger()}
      <button
        type="button"
        class="docs-header-account-trigger"
        aria-label={`Ouvrir le menu utilisateur ${sessionWithPhoto.name}`}
        aria-expanded={isPhotoPopoverOpen}
        onclick={() => (isPhotoPopoverOpen = !isPhotoPopoverOpen)}
      >
        <span class="docs-header-avatar docs-header-avatar--square" aria-hidden="true">
          <img
            class="docs-header-avatar-image"
            src={sessionWithPhoto.avatarUrl}
            alt={`Photo de profil de ${sessionWithPhoto.name}`}
          />
        </span>
        <span class="docs-header-account-meta">
          <span class="docs-header-account-name">{sessionWithPhoto.name}</span>
          <span class="docs-header-account-email">{sessionWithPhoto.email}</span>
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
    {/snippet}

    <div class="docs-header-popover">
      <p class="docs-header-popover-title">{sessionWithPhoto.name}</p>
      <p class="docs-header-popover-email">{sessionWithPhoto.email}</p>
      <button type="button" class="docs-header-popover-action">
        Voir le profil
      </button>
      <button type="button" class="docs-header-popover-action">
        Déconnexion
      </button>
    </div>
  </Popover>
{/snippet}

{#snippet headerActionsWithInitials()}
  <Popover
    open={isInitialsPopoverOpen}
    label="Menu utilisateur"
    placement="bottom"
  >
    {#snippet trigger()}
      <button
        type="button"
        class="docs-header-account-trigger"
        aria-label={`Ouvrir le menu utilisateur ${sessionWithInitials.name}`}
        aria-expanded={isInitialsPopoverOpen}
        onclick={() => (isInitialsPopoverOpen = !isInitialsPopoverOpen)}
      >
        <span
          class="docs-header-avatar docs-header-avatar--square docs-header-avatar--initials"
          aria-hidden="true"
        >
          {sessionWithInitials.initials}
        </span>
        <span class="docs-header-account-meta">
          <span class="docs-header-account-name">{sessionWithInitials.name}</span>
          <span class="docs-header-account-email">{sessionWithInitials.email}</span>
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
    {/snippet}

    <div class="docs-header-popover">
      <p class="docs-header-popover-title">{sessionWithInitials.name}</p>
      <p class="docs-header-popover-email">{sessionWithInitials.email}</p>
      <button type="button" class="docs-header-popover-action">
        Voir le profil
      </button>
      <button type="button" class="docs-header-popover-action">
        Déconnexion
      </button>
    </div>
  </Popover>
{/snippet}

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Structure</p>
    <h1>
      Header
      <Badge tone="neutral">Documenté</Badge>
    </h1>
    <p>
      Le composant <code>Header</code> gère uniquement la structure de l’en-tête
      (logo, navigation, zone d’actions). La logique d’authentification doit être
      fournie par le parent via le slot <code>actions</code>.
    </p>
  </section>

  <section class="docs-section">
    <h2>États à documenter</h2>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>Sans auth réelle</h3>
        <p class="docs-demo-context">
          Aucun objet session n’est injecté. La zone action affiche un CTA neutre,
          sans popover d’utilisateur.
        </p>
        <Header
          title="Sentropic Console"
          sticky={false}
          logo={headerLogo}
          navigation={headerNavigation}
          actions={headerActionsAnonymous}
        />
      </article>

      <article class="docs-demo-block">
        <h3>Session réelle avec photo</h3>
        <p class="docs-demo-context">
          L’avatar est un conteneur carré, avec image en <code>object-fit: cover</code>.
          La popover n’existe que parce que les données de session sont réelles.
        </p>
        <Header
          title="Sentropic Console"
          sticky={false}
          logo={headerLogo}
          navigation={headerNavigation}
          actions={headerActionsWithPhoto}
        />
      </article>

      <article class="docs-demo-block">
        <h3>Session réelle avec fallback initiales</h3>
        <p class="docs-demo-context">
          En l’absence d’URL photo, on affiche des initiales dans le même format
          carrée. La popover reste disponible car la session existe.
        </p>
        <Header
          title="Sentropic Console"
          sticky={false}
          logo={headerLogo}
          navigation={headerNavigation}
          actions={headerActionsWithInitials}
        />
      </article>
    </div>
  </section>

  <section class="docs-section">
    <h2>Règles implémentées</h2>
    <ul class="docs-list">
      <li>
        <strong>Sans session:</strong> aucune donnée utilisateur réelle, donc pas de popover.
      </li>
      <li>
        <strong>Session réelle + photo:</strong> rendre <code>avatarUrl</code> dans un
        conteneur carré <code>48x48</code> avec <code>object-fit: cover</code> et
        <code>object-position: center</code>.
      </li>
      <li>
        <strong>Session réelle + pas de photo:</strong> utiliser les initiales dans le
        même avatar carré.
      </li>
      <li>
        <strong>Popover:</strong> conditionner le rendu aux données réelles (ne pas
        afficher de popover simulation si <code>session == null</code>).
      </li>
    </ul>
  </section>

  <section class="docs-section">
    <h2>API du composant</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Par défaut</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>title</code></td>
          <td><code>string</code></td>
          <td><em>optionnel</em></td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><code>"Application header"</code></td>
        </tr>
        <tr>
          <td><code>sticky</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
        </tr>
        <tr>
          <td><code>logo</code></td>
          <td><code>Snippet</code></td>
          <td><em>optionnel</em></td>
        </tr>
        <tr>
          <td><code>navigation</code></td>
          <td><code>Snippet</code></td>
          <td><em>optionnel</em></td>
        </tr>
        <tr>
          <td><code>actions</code></td>
          <td><code>Snippet</code></td>
          <td><em>optionnel</em></td>
        </tr>
        <tr>
          <td><code>children</code></td>
          <td><code>Snippet</code></td>
          <td><em>optionnel</em></td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td><em>optionnel</em></td>
        </tr>
        <tr>
          <td>Autres attributs</td>
          <td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td>
          <td>propagés sur <code>&lt;header&gt;</code></td>
        </tr>
      </tbody>
    </table>
  </section>
</div>

<style>
  .docs-header-brand {
    align-items: center;
    display: inline-flex;
    gap: 0.5rem;
    font-weight: 650;
  }

  .docs-header-brand-mark {
    height: 1rem;
    width: 1rem;
  }

  :global(.docs-page .st-header__navigation a),
  :global(.docs-page .st-header__navigation a:visited) {
    color: var(--st-semantic-text-primary);
    font-size: 0.9rem;
    text-decoration: none;
  }

  .docs-header-account-trigger {
    align-items: center;
    background: transparent;
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: 0.4rem;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    gap: 0.625rem;
    max-width: 100%;
    min-height: 2.125rem;
    padding: 0.25rem 0.5rem;
  }

  .docs-header-account-trigger:hover,
  .docs-header-account-trigger:focus-visible {
    border-color: var(--docs-accent);
    outline: none;
  }

  .docs-header-account-meta {
    display: grid;
    gap: 0.1rem;
    text-align: left;
    min-width: 0;
  }

  .docs-header-account-name {
    color: var(--docs-ink);
    font-size: 0.82rem;
    font-weight: 600;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .docs-header-account-email {
    color: var(--docs-muted);
    font-size: 0.72rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .docs-header-avatar {
    aspect-ratio: 1;
    border-radius: 0;
    flex: 0 0 2rem;
    height: 2rem;
    width: 2rem;
  }

  .docs-header-avatar--square {
    border-radius: 0;
    overflow: hidden;
  }

  .docs-header-avatar--initials {
    align-items: center;
    background: var(--st-semantic-surface-subtle);
    color: var(--st-semantic-text-primary);
    display: inline-flex;
    font-size: 0.75rem;
    font-weight: 700;
    justify-content: center;
  }

  .docs-header-avatar-image {
    background: var(--st-semantic-surface-subtle);
    height: 100%;
    object-fit: cover;
    object-position: center;
    width: 100%;
  }

  .docs-header-popover {
    display: grid;
    gap: 0.55rem;
  }

  .docs-header-popover-title {
    color: var(--docs-ink);
    font-size: 0.88rem;
    font-weight: 650;
    margin: 0;
  }

  .docs-header-popover-email {
    color: var(--docs-muted);
    font-size: 0.8rem;
    margin: 0;
  }

  .docs-header-popover-action {
    background: transparent;
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: 0.4rem;
    color: var(--docs-ink);
    cursor: pointer;
    font: inherit;
    font-size: 0.8rem;
    padding: 0.35rem 0.55rem;
    text-align: left;
  }

  .docs-header-popover-action:hover,
  .docs-header-popover-action:focus-visible {
    background: var(--st-semantic-surface-subtle);
    outline: none;
  }

  .docs-list {
    display: grid;
    gap: 0.75rem;
    list-style: none;
    margin: 0;
    padding-left: 0;
  }

  .docs-list li {
    color: var(--docs-muted);
    line-height: 1.6;
  }
</style>
