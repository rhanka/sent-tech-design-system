import { describe, expect, it } from "vitest";
import {
  AUTHORIZE_ENDPOINT,
  CLIENT_ID_PROD,
  CLIENT_ID_TEST,
  OAUTH_SCOPES,
  base64UrlEncode,
  buildAuthorizeUrl,
  buildTokenRequestBody,
  createCodeVerifier,
  deriveCodeChallenge,
  resolveClientId,
  resolveRedirectUri
} from "./oauth";

describe("base64UrlEncode", () => {
  it("encodes without padding and with URL-safe alphabet", () => {
    // 0xFB 0xFF -> standard base64 "+/8=" ; url-safe sans padding -> "-_8".
    const out = base64UrlEncode(new Uint8Array([0xfb, 0xff]));
    expect(out).toBe("-_8");
    expect(out).not.toMatch(/[+/=]/);
  });
});

describe("PKCE S256", () => {
  it("derives challenge = base64url(SHA-256(verifier)) — known RFC 7636 vector", async () => {
    // Vecteur de l'annexe B du RFC 7636.
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    const challenge = await deriveCodeChallenge(verifier);
    expect(challenge).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });

  it("matches an independent WebCrypto SHA-256 of the verifier", async () => {
    const verifier = createCodeVerifier();
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    const expected = base64UrlEncode(new Uint8Array(digest));
    expect(await deriveCodeChallenge(verifier)).toBe(expected);
  });

  it("produces a high-entropy verifier (43 url-safe chars from 32 bytes)", () => {
    const v = createCodeVerifier();
    expect(v).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(createCodeVerifier()).not.toBe(v);
  });
});

describe("resolveClientId / resolveRedirectUri", () => {
  it("selects the TEST client on localhost", () => {
    expect(resolveClientId("http://localhost:5173")).toBe(CLIENT_ID_TEST);
    expect(resolveClientId("http://127.0.0.1:5173")).toBe(CLIENT_ID_TEST);
  });

  it("selects the PROD client on the deployed origin", () => {
    expect(resolveClientId("https://design-system.sent-tech.ca")).toBe(CLIENT_ID_PROD);
  });

  it("derives redirect_uri = origin + /auth/callback", () => {
    expect(resolveRedirectUri("http://localhost:5173")).toBe("http://localhost:5173/auth/callback");
    expect(resolveRedirectUri("https://design-system.sent-tech.ca")).toBe(
      "https://design-system.sent-tech.ca/auth/callback"
    );
  });
});

describe("buildAuthorizeUrl", () => {
  it("includes every required OAuth/PKCE parameter", () => {
    const url = new URL(
      buildAuthorizeUrl({
        clientId: CLIENT_ID_TEST,
        redirectUri: "http://localhost:5173/auth/callback",
        state: "the-state",
        nonce: "the-nonce",
        codeChallenge: "the-challenge"
      })
    );
    expect(`${url.origin}${url.pathname}`).toBe(AUTHORIZE_ENDPOINT);
    const p = url.searchParams;
    expect(p.get("response_type")).toBe("code");
    expect(p.get("client_id")).toBe(CLIENT_ID_TEST);
    expect(p.get("redirect_uri")).toBe("http://localhost:5173/auth/callback");
    expect(p.get("scope")).toBe(OAUTH_SCOPES);
    expect(p.get("scope")).toBe("openid profile email");
    expect(p.get("state")).toBe("the-state");
    expect(p.get("nonce")).toBe("the-nonce");
    expect(p.get("code_challenge")).toBe("the-challenge");
    expect(p.get("code_challenge_method")).toBe("S256");
  });
});

describe("buildTokenRequestBody", () => {
  it("builds a public-client (auth_method none) PKCE token request", () => {
    const body = buildTokenRequestBody({
      code: "abc",
      clientId: CLIENT_ID_PROD,
      redirectUri: "https://design-system.sent-tech.ca/auth/callback",
      codeVerifier: "the-verifier"
    });
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code")).toBe("abc");
    expect(body.get("redirect_uri")).toBe("https://design-system.sent-tech.ca/auth/callback");
    expect(body.get("client_id")).toBe(CLIENT_ID_PROD);
    expect(body.get("code_verifier")).toBe("the-verifier");
    // Client public : pas de secret transmis.
    expect(body.get("client_secret")).toBeNull();
  });
});
