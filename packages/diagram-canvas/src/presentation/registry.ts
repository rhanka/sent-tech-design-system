/**
 * Diagram pictogram registry — the blue duotone family (DC-1).
 *
 * Spec: spec/SPEC_EVOL_DS_DIAGRAM_CARDS.md §9. One family, drawn identically
 * in cards and zones at the 70 px icon box: `viewBox="0 0 64 64"`, canonical
 * base diamond `M8 53L32 44L56 53L32 62Z`, three layers (base / face / line),
 * face stroke 1.5, line stroke 2.5. Layer colours resolve through the
 * `diagramIcon` component tokens; no per-glyph colour, no raw hex here.
 *
 * Framework-neutral data: no Svelte import, so staged framework adapters
 * (§12.6) reuse these path records without re-drawing a glyph. Provenance
 * per glyph lives in PROVENANCE.md next to this file.
 */

export interface DiagramGlyph {
  /** Canonical base diamond path (identical for every glyph). */
  readonly base: string;
  /** Glyph face path (fill + stroke layer). */
  readonly face: string;
  /** Glyph detail path (stroke-only layer). Absent when the glyph has none. */
  readonly line?: string;
  /**
   * When true, the detail line strokes in the info accent instead of the
   * surface colour (the radar `join`/`graph`/`network` case, the kit `link`
   * flag).
   */
  readonly darkLine?: true;
  /**
   * Text painted inside the glyph (part of the asset, never host content,
   * never localised). Only `s3` carries one.
   */
  readonly text?: string;
}

/** Canonical base diamond — the validated #711 render (§9.1). */
export const DIAGRAM_GLYPH_BASE = "M8 53L32 44L56 53L32 62Z";

/** Glyph viewBox in force for the whole family. */
export const DIAGRAM_GLYPH_VIEWBOX = "0 0 64 64";

function glyph(
  face: string,
  line?: string,
  extra?: Pick<DiagramGlyph, "darkLine" | "text">,
): DiagramGlyph {
  return {
    base: DIAGRAM_GLYPH_BASE,
    face,
    ...(line === undefined || line === "" ? {} : { line }),
    ...extra,
  };
}

/**
 * The shipped set (§9.2): the radar-immobilier 19 redrawn on the canonical
 * base plus the sentropic #711 9 (verbatim geometry). 28 names, no
 * collisions across the two sources — no aliasing was needed.
 */
