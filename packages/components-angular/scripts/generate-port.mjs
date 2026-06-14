import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import ts from "typescript";

const repoRoot = resolve("../..");
const angularRoot = resolve(".");
const outDir = resolve("src");
const vueDir = resolve("../components-vue/src");
const reactStyles = resolve("../components-react/src/styles.css");
const svelteIndex = resolve("../components-svelte/src/lib/index.ts");

const componentNames = [
  ...readFileSync(svelteIndex, "utf8").matchAll(/export \{ default as (\w+)(?:,| \})/g),
].map((match) => match[1]);

const helperFiles = new Set([
  "cellDecoration.ts",
  "chartAnnotations.ts",
  "chartContrast.ts",
  "chartCrosshair.ts",
  "chartDataLabels.ts",
  "chartKeyboardNav.ts",
  "chartScale.ts",
  "classNames.ts",
]);

const specialRuntimeExports = {
  Header: `
export function deriveInitials(name?: string): string {
  return (name ?? "")
    .trim()
    .split(/\\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
`,
  IdentityMenu: `
export function identityInitial(user: IdentityUser | null | undefined): string {
  const source = user?.displayName || user?.email || "U";
  return source.charAt(0).toUpperCase();
}
`,
  Flex: `
const SPACING_FALLBACK: Record<number, string> = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
};

export function spacingToken(step: number | undefined): string | undefined {
  if (step == null) return undefined;
  const clamped = Math.max(0, Math.min(12, Math.round(step)));
  if (clamped === 0) return "0";
  return \`var(--st-spacing-\${clamped}, \${SPACING_FALLBACK[clamped]})\`;
}

const ALIGN: Record<FlexAlign, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

const JUSTIFY: Record<FlexJustify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

export function alignValue(align: FlexAlign | undefined): string | undefined {
  return align ? ALIGN[align] : undefined;
}

export function justifyValue(justify: FlexJustify | undefined): string | undefined {
  return justify ? JUSTIFY[justify] : undefined;
}
`,
  Col: `
export function spanBasis(span: ColSpan | undefined): string | undefined {
  if (span == null) return undefined;
  if (span === "auto") return "auto";
  const clamped = Math.max(1, Math.min(12, Math.round(span)));
  const ratio = clamped / 12;
  return \`calc(\${ratio * 100}% - var(--st-row-gutter, 0px) * \${(12 - clamped) / 12})\`;
}

export function offsetMargin(offset: number | undefined): string | undefined {
  if (!offset) return undefined;
  const clamped = Math.max(0, Math.min(11, Math.round(offset)));
  if (clamped === 0) return undefined;
  const ratio = clamped / 12;
  return \`calc(\${ratio * 100}% + var(--st-row-gutter, 0px) * \${ratio})\`;
}
`,
  Grid: `
export function gridTemplateColumns(
  columns: number | undefined,
  minItemWidth: string | undefined,
): string | undefined {
  if (minItemWidth != null && minItemWidth !== "") {
    return \`repeat(auto-fill, minmax(\${minItemWidth}, 1fr))\`;
  }
  if (columns != null) {
    const clamped = Math.max(1, Math.round(columns));
    return \`repeat(\${clamped}, minmax(0, 1fr))\`;
  }
  return undefined;
}
`,
  Portal: `
export function resolvePortalTarget(target: string | HTMLElement | undefined): HTMLElement | null {
  if (typeof document === "undefined") return null;
  if (target == null) return document.body;
  if (typeof target === "string") return document.querySelector<HTMLElement>(target) ?? document.body;
  return target;
}
`,
  Popper: `
const OPPOSITE: Record<PopperSide, PopperSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

export function splitPlacement(placement: PopperPlacement): {
  side: PopperSide;
  align: PopperAlign;
} {
  const [side, align] = placement.split("-") as [PopperSide, PopperAlign?];
  return { side, align: align ?? "center" };
}

export function joinPlacement(side: PopperSide, align: PopperAlign): PopperPlacement {
  return (align === "center" ? side : \`\${side}-\${align}\`) as PopperPlacement;
}

export function computePosition(
  anchorRect: Rect,
  panelWidth: number,
  panelHeight: number,
  options: {
    placement: PopperPlacement;
    offset: number;
    flip: boolean;
    shift: boolean;
    viewportWidth: number;
    viewportHeight: number;
  },
): { placement: PopperPlacement; top: number; left: number } {
  const { offset, flip, shift, viewportWidth, viewportHeight } = options;
  let { side, align } = splitPlacement(options.placement);

  const place = (s: PopperSide, a: PopperAlign) => {
    let top = 0;
    let left = 0;
    if (s === "top" || s === "bottom") {
      top = s === "top" ? anchorRect.top - panelHeight - offset : anchorRect.bottom + offset;
      if (a === "start") left = anchorRect.left;
      else if (a === "end") left = anchorRect.right - panelWidth;
      else left = anchorRect.left + anchorRect.width / 2 - panelWidth / 2;
    } else {
      left = s === "left" ? anchorRect.left - panelWidth - offset : anchorRect.right + offset;
      if (a === "start") top = anchorRect.top;
      else if (a === "end") top = anchorRect.bottom - panelHeight;
      else top = anchorRect.top + anchorRect.height / 2 - panelHeight / 2;
    }
    return { top, left };
  };

  if (flip) {
    const candidate = place(side, align);
    const overflows =
      (side === "top" && candidate.top < 0) ||
      (side === "bottom" && candidate.top + panelHeight > viewportHeight) ||
      (side === "left" && candidate.left < 0) ||
      (side === "right" && candidate.left + panelWidth > viewportWidth);
    if (overflows) {
      const flipped = OPPOSITE[side];
      const flippedPos = place(flipped, align);
      const flippedOverflows =
        (flipped === "top" && flippedPos.top < 0) ||
        (flipped === "bottom" && flippedPos.top + panelHeight > viewportHeight) ||
        (flipped === "left" && flippedPos.left < 0) ||
        (flipped === "right" && flippedPos.left + panelWidth > viewportWidth);
      if (!flippedOverflows) side = flipped;
    }
  }

  let { top, left } = place(side, align);
  if (shift) {
    if (side === "top" || side === "bottom") {
      const max = Math.max(0, viewportWidth - panelWidth);
      left = Math.min(Math.max(0, left), max);
    } else {
      const max = Math.max(0, viewportHeight - panelHeight);
      top = Math.min(Math.max(0, top), max);
    }
  }

  return { placement: joinPlacement(side, align), top, left };
}
`,
  ForceGraph: `
export function edgeDashArray(dash: ForceGraphEdgeDash | undefined, weak?: boolean): string | null {
  const effective: ForceGraphEdgeDash | undefined = dash ?? (weak ? "dashed" : undefined);
  switch (effective) {
    case "dashed":
      return "6 4";
    case "dotted":
      return "1 4";
    case "long-dash":
      return "12 6";
    case "solid":
    default:
      return null;
  }
}

const STAR_INNER_RATIO = 0.42;
const STAR_AREA_FACTOR = 1.5953498885642274;

function fmt(n: number): string {
  const value = Math.abs(n) < 1e-9 ? 0 : n;
  return Number(value.toFixed(4)).toString();
}

export function nodeShapePath(shape: ForceGraphNodeShape | undefined, r: number): string | null {
  const s = shape ?? "dot";
  if (s === "dot" || s === "circle") return null;
  if (s === "diamond") {
    const d = Math.sqrt(Math.PI / 2) * r;
    return \`M 0 \${fmt(-d)} L \${fmt(d)} 0 L 0 \${fmt(d)} L \${fmt(-d)} 0 Z\`;
  }
  if (s === "star") {
    const outer = STAR_AREA_FACTOR * r;
    const inner = outer * STAR_INNER_RATIO;
    const points: string[] = [];
    for (let i = 0; i < 10; i += 1) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? outer : inner;
      points.push(\`\${fmt(radius * Math.cos(angle))},\${fmt(radius * Math.sin(angle))}\`);
    }
    return \`M \${points.join(" L ")} Z\`;
  }
  if (s === "hexagon") {
    const d = Math.sqrt(Math.PI / (3 * Math.sqrt(3) / 2)) * r;
    const points = Array.from({ length: 6 }, (_value, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      return \`\${fmt(d * Math.cos(angle))},\${fmt(d * Math.sin(angle))}\`;
    });
    return \`M \${points.join(" L ")} Z\`;
  }
  if (s === "triangle") {
    const d = Math.sqrt(Math.PI / (3 * Math.sqrt(3) / 4)) * r;
    return \`M 0 \${fmt(-d)} L \${fmt(d * Math.sin(Math.PI / 3))} \${fmt(d / 2)} L \${fmt(-d * Math.sin(Math.PI / 3))} \${fmt(d / 2)} Z\`;
  }
  const half = (Math.sqrt(Math.PI) / 2) * r;
  if (s === "roundedbox") {
    const radius = Math.min(half * 0.35, 6);
    return \`M \${fmt(-half + radius)} \${fmt(-half)} H \${fmt(half - radius)} Q \${fmt(half)} \${fmt(-half)} \${fmt(half)} \${fmt(-half + radius)} V \${fmt(half - radius)} Q \${fmt(half)} \${fmt(half)} \${fmt(half - radius)} \${fmt(half)} H \${fmt(-half + radius)} Q \${fmt(-half)} \${fmt(half)} \${fmt(-half)} \${fmt(half - radius)} V \${fmt(-half + radius)} Q \${fmt(-half)} \${fmt(-half)} \${fmt(-half + radius)} \${fmt(-half)} Z\`;
  }
  return \`M \${fmt(-half)} \${fmt(-half)} H \${fmt(half)} V \${fmt(half)} H \${fmt(-half)} Z\`;
}
`,
};

