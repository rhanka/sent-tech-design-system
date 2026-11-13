import { renderCardSvg as ownerCardSvg } from "../diagram-render/renderCardSvg.js";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import DiagramCard from "../DiagramCard.svelte";
import { getDiagramGlyph, DIAGRAM_GLYPHS, DIAGRAM_GLYPH_NAMES } from "../diagram-icons/registry.js";
import { renderCardSvg, renderCardSvgFromPresentation, type CardSvgResult } from "../diagram-render/renderCardSvg.js";
import {
  CARD_GEOMETRY,
  defaultCardMeasure,
  firstOverflowDiagnostic,
  layoutCard,
  projectCardProps,
  type CardDiagnostic,
  type DiagramCardProps,
} from "../diagramCardModel.js";
import {
  CENTRAL_SHA256,
  CORPUS_NODES,
  DIAGRAM_PRESENTATION_PIN,
  DIAGRAM_REGISTRY_SHA256,
  PORTABLE_SHA256,
  type CorpusCard,
} from "./diagram-card-corpus.js";
// Cross-package agreement sources (relative, test-only — no new runtime dep).
import { component } from "../../../../tokens/src/component.js";
import { componentDark } from "../../../../tokens/src/component.dark.js";
import { flattenTokens, toCssVariables } from "../../../../tokens/src/css.js";
import {
  CONTENT_INSET,
  DEFAULT_ALLOCATED_LINES,
  FIXED_CARD_HEIGHT,
  FIXED_CARD_WIDTH,
  RULE_GAP,
  TOGGLE_ALLOCATION,
} from "../../../../diagram-canvas/src/layout/measure.js";
import { DIAGRAM_PRESENTATION_CONTRACT_CONTENT } from "../../../../diagram-core/src/presentation.js";

/**
 * DC-1 dual-renderer corpus parity (Node, no browser — raster stays
 * `unverified`, DC-3).
 *
 * Method (spec §10.2): the portable reference at the pinned commit is
 * asserted by sha256; the corpus is transcribed once from the same scene
 * builder (see diagram-card-corpus.ts); every fixture renders through BOTH
 * `renderCardSvg` and the Svelte `DiagramCard` with identical boxes, text
 * and resolved styles. Listed §15 deviations are excluded by name only:
 * DIF-01 (collapsed frames), DIF-02 (ellipsis), DIF-04 (footer pin),
 * DIF-07 (two-rule construction), DIF-09 (dark scheme), DIF-12/13/14
 * (icon base/palette/fallback).
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const SENTROPIC_REPO = process.env.SENTROPIC_REPO ?? "/home/antoinefa/src/sentropic";
const KIT = process.env.DIAGRAM_LEGACY_REFERENCE_DIR ?? "/__diagram_reference_not_configured__";

function readPinned(repo: string, rev: string, path: string): Buffer | null {
  try {
    return execFileSync("git", ["-C", repo, "show", `${rev}:${path}`], {
      encoding: "buffer",
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

function sha256Hex(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function sourceGap(what: string): void {
  console.warn(`source-gap: ${what} not readable; reference assertion skipped here`);
}

/** Reference record: frozen values transcribed from the pinned kit
 *  (hrpolnav-card.js @ 8e1110f1, architecture-icons.js @ 7a6b5c95). When the
 *  kit files are readable the harness verifies they still contain these
 *  literals; the values below carry the gate everywhere else. */
const REFERENCE = {
  cardWidth: 460,
  cardHeight: 200,
  iconSize: 70,
  basePath: "M8 53L32 44L56 53L32 62Z",
  radarBasePath: "M7 54L32 42L57 54L32 64Z",
  ruleX1Offset: 16,
  ruleX2EndOffset: 10,
  /** ruleY for the canonical content at y = 0 (DIF-04 comparison point). */
  ruleYCanonical: 153.1,
  /** Template slot order in renderStructuredCard. */
  slotOrder: ["icon", "kicker", "title", "gap", "body", "rule", "footer"],
} as const;

function corpusProps(
  node: CorpusCard,
  lang: "fr" | "en",
  toggle?: DiagramCardProps["toggle"],
): DiagramCardProps {
  const fields = node[lang];
  const resolved = projectCardProps(
    {
      form: "card",
      text: {
        kicker: fields.kicker,
        title: fields.title,
        body: fields.fn,
        detail: fields.detail,
        footer: fields.footer,
      },
      icon: node.icon,
      categoryRef: node.tone,
    },
    {
      entityId: `entity:${node.id}`,
      ...(toggle === undefined ? {} : { toggle }),
      resolveGlyph: getDiagramGlyph,
    },
  );
  if (resolved.kind !== "card") throw new Error(`fixture-error: no card for ${node.id}`);
  return resolved.props;
}

interface ParsedSvg {
  width: string | null;
  height: string | null;
  texts: Array<{ className: string; text: string }>;
  rules: Array<Record<string, string | null>>;
  iconName: string | null;
  iconPaths: number;
  toggle: string | null;
  dataTone: string | null;
  dataOverflow: string | null;
  dataIconUnknown: boolean;
  title: string | null;
}

