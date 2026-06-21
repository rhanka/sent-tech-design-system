import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import {
  nodeShapePath,
  edgeDashArray,
  type ForceGraphLegendEntry,
} from "./ForceGraph.js";

export type { ForceGraphLegendEntry, ForceGraphNodeShape, ForceGraphTone, ForceGraphEdgeDash } from "./ForceGraph.js";

export type GraphLegendProps = {
  entries: ForceGraphLegendEntry[];
  /** Optional heading shown above entries. */
  title?: string;
  class?: string;
};

type ResolvedEntry = {
  entry: ForceGraphLegendEntry;
  swatchPath: string | null;
  swatchTone: string;
  swatchDash: string | null;
};

@Component({
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
})
export class GraphLegend {
  static readonly stComponentName = "GraphLegend";
  readonly componentName = "GraphLegend";

  @NgInput() entries: ForceGraphLegendEntry[] = [];
  @NgInput() title?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-graphLegend", this.classInput);
  }

  get resolvedEntries(): ResolvedEntry[] {
    return this.entries.map((entry) => ({
      entry,
      swatchPath: entry.shape !== undefined ? nodeShapePath(entry.shape, 7) : null,
      swatchTone: entry.tone ?? "category1",
      swatchDash: entry.shape === undefined ? edgeDashArray(entry.dash, entry.weak) : null,
    }));
  }

  edgeClass(entry: ForceGraphLegendEntry): string {
    return classNames("st-graphLegend__edge", entry.weak ? "st-graphLegend__edge--weak" : null);
  }
}
