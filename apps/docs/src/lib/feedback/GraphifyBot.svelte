<script lang="ts">
  import { ChatThread, ChatComposer } from "@sentropic/design-system-svelte";
  import type {
    ChatMessageRole,
    ChatMessageStatus
  } from "@sentropic/design-system-svelte";

  // Forme attendue par la prop `messages` de ChatThread. Déclarée localement
  // car le type `ChatThreadMessage` n'est pas (encore) réexporté par le
  // package publié.
  type ChatThreadMessage = {
    id: string;
    role?: ChatMessageRole;
    content: string;
    status?: ChatMessageStatus;
  };

  /**
   * GraphifyBot — squelette du chatbot assisté par graphify (codex 5.4 mini)
   * pour les docs Sent Tech (WP17). Les réponses sont mockées pour l'instant
   * (aucune clé d'API requise) ; brancher un backend reviendra à remplacer
   * `mockReply` par un appel réseau qui consomme `systemPrompt` + l'historique.
   */
  type GraphifyBotProps = {
    /**
     * Contexte injecté pour la page courante (titre, composant documenté…).
     * Sert de système au futur appel modèle ; aujourd'hui il oriente le mock.
     */
    systemPrompt?: string;
    /** Hauteur max de la zone de conversation. */
    maxHeight?: string;
    class?: string;
  };

  let { systemPrompt, maxHeight = "26rem", class: className }: GraphifyBotProps =
    $props();

  let messages = $state<ChatThreadMessage[]>([
    {
      id: "greeting",
      role: "assistant",
      content:
        "Bonjour, je suis le bot graphify des docs Sent Tech. Posez-moi une question sur le design system, un composant ou un token et je vous oriente.",
      status: "completed"
    }
  ]);
  let busy = $state(false);
  let pending: ReturnType<typeof setTimeout> | undefined;

  const classes = () => ["graphifyBot", className].filter(Boolean).join(" ");

  /**
   * Réponse simulée. Remplacer par un appel au backend graphify (codex 5.4
   * mini) qui passe `systemPrompt` en message système et l'historique
   * `messages`. La forme du retour (texte assistant) reste identique.
   */
  function mockReply(question: string): string {
    const trimmed = question.trim().toLowerCase();
    const context = systemPrompt
      ? ` (contexte de page : ${systemPrompt})`
      : "";

    if (!trimmed) {
      return "Posez une question pour démarrer.";
    }
    if (/token|couleur|color|espac|spacing/.test(trimmed)) {
      return `Les tokens du design system vivent dans \`@sentropic/design-system-tokens\` (couches foundation, semantic, component). Consultez la page Tokens pour la liste complète${context}.`;
    }
    if (/composant|component|bouton|button|chat/.test(trimmed)) {
      return `Chaque composant est documenté en Svelte, React et Vue avec ses props et ses variantes. Dites-moi lequel vous intéresse${context}.`;
    }
    if (/bug|probl|issue|erreur|soumettre|signal/.test(trimmed)) {
      return `Pour signaler un bug, je prépare une soumission agent-à-agent vers l'app principale. Décrivez le comportement attendu vs observé et je formate le ticket${context}.`;
    }
    return `Je suis encore un squelette (réponses simulées, pas de modèle branché). Voici ce que je ferai bientôt : interroger le graphe de connaissances du DS pour vous répondre${context}.`;
  }

  async function handleSubmit({ message }: { message: string }) {
    const text = message.trim();
    if (!text || busy) return;

    messages = [
      ...messages,
      { id: `u-${Date.now()}`, role: "user", content: text, status: "completed" }
    ];

    busy = true;
    const thinkingId = `a-${Date.now()}`;
    messages = [
      ...messages,
      { id: thinkingId, role: "assistant", content: "", status: "processing" }
    ];

    // Latence simulée pour le rendu "en train d'écrire".
    pending = setTimeout(() => {
      const reply = mockReply(text);
      messages = messages.map((m) =>
        m.id === thinkingId
          ? { ...m, content: reply, status: "completed" }
          : m
      );
      busy = false;
    }, 600);
  }

  $effect(() => () => {
    if (pending) clearTimeout(pending);
  });
</script>

<div class={classes()} style:--graphifyBot-maxHeight={maxHeight}>
  <header class="graphifyBot__header">
    <span class="graphifyBot__dot" aria-hidden="true"></span>
    <div>
      <p class="graphifyBot__title">Assistant graphify</p>
      <p class="graphifyBot__subtitle">Réponses simulées (squelette WP17)</p>
    </div>
  </header>

  <ChatThread
    label="Conversation avec l'assistant graphify"
    {messages}
    class="graphifyBot__thread"
  />

  <ChatComposer
    placeholder="Posez une question sur le design system…"
    busy={busy}
    submitDisabled={busy}
    onsubmit={handleSubmit}
    sendLabel="Envoyer"
    inputAriaLabel="Question pour l'assistant graphify"
  />
</div>

<style>
  .graphifyBot {
    background: var(--st-semantic-surface-default, var(--st-semantic-background-default));
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-component-chatThread-radius, 0.75rem);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .graphifyBot__header {
    align-items: center;
    border-bottom: 1px solid var(--st-semantic-border-subtle);
    display: flex;
    gap: 0.6rem;
    padding-bottom: 0.6rem;
  }

  .graphifyBot__dot {
    background: var(--st-semantic-accent-default, var(--st-semantic-text-accent, currentColor));
    border-radius: 50%;
    flex: none;
    height: 0.6rem;
    width: 0.6rem;
  }

  .graphifyBot__title {
    color: var(--st-semantic-text-primary);
    font-weight: 600;
    margin: 0;
  }

  .graphifyBot__subtitle {
    color: var(--st-semantic-text-muted);
    font-size: 0.75rem;
    margin: 0.1rem 0 0;
  }

  .graphifyBot :global(.graphifyBot__thread) {
    max-height: var(--graphifyBot-maxHeight, 26rem);
  }
</style>
