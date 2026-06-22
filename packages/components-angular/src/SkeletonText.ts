import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SkeletonTextProps = {
  lines?: number;
  width?: string;
  heading?: boolean;
  paragraph?: boolean;
  locale?: string;
  loadingLabel?: string;
  class?: string;
};

@Component({
  selector: "st-skeleton-text",
  standalone: true,
  template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="status"
      [attr.aria-label]="resolvedLoadingLabel"
      aria-busy="true"
    >
      @for (i of linesArray; track $index) {
        <span [class]="lineClass" [style.width]="lineWidth($index, linesArray.length)"></span>
      }
    </div>
  `,
})
export class SkeletonText {
  static readonly stComponentName = "SkeletonText";
  readonly componentName = "SkeletonText";
  @NgInput() lines?: number;
  @NgInput() width?: string;
  @NgInput() heading?: boolean;
  @NgInput() paragraph?: boolean;
  @NgInput() locale?: string;
  @NgInput() loadingLabel?: string;
  @NgInput("class") classInput?: string;

  get isFr(): boolean {
    return (this.locale ?? "fr-FR").toLowerCase().startsWith("fr");
  }

  get resolvedLoadingLabel(): string {
    if (this.loadingLabel != null) return this.loadingLabel;
    return this.isFr ? "Chargement…" : "Loading…";
  }

  get lineCount(): number {
    const lines = this.lines ?? 1;
    return this.paragraph ? Math.max(lines, 3) : lines;
  }

  get linesArray(): number[] {
    return Array.from({ length: Math.max(0, this.lineCount) }, (_, i) => i);
  }

  get lineClass(): string {
    return classNames("st-skeleton__line", this.heading && "st-skeleton__line--heading");
  }

  lineWidth(index: number, total: number): string | undefined {
    if (this.width && index === 0) return this.width;
    if (this.paragraph && index === total - 1) return "60%";
    return undefined;
  }

  get hostClass(): string {
    return classNames("st-skeleton", this.classInput);
  }
}