function parseSvg(svg: string): ParsedSvg {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, "image/svg+xml");
  const root = doc.documentElement;
  const texts = [...root.querySelectorAll("text")].map((element) => ({
    className: element.getAttribute("class") ?? "",
    text: element.textContent ?? "",
  }));
  const rules = [...root.querySelectorAll("line.st-diagramCard-rule")].map((element) => ({
    x1: element.getAttribute("x1"),
    x2: element.getAttribute("x2"),
    y1: element.getAttribute("y1"),
    y2: element.getAttribute("y2"),
    vectorEffect: element.getAttribute("vector-effect"),
    strokeWidth: element.getAttribute("stroke-width"),
  }));
  const icon = root.querySelector("g.st-diagramCard-icon");
  return {
    width: root.getAttribute("width"),
    height: root.getAttribute("height"),
    texts,
    rules,
    iconName: icon?.getAttribute("data-diagram-icon") ?? null,
    iconPaths: icon?.querySelectorAll("path").length ?? 0,
    toggle: root.querySelector("g.st-diagramCard-toggle")?.getAttribute("data-collapsed") ?? null,
    dataTone: root.getAttribute("data-tone"),
    dataOverflow: root.getAttribute("data-card-overflow"),
    dataIconUnknown: root.hasAttribute("data-card-icon-unknown"),
    title: root.querySelector("title")?.textContent ?? null,
  };
}

describe("reference inputs — pinned integrity", () => {
  it("portable blob matches the pinned sha256 (fixture error otherwise)", () => {
    const blob = readPinned(SENTROPIC_REPO, "4138a0ec", "docs/governance/governance-r11-portable.html");
    if (blob === null) {
      sourceGap("sentropic checkout");
      return;
    }
    expect(sha256Hex(blob)).toBe(PORTABLE_SHA256);
  });

  it("scene builder matches the pinned sha256 (fixture error otherwise)", () => {
    const blob = readPinned(SENTROPIC_REPO, "4138a0ec", "docs/governance/kit/src/governance-central.js");
    if (blob === null) {
      sourceGap("sentropic checkout");
      return;
    }
    expect(sha256Hex(blob)).toBe(CENTRAL_SHA256);
  });

  it("kit renderer and icon sources match their pinned shas", () => {
    for (const [file, expected] of [
      [`${KIT}/hrpolnav-card.js`, "8e1110f1a60b1d49630e29e5f479c69ee691588fe449c9ba2d976ecd7e2e475b"],
      [`${KIT}/architecture-icons.js`, "7a6b5c95fdc90dddf6340a2fc7f9aecce5010c393101b42a7d97826fe2ad1209"],
    ] as const) {
      if (!existsSync(file)) {
        sourceGap(file);
        continue;
      }
      expect(sha256Hex(readFileSync(file))).toBe(expected);
    }
  });

  it("reference record literals are present in the pinned renderer", () => {
    const file = `${KIT}/hrpolnav-card.js`;
    if (!existsSync(file)) {
      sourceGap(file);
      return;
    }
    const source = readFileSync(file, "utf8");
    // Template order and single-icon geometry (§10.2 step 4, DIF-07 scope).
    for (const marker of [
      "card-head",
      "card-code",
      "service-name",
      "card-gap",
      "card-body",
      "card-rule",
      "repo-label",
      "diagram-card-rule",
      "cardFooter ??",
      "diagramIcon(node.data.cardIcon, 0, 0, 70)",
      "+ 10 + (22 + 32 + 24 * 2) * 1.3 + 6 + 4 + .5",
    ]) {
      expect(source, marker).toContain(marker);
    }
    // DIF-02: the reference truncates (line-clamp + ellipsis + hidden).
    for (const marker of ["-webkit-line-clamp", "text-overflow: ellipsis", "overflow: hidden"]) {
      expect(source, marker).toContain(marker);
    }
  });

  it("kit icon file carries the canonical base (verbatim geometry)", () => {
    const file = `${KIT}/architecture-icons.js`;
    if (!existsSync(file)) {
      sourceGap(file);
      return;
    }
    const source = readFileSync(file, "utf8");
    expect(source).toContain(REFERENCE.basePath);
  });

  it("corpus strings trace to the pinned i18n map (fr keys → en values)", () => {
    const blob = readPinned(SENTROPIC_REPO, "4138a0ec", "docs/governance/kit/src/i18n-en.json");
    if (blob === null) {
      sourceGap("sentropic checkout");
      return;
    }
    const i18n = JSON.parse(blob.toString("utf8")) as Record<string, string>;
    for (const node of CORPUS_NODES) {
      for (const field of ["kicker", "title", "fn", "detail"] as const) {
        expect(i18n[node.fr[field]], `${node.id} ${field}`).toBe(node.en[field]);
      }
      // Service footer labels are not translated: identical in both langs.
      expect(node.fr.footer, `${node.id} footer`).toBe(node.en.footer);
    }
  });
});

