<script lang="ts">
  import TabbedExample from "$lib/framework/TabbedExample.svelte";
  import { getExample } from "$lib/framework/examples";
  import { Badge, ChatComposer, MessageStatusBadge } from "@sentropic/design-system-svelte";
  import { Plus, Trash2, Send, Square } from "@lucide/svelte";
  import { locale } from "$lib/locale.svelte";

  const copy = {
    fr: {
      kicker: "Composant · Chat",
      status: "Stable",
      intro:
        "Shell de rédaction de message avec raccourci clavier Enter, slots actions et état d’exécution stoppable.",
      baseTitle: "Exemples de base",
      playgroundTitle: "Bac à sable interactif",
      playgroundDesc: "Personnalisez le composer en temps réel. Modifiez les comportements de dimensionnement automatique, les limites de lignes, et testez la simulation d’envoi avec interruption (busy/stoppable).",
      configTitle: "Configuration du Composer",
      autosizeLabel: "Ajustement automatique (autosize)",
      maxRowsLabel: "Nombre max de lignes (maxRows)",
      placeholderLabel: "Texte d’invite (placeholder)",
      attachmentsLabel: "Activer le slot 'attachments'",
      actionsLeftLabel: "Activer le slot 'actions-left'",
      actionsRightLabel: "Activer le slot 'actions-right'",
      busyLabel: "Traitement en cours (busy)",
      stoppableLabel: "Interruptible (stoppable)",
      simulateLabel: "Simuler une réponse en continu",
      submitDone: "Dernier envoi: ",
      apiTitle: "API du Composant",
      apiDesc: "Le composant émet un événement `onsubmit` contenant la valeur saisie et sa provenance (clic ou touche Enter).",
      attachmentsText: "📎 2 fichiers sélectionnés (PDF, Image)",
      localActionText: "Ajouter un fichier",
      apiProp1: "Propriété",
      apiProp2: "Type",
      apiProp3: "Description",
      noValue: "Aucun envoi déclenché"
    },
    en: {
      kicker: "Component · Chat",
      status: "Stable",
      intro:
        "Message composer with Enter submit, action slots, and stoppable busy state for live flows.",
      baseTitle: "Base Examples",
      playgroundTitle: "Interactive Playground",
      playgroundDesc: "Customize the composer in real-time. Toggle automatic resizing, configure line limits, and test submission simulation with streaming interruption (busy/stoppable).",
      configTitle: "Composer Configuration",
      autosizeLabel: "Automatic resizing (autosize)",
      maxRowsLabel: "Maximum line count (maxRows)",
      placeholderLabel: "Prompt placeholder (placeholder)",
      attachmentsLabel: "Enable 'attachments' slot",
      actionsLeftLabel: "Enable 'actions-left' slot",
      actionsRightLabel: "Enable 'actions-right' slot",
      busyLabel: "Currently busy (busy)",
      stoppableLabel: "Interruptible (stoppable)",
      simulateLabel: "Simulate continuous streaming response",
      submitDone: "Latest submit: ",
      apiTitle: "Component API",
      apiDesc: "The component dispatches an `onsubmit` event with the input text and its source trigger (click or Enter key).",
      attachmentsText: "📎 2 files attached (PDF, Image)",
      localActionText: "Add attachment",
      apiProp1: "Property",
      apiProp2: "Type",
      apiProp3: "Description",
      noValue: "No submit yet"
    }
  } as const;

  const text = () => copy[locale.value];

  // Playground Settings
  let value = $state("");
  let placeholder = $state("Demander n'importe quoi à l'assistant...");
  let autosize = $state(true);
  let maxRows = $state(5);
  let showAttachments = $state(true);
  let showActionsLeft = $state(true);
  let showActionsRight = $state(true);
  let isBusy = $state(false);
  let stoppable = $state(true);

  // Simulation Feedback
  let submitLog = $state<string>("");
  let streamingResponse = $state<string>("");
  let intervalId: any = null;

  async function handlePlaygroundSubmit(payload: {
    message: string;
    source: "submit" | "keyboard";
  }) {
    // Clear previous simulation
    if (intervalId) clearInterval(intervalId);
    streamingResponse = "";
    
    submitLog = `"${payload.message}" (via ${payload.source})`;
    isBusy = true;
    value = ""; // clear composer

    // Simulate streaming text response
    const mockResponse = locale.value === "fr" 
      ? "C'est bien reçu ! Voici une simulation de réponse en streaming. Nos primitives Chat UI s'intègrent parfaitement avec les flux LLM en continu."
      : "Understood! Here is a simulated streaming response. Our Chat UI primitives integrate beautifully with real-time LLM streams.";
    
    let charIndex = 0;
    intervalId = setInterval(() => {
      if (charIndex < mockResponse.length) {
        streamingResponse += mockResponse[charIndex];
        charIndex++;
      } else {
        clearInterval(intervalId);
        isBusy = false;
      }
    }, 30);
  }

  function handleStop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isBusy = false;
    streamingResponse += locale.value === "fr" 
      ? " [GÉNÉRATION INTERROMPUE PAR L'UTILISATEUR]" 
      : " [GENERATION INTERRUPTED BY USER]";
  }

  // Dynamic code generation
  const generatedCode = $derived.by(() => {
    let snippetsCode = "";
    if (showAttachments) {
      snippetsCode += `\n  {#snippet attachments()}\n    <span class="attachments-slot">\n      📎 2 files attached\n    </span>\n  {/snippet}`;
    }
    if (showActionsLeft) {
      snippetsCode += `\n  {#snippet actionsLeft()}\n    <button type="button" class="btn-left">\n      + Add\n    </button>\n  {/snippet}`;
    }
    if (showActionsRight) {
      snippetsCode += `\n  {#snippet actionsRight()}\n    <div class="btn-right">\n      <span class="status-indicator">Ready</span>\n    </div>\n  {/snippet}`;
    }

    return `<script lang="ts">
  import { ChatComposer } from "@sentropic/design-system-svelte";

  let value = "";
  let isBusy = ${isBusy};

  function handleSubmit({ message, source }) {
    console.log("Submit message:", message, "from:", source);
    // Trigger API call...
  }

  function handleStop() {
    console.log("Interrupted!");
  }
<\/script>

<ChatComposer
  bind:value={value}
  placeholder="${placeholder}"
  autosize={${autosize}}
  maxRows={${maxRows}}
  busy={isBusy}
  stoppable={${stoppable}}
  onsubmit={handleSubmit}
  onstop={handleStop}
>${snippetsCode ? snippetsCode + "\n" : ""}</ChatComposer>`;
  });
