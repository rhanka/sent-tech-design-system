// ─────────────────────────────────────────────────────────────────────────────
// Configuration du widget de chat « light-auth » de la documentation.
//
// Site STATIQUE (adapter-static) : aucun runtime serveur. L'appel modèle se fait
// donc côté client (`fetch`) vers un ENDPOINT EXTERNE configurable au build via
// une variable d'environnement PUBLIQUE.
//
// On lit `import.meta.env.PUBLIC_CHAT_ENDPOINT` (remplacé statiquement par Vite,
// rend `undefined` si absente — SANS erreur de build). C'est l'équivalent souple
// de `$env/static/public` : ce dernier LÈVE une erreur de build si la variable
// n'est pas déclarée/définie, ce qui casserait le mode « non configuré » par
// défaut voulu ici. Pour basculer sur l'import strict une fois l'endpoint figé :
//   import { PUBLIC_CHAT_ENDPOINT } from "$env/static/public";
// ─────────────────────────────────────────────────────────────────────────────

import { browser } from "$app/environment";

/**
 * Plafond d'interactions anonymes avant l'invitation à se connecter.
 * Volontairement bas (mode « light-auth » : on goûte, puis on s'authentifie).
 */
export const ANON_LIMIT = 5;

/** Clé localStorage du compteur d'interactions anonymes. */
export const ANON_COUNT_STORAGE_KEY = "docs-chat-anon-count";

/**
 * URL de l'endpoint modèle. Vide/undefined par défaut → état « non configuré »
 * (le widget reste fonctionnel mais répond en mode démo local, voir ChatWidget).
 *
 * REVERSIBLE : on ne fige NI le service NI le modèle NI la clé ici. Le backend
 * derrière cette URL est libre, tant qu'il respecte le contrat ci-dessous.
 */
export const CHAT_ENDPOINT: string =
  (import.meta.env.PUBLIC_CHAT_ENDPOINT as string | undefined)?.trim() ?? "";

/** `true` si un endpoint a été fourni au build. */
export function isChatConfigured(): boolean {
  return CHAT_ENDPOINT.length > 0;
}

/**
 * Cible du CTA « Connectez-vous pour continuer » une fois le plafond anonyme
 * atteint. PLACEHOLDER : aucun système d'« auth dur » n'existe encore dans le
 * dépôt. Surchargeable au build via PUBLIC_CHAT_AUTH_URL ; sinon `#` (inerte).
 *
 * REVERSIBLE : à brancher sur la vraie entrée d'authentification le moment venu.
 */
export const CHAT_AUTH_URL: string =
  (import.meta.env.PUBLIC_CHAT_AUTH_URL as string | undefined)?.trim() || "#";

// ── Contrat requête / réponse codé côté client ───────────────────────────────
// Le backend (à brancher plus tard) DOIT respecter ce contrat.

export type ChatWireRole = "user" | "assistant" | "system";

/** Un tour de conversation envoyé à l'endpoint. */
export interface ChatWireMessage {
  role: ChatWireRole;
  content: string;
}

/**
 * Corps POST envoyé à `CHAT_ENDPOINT` (Content-Type: application/json).
 *
 *   {
 *     "messages": [{ "role": "user", "content": "Bonjour" }],
 *     "locale": "fr"
 *   }
 *
 * NOTE : aucune clé API n'est envoyée depuis le client (site statique public).
 * L'authentification/quota éventuel est la responsabilité de l'endpoint (proxy).
 */
export interface ChatRequestBody {
  messages: ChatWireMessage[];
  locale: string;
}

/**
 * Réponse JSON attendue de `CHAT_ENDPOINT` :
 *
 *   { "reply": "…texte de l'assistant…" }
 *
 * `reply` (ou, en repli, `message` / `content`) est lu comme texte assistant.
 */
export interface ChatResponseBody {
  reply?: string;
  message?: string;
  content?: string;
}

export interface SendChatResult {
  ok: boolean;
  reply: string;
}

/**
 * Appelle l'endpoint configuré. Ne LANCE jamais : retourne toujours un résultat
 * exploitable par l'UI (ok=false + message d'erreur FR/EN en cas de souci).
 */
export async function sendChatMessage(
  messages: ChatWireMessage[],
  locale: string,
  signal?: AbortSignal
): Promise<SendChatResult> {
  const errorReply =
    locale === "fr"
      ? "Désolé, une erreur est survenue. Réessayez plus tard."
      : "Sorry, something went wrong. Please try again later.";

  // Garde SSR/prerender + endpoint non configuré : pas d'appel réseau.
  if (!browser || !isChatConfigured()) {
    return { ok: false, reply: errorReply };
  }

  try {
    const body: ChatRequestBody = { messages, locale };
    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal
    });

    if (!res.ok) {
      return { ok: false, reply: errorReply };
    }

    const data = (await res.json()) as ChatResponseBody;
    const reply = (data.reply ?? data.message ?? data.content ?? "").trim();
    if (!reply) {
      return { ok: false, reply: errorReply };
    }
    return { ok: true, reply };
  } catch {
    // AbortError inclus : on reste silencieux côté logique, l'UI gère l'affichage.
    return { ok: false, reply: errorReply };
  }
}