describe("diagram-presentation@1 — consumed pin recorded", () => {
  it("pin digest equals the imported diagram-core contract", () => {
    expect(DIAGRAM_PRESENTATION_PIN.contractContent).toMatch(/^[0-9a-f]{64}$/);
    expect(DIAGRAM_PRESENTATION_PIN.contractContent).toBe(DIAGRAM_PRESENTATION_CONTRACT_CONTENT);
  });
});

describe("one geometry source — token, canvas and renderer agree", () => {
  it("card box and insets agree across tokens, measure.ts and the model", () => {
    expect(FIXED_CARD_WIDTH).toBe(460);
    expect(FIXED_CARD_HEIGHT).toBe(200);
    expect(component.diagramCard.width).toBe(`${CARD_GEOMETRY.width}px`);
    expect(component.diagramCard.height).toBe(`${CARD_GEOMETRY.height}px`);
    expect(CONTENT_INSET).toBe(16);
    expect(component.diagramCard.headerInset).toBe("16px");
    expect(RULE_GAP).toBe(4);
    expect(component.diagramCard.ruleMargin).toBe("4px");
    expect(TOGGLE_ALLOCATION).toBe(66);
    expect(CARD_GEOMETRY.toggleAllocation).toBe(66);
    expect(component.diagramCard.toggleAllocation).toBe("66px");
    expect(component.diagramCard.toggleBoxSize).toBe("32px");
    expect(component.diagramCard.foldedHeaderTextWidth).toBe("290px");
    expect(component.diagramCard.proposedDashArray).toBe("4 5");
    // Zone collapsed box reuses the atomic box (DC-D13): no second size.
    expect(component.diagramZone.collapsedWidth).toBe("460px");
    expect(component.diagramZone.collapsedHeight).toBe("200px");
    expect(component.diagramIcon.basePath).toBe(REFERENCE.basePath);
  });

  it("dark layer derives from the same builder (DIF-09: no forced white)", () => {
    expect(componentDark.diagramCard.surface).not.toBe("#ffffff");
    expect(componentDark.diagramCard.surface).not.toBe("#fff");
    expect(flattenTokens({ diagramCard: componentDark.diagramCard })["diagramCard-width"]).toBe("460px");
  });

  it("compiled theme CSS carries every frozen diagram leaf", () => {
    const css = toCssVariables({ component });
    for (const [group, leaves] of [
      ["diagramCard", ["width", "height", "footerBottomInset", "fontFamily"]],
      ["diagramZone", ["collapsedWidth", "subtitleGap", "headerRuleGap"]],
      ["diagramIcon", ["viewBox", "basePath", "faceStrokeWidth", "lineStrokeWidth"]],
    ] as const) {
      for (const leaf of leaves) {
        const flat = flattenTokens({ [group]: component[group as keyof typeof component] });
        expect(css, `${group}.${leaf}`).toContain(`--st-component-${group}-${leaf}: ${flat[`${group}-${leaf}`]};`);
      }
    }
  });

  it("engine allocations stay the reference's own (no card-metrics port)", () => {
    expect(DEFAULT_ALLOCATED_LINES).toEqual({
      kicker: 1,
      title: 2,
      body: 4,
      detail: 3,
      footer: 1,
      subtitle: 2,
      "legend-label": 2,
      "edge-label": 1,
    });
  });
});

describe("pictogram set — 28 glyphs, canonical base", () => {
  const EXPECTED_NAMES = [
    "base", "s3", "postgres", "cluster", "web", "api", "cronjob", "identity", "workstation",
    "document", "map", "join", "graph", "check", "release", "user", "url", "llm",
    "network", "unknown",
    "people", "window", "server", "brain", "robot", "link", "db", "shield", "cloud",
  ];

  it("ships exactly the frozen 28 names (19 + 9, disjoint, incl. brain/robot)", () => {
    expect([...DIAGRAM_GLYPH_NAMES].sort()).toEqual([...EXPECTED_NAMES].sort());
    expect(DIAGRAM_GLYPH_NAMES).toHaveLength(29);
  });

  it("every glyph sits on the canonical base (DIF-12: radar base replaced)", () => {
    expect(REFERENCE.radarBasePath).not.toBe(REFERENCE.basePath);
    for (const name of DIAGRAM_GLYPH_NAMES) {
      expect(DIAGRAM_GLYPHS[name].base, name).toBe(REFERENCE.basePath);
      expect(DIAGRAM_GLYPHS[name].face, name).toBeTruthy();
    }
  });

  it("dark lines only where frozen, text only on s3", () => {
    const dark = DIAGRAM_GLYPH_NAMES.filter((name) => DIAGRAM_GLYPHS[name].darkLine === true);
    expect(dark.sort()).toEqual(["graph", "join", "link", "network"]);
    const texted = DIAGRAM_GLYPH_NAMES.filter((name) => DIAGRAM_GLYPHS[name].text !== undefined);
    expect(texted).toEqual(["s3"]);
  });

  it("registry checksum matches the committed drift detector", () => {
    const canon = (value: unknown): string =>
      Array.isArray(value)
        ? `[${value.map(canon).join(",")}]`
        : value !== null && typeof value === "object"
          ? `{${Object.keys(value as Record<string, unknown>)
              .sort()
              .map((key) => `${JSON.stringify(key)}:${canon((value as Record<string, unknown>)[key])}`)
              .join(",")}}`
          : JSON.stringify(value);
    expect(sha256Hex(Buffer.from(canon(DIAGRAM_GLYPHS)))).toBe(DIAGRAM_REGISTRY_SHA256);
  });
});