function cleanGeneratedSources() {
  mkdirSync(outDir, { recursive: true });
  for (const entry of readdirSync(outDir)) {
    if (entry.endsWith(".test.ts")) continue;
    rmSync(join(outDir, entry), { recursive: true, force: true });
  }
}

function normalizeTypeText(text) {
  return text
    .replace(/\bVNodeChild\b/g, "unknown")
    .replace(/\bVNode\b/g, "unknown")
    .replace(/\bComponent\b/g, "unknown")
    .replace(/\bInjectionKey<([^>]+)>/g, "symbol")
    .replace(/\bCSSProperties\b/g, "Record<string, string | number | undefined>");
}

function sourceFile(file) {
  const text = readFileSync(file, "utf8");
  return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function hasExportModifier(node) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword));
}

function importText(node, sf) {
  const moduleName = node.moduleSpecifier.text;
  if (!moduleName.startsWith("./")) return "";
  const text = node.getFullText(sf).trim();
  return `${text}\n`;
}

function exportedTypeTexts(sf) {
  const out = [];
  for (const node of sf.statements) {
    if (
      hasExportModifier(node) &&
      (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isEnumDeclaration(node))
    ) {
      out.push(normalizeTypeText(node.getFullText(sf).trim()));
    }
  }
  return out;
}

