import {
  notationForProfile,
  PROCESS_PROFILE_ID,
  resolveNotationEntity,
  type Entity,
  type EntityRef,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import type { LineMeasurer } from "../layout/measure.js";
import {
  computeProcessStepNumbers,
  measureProcessStepBox,
  PROCESS_BOX_BOUNDS,
  PROCESS_LAYOUT_SPACING,
} from "../layout/process.js";

export const PROCESS_BOX_GEOMETRY = {
  ...PROCESS_BOX_BOUNDS,
  laneHeaderSize: PROCESS_LAYOUT_SPACING.laneHeaderSize,
} as const;

export type ProcessBoxVariant = "task" | "start" | "end" | "decision" | "subprocess" | "lane";

export interface ProcessBoxModel {
  readonly kind: "flow-node" | "lane";
  readonly variant: ProcessBoxVariant;
  readonly title: string;
  readonly titleLines: readonly string[];
  readonly subtitle?: string;
  readonly subtitleLines: readonly string[];
  readonly stepNumber?: string;
  readonly width: number;
  readonly height: number;
  readonly direction: "left-to-right" | "top-to-bottom";
  readonly bandIndex?: number;
}

const byCodeUnit = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);

export const escapeProcessXml = (value: string): string =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function textAttr(entityOrRel: { readonly attributes: Entity["attributes"] }, key: string): string | undefined {
  const attr = entityOrRel.attributes[key];
  return attr !== undefined && attr.kind === "text" && attr.value !== "" ? attr.value : undefined;
}

/**
 * Measure a process box or swimlane using the resolved `diagram-notation@1`
 * role and variant from `@sentropic/diagram-core`.
 */
export function measureProcessBox(
  document: SemanticDocument,
  entityId: EntityRef,
  options: {
    readonly width?: number;
    readonly height?: number;
    readonly stepNumber?: string;
    readonly direction?: "left-to-right" | "top-to-bottom";
    readonly bandIndex?: number;
    readonly measureLines?: LineMeasurer;
  } = {},
): ProcessBoxModel {
  const entity = document.entities[entityId];
  const title = (entity ? textAttr(entity, "name") : undefined) ?? entityId;
  const subtitle = entity ? textAttr(entity, "subtitle") : undefined;
  const direction = options.direction ?? "left-to-right";

  const notationBlock = entity ? notationForProfile(entity.profile) : notationForProfile(PROCESS_PROFILE_ID);
  const resolved = entity && notationBlock ? resolveNotationEntity(notationBlock, entity) : undefined;

  if (resolved?.role === "lane" || entity?.type === "lane") {
    return {
      kind: "lane",
      variant: "lane",
      title,
      titleLines: [title],
      subtitleLines: [],
      width: options.width ?? PROCESS_BOX_GEOMETRY.minWidth,
      height: options.height ?? PROCESS_BOX_GEOMETRY.minHeight,
      direction,
      ...(options.bandIndex === undefined ? {} : { bandIndex: options.bandIndex }),
    };
  }

  const variant: ProcessBoxVariant =
    resolved?.variant === "start" ||
    resolved?.variant === "end" ||
    resolved?.variant === "decision" ||
    resolved?.variant === "subprocess"
      ? resolved.variant
      : "task";

  const stepNumber = options.stepNumber ?? (entity ? textAttr(entity, "stepNumber") : undefined);
  const measured = measureProcessStepBox(title, subtitle, stepNumber !== undefined, options.measureLines);

  return {
    kind: "flow-node",
    variant,
    title,
    titleLines: measured.titleLines,
    ...(subtitle === undefined ? {} : { subtitle }),
    subtitleLines: measured.subtitleLines,
    ...(stepNumber === undefined ? {} : { stepNumber }),
    width: options.width ?? measured.width,
    height: options.height ?? measured.height,
    direction,
  };
}

/**
 * Render one simple-box process step or swimlane band as pure, CSP-safe SVG.
 * Zero component icons, zero accent bars, zero fold buttons.
 */