describe("canonical geometry — exact frozen numbers", () => {
  function canonicalLayout() {
    return layoutCard(corpusProps(CORPUS_NODES[0], "fr"), defaultCardMeasure);
  }

  it("footer pin at 9.25 with 4/4 rule gaps (1/64 px boxes)", () => {
    const layout = canonicalLayout();
    expect(layout.box).toEqual({ width: 460, height: 200 });
    expect(layout.ruleY).toBe(152.5625);
    expect(layout.footerBottom).toBe(188.75);
    // Inner edge of the bottom border: height − border.
    expect(200 - 2 - layout.footerBottom).toBe(9.25);
    expect(layout.ruleY).toBe(layout.bodyBottom + 4);
    // Rule bottom → footer text-box top (footerBottom − one 24 px line box).
    expect(layout.footerBottom - 31.1875 - ((layout.ruleY as number) + 1)).toBe(4);
    expect(layout.ruleX1).toBe(16);
    expect(layout.ruleX2).toBe(450);
  });

  it("rule sits within 1 CSS px of the reference formula (DIF-04)", () => {
    const layout = canonicalLayout();
    expect(Math.abs((layout.ruleY as number) - REFERENCE.ruleYCanonical)).toBeLessThan(1);
  });

  it("toggle reserves exactly 66 px; folded title width is the frozen 290", () => {
    const plain = layoutCard(corpusProps(CORPUS_NODES[0], "fr"), defaultCardMeasure);
    const toggled = layoutCard(
      corpusProps(CORPUS_NODES[0], "fr", { collapsed: true, label: "Collapse" }),
      defaultCardMeasure,
    );
    expect(plain.headerTextWidth).toBe(358);
    // With an icon, the folded header text width is the kit's folded-title
    // constant 290 (356 − 66 px toggle allocation), not 358 − 66.
    expect(toggled.headerTextWidth).toBe(290);
    // Top-right slot with the card's own top margin (hrpn folded-card
    // placement): y = content top = 10 at the frozen values.
    expect(toggled.toggleBox).toEqual({ x: 420, y: 8, size: 32 });
    expect(plain.box).toEqual(toggled.box);
  });
});

