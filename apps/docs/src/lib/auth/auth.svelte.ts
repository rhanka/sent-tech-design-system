// ─────────────────────────────────────────────────────────────────────────────
// Store d'authentification OAuth/OIDC (RP : Relying Party), phase 1 : login +
// affichage d'identité. PAS de proxy d'API ; le backend (app principale) reste
// l'autorité. Ce site docs ne fait qu'obtenir et valider une identité.
//
// SÉCURITÉ (non négociable) :
//  - PKCE S256 (verifier aléatoire crypto, challenge = SHA-256(verifier)).
//  - `state` ET `nonce` obligatoires, vérifiés au retour.
//  - verifier/state/nonce en sessionStorage TRANSITOIRE, effacés dès le callback.
//  - id_token validé via jose (createRemoteJWKSet + jwtVerify) : signature EdDSA,
//    iss == issuer, aud == client_id, exp, nonce == attendu. Tout échec = anon.
//  - access token + profil EN MÉMOIRE SEULEMENT (runes). Jamais localStorage,
//    jamais cookie, jamais loggé.
//  - clé de compte = (iss, sub). Jamais l'email comme identifiant.
//  - logout = vider le store (pas de RP-logout IdP).
// ─────────────────────────────────────────────────────────────────────────────

import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  JWKS_URI,
  OAUTH_ISSUER,
  TOKEN_ENDPOINT,
  USERINFO_ENDPOINT,
  buildAuthorizeUrl,
  buildTokenRequestBody,
  createCodeVerifier,
  createNonce,
  createState,
  deriveCodeChallenge,
  resolveClientId,
  resolveRedirectUri
} from "./oauth";

export type AuthStatus = "anon" | "authenticating" | "authed";

export interface AuthUser {
  /** Émetteur (issuer) : première moitié de la clé de compte. */
  iss: string;
  /** Sujet (subject) : seconde moitié de la clé de compte stable. */
  sub: string;
  /** Nom affichable (claim `name`, sinon fallback sur `sub`). Décoratif. */
  name?: string;
  /** Email : DÉCORATIF uniquement, jamais une clé d'identité. */
  email?: string;
  /** Avatar éventuel (claim `picture`). */
  picture?: string;
}

// Clés sessionStorage transitoires (effacées dès consommation du callback).
const SS_VERIFIER = "st-oauth-pkce-verifier";
const SS_STATE = "st-oauth-state";
const SS_NONCE = "st-oauth-nonce";

// JWKS distant mis en cache par jose (rotation gérée en interne). Construit
// paresseusement côté client uniquement.
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  if (!jwks) jwks = createRemoteJWKSet(new URL(JWKS_URI));
  return jwks;
}

function clearTransient(): void {
  sessionStorage.removeItem(SS_VERIFIER);
  sessionStorage.removeItem(SS_STATE);
  sessionStorage.removeItem(SS_NONCE);
}

interface TokenResponse {
  access_token?: string;
  id_token?: string;
  token_type?: string;
}

class AuthStore {
  status = $state<AuthStatus>("anon");
  user = $state<AuthUser | undefined>(undefined);

  // Access token EN MÉMOIRE SEULEMENT (champ privé non réactif, jamais exposé
  // dans `user`, jamais sérialisé, jamais loggé). Audience = userinfo.
  #accessToken: string | undefined;

  /**
   * Démarre le flux : génère PKCE + state + nonce, les persiste en
   * sessionStorage transitoire, puis redirige vers l'endpoint d'autorisation.
   */
  async login(): Promise<void> {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    const clientId = resolveClientId(origin);
    const redirectUri = resolveRedirectUri(origin);

    const verifier = createCodeVerifier();
    const state = createState();
    const nonce = createNonce();
    const codeChallenge = await deriveCodeChallenge(verifier);

    sessionStorage.setItem(SS_VERIFIER, verifier);
    sessionStorage.setItem(SS_STATE, state);
    sessionStorage.setItem(SS_NONCE, nonce);

    this.status = "authenticating";

    const authorizeUrl = buildAuthorizeUrl({
      clientId,
      redirectUri,
      state,
      nonce,
      codeChallenge
    });
    window.location.assign(authorizeUrl);
  }

