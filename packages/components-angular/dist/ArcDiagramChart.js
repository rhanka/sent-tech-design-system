import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const TONES = [
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
function magnitude(value) {
    return Number.isFinite(value) && value > 0 ? value : 0;
}
export class ArcDiagramChart {
    static stComponentName = "ArcDiagramChart";
    componentName = "ArcDiagramChart";
    MARGIN_X = MARGIN_X;
    hoveredLinkIndex = null;
    data = [];
    labels;
    width;
    height;
    label = "";
    classInput;
    get hostClass() {
        return classNames("st-arcDiagramChart", this.classInput);
    }
    get widthValue() {
        return this.width ?? 480;
    }
    get heightValue() {
        return this.height ?? 240;
    }
    get viewBox() {
        return `0 0 ${this.widthValue} ${this.heightValue}`;
    }
    displayLabel(id) {
        return this.labels?.[id] ?? id;
    }
    get layout() {
        const baselineY = this.heightValue - BASELINE_PAD;
        const links = this.data
            .map((link, index) => ({ link, index, weight: magnitude(link.weight) }))
            .filter((entry) => entry.weight > 0);
        const order = [];
        const degree = new Map();
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
            return { baselineY, nodes: [], arcs: [], nodeX: new Map() };
        }
        const usable = Math.max(this.widthValue - MARGIN_X * 2, 1);
        const step = order.length > 1 ? usable / (order.length - 1) : 0;
        const startX = order.length > 1 ? MARGIN_X : this.widthValue / 2;
        const maxDegree = Math.max(1, ...order.map((id) => degree.get(id) ?? 0));
        const nodeX = new Map();
        const nodeTone = new Map();
        const nodes = order.map((id, index) => {
            const x = startX + step * index;
            const tone = TONES[index % TONES.length];
            const value = degree.get(id) ?? 0;
            const r = MIN_NODE_R + (MAX_NODE_R - MIN_NODE_R) * (value / maxDegree);
            nodeX.set(id, x);
            nodeTone.set(id, tone);
            return { id, tone, x, r, value };
        });
        const maxWeight = Math.max(1, ...links.map((entry) => entry.weight));
        const arcs = links.map(({ link, weight, index }) => {
            const x1 = nodeX.get(link.from);
            const x2 = nodeX.get(link.to);
            const left = Math.min(x1, x2);
            const right = Math.max(x1, x2);
            const radius = (right - left) / 2;
            const sweep = x1 <= x2 ? 1 : 0;
            const path = `M ${x1} ${baselineY} A ${radius} ${radius} 0 0 ${sweep} ${x2} ${baselineY}`;
            const tone = nodeTone.get(link.from);
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
    get legendEntries() {
        return this.layout.nodes.map((node) => ({
            label: this.displayLabel(node.id),
            tone: node.tone,
        }));
    }
    get dataValueItems() {
        return this.data
            .filter((link) => magnitude(link.weight) > 0)
            .map((link) => `${this.displayLabel(link.from)} -> ${this.displayLabel(link.to)}: ${link.weight}`);
    }
    get hoveredArc() {
        if (this.hoveredLinkIndex === null)
            return null;
        return this.layout.arcs.find((arc) => arc.index === this.hoveredLinkIndex) ?? null;
    }
    arcClass(arc) {
        const dim = this.hoveredLinkIndex !== null && this.hoveredLinkIndex !== arc.index;
        return classNames("st-arcDiagramChart__arc", `st-arcDiagramChart__arc--${arc.tone}`, dim && "st-arcDiagramChart__arc--dim");
    }
    nodeClass(node) {
        return classNames("st-arcDiagramChart__node", `st-arcDiagramChart__node--${node.tone}`);
    }
    legendSwatchClass(entry) {
        return classNames("st-graphLegend__swatch", `st-graphLegend__swatch--${entry.tone}`);
    }
    handleLeave() {
        this.hoveredLinkIndex = null;
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        if (!(target instanceof Element)) {
            this.hoveredLinkIndex = null;
            return;
        }
        const raw = Number(target.getAttribute("data-link-index"));
        this.hoveredLinkIndex = Number.isInteger(raw) && !Number.isNaN(raw) ? raw : null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ArcDiagramChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ArcDiagramChart, isStandalone: true, selector: "st-arc-diagram-chart", inputs: { data: "data", labels: "labels", width: "width", height: "height", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ArcDiagramChart, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], labels: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ArcDiagramChart.js.map