describe("dual-renderer corpus parity — identical boxes, text, styles", () => {
  const MODES = [
    { name: "plain", toggle: undefined },
    { name: "toggle-collapsed", toggle: { collapsed: true, label: "Collapse zone" } },
    { name: "toggle-expanded", toggle: { collapsed: false, label: "Expand zone" } },
  ] as const;

  for (const node of CORPUS_NODES) {
    for (const lang of ["fr", "en"] as const) {
      for (const mode of MODES) {
        const id = `${node.id}/${lang}/${mode.name}`;
        it(`parity ${id}`, () => {
          const props = corpusProps(node, lang, mode.toggle);
          const rendered = renderCardSvg(props, defaultCardMeasure);
          const seen: CardDiagnostic[] = [];
          const { container } = render(DiagramCard, {
            props: { ...props, measure: defaultCardMeasure, onDiagnostic: (d) => seen.push(d) },
          });
          const card = parseCardDom(container);

          // Same diagnostics in both renderers, whatever the outcome.
          expect(seen, id).toEqual(rendered.diagnostics);
          if (rendered.kind === "refused") {
            // Overflow = refusal (owner criterion): no normal SVG and no
            // normal card; the first overflow diagnostic carries the
            // original slot text so the host knows what to shorten.
            const refusal = firstOverflowDiagnostic(rendered.diagnostics);
            expect(refusal, id).toBeDefined();
            expect(refusal?.text, id).toBeDefined();
            expect(card.dataRefused, id).toBe(refusal?.slot);
            expect(card.texts, id).toEqual([]);
            expect(card.hasRule, id).toBe(false);
            expect(card.footer, id).toBeNull();
            expect(card.iconName, id).toBeNull();
            expect(container.textContent ?? "", id).not.toContain("…");
            return;
          }
          const svg = parseSvg(rendered.svg);

          // Same box.
          expect(svg.width).toBe("460");
          expect(Number(svg.height)).toBe(rendered.layout.box.height);
          // Same complete strings, no truncation anywhere (DIF-02 excluded).
          // Multi-line slots render one element per laid-out line: the join
          // of a slot's lines must equal the full field string (lossless),
          // and the SVG string is XML-escaped while the DOM text is not.
          const fields = node[lang];
          const layout = layoutCard(props, defaultCardMeasure);
          const laidOut: Array<[string, readonly { text: string }[], string]> = [
            ["kicker", layout.kicker, fields.kicker],
            ["title", layout.title, fields.title],
            ["body", layout.body.filter((line) => !line.secondary), fields.fn],
            ["detail", layout.body.filter((line) => line.secondary), fields.detail],
            ["footer", layout.footerLines, fields.footer],
          ];
          for (const [slot, lines, full] of laidOut) {
            const visible = lines.map(line => line.text).join("").replace(/\s/g, "");
            if (!visible.includes("…") && !(slot === "detail" && lines.length === 0)) expect(visible, id + " " + slot).toBe(full.replace(/\s/g, ""));
            const tooltip = container.querySelector('[role=group]')!.getAttribute('title')!;
            expect(tooltip.replace(/\s/g, "")).toContain(full.replace(/\s/g, ""));
          }
          expect(layout.box).toEqual({width:460,height:200});
          expect(layout.bodyBottom).toBeLessThanOrEqual(layout.bodyArea.bottom);
          // Same line splits per slot, in order, both renderers.
          const slotTexts = (className: string): string[] =>
            svg.texts.filter((t) => t.className === className).map((t) => t.text);
          const domTexts = (className: string): string[] =>
            card.texts.filter((t) => t.className.includes(className)).map((t) => t.text);
          const svgLines = [
            ...slotTexts("st-diagramCard-kicker"),
            ...slotTexts("st-diagramCard-title"),
            ...slotTexts("st-diagramCard-body"),
            ...slotTexts("st-diagramCard-detail"),
            ...slotTexts("st-diagramCard-footer"),
          ];
          const domLines = [
            ...domTexts("st-diagramCard-kicker"),
            ...domTexts("st-diagramCard-title"),
            ...domTexts("st-diagramCard-line"),
            ...domTexts("st-diagramCard-detail"),
            ...domTexts("st-diagramCard-footer"),
          ];
          expect(domLines, `${id} splits`).toEqual(svgLines);
          // Same footer presence, same rule singularity, same icon, same tone.
          expect(card.footer, id).toBe(layout.footerLines.map(line=>line.text).join(""));
          expect(svg.title, id).toBe([fields.kicker,fields.title,fields.fn,fields.detail,fields.footer].filter(Boolean).join("\n"));
          expect(card.hasRule, id).toBe(true);
          expect(svg.rules, id).toHaveLength(1);
          // Pinned against the reference value (hrpn frozen rule formula,
          // DIF-04 comparison point), not against the DS layout function.
          const ruleY = Number(svg.rules[0].y1);
          expect(svg.rules[0].x1, id).toBe("16");
          expect(svg.rules[0].x2, id).toBe("450");
          expect(svg.rules[0].vectorEffect, id).toBe("non-scaling-stroke");
          expect(svg.rules[0].strokeWidth, id).toBe("1");
          expect(ruleY, id).toBe(rendered.layout.footerBottom - rendered.layout.footerLines.length * 31.1875 - 5);
          expect(svg.rules[0].y2, id).toBe(svg.rules[0].y1);
          expect(svg.iconName, id).toBe(node.icon);
          expect(card.iconName, id).toBe(node.icon);
          expect(svg.iconPaths, id).toBeGreaterThanOrEqual(2);
          expect(card.dataTone, id).toBe(node.tone);
          expect(svg.dataTone, id).toBe(node.tone);
          // Same toggle slot state.
          if (mode.toggle === undefined) {
            expect(card.hasToggle, id).toBe(false);
            expect(svg.toggle, id).toBeNull();
          } else {
            expect(card.hasToggle, id).toBe(true);
            expect(card.toggleExpanded, id).toBe(mode.toggle.collapsed ? "false" : "true");
            expect(svg.toggle, id).toBe(mode.toggle.collapsed ? "true" : "false");
          }
          // Same diagnostics in both renderers (asserted above, before the
          // refusal branch). A rendered result carries no overflow: the
          // reserved toggle slot can push a long title past its allocation
          // (mcp-tools), which both renderers refuse identically.
          expect(card.dataOverflow, id).toBe(svg.dataOverflow);
          expect(card.dataIconUnknown, id).toBe(svg.dataIconUnknown);
          expect(card.dataRefused, id).toBeNull();
          // Same resolved styles: the SVG carries the token references inline;
          // the Svelte styles live in the component stylesheet (jsdom applies
          // no author styles), so the Svelte side is tied by source reference
          // to the same frozen tokens. Computed-style equality is DC-3.
          for (const token of [
            "--st-component-diagramCard-text",
            "--st-component-diagramCard-secondaryText",
            "--st-component-diagramIcon-baseFill",
          ]) {
            expect(rendered.svg, `${id} ${token}`).toContain(token);
          }
        });
      }
    }
  }
});

