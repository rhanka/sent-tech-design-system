<script lang="ts">
  import { Badge, Header, type HeaderAccount } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";
  import FrameworkPreview from "$lib/framework/FrameworkPreview.svelte";

  // Identités de démonstration pour les deux variantes d'état connecté.
  const accountWithPhoto: HeaderAccount = {
    name: "Alex Martin",
    email: "alex.martin@sentropic.app",
    avatarUrl: "/SENT-logo-squared.svg"
  };

  const accountWithInitials: HeaderAccount = {
    name: "Camille Noé",
    email: "camille.noe@sentropic.app",
    avatarUrl: null
    // initials dérivées automatiquement de "Camille Noé" -> "CN"
  };

  // État ouvert/fermé du menu compte (contrôlé par la page, comme le ferait un parent réel).
  let photoMenuOpen = $state(false);
  let initialsMenuOpen = $state(false);
</script>

{#snippet brand()}
  <span class="header-brand">
    <img class="header-brand-mark" src="/SENT-logo-squared.svg" alt="" aria-hidden="true" />
    <span class="header-brand-copy">
      <span class="header-brand-name">Sentropic</span>
      <span class="header-brand-product">Console</span>
    </span>
  </span>
{/snippet}

{#snippet primaryNav()}
  <a href="/components/header" aria-current="page">Tableau de bord</a>
  <a href="/components/header">Projets</a>
  <a href="/components/header">Équipe</a>
  <a href="/components/header">Facturation</a>
{/snippet}

{#snippet utilityActions()}
  <button type="button" class="header-icon-btn" aria-label="Rechercher">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  </button>
  <button type="button" class="header-icon-btn" aria-label="Notifications">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  </button>
{/snippet}

{#snippet photoMenu()}
  <p class="header-menu-name">{accountWithPhoto.name}</p>
  <p class="header-menu-email">{accountWithPhoto.email}</p>
  <hr class="header-menu-sep" />
  <button type="button" class="header-menu-item">Voir le profil</button>
  <button type="button" class="header-menu-item">Paramètres du compte</button>
  <button type="button" class="header-menu-item">Déconnexion</button>
{/snippet}

{#snippet initialsMenu()}
  <p class="header-menu-name">{accountWithInitials.name}</p>
  <p class="header-menu-email">{accountWithInitials.email}</p>
  <hr class="header-menu-sep" />
  <button type="button" class="header-menu-item">Voir le profil</button>
  <button type="button" class="header-menu-item">Paramètres du compte</button>
  <button type="button" class="header-menu-item">Déconnexion</button>
{/snippet}

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">Composant · Structure</p>
    <div class="docs-hero-title">
      <h1>Header</h1>
      <Badge tone="neutral">Documenté</Badge>
    </div>
    <p>
      Le composant <code>Header</code> compose l'en-tête applicatif complet : marque
      (logo + titre), navigation primaire, actions utilitaires et zone compte. La zone
      compte gère nativement les trois états d'identité : anonyme, connecté avec photo,
      connecté avec initiales. Une identité connectée affiche
      <strong>toujours le nom</strong> (jamais un carré sans libellé).
    </p>
  </section>
  <FrameworkPreview example="header" title="Aperçu live" />

  <section class="docs-section">
    <h2>Header complet</h2>
    <p>
      En conditions réelles, le Header réunit la marque à gauche, la navigation au centre,
      puis les actions et le compte à droite. C'est l'assemblage utilisé par la barre du
      haut de cette documentation.
    </p>
    <article class="docs-demo-block">
      <h3>Application connectée</h3>
      <p class="docs-demo-context">
        Logo + titre, navigation primaire, actions (recherche, notifications) et compte
        avec menu. Cliquez sur l'identité pour ouvrir le menu compte.
      </p>
      <Header
        title="Console"
        label="En-tête de la console Sentropic"
        sticky={false}
        logo={brand}
        navigation={primaryNav}
        actions={utilityActions}
        account={accountWithPhoto}
        accountMenu={photoMenu}
        accountMenuOpen={photoMenuOpen}
        onAccountTriggerClick={() => (photoMenuOpen = !photoMenuOpen)}
      />
    </article>
  </section>
  <section class="docs-section">
    <h2>Les trois états de connexion</h2>
    <p>
      La zone compte du Header couvre intégralement le cycle d'authentification. Dans les
      trois cas le nom reste lisible et la cible cliquable annonce correctement l'identité.
    </p>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>1. Anonyme: appel à la connexion</h3>
        <p class="docs-demo-context">
          Aucune identité n'est fournie (<code>account</code> absent). Le Header affiche un
          CTA explicite « Se connecter » via <code>onSignIn</code> / <code>signInLabel</code>,
          sans menu compte ni carré vide.
        </p>
        <Header
          title="Console"
          sticky={false}
          logo={brand}
          navigation={primaryNav}
          actions={utilityActions}
          signInLabel="Se connecter"
          onSignIn={() => {}}
        />
      </article>

      <article class="docs-demo-block">
        <h3>2. Connecté avec photo</h3>
        <p class="docs-demo-context">
          <code>account.avatarUrl</code> est fourni : la photo est rendue dans un avatar
          carré (<code>object-fit: cover</code>), accompagnée du nom et de l'email. Le menu
          compte est disponible.
        </p>
        <Header
          title="Console"
          sticky={false}
          logo={brand}
          navigation={primaryNav}
          account={accountWithPhoto}
          accountMenu={photoMenu}
          accountMenuOpen={photoMenuOpen}
          onAccountTriggerClick={() => (photoMenuOpen = !photoMenuOpen)}
        />
      </article>

      <article class="docs-demo-block">
        <h3>3. Connecté avec initiales (fallback)</h3>
        <p class="docs-demo-context">
          Sans <code>avatarUrl</code>, le Header retombe sur les initiales (ici dérivées
          automatiquement de « Camille Noé » → <code>CN</code>). Le nom et l'email restent
          affichés : pas d'icône carrée anonyme.
        </p>
        <Header
          title="Console"
          sticky={false}
          logo={brand}
          navigation={primaryNav}
          account={accountWithInitials}
          accountMenu={initialsMenu}
          accountMenuOpen={initialsMenuOpen}
          onAccountTriggerClick={() => (initialsMenuOpen = !initialsMenuOpen)}
        />
      </article>
    </div>
  </section>
  <section class="docs-section">
    <h2>Règles de la zone compte</h2>
    <ul class="docs-list">
      <li>
        <strong>Le nom est obligatoire et toujours visible.</strong> Un état connecté ne se
        réduit jamais à un avatar muet ; <code>account.name</code> est requis.
      </li>
      <li>
        <strong>Avatar photo :</strong> quand <code>avatarUrl</code> est défini, l'image est
        rendue dans un conteneur carré <code>32×32</code> avec <code>object-fit: cover</code>.
      </li>
      <li>
        <strong>Fallback initiales :</strong> sans photo, les initiales s'affichent dans le
        même gabarit. Elles sont dérivées du nom si <code>initials</code> n'est pas fourni.
      </li>
      <li>
        <strong>Anonyme :</strong> sans <code>account</code>, fournir <code>onSignIn</code>
        (et éventuellement <code>signInLabel</code>) pour afficher un CTA de connexion.
      </li>
      <li>
        <strong>Menu compte :</strong> le panneau <code>accountMenu</code> n'est rendu que si
        <code>accountMenuOpen</code> est vrai ; l'état d'ouverture est contrôlé par le parent.
      </li>
    </ul>
  </section>
  <section class="docs-section">
    <h2>Accessibilité</h2>
    <ul class="docs-list">
      <li>
        L'élément racine est un <code>&lt;header&gt;</code> avec <code>aria-label</code>
        (prop <code>label</code>) ; la navigation est un <code>&lt;nav aria-label="Primary"&gt;</code>.
      </li>
      <li>
        Le déclencheur compte est un <code>&lt;button&gt;</code> avec
        <code>aria-haspopup="menu"</code>, <code>aria-expanded</code> reflétant l'état du menu,
        et <code>aria-label="Compte de {'{'}nom{'}'}"</code> pour annoncer l'identité.
      </li>
      <li>
        L'avatar (photo ou initiales) est <code>aria-hidden</code> : il est purement décoratif,
        l'identité étant déjà portée par le texte du nom.
      </li>
      <li>
        Le panneau ouvert expose <code>role="menu"</code> et un <code>aria-label</code> nommant
        l'utilisateur. La gestion de la fermeture au clic extérieur / touche Échap relève du parent.
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
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>title</code></td>
          <td><code>string</code></td>
          <td><em>optionnel</em></td>
          <td>Titre textuel affiché à côté du logo.</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td><code>string</code></td>
          <td><code>"Application header"</code></td>
          <td><code>aria-label</code> de l'élément <code>&lt;header&gt;</code>.</td>
        </tr>
        <tr>
          <td><code>sticky</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Colle l'en-tête en haut du viewport (<code>position: sticky</code>).</td>
        </tr>
        <tr>
          <td><code>logo</code></td>
          <td><code>Snippet</code></td>
          <td><em>optionnel</em></td>
          <td>Contenu de la marque (image, wordmark…).</td>
        </tr>
        <tr>
          <td><code>navigation</code></td>
          <td><code>Snippet</code></td>
          <td><em>optionnel</em></td>
          <td>Navigation primaire, rendue dans un <code>&lt;nav&gt;</code> centré.</td>
        </tr>
        <tr>
          <td><code>actions</code></td>
          <td><code>Snippet</code></td>
          <td><em>optionnel</em></td>
          <td>Actions utilitaires à droite (recherche, notifications, sélecteurs…).</td>
        </tr>
        <tr>
          <td><code>account</code></td>
          <td><code>HeaderAccount</code></td>
          <td><em>optionnel</em></td>
          <td>Identité connectée. Active la zone compte (avatar/initiales + nom + email).</td>
        </tr>
        <tr>
          <td><code>accountMenu</code></td>
          <td><code>Snippet</code></td>
          <td><em>optionnel</em></td>
          <td>Contenu du panneau de menu compte (rendu si ouvert).</td>
        </tr>
        <tr>
          <td><code>accountMenuOpen</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>État d'ouverture du menu compte (contrôlé par le parent).</td>
        </tr>
        <tr>
          <td><code>onAccountTriggerClick</code></td>
          <td><code>() =&gt; void</code></td>
          <td><em>optionnel</em></td>
          <td>Callback au clic sur le bouton compte (basculer le menu).</td>
        </tr>
        <tr>
          <td><code>signInLabel</code></td>
          <td><code>string</code></td>
          <td><code>"Se connecter"</code></td>
          <td>Libellé du CTA de connexion (état anonyme).</td>
        </tr>
        <tr>
          <td><code>onSignIn</code></td>
          <td><code>() =&gt; void</code></td>
          <td><em>optionnel</em></td>
          <td>Callback du CTA de connexion. Affiche le CTA quand <code>account</code> est absent.</td>
        </tr>
        <tr>
          <td><code>children</code></td>
          <td><code>Snippet</code></td>
          <td><em>optionnel</em></td>
          <td>Contenu additionnel rendu en fin d'en-tête.</td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td><code>string</code></td>
          <td><em>optionnel</em></td>
          <td>Classe(s) CSS supplémentaire(s).</td>
        </tr>
        <tr>
          <td>Autres attributs</td>
          <td><code>HTMLAttributes&lt;HTMLElement&gt;</code></td>
          <td>N/A</td>
          <td>Propagés sur l'élément <code>&lt;header&gt;</code>.</td>
        </tr>
      </tbody>
    </table>

    <h3>Type <code>HeaderAccount</code></h3>
    <table class="docs-table">
      <thead>
        <tr>
          <th>Champ</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>name</code></td>
          <td><code>string</code></td>
          <td>Nom affiché. Requis : pas d'identité sans nom.</td>
        </tr>
        <tr>
          <td><code>email</code></td>
          <td><code>string?</code></td>
          <td>Email affiché sous le nom et dans le menu.</td>
        </tr>
        <tr>
          <td><code>avatarUrl</code></td>
          <td><code>string | null</code></td>
          <td>URL de la photo. Si absente/<code>null</code>, on rend les initiales.</td>
        </tr>
        <tr>
          <td><code>initials</code></td>
          <td><code>string?</code></td>
          <td>Initiales explicites. Sinon dérivées du <code>name</code>.</td>
        </tr>
      </tbody>
    </table>
  </section>
  <section class="docs-section">
    <h2>{t(locale.value, "tokensTitle")}</h2>
    <ul class="docs-token-list">
      <li><code>--st-component-control-hoverBorder</code></li>
      <li><code>--st-component-control-hoverBackground</code></li>
    </ul>
  </section>

</div>

<style>
  .header-brand {
    align-items: center;
    display: inline-flex;
    gap: 0.5rem;
  }

  .header-brand-mark {
    height: 1.5rem;
    width: 1.5rem;
  }

  .header-brand-copy {
    display: grid;
    gap: 0.05rem;
    line-height: 1.05;
  }

  .header-brand-name {
    font-size: 0.95rem;
    font-weight: 720;
  }

  .header-brand-product {
    color: var(--docs-muted);
    font-size: 0.72rem;
    font-weight: 600;
  }

  :global(.docs-page .st-header__navigation a),
  :global(.docs-page .st-header__navigation a:visited) {
    border-bottom: 2px solid transparent;
    color: var(--docs-muted);
    font-size: 0.9rem;
    padding: 0.35rem 0.6rem;
    text-decoration: none;
  }

  :global(.docs-page .st-header__navigation a:hover) {
    color: var(--docs-ink);
  }

  :global(.docs-page .st-header__navigation a[aria-current="page"]) {
    border-bottom-color: var(--docs-accent);
    color: var(--docs-ink);
    font-weight: 650;
  }

  .header-icon-btn {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    color: var(--docs-muted);
    cursor: pointer;
    display: inline-flex;
    height: 2.25rem;
    justify-content: center;
    width: 2.25rem;
  }

  .header-icon-btn:hover,
  .header-icon-btn:focus-visible {
    background: var(--st-semantic-surface-subtle, #f1f5f9);
    color: var(--docs-ink);
    outline: none;
  }

  .header-menu-name {
    color: var(--docs-ink);
    font-size: 0.88rem;
    font-weight: 650;
    margin: 0;
  }

  .header-menu-email {
    color: var(--docs-muted);
    font-size: 0.8rem;
    margin: 0;
  }

  .header-menu-sep {
    border: 0;
    border-top: 1px solid var(--docs-line);
    margin: 0.25rem 0;
  }

  .header-menu-item {
    background: transparent;
    border: 0;
    border-radius: 0.375rem;
    color: var(--docs-ink);
    cursor: pointer;
    font: inherit;
    font-size: 0.84rem;
    padding: 0.4rem 0.5rem;
    text-align: left;
  }

  .header-menu-item:hover,
  .header-menu-item:focus-visible {
    background: var(--st-semantic-surface-subtle, #f1f5f9);
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
