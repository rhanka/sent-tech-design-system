// Copie FR/EN du widget de chat (UI en français par défaut, EN en repli).
import type { Locale } from "$lib/i18n";

export interface ChatCopy {
  launcherLabel: string;
  panelTitle: string;
  panelSubtitle: string;
  close: string;
  threadLabel: string;
  placeholder: string;
  emptyTitle: string;
  emptyBody: string;
  remaining: (n: number) => string;
  remainingNone: string;
  thinking: string;
  demoNotice: string;
  demoReply: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  assistantName: string;
}

const fr: ChatCopy = {
  launcherLabel: "Ouvrir l'assistant",
  panelTitle: "Assistant Sentropic",
  panelSubtitle: "Posez vos questions sur le design system",
  close: "Fermer l'assistant",
  threadLabel: "Conversation avec l'assistant",
  placeholder: "Écrire une question…",
  emptyTitle: "Comment puis-je aider ?",
  emptyBody: "Posez une question sur les composants, les tokens ou l'intégration.",
  remaining: (n) =>
    n > 1 ? `${n} messages restants` : `${n} message restant`,
  remainingNone: "Limite d'essai atteinte",
  thinking: "Réflexion…",
  demoNotice: "Démo locale : endpoint non configuré.",
  demoReply:
    "Réponse de démonstration (aucun endpoint configuré). Une fois PUBLIC_CHAT_ENDPOINT défini, vos questions seront envoyées au modèle.",
  ctaTitle: "Continuez en vous connectant",
  ctaBody:
    "Vous avez utilisé vos essais gratuits. Connectez-vous pour poursuivre la conversation.",
  ctaButton: "Connectez-vous pour continuer",
  assistantName: "Assistant"
};

const en: ChatCopy = {
  launcherLabel: "Open the assistant",
  panelTitle: "Sentropic Assistant",
  panelSubtitle: "Ask anything about the design system",
  close: "Close the assistant",
  threadLabel: "Conversation with the assistant",
  placeholder: "Ask a question…",
  emptyTitle: "How can I help?",
  emptyBody: "Ask about components, tokens, or integration.",
  remaining: (n) => (n > 1 ? `${n} messages left` : `${n} message left`),
  remainingNone: "Free trial limit reached",
  thinking: "Thinking…",
  demoNotice: "Local demo: endpoint not configured.",
  demoReply:
    "Demo reply (no endpoint configured). Once PUBLIC_CHAT_ENDPOINT is set, your questions will be sent to the model.",
  ctaTitle: "Sign in to continue",
  ctaBody:
    "You've used your free trial. Sign in to keep chatting.",
  ctaButton: "Sign in to continue",
  assistantName: "Assistant"
};

export function chatCopy(locale: Locale): ChatCopy {
  return locale === "fr" ? fr : en;
}