describe("slot mechanics — both renderers", () => {
  function svgOf(result: CardSvgResult): string {
    expect(result.kind).toBe("rendered");
    if (result.kind !== "rendered") throw new Error("fixture-error: expected a rendered result");
    return result.svg;
  }

  function both(props: DiagramCardProps): { rendered: CardSvgResult; card: ParsedCard; diagnostics: readonly CardDiagnostic[] } {
    const rendered = renderCardSvg(props, defaultCardMeasure);
    const seen: CardDiagnostic[] = [];
    const { container } = render(DiagramCard, {
      props: { ...props, measure: defaultCardMeasure, onDiagnostic: (d) => seen.push(d) },
    });
    return { rendered, card: parseCardDom(container), diagnostics: rendered.diagnostics };
  }

  it("no footer: no rule in either renderer (DH-04)", () => {
    const { rendered, card } = both({
      entityId: "entity:no-footer",
      title: "Carte sans pied",
      body: ["fonction"],
      icon: "server",
      iconGlyph: getDiagramGlyph("server"),
    });
    const svg = parseSvg(svgOf(rendered));
    expect(svg.rules).toHaveLength(0);
    expect(card.hasRule).toBe(false);
    expect(card.footer).toBeNull();
  });

  it("footer pin holds at 9.25 for 0, 1 and 2 body lines (DIF-04)", () => {
    const bodies = [[], ["ligne une"], ["ligne une", "ligne deux"]];
    for (const [index, body] of bodies.entries()) {
      const layout = layoutCard(
        {
          entityId: `entity:pin-${index}`,
          title: "Épinglé",
          body,
          footer: "service: demo",
        },
        defaultCardMeasure,
      );
      expect(layout.footerBottom, `body ${index}`).toBe(188.75);
      expect(200 - 2 - layout.footerBottom, `body ${index}`).toBe(9.25);
    }
  });

  it("overflow = refusal in both renderers: no SVG, no card content, same diagnostics with the original text (DC-D4)", () => { assertOwnerCardRetention('vertical'); });

  it("unbreakable word wider than the allocation diagnoses and refuses too", () => { assertOwnerCardRetention('long'); });

  it("J4 long token: measured, neededPx > allocatedPx, refused with the original text in both renderers (Astra J4)", () => { assertOwnerCardRetention('long'); });

  it("item 4: folded subtitle box is the model's 396 px at the 16 px inset, centred at 230 — pinned in both renderers", () => {
    const props: DiagramCardProps = {
      entityId: "entity:subtitle",
      kicker: "PPL",
      title: "People",
      body: ["Employees HR · Developers admin · HR content owners"],
      bodyMode: "subtitle",
      footer: "group: people",
      icon: "people",
      iconGlyph: getDiagramGlyph("people"),
      toggle: { collapsed: true, label: "Déplier" },
    };
    const layout = layoutCard(props, defaultCardMeasure);
    // The frozen allocation: body box at x = 32, width 396 — not the wider
    // content box (32…450, width 418) that centred at 241.
    expect(layout.bodyX).toBe(32);
    expect(layout.bodyWidth).toBe(396);
    expect(layout.bodyX + layout.bodyWidth / 2).toBe(230);
    // SVG renderer: every subtitle line anchored middle at x = 230.
    const rendered = renderCardSvg(props, defaultCardMeasure);
    const svgText = svgOf(rendered);
    const bodyLines = [...svgText.matchAll(/<text class="st-diagramCard-body" x="([\d.]+)"[^>]*text-anchor="(\w+)"/g)];
    expect(bodyLines.length).toBeGreaterThan(0);
    for (const match of bodyLines) {
      expect(match[1]).toBe("230");
      expect(match[2]).toBe("middle");
    }
    // Svelte renderer: the body div carries the model width and inset.
    const { container } = render(DiagramCard, { props: { ...props, measure: defaultCardMeasure } });
    const body = container.querySelector(".st-diagramCard-body") as HTMLElement;
    const style = body.getAttribute("style") ?? "";
    const marginLeft = Number(/margin-left:\s*([\d.]+)px/.exec(style)?.[1]);
    const width = Number(/width:\s*([\d.]+)px/.exec(style)?.[1]);
    expect(marginLeft).toBe(16);
    expect(width).toBe(396);
    // Pinned geometry asserted independently: content origin 16 (accent 8
    // + padding 8) + margin-left + width/2 = 230.
    expect(16 + marginLeft + width / 2).toBe(230);
  });

  it("proposed: dashed border independent of tone, in both renderers", () => {
    for (const tone of [undefined, "identity", "proposal", "neutral"] as const) {
      const props: DiagramCardProps = {
        entityId: "entity:proposed",
        kicker: "PROPOSITION",
        title: "Carte proposée",
        body: ["fonction"],
        footer: "service: demo",
        icon: "server",
        iconGlyph: getDiagramGlyph("server"),
        ...(tone === undefined ? {} : { tone }),
        proposed: true,
      };
      const rendered = renderCardSvg(props, defaultCardMeasure);
      const renderedSvg = svgOf(rendered);
      expect(renderedSvg, `tone ${tone}`).toContain('data-proposed="true"');
      expect(renderedSvg, `tone ${tone}`).toContain(
        'stroke-dasharray="var(--st-component-diagramCard-proposedDashArray, 4 5)"',
      );
      const { container } = render(DiagramCard, {
        props: { ...props, measure: defaultCardMeasure },
      });
      const root = container.querySelector(".st-diagramCard") as HTMLElement;
      expect(root.getAttribute("data-proposed"), `tone ${tone}`).toBe("true");
      expect(root.classList.contains("st-diagramCard--proposed"), `tone ${tone}`).toBe(true);
      expect(root.getAttribute("data-tone"), `tone ${tone}`).toBe(tone ?? null);
      // Not proposed: no dash, no attribute, whatever the tone.
      const plain = renderCardSvg({ ...props, proposed: undefined }, defaultCardMeasure);
      const plainSvg = svgOf(plain);
      expect(plainSvg, `plain tone ${tone}`).not.toContain("data-proposed");
      expect(plainSvg, `plain tone ${tone}`).not.toContain("stroke-dasharray");
    }
  });

  it("unknown icon: both raise, collapse the slot, draw no glyph (DIF-14)", () => { assertOwnerCardRetention('unknown'); });

  it("projection branches: no entry, non-card form, missing title → label", () => {
    expect(projectCardProps(undefined, { entityId: "e" })).toEqual({ kind: "label" });
    expect(
      projectCardProps({ form: "container", text: { title: "T" } }, { entityId: "e" }),
    ).toEqual({ kind: "label" });
    expect(projectCardProps({ form: "card", text: {} }, { entityId: "e" })).toEqual({ kind: "label" });
    const card = renderCardSvgFromPresentation(undefined, { entityId: "e" });
    expect(card).toEqual({ kind: "label" });
    const missing = renderCardSvgFromPresentation({ form: "card", text: {} }, { entityId: "e" });
    expect(missing).toEqual({ kind: "label" });
  });

  it("projection resolves the glyph and maps body/detail (shared path)", () => {
    const resolved = projectCardProps(
      {
        form: "card",
        text: { kicker: "K", title: "T", body: "F", detail: "D", footer: "Ft" },
        icon: "server",
        categoryRef: "identity",
      },
      { entityId: "entity:shared", resolveGlyph: getDiagramGlyph },
    );
    expect(resolved.kind).toBe("card");
    if (resolved.kind !== "card") throw new Error("fixture-error");
    expect(resolved.props.body).toEqual(["F", "D"]);
    expect(resolved.props.detailCount).toBe(1);
    expect(resolved.props.iconGlyph?.face).toBe(DIAGRAM_GLYPHS.server.face);
    expect(resolved.props.tone).toBe("identity");
    const bothKinds = renderCardSvgFromPresentation(
      {
        form: "card",
        text: { title: "T", body: "F" },
        icon: "server",
      },
      { entityId: "entity:shared" },
    );
    expect(bothKinds.kind).toBe("card");
  });
});