export const DIAGRAM_GLYPHS: Readonly<Record<string, DiagramGlyph>> = {
  // --- radar-immobilier fa8133c2 (19): interiors preserved verbatim, base
  // replaced by the canonical diamond (§9.1, DIF-12) ---
  s3: glyph("M12 18Q32 6 52 18L47 47Q32 58 17 47Z", "M12 18Q32 30 52 18M18 29Q32 38 46 29", {
    text: "S3",
  }),
  postgres: glyph(
    "M12 16Q32 4 52 16V47Q32 59 12 47Z",
    "M12 16Q32 28 52 16M12 28Q32 40 52 28M12 40Q32 52 52 40",
  ),
  cluster: glyph(
    "M32 7L54 20V44L32 57L10 44V20Z",
    "M32 19V32M21 26L32 32L43 26M32 32V46M32 32L20 40M32 32L44 40",
  ),
  web: glyph("M8 12H56V49H8Z", "M8 23H56M15 18H17M22 18H24M16 31H30V42H16ZM37 32H48M37 40H48"),
  api: glyph("M8 12H56V50H8Z", "M22 24L15 31L22 38M42 24L49 31L42 38M35 22L29 40"),
  cronjob: glyph("M32 8A24 24 0 1 1 31.9 8Z", "M32 16V32L43 39M17 16L12 21M47 16L52 21"),
  identity: glyph(
    "M32 6L52 14V31Q50 48 32 58Q14 48 12 31V14Z",
    "M26 29V24A6 6 0 0 1 38 24V29M23 29H41V42H23ZM32 34V37",
  ),
  workstation: glyph(
    "M8 10H56V42H8Z",
    "M13 15H51V37H13ZM24 43V51M40 43V51M17 53H47M18 23L24 27L18 31M30 31H39",
  ),
  document: glyph("M15 6H37L50 19V57H15Z", "M37 6V19H50M23 28H42M23 36H42M23 44H35"),
  map: glyph(
    "M7 16L24 9L41 16L57 9V49L41 56L24 49L7 56Z",
    "M24 9V49M41 16V56M13 29L24 25L41 35L51 31",
  ),
  join: glyph("M8 12H24V27H8ZM40 12H56V27H40ZM24 42H40V57H24Z", "M16 27V34H48V27M32 34V42", {
    darkLine: true,
  }),
  graph: glyph(
    "M7 10H23V26H7ZM41 10H57V26H41ZM24 42H40V58H24Z",
    "M23 18H41M15 26L27 42M49 26L37 42",
    { darkLine: true },
  ),
  check: glyph("M14 8H50V57H14Z", "M23 8V15H41V8M23 35L30 42L43 27"),
  release: glyph(
    "M12 31L32 20L52 31V50L32 61L12 50Z",
    "M12 31L32 42L52 31M32 42V61M32 5V25M24 13L32 5L40 13",
  ),
  user: glyph(
    "M22 17A10 10 0 1 1 42 17A10 10 0 1 1 22 17ZM12 54V44Q12 31 25 31H39Q52 31 52 44V54Z",
    "M20 44V54M44 44V54",
  ),
  url: glyph(
    "M32 7A25 25 0 1 1 31.9 7Z",
    "M7 32H57M12 19H52M12 45H52M32 7C16 19 16 45 32 57C48 45 48 19 32 7Z",
  ),
  llm: glyph(
    "M17 17H47V47H17Z",
    "M25 25H39V39H25ZM25 8V17M39 8V17M25 47V56M39 47V56M8 25H17M8 39H17M47 25H56M47 39H56",
  ),
  network: glyph(
    "M24 7H40V23H24ZM5 42H21V58H5ZM43 42H59V58H43Z",
    "M32 23V33M13 42V33H51V42",
    { darkLine: true },
  ),
  unknown: glyph("M32 6L59 55H5Z", "M32 24V38M32 45V46"),
  // --- sentropic #711 via the hrpolnav kit (9): verbatim geometry on the
  // canonical base, 64-unit viewBox ---
  people: glyph(
    "M22 10a8 8 0 1 1 0 16a8 8 0 1 1 0-16Z M42 14a7 7 0 1 1 0 14a7 7 0 1 1 0-14Z M8 46c0-9 6-15 14-15s14 6 14 15Z M34 46c0-8 4-13 9-13s12 5 12 13Z",
  ),
  "window": glyph("M9 11h46v36H9Z", "M9 19h46 M16 28h32 M16 35h22"),
  server: glyph(
    "M14 8h36v14H14Z M14 25h36v14H14Z",
    "M20 15h10 M20 32h10 M42 15h.1 M42 32h.1",
  ),
  brain: glyph(
    "M32 12c-4-7-15-5-16 3c-8 1-11 11-6 17c-5 8 0 17 8 17c5 5 12 3 14-2c2 5 9 7 14 2c8 0 13-9 8-17c5-6 2-16-6-17c-1-8-12-10-16-3Z",
    "M32 12v35 M16 15c0 6 4 9 9 9 M10 32c4-4 9-3 12 1 M18 49c-2-5 0-10 5-12 M48 15c0-6-4-9-9-9 M54 32c-4-4-9-3-12 1 M46 49c2-5 0-10-5-12",
  ),
  robot: glyph(
    "M14 16h36v31H14Z M8 25h6v13H8Z M50 25h6v13h-6Z M29 6h6v5h-6Z",
    "M32 11v5 M23 27h.1 M41 27h.1 M23 38h18",
  ),
  link: glyph("M10 12h16v14H10Z M38 30h16v14H38Z", "M26 19h12v11", { darkLine: true }),
  db: glyph(
    "M14 13c0-4 8-7 18-7s18 3 18 7v29c0 4-8 7-18 7s-18-3-18-7Z",
    "M14 13c0 4 8 7 18 7s18-3 18-7 M14 27c0 4 8 7 18 7s18-3 18-7",
  ),
  shield: glyph(
    "M32 7l20 7v13c0 12-8 20-20 25C20 47 12 39 12 27V14Z",
    "M23 29l6 6 12-13",
  ),
  cloud: glyph("M18 44a10 10 0 0 1 0-20a14 14 0 0 1 27-4a11 11 0 0 1 3 24Z"),
};

/** Shipped glyph names (§9.2: 19 + 9 = 28). */
export const DIAGRAM_GLYPH_NAMES = Object.keys(DIAGRAM_GLYPHS);

/**
 * Resolve a glyph name to its path record. Returns `undefined` for an
 * unmapped name — the callers raise `card-icon-unknown` /
 * `zone-icon-unknown` and draw nothing (DIF-14: no `server` fallback, no
 * silent substitution).
 */
export function getDiagramGlyph(name: string): DiagramGlyph | undefined {
  return DIAGRAM_GLYPHS[name];
}
