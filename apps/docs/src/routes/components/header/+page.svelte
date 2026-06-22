<script lang="ts">
  import { Badge, AppHeader, IdentityMenu, type IdentityUser } from "@sentropic/design-system-svelte";
  import { t } from "$lib/i18n";
  import { locale } from "$lib/locale.svelte";

  // Identité au format IdentityMenu (displayName) pour les démos AppHeader / IdentityMenu.
  const identityUser: IdentityUser = {
    displayName: "Alex Martin",
    email: "alex.martin@sentropic.app"
  };

  // Exemple de consommation AppHeader (marque par props + classes utilitaires publiées).
  const appHeaderUsageSnippet = `<AppHeader
  brandName="Sentropic"
  productName="Console"
  logoSrc="/SENT-logo-squared.svg"
  brandHref="/"
  nav={topNav}        <!-- <a class="st-appHeader__navLink" aria-current="page"> -->
  actions={controls}  <!-- <button class="st-appHeader__control"> ... -->
  {compact} menuOpen={open} onMenuToggle={toggle} drawer={mobileNav}
/>`;
</script>

{#snippet appHeaderNav()}
  <a class="st-appHeader__navLink" href="/components/header" aria-current="page">Charts</a>
  <a class="st-appHeader__navLink" href="/components/header">Dashboards</a>
  <a class="st-appHeader__navLink" href="/components/header">Grilles</a>
  <a class="st-appHeader__navLink" href="/components/header">Guides</a>
{/snippet}

{#snippet appHeaderActions()}
  <button type="button" class="st-appHeader__control" aria-label="Mode clair/sombre">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  </button>
  <button type="button" class="st-appHeader__control" aria-label="Langue">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
    FR
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  </button>
  <IdentityMenu
    user={identityUser}
    isAuthenticated={true}
    compact={true}
  />
{/snippet}

{#snippet anonymousActions()}
  <button type="button" class="st-appHeader__control" aria-label="Rechercher">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  </button>
  <button type="button" class="st-appHeader__control" aria-label="Notifications">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  </button>
  <button type="button" class="st-appHeader__control" aria-label="Se connecter" aria-haspopup="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  </button>
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
        Marque (logo + nom + produit), navigation primaire et zone actions (jour/nuit,
        langue, compte avec menu). Cliquez sur l'identité pour ouvrir le menu compte.
      </p>
      <div class="header-preview-full">
        <AppHeader
          brandMode="full"
          brandName="Sentropic"
          productName="Console"
          logoSrc="/SENT-logo-squared.svg"
          brandHref="/"
          nav={appHeaderNav}
          actions={appHeaderActions}
        />
      </div>
    </article>
  </section>
  <section class="docs-section">
    <h2>Les deux états de connexion</h2>
    <p>
      Dans <code>AppHeader</code>, la zone actions couvre les deux cas d'authentification : anonyme
      (icône carrée personne avec déclencheur de connexion) et connecté (<code>IdentityMenu</code>
      compact à initiales aux côtés des contrôles jour/nuit et langue).
    </p>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>1. Anonyme</h3>
        <p class="docs-demo-context">
          Aucune identité fournie. Les actions utilitaires incluent un bouton icône « personne »
          (carré) avec <code>aria-haspopup</code> pour déclencher la connexion — pas de CTA textuel.
        </p>
        <div class="header-preview-full">
          <AppHeader
            brandName="Sentropic"
            productName="Console"
            logoSrc="/SENT-logo-squared.svg"
            brandHref="/"
            nav={appHeaderNav}
            actions={anonymousActions}
          />
        </div>
      </article>

      <article class="docs-demo-block">
        <h3>2. Connecté (initiales)</h3>
        <p class="docs-demo-context">
          La zone actions porte le menu d'identité compact (<code>IdentityMenu</code> en
          <code>compact</code>) : avatar à initiales («&nbsp;AM&nbsp;» pour « Alex Martin »)
          aux côtés des contrôles jour/nuit et langue. Cliquez sur l'avatar pour ouvrir le menu compte.
        </p>
        <div class="header-preview-full">
          <AppHeader
            brandName="Sentropic"
            productName="Console"
            logoSrc="/SENT-logo-squared.svg"
            brandHref="/"
            nav={appHeaderNav}
            actions={appHeaderActions}
          />
        </div>
      </article>
    </div>
  </section>
  <section class="docs-section">
    <h2>IdentityMenu : trois modes</h2>
    <p>
      Le composant <code>IdentityMenu</code> se décline en trois rendus selon l'espace et
      l'état d'authentification : grand (nom + chevron), compact (carré gris à initiales)
      et déconnecté (bouton « Se connecter »).
    </p>
    <div class="docs-demo-stack">
      <article class="docs-demo-block">
        <h3>Mode grand (nom visible)</h3>
        <p class="docs-demo-context">
          Avatar cercle primary + nom + chevron. Rendu par défaut (non compact) : idéal
          quand l'espace le permet (tiroir, page compte).
        </p>
        <div class="identity-demo">
          <IdentityMenu user={identityUser} isAuthenticated={true} />
        </div>
      </article>

      <article class="docs-demo-block">
        <h3>Mode compact (carré gris)</h3>
        <p class="docs-demo-context">
          Trigger encadré gris (même gabarit que <code>st-appHeader__control</code>) avec
          avatar carré à initiales («&nbsp;AM&nbsp;»), sans nom ni chevron. Utilisé dans
          l'en-tête où l'espace est compté.
        </p>
        <div class="identity-demo">
          <IdentityMenu user={identityUser} isAuthenticated={true} compact={true} />
        </div>
      </article>

      <article class="docs-demo-block">
        <h3>Mode déconnecté</h3>
        <p class="docs-demo-context">
          Sans identité authentifiée, le composant rend un bouton « Se connecter ».
        </p>
        <div class="identity-demo">
          <IdentityMenu isAuthenticated={false} />
        </div>
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
    <h2>AppHeader : chrome de site réutilisable</h2>
    <p>
      <code>AppHeader</code> est l'en-tête « tenant » du socle (burger à droite en compact,
      tiroir intégré). Il porte désormais la <strong>marque canonique paramétrable</strong>
      (logo carré + nom + sous-titre produit) et publie deux classes utilitaires : sans qu'un
      consommateur ait à dupliquer le CSS de la doc : un site externe (ex. <code>dataviz.sent-tech.ca</code>)
      obtient le même rendu que ce site en passant uniquement ses libellés.
    </p>
    <article class="docs-demo-block">
      <h3>Mode A — produit seul (<code>productName</code> uniquement)</h3>
      <p class="docs-demo-context">
        Sans <code>brandName</code>, seul le nom produit est affiché dans la zone marque.
        Cas d'usage : application mono-produit où la marque parente n'est pas exposée dans le chrome.
      </p>
      <div class="header-preview-full">
        <AppHeader
          productName="Console"
          logoSrc="/SENT-logo-squared.svg"
          brandHref="/"
          nav={appHeaderNav}
          actions={appHeaderActions}
        />
      </div>
    </article>
    <article class="docs-demo-block">
      <h3>Mode B — marque + produit (<code>brandName</code> + <code>productName</code>)</h3>
      <p class="docs-demo-context">
        Avec <code>brandName</code> et <code>productName</code>, le bloc marque affiche le nom
        de la société en gras puis le produit en sous-titre. Les liens de nav portent
        <code>st-appHeader__navLink</code> (pill soulignée + état actif via
        <code>aria-current="page"</code>) ; les contrôles utilitaires portent
        <code>st-appHeader__control</code> (pill thème / langue / icône).
      </p>
      <div class="header-preview-full">
        <AppHeader
          brandName="Sentropic"
          productName="Console"
          logoSrc="/SENT-logo-squared.svg"
          brandHref="/"
          nav={appHeaderNav}
          actions={appHeaderActions}
        />
      </div>
    </article>
    <h3>API ajoutée (marque)</h3>
    <table class="docs-table">
      <thead>
        <tr><th>Prop</th><th>Type</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>brandName</code></td><td><code>string</code></td><td>Nom de marque (ex. « Sentropic »). Affiché en gras.</td></tr>
        <tr><td><code>productName</code></td><td><code>string</code></td><td>Sous-titre produit sous le nom (ex. « Design System », « dataviz »).</td></tr>
        <tr><td><code>logoSrc</code></td><td><code>string</code></td><td>Source de l'image du logo carré (32×32).</td></tr>
        <tr><td><code>logoAlt</code></td><td><code>string</code></td><td>Texte alternatif du logo (décoratif par défaut, <code>aria-hidden</code>).</td></tr>
        <tr><td><code>brandHref</code></td><td><code>string</code></td><td>Cible du lien de marque. Défaut : <code>/</code>.</td></tr>
        <tr><td><code>brandLabel</code></td><td><code>string</code></td><td><code>aria-label</code> du lien (sinon dérivé de <code>brandName</code> + <code>productName</code>).</td></tr>
      </tbody>
    </table>
    <p>
      Le snippet <code>logo</code> reste prioritaire si fourni : la marque par props ne s'active
      que lorsqu'aucun <code>logo</code> n'est passé et qu'au moins une de ces props est présente
      (rétro-compatible).
    </p>
    <h3>Consommation multi-framework (parité stricte)</h3>
    <p>
      L'API est identique en Svelte (props + snippets <code>nav</code>/<code>actions</code>/<code>drawer</code>),
      React (props + nœuds <code>nav</code>/<code>actions</code>) et Vue (props + slots). Côté
      <code>dataviz.sent-tech.ca</code> (Svelte), l'en-tête se réduit à :
    </p>
    <pre class="docs-codeblock"><code>{appHeaderUsageSnippet}</code></pre>
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
  /* Démos IdentityMenu autonomes (composant flottant, hors AppHeader). */
  .identity-demo {
    align-items: flex-start;
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border: 1px solid var(--docs-line);
    border-radius: 0.5rem;
    display: flex;
    padding: 1rem;
  }

  .docs-codeblock {
    background: var(--st-semantic-surface-subtle, #f8fafc);
    border: 1px solid var(--docs-line);
    border-radius: 0.5rem;
    color: var(--docs-ink);
    font-size: 0.82rem;
    line-height: 1.55;
    margin: 0.75rem 0 0;
    overflow-x: auto;
    padding: 0.9rem 1rem;
  }

  .docs-codeblock code {
    background: transparent;
    font-family: var(--st-font-mono, ui-monospace, monospace);
    white-space: pre;
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

  /* Prévisualisation pleine largeur des exemples Header/AppHeader */
  .header-preview-full {
    margin: 0 calc(-1.1rem - 1px);
    overflow: hidden;
    width: calc(100% + 2.2rem + 2px);
  }
</style>
