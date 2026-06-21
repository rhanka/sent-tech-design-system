import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

export type SankeyChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type SankeyChartNode = {
  id: string;
  label: string;
  tone?: SankeyChartTone;
};

export type SankeyChartLink = {
  source: string;
  target: string;
  value: number;
  tone?: SankeyChartTone;
};

export type SankeyChartProps = {
  nodes: SankeyChartNode[];
  links: SankeyChartLink[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

type PositionedNode = {
  node: SankeyChartNode;
  tone: SankeyChartTone;
  x: number;
  y: number;
  width: number;
  height: number;
  centerY: number;
};

type PositionedLink = {
  link: SankeyChartLink;
  source: PositionedNode | undefined;
  target: PositionedNode | undefined;
  tone: SankeyChartTone;
  width: number;
  path: string;
  midX: number;
  midY: number;
  key: string;
};

const MARGIN = { top: 18, right: 26, bottom: 18, left: 26 };
const NODE_WIDTH = 14;
const TONES: SankeyChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

@Component({
  selector: "st-sankey-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-sankeyChart__visual"
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
          <g class="st-sankeyChart__links">
            @for (flow of layoutLinks; track flow.key; let i = $index) {
              <path
                [class]="linkClass(flow, i)"
                [attr.d]="flow.path"
                [attr.stroke-width]="flow.width"
                [attr.data-link-index]="i"
              ></path>
            }
          </g>

          <g class="st-sankeyChart__nodes">
            @for (entry of layoutNodes; track entry.node.id) {
              <rect
                [class]="nodeClass(entry)"
                [attr.x]="entry.x"
                [attr.y]="entry.y"
                [attr.width]="entry.width"
                [attr.height]="entry.height"
                rx="2"
              ></rect>
              <text
                class="st-sankeyChart__nodeLabel"
                [attr.x]="entry.x + entry.width + 6"
                [attr.y]="entry.centerY"
                dominant-baseline="middle"
              >{{ entry.node.label }}</text>
            }
          </g>
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredLinkIndex !== null && layoutLinks[hoveredLinkIndex]) {
        <div
          class="st-sankeyChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft()"
          [style.top]="tooltipTop()"
        >
          <span class="st-sankeyChart__tooltipLabel">{{ tooltipLabel() }}</span>
          <span class="st-sankeyChart__tooltipValue">{{ tooltipValue() }}</span>
        </div>
      }
    </div>
  `,
})
export class SankeyChart {
  static readonly stComponentName = "SankeyChart";
  readonly componentName = "SankeyChart";
  @NgInput() nodes!: SankeyChartNode[];
  @NgInput() links!: SankeyChartLink[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  hoveredLinkIndex: number | null = null;

  get widthValue(): number {
    return this.width ?? 560;
  }

  get heightValue(): number {
    return this.height ?? 280;
  }

  get hostClass(): string {
    return ["st-sankeyChart", this.classInput].filter(Boolean).join(" ");
  }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  private computeNodeDepths(): Map<string, number> {
    const nodes = this.nodes ?? [];
    const links = this.links ?? [];
    const depths = new Map(nodes.map((node) => [node.id, 0]));
    for (let pass = 0; pass < nodes.length; pass += 1) {
      let changed = false;
      for (const link of links) {
        const sourceDepth = depths.get(link.source) ?? 0;
        const targetDepth = depths.get(link.target) ?? 0;
        if (sourceDepth + 1 > targetDepth) {
          depths.set(link.target, sourceDepth + 1);
          changed = true;
        }
      }
      if (!changed) break;
    }
    return depths;
  }

  private computeNodeValues(): Map<string, number> {
    const nodes = this.nodes ?? [];
    const links = this.links ?? [];
    const valueOut = new Map<string, number>();
    const valueIn = new Map<string, number>();
    for (const node of nodes) {
      valueOut.set(node.id, 0);
      valueIn.set(node.id, 0);
    }
    for (const link of links) {
      const value = magnitude(link.value);
      valueOut.set(link.source, (valueOut.get(link.source) ?? 0) + value);
      valueIn.set(link.target, (valueIn.get(link.target) ?? 0) + value);
    }
    const values = new Map<string, number>();
    for (const node of nodes) {
      values.set(node.id, Math.max(valueOut.get(node.id) ?? 0, valueIn.get(node.id) ?? 0));
    }
    return values;
  }

  private computeLayout(): { nodes: PositionedNode[]; links: PositionedLink[] } {
    const nodes = this.nodes ?? [];
    const links = this.links ?? [];
    const w = this.widthValue;
    const h = this.heightValue;

    const depths = this.computeNodeDepths();
    const nodeValues = this.computeNodeValues();
    const maxDepth = Math.max(0, ...Array.from(depths.values()));
    const plotWidth = Math.max(w - MARGIN.left - MARGIN.right - NODE_WIDTH, 1);
    const plotHeight = Math.max(h - MARGIN.top - MARGIN.bottom, 1);
    const maxNodeValue = Math.max(1, ...Array.from(nodeValues.values()));

    const byDepth = new Map<number, SankeyChartNode[]>();
    nodes.forEach((node) => {
      const depth = depths.get(node.id) ?? 0;
      const bucket = byDepth.get(depth) ?? [];
      bucket.push(node);
      byDepth.set(depth, bucket);
    });

    const positionedNodes: PositionedNode[] = nodes.map((node, index) => {
      const depth = depths.get(node.id) ?? 0;
      const bucket = byDepth.get(depth) ?? [node];
      const row = Math.max(0, bucket.findIndex((entry) => entry.id === node.id));
      const slot = plotHeight / Math.max(bucket.length, 1);
      const nodeHeight = Math.max(
        24,
        Math.min(slot * 0.72, 18 + ((nodeValues.get(node.id) ?? 0) / maxNodeValue) * 54),
      );
      const x = MARGIN.left + (maxDepth === 0 ? plotWidth / 2 : (plotWidth * depth) / maxDepth);
      const y = MARGIN.top + slot * row + (slot - nodeHeight) / 2;
      const tone = node.tone ?? TONES[index % TONES.length];
      return {
        node,
        tone,
        x,
        y,
        width: NODE_WIDTH,
        height: nodeHeight,
        centerY: y + nodeHeight / 2,
      };
    });

    const positionedById = new Map(positionedNodes.map((n) => [n.node.id, n]));
    const maxLinkValue = Math.max(1, ...links.map((link) => magnitude(link.value)));

    const positionedLinks: PositionedLink[] = links.map((link, index) => {
      const source = positionedById.get(link.source);
      const target = positionedById.get(link.target);
      const fallbackY = MARGIN.top + plotHeight / 2;
      const x1 = (source?.x ?? MARGIN.left) + NODE_WIDTH;
      const y1 = source?.centerY ?? fallbackY;
      const x2 = target?.x ?? w - MARGIN.right;
      const y2 = target?.centerY ?? fallbackY;
      const c = Math.max(32, Math.abs(x2 - x1) * 0.5);
      return {
        link,
        source,
        target,
        tone: link.tone ?? source?.tone ?? TONES[index % TONES.length],
        width: Math.max(2, (magnitude(link.value) / maxLinkValue) * 18),
        path: `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`,
        midX: (x1 + x2) / 2,
        midY: (y1 + y2) / 2,
        key: `${link.source}-${link.target}-${index}`,
      };
    });

    return { nodes: positionedNodes, links: positionedLinks };
  }

  get layoutNodes(): PositionedNode[] {
    return this.computeLayout().nodes;
  }

  get layoutLinks(): PositionedLink[] {
    return this.computeLayout().links;
  }

  get dataValueItems(): string[] {
    const nodes = this.nodes ?? [];
    const links = this.links ?? [];
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    return links.map((link) => {
      const source = nodeById.get(link.source)?.label ?? link.source;
      const target = nodeById.get(link.target)?.label ?? link.target;
      return `${source} -> ${target}: ${link.value}`;
    });
  }

  linkClass(flow: PositionedLink, index: number): string {
    const dim = this.hoveredLinkIndex !== null && this.hoveredLinkIndex !== index;
    return [
      "st-sankeyChart__link",
      `st-sankeyChart__link--${flow.tone}`,
      dim ? "st-sankeyChart__link--dim" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  nodeClass(entry: PositionedNode): string {
    return `st-sankeyChart__node st-sankeyChart__node--${entry.tone}`;
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      this.hoveredLinkIndex = null;
      return;
    }
    const raw = target.getAttribute("data-link-index");
    if (raw === null) {
      this.hoveredLinkIndex = null;
      return;
    }
    const index = Number(raw);
    this.hoveredLinkIndex = Number.isInteger(index) ? index : null;
  }

  handleLeave(): void {
    this.hoveredLinkIndex = null;
  }

  tooltipLeft(): string {
    if (this.hoveredLinkIndex === null) return "0%";
    const flow = this.layoutLinks[this.hoveredLinkIndex];
    if (!flow) return "0%";
    return `${(flow.midX / this.widthValue) * 100}%`;
  }

  tooltipTop(): string {
    if (this.hoveredLinkIndex === null) return "0%";
    const flow = this.layoutLinks[this.hoveredLinkIndex];
    if (!flow) return "0%";
    return `${(flow.midY / this.heightValue) * 100}%`;
  }

  tooltipLabel(): string {
    if (this.hoveredLinkIndex === null) return "";
    const flow = this.layoutLinks[this.hoveredLinkIndex];
    if (!flow) return "";
    const sourceLabel = flow.source?.node.label ?? flow.link.source;
    const targetLabel = flow.target?.node.label ?? flow.link.target;
    return `${sourceLabel} -> ${targetLabel}`;
  }

  tooltipValue(): number | string {
    if (this.hoveredLinkIndex === null) return "";
    const flow = this.layoutLinks[this.hoveredLinkIndex];
    if (!flow) return "";
    return flow.link.value;
  }
}
