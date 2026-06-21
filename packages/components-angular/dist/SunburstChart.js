import { Component, Input as NgInput } from "@angular/core";
import { contrastTextForTone } from "./chartContrast.js";
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
export class SunburstChart {
    static stComponentName = "SunburstChart";
    componentName = "SunburstChart";
    data;
    width;
    height;
    legend;
    label;
    classInput;
    hoveredIndex = null;
    get widthValue() {
        return this.width ?? 320;
    }
    get heightValue() {
        return this.height ?? 320;
    }
    get hostClass() {
        return ["st-sunburstChart", this.classInput].filter(Boolean).join(" ");
    }
    leafValue(value) {
        return Number.isFinite(value) && (value ?? 0) > 0 ? value : 0;
    }
    sumValue(node) {
        if (node.children && node.children.length > 0) {
            return node.children.reduce((sum, child) => sum + this.sumValue(child), 0);
        }
        return this.leafValue(node.value);
    }
    maxDepth(node, depth = 0) {
        if (!node.children || node.children.length === 0)
            return depth;
        return Math.max(depth, ...node.children.map((child) => this.maxDepth(child, depth + 1)));
    }
    pt(cx, cy, radius, angle) {
        return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    }
    buildArcPath(cx, cy, innerRadius, outerRadius, start, end) {
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
    get arcs() {
        const total = this.sumValue(this.data);
        if (total <= 0 || !this.data.children || this.data.children.length === 0)
            return [];
        const cx = this.widthValue / 2;
        const cy = this.heightValue / 2;
        const ringCount = Math.max(1, this.maxDepth(this.data));
        const outerLimit = Math.max(Math.min(this.widthValue, this.heightValue) / 2 - 6, 1);
        const ring = outerLimit / ringCount;
        const out = [];
        const visit = (node, depth, start, end, pathLabel, inheritedTone, siblingIndex) => {
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
            if (children.length === 0 || nodeTotal <= 0)
                return;
            let cursor = start;
            children.forEach((child, childIndex) => {
                const value = this.sumValue(child);
                if (value <= 0)
                    return;
                const span = ((end - start) * value) / nodeTotal;
                const tone = child.tone ?? (depth === 0 ? TONES[childIndex % TONES.length] : inheritedTone);
                visit(child, depth + 1, cursor, cursor + span, [...pathLabel, child.label], tone, childIndex);
                cursor += span;
            });
        };
        visit(this.data, 0, -Math.PI / 2, Math.PI * 1.5, [this.data.label], "category1", 0);
        return out;
    }
    get leafItems() {
        const items = [];
        const collect = (node, path) => {
            if (node.children && node.children.length > 0) {
                node.children.forEach((child) => collect(child, [...path, child.label]));
                return;
            }
            items.push(`${path.join(", ")}: ${this.leafValue(node.value)}`);
        };
        collect(this.data, [this.data.label]);
        return items.filter((item) => !item.endsWith(": 0"));
    }
    get legendItems() {
        return (this.data.children ?? []).map((child, index) => ({
            label: child.label,
            tone: child.tone ?? TONES[index % TONES.length],
        }));
    }
    arcKey(arc) {
        return arc.pathLabel.join("/");
    }
    arcClass(arc, index) {
        const base = `st-sunburstChart__arc st-sunburstChart__arc--${arc.tone}`;
        if (this.hoveredIndex !== null && this.hoveredIndex !== index) {
            return base + " st-sunburstChart__arc--dim";
        }
        return base;
    }
    contrastText(tone) {
        return contrastTextForTone(tone);
    }
    tooltipLeft() {
        if (this.hoveredIndex === null)
            return "0%";
        const arc = this.arcs[this.hoveredIndex];
        return `${(arc.labelX / this.widthValue) * 100}%`;
    }
    tooltipTop() {
        if (this.hoveredIndex === null)
            return "0%";
        const arc = this.arcs[this.hoveredIndex];
        return `${(arc.labelY / this.heightValue) * 100}%`;
    }
    tooltipLabel() {
        if (this.hoveredIndex === null)
            return "";
        return this.arcs[this.hoveredIndex]?.pathLabel.join(", ") ?? "";
    }
    tooltipValue() {
        if (this.hoveredIndex === null)
            return "";
        return this.arcs[this.hoveredIndex]?.value ?? "";
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        if (!(target instanceof Element)) {
            this.hoveredIndex = null;
            return;
        }
        const raw = Number(target.getAttribute("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) && !Number.isNaN(raw) ? raw : null;
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SunburstChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: SunburstChart, isStandalone: true, selector: "st-sunburst-chart", inputs: { data: "data", width: "width", height: "height", legend: "legend", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SunburstChart, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], legend: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=SunburstChart.js.map