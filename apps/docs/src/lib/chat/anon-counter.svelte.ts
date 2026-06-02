// Compteur d'interactions anonymes du chat (mode « light-auth »).
//
// Persisté dans localStorage (clé `docs-chat-anon-count`), plafonné à ANON_LIMIT.
// Singleton réactif Svelte 5 ($state), même mécanique que locale.svelte.ts.
// Tous les accès navigateur sont gardés par `browser` (SSR/prerender-safe).

import { browser } from "$app/environment";
import { ANON_LIMIT, ANON_COUNT_STORAGE_KEY } from "./chat-config";

function clamp(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > ANON_LIMIT) return ANON_LIMIT;
  return Math.floor(n);
}

class AnonCounterStore {
  /** Nombre d'interactions anonymes consommées (0..ANON_LIMIT). */
  count = $state(0);

  /** Restaure le compteur depuis localStorage (client uniquement). */
  restore(): void {
    if (!browser) return;
    try {
      const raw = localStorage.getItem(ANON_COUNT_STORAGE_KEY);
      this.count = clamp(raw ? Number.parseInt(raw, 10) : 0);
    } catch {
      this.count = 0;
    }
  }

  /** Interactions anonymes restantes. */
  get remaining(): number {
    return Math.max(0, ANON_LIMIT - this.count);
  }

  /** Plafond atteint → on invite à se connecter. */
  get reached(): boolean {
    return this.count >= ANON_LIMIT;
  }

  /** Incrémente d'une interaction et persiste (jamais au-delà du plafond). */
  increment(): void {
    this.count = clamp(this.count + 1);
    if (!browser) return;
    try {
      localStorage.setItem(ANON_COUNT_STORAGE_KEY, String(this.count));
    } catch {
      // localStorage indisponible (mode privé strict, quota) : on n'échoue jamais.
    }
  }

  /** Remet à zéro (utile en debug / après authentification réussie). */
  reset(): void {
    this.count = 0;
    if (!browser) return;
    try {
      localStorage.removeItem(ANON_COUNT_STORAGE_KEY);
    } catch {
      /* no-op */
    }
  }
}

export const anonCounter = new AnonCounterStore();