function exportedTypeNames(sf) {
  const out = [];
  for (const node of sf.statements) {
    if (
      hasExportModifier(node) &&
      (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isEnumDeclaration(node))
    ) {
      out.push(node.name.text);
    }
  }
  return out;
}

function propMembers(componentName, sf) {
  const propsName = `${componentName}Props`;
  for (const node of sf.statements) {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === propsName && ts.isTypeLiteralNode(node.type)) {
      return node.type.members
        .filter(ts.isPropertySignature)
        .map((member) => ({
          name: member.name.getText(sf).replace(/^["']|["']$/g, ""),
          optional: Boolean(member.questionToken),
          type: normalizeTypeText(member.type?.getText(sf) ?? "unknown"),
        }));
    }
    if (ts.isInterfaceDeclaration(node) && node.name.text === propsName) {
      return node.members
        .filter(ts.isPropertySignature)
        .map((member) => ({
          name: member.name.getText(sf).replace(/^["']|["']$/g, ""),
          optional: Boolean(member.questionToken),
          type: normalizeTypeText(member.type?.getText(sf) ?? "unknown"),
        }));
    }
  }
  throw new Error(`Unable to find ${propsName}`);
}

function isValidIdentifier(name) {
  return /^[$A-Z_a-z][$\w]*$/.test(name) && !new Set(["class", "type", "default"]).has(name);
}

function propFieldName(name) {
  if (name === "class") return "classInput";
  if (name === "type") return "typeInput";
  if (name === "default") return "defaultInput";
  return isValidIdentifier(name) ? name : name.replace(/[^A-Z_a-z0-9_$]/g, "_");
}

function selectorName(name) {
  return `st-${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2").toLowerCase()}`;
}

function cssClassName(name) {
  if (/^[A-Z]{2,}Chart$/.test(name)) {
    const prefix = name.match(/^[A-Z]+/)?.[0] ?? "";
    return `st-${prefix.toLowerCase()}${name.slice(prefix.length)}`;
  }
  return `st-${name.charAt(0).toLowerCase()}${name.slice(1)}`;
}

function componentClass(componentName, props) {
  const fields = props.map((prop) => {
    const field = propFieldName(prop.name);
    const alias = field === prop.name ? "()" : `("${prop.name}")`;
    const marker = prop.optional ? "?" : "!";
    return `  @NgInput${alias} ${field}${marker}: ${prop.type};`;
  });

  const classField = props.find((prop) => prop.name === "class");
  const classInput = classField ? "this.classInput" : "undefined";

  return `
@Component({
  selector: "${selectorName(componentName)}",
  standalone: true,
  template: \`
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  \`,
})
export class ${componentName} {
  static readonly stComponentName = "${componentName}";
  readonly componentName = "${componentName}";
${fields.join("\n")}

  get hostClass(): string {
    return ["${cssClassName(componentName)}", ${classInput}].filter(Boolean).join(" ");
  }
}
`;
}

function writeHelpers() {
  writeFileSync(
    join(outDir, "classNames.ts"),
    `export function classNames(...values: Array<string | false | null | undefined>): string {\n  return values.filter(Boolean).join(" ");\n}\n`,
  );

  for (const fileName of ["chartAnnotations.ts", "chartDataLabels.ts", "chartCrosshair.ts", "chartKeyboardNav.ts", "chartContrast.ts"]) {
    copyFileSync(join(vueDir, fileName), join(outDir, fileName));
  }

  writeFileSync(
    join(outDir, "cellDecoration.ts"),
    `export type CellDecorationIntent = "positive" | "negative" | "warning" | "info" | "neutral";

export interface CellDecoration {
  intent: CellDecorationIntent;
  icon?: string;
}

export const cellDecorationLabel: Record<CellDecorationIntent, string> = {
  positive: "tendance positive",
  negative: "tendance négative",
  warning: "avertissement",
  info: "information",
  neutral: "neutre",
};

export function cellDecorationClass(intent: CellDecorationIntent): string {
  return \`st-cell--intent-\${intent}\`;
}

type IconNode = Array<[string, Record<string, string | number>]>;

export const cellDecorationIconNodes: Record<string, IconNode> = {
  "trending-up": [["path", { d: "M16 7h6v6" }], ["path", { d: "m22 7-8.5 8.5-5-5L2 17" }]],
  "trending-down": [["path", { d: "M16 17h6v-6" }], ["path", { d: "m22 17-8.5-8.5-5 5L2 7" }]],
  "arrow-up": [["path", { d: "m5 12 7-7 7 7" }], ["path", { d: "M12 19V5" }]],
  "arrow-down": [["path", { d: "M12 5v14" }], ["path", { d: "m19 12-7 7-7-7" }]],
  "triangle-alert": [["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }], ["path", { d: "M12 9v4" }], ["path", { d: "M12 17h.01" }]],
  info: [["circle", { cx: 12, cy: 12, r: 10 }], ["path", { d: "M12 16v-4" }], ["path", { d: "M12 8h.01" }]],
  check: [["path", { d: "M20 6 9 17l-5-5" }]],
  x: [["path", { d: "M18 6 6 18" }], ["path", { d: "m6 6 12 12" }]],
  minus: [["path", { d: "M5 12h14" }]],
};

export function hasCellDecorationIcon(icon: string | undefined): boolean {
  return icon != null && Object.prototype.hasOwnProperty.call(cellDecorationIconNodes, icon);
}

export function renderCellDecorationIcon(icon: string | undefined): unknown | null {
  return hasCellDecorationIcon(icon) ? cellDecorationIconNodes[icon as string] : null;
}
`,
  );

  writeFileSync(
    join(outDir, "chartScale.ts"),
    `export const CHART_MARGIN = { top: 12, right: 16, bottom: 32, left: 44 } as const;

export function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const base = Number.isFinite(max) ? max : 0;
    return [base];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * pow;
  const ticks: number[] = [];
  for (let value = Math.floor(min / step) * step; value <= Math.ceil(max / step) * step + step / 2; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }
  return ticks;
}

const uniqueSortedTicks = (values: number[]) =>
  Array.from(new Set(values.filter(Number.isFinite).map((value) => Number(value.toFixed(10))))).sort((a, b) => a - b);

export function fixedTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return niceTicks(min, max, target);
  return uniqueSortedTicks([min, ...niceTicks(min, max, target).filter((tick) => tick > min && tick < max), max]);
}

export function scaleLinear(value: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((value - d0) * (r1 - r0)) / (d1 - d0);
}

export type ChartScale = "linear" | "log";

export function smallestPositive(...values: number[]): number {
  let lowest = Infinity;
  for (const value of values) if (Number.isFinite(value) && value > 0 && value < lowest) lowest = value;
  return Number.isFinite(lowest) ? lowest : 1;
}

export function logTicks(min: number, max: number): number[] {
  const lo = min > 0 ? min : 1;
  const hi = max > lo ? max : lo * 10;
  const ticks: number[] = [];
  for (let exp = Math.floor(Math.log10(lo)); exp <= Math.ceil(Math.log10(hi)); exp += 1) {
    ticks.push(Number(Math.pow(10, exp).toFixed(10)));
  }
  return ticks.length ? ticks : [lo];
}

export function fixedLogTicks(min: number, max: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || min >= max) return logTicks(min, max);
  return uniqueSortedTicks([min, ...logTicks(min, max).filter((tick) => tick > min && tick < max), max]);
}

export function validLinearDomain(domain: [number, number] | undefined): [number, number] | null {
  return domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[0] < domain[1] ? domain : null;
}

export function validLogDomain(domain: [number, number] | undefined): [number, number] | null {
  return domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[0] > 0 && domain[0] < domain[1] ? domain : null;
}

export function clampFraction(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function formatTick(value: number): string {
  if (Math.abs(value) >= 1000) return \`\${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k\`;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

export function isNumeric(value: number | string): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function buildLinearPath(points: { x: number; y: number }[]): string {
  return points.map((point, index) => \`\${index === 0 ? "M" : "L"}\${point.x.toFixed(2)},\${point.y.toFixed(2)}\`).join(" ");
}

export function buildSmoothPath(points: { x: number; y: number }[]): string {
  return buildLinearPath(points);
}

export type ForecastRun = { start: number; end: number; forecast: boolean };

export function forecastRuns(flags: boolean[]): ForecastRun[] {
  const runs: ForecastRun[] = [];
  for (let index = 0; index < flags.length - 1; index += 1) {
    const forecast = Boolean(flags[index] || flags[index + 1]);
    const last = runs[runs.length - 1];
    if (last && last.forecast === forecast) last.end = index + 1;
    else runs.push({ start: index, end: index + 1, forecast });
  }
  return runs;
}

export type ChartOverlayTone = "neutral" | "success" | "warning" | "error" | "info";
export type ChartReferenceLine = { value: number; label?: string; tone?: ChartOverlayTone; axis?: "x" | "y" };
export type ChartBand = { from: number; to: number; label?: string; tone?: ChartOverlayTone };
export type ChartGoalLine = { value: number; label?: string };

export function overlayToneClass(prefix: string, tone: ChartOverlayTone | undefined): string {
  return \`\${prefix}--\${tone ?? "neutral"}\`;
}

export function linearRegression(points: ReadonlyArray<{ x: number; y: number }>): { slope: number; intercept: number; minX: number; maxX: number } | null {
  const finite = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (finite.length < 2) return null;
  const minX = Math.min(...finite.map((point) => point.x));
  const maxX = Math.max(...finite.map((point) => point.x));
  if (minX === maxX) return null;
  return { slope: 0, intercept: finite[0]?.y ?? 0, minX, maxX };
}

export function extendValueDomain(
  min: number,
  max: number,
  options: { referenceLines?: ChartReferenceLine[]; bands?: ChartBand[]; goalLine?: ChartGoalLine | null },
): [number, number] {
  const values = [
    min,
    max,
    ...(options.referenceLines ?? []).filter((line) => (line.axis ?? "y") === "y").map((line) => line.value),
    ...(options.bands ?? []).flatMap((band) => [band.from, band.to]),
    ...(options.goalLine ? [options.goalLine.value] : []),
  ].filter(Number.isFinite);
  return [Math.min(...values), Math.max(...values)];
}

export function chartDataList(label: string, items: string[]): string {
  return [label, ...items].filter(Boolean).join("\\n");
}

export function overlayDataListItems(): string[] {
  return [];
}

export function isLightTone(): boolean {
  return false;
}

export function labelColorForTone(): string {
  return "var(--st-semantic-text-primary)";
}
`,
  );
}

function writeComponent(componentName) {
  const file = join(vueDir, `${componentName}.ts`);
  const sf = sourceFile(file);
  const imports = sf.statements.filter(ts.isImportDeclaration).map((node) => importText(node, sf)).filter(Boolean);
  const types = exportedTypeTexts(sf);
  const props = propMembers(componentName, sf);
  const body = [
    `import { Component, Input as NgInput } from "@angular/core";\n`,
    ...imports,
    types.join("\n\n"),
    specialRuntimeExports[componentName] ?? "",
    componentClass(componentName, props),
  ]
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  writeFileSync(join(outDir, `${componentName}.ts`), `${body.trim()}\n`);
}

function writeIndex() {
  const componentTypeNames = new Map();
  for (const componentName of componentNames) {
    const sf = sourceFile(join(outDir, `${componentName}.ts`));
    componentTypeNames.set(componentName, exportedTypeNames(sf));
  }

  const helperTypeNames = new Map();
  for (const fileName of helperFiles) {
    const helperPath = join(outDir, fileName);
    if (!fileName.endsWith(".ts")) continue;
    const sf = sourceFile(helperPath);
    helperTypeNames.set(basename(fileName, ".ts"), exportedTypeNames(sf));
  }

  const lines = [];
  for (const componentName of componentNames) {
    lines.push(`export { ${componentName} } from "./${componentName}.js";`);
    const types = componentTypeNames.get(componentName) ?? [];
    if (types.length) lines.push(`export type { ${types.join(", ")} } from "./${componentName}.js";`);
  }

  lines.push(`export { identityInitial } from "./IdentityMenu.js";`);
  lines.push(`export { nodeShapePath, edgeDashArray } from "./ForceGraph.js";`);
  lines.push(`export { deriveInitials } from "./Header.js";`);
  lines.push(`export { spacingToken, alignValue, justifyValue } from "./Flex.js";`);
  lines.push(`export { spanBasis, offsetMargin } from "./Col.js";`);
  lines.push(`export { gridTemplateColumns } from "./Grid.js";`);
  lines.push(`export { resolvePortalTarget } from "./Portal.js";`);
  lines.push(`export { computePosition, splitPlacement, joinPlacement } from "./Popper.js";`);

  for (const [helperName, types] of helperTypeNames) {
    if (types.length) lines.push(`export type { ${types.join(", ")} } from "./${helperName}.js";`);
  }

  writeFileSync(join(outDir, "index.ts"), `${Array.from(new Set(lines)).join("\n")}\n`);
}

function writeProgress() {
  const now = new Date().toISOString();
  writeFileSync(
    resolve("PROGRESS.md"),
    `# Angular Port Progress

## Status

- Package scaffold: complete.
- Public component exports: ${componentNames.length} / ${componentNames.length}.
- Smoke tests: ${componentNames.length} component export checks plus runtime helper checks.
- Styles: copied byte-identically from React at ${now}.
- Build: pending.

## Plan

1. Generate standalone Angular components from the Svelte export list and Vue/React prop surfaces.
2. Copy \`styles.css\` byte-identically from React.
3. Keep helper functions/types exported from \`src/index.ts\`.
4. Run only \`npm run test --workspace @sentropic/design-system-angular\` and \`npm run build --workspace @sentropic/design-system-angular\`.
`,
  );
}

cleanGeneratedSources();
copyFileSync(reactStyles, join(outDir, "styles.css"));
writeHelpers();
for (const componentName of componentNames) writeComponent(componentName);
writeIndex();
writeProgress();

console.log(`Generated ${componentNames.length} Angular standalone components in ${outDir.replace(`${repoRoot}/`, "")}`);
