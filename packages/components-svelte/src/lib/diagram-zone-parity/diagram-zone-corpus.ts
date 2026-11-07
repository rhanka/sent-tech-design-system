import { execFileSync as gitShowFile } from "node:child_process";
import { createHash as sha256 } from "node:crypto";

/**
 * DC-2 static-half parity corpus — transcribed once from the hrpn frozen
 * SVG at the pinned commit (read-only reference repo, `git show`):
 *   repo /home/antoinefa/src/airbus-genair-hrpolnav @ e5eaca3
 *   - docs/architecture/hrpn/frozen-20261022/HRPN-target-architecture.svg
 *     (scene S2-target; sha256 asserted by the test)
 *   - docs/ard/decision/focus/governance-kit/hrpn/render.js (foldedCard,
 *     renderHrpnSvg; sha256 asserted)
 *   - docs/ard/decision/focus/governance-kit/hrpn/FOLDED-CARD-HACKS.md
 *     (the hack list no DS code may reproduce; sha256 asserted)
 *
 * The seven collapsed zones (data-collapsed="true") carry: the
 * `diagram-card-box` rect (460 × 200, rx 0) at the zone position, the
 * HTML service-node card (kicker / title / function / detail / rule /
 * footer) and the `data-group-toggle` foreignObject at top right
 * (y = box.y + 10, flush right). The expanded PEOPLE zone carries the
 * frame rect, header rule, icon, kicker/title/subtitle and toggle.
 */

export const HRPN_REPO = "/home/antoinefa/src/airbus-genair-hrpolnav";
export const HRPN_REV = "e5eaca3";

