<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import { Badge, ChatMessage, ChatThread, ChatComposer } from "@sentropic/design-system-svelte";
  import { Sparkles, UserRound, Trash2, ShieldAlert, Wrench, RefreshCw } from "@lucide/svelte";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      kicker: "Composant · Chat",
      status: "Stable",
      intro:
        "Conteneur scrollable pour la liste des messages, auto-scroll et état vide explicite.",
      baseTitle: "Exemples simples",
      playgroundTitle: "Simulateur de Fil de Discussion IA Complet (Onboarding)",
      playgroundDesc: "Découvrez l'intégration parfaite de nos primitives de Chat UI. Discutez en direct avec l'assistant simulé, configurez l'auto-défilement, injectez des événements techniques ou videz le fil pour apprécier l'état vide.",
      autoScrollLabel: "Auto-défilement actif (autoScroll)",
      emptyIllustrationTitle: "Fil de discussion vierge",
      emptyIllustrationDesc: "Saisissez un message ci-dessous pour démarrer une session interactive enrichie.",
      addSystemBtn: "Injecter un Log Système",
      addToolBtn: "Injecter un Log Outil",
      clearBtn: "Vider le fil",
      composerPlaceholder: "Écrire une question à l'IA...",
      systemMessageAdded: "Log Système injecté.",
      toolMessageAdded: "Log Outil injecté.",
      assistantWelcome: "Bonjour ! Je suis votre assistant virtuel. Ce fil de discussion interactif est propulsé par les primitives `ChatThread`, `ChatMessage` et `ChatComposer` du design system. Essayez de m'écrire !",
      assistantThinking: "Réflexion en cours...",
      assistantResponse: "J'ai bien reçu votre message ! Le défilement s'adapte dynamiquement en bas à chaque nouveau mot ou bloc inséré dans le thread.",
      behaviorTitle: "Comportement & Accessibilité",
      propsTitle: "Propriétés de l'API",
      tokenTitle: "Tokens de style",
      token1: "--st-component-chatThread-padding",
      token2: "--st-component-chatThread-gap",
      token3: "--st-component-chatThread-maxHeight",
      token4: "--st-component-chatThread-minHeight",
      a11yLabel: "Journal de discussion",
      apiProp1: "Propriété",
      apiProp2: "Type",
      apiProp3: "Description",
      resetWelcomeBtn: "Réinitialiser",
      controlsHeading: "Commandes & Événements",
      eventInjectionLabel: "Injection d'Événements",
      threadActionsLabel: "Actions sur le Fil",
      resetConversationBtn: "Réinitialiser la conversation",
      typicalStructureLabel: "Structure de thread typique"
    },
    en: {
      kicker: "Component · Chat",
      status: "Stable",
      intro:
        "Scrollable message list with auto-scroll and explicit empty state rendering.",
      baseTitle: "Simple Examples",
      playgroundTitle: "Full AI Conversation Simulator (Onboarding)",
      playgroundDesc: "Discover the seamless integration of our Chat UI primitives. Chat live with a simulated AI agent, toggle auto-scrolling, inject technical log events, or clear the feed to see the custom empty state.",
      autoScrollLabel: "Auto-scroll active (autoScroll)",
      emptyIllustrationTitle: "Empty Conversation Log",
      emptyIllustrationDesc: "Type a message in the composer below to begin a live interactive session.",
      addSystemBtn: "Inject System Log",
      addToolBtn: "Inject Tool Log",
      clearBtn: "Clear conversation",
      composerPlaceholder: "Ask the AI helper a question...",
      systemMessageAdded: "System log injected.",
      toolMessageAdded: "Tool log injected.",
      assistantWelcome: "Hello! I am your virtual assistant. This interactive chat feed is built using the `ChatThread`, `ChatMessage`, and `ChatComposer` design system primitives. Try messaging me!",
      assistantThinking: "Thinking...",
      assistantResponse: "Received your message! The thread scroll position dynamically sticks to the bottom as new message tokens or blocks are pushed.",
      behaviorTitle: "Behavior & Accessibility",
      propsTitle: "API Properties",
      tokenTitle: "Styling Tokens",
      token1: "--st-component-chatThread-padding",
      token2: "--st-component-chatThread-gap",
      token3: "--st-component-chatThread-maxHeight",
      token4: "--st-component-chatThread-minHeight",
      a11yLabel: "Conversation log",
      apiProp1: "Property",
      apiProp2: "Type",
      apiProp3: "Description",
      resetWelcomeBtn: "Reset welcome",
      controlsHeading: "Commands & Events",
      eventInjectionLabel: "Event Injection",
      threadActionsLabel: "Thread Actions",
      resetConversationBtn: "Reset conversation",
      typicalStructureLabel: "Typical thread structure"
    }
  } as const;

  const text = () => copy[locale.value];

  type ThreadItem = {
    id: string;
    role: "user" | "assistant" | "system" | "tool";
    status: "pending" | "processing" | "completed" | "failed";
    content: string;
    timestamp: string;
  };

  // Chat Thread initial state
  let messages = $state<ThreadItem[]>([
    {
      id: "msg-1",
      role: "assistant",
      status: "completed",
      content: "", // Will be dynamically loaded
      timestamp: "10:15"
    }
  ]);

  // Sync assistant welcome message with locale
  $effect(() => {
    if (messages.length === 1 && messages[0].id === "msg-1") {
      messages[0].content = text().assistantWelcome;
    }
  });

  // Settings
  let autoScroll = $state(true);
  let composerValue = $state("");
  let isAiBusy = $state(false);
  let intervalId: any = null;

  function getFormattedTime() {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  // Handle user submit
  function handleSendMessage(payload: { message: string }) {
    if (!payload.message.trim()) return;

    // 1. Add User Message
    const userMsg: ThreadItem = {
      id: `msg-${Math.random()}`,
      role: "user",
      status: "completed",
      content: payload.message,
      timestamp: getFormattedTime()
    };

    messages = [...messages, userMsg];
    composerValue = "";

    // 2. Simulate AI Thinking & Streaming
    isAiBusy = true;
    
    // Add temporary processing assistant message
    const aiMsgId = `msg-ai-${Math.random()}`;
    const aiMsgPlaceholder: ThreadItem = {
      id: aiMsgId,
      role: "assistant",
      status: "processing",
      content: text().assistantThinking,
      timestamp: getFormattedTime()
    };

    messages = [...messages, aiMsgPlaceholder];

    setTimeout(() => {
      // Start streaming response
      let finalContent = text().assistantResponse;
      let streamContent = "";
      let charIdx = 0;

      // Update AI message state to streaming
      const targetIndex = messages.findIndex(m => m.id === aiMsgId);
      if (targetIndex !== -1) {
        messages[targetIndex].content = "";
      }

      if (intervalId) clearInterval(intervalId);
      
      intervalId = setInterval(() => {
        if (charIdx < finalContent.length) {
          streamContent += finalContent[charIdx];
          const idx = messages.findIndex(m => m.id === aiMsgId);
          if (idx !== -1) {
            messages[idx] = {
              ...messages[idx],
              content: streamContent
            };
          }
          charIdx++;
        } else {
          clearInterval(intervalId);
          isAiBusy = false;
          // Finalize status
          const idx = messages.findIndex(m => m.id === aiMsgId);
          if (idx !== -1) {
            messages[idx] = {
              ...messages[idx],
              status: "completed"
            };
          }
        }
      }, 20);
    }, 1000);
  }

  // Inject a system event log
  function injectSystemLog() {
    const sysMsg: ThreadItem = {
      id: `msg-${Math.random()}`,
      role: "system",
      status: "completed",
      content: locale.value === "fr" 
        ? "Optimisation de thread effectuée: autoScroll recalibré à 0ms de décalage." 
        : "Thread optimization performed: autoScroll recalibrated to 0ms delay.",
      timestamp: getFormattedTime()
    };
    messages = [...messages, sysMsg];
  }

  // Inject a tool event log
  function injectToolLog() {
    const toolMsg: ThreadItem = {
      id: `msg-${Math.random()}`,
      role: "tool",
      status: "completed",
      content: locale.value === "fr"
        ? "Appel d'outil database-connector réussi. Résultat: 200 OK"
        : "Tool call database-connector succeeded. Result: 200 OK",
      timestamp: getFormattedTime()
    };
    messages = [...messages, toolMsg];
  }

  // Clear thread to see empty state
  function clearThread() {
    if (intervalId) clearInterval(intervalId);
    messages = [];
    isAiBusy = false;
  }

  // Reset thread to initial welcome
  function resetThread() {
    clearThread();
    messages = [
      {
        id: "msg-1",
        role: "assistant",
        status: "completed",
        content: text().assistantWelcome,
        timestamp: getFormattedTime()
      }
    ];
  }
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

{#snippet emptyStateTemplate()}
  <div class="custom-empty-state-view">
    <div class="empty-state-icon-container">
      <Sparkles size={24} />
    </div>
    <h4>{text().emptyIllustrationTitle}</h4>
    <p>{text().emptyIllustrationDesc}</p>
    <button type="button" class="docs-reset-btn" onclick={resetThread}>
      <RefreshCw size={12} />
      <span>{text().resetWelcomeBtn}</span>
    </button>
  </div>
{/snippet}

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>ChatThread</h1>
      <Badge tone="success">{text().status}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <TabbedExample nodes={getExample("chatthread")?.nodes ?? []} />


  <!-- Complete Chat Simulator Onboarding Section -->
  <section class="docs-section">
    <h2>{text().playgroundTitle}</h2>
    <p class="section-desc">{text().playgroundDesc}</p>

    <div class="playground-layout relative-layout">
      <!-- Simulated Chat Workspace -->
      <div class="chat-workspace-panel">
        
        <!-- Live Scrollable ChatThread -->
        <div class="chat-thread-outer-box">
          <ChatThread
            label={text().a11yLabel}
            {autoScroll}
            emptyState={emptyStateTemplate}
          >
            {#each messages as msg (msg.id)}
              <ChatMessage
                role={msg.role}
                status={msg.status}
                timestamp={msg.timestamp}
                avatar={msg.role === 'user' ? userAvatar : (msg.role === 'assistant' ? assistantAvatar : undefined)}
              >
                <p>{msg.content}</p>
              </ChatMessage>
            {/each}
          </ChatThread>
        </div>

        <!-- Composer in context -->
        <div class="chat-composer-context-box">
          <ChatComposer
            bind:value={composerValue}
            placeholder={text().composerPlaceholder}
            busy={isAiBusy}
            onsubmit={handleSendMessage}
          />
        </div>
      </div>

      <!-- Controls Side Panel -->
      <div class="playground-controls">
        <h3>{text().controlsHeading}</h3>

        <!-- AutoScroll toggle -->
        <div class="control-group check-group-override">
          <label class="checkbox-label">
            <input type="checkbox" bind:checked={autoScroll} class="control-checkbox" />
            <span class="control-label">{text().autoScrollLabel}</span>
          </label>
        </div>

        <hr class="control-divider" />

        <!-- Simulation Injection buttons -->
        <div class="control-group">
          <span class="control-label">{text().eventInjectionLabel}</span>
          <p class="control-help-text">Simulez des retours asynchrones d'infrastructure ou de traitement au milieu du thread.</p>
          <div class="btn-stack">
            <button type="button" class="injection-btn secondary-btn" onclick={injectSystemLog}>
              <ShieldAlert size={14} />
              <span>{text().addSystemBtn}</span>
            </button>
            <button type="button" class="injection-btn secondary-btn" onclick={injectToolLog}>
              <Wrench size={14} />
              <span>{text().addToolBtn}</span>
            </button>
          </div>
        </div>

        <hr class="control-divider" />

        <!-- Actions Panel -->
        <div class="control-group">
          <span class="control-label">{text().threadActionsLabel}</span>
          <div class="btn-stack">
            <button type="button" class="injection-btn danger-btn" onclick={clearThread}>
              <Trash2 size={14} />
              <span>{text().clearBtn}</span>
            </button>
            <button type="button" class="injection-btn default-btn" onclick={resetThread}>
              <RefreshCw size={14} />
              <span>{text().resetConversationBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Code Block -->
    <div class="playground-code-section">
      <div class="code-header">
        <span>{text().typicalStructureLabel}</span>
      </div>
      <pre class="code-pre"><code>{`<script lang="ts">
  import { ChatThread, ChatMessage, ChatComposer } from "@sentropic/design-system-svelte";
<\/script>

<div class="chat-container">
  <ChatThread label="Customer Support Feed" autoScroll={true}>
    {#each messages as msg}
      <ChatMessage role={msg.role} status={msg.status}>
        <p>{msg.text}</p>
      </ChatMessage>
    {/each}
  </ChatThread>

  <ChatComposer bind:value={draft} onsubmit={sendMessage} />
</div>`}</code></pre>
    </div>
  </section>

  <!-- Component API Details -->
  <section class="docs-section">
    <h2>{text().propsTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>{text().apiProp1}</th><th>Type</th><th>{text().apiProp3}</th></tr>
      </thead>
      <tbody>
        <tr><td><code>label</code></td><td><code>string</code></td><td>Description sémantique globale du fil (<code>aria-label</code>) pour l'accessibilité.</td></tr>
        <tr><td><code>autoScroll</code></td><td><code>boolean</code></td><td>Si activé, déclenche un défilement automatique vers le bas (scroll to bottom) fluide dès que de nouveaux enfants ou éléments de texte sont injectés.</td></tr>
        <tr><td><code>emptyState</code></td><td><code>Snippet</code> (slot)</td><td>Template ou composant affiché lorsque le tableau de messages est entièrement vide, idéal pour y insérer des suggestions d'amorces de discussion.</td></tr>
        <tr><td><code>children</code></td><td><code>Snippet</code> (slot, requis)</td><td>La liste des messages enfants, typiquement des composants <code>ChatMessage</code> ou <code>StreamingMessage</code>.</td></tr>
        <tr><td><code>class</code></td><td><code>string</code></td><td>Classe CSS additionnelle pour ajuster le positionnement ou le dépassement.</td></tr>
      </tbody>
    </table>
  </section>

  <!-- Behavior -->
  <section class="docs-section">
    <h2>{text().behaviorTitle}</h2>
    <ul class="docs-token-list">
      <li><strong>Rôle d'accessibilité :</strong> Le conteneur se voit attribuer un <code>role="log"</code> standard pour garantir que les agents d'assistance vocale annoncent correctement les ajouts séquentiels de messages.</li>
      <li><strong>Politesse ARIA :</strong> Intègre <code>aria-live="polite"</code> pour notifier discrètement le lecteur d'écran de l'arrivée d'une nouvelle réponse sans couper la lecture en cours.</li>
      <li><strong>Optimisation de défilement :</strong> Utilise un observateur de mutations DOM (`MutationObserver`) interne optimisé pour n'activer le scroll bas automatique que si l'utilisateur n'est pas déjà en train de faire défiler activement les messages précédents vers le haut (respect du focus de lecture).</li>
    </ul>
  </section>

  <!-- Key Tokens -->
  <section class="docs-section">
    <h2>{text().tokenTitle}</h2>
    <table class="docs-table">
      <thead>
        <tr><th>Token CSS</th><th>Valeur par défaut</th><th>Usage</th></tr>
      </thead>
      <tbody>
        <tr><td><code>{text().token1}</code></td><td><code>1.5rem 1rem</code></td><td>Espacement intérieur (padding) du journal conversationnel.</td></tr>
        <tr><td><code>{text().token2}</code></td><td><code>1.25rem</code></td><td>Espace vertical (gap) séparant chaque bulle de message.</td></tr>
        <tr><td><code>{text().token3}</code></td><td><code>100%</code></td><td>Hauteur maximale autorisée pour le fil de discussion avant défilement.</td></tr>
        <tr><td><code>{text().token4}</code></td><td><code>200px</code></td><td>Hauteur minimale du thread.</td></tr>
      </tbody>
    </table>
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
      grid-template-columns: 1.3fr 1fr;
    }
  }

  .chat-workspace-panel {
    display: flex;
    flex-direction: column;
    background: var(--st-semantic-surface-sunken, #f8f9fa);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-sm);
    overflow: hidden;
    height: 480px;
  }

  .chat-thread-outer-box {
    flex: 1;
    overflow-y: auto;
    background: var(--st-semantic-surface-default);
    border-bottom: 1px solid var(--st-semantic-border-subtle);
    max-height: 380px;
  }

  .chat-composer-context-box {
    padding: 0.75rem 1rem;
    background: var(--st-semantic-surface-sunken);
  }

  .custom-empty-state-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    text-align: center;
    color: var(--st-semantic-text-secondary);
  }

  .empty-state-icon-container {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 999px;
    background: var(--st-semantic-surface-default, #e2e8f0);
    color: var(--st-semantic-action-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    border: 1px solid var(--st-semantic-border-subtle);
  }

  .custom-empty-state-view h4 {
    margin: 0 0 0.35rem 0;
    font-size: 1rem;
    color: var(--st-semantic-text-primary);
  }

  .custom-empty-state-view p {
    margin: 0 0 1rem 0;
    font-size: 0.8125rem;
    max-width: 250px;
  }

  .docs-reset-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: var(--st-semantic-surface-default);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: 4px;
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    color: var(--st-semantic-text-primary);
    cursor: pointer;
    transition: all 120ms ease;
  }

  .docs-reset-btn:hover {
    background: var(--st-semantic-surface-sunken);
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

  .control-help-text {
    font-size: 0.75rem;
    color: var(--st-semantic-text-secondary);
    margin: 0 0 0.25rem 0;
    line-height: 1.3;
  }

  .check-group-override {
    padding-top: 0.25rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .control-checkbox {
    width: 1rem;
    height: 1rem;
    accent-color: var(--st-semantic-action-primary);
  }

  .control-divider {
    border: 0;
    border-top: 1px solid var(--st-semantic-border-subtle);
    margin: 0.5rem 0;
  }

  .btn-stack {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .injection-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: var(--st-radius-sm, 4px);
    font-size: 0.8125rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 120ms ease;
    border: 1px solid var(--st-semantic-border-subtle);
  }

  .secondary-btn {
    background: var(--st-semantic-surface-default);
    color: var(--st-semantic-text-primary);
  }

  .secondary-btn:hover {
    background: var(--st-semantic-surface-sunken);
  }

  .danger-btn {
    background: var(--st-semantic-surface-default);
    color: var(--st-semantic-text-error, #d32f2f);
    border-color: var(--st-semantic-text-error, #d32f2f);
  }

  .danger-btn:hover {
    background: #fdf2f2;
  }

  .default-btn {
    background: var(--st-semantic-surface-sunken);
    color: var(--st-semantic-text-secondary);
  }

  .default-btn:hover {
    background: var(--st-semantic-surface-subtle);
    color: var(--st-semantic-text-primary);
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