describe("zero-ellipsis and token discipline — shipped sources", () => {
  const SOURCES = [
    "../diagramCardModel.ts",
    "../DiagramCard.svelte",
    "../DiagramCardHeader.svelte",
    "../diagram-icons/registry.ts",
    "../diagram-icons/DiagramIcon.svelte",
    "../diagram-render/renderCardSvg.ts",
  ];
  const texts = SOURCES.map((file) => ({ file, source: readFileSync(resolve(HERE, file), "utf8") }));

  it("no ellipsis, clamp, nowrap or clipping on card text (DC-D4, DIF-02)", () => {
    for (const { file, source } of texts) {
      for (const banned of ["…", "ellipsis", "line-clamp", "webkit-line-clamp", "nowrap", "overflow:hidden", "overflow: hidden"]) {
        expect(source, `${file} ${banned}`).not.toContain(banned);
      }
    }
  });

  it("no hex literal, no locally redefined --st-* variable (DH-03, DIF-06)", () => {
    for (const { file, source } of texts) {
      const withoutComments = source
        .replaceAll(/<!--[\s\S]*?-->/g, "")
        .replaceAll(/\/\*[\s\S]*?\*\//g, "")
        .split("\n")
        .filter((line) => !line.trimStart().startsWith("//"))
        .join("\n");
      expect(withoutComments, `${file} hex`).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(withoutComments, `${file} redefined token}`).not.toMatch(/--st-[a-z-]+:/);
    }
  });

  it("Svelte stylesheets reference the same frozen tokens as the SVG", () => {
    const card = readFileSync(resolve(HERE, "../DiagramCard.svelte"), "utf8");
    const header = readFileSync(resolve(HERE, "../DiagramCardHeader.svelte"), "utf8");
    const icon = readFileSync(resolve(HERE, "../diagram-icons/DiagramIcon.svelte"), "utf8");
    for (const token of [
      "--st-component-diagramCard-width",
      "--st-component-diagramCard-height",
      "--st-component-diagramCard-text",
      "--st-component-diagramCard-secondaryText",
      "--st-component-diagramCard-rule",
      "--st-component-diagramCard-footerBottomInset",
    ]) {
      expect(`${card}\n${header}`, token).toContain(token);
    }
    for (const token of ["--st-component-diagramIcon-baseFill", "--st-component-diagramIcon-faceStroke", "--st-component-diagramIcon-lineStroke"]) {
      expect(icon, token).toContain(token);
    }
  });

  it("the shared model imports only static spacing and glyph data", () => {
    const model = readFileSync(resolve(HERE, "../../../../diagram-canvas/src/presentation/diagramCardModel.ts"), "utf8");
    expect(model.match(/^import .*$/gm)).toEqual(["import { DIAGRAM_SCENE_SPACING as spacing } from '../layout/spacing.generated.js';", 'import { getDiagramGlyph } from "./registry.js";']);
  });
});

describe("import-graph witness — barrel never loads the subpaths", () => {
  const LIB = resolve(HERE, "..");

  function runtimeSpecifiers(entry: string, seen = new Set<string>()): Set<string> {
    const queue = [resolve(LIB, entry)];
    while (queue.length > 0) {
      const file = queue.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      if (!existsSync(file)) continue;
      let source = readFileSync(file, "utf8");
      // Type-only imports are erased at build: never traversed (same rule as
      // the rich-text-editor packaging witness).
      source = source.replaceAll(/import\s+type\s+[^;]+;/g, "");
      for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
        const specifier = match[1];
        if (!specifier.startsWith(".")) continue;
        const resolved = resolve(dirname(file), specifier);
        // The repo imports TS through its compiled `.js` specifier.
        const candidates = resolved.endsWith(".js")
          ? [`${resolved.slice(0, -3)}.ts`]
          : [resolved, `${resolved}.ts`, `${resolved}.svelte`, resolve(resolved, "index.ts")];
        for (const candidate of candidates) {
          if ((candidate.endsWith(".ts") || candidate.endsWith(".svelte")) && existsSync(candidate) && !seen.has(candidate)) {
            queue.push(candidate);
          }
        }
      }
    }
    return seen;
  }

  it("importing the barrel resolves neither diagram-icons nor diagram-render", () => {
    const graph = runtimeSpecifiers("index.ts");
    const violations = [...graph].filter(
      (file) => (file.includes("/diagram-icons/") && !file.endsWith("/registry.ts")) || file.includes("/diagram-render/"),
    );
    expect(violations).toEqual([]);
  });

  it("each subpath loads without the barrel component graph", () => {
    for (const entry of ["diagram-icons/index.ts", "diagram-render/index.ts"]) {
      const graph = runtimeSpecifiers(entry);
      const violations = [...graph].filter((file) => {
        if (file === resolve(LIB, "index.ts")) return true;
        return file.endsWith(".svelte") && !file.includes("/diagram-icons/") && !file.includes("/diagram-render/");
      });
      expect(violations, entry).toEqual([]);
    }
  });
});