/** Read one pinned file from the read-only reference repo (test-only). */
export function readHrpnPinned(path: string): Buffer | null {
  try {
    return gitShowFile("git", ["-C", HRPN_REPO, "show", `${HRPN_REV}:${path}`], {
      encoding: "buffer",
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

export function sha256Hex(bytes: Buffer): string {
  return sha256("sha256").update(bytes).digest("hex");
}
export const HRPN_FROZEN_PATH =
  "docs/architecture/hrpn/frozen-20261022/HRPN-target-architecture.svg";
export const HRPN_RENDER_PATH = "docs/ard/decision/focus/governance-kit/hrpn/render.js";
export const HRPN_HACKS_PATH = "docs/ard/decision/focus/governance-kit/hrpn/FOLDED-CARD-HACKS.md";

export const HRPN_FROZEN_SHA256 =
  "8ba33e85932797e0a328caec4649809889aedad67813d67c004d10ac9ed67c11";
export const HRPN_RENDER_SHA256 =
  "fd06c8438c75ea1d61a9079b6a8f454a204f460d84c94337ef53fa9ac2c7fec4";
export const HRPN_HACKS_SHA256 =
  "58f61334f585863463818dbc00092e89fa53623be57014794332e8cb140a3793";

export interface FrozenCollapsedZone {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly kicker: string;
  readonly title: string;
  /** The zone subtitle: the frozen function + detail lines joined. */
  readonly subtitle: string;
  /** Frozen wrap at 396 px: [function line, ...detail lines]. */
  readonly frozenLines: readonly string[];
  readonly footer: string;
  readonly icon: string;
  readonly tone: string;
  /** Frozen toggle foreignObject position (flush right, top margin 10). */
  readonly toggleX: number;
  readonly toggleY: number;
}

/** Collapsed zones of scene S2-target, transcribed from the frozen SVG. */
export const COLLAPSED_ZONES: readonly FrozenCollapsedZone[] = [
  {
    id: "MSGZ",
    x: 700,
    y: 426.5625,
    kicker: "PS",
    title: "Pub/Sub",
    subtitle: "Pub/Sub topic · Pub/Sub push",
    frozenLines: ["Pub/Sub topic · Pub/Sub push"],
    footer: "service: Pub/Sub",
    icon: "link",
    tone: "neutral",
    toggleX: 1102.65600368403,
    toggleY: 436.5625,
  },
  {
    id: "VERTEXZ",
    x: 1988,
    y: 1152.75,
    kicker: "VAI",
    title: "Vertex AI",
    subtitle: "RAG Engine · Model Gemini · Model Armor",
    frozenLines: ["RAG Engine · Model Gemini · Model", "Armor"],
    footer: "service: Vertex AI",
    icon: "brain",
    tone: "neutral",
    toggleX: 2390.65600368403,
    toggleY: 1162.75,
  },
  {
    id: "INGZ",
    x: 700,
    y: 722.5625,
    kicker: "HRPN",
    title: "Ingestion",
    subtitle: "Job Drive sync · Job RAG import",
    frozenLines: ["Job Drive sync · Job RAG import"],
    footer: "repo: HRPN",
    icon: "server",
    tone: "neutral",
    toggleX: 1102.65600368403,
    toggleY: 732.5625,
  },
  {
    id: "PCICD",
    x: 700,
    y: 1606.9375,
    kicker: "GENAI PCP PLATFORM",
    title: "CI/CD",
    subtitle: "project_id_cicd",
    frozenLines: ["project_id_cicd"],
    footer: "service: GenAI PCP Platform",
    icon: "server",
    tone: "neutral",
    toggleX: 1102.65600368403,
    toggleY: 1616.9375,
  },
  {
    id: "OBSZ",
    x: 1320,
    y: 1606.9375,
    kicker: "GENAI PCP PLATFORM",
    title: "Observability",
    subtitle: "Logging audit · Logs 1 year · BigQuery linked · Tracing Phoenix",
    frozenLines: ["Logging audit · Logs 1 year · BigQuery", "linked · Tracing Phoenix"],
    footer: "service: GenAI PCP Platform",
    icon: "shield",
    tone: "neutral",
    toggleX: 1722.65600368403,
    toggleY: 1616.9375,
  },
  {
    id: "GENSRC",
    x: 684,
    y: 2235.3125,
    kicker: "GENAIR",
    title: "GenAiR sources",
    subtitle: "Template GenAiR · Agents template · IaC modules · Libs GenAiR",
    frozenLines: ["Template GenAiR · Agents template ·", "IaC modules · Libs GenAiR"],
    footer: "repo: GenAiR",
    icon: "server",
    tone: "neutral",
    toggleX: 1086.65600368403,
    toggleY: 2245.3125,
  },
  {
    id: "AWSCI",
    x: 1972,
    y: 2093.125,
    kicker: "AIRBUS AWS",
    title: "CI/CD",
    subtitle: "CI Jenkins · Registry JFrog",
    frozenLines: ["CI Jenkins · Registry JFrog"],
    footer: "service: Airbus AWS",
    icon: "server",
    tone: "neutral",
    toggleX: 2374.65600368403,
    toggleY: 2103.125,
  },
];

/** The expanded PEOPLE zone of scene S2-target (frame at 0,0). */
export const EXPANDED_PEOPLE = {
  id: "PEOPLE",
  x: 0,
  y: 0,
  width: 492,
  height: 974.98125,
  kicker: "PPL",
  title: "Users and operators",
  titleLines: ["Users and", "operators"],
  subtitle: "Employees HR · Developers admin · HR content owners",
  subtitleLines: ["Employees HR · Developers admin · HR", "content owners"],
  icon: "people",
  tone: "neutral",
  // Frozen frame: rx 6, fill surface-subtle, stroke text-secondary 1.5.
  frameRx: 6,
  ruleX1: 16,
  ruleX2: 482,
  ruleY: 198.98125,
  iconX: 16,
  iconY: 36.890625,
  iconScale: 1.09375,
  kickerX: 92,
  kickerY: 38,
  titleX: 92,
  titleY: 76.59375,
  subtitleX: 16,
  subtitleY: 155.78125,
  toggleX: 434.65600368403017,
  toggleY: 10,
} as const;

/**
 * The hack list of FOLDED-CARD-HACKS.md (H1–H9 + C1–C5). Every entry is
 * banned from DS sources by the hack-absence scan: no folded-card drawing
 * (`diagram-card-box`), no kicker replacement, no icon-map mutation
 * (`groupIcons ??=`), no tint injection (`data-tint`), no title
 * pre-fitting (`FOLD_TITLE`, `data-long-title`, the 66 px padding hack),
 * no compact legend (`legendKeysSvg`, `compactLegend`), no title-case
 * overrides (`TITLE_OVERRIDES`), no foreignObject toggle with a CTM
 * sizing pass, no regex surgery on rendered SVG, no `+N` generation.
 */
export const BANNED_HACK_MARKERS = [
  "FOLD_TITLE",
  "data-long-title",
  "padding-right:66",
  "padding-right: 66",
  "data-tint",
  "diagram-card-box",
  "legendKeysSvg",
  "compactLegend",
  "TITLE_OVERRIDES",
  "foreignObject",
  "getScreenCTM",
  "groupIcons[",
  "??=",
  "data-frame-mount",
  "data-group-toggle",
  "cardFooter ??",
  "diagram-group-box",
] as const;
