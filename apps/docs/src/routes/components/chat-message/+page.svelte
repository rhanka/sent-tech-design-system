<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import { Badge, ChatMessage, IconButton } from "@sentropic/design-system-svelte";
  import { UserRound, Sparkles, Copy, ThumbsUp, ThumbsDown, Info } from "@lucide/svelte";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      kicker: "Composant · Chat",
      status: "Stable",
      intro:
        "Bulle visuelle de message avec rôle, statut, footer, actions et avatar. Le contenu reste piloté par le consumer via des slots.",
      baseTitle: "Exemples de base",
      playgroundTitle: "Bac à sable de la Bulle de Message",
      playgroundDesc: "Ajustez dynamiquement toutes les propriétés et les slots de la bulle ChatMessage pour tester son rendu, ses contrastes, son comportement d'accessibilité et ses variations de rôles.",
      configTitle: "Configuration de la Bulle",
      roleLabel: "Rôle du message (role)",
      statusLabel: "Statut du message (status)",
      messageTextLabel: "Contenu de la bulle (slot principal)",
      showAvatarLabel: "Afficher l'avatar (slot avatar)",
      showFooterLabel: "Afficher le pied de page (slot footer)",
      showActionsLabel: "Afficher les actions (slot actions)",
      timestampLabel: "Horodatage (timestamp prop)",
      statusTitle: "Statuts supportés",
      propTitle: "Propriétés",
      slotTitle: "Slots supportés",
      tokenTitle: "Tokens de style",
      userLabel: "Utilisateur",
      assistantLabel: "Assistant",
      systemLabel: "Système",
      toolLabel: "Message d'outil",
      apiProp1: "Propriété",
      apiProp2: "Type",
      apiProp3: "Description",
      footerText: "Terminé à 10:18 • Modèle: Sentropic-V2",
      copiedText: "Copié dans le presse-papier !",
      exampleUserMsg: "Bonjour ! Est-ce que tu peux m'expliquer comment configurer le tenant du design system ?",
      exampleAssistantMsg: "Bien sûr ! Le thème tenant se configure en important `ThemeProvider` et en lui passant le thème souhaité, par exemple `sentTechTheme` ou `entropicTheme`.",
      exampleSystemMsg: "Optimisation de la mémoire conversationnelle active. Prêt.",
      exampleToolMsg: "Recherche effectuée sur `packages/components-svelte` : 14 fichiers trouvés.",
      token1: "--st-component-chatMessage-gap",
      token2: "--st-component-chatMessage-avatarSize",
      token3: "--st-component-chatMessage-assistantBackground",
      token4: "--st-component-chatMessage-maxWidth"
    },
    en: {
      kicker: "Component · Chat",
      status: "Stable",
      intro:
        "Visual message bubble with role, status, footer, actions, and avatar. Content is fully driven by the consumer through the main slot.",
      baseTitle: "Base Examples",
      playgroundTitle: "Message Bubble Playground",
      playgroundDesc: "Dynamically adjust every property and slot of the ChatMessage bubble to evaluate its rendering, contrasts, accessibility behavior, and role variations.",
      configTitle: "Bubble Configuration",
      roleLabel: "Message role (role)",
      statusLabel: "Message status (status)",
      messageTextLabel: "Bubble content (main slot)",
      showAvatarLabel: "Show avatar (avatar slot)",
      showFooterLabel: "Show footer (footer slot)",
      showActionsLabel: "Show actions (actions slot)",
      timestampLabel: "Timestamp (timestamp prop)",
      statusTitle: "Supported Statuses",
      propTitle: "Properties",
      slotTitle: "Supported Slots",
      tokenTitle: "Styling Tokens",
      userLabel: "User",
      assistantLabel: "Assistant",
      systemLabel: "System",
      toolLabel: "Tool Message",
      apiProp1: "Property",
      apiProp2: "Type",
      apiProp3: "Description",
      footerText: "Completed at 10:18 • Model: Sentropic-V2",
      copiedText: "Copied to clipboard!",
      exampleUserMsg: "Hello! Can you explain how to configure the design system's tenant theme?",
      exampleAssistantMsg: "Certainly! The tenant theme is configured by importing the `ThemeProvider` and passing the desired theme object, such as `sentTechTheme` or `entropicTheme`.",
      exampleSystemMsg: "Conversational memory optimization active. Ready.",
      exampleToolMsg: "Search executed on `packages/components-svelte`: 14 files found.",
      token1: "--st-component-chatMessage-gap",
      token2: "--st-component-chatMessage-avatarSize",
      token3: "--st-component-chatMessage-assistantBackground",
      token4: "--st-component-chatMessage-maxWidth"
    }
  } as const;

  const text = () => copy[locale.value];

  // Playground state
  let role = $state<"user" | "assistant" | "system" | "tool">("assistant");
  let status = $state<"pending" | "processing" | "completed" | "failed">("completed");
  let messageText = $state("");
  let showAvatar = $state(true);
  let showFooter = $state(true);
  let showActions = $state(true);
  let timestamp = $state("10:18");

  // Keep messageText synchronized when role changes to match typical messages
  $effect(() => {
    if (role === "user") {
      messageText = text().exampleUserMsg;
    } else if (role === "assistant") {
      messageText = text().exampleAssistantMsg;
    } else if (role === "system") {
      messageText = text().exampleSystemMsg;
    } else if (role === "tool") {
      messageText = text().exampleToolMsg;
    }
  });

  // Action feed
  let actionNotification = $state("");
  function triggerAction(name: string) {
    actionNotification = `${locale.value === 'fr' ? 'Action déclenchée' : 'Action triggered'}: ${name}`;
    setTimeout(() => {
      actionNotification = "";
    }, 1500);
  }

  // Dynamic code output
  const generatedCode = $derived.by(() => {
    let slotsStr = "";
    if (showAvatar) {
      slotsStr += `\n  {#snippet avatar()}\n    <div class="avatar">${role === 'user' ? 'U' : 'AI'}</div>\n  {/snippet}`;
    }
    if (showFooter) {
      slotsStr += `\n  {#snippet footer()}\n    <span>\${timestamp} • Completed</span>\n  {/snippet}`;
    }
    if (showActions) {
      slotsStr += `\n  {#snippet actions()}\n    <button onclick={copy}>Copy</button>\n  {/snippet}`;
    }

    return `<script lang="ts">
  import { ChatMessage } from "@sentropic/design-system-svelte";
<\/script>

<ChatMessage
  role="${role}"
  status="${status}"
  timestamp="${timestamp}"${showAvatar ? `\n  avatar={avatar}` : ""}${showFooter ? `\n  footer={footer}` : ""}${showActions ? `\n  actions={actions}` : ""}
>
  <p>${messageText}</p>
</ChatMessage>`;
  });