export function renderProcessBoxSvg(box: ProcessBoxModel): string {
  const g = PROCESS_BOX_GEOMETRY;
  const w = box.width;
  const h = box.height;

  if (box.kind === "lane") {
    const surface =
      (box.bandIndex ?? 0) % 2 === 1
        ? "var(--st-component-diagramZone-surface2, #f8fafc)"
        : "var(--st-component-diagramZone-surface1, #ffffff)";
    const border = "var(--st-semantic-border-subtle, #cbd5e1)";
    const textFill = "var(--st-semantic-text-secondary, #475569)";
    const header = g.laneHeaderSize;
    const divider =
      box.direction === "left-to-right"
        ? `<path d="M${header} 0V${h}" stroke="${border}" stroke-width="1"/>`
        : `<path d="M0 ${header}H${w}" stroke="${border}" stroke-width="1"/>`;
    const label =
      box.direction === "left-to-right"
        ? `<text x="${header / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="central" transform="rotate(-90 ${header / 2} ${h / 2})" font-size="12" font-weight="600" fill="${textFill}">${escapeProcessXml(box.title)}</text>`
        : `<text x="${w / 2}" y="${header / 2}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" fill="${textFill}">${escapeProcessXml(box.title)}</text>`;
    return `<g class="st-diagramProcessLane" data-process-lane="${escapeProcessXml(box.title)}"><rect x="0.5" y="0.5" width="${Math.max(1, w - 1)}" height="${Math.max(1, h - 1)}" rx="6" fill="${surface}" stroke="${border}" stroke-width="1"/>${divider}${label}</g>`;
  }

  const fill = "var(--st-semantic-surface-raised, #ffffff)";
  const stroke = "var(--st-semantic-border-strong, #64748b)";
  const ink = "var(--st-semantic-text-primary, #172033)";
  const muted = "var(--st-semantic-text-secondary, #475569)";

  let shapeSvg = "";
  if (box.variant === "start" || box.variant === "end") {
    const rx = Math.max(10, (h - 2) / 2);
    const strokeWidth = box.variant === "end" ? 2.5 : 1.5;
    shapeSvg = `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
  } else if (box.variant === "decision") {
    const chamfer = Math.min(18, Math.round(h * 0.3));
    const pts = `${chamfer},1 ${w - chamfer},1 ${w - 1},${h / 2} ${w - chamfer},${h - 1} ${chamfer},${h - 1} 1,${h / 2}`;
    shapeSvg = `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>`;
  } else if (box.variant === "subprocess") {
    shapeSvg =
      `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${g.cornerRadius}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>` +
      `<rect x="5" y="5" width="${Math.max(1, w - 10)}" height="${Math.max(1, h - 10)}" rx="${Math.max(4, g.cornerRadius - 3)}" fill="none" stroke="${stroke}" stroke-width="1"/>`;
  } else {
    shapeSvg = `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${g.cornerRadius}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
  }

  const badgeWidth = box.stepNumber !== undefined ? Math.max(g.badgeSize, Array.from(box.stepNumber).length * 7 + 10) : 0;
  const badgeSvg =
    box.stepNumber === undefined
      ? ""
      : `<rect x="8" y="6" width="${badgeWidth}" height="${g.badgeSize}" rx="${g.badgeSize / 2}" fill="var(--st-semantic-surface-subtle, #f1f5f9)" stroke="var(--st-semantic-border-subtle, #cbd5e1)" stroke-width="1"/>` +
        `<text x="${8 + badgeWidth / 2}" y="${6 + g.badgeSize / 2 + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="${muted}" data-process-step-badge="">${escapeProcessXml(box.stepNumber)}</text>`;

  const titleLines = box.titleLines.length > 0 ? box.titleLines : [box.title];
  const subLines = box.subtitleLines;
  const totalTextHeight =
    titleLines.length * g.titleLineHeight + (subLines.length > 0 ? 2 + subLines.length * g.subtitleLineHeight : 0);
  const blockTop = (h - totalTextHeight) / 2;

  // Keep text centred horizontally while staying clear of a top-left step badge on narrow boxes.
  const maxTitleChars = Math.max(...titleLines.map((line) => Array.from(line).length), 0);
  const approxHalfW = (maxTitleChars * g.titleSize * 0.56) / 2;
  const badgeClearX = box.stepNumber !== undefined ? 8 + badgeWidth + 4 : 0;
  const textX = badgeClearX > 0 && w / 2 - approxHalfW < badgeClearX ? Math.min(w - 12, (badgeClearX + w - 8) / 2) : w / 2;

  let textSvg = "";
  titleLines.forEach((line, idx) => {
    const baseline = Math.round((blockTop + idx * g.titleLineHeight + g.titleSize) * 100) / 100;
    textSvg += `<text x="${textX}" y="${baseline}" text-anchor="middle" font-size="${g.titleSize}" font-weight="600" fill="${ink}">${escapeProcessXml(line)}</text>`;
  });
  subLines.forEach((line, idx) => {
    const baseline =
      Math.round((blockTop + titleLines.length * g.titleLineHeight + 2 + idx * g.subtitleLineHeight + g.subtitleSize) * 100) / 100;
    textSvg += `<text x="${textX}" y="${baseline}" text-anchor="middle" font-size="${g.subtitleSize}" font-weight="400" fill="${muted}">${escapeProcessXml(line)}</text>`;
  });

  return `<g class="st-diagramProcessBox" data-process-variant="${escapeProcessXml(box.variant)}"><title>${escapeProcessXml(box.title)}</title>${shapeSvg}${badgeSvg}${textSvg}</g>`;
}

