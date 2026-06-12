// Route de callback OAuth : NE DOIT PAS être prérendue ni rendue côté serveur.
//
// Le site docs est exporté en statique (adapter-static, fallback 404.html).
// Cette route reçoit `?code&state` de l'IdP et exécute du code 100% navigateur
// (WebCrypto/PKCE, sessionStorage, jose). En la sortant du prérendu (prerender
// = false) ET du SSR (ssr = false), adapter-static la sert via le fallback en
// routage client (SPA) : pas de rendu serveur => l'export statique ne casse pas.
// (C'est précisément ce qui faisait échouer le build précédent.)
export const prerender = false;
export const ssr = false;