</script>

<div class="docs-page">
  <section class="docs-hero">
    <p class="docs-hero-kicker">{text().kicker}</p>
    <div class="docs-hero-title">
      <h1>ChatComposer</h1>
      <Badge tone="success">{text().status}</Badge>
    </div>
    <p>{text().intro}</p>
  </section>
  <TabbedExample nodes={getExample("chatcomposer")?.nodes ?? []} />


  <!-- Interactive Playground Section -->
  <section class="docs-section">
    <h2>{text().playgroundTitle}</h2>
    <p class="section-desc">{text().playgroundDesc}</p>

    <div class="playground-layout">
      <!-- Composer Render & Simulation Box -->
      <div class="playground-render-box flex-column">
        <div class="interactive-composer-wrapper">
          <ChatComposer
            bind:value
            {placeholder}
            {autosize}
            {maxRows}
            busy={isBusy}
            {stoppable}
            onsubmit={handlePlaygroundSubmit}
            onstop={handleStop}
          >
            {#if showAttachments}
              {#snippet attachments()}
                <span class="docs-attachments-wrapper">
                  {text().attachmentsText}
                </span>
              {/snippet}
            {/if}

            {#if showActionsLeft}
              {#snippet actionsLeft()}
                <button type="button" class="docs-composer-action-btn">
                  <Plus size={14} aria-hidden="true" />
                  <span>{text().localActionText}</span>
                </button>
              {/snippet}
            {/if}

            {#if showActionsRight}
              {#snippet actionsRight()}
                <span class="docs-composer-right-badge">
                  <MessageStatusBadge status={isBusy ? "processing" : "completed"} />
                </span>
              {/snippet}
            {/if}
          </ChatComposer>
        </div>

        <!-- Simulation Outputs -->
        <div class="simulation-output-panel">
          {#if submitLog}
            <div class="log-row">
              <span class="log-label">{text().submitDone}</span>
              <span class="log-val">{submitLog}</span>
            </div>
          {/if}
          {#if streamingResponse}
            <div class="ai-stream-bubble" class:streaming={isBusy}>
              <div class="avatar-indicator">AI</div>
              <div class="bubble-content">
                <p>{streamingResponse}</p>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Settings Side Panel -->
      <div class="playground-controls">
        <h3>{text().configTitle}</h3>

        <!-- Textarea input value -->
        <div class="control-group">
          <label for="composer-draft-val" class="control-label">Saisie courante (value)</label>
          <input
            id="composer-draft-val"
            type="text"
            bind:value
            placeholder="Écrire pour tester le bind:value..."
            class="control-text-input"
          />
        </div>

        <!-- Placeholder -->
        <div class="control-group">
          <label for="composer-placeholder" class="control-label">{text().placeholderLabel}</label>
          <input
            id="composer-placeholder"
            type="text"
            bind:value={placeholder}
            class="control-text-input"
          />
        </div>

        <div class="control-grid-2col">
          <!-- MaxRows -->
          <div class="control-group">
            <label for="composer-max-rows" class="control-label">{text().maxRowsLabel}</label>
            <input
              id="composer-max-rows"
              type="number"
              min="1"
              max="15"
              bind:value={maxRows}
              class="control-text-input"
            />
          </div>

          <!-- Autosize -->
          <div class="control-group check-group">
            <label class="control-label checkbox-label">
              <input type="checkbox" bind:checked={autosize} class="control-checkbox" />
              <span>{text().autosizeLabel}</span>
            </label>
          </div>
        </div>

        <hr class="control-divider" />

        <!-- Slots & Execution -->
        <div class="control-group">
          <span class="control-label">Personnalisation des Slots</span>
          <div class="checkbox-list">
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={showAttachments} class="control-checkbox" />
              <span>{text().attachmentsLabel}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={showActionsLeft} class="control-checkbox" />
              <span>{text().actionsLeftLabel}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={showActionsRight} class="control-checkbox" />
              <span>{text().actionsRightLabel}</span>
            </label>
          </div>
        </div>

        <hr class="control-divider" />

        <div class="control-group">
          <span class="control-label">États d'exécution</span>
          <div class="checkbox-list">
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={isBusy} class="control-checkbox" />
              <span>{text().busyLabel}</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={stoppable} class="control-checkbox" />
              <span>{text().stoppableLabel}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Svelte Code Render -->
    <div class="playground-code-section">
      <div class="code-header">
        <span>Code Svelte correspondant</span>
      </div>
      <pre class="code-pre"><code>{generatedCode}</code></pre>
    </div>
  </section>

  <!-- Component API Details -->
  <section class="docs-section">
    <h2>{text().apiTitle}</h2>
    <p class="section-desc">{text().apiDesc}</p>
    <table class="docs-table">
      <thead>
        <tr><th>{text().apiProp1}</th><th>{text().apiProp2}</th><th>{text().apiProp3}</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><code>value</code></td>
          <td><code>string</code> (bindable)</td>
          <td>
            {#if locale.value === "fr"}
              Le brouillon textuel en cours de rédaction dans le compositeur.
            {:else}
              The text draft currently typed inside the composer.
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>placeholder</code></td>
          <td><code>string</code></td>
          <td>
            {#if locale.value === "fr"}
              Le texte fantôme incitant l'utilisateur à taper.
            {:else}
              The shadow prompt guiding the user on what to type.
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>autosize</code></td>
          <td><code>boolean</code></td>
          <td>
            {#if locale.value === "fr"}
              Active l'adaptation automatique de la hauteur verticale de la zone de saisie selon le volume de texte.
            {:else}
              Automatically expands or shrinks the input field height based on the text length.
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>maxRows</code></td>
          <td><code>number</code></td>
          <td>
            {#if locale.value === "fr"}
              Le nombre maximal de lignes visibles avant que le compositeur n'active le scroll de défilement interne (défaut : 5).
            {:else}
              The maximum line height threshold before introducing an inner scrollbar (default: 5).
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>busy</code></td>
          <td><code>boolean</code></td>
          <td>
            {#if locale.value === "fr"}
              État de traitement actif. Désactive le bouton d'envoi et remplace l'icône par un indicateur de chargement ou un contrôle d'arrêt.
            {:else}
              Active processing state. Disables submit and swaps the action button with a loader or an interrupt button.
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>stoppable</code></td>
          <td><code>boolean</code></td>
          <td>
            {#if locale.value === "fr"}
              Si <code>true</code> et que <code>busy</code> est actif, affiche un bouton d'arrêt pour permettre l'interruption manuelle du flux en cours.
            {:else}
              If <code>true</code> while <code>busy</code> is active, shows a stop action to let the user interrupt the background stream.
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>onsubmit</code></td>
          <td><code>(payload: &#123; message: string; source: 'submit' | 'keyboard' &#125;) => void</code></td>
          <td>
            {#if locale.value === "fr"}
              Fonction de callback appelée lorsque l'utilisateur soumet (touche Enter ou clic sur le bouton).
            {:else}
              Callback fired upon submission (via pressing Enter or clicking the submit button).
            {/if}
          </td>
        </tr>
        <tr>
          <td><code>onstop</code></td>
          <td><code>() => void</code></td>
          <td>
            {#if locale.value === "fr"}
              Fonction de callback appelée lorsque le bouton d'arrêt est actionné en plein traitement.
            {:else}
              Callback fired when the stop button is triggered mid-process.
            {/if}
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- Slots explanation -->
  <section class="docs-section">
    <h2>Slots supportés</h2>
    <ul>
      <li>
        <strong>attachments() :</strong>
        {#if locale.value === "fr"}
          Zone située juste au-dessus du bloc de saisie principal pour lister les pièces jointes, fichiers téléversés, ou jetons contextuels.
        {:else}
          Area located just above the text input, ideal for listing file attachments, uploaded documents, or contextual chips.
        {/if}
      </li>
      <li>
        <strong>actionsLeft() :</strong>
        {#if locale.value === "fr"}
          Zone d'actions à gauche sous la zone de saisie, généralement utilisée pour ajouter des pièces jointes ou configurer le modèle de langue.
        {:else}
          Actions area at the bottom-left of the input zone, usually used to attach files or configure LLM options.
        {/if}
      </li>
      <li>
        <strong>actionsRight() :</strong>
        {#if locale.value === "fr"}
          Zone à droite du bouton de soumission pour placer un badge de statut de message, un compteur de tokens ou des actions secondaires.
        {:else}
          Area to the right of the submit button, perfect for status badges, token counters, or secondary options.
        {/if}
      </li>
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
    gap: 1.5rem;
  }

  .playground-render-box {
    background: var(--st-semantic-surface-sunken, #f8f9fa);
    border-radius: var(--st-radius-sm, 0.25rem);
    padding: 1.5rem;
    border: 1px dashed var(--st-semantic-border-subtle);
    justify-content: flex-start;
  }

  .interactive-composer-wrapper {
    width: 100%;
    background: var(--st-semantic-surface-default);
    border-radius: var(--st-radius-sm);
    padding: 0.25rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .docs-attachments-wrapper {
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: var(--st-semantic-surface-sunken);
    border-bottom: 1px solid var(--st-semantic-border-subtle);
    font-size: 0.8125rem;
    color: var(--st-semantic-text-secondary);
    gap: 0.5rem;
    border-radius: 4px 4px 0 0;
  }

  .docs-composer-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: transparent;
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    color: var(--st-semantic-text-secondary);
    cursor: pointer;
    transition: all 120ms ease;
  }

  .docs-composer-action-btn:hover {
    background: var(--st-semantic-surface-sunken);
    color: var(--st-semantic-text-primary);
  }

  .docs-composer-right-badge {
    display: inline-flex;
    align-items: center;
  }

  .simulation-output-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .log-row {
    font-size: 0.8125rem;
    background: var(--st-semantic-surface-default);
    border: 1px solid var(--st-semantic-border-subtle);
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    display: flex;
    gap: 0.5rem;
  }

  .log-label {
    font-weight: bold;
    color: var(--st-semantic-text-secondary);
  }

  .log-val {
    color: var(--st-semantic-action-primary);
    font-family: monospace;
  }

  .ai-stream-bubble {
    display: flex;
    gap: 0.75rem;
    background: var(--st-semantic-surface-default);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--st-semantic-border-subtle);
  }

  .ai-stream-bubble.streaming {
    border-color: var(--st-semantic-action-primary);
    box-shadow: 0 0 0 2px var(--st-semantic-surface-default), 0 0 0 4px rgba(0, 95, 184, 0.15);
  }

  .avatar-indicator {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 999px;
    background: var(--st-semantic-surface-default, #dbeafe);
    color: var(--st-semantic-action-primary);
    font-size: 0.6875rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid var(--st-semantic-border-subtle);
  }

  .bubble-content {
    font-size: 0.875rem;
    color: var(--st-semantic-text-primary);
    line-height: 1.4;
  }

  .bubble-content p {
    margin: 0;
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

  .control-text-input {
    padding: 0.5rem;
    border-radius: var(--st-radius-sm, 0.25rem);
    border: 1px solid var(--st-semantic-border-subtle);
    background: var(--st-semantic-surface-default);
    color: var(--st-semantic-text-primary);
    font-size: 0.875rem;
  }

  .control-grid-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: center;
  }

  .check-group {
    justify-content: flex-end;
    height: 100%;
    padding-top: 1rem;
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
