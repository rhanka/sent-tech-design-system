import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ArcDiagramChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ArcDiagramChartLink = {
  from: string;
  to: string;
  weight: number;
};

export type ArcDiagramChartProps = {
  data: ArcDiagramChartLink[];
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: ArcDiagramChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

const MARGIN_X = 24;
const BASELINE_PAD = 28;
const MIN_NODE_R = 4;
const MAX_NODE_R = 9;

type NodeDatum = {
  id: string;
  tone: ArcDiagramChartTone;
  x: number;
  r: number;
  value: number;
};

type ArcDatum = {
  index: number;
  from: string;
  to: string;
  weight: number;
  tone: ArcDiagramChartTone;
  strokeWidth: number;
  path: string;
  midX: number;
  midY: number;
};

type LegendEntry = {
  label: string;
  tone: ArcDiagramChartTone;
};

type Layout = {
  baselineY: number;
  nodes: NodeDatum[];
  arcs: ArcDatum[];
  nodeX: Map<string, number>;
};

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

@Component({
  selector: "st-arc-diagram-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-arcDiagramChart__visual"
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
          <line
            class="st-arcDiagramChart__axis"
            [attr.x1]="MARGIN_X"
            [attr.y1]="layout.baselineY"
            [attr.x2]="widthValue - MARGIN_X"
            [attr.y2]="layout.baselineY"
          ></line>

          <g class="st-arcDiagramChart__arcs">
            @for (arc of layout.arcs; track arc.index) {
              <path
                [class]="arcClass(arc)"
                [attr.d]="arc.path"
                [attr.stroke-width]="arc.strokeWidth"
                [attr.data-link-index]="arc.index"
              ></path>
            }
          </g>

          <g class="st-arcDiagramChart__nodes">
            @for (node of layout.nodes; track node.id) {
              <circle
                [class]="nodeClass(node)"
                [attr.cx]="node.x"
                [attr.cy]="layout.baselineY"
                [attr.r]="node.r"
              ></circle>
            }
          </g>
        </svg>

        @if (legendEntries.length > 0) {
          <ul class="st-graphLegend st-arcDiagramChart__legend" aria-hidden="true">
            @for (entry of legendEntries; track entry.label) {
              <li class="st-graphLegend__item">
                <span [class]="legendSwatchClass(entry)"></span>
                <span class="st-graphLegend__label">{{ entry.label }}</span>
              </li>
            }
          </ul>
        }
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredArc; as arc) {
        <div
          class="st-arcDiagramChart__tooltip"
          role="presentation"
          [style.left]="(arc.midX / widthValue * 100) + '%'"
          [style.top]="(arc.midY / heightValue * 100) + '%'"
        >
          <span class="st-arcDiagramChart__tooltipLabel">{{ displayLabel(arc.from) }} -> {{ displayLabel(arc.to) }}</span>
          <span class="st-arcDiagramChart__tooltipValue">{{ arc.weight }}</span>
        </div>
      }
    </div>
  `,
})
export class ArcDiagramChart {
  static readonly stComponentName = "ArcDiagramChart";
  readonly componentName = "ArcDiagramChart";
  readonly MARGIN_X = MARGIN_X;

  private hoveredLinkIndex: number | null = null;

  @NgInput() data: ArcDiagramChartLink[] = [];
  @NgInput() labels?: Record<string, string>;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-arcDiagramChart", this.classInput);
  }

  get widthValue(): number {
    return this.width ?? 480;
  }

  get heightValue(): number {
    return this.height ?? 240;
  }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  displayLabel(id: string): string {
    return this.labels?.[id] ?? id;
  }

  get layout(): Layout {
    const baselineY = this.heightValue - BASELINE_PAD;

    const links = this.data
      .map((link, index) => ({ link, index, weight: magnitude(link.weight) }))
      .filter((entry) => entry.weight > 0);

    const order: string[] = [];
    const degree = new Map<string, number>();
    for (const { link, weight } of links) {
      for (const id of [link.from, link.to]) {
        if (!degree.has(id)) {
          degree.set(id, 0);
          order.push(id);
        }
      }
      degree.set(link.from, (degree.get(link.from) ?? 0) + weight);
      degree.set(link.to, (degree.get(link.to) ?? 0) + weight);
    }

    if (order.length === 0) {
      return { baselineY, nodes: [], arcs: [], nodeX: new Map<string, number>() };
    }

    const usable = Math.max(this.widthValue - MARGIN_X * 2, 1);
    const step = order.length > 1 ? usable / (order.length - 1) : 0;
    const startX = order.length > 1 ? MARGIN_X : this.widthValue / 2;

    const maxDegree = Math.max(1, ...order.map((id) => degree.get(id) ?? 0));

    const nodeX = new Map<string, number>();
    const nodeTone = new Map<string, ArcDiagramChartTone>();
    const nodes: NodeDatum[] = order.map((id, index) => {
      const x = startX + step * index;
      const tone = TONES[index % TONES.length];
      const value = degree.get(id) ?? 0;
      const r = MIN_NODE_R + (MAX_NODE_R - MIN_NODE_R) * (value / maxDegree);
      nodeX.set(id, x);
      nodeTone.set(id, tone);
      return { id, tone, x, r, value };
    });

    const maxWeight = Math.max(1, ...links.map((entry) => entry.weight));
    const arcs: ArcDatum[] = links.map(({ link, weight, index }) => {
      const x1 = nodeX.get(link.from)!;
      const x2 = nodeX.get(link.to)!;
      const left = Math.min(x1, x2);
      const right = Math.max(x1, x2);
      const radius = (right - left) / 2;
      const sweep = x1 <= x2 ? 1 : 0;
      const path = `M ${x1} ${baselineY} A ${radius} ${radius} 0 0 ${sweep} ${x2} ${baselineY}`;
      const tone = nodeTone.get(link.from)!;
      return {
        index,
        from: link.from,
        to: link.to,
        weight,
        tone,
        strokeWidth: Math.max(1.5, (weight / maxWeight) * 6),
        path,
        midX: (left + right) / 2,
        midY: baselineY - radius,
      };
    });

    return { baselineY, nodes, arcs, nodeX };
  }

  get legendEntries(): LegendEntry[] {
    return this.layout.nodes.map((node) => ({
      label: this.displayLabel(node.id),
      tone: node.tone,
    }));
  }

  get dataValueItems(): string[] {
    return this.data
      .filter((link) => magnitude(link.weight) > 0)
      .map((link) => `${this.displayLabel(link.from)} -> ${this.displayLabel(link.to)}: ${link.weight}`);
  }

  get hoveredArc(): ArcDatum | null {
    if (this.hoveredLinkIndex === null) return null;
    return this.layout.arcs.find((arc) => arc.index === this.hoveredLinkIndex) ?? null;
  }

  arcClass(arc: ArcDatum): string {
    const dim = this.hoveredLinkIndex !== null && this.hoveredLinkIndex !== arc.index;
    return classNames(
      "st-arcDiagramChart__arc",
      `st-arcDiagramChart__arc--${arc.tone}`,
      dim && "st-arcDiagramChart__arc--dim",
    );
  }

  nodeClass(node: NodeDatum): string {
    return classNames("st-arcDiagramChart__node", `st-arcDiagramChart__node--${node.tone}`);
  }

  legendSwatchClass(entry: LegendEntry): string {
    return classNames("st-graphLegend__swatch", `st-graphLegend__swatch--${entry.tone}`);
  }

  handleLeave(): void {
    this.hoveredLinkIndex = null;
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      this.hoveredLinkIndex = null;
      return;
    }
    const raw = Number(target.getAttribute("data-link-index"));
    this.hoveredLinkIndex = Number.isInteger(raw) && !Number.isNaN(raw) ? raw : null;
  }
}
