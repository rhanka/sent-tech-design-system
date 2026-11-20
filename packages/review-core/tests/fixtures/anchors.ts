import type {
  ElementAnchorPayload,
  RegionAnchorPayload,
  TextAnchorPayload,
} from "../../src/index.js";

export const SIMPLE_TEXT_ANCHOR: TextAnchorPayload = {
  t: "text",
  q: {
    exact: "revenue grew 18% year-over-year",
    prefix: "In Q4, consolidated ",
    suffix: " across all core segments.",
  },
  pos: { start: 20, end: 51 },
  sel: "section:nth-of-type(1) > p:nth-of-type(1)",
  aid: "sec-summary",
  v: "1",
};

export const NON_ASCII_TEXT_ANCHOR: TextAnchorPayload = {
  t: "text",
  q: {
    exact: "« Résolu — marge opérationnelle à 42,5 € 🚀 » — 日本語レビュー",
    prefix: "Synthèse financière : ",
    suffix: " (vérifié par l’équipe).",
  },
  pos: { start: 22, end: 79 },
  sel: "article:nth-of-type(1) > p:nth-of-type(2)",
  v: "v2.1-fr",
};

export const SIMPLE_ELEMENT_ANCHOR: ElementAnchorPayload = {
  t: "element",
  sel: "section:nth-of-type(2) > figure:nth-of-type(1)",
  aid: "fig-revenue",
  v: "1",
};

export const SIMPLE_REGION_ANCHOR: RegionAnchorPayload = {
  t: "region",
  rect: { x: 0.125, y: 0.25, width: 0.5, height: 0.375 },
  v: "chart-v3",
};

/**
 * Text anchor whose encoded length with full 32-char prefix/suffix sits just
 * above 2048 characters, so trimming prefix/suffix alone brings it <= 2048
 * while preserving `exact` 100% verbatim.
 */
export const NEAR_CAP_CONTEXT_TRIM_ANCHOR: TextAnchorPayload = {
  t: "text",
  q: {
    exact: "A".repeat(1340),
    prefix: "P".repeat(32),
    suffix: "S".repeat(32),
  },
  pos: { start: 100, end: 1440 },
  sel: "main:nth-of-type(1) > section:nth-of-type(1) > p:nth-of-type(3)",
  aid: "block-near-cap",
  v: "1.0.0",
};

/**
 * Text anchor whose `exact` quote alone exceeds the 2048-char encoded cap,
 * forcing prefix/suffix removal first and then `exact` truncation with `pos` kept.
 */
export const OVER_CAP_EXACT_TRUNCATE_ANCHOR: TextAnchorPayload = {
  t: "text",
  q: {
    exact: "Long quoted paragraph sentence. ".repeat(80),
    prefix: "Leading context before selection.",
    suffix: "Trailing context after selection.",
  },
  pos: { start: 50, end: 2610 },
  sel: "article:nth-of-type(1) > p:nth-of-type(1)",
  v: "2",
};

/**
 * Multi-byte UTF-8 near-cap anchor made of 4-byte emoji (surrogate pairs in UTF-16).
 * Verifies UTF-8 byte expansion is accounted for and surrogate pairs are never split.
 */
export const OVER_CAP_EMOJI_ANCHOR: TextAnchorPayload = {
  t: "text",
  q: {
    exact: "🚀".repeat(500),
    prefix: "✨".repeat(40),
    suffix: "🧪".repeat(40),
  },
  pos: { start: 40, end: 1040 },
  sel: "div:nth-of-type(1) > p:nth-of-type(1)",
  v: "3",
};

/**
 * Minimal encoding still exceeds 2048 chars because metadata (`sel`) itself
 * cannot fit inside the cap — must be refused.
 */
export const UNENCODABLE_OVER_CAP_TEXT_ANCHOR: TextAnchorPayload = {
  t: "text",
  q: {
    exact: "x",
  },
  sel: Array.from({ length: 120 }, (_, i) => `div:nth-of-type(${i + 1})`).join(" > "),
  v: "1",
};

export const UNENCODABLE_OVER_CAP_ELEMENT_ANCHOR: ElementAnchorPayload = {
  t: "element",
  sel: Array.from({ length: 120 }, (_, i) => `section:nth-of-type(${i + 1})`).join(" > "),
  v: "1",
};

// ── Re-render HTML fixtures ──

export const RENDER_V1_HTML = `
  <article data-review-root>
    <header data-anchor-id="hdr-title">
      <h1>Quarterly Review — Q4</h1>
    </header>
    <section data-anchor-id="sec-exec">
      <p>Executive summary: <strong>revenue grew 18%</strong> across core lines.</p>
      <p>Status: Approved by finance committee.</p>
    </section>
    <section>
      <p>First note: Status: Approved for internal circulation.</p>
      <p>Obsolete paragraph that will be deleted in v2.</p>
      <p>Key   FINDING with irregular spacing and CASE.</p>
      <figure data-anchor-id="fig-margin">
        <figcaption>Operating margin chart</figcaption>
      </figure>
      <blockquote>Standalone element without anchor id.</blockquote>
    </section>
  </article>
`;

/**
 * V2 re-render:
 * - New banner inserted at top (shifts all positional selectors and offsets)
 * - `sec-exec` moved to the bottom (aid still present; text intact)
 * - Obsolete paragraph deleted (the following paragraph shifts into its nth-of-type slot!)
 * - "Key   FINDING" normalised to "key finding" (tests fuzzy match after DOM shift)
 * - `fig-margin` moved inside a wrapper div (aid still resolves)
 * - `blockquote` removed (element anchor without aid orphans!)
 */
export const RENDER_V2_HTML = `
  <article data-review-root>
    <div class="banner"><p>Newly inserted executive alert banner.</p></div>
    <header data-anchor-id="hdr-title">
      <h1>Quarterly Review — Q4 (Revised)</h1>
    </header>
    <section>
      <p>First note: Status: Approved for internal circulation.</p>
      <p>key finding with irregular spacing and case.</p>
      <div class="wrapper">
        <figure data-anchor-id="fig-margin">
          <figcaption>Operating margin chart v2</figcaption>
        </figure>
      </div>
    </section>
    <section data-anchor-id="sec-exec">
      <p>Executive summary: <strong>revenue grew 18%</strong> across core lines.</p>
      <p>Status: Approved by finance committee.</p>
    </section>
  </article>
`;
