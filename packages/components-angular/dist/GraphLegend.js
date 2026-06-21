import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { nodeShapePath, edgeDashArray, } from "./ForceGraph.js";
import * as i0 from "@angular/core";
export class GraphLegend {
    static stComponentName = "GraphLegend";
    componentName = "GraphLegend";
    entries = [];
    title;
    classInput;
    get hostClass() {
        return classNames("st-graphLegend", this.classInput);
    }
    get resolvedEntries() {
        return this.entries.map((entry) => ({
            entry,
            swatchPath: entry.shape !== undefined ? nodeShapePath(entry.shape, 7) : null,
            swatchTone: entry.tone ?? "category1",
            swatchDash: entry.shape === undefined ? edgeDashArray(entry.dash, entry.weak) : null,
        }));
    }
    edgeClass(entry) {
        return classNames("st-graphLegend__edge", entry.weak ? "st-graphLegend__edge--weak" : null);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: GraphLegend, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: GraphLegend, isStandalone: true, selector: "st-graph-legend", inputs: { entries: "entries", title: "title", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [attr.aria-label]="title ?? 'Graph legend'">
      @if (title) {
        <p class="st-graphLegend__title">{{ title }}</p>
      }
      <ul class="st-graphLegend__list" role="list">
        @for (resolved of resolvedEntries; track $index) {
          <li class="st-graphLegend__entry">
            @if (resolved.entry.shape !== undefined) {
              <svg
                class="st-graphLegend__swatch"
                viewBox="-13 -13 26 26"
                width="16"
                height="16"
                aria-hidden="true"
              >
                @if (resolved.swatchPath) {
                  <path
                    [attr.d]="resolved.swatchPath"
                    [class]="'st-graphLegend__shape st-graphLegend__shape--' + resolved.swatchTone"
                  ></path>
                } @else {
                  <circle
                    r="7"
                    [class]="'st-graphLegend__shape st-graphLegend__shape--' + resolved.swatchTone"
                  ></circle>
                }
              </svg>
            } @else {
              <svg
                class="st-graphLegend__swatch"
                viewBox="0 0 16 8"
                width="16"
                height="8"
                aria-hidden="true"
              >
                <line
                  x1="0"
                  y1="4"
                  x2="16"
                  y2="4"
                  [class]="edgeClass(resolved.entry)"
                  [attr.stroke-dasharray]="resolved.swatchDash"
                ></line>
              </svg>
            }
            <span class="st-graphLegend__label">{{ resolved.entry.label }}</span>
          </li>
        }
      </ul>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: GraphLegend, decorators: [{
            type: Component,
            args: [{
                    selector: "st-graph-legend",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" [attr.aria-label]="title ?? 'Graph legend'">
      @if (title) {
        <p class="st-graphLegend__title">{{ title }}</p>
      }
      <ul class="st-graphLegend__list" role="list">
        @for (resolved of resolvedEntries; track $index) {
          <li class="st-graphLegend__entry">
            @if (resolved.entry.shape !== undefined) {
              <svg
                class="st-graphLegend__swatch"
                viewBox="-13 -13 26 26"
                width="16"
                height="16"
                aria-hidden="true"
              >
                @if (resolved.swatchPath) {
                  <path
                    [attr.d]="resolved.swatchPath"
                    [class]="'st-graphLegend__shape st-graphLegend__shape--' + resolved.swatchTone"
                  ></path>
                } @else {
                  <circle
                    r="7"
                    [class]="'st-graphLegend__shape st-graphLegend__shape--' + resolved.swatchTone"
                  ></circle>
                }
              </svg>
            } @else {
              <svg
                class="st-graphLegend__swatch"
                viewBox="0 0 16 8"
                width="16"
                height="8"
                aria-hidden="true"
              >
                <line
                  x1="0"
                  y1="4"
                  x2="16"
                  y2="4"
                  [class]="edgeClass(resolved.entry)"
                  [attr.stroke-dasharray]="resolved.swatchDash"
                ></line>
              </svg>
            }
            <span class="st-graphLegend__label">{{ resolved.entry.label }}</span>
          </li>
        }
      </ul>
    </div>
  `,
                }]
        }], propDecorators: { entries: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=GraphLegend.js.map