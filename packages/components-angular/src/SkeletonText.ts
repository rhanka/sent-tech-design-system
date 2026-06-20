import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SkeletonTextProps = {
  lines?: number;
  width?: string;
  heading?: boolean;
  paragraph?: boolean;
  class?: string;
};

@Component({
  selector: "st-skeleton-text",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (heading) { <div class="st-skeleton__heading st-skeleton__line"></div> }
      @for (i of linesArray; track $index) {
        <div class="st-skeleton__line" [style.width]="width || (($index === linesArray.length - 1 && (lines ?? 1) > 1) ? '75%' : '100%')"></div>
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
  @NgInput("class") classInput?: string;

  get linesArray(): number[] {
    return Array.from({ length: Math.max(1, this.lines ?? 1) }, (_, i) => i);
  }

  get hostClass(): string {
    return classNames(
      "st-skeleton",
      this.paragraph && "st-skeleton--paragraph",
      this.classInput,
    );
  }
}
