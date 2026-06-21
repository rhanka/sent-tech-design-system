import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

import { contrastTextForTone } from "./chartContrast.js";

export type ChordDiagramTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ChordDiagramFlow = {
  from: string;
  to: string;
  value: number;
};

export type ChordDiagramProps = {
  data: ChordDiagramFlow[];
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: ChordDiagramTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

const GAP = 0.04;
const ARC_WIDTH = 14;

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function polar(cx: number, cy: number, radius: number, angle: number): { x: number; y: number } {
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

function arcPath(cx: number, cy: number, inner: number, outer: number, start: number, end: number): string {
  const large = end - start > Math.PI ? 1 : 0;
  const o0 = polar(cx, cy, outer, start);
  const o1 = polar(cx, cy, outer, end);
  const i1 = polar(cx, cy, inner, end);
  const i0 = polar(cx, cy, inner, start);
  return `M ${o0.x} ${o0.y} A ${outer} ${outer} 0 ${large} 1 ${o1.x} ${o1.y} L ${i1.x} ${i1.y} A ${inner} ${inner} 0 ${large} 0 ${i0.x} ${i0.y} Z`;
}

type ArcEntry = {
  id: string;
  tone: ChordDiagramTone;
  value: number;
  span: number;
  path: string;
  labelX: number;
  labelY: number;
  labelAngle: number;
  textColor: string;
};

type RibbonEntry = {
  index: number;
  from: string;
  to: string;
  value: number;
  tone: ChordDiagramTone;
  strokeWidth: number;
  path: string;
  midX: number;
  midY: number;
};

type ChordLayout = {
  cx: number;
  cy: number;
  inner: number;
  outer: number;
  arcs: ArcEntry[];
  ribbons: RibbonEntry[];
};

@Component({
  selector: "st-chord-diagram",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-chordDiagram__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="handleLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          <g class="st-chordDiagram__ribbons">
            @for (ribbon of layout.ribbons; track ribbon.index) {
              <path
                [class]="ribbonClass(ribbon)"
                [attr.d]="ribbon.path"
                [attr.stroke-width]="ribbon.strokeWidth"
                [attr.data-flow-index]="ribbon.index"
              ></path>
            }
          </g>

          <g class="st-chordDiagram__arcs">
            @for (arc of layout.arcs; track arc.id) {
              <path
                [class]="arcClass(arc)"
                [attr.d]="arc.path"
              ></path>
              @if (arc.span > 0.34) {
                <text
                  class="st-chordDiagram__arcLabel"
                  [attr.x]="arc.labelX"
                  [attr.y]="arc.labelY"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  [attr.fill]="arc.textColor"
                >{{ displayLabel(arc.id) }}</text>
              }
            }
          </g>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredFlowIndex !== null && hoveredRibbon) {
        <div
          class="st-chordDiagram__tooltip"
          role="presentation"
          [style.left]="tooltipLeft()"
          [style.top]="tooltipTop()"
        >
          <span class="st-chordDiagram__tooltipLabel">{{ tooltipLabel() }}</span>
          <span class="st-chordDiagram__tooltipValue">{{ tooltipValue() }}</span>
        </div>
      }
    </div>
  `,
})
export class ChordDiagram {
  static readonly stComponentName = "ChordDiagram";
  readonly componentName = "ChordDiagram";
  @NgInput() data!: ChordDiagramFlow[];
  @NgInput() labels?: Record<string, string>;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  hoveredFlowIndex: number | null = null;

  get widthValue(): number {
    return this.width ?? 360;
  }

  get heightValue(): number {
    return this.height ?? 360;
  }

  get hostClass(): string {
    return ["st-chordDiagram", this.classInput].filter(Boolean).join(" ");
  }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  displayLabel(id: string): string {
    return this.labels?.[id] ?? id;
  }

  get layout(): ChordLayout {
    const data = this.data ?? [];
    const w = this.widthValue;
    const h = this.heightValue;
    const cx = w / 2;
    const cy = h / 2;
    const outer = Math.max(Math.min(w, h) / 2 - 6, 1);
    const inner = Math.max(outer - ARC_WIDTH, 1);
    const ribbonRadius = Math.max(inner - 2, 0);

    const flows = data
      .map((flow, index) => ({ flow, index, value: magnitude(flow.value) }))
      .filter((entry) => entry.value > 0);

    const order: string[] = [];
    const total = new Map<string, number>();
    for (const { flow, value } of flows) {
      for (const id of [flow.from, flow.to]) {
        if (!total.has(id)) {
          total.set(id, 0);
          order.push(id);
        }
      }
      total.set(flow.from, (total.get(flow.from) ?? 0) + value);
      total.set(flow.to, (total.get(flow.to) ?? 0) + value);
    }

    const grandTotal = order.reduce((sum, id) => sum + (total.get(id) ?? 0), 0);
    if (order.length === 0 || grandTotal <= 0) {
      return { cx, cy, inner, outer, arcs: [], ribbons: [] };
    }

    const totalGap = GAP * order.length;
    const usable = Math.max(Math.PI * 2 - totalGap, 0.0001);

    type ArcInfo = {
      id: string;
      tone: ChordDiagramTone;
      start: number;
      end: number;
      mid: number;
      cursor: number;
    };

    const arcMap = new Map<string, ArcInfo>();
    const arcs: ArcEntry[] = [];

    let angle = -Math.PI / 2;
    order.forEach((id, index) => {
      const span = (usable * (total.get(id) ?? 0)) / grandTotal;
      const start = angle + GAP / 2;
      const end = start + span;
      angle = end + GAP / 2;
      const tone = TONES[index % TONES.length];
      const mid = (start + end) / 2;
      arcMap.set(id, { id, tone, start, end, mid, cursor: start });
      const labelRadius = (inner + outer) / 2;
      const labelPoint = polar(cx, cy, labelRadius, mid);
      arcs.push({
        id,
        tone,
        value: total.get(id) ?? 0,
        span,
        path: arcPath(cx, cy, inner, outer, start, end),
        labelX: labelPoint.x,
        labelY: labelPoint.y,
        labelAngle: mid,
        textColor: contrastTextForTone(tone),
      });
    });

    const maxValue = Math.max(1, ...flows.map((entry) => entry.value));
    const ribbons: RibbonEntry[] = flows.map(({ flow, value, index }) => {
      const source = arcMap.get(flow.from)!;
      const target = arcMap.get(flow.to)!;
      const sourceSpan = (usable * value) / grandTotal;
      const targetSpan = (usable * value) / grandTotal;
      const s0 = source.cursor;
      const s1 = source.cursor + sourceSpan;
      source.cursor = s1;
      const t0 = target.cursor;
      const t1 = target.cursor + targetSpan;
      target.cursor = t1;

      const ps0 = polar(cx, cy, ribbonRadius, s0);
      const ps1 = polar(cx, cy, ribbonRadius, s1);
      const pt0 = polar(cx, cy, ribbonRadius, t0);
      const pt1 = polar(cx, cy, ribbonRadius, t1);

      const path =
        `M ${ps0.x} ${ps0.y} ` +
        `Q ${cx} ${cy} ${pt1.x} ${pt1.y} ` +
        `A ${ribbonRadius} ${ribbonRadius} 0 0 1 ${pt0.x} ${pt0.y} ` +
        `Q ${cx} ${cy} ${ps1.x} ${ps1.y} ` +
        `A ${ribbonRadius} ${ribbonRadius} 0 0 0 ${ps0.x} ${ps0.y} Z`;

      return {
        index,
        from: flow.from,
        to: flow.to,
        value,
        tone: source.tone,
        strokeWidth: Math.max(1, (value / maxValue) * 4),
        path,
        midX: cx,
        midY: cy,
      };
    });

    return { cx, cy, inner, outer, arcs, ribbons };
  }

  get hoveredRibbon(): RibbonEntry | undefined {
    if (this.hoveredFlowIndex === null) return undefined;
    return this.layout.ribbons.find((r) => r.index === this.hoveredFlowIndex);
  }

  get dataValueItems(): string[] {
    const data = this.data ?? [];
    return data
      .filter((flow) => magnitude(flow.value) > 0)
      .map((flow) => `${this.displayLabel(flow.from)} -> ${this.displayLabel(flow.to)}: ${flow.value}`);
  }

  ribbonClass(ribbon: RibbonEntry): string {
    const dim = this.hoveredFlowIndex !== null && this.hoveredFlowIndex !== ribbon.index;
    return [
      "st-chordDiagram__ribbon",
      `st-chordDiagram__ribbon--${ribbon.tone}`,
      dim ? "st-chordDiagram__ribbon--dim" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  arcClass(arc: ArcEntry): string {
    return `st-chordDiagram__arc st-chordDiagram__arc--${arc.tone}`;
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      this.hoveredFlowIndex = null;
      return;
    }
    const raw = target.getAttribute("data-flow-index");
    if (raw === null) {
      this.hoveredFlowIndex = null;
      return;
    }
    const index = Number(raw);
    this.hoveredFlowIndex = Number.isInteger(index) ? index : null;
  }

  handleLeave(): void {
    this.hoveredFlowIndex = null;
  }

  tooltipLeft(): string {
    const ribbon = this.hoveredRibbon;
    if (!ribbon) return "0%";
    return `${(ribbon.midX / this.widthValue) * 100}%`;
  }

  tooltipTop(): string {
    const ribbon = this.hoveredRibbon;
    if (!ribbon) return "0%";
    return `${(ribbon.midY / this.heightValue) * 100}%`;
  }

  tooltipLabel(): string {
    const ribbon = this.hoveredRibbon;
    if (!ribbon) return "";
    return `${this.displayLabel(ribbon.from)} -> ${this.displayLabel(ribbon.to)}`;
  }

  tooltipValue(): number | string {
    const ribbon = this.hoveredRibbon;
    if (!ribbon) return "";
    return ribbon.value;
  }
}
