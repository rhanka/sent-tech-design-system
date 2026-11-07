/**
 * DC-1 parity corpus — transcribed once from the pinned reference.
 *
 * Source: sentropic 4138a0ec `docs/governance/kit/src/governance-central.js`
 * (sha256 8648b0935735a386afa843e7221234406c1c61fbe48fa5bc7c4172743b0c3f1c,
 * built via `buildGovernanceCentral()`) with FR/EN strings resolved through the
 * pinned `t()` (`i18n.js` + `i18n-en.json` at the same commit). The portable
 * `docs/governance/governance-r11-portable.html` (sha256
 * 831cbdee9bb5820e7e19ed55c942522a5848c402db9be0c89d87d02559bf6f35)
 * renders this same scene; the harness re-asserts both shas when the
 * sentropic checkout is readable and treats a mismatch as a fixture error.
 *
 * Every node measures 460 x 200 in the reference builder (atomic box).
 * Collapsed portable frames (460 x 272, DIF-01) are excluded from box
 * comparison by name and are not part of this corpus.
 */
export interface CorpusCard {
  readonly id: string;
  readonly parentId: string;
  readonly width: number;
  readonly height: number;
  readonly fr: { readonly kicker: string; readonly title: string; readonly fn: string; readonly detail: string; readonly footer: string };
  readonly en: { readonly kicker: string; readonly title: string; readonly fn: string; readonly detail: string; readonly footer: string };
  readonly icon: string;
  readonly tone: string;
}
export const PORTABLE_SHA256 = "831cbdee9bb5820e7e19ed55c942522a5848c402db9be0c89d87d02559bf6f35";
export const CENTRAL_SHA256 = "8648b0935735a386afa843e7221234406c1c61fbe48fa5bc7c4172743b0c3f1c";
export const CARD_SOURCE_SHA256 = "8e1110f1a60b1d49630e29e5f479c69ee691588fe449c9ba2d976ecd7e2e475b";
export const ICONS_SOURCE_SHA256 = "7a6b5c95fdc90dddf6340a2fc7f9aecce5010c393101b42a7d97826fe2ad1209";
/** diagram-presentation@1 pin consumed by DC-1 (recorded §4.2 rule). */
export const DIAGRAM_PRESENTATION_PIN = {
  id: "diagram-presentation",
  version: "1",
  contractContent: "74dadb9c31fff7653ca31692d8db3cfea782baea8d9268a3c20982ea8ab0aeae",
  schemaDigest: "f13d595793e17e1e4740c9203b19d8381fc55b90e37121d61f5037cb79f0281a",
};
/** Canonical-JSON sha256 of the 28-glyph registry (drift detector). */
export const DIAGRAM_REGISTRY_SHA256 = "bc8639a1e3416615bc78725344d71f66ca28d38b99df8611877d43d27f82af3e";
export const CORPUS_NODES: readonly CorpusCard[] = [
  { id: "h2a-roles", parentId: "h2a", width: 460, height: 200,
    fr: { kicker: "ORGANISATION", title: "Rôles et mandats", fn: "Organisation humains-agents · C01", detail: "RACI · acteurs vérifiés · scope-guard", footer: "service: h2a" },
    en: { kicker: "ORGANISATION", title: "Roles and mandates", fn: "Human–agent organisation · C01", detail: "RACI · verified actors · scope-guard", footer: "service: h2a" },
    icon: "people", tone: "identity" },
  { id: "h2a-focus", parentId: "h2a", width: 460, height: 200,
    fr: { kicker: "ORGANISATION", title: "Décision → Focus", fn: "Schéma et skill du dossier · C03", detail: "Dossier Focus · choix propriétaire", footer: "service: h2a" },
    en: { kicker: "ORGANISATION", title: "Decision → Focus", fn: "Dossier schema and skill · C03", detail: "DecisionDossierDocument: owner choice", footer: "service: h2a" },
    icon: "people", tone: "proposal" },
  { id: "h2a-track", parentId: "h2a", width: 460, height: 200,
    fr: { kicker: "ORGANISATION", title: "Demandes → Track", fn: "WP · items · acceptation · C02/C04", detail: "Journal append-only · demande → prod", footer: "service: h2a" },
    en: { kicker: "ORGANISATION", title: "Requests → Track", fn: "WPs · items · acceptance · C02/C04", detail: "Append-only log · request → prod", footer: "service: h2a" },
    icon: "people", tone: "proposal" },
  { id: "h2a-agent", parentId: "h2a", width: 460, height: 200,
    fr: { kicker: "ORGANISATION", title: "Agents, session, inbox", fn: "PTY · harness · MCP ui://", detail: "Conduite · feedback · équipement", footer: "service: h2a" },
    en: { kicker: "ORGANISATION", title: "Agents, session, inbox", fn: "PTY · harness · MCP ui://", detail: "Coordination · feedback · tooling", footer: "service: h2a" },
    icon: "people", tone: "neutral" },
  { id: "surf-ai", parentId: "surfaces", width: 460, height: 200,
    fr: { kicker: "ACCÈS", title: "Fournisseurs IA", fn: "ChatGPT · Gemini · Claude · Muse", detail: "Cowork/MCP : qualifier chaque liaison", footer: "service: Surfaces d’accès" },
    en: { kicker: "ACCESS", title: "AI providers", fn: "ChatGPT · Gemini · Claude · Muse", detail: "Cowork/MCP: qualify each connection", footer: "service: Surfaces d’accès" },
    icon: "window", tone: "proposal" },
  { id: "surf-cowork", parentId: "surfaces", width: 460, height: 200,
    fr: { kicker: "ACCÈS", title: "Poste Cowork", fn: "cowork-desktop et cowork-bridge", detail: "Consentement · priorité humaine 60 s", footer: "service: Surfaces d’accès" },
    en: { kicker: "ACCESS", title: "Cowork workstation", fn: "cowork-desktop and cowork-bridge", detail: "Consent · human priority 60 s", footer: "service: Surfaces d’accès" },
    icon: "window", tone: "neutral" },
  { id: "surf-cli", parentId: "surfaces", width: 460, height: 200,
    fr: { kicker: "ACCÈS", title: "Poste CLI", fn: "h2a-cli · @sentropic/harness", detail: "Checkout local · sessions mandatées", footer: "service: Surfaces d’accès" },
    en: { kicker: "ACCESS", title: "CLI workstation", fn: "h2a-cli · @sentropic/harness", detail: "Local checkout · mandated sessions", footer: "service: Surfaces d’accès" },
    icon: "window", tone: "neutral" },
  { id: "surf-cloud", parentId: "surfaces", width: 460, height: 200,
    fr: { kicker: "ACCÈS", title: "Apps Sentropic/tiers", fn: "OpenERP · nc-fullstack · CV", detail: "Catalogue ↔ instances hébergées", footer: "service: Surfaces d’accès" },
    en: { kicker: "ACCESS", title: "Sentropic & other apps", fn: "OpenERP · nc-fullstack · CV", detail: "Catalog ↔ hosted instances", footer: "service: Surfaces d’accès" },
    icon: "window", tone: "proposal" },
  { id: "cm-apis", parentId: "cluster-mesh", width: 460, height: 200,
    fr: { kicker: "SERVICE", title: "1. API serveur", fn: "Façades HTTP / SSE / MCP", detail: "Transport · contrats d’accès", footer: "service: Sentropic" },
    en: { kicker: "SERVICE", title: "1. Server API", fn: "HTTP / SSE / MCP façades", detail: "Transport and service access contracts", footer: "service: Sentropic" },
    icon: "server", tone: "neutral" },
  { id: "cm-workflow", parentId: "cluster-mesh", width: 460, height: 200,
    fr: { kicker: "SERVICE", title: "2. Workflows agents", fn: "Sessions CLI, Cowork, ADK, etc.", detail: "WorkspaceBindingStore · PTY/API", footer: "service: Sentropic" },
    en: { kicker: "SERVICE", title: "2. Agent workflows", fn: "CLI, Cowork, ADK sessions, etc.", detail: "WorkspaceBindingStore · PTY/API", footer: "service: Sentropic" },
    icon: "server", tone: "neutral" },
  { id: "mcp-comments", parentId: "cat-mcp", width: 460, height: 200,
    fr: { kicker: "MCP · OUTILS", title: "Harnais · outils h2a", fn: "annotate, Track, Focus, sessions, etc.", detail: "Outils h2a · annotation via comments", footer: "service: Sentropic" },
    en: { kicker: "MCP · TOOLS", title: "Harness · h2a tools", fn: "annotate, Track, Focus, sessions, etc.", detail: "h2a tools · annotation via comments", footer: "service: Sentropic" },
    icon: "link", tone: "neutral" },
  { id: "mcp-tools", parentId: "cat-mcp", width: 460, height: 200,
    fr: { kicker: "MCP · OUTILS", title: "Mémoires/ontologies", fn: "6 outils mémoire · ontology_call", detail: "Contrats mémoire et ontologies", footer: "service: Sentropic" },
    en: { kicker: "MCP · TOOLS", title: "Memories/ontologies", fn: "6 memory tools · ontology_call", detail: "Memory and ontology contracts", footer: "service: Sentropic" },
    icon: "link", tone: "proposal" },
  { id: "mcp-connectors", parentId: "cat-mcp", width: 460, height: 200,
    fr: { kicker: "MCP · OUTILS", title: "Connecteurs à broker", fn: "Gmail · GChat · Atlassian · GitHub", detail: "Notion·Slack·OpenERP·WaveApps·Stripe", footer: "service: Sentropic" },
    en: { kicker: "MCP · TOOLS", title: "Connectors to broker", fn: "Gmail · GChat · Atlassian · GitHub", detail: "Notion·Slack·OpenERP·WaveApps·Stripe", footer: "service: Sentropic" },
    icon: "link", tone: "proposal" },
  { id: "cat-ai", parentId: "cm-catalog", width: 460, height: 200,
    fr: { kicker: "CATALOGUE", title: "Catalogue IA", fn: "LLM, juge, vision/SAM-YOLO, TTS, STT", detail: "Mesh/gateway; JEV branche; IA à valider", footer: "service: Sentropic" },
    en: { kicker: "CATALOGUE", title: "AI catalog", fn: "LLM, judge, vision/SAM-YOLO, TTS, STT", detail: "Mesh/gateway; JEV branch; validate AI", footer: "service: Sentropic" },
    icon: "brain", tone: "proposal" },
  { id: "cat-resources", parentId: "cm-catalog", width: 460, height: 200,
    fr: { kicker: "CATALOGUE", title: "Catalogue Agents", fn: "Skills · tools · agents · workflows · apps", detail: "Artefacts · C08", footer: "service: Sentropic" },
    en: { kicker: "CATALOGUE", title: "Agent catalog", fn: "Skills · tools · agents · workflows · apps", detail: "Artifacts · C08", footer: "service: Sentropic" },
    icon: "robot", tone: "proposal" },
  { id: "cat-ui", parentId: "cm-catalog", width: 460, height: 200,
    fr: { kicker: "CATALOGUE", title: "UI · canvas et apps", fn: "bpmn-canvas · templater Sentropic", detail: "UI prod · artifacts · MCP/ui://", footer: "service: Sentropic" },
    en: { kicker: "CATALOGUE", title: "UI · canvases/apps", fn: "bpmn-canvas · Sentropic templater", detail: "Production UI · artifacts · MCP/ui://", footer: "service: Sentropic" },
    icon: "window", tone: "proposal" },
  { id: "store-models", parentId: "cm-storage", width: 460, height: 200,
    fr: { kicker: "STOCKAGE", title: "Modèles · sérialisation", fn: "Transactionnel · analytique · graphe live", detail: "Graphe live en base · annotations", footer: "service: Sentropic" },
    en: { kicker: "STORAGE", title: "Model serialization", fn: "Transactional · analytical · live graph", detail: "Live graph in DB · annotations", footer: "service: Sentropic" },
    icon: "db", tone: "proposal" },
  { id: "store-artifacts", parentId: "cm-storage", width: 460, height: 200,
    fr: { kicker: "STOCKAGE", title: "Artefacts", fn: "@sentropic/artifacts · SHA-256", detail: "Blobs/canvas/UI · cycle DL-8/13/17", footer: "service: Sentropic" },
    en: { kicker: "STORAGE", title: "Artifacts", fn: "@sentropic/artifacts · SHA-256", detail: "Blobs/canvas/UI · DL-8/13/17 lifecycle", footer: "service: Sentropic" },
    icon: "db", tone: "neutral" },
  { id: "sec-access", parentId: "cm-security", width: 460, height: 200,
    fr: { kicker: "CONFIANCE", title: "Accès et sièges", fn: "IAM · NHI · 2FA · droits · consentement", detail: "MFA #695 · garde centrale #596", footer: "service: Sentropic" },
    en: { kicker: "TRUST", title: "Access & seats", fn: "IAM · NHI · 2FA · rights · consent", detail: "MFA #695 · central custody #596", footer: "service: Sentropic" },
    icon: "shield", tone: "identity" },
  { id: "sec-observe", parentId: "cm-security", width: 460, height: 200,
    fr: { kicker: "CONFIANCE", title: "Observabilité et audit", fn: "Logs · métriques · traces · reçus", detail: "auditId · soumis/commis/accepté", footer: "service: Sentropic" },
    en: { kicker: "TRUST", title: "Audit & observability", fn: "Logs · metrics · traces · receipts", detail: "auditId · submitted/committed/accepted", footer: "service: Sentropic" },
    icon: "shield", tone: "identity" },
  { id: "cluster-instances", parentId: "cm-cluster", width: 460, height: 200,
    fr: { kicker: "INTER-INSTANCE", title: "Instances Sentropic", fn: "Contrats et échanges par API", detail: "API : exposition · Cluster : intégration", footer: "service: Sentropic" },
    en: { kicker: "INTER-INSTANCE", title: "Sentropic instances", fn: "Contracts & exchanges via API", detail: "API: exposure · Cluster: integration", footer: "service: Sentropic" },
    icon: "link", tone: "neutral" },
  { id: "cluster-infra", parentId: "cm-cluster", width: 460, height: 200,
    fr: { kicker: "PROVIDERS", title: "Cloud et registres", fn: "K8s · mails transactionnels · cloud", detail: "App Store · agents · MCP · déploiement", footer: "service: Sentropic" },
    en: { kicker: "PROVIDERS", title: "Cloud & registries", fn: "K8s · transactional email · cloud", detail: "App Store · agents · MCP · deployment", footer: "service: Sentropic" },
    icon: "cloud", tone: "proposal" },
  { id: "eng-memory", parentId: "engram", width: 460, height: 200,
    fr: { kicker: "CONNAISSANCE", title: "Mémoire live agents", fn: "D3 trans. · D1=C analyse · Git/D10", detail: "Surfaces sans backend ni pilote natif", footer: "service: Engram" },
    en: { kicker: "KNOWLEDGE", title: "Live agent memory", fn: "D3 trans. · D1=C analytics · Git/D10", detail: "Surfaces: no backend or native driver", footer: "service: Engram" },
    icon: "db", tone: "proposal" },
  { id: "eng-ontologies", parentId: "engram", width: 460, height: 200,
    fr: { kicker: "CONNAISSANCE", title: "Ontologies · WP9", fn: "dev · track · archi · temps D1=C", detail: "Profils gouvernés · exports typés", footer: "service: Engram" },
    en: { kicker: "KNOWLEDGE", title: "Ontologies · WP9", fn: "dev · track · archi · D1=C time", detail: "Governed profiles · typed exports", footer: "service: Engram" },
    icon: "db", tone: "proposal" },
  { id: "ds-annotations", parentId: "design-system", width: 460, height: 200,
    fr: { kicker: "DESIGN SYSTEM", title: "Annotation", fn: "Présentation · ancre opaque", detail: "Propositions → modèle Sentropic · G3", footer: "service: Design System" },
    en: { kicker: "DESIGN SYSTEM", title: "Annotation", fn: "Presentation · opaque anchor", detail: "Proposals → Sentropic model · G3", footer: "service: Design System" },
    icon: "window", tone: "proposal" },
  { id: "ds-diagram", parentId: "design-system", width: 460, height: 200,
    fr: { kicker: "DESIGN SYSTEM", title: "Diagramme", fn: "Graphe × layout × présentation", detail: "Gigogne · éditions atomiques · JS", footer: "service: Design System" },
    en: { kicker: "DESIGN SYSTEM", title: "Diagram", fn: "Graph × layout × presentation", detail: "Nested views · atomic edits · JS", footer: "service: Design System" },
    icon: "window", tone: "proposal" },
  { id: "ds-dossier", parentId: "design-system", width: 460, height: 200,
    fr: { kicker: "DESIGN SYSTEM", title: "Dossier de décision", fn: "Rendu du schéma et de la skill Focus", detail: "<st-decision-dossier> · C03/C09", footer: "service: Design System" },
    en: { kicker: "DESIGN SYSTEM", title: "Decision dossier", fn: "Rendering the Focus schema and skill", detail: "<st-decision-dossier> · C03/C09", footer: "service: Design System" },
    icon: "window", tone: "proposal" },
  { id: "ds-components", parentId: "design-system", width: 460, height: 200,
    fr: { kicker: "DESIGN SYSTEM", title: "200+ composants UI", fn: "221 exports Svelte · thèmes · <st-*>", detail: "Canvas · offline sans CDN · C09", footer: "service: Design System" },
    en: { kicker: "DESIGN SYSTEM", title: "200+ UI components", fn: "221 Svelte exports · themes · <st-*>", detail: "Canvas · offline without a CDN · C09", footer: "service: Design System" },
    icon: "window", tone: "neutral" }
];
