import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TooltipPlacement = "top" | "bottom";

export type TooltipProps = {
  content: unknown;
  triggerLabel?: string;
  placement?: TooltipPlacement;
  class?: string;
};

let _tooltipCounter = 0;
function nextTooltipId(): string {
  return `st-tooltip-${++_tooltipCounter}`;
}

@Component({
  selector: "st-tooltip",
  standalone: true,
  template: `
    <span
      [attr.data-st-component]="componentName"
      [class]="hostClass"
    >
      <span class="st-tooltip__trigger">
        @if (triggerLabel) {
          {{ triggerLabel }}
        }
        <ng-content></ng-content>
      </span>
      <span
        [id]="tooltipId"
        class="st-tooltip__content"
        role="tooltip"
      >{{ content }}</span>
    </span>
  `,
})
export class Tooltip {
  static readonly stComponentName = "Tooltip";
  readonly componentName = "Tooltip";
  readonly tooltipId = nextTooltipId();

  @NgInput() content!: unknown;
  @NgInput() triggerLabel?: string;
  @NgInput() placement?: TooltipPlacement;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-tooltip",
      `st-tooltip--${this.placement ?? "top"}`,
      this.classInput,
    );
  }
}
