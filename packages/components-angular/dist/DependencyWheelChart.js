import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { contrastTextForTone } from "./chartContrast.js";
import * as i0_1 from "@angular/core";
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
const GAP = 0.04;
const ARC_WIDTH = 12;
function magnitude(value) {
    return Number.isFinite(value) && value > 0 ? value : 0;
}
function polar(cx, cy, radius, angle) {
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}
function arcPath(cx, cy, inner, outer, start, end) {
    const large = end - start > Math.PI ? 1 : 0;
    const o0 = polar(cx, cy, outer, start);
    const o1 = polar(cx, cy, outer, end);
    const i1 = polar(cx, cy, inner, end);
    const i0 = polar(cx, cy, inner, start);
    return `M ${o0.x} ${o0.y} A ${outer} ${outer} 0 ${large} 1 ${o1.x} ${o1.y} L ${i1.x} ${i1.y} A ${inner} ${inner} 0 ${large} 0 ${i0.x} ${i0.y} Z`;
}
export class DependencyWheelChart {
    static stComponentName = "DependencyWheelChart";
    componentName = "DependencyWheelChart";
    hoveredLinkIndex = null;
    data = [];
    labels;
    width;
    height;
    label = "";
    classInput;
    get hostClass() {
        return classNames("st-dependencyWheelChart", this.classInput);
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
        const cx = this.widthValue / 2;
        const cy = this.heightValue / 2;
        const outer = Math.max(Math.min(this.widthValue, this.heightValue) / 2 - 6, 1);
        const inner = Math.max(outer - ARC_WIDTH, 1);
        const ribbonRadius = Math.max(inner - 2, 0);
        const links = this.data
            .map((link, index) => ({ link, index, weight: magnitude(link.weight) }))
            .filter((entry) => entry.weight > 0);
        const order = [];
        const total = new Map();
        for (const { link, weight } of links) {
            for (const id of [link.from, link.to]) {
                if (!total.has(id)) {
                    total.set(id, 0);
                    order.push(id);
                }
            }
            total.set(link.from, (total.get(link.from) ?? 0) + weight);
            total.set(link.to, (total.get(link.to) ?? 0) + weight);
        }
        const grandTotal = order.reduce((sum, id) => sum + (total.get(id) ?? 0), 0);
        if (order.length === 0 || grandTotal <= 0) {
            return { cx, cy, inner, outer, arcs: [], ribbons: [], legend: [] };
        }
        const totalGap = GAP * order.length;
        const usable = Math.max(Math.PI * 2 - totalGap, 0.0001);
        const arcMap = new Map();
        const arcs = [];
        let angle = -Math.PI / 2;
        order.forEach((id, index) => {
            const span = (usable * (total.get(id) ?? 0)) / grandTotal;
            const start = angle + GAP / 2;
            const end = start + span;
            angle = end + GAP / 2;
            const tone = TONES[index % TONES.length];
            const mid = (start + end) / 2;
            arcMap.set(id, { id, tone, cursor: start });
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
                textColor: contrastTextForTone(tone),
            });
        });
        const maxWeight = Math.max(1, ...links.map((entry) => entry.weight));
        const ribbons = links.map(({ link, weight, index }) => {
            const source = arcMap.get(link.from);
            const target = arcMap.get(link.to);
            const sourceSpan = (usable * weight) / grandTotal;
            const targetSpan = (usable * weight) / grandTotal;
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
            const path = `M ${ps0.x} ${ps0.y} ` +
                `Q ${cx} ${cy} ${pt1.x} ${pt1.y} ` +
                `A ${ribbonRadius} ${ribbonRadius} 0 0 1 ${pt0.x} ${pt0.y} ` +
                `Q ${cx} ${cy} ${ps1.x} ${ps1.y} ` +
                `A ${ribbonRadius} ${ribbonRadius} 0 0 0 ${ps0.x} ${ps0.y} Z`;
            return {
                index,
                from: link.from,
                to: link.to,
                weight,
                tone: source.tone,
                strokeWidth: Math.max(1, (weight / maxWeight) * 4),
                path,
                midX: cx,
                midY: cy,
            };
        });
        const legend = arcs.map((arc) => ({
            label: this.displayLabel(arc.id),
            tone: arc.tone,
        }));
        return { cx, cy, inner, outer, arcs, ribbons, legend };
    }
    get dataValueItems() {
        return this.data
            .filter((link) => magnitude(link.weight) > 0)
            .map((link) => `${this.displayLabel(link.from)} -> ${this.displayLabel(link.to)}: ${link.weight}`);
    }
    get hoveredRibbon() {
        if (this.hoveredLinkIndex === null)
            return null;
        return this.layout.ribbons.find((r) => r.index === this.hoveredLinkIndex) ?? null;
    }
    ribbonClass(ribbon) {
        const dim = this.hoveredLinkIndex !== null && this.hoveredLinkIndex !== ribbon.index;
        return classNames("st-dependencyWheelChart__ribbon", `st-dependencyWheelChart__ribbon--${ribbon.tone}`, dim && "st-dependencyWheelChart__ribbon--dim");
    }
    arcSegmentClass(arc) {
        return classNames("st-dependencyWheelChart__arc", `st-dependencyWheelChart__arc--${arc.tone}`);
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
    static ɵfac = i0_1.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0_1, type: DependencyWheelChart, deps: [], target: i0_1.ɵɵFactoryTarget.Component });
    static ɵcmp = i0_1.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: DependencyWheelChart, isStandalone: true, selector: "st-dependency-wheel-chart", inputs: { data: "data", labels: "labels", width: "width", height: "height", label: "label", classInput: ["class", "classInput"] }, ngImport: i0_1, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-dependencyWheelChart__visual"
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
          <g class="st-dependencyWheelChart__ribbons">
            @for (ribbon of layout.ribbons; track ribbon.index) {
              <path
                [class]="ribbonClass(ribbon)"
                [attr.d]="ribbon.path"
                [attr.stroke-width]="ribbon.strokeWidth"
                [attr.data-link-index]="ribbon.index"
              ></path>
            }
          </g>

          <g class="st-dependencyWheelChart__arcs">
            @for (arc of layout.arcs; track arc.id) {
              <path
                [class]="arcSegmentClass(arc)"
                [attr.d]="arc.path"
              ></path>
              @if (arc.span > 0.34) {
                <text
                  class="st-dependencyWheelChart__arcLabel"
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

        @if (layout.legend.length > 0) {
          <ul class="st-graphLegend st-dependencyWheelChart__legend" aria-hidden="true">
            @for (entry of layout.legend; track entry.label) {
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

      @if (hoveredRibbon; as ribbon) {
        <div
          class="st-dependencyWheelChart__tooltip"
          role="presentation"
          [style.left]="(ribbon.midX / widthValue * 100) + '%'"
          [style.top]="(ribbon.midY / heightValue * 100) + '%'"
        >
          <span class="st-dependencyWheelChart__tooltipLabel">{{ displayLabel(ribbon.from) }} -> {{ displayLabel(ribbon.to) }}</span>
          <span class="st-dependencyWheelChart__tooltipValue">{{ ribbon.weight }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0_1.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0_1, type: DependencyWheelChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-dependency-wheel-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-dependencyWheelChart__visual"
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
          <g class="st-dependencyWheelChart__ribbons">
            @for (ribbon of layout.ribbons; track ribbon.index) {
              <path
                [class]="ribbonClass(ribbon)"
                [attr.d]="ribbon.path"
                [attr.stroke-width]="ribbon.strokeWidth"
                [attr.data-link-index]="ribbon.index"
              ></path>
            }
          </g>

          <g class="st-dependencyWheelChart__arcs">
            @for (arc of layout.arcs; track arc.id) {
              <path
                [class]="arcSegmentClass(arc)"
                [attr.d]="arc.path"
              ></path>
              @if (arc.span > 0.34) {
                <text
                  class="st-dependencyWheelChart__arcLabel"
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

        @if (layout.legend.length > 0) {
          <ul class="st-graphLegend st-dependencyWheelChart__legend" aria-hidden="true">
            @for (entry of layout.legend; track entry.label) {
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

      @if (hoveredRibbon; as ribbon) {
        <div
          class="st-dependencyWheelChart__tooltip"
          role="presentation"
          [style.left]="(ribbon.midX / widthValue * 100) + '%'"
          [style.top]="(ribbon.midY / heightValue * 100) + '%'"
        >
          <span class="st-dependencyWheelChart__tooltipLabel">{{ displayLabel(ribbon.from) }} -> {{ displayLabel(ribbon.to) }}</span>
          <span class="st-dependencyWheelChart__tooltipValue">{{ ribbon.weight }}</span>
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
//# sourceMappingURL=DependencyWheelChart.js.map