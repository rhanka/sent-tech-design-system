import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { contrastTextForTone } from "./chartContrast.js";

export type PackedBubblesChartTone = "category1"|"category2"|"category3"|"category4"|"category5"|"category6"|"category7"|"category8";
export type PackedBubblesChartDatum = { label: string; value: number; tone?: PackedBubblesChartTone };
export type PackedBubblesChartProps = { data: PackedBubblesChartDatum[]; width?: number; height?: number; label: string; class?: string };

const TONES: PackedBubblesChartTone[] = ["category1","category2","category3","category4","category5","category6","category7","category8"];
const PADDING = 2;
const LABEL_MIN_RADIUS = 18;

type Bubble = { label: string; value: number; tone: PackedBubblesChartTone; textColor: string; cx: number; cy: number; r: number; index: number; showLabel: boolean };

@Component({
  selector: "st-packed-bubbles-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-packedBubblesChart__visual" role="img" [attr.aria-label]="label" (pointermove)="handleVisualPointerMove($event)" (pointerleave)="handleLeave()">
        <svg [attr.viewBox]="viewBox" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" focusable="false" aria-hidden="true">
          @for (bubble of bubbles; track bubble.index) {
            <g class="st-packedBubblesChart__bubble" [attr.data-chart-index]="bubble.index">
              <circle [class]="circleClass(bubble)" [attr.cx]="bubble.cx" [attr.cy]="bubble.cy" [attr.r]="bubble.r" [attr.data-chart-index]="bubble.index"></circle>
              @if (bubble.showLabel) {
                <text class="st-packedBubblesChart__label" [attr.x]="bubble.cx" [attr.y]="bubble.cy" text-anchor="middle" dominant-baseline="middle" [attr.fill]="bubble.textColor" [attr.data-chart-index]="bubble.index">{{ bubble.label }}</text>
              }
            </g>
          }
        </svg>
      </div>
      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) { <li>{{ item }}</li> }
      </ul>
      @if (hoveredBubble) {
        <div class="st-packedBubblesChart__tooltip" role="presentation" [style.left]="tooltipLeft()" [style.top]="tooltipTop()">
          <span class="st-packedBubblesChart__tooltipLabel">{{ hoveredBubble.label }}</span>
          <span class="st-packedBubblesChart__tooltipValue">{{ hoveredBubble.value }}</span>
        </div>
      }
    </div>
  `,
})
export class PackedBubblesChart {
  static readonly stComponentName = "PackedBubblesChart";
  readonly componentName = "PackedBubblesChart";
  private hoveredIndex: number | null = null;
  @NgInput() data: PackedBubblesChartDatum[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;
  get hostClass(): string { return classNames("st-packedBubblesChart", this.classInput); }
  get widthValue(): number { return this.width ?? 360; }
  get heightValue(): number { return this.height ?? 360; }
  get viewBox(): string { return `0 0 ${this.widthValue} ${this.heightValue}`; }
  private magnitude(value: number): number { return Number.isFinite(value) && value > 0 ? value : 0; }
  get bubbles(): Bubble[] {
    const cx = this.widthValue / 2;
    const cy = this.heightValue / 2;
    const valid = (this.data ?? [])
      .map((datum, index) => ({ datum, index, value: this.magnitude(datum.value) }))
      .filter((e) => e.value > 0)
      .sort((a, b) => b.value - a.value);
    if (valid.length === 0) return [];
    const maxValue = Math.max(...valid.map((e) => e.value));
    const limit = Math.max(Math.min(this.widthValue, this.heightValue) / 2 - 4, 1);
    const baseMax = Math.sqrt(maxValue);
    const targetMax = Math.min(limit * 0.42, limit);
    const radiusOf = (value: number) => Math.max((Math.sqrt(value) / baseMax) * targetMax, 3);
    const placed: Array<{ cx: number; cy: number; r: number }> = [];
    const collides = (x: number, y: number, r: number): boolean => {
      for (const p of placed) {
        const dx = x - p.cx; const dy = y - p.cy;
        if (dx * dx + dy * dy < (r + p.r + PADDING) ** 2) return true;
      }
      return false;
    };
    const result: Bubble[] = [];
    valid.forEach((entry, order) => {
      const r = radiusOf(entry.value);
      let x = cx; let y = cy;
      if (placed.length > 0) {
        const step = Math.max(r * 0.5, 2);
        let angle = order * 2.399963; let radius = step; let found = false;
        for (let i = 0; i < 4000; i++) {
          x = cx + radius * Math.cos(angle); y = cy + radius * Math.sin(angle);
          if (!collides(x, y, r)) { found = true; break; }
          angle += 0.5; radius += step * 0.06;
        }
        if (!found) { x = cx + radius * Math.cos(angle); y = cy + radius * Math.sin(angle); }
      }
      placed.push({ cx: x, cy: y, r });
      const tone = entry.datum.tone ?? TONES[entry.index % TONES.length];
      result.push({ label: entry.datum.label, value: entry.value, tone, textColor: contrastTextForTone(tone), cx: x, cy: y, r, index: entry.index, showLabel: r >= LABEL_MIN_RADIUS });
    });
    return result;
  }
  get dataValueItems(): string[] {
    return (this.data ?? []).filter((d) => this.magnitude(d.value) > 0).map((d) => `${d.label}: ${d.value}`);
  }
  get hoveredBubble(): Bubble | null {
    return this.hoveredIndex !== null ? (this.bubbles.find((b) => b.index === this.hoveredIndex) ?? null) : null;
  }
  circleClass(bubble: Bubble): string {
    return classNames("st-packedBubblesChart__circle", `st-packedBubblesChart__circle--${bubble.tone}`,
      this.hoveredIndex !== null && this.hoveredIndex !== bubble.index && "st-packedBubblesChart__circle--dim");
  }
  tooltipLeft(): string { const b = this.hoveredBubble; return b ? `${(b.cx / this.widthValue) * 100}%` : "0%"; }
  tooltipTop(): string { const b = this.hoveredBubble; return b ? `${((b.cy - b.r) / this.heightValue) * 100}%` : "0%"; }
  handleLeave(): void { this.hoveredIndex = null; }
  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && raw >= 0 ? raw : null;
  }
}