/** Accessible HTML step table fallback shared by static SVG dossiers and framework hosts. */
export function renderProcessTable(document: SemanticDocument): string {
  const e = escapeProcessXml;
  const entities = Object.values(document.entities).sort((a, b) => byCodeUnit(a.id, b.id));
  const steps = entities.filter((entity) => entity.type === "step");
  const stepNumbers = computeProcessStepNumbers(document, steps);

  const laneByStep = new Map<string, string>();
  const transitionsBySource = new Map<string, { readonly targetName: string; readonly label?: string; readonly kind?: string }[]>();

  for (const relation of Object.values(document.relations).sort((a, b) => byCodeUnit(a.id, b.id))) {
    if (relation.type === "inLane") {
      const laneId = relation.endpoints.find((ep) => ep.role === "lane")?.target;
      const stepId = relation.endpoints.find((ep) => ep.role === "step")?.target;
      if (laneId !== undefined && stepId !== undefined) {
        const lane = document.entities[laneId];
        laneByStep.set(stepId, (lane ? textAttr(lane, "name") : undefined) ?? laneId);
      }
      continue;
    }
    if (relation.type === "transition") {
      const sourceId = relation.endpoints.find((ep) => ep.role === "source")?.target;
      const targetId = relation.endpoints.find((ep) => ep.role === "target")?.target;
      if (sourceId !== undefined && targetId !== undefined) {
        const target = document.entities[targetId];
        const targetName = (target ? textAttr(target, "name") : undefined) ?? targetId;
        const label = textAttr(relation, "label");
        const kindAttr = relation.attributes["kind"];
        const kind = kindAttr?.kind === "enum" && kindAttr.value !== "normal" ? kindAttr.value : undefined;
        const list = transitionsBySource.get(sourceId) ?? [];
        list.push({ targetName, ...(label === undefined ? {} : { label }), ...(kind === undefined ? {} : { kind }) });
        transitionsBySource.set(sourceId, list);
      }
    }
  }

  const orderedSteps = [...steps].sort((a, b) => {
    const na = stepNumbers.get(a.id) ?? "";
    const nb = stepNumbers.get(b.id) ?? "";
    const pa = Number.parseInt(na, 10);
    const pb = Number.parseInt(nb, 10);
    if (Number.isFinite(pa) && Number.isFinite(pb) && pa !== pb) return pa - pb;
    return byCodeUnit(na, nb) || byCodeUnit(a.id, b.id);
  });

  let rows = "";
  for (const step of orderedSteps) {
    const num = stepNumbers.get(step.id) ?? "—";
    const laneName = laneByStep.get(step.id) ?? "—";
    const name = textAttr(step, "name") ?? step.id;
    const subtitle = textAttr(step, "subtitle");
    const action = subtitle ? `${name} (${subtitle})` : name;
    const outgoing = transitionsBySource.get(step.id) ?? [];
    const nextText =
      outgoing.length === 0
        ? "—"
        : outgoing
            .map((t) => {
              const cond = [t.label, t.kind].filter(Boolean).join(", ");
              return cond ? `${t.targetName} [${cond}]` : t.targetName;
            })
            .join("; ");
    rows += `<tr data-process-table-step="${e(step.id)}"><td>${e(num)}</td><td>${e(laneName)}</td><th scope="row">${e(action)}</th><td>${e(nextText)}</td></tr>`;
  }

  return (
    `<details class="st-diagramProcessTable"><summary>Process steps and transitions</summary>` +
    `<table><caption>Process flow</caption><thead><tr><th scope="col">Step</th><th scope="col">Lane</th><th scope="col">Action</th><th scope="col">Next / Condition</th></tr></thead><tbody>${rows}</tbody></table>` +
    `</details>`
  );
}
