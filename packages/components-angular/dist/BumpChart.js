import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const BUMP_TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8",
];
const BUMP_MARGIN = { top: 16, right: 80, bottom: 32, left: 80 };
export class BumpChart {
    static stComponentName = "BumpChart";
    componentName = "BumpChart";
    MARGIN_LEFT = BUMP_MARGIN.left;
    MARGIN_RIGHT = BUMP_MARGIN.right;
    MARGIN_TOP = BUMP_MARGIN.top;
    MARGIN_BOTTOM = BUMP_MARGIN.bottom;
    hoveredIndex = null;
    data = [];
    categories = [];
    label = "";
    width;
    height;
    classInput;
    get hostClass() {
        return classNames("st-bumpChart", this.classInput);
    }
    get widthValue() {
        return this.width ?? 480;
    }
    get heightValue() {
        return this.height ?? 300;
    }
    get viewBox() {
        return `0 0 ${this.widthValue} ${this.heightValue}`;
    }
    get plotWidth() {
        return Math.max(this.widthValue - BUMP_MARGIN.left - BUMP_MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.heightValue - BUMP_MARGIN.top - BUMP_MARGIN.bottom, 1);
    }
    get catCount() {
        return Math.max(this.categories.length, 2);
    }
    get maxRank() {
        let m = 1;
        for (const s of this.data) {
            for (const r of s.ranks) {
                if (this.isValidRank(r) && r > m)
                    m = r;
            }
        }
        return m;
    }
    isValidRank(r) {
        return typeof r === "number" && Number.isFinite(r) && Number.isInteger(r) && r >= 1;
    }
    rankToY(rank) {
        return BUMP_MARGIN.top + ((rank - 1) / Math.max(this.maxRank - 1, 1)) * this.plotHeight;
    }
    catToX(ci) {
        return BUMP_MARGIN.left + (ci / Math.max(this.catCount - 1, 1)) * this.plotWidth;
    }
    buildBumpPath(points) {
        const parts = [];
        let segment = [];
        const flushSegment = () => {
            if (segment.length >= 2) {
                let d = `M${segment[0].x.toFixed(2)},${segment[0].y.toFixed(2)}`;
                for (let i = 0; i < segment.length - 1; i++) {
                    const p1 = segment[i];
                    const p2 = segment[i + 1];
                    const mx = (p1.x + p2.x) / 2;
                    d += ` C${mx.toFixed(2)},${p1.y.toFixed(2)} ${mx.toFixed(2)},${p2.y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
                }
                parts.push(d);
            }
            else if (segment.length === 1) {
                parts.push(`M${segment[0].x.toFixed(2)},${segment[0].y.toFixed(2)}`);
            }
            segment = [];
        };
        for (const pt of points) {
            if (pt === null) {
                flushSegment();
            }
            else {
                segment.push(pt);
            }
        }
        flushSegment();
        return parts.join(" ");
    }
    get series() {
        return this.data.map((s, si) => {
            const tone = s.tone ?? BUMP_TONES[si % BUMP_TONES.length];
            const alignedLength = Math.min(s.ranks.length, this.categories.length);
            const points = [];
            for (let ci = 0; ci < alignedLength; ci++) {
                const r = s.ranks[ci];
                if (this.isValidRank(r)) {
                    points.push({ x: this.catToX(ci), y: this.rankToY(r) });
                }
                else {
                    points.push(null);
                }
            }
            return {
                label: s.label,
                ranks: s.ranks,
                tone,
                points,
                index: si,
                path: this.buildBumpPath(points),
                alignedLength,
            };
        });
    }
    get rankTicks() {
        const ticks = [];
        for (let r = 1; r <= this.maxRank; r++)
            ticks.push(r);
        return ticks;
    }
    get dataValueItems() {
        return this.data.map((s) => {
            const alignedLength = Math.min(s.ranks.length, this.categories.length);
            return (`${s.label}: ` +
                this.categories
                    .slice(0, alignedLength)
                    .map((cat, ci) => {
                    const r = s.ranks[ci];
                    return `${cat} ${this.isValidRank(r) ? `#${r}` : "?"}`;
                })
                    .join(", "));
        });
    }
    lineClass(s) {
        return classNames("st-bumpChart__line", `st-bumpChart__line--${s.tone}`, this.hoveredIndex !== null && this.hoveredIndex !== s.index && "st-bumpChart__line--dim", this.hoveredIndex === s.index && "st-bumpChart__line--active");
    }
    dotClass(s) {
        return classNames("st-bumpChart__dot", `st-bumpChart__dot--${s.tone}`, this.hoveredIndex !== null && this.hoveredIndex !== s.index && "st-bumpChart__dot--dim");
    }
    lastValidPoint(s) {
        for (let i = s.points.length - 1; i >= 0; i--) {
            if (s.points[i] !== null)
                return s.points[i];
        }
        return null;
    }
    firstValidPoint(s) {
        for (const pt of s.points) {
            if (pt !== null)
                return pt;
        }
        return null;
    }
    validPointCount(s) {
        return s.points.filter((p) => p !== null).length;
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    handlePointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BumpChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: BumpChart, isStandalone: true, selector: "st-bump-chart", inputs: { data: "data", categories: "categories", label: "label", width: "width", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-bumpChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
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
          @for (rank of rankTicks; track rank) {
            <line class="st-bumpChart__grid" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="rankToY(rank)" [attr.y2]="rankToY(rank)"></line>
            <text class="st-bumpChart__rankLabel" [attr.x]="MARGIN_LEFT - 8" [attr.y]="rankToY(rank)" text-anchor="end" dominant-baseline="middle">#{{ rank }}</text>
          }

          @for (cat of categories; track $index) {
            <text class="st-bumpChart__catLabel" [attr.x]="catToX($index)" [attr.y]="heightValue - MARGIN_BOTTOM + 16" text-anchor="middle">{{ cat }}</text>
          }

          @for (s of series; track s.index) {
            <path [class]="lineClass(s)" [attr.d]="s.path" fill="none" [attr.data-chart-index]="s.index"></path>
            @for (pt of s.points; track $index) {
              @if (pt !== null) {
                <circle [class]="dotClass(s)" [attr.cx]="pt.x" [attr.cy]="pt.y" r="4" [attr.data-chart-index]="s.index"></circle>
              }
            }
            @if (lastValidPoint(s); as lastPt) {
              <text class="st-bumpChart__seriesLabel" [attr.x]="lastPt.x + 8" [attr.y]="lastPt.y" dominant-baseline="middle">{{ s.label }}</text>
            }
            @if (firstValidPoint(s); as firstPt) {
              @if (validPointCount(s) > 1) {
                <text class="st-bumpChart__seriesLabel" [attr.x]="firstPt.x - 8" [attr.y]="firstPt.y" text-anchor="end" dominant-baseline="middle">{{ s.label }}</text>
              }
            }
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: BumpChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-bump-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-bumpChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
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
          @for (rank of rankTicks; track rank) {
            <line class="st-bumpChart__grid" [attr.x1]="MARGIN_LEFT" [attr.x2]="widthValue - MARGIN_RIGHT" [attr.y1]="rankToY(rank)" [attr.y2]="rankToY(rank)"></line>
            <text class="st-bumpChart__rankLabel" [attr.x]="MARGIN_LEFT - 8" [attr.y]="rankToY(rank)" text-anchor="end" dominant-baseline="middle">#{{ rank }}</text>
          }

          @for (cat of categories; track $index) {
            <text class="st-bumpChart__catLabel" [attr.x]="catToX($index)" [attr.y]="heightValue - MARGIN_BOTTOM + 16" text-anchor="middle">{{ cat }}</text>
          }

          @for (s of series; track s.index) {
            <path [class]="lineClass(s)" [attr.d]="s.path" fill="none" [attr.data-chart-index]="s.index"></path>
            @for (pt of s.points; track $index) {
              @if (pt !== null) {
                <circle [class]="dotClass(s)" [attr.cx]="pt.x" [attr.cy]="pt.y" r="4" [attr.data-chart-index]="s.index"></circle>
              }
            }
            @if (lastValidPoint(s); as lastPt) {
              <text class="st-bumpChart__seriesLabel" [attr.x]="lastPt.x + 8" [attr.y]="lastPt.y" dominant-baseline="middle">{{ s.label }}</text>
            }
            @if (firstValidPoint(s); as firstPt) {
              @if (validPointCount(s) > 1) {
                <text class="st-bumpChart__seriesLabel" [attr.x]="firstPt.x - 8" [attr.y]="firstPt.y" text-anchor="end" dominant-baseline="middle">{{ s.label }}</text>
              }
            }
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], categories: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=BumpChart.js.map