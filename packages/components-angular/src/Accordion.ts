import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type AccordionItem = {
  id?: string;
  title: string;
  content: string | (() => unknown);
  disabled?: boolean;
};

export type AccordionAlign = "start" | "end";

export type AccordionSize = "sm" | "md" | "lg";

export type AccordionProps = {
  items: AccordionItem[];
  openIds?: string[];
  defaultOpenIds?: string[];
  allowMultiple?: boolean;
  /** Svelte-canonical alias for `defaultOpenIds` (initially open item ids). */
  open?: string[];
  /** Svelte-canonical alias for `allowMultiple`. */
  multiple?: boolean;
  align?: AccordionAlign;
  size?: AccordionSize;
  class?: string;
};

@Component({
  selector: "st-accordion",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Accordion {
  static readonly stComponentName = "Accordion";
  readonly componentName = "Accordion";
  @NgInput() items!: AccordionItem[];
  @NgInput() openIds?: string[];
  @NgInput() defaultOpenIds?: string[];
  @NgInput() allowMultiple?: boolean;
  @NgInput() open?: string[];
  @NgInput() multiple?: boolean;
  @NgInput() align?: AccordionAlign;
  @NgInput() size?: AccordionSize;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-accordion", this.classInput].filter(Boolean).join(" ");
  }
}
