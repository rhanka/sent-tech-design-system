// ─────────────────────────────────────────────────────────────────────────────
// OAuth/OIDC : primitives PURES (sans runes, sans jose, sans état).
//
// Ce module ne contient que des fonctions déterministes / cryptographiques
// testables unitairement : configuration de l'IdP, PKCE S256, génération
// d'aléa (state/nonce/verifier), construction de l'URL d'autorisation.
// L'état de session (tokens, profil) vit dans `auth.svelte.ts` : JAMAIS ici.
//
// Paramètres IdP vérifiés (Sent Tech) :
//   discovery : https://auth.sent-tech.ca/.well-known/openid-configuration
//   issuer    : https://auth.sent-tech.ca
//   authorize : https://auth.sent-tech.ca/api/v1/auth/oauth/authorize
//   token     : https://auth.sent-tech.ca/api/v1/auth/oauth/token
//   userinfo  : https://auth.sent-tech.ca/api/v1/auth/oauth/userinfo
//   jwks      : https://auth.sent-tech.ca/.well-known/jwks.json (EdDSA)
//   PKCE S256 ; token_endpoint_auth_method=none ; scopes "openid profile email"
//   pas de refresh ; audience de l'access token = userinfo.
// ─────────────────────────────────────────────────────────────────────────────

export const OAUTH_ISSUER = "https://auth.sent-tech.ca";
export const AUTHORIZE_ENDPOINT = `${OAUTH_ISSUER}/api/v1/auth/oauth/authorize`;
export const TOKEN_ENDPOINT = `${OAUTH_ISSUER}/api/v1/auth/oauth/token`;
export const USERINFO_ENDPOINT = `${OAUTH_ISSUER}/api/v1/auth/oauth/userinfo`;
export const JWKS_URI = "https://auth.sent-tech.ca/.well-known/jwks.json";

export const OAUTH_SCOPES = "openid profile email";

/** Client public TEST (localhost dev). */
export const CLIENT_ID_TEST = "design-system-test";
/** Client public PROD (design-system.sent-tech.ca). */
export const CLIENT_ID_PROD = "design-system";

/**
 * Sélectionne le client_id selon l'origine du navigateur.
 * localhost (n'importe quel port de dev) -> client TEST ; tout le reste -> PROD.
 * Le redirect_uri est dérivé de la même origine (voir resolveRedirectUri).
 */
export function resolveClientId(origin: string): string {
  try {
    const { hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return CLIENT_ID_TEST;
    }
  } catch {
    /* origine invalide : on retombe sur PROD (le plus restrictif côté IdP). */
  }
  return CLIENT_ID_PROD;
}

/** redirect_uri = `${origin}/auth/callback` (doit matcher l'enregistrement IdP). */
export function resolveRedirectUri(origin: string): string {
  return `${origin.replace(/\/$/, "")}/auth/callback`;
}

/** Encode des octets en base64url SANS padding (RFC 7636 / RFC 4648 §5). */
export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** N octets aléatoires cryptographiques, encodés base64url. */
export function randomBase64Url(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** PKCE code_verifier : 32 octets d'aléa crypto -> base64url (43 chars). */
export function createCodeVerifier(): string {
  return randomBase64Url(32);
}

/** `state` anti-CSRF (aléa crypto opaque). */
export function createState(): string {
  return randomBase64Url(32);
}

/** `nonce` anti-rejeu lié à l'id_token (aléa crypto opaque). */
export function createNonce(): string {
  return randomBase64Url(32);
}

/**
 * PKCE S256 : code_challenge = base64url( SHA-256( ASCII(code_verifier) ) ).
 * Utilise WebCrypto (présent en navigateur ET en Node 18+ / vitest).
 */
export async function deriveCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

export interface AuthorizeUrlParams {
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
  scope?: string;
}

/**
 * Construit l'URL d'autorisation (response_type=code + PKCE S256).
 * Inclut TOUJOURS state, nonce, code_challenge, code_challenge_method=S256.
 */
export function buildAuthorizeUrl(params: AuthorizeUrlParams): string {
  const url = new URL(AUTHORIZE_ENDPOINT);
  const search = url.searchParams;
  search.set("response_type", "code");
  search.set("client_id", params.clientId);
  search.set("redirect_uri", params.redirectUri);
  search.set("scope", params.scope ?? OAUTH_SCOPES);
  search.set("state", params.state);
  search.set("nonce", params.nonce);
  search.set("code_challenge", params.codeChallenge);
  search.set("code_challenge_method", "S256");
  return url.toString();
}

export interface TokenExchangeParams {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}

/**
 * Corps x-www-form-urlencoded pour l'échange code -> token.
 * Client public (auth_method none) : pas de client_secret, on envoie le
 * code_verifier PKCE à la place.
 */
export function buildTokenRequestBody(params: TokenExchangeParams): URLSearchParams {
  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", params.code);
  body.set("redirect_uri", params.redirectUri);
  body.set("client_id", params.clientId);
  body.set("code_verifier", params.codeVerifier);
  return body;
}