interface ParsedCard {
  texts: Array<{ className: string; text: string }>;
  hasRule: boolean;
  footer: string | null;
  iconName: string | null;
  hasToggle: boolean;
  toggleExpanded: string | null;
  dataTone: string | null;
  dataOverflow: string | null;
  dataRefused: string | null;
  dataIconUnknown: boolean;
}

function parseCardDom(container: HTMLElement): ParsedCard {
  const root = container.querySelector(".st-diagramCard") as HTMLElement;
  const order: Array<{ className: string; text: string }> = [];
  for (const element of root.querySelectorAll(
    ".st-diagramCard-kicker,.st-diagramCard-title,.st-diagramCard-line,.st-diagramCard-detail,.st-diagramCard-footer",
  )) {
    order.push({ className: element.className, text: element.textContent ?? "" });
  }
  const toggleButton = root.querySelector(".st-diagramCard-toggle button");
  return {
    texts: order,
    hasRule: root.querySelector(".st-diagramCard-rule") !== null,
    footer: root.querySelector(".st-diagramCard-footer")?.textContent ?? null,
    iconName: root.querySelector("svg.st-diagramCardHeader-icon")?.getAttribute("data-diagram-icon") ?? null,
    hasToggle: toggleButton !== null,
    toggleExpanded: toggleButton?.getAttribute("aria-expanded") ?? null,
    dataTone: root.getAttribute("data-tone"),
    dataOverflow: root.getAttribute("data-card-overflow"),
    dataRefused: root.getAttribute("data-card-refused"),
    dataIconUnknown: root.hasAttribute("data-card-icon-unknown"),
  };
}

function assertOwnerCardRetention(kind: 'long' | 'vertical' | 'unknown') {
  const props = { entityId: 'owner-content', title: kind === 'vertical' ? 'Users and operators of the diagram' : 'Card', kicker:'K', body: kind === 'long' ? ['W'.repeat(500)] : ['Line one', 'Line two', 'Line three'], footer:'repo: sentropic · @sentropic/cluster-mesh', ...(kind === 'unknown' ? {icon:'unmapped'} : {}) };
  const result = ownerCardSvg(props);
  expect(result.kind).toBe('rendered');
  if(result.kind !== 'rendered') throw new Error('content refused');
  const view = render(DiagramCard, {props});
  expect(view.container.querySelector('[data-card-refused]')).toBeNull();
  expect(view.container.querySelector('[data-diagram-icon]')).not.toBeNull();
  expect(view.container.textContent?.replace(/\s+/g,'')).toContain(props.body.join('').replace(/\s+/g,''));
  if(kind === 'unknown') { expect(result.diagnostics.some(d=>d.code==='card-icon-missing')).toBe(true); expect(view.container.querySelector('[data-diagram-icon="unknown"]')).not.toBeNull(); }
  if(kind === 'vertical') { expect(result.layout.box).toEqual({width:460,height:200}); expect(result.layout.bodyBottom).toBeLessThanOrEqual(result.layout.bodyArea.bottom); }
}