</script>

{#snippet userAvatar()}
  <span class="docs-chatMessageAvatar docs-chatMessageAvatar--user" aria-hidden="true">
    <UserRound size={12} />
  </span>
{/snippet}

{#snippet assistantAvatar()}
  <span class="docs-chatMessageAvatar docs-chatMessageAvatar--assistant" aria-hidden="true">
    <Sparkles size={11} />
  </span>
{/snippet}

{#snippet customFooter()}
  <span class="custom-footer-content">
    <Info size={12} />
    <span>{text().footerText}</span>
  </span>
{/snippet}

{#snippet customActions()}
  <div class="message-actions-row">
    <IconButton aria-label="Copy" onclick={() => triggerAction("Copy")}>
      <Copy size={13} />
    </IconButton>
    <IconButton aria-label="Like" onclick={() => triggerAction("ThumbsUp")}>
      <ThumbsUp size={13} />
    </IconButton>
    <IconButton aria-label="Dislike" onclick={() => triggerAction("ThumbsDown")}>
      <ThumbsDown size={13} />
    </IconButton>
  </div>
{/snippet}

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>ChatMessage</h1>
      <Badge tone="success">{text().status}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <TabbedExample nodes={getExample("chatmessage")?.nodes ?? []} />


  <!-- Interactive Playground Section -->
  <section class="docs-section">
    <h2>{text().playgroundTitle}</h2>
    <p class="section-desc">{text().playgroundDesc}</p>

    <div class="playground-layout">
      <!-- Live Render Area -->
      <div class="playground-render-box flex-column justify-center relative">
        {#if actionNotification}
          <div class="toast-overlay">{actionNotification}</div>
        {/if}
        
        <div class="interactive-message-container">
          <ChatMessage
            {role}
            {status}
            {timestamp}
            avatar={showAvatar ? (role === 'user' ? userAvatar : assistantAvatar) : undefined}
            footer={showFooter ? customFooter : undefined}
            actions={showActions ? customActions : undefined}
          >
            <p>{messageText}</p>
          </ChatMessage>
        </div>
      </div>

      <!-- Controls Side Panel -->
      <div class="playground-controls">
        <h3>{text().configTitle}</h3>

        <!-- Role Select -->
        <div class="control-group">
          <label for="select-role" class="control-label">{text().roleLabel}</label>
          <select id="select-role" bind:value={role} class="control-select">
            <option value="user">{text().userLabel} (user)</option>
            <option value="assistant">{text().assistantLabel} (assistant)</option>
            <option value="system">{text().systemLabel} (system)</option>
            <option value="tool">{text().toolLabel} (tool)</option>
          </select>
        </div>

        <!-- Status Select -->
        <div class="control-group">
          <label for="select-status" class="control-label">{text().statusLabel}</label>
          <select id="select-status" bind:value={status} class="control-select">
            <option value="pending">En attente (pending)</option>
            <option value="processing">En cours de streaming (processing)</option>
            <option value="completed">Terminé (completed)</option>
            <option value="failed">Échoué (failed)</option>
          </select>
        </div>

        <!-- Timestamp -->
        <div class="control-group">
          <label for="input-timestamp" class="control-label">{text().timestampLabel}</label>
          <input
            id="input-timestamp"
            type="text"
            bind:value={timestamp}
            class="control-text-input"
          />
        </div>

        <!-- Message Body -->
        <div class="control-group">
          <label for="textarea-msg" class="control-label">{text().messageTextLabel}</label>
          <textarea
            id="textarea-msg"
            rows="3"
            bind:value={messageText}
            class="control-textarea"
          ></textarea>
        </div>

        <hr class="control-divider" />

        <!-- Snippets & Slots -->
        <div class="control-group">
          <span class="control-label">Snippets Optionnels (Slots)</span>
          <div class="checkbox-list">
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={showAvatar} class="control-checkbox" />
              <span>{text().showAvatarLabel}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={showFooter} class="control-checkbox" />
              <span>{text().showFooterLabel}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={showActions} class="control-checkbox" />
              <span>{text().showActionsLabel}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Code Block -->
    <div class="playground-code-section">
      <div class="code-header">
        <span>Code Svelte correspondant</span>
      </div>
      <pre class="code-pre"><code>{generatedCode}</code></pre>
    </div>
  </section>

  <!-- Statuses -->
  <section class="docs-section">
    <h2>{text().statusTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr>
          <th>value</th>
          <th>meaning</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>pending</code></td>
          <td>
            {#if locale.value === "fr"}
              Message en attente d'envoi. Affiche un état neutre atténué.
            {:else}
              Message queued for delivery. Renders a neutral, dimmed state.
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>processing</code></td>
          <td>
            {#if locale.value === "fr"}
              Message en cours de stream ou de rédaction. Affiche un point clignotant ou un loader discret.
            {:else}
              Message currently streaming or processing. Shows a flashing dot or a subtle loader.
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>completed</code></td>
          <td>
            {#if locale.value === "fr"}
              Message entièrement reçu et rendu. Bulle finalisée.
            {:else}
              Message fully received and rendered. Complete bubble.
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>failed</code></td>
          <td>
            {#if locale.value === "fr"}
              Échec de la requête. Affiche une bordure rouge sémantique et un signalement d'erreur.
            {:else}
              Request failed. Triggers a semantic red border and error indicators.
            {/if}
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- Component API Details -->
  <section class="docs-section">
    <h2>{text().propTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>{text().apiProp1}</th><th>{text().apiProp2}</th><th>{text().apiProp3}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>role</code></td><td><code>"user" | "assistant" | "system" | "tool"</code></td><td>Configure l'alignement visuel (droite pour user, gauche pour assistant) et la palette chromatique.</td></tr>
        <tr><td><code>status</code></td><td><code>"pending" | "processing" | "completed" | "failed"</code></td><td>Contrôle l'état d'animation et de validation de la bulle.</td></tr>
        <tr><td><code>timestamp</code></td><td><code>string</code></td><td>Chaîne de caractères optionnelle affichant l'heure ou l'état de finalisation dans le footer.</td></tr>
        <tr><td><code>avatar</code></td><td><code>Snippet</code> (slot)</td><td>Rend une zone dédiée à l'avatar (ex: icône utilisateur ou logo IA).</td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code> (slot, requis)</td><td>Le corps du message, acceptant du HTML ou du markdown formaté.</td></tr>
        <tr><td><code>footer</code></td><td><code>Snippet</code> (slot)</td><td>Extension personnalisée du pied de page du message.</td></tr>
        <tr><td><code>actions</code></td><td><code>Snippet</code> (slot)</td><td>Barre d'actions secondaires apparaissant au survol ou focus du message.</td></tr>
      </tbody>
    </table>
  </section>

  <!-- Key Tokens -->
  <section class="docs-section">
    <h2>{text().tokenTitle}</h2>
    <ul class="docs-token-list">
      <li><code>{text().token1}</code> : Espace entre l'avatar et la bulle.</li>
      <li><code>{text().token2}</code> : Diamètre du conteneur d'avatar.</li>
      <li><code>{text().token3}</code> : Couleur d'arrière-plan par défaut des bulles.</li>
      <li><code>{text().token4}</code> : Largeur maximale autorisée pour une bulle.</li>
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

  .playground-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    background: var(--st-semantic-surface-default);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.5rem);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 1024px) {
    .playground-layout {
      grid-template-columns: 1.2fr 1fr;
    }
  }

  .flex-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .justify-center {
    justify-content: center;
    align-items: center;
  }

  .relative {
    position: relative;
  }

  .playground-render-box {
    background: var(--st-semantic-surface-sunken, #f8f9fa);
    border-radius: var(--st-radius-sm, 0.25rem);
    padding: 2rem;
    min-height: 320px;
    border: 1px dashed var(--st-semantic-border-subtle);
  }

  .interactive-message-container {
    width: 100%;
    max-width: 550px;
  }

  .toast-overlay {
    position: absolute;
    top: 1rem;
    background: var(--st-semantic-surface-inverse);
    color: var(--st-semantic-text-inverse);
    padding: 0.5rem 1rem;
    border-radius: var(--st-radius-sm);
    font-size: 0.8125rem;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    animation: fadeIn 150ms ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .docs-chatMessageAvatar {
    align-items: center;
    border-radius: 999px;
    display: inline-flex;
    height: 1.35rem;
    justify-content: center;
    width: 1.35rem;
    border: 1px solid var(--st-semantic-border-subtle);
  }

  .docs-chatMessageAvatar--user {
    background: var(--st-semantic-surface-subtle, #e2e8f0);
    color: var(--st-semantic-text-secondary);
  }

  .docs-chatMessageAvatar--assistant {
    background: var(--st-semantic-surface-default, #dbeafe);
    color: var(--st-semantic-action-primary);
  }

  .custom-footer-content {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    color: var(--st-semantic-text-secondary);
  }

  .message-actions-row {
    display: flex;
    gap: 0.25rem;
    background: var(--st-semantic-surface-default);
    border: 1px solid var(--st-semantic-border-subtle);
    padding: 0.125rem;
    border-radius: 4px;
  }

  .playground-controls {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .playground-controls h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    border-bottom: 1px solid var(--st-semantic-border-subtle);
    padding-bottom: 0.5rem;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .control-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--st-semantic-text-primary);
  }

  .control-select {
    width: 100%;
    padding: 0.5rem;
    border-radius: var(--st-radius-sm, 0.25rem);
    border: 1px solid var(--st-semantic-border-subtle);
    background: var(--st-semantic-surface-default);
    color: var(--st-semantic-text-primary);
    font-size: 0.875rem;
  }

  .control-text-input {
    padding: 0.5rem;
    border-radius: var(--st-radius-sm, 0.25rem);
    border: 1px solid var(--st-semantic-border-subtle);
    background: var(--st-semantic-surface-default);
    color: var(--st-semantic-text-primary);
    font-size: 0.875rem;
  }

  .control-textarea {
    padding: 0.5rem;
    border-radius: var(--st-radius-sm, 0.25rem);
    border: 1px solid var(--st-semantic-border-subtle);
    background: var(--st-semantic-surface-default);
    color: var(--st-semantic-text-primary);
    font-size: 0.875rem;
    font-family: inherit;
    resize: vertical;
  }

  .control-checkbox {
    width: 1rem;
    height: 1rem;
    accent-color: var(--st-semantic-action-primary);
  }

  .checkbox-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: normal;
    font-size: 0.8125rem;
    color: var(--st-semantic-text-primary);
  }

  .control-divider {
    border: 0;
    border-top: 1px solid var(--st-semantic-border-subtle);
    margin: 0.5rem 0;
  }

  .playground-code-section {
    background: #1e1e1e;
    border-radius: var(--st-radius-md, 0.5rem);
    overflow: hidden;
    color: #e3e3e3;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.875rem;
    margin-top: 1.5rem;
  }

  .code-header {
    background: #2d2d2d;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-weight: bold;
    border-bottom: 1px solid #3d3d3d;
    color: #a0a0a0;
  }

  .code-pre {
    margin: 0;
    padding: 1.25rem;
    overflow-x: auto;
    line-height: 1.5;
  }
</style>
