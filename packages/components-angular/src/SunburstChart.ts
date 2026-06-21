import { Component, Input as NgInput } from "@angular/core";

import { contrastTextForTone } from "./chartContrast.js";

export type SunburstChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type SunburstChartDatum = {
  label: string;
  value?: number;
  tone?: SunburstChartTone;
  children?: SunburstChartDatum[];
};

export type SunburstChartProps = {
  data: SunburstChartDatum;
  width?: number;
  height?: number;
  legend?: boolean;
  label: string;
  class?: string;
};

type ArcDatum = {
  datum: SunburstChartDatum;
  pathLabel: string[];
  value: number;
  tone: SunburstChartTone;
  depth: number;
  start: number;
  end: number;
  path: string;
  labelX: number;
  labelY: number;
};

const TONES: SunburstChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

@Component({
  selector: "st-sunburst-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-sunburstChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="handleLeave()"
      >
        <svg
          [attr.viewBox]="'0 0 ' + widthValue + ' ' + heightValue"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (arc of arcs; track arcKey(arc)) {
            <path
              [class]="arcClass(arc, $index)"
              [attr.d]="arc.path"
              [attr.data-chart-index]="$index"
            ></path>
          }

          @for (arc of arcs; track arcKey(arc)) {
            @if (arc.end - arc.start > 0.28) {
              <text
                class="st-sunburstChart__label"
                [attr.x]="arc.labelX"
                [attr.y]="arc.labelY"
                text-anchor="middle"
                dominant-baseline="middle"
                [attr.fill]="contrastText(arc.tone)"
              >
                {{ arc.datum.label }}
              </text>
            }
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label + ' data'">
        @for (item of leafItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && arcs[hoveredIndex]) {
        <div
          class="st-sunburstChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft()"
          [style.top]="tooltipTop()"
        >
          <span class="st-sunburstChart__tooltipLabel">{{ tooltipLabel() }}</span>
          <span class="st-sunburstChart__tooltipValue">{{ tooltipValue() }}</span>
        </div>
      }

      @if (legend && legendItems.length > 0) {
        <ul class="st-sunburstChart__legend" aria-hidden="true">
          @for (item of legendItems; track item.label) {
            <li class="st-sunburstChart__legendItem">
              <span [class]="'st-sunburstChart__legendSwatch st-sunburstChart__legendSwatch--' + item.tone"></span>
              {{ item.label }}
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class SunburstChart {
  static readonly stComponentName = "SunburstChart";
  readonly componentName = "SunburstChart";

  @NgInput() data!: SunburstChartDatum;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() legend?: boolean;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  hoveredIndex: number | null = null;

  get widthValue(): number {
    return this.width ?? 320;
  }

  get heightValue(): number {
    return this.height ?? 320;
  }

  get hostClass(): string {
    return ["st-sunburstChart", this.classInput].filter(Boolean).join(" ");
  }

  private leafValue(value: number | undefined): number {
    return Number.isFinite(value) && (value ?? 0) > 0 ? (value as number) : 0;
  }

  private sumValue(node: SunburstChartDatum): number {
    if (node.children && node.children.length > 0) {
      return node.children.reduce((sum, child) => sum + this.sumValue(child), 0);
    }
    return this.leafValue(node.value);
  }

  private maxDepth(node: SunburstChartDatum, depth = 0): number {
    if (!node.children || node.children.length === 0) return depth;
    return Math.max(depth, ...node.children.map((child) => this.maxDepth(child, depth + 1)));
  }

  private pt(cx: number, cy: number, radius: number, angle: number) {
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  }

  private buildArcPath(
    cx: number,
    cy: number,
    innerRadius: number,
    outerRadius: number,
    start: number,
    end: number
  ): string {
    const safeEnd = Math.min(end, start + Math.PI * 2 - 0.0001);
    const large = safeEnd - start > Math.PI ? 1 : 0;
    const outerStart = this.pt(cx, cy, outerRadius, start);
    const outerEnd = this.pt(cx, cy, outerRadius, safeEnd);

    if (innerRadius <= 0) {
      return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} Z`;
    }

    const innerEnd = this.pt(cx, cy, innerRadius, safeEnd);
    const innerStart = this.pt(cx, cy, innerRadius, start);
    return `M ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 ${large} 0 ${innerStart.x} ${innerStart.y} Z`;
  }

  get arcs(): ArcDatum[] {
    const total = this.sumValue(this.data);
    if (total <= 0 || !this.data.children || this.data.children.length === 0) return [];

    const cx = this.widthValue / 2;
    const cy = this.heightValue / 2;
    const ringCount = Math.max(1, this.maxDepth(this.data));
    const outerLimit = Math.max(Math.min(this.widthValue, this.heightValue) / 2 - 6, 1);
    const ring = outerLimit / ringCount;
    const out: ArcDatum[] = [];

    const visit = (
      node: SunburstChartDatum,
      depth: number,
      start: number,
      end: number,
      pathLabel: string[],
      inheritedTone: SunburstChartTone,
      siblingIndex: number
    ) => {
      if (depth > 0) {
        const tone = node.tone ?? inheritedTone ?? TONES[siblingIndex % TONES.length];
        const innerRadius = (depth - 1) * ring;
        const outerRadius = depth * ring;
        const midAngle = (start + end) / 2;
        const midRadius = (innerRadius + outerRadius) / 2;
        const labelPoint = this.pt(cx, cy, midRadius, midAngle);
        out.push({
          datum: node,
          pathLabel,
          value: this.sumValue(node),
          tone,
          depth,
          start,
          end,
          path: this.buildArcPath(cx, cy, innerRadius, outerRadius, start, end),
          labelX: labelPoint.x,
          labelY: labelPoint.y,
        });
      }

      const children = node.children ?? [];
      const nodeTotal = children.reduce((sum, child) => sum + this.sumValue(child), 0);
      if (children.length === 0 || nodeTotal <= 0) return;

      let cursor = start;
      children.forEach((child, childIndex) => {
        const value = this.sumValue(child);
        if (value <= 0) return;
        const span = ((end - start) * value) / nodeTotal;
        const tone = child.tone ?? (depth === 0 ? TONES[childIndex % TONES.length] : inheritedTone);
        visit(child, depth + 1, cursor, cursor + span, [...pathLabel, child.label], tone, childIndex);
        cursor += span;
      });
    };

    visit(this.data, 0, -Math.PI / 2, Math.PI * 1.5, [this.data.label], "category1", 0);
    return out;
  }

  get leafItems(): string[] {
    const items: string[] = [];
    const collect = (node: SunburstChartDatum, path: string[]) => {
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => collect(child, [...path, child.label]));
        return;
      }
      items.push(`${path.join(", ")}: ${this.leafValue(node.value)}`);
    };
    collect(this.data, [this.data.label]);
    return items.filter((item) => !item.endsWith(": 0"));
  }

  get legendItems(): { label: string; tone: SunburstChartTone }[] {
    return (this.data.children ?? []).map((child, index) => ({
      label: child.label,
      tone: child.tone ?? TONES[index % TONES.length],
    }));
  }

  arcKey(arc: ArcDatum): string {
    return arc.pathLabel.join("/");
  }

  arcClass(arc: ArcDatum, index: number): string {
    const base = `st-sunburstChart__arc st-sunburstChart__arc--${arc.tone}`;
    if (this.hoveredIndex !== null && this.hoveredIndex !== index) {
      return base + " st-sunburstChart__arc--dim";
    }
    return base;
  }

  contrastText(tone: SunburstChartTone): string {
    return contrastTextForTone(tone);
  }

  tooltipLeft(): string {
    if (this.hoveredIndex === null) return "0%";
    const arc = this.arcs[this.hoveredIndex];
    return `${(arc.labelX / this.widthValue) * 100}%`;
  }

  tooltipTop(): string {
    if (this.hoveredIndex === null) return "0%";
    const arc = this.arcs[this.hoveredIndex];
    return `${(arc.labelY / this.heightValue) * 100}%`;
  }

  tooltipLabel(): string {
    if (this.hoveredIndex === null) return "";
    return this.arcs[this.hoveredIndex]?.pathLabel.join(", ") ?? "";
  }

  tooltipValue(): number | string {
    if (this.hoveredIndex === null) return "";
    return this.arcs[this.hoveredIndex]?.value ?? "";
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      this.hoveredIndex = null;
      return;
    }
    const raw = Number(target.getAttribute("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && !Number.isNaN(raw) ? raw : null;
  }

  handleLeave(): void {
    this.hoveredIndex = null;
  }
}