  /**
   * Consomme le retour IdP (/auth/callback) : vérifie state, échange le code
   * (PKCE), valide l'id_token via jose, récupère le profil (userinfo), puis
   * pose la session EN MÉMOIRE. Tout échec => session anonyme.
   * @param search la query string du callback (window.location.search).
   * @returns true si une session a été établie.
   */
  async handleCallback(search: string): Promise<boolean> {
    if (typeof window === "undefined") return false;
    this.status = "authenticating";

    const params = new URLSearchParams(search);
    const code = params.get("code");
    const returnedState = params.get("state");
    const oauthError = params.get("error");

    const expectedState = sessionStorage.getItem(SS_STATE);
    const expectedNonce = sessionStorage.getItem(SS_NONCE);
    const verifier = sessionStorage.getItem(SS_VERIFIER);

    // Quoi qu'il arrive, l'aléa transitoire est à usage unique : on le purge.
    clearTransient();

    try {
      if (oauthError) {
        throw new Error(`IdP error: ${oauthError}`);
      }
      if (!code || !returnedState) {
        throw new Error("Missing code/state in callback");
      }
      // (2) state vérifié (anti-CSRF), comparaison stricte.
      if (!expectedState || returnedState !== expectedState) {
        throw new Error("State mismatch");
      }
      if (!verifier || !expectedNonce) {
        throw new Error("Missing PKCE verifier/nonce (session expired)");
      }

      const origin = window.location.origin;
      const clientId = resolveClientId(origin);
      const redirectUri = resolveRedirectUri(origin);

      // (a) Échange code -> tokens (PKCE, client public auth_method none).
      const tokenRes = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "application/json"
        },
        body: buildTokenRequestBody({ code, clientId, redirectUri, codeVerifier: verifier })
      });
      if (!tokenRes.ok) {
        throw new Error(`Token endpoint ${tokenRes.status}`);
      }
      const tokens = (await tokenRes.json()) as TokenResponse;
      if (!tokens.id_token || !tokens.access_token) {
        throw new Error("Missing id_token/access_token");
      }

      // (b) Validation id_token : signature EdDSA + iss + aud + exp + nonce.
      const { payload } = await jwtVerify(tokens.id_token, getJwks(), {
        issuer: OAUTH_ISSUER,
        audience: clientId,
        algorithms: ["EdDSA"],
        requiredClaims: ["exp"],
        clockTolerance: "5s"
      });
      // Audience stricte : exactement notre client_id (rejette les tokens multi-audience).
      const aud = payload.aud;
      const audOk =
        aud === clientId || (Array.isArray(aud) && aud.length === 1 && aud[0] === clientId);
      if (!audOk) {
        throw new Error("id_token audience mismatch");
      }
      if (typeof payload.sub !== "string" || payload.sub.length === 0) {
        throw new Error("id_token without valid sub");
      }
      if (payload.nonce !== expectedNonce) {
        throw new Error("Nonce mismatch");
      }

      // Clé de compte = (iss, sub), tirée du token vérifié.
      const iss = typeof payload.iss === "string" ? payload.iss : OAUTH_ISSUER;
      const sub = payload.sub;

      // (c) Profil via userinfo (access token, audience userinfo). Décoratif.
      let name = typeof payload.name === "string" ? payload.name : undefined;
      let email = typeof payload.email === "string" ? payload.email : undefined;
      let picture = typeof payload.picture === "string" ? payload.picture : undefined;
      // L'appel réseau est tolérant (échec = profil non enrichi, session OK)…
      let info: Record<string, unknown> | null = null;
      try {
        const infoRes = await fetch(USERINFO_ENDPOINT, {
          headers: { authorization: `Bearer ${tokens.access_token}`, accept: "application/json" }
        });
        if (infoRes.ok) info = (await infoRes.json()) as Record<string, unknown>;
      } catch {
        info = null; // userinfo est décoratif : un échec réseau ne casse rien.
      }
      if (info) {
        // …mais une incohérence de `sub` est suspecte : on échoue la session.
        if (info.sub && String(info.sub) !== sub) {
          throw new Error("userinfo sub mismatch");
        }
        if (typeof info.name === "string") name = info.name;
        if (typeof info.email === "string") email = info.email;
        if (typeof info.picture === "string") picture = info.picture;
      }

      // Session EN MÉMOIRE uniquement.
      this.#accessToken = tokens.access_token;
      this.user = { iss, sub, name, email, picture };
      this.status = "authed";
      return true;
    } catch {
      // (4) tout échec = pas de session. On ne logue PAS le détail (peut
      // contenir des fragments de token).
      this.#accessToken = undefined;
      this.user = undefined;
      this.status = "anon";
      return false;
    }
  }

  /** logout = vider le store en mémoire (pas de RP-logout IdP). */
  logout(): void {
    this.#accessToken = undefined;
    this.user = undefined;
    this.status = "anon";
    if (typeof window !== "undefined") clearTransient();
  }
}

export const auth = new AuthStore();
