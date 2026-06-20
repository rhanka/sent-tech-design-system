import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";

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

let _accordionCounter = 0;

@Component({
  selector: "st-accordion",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @for (item of items; track itemId(item, $index)) {
        <div [class]="itemClass(item, $index)">
          <h3 class="st-accordion__heading">
            <button
              type="button"
              class="st-accordion__trigger"
              [disabled]="item.disabled"
              [attr.aria-expanded]="isOpen(item, $index)"
              (click)="toggle(item, $index)"
            >
              @if (resolvedAlign === 'start') {
                <span class="st-accordion__icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              }
              <span class="st-accordion__title">{{ item.title }}</span>
              @if (resolvedAlign !== 'start') {
                <span class="st-accordion__icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              }
            </button>
          </h3>
          @if (isOpen(item, $index)) {
            <div class="st-accordion__panel" role="region">
              {{ resolveContent(item) }}
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class Accordion {
  static readonly stComponentName = "Accordion";
  readonly componentName = "Accordion";

  private readonly instancePrefix = `accordion-${++_accordionCounter}`;
  private localOpenIds: string[] = [];

  @NgInput() items!: AccordionItem[];
  @NgInput() openIds?: string[];
  @NgInput() defaultOpenIds?: string[];
  @NgInput() allowMultiple?: boolean;
  @NgInput() open?: string[];
  @NgInput() multiple?: boolean;
  @NgInput() align?: AccordionAlign;
  @NgInput() size?: AccordionSize;
  @NgInput("class") classInput?: string;

  @Output() readonly change = new EventEmitter<string[]>();

  ngOnInit(): void {
    this.localOpenIds = this.defaultOpenIds ?? this.open ?? [];
  }

  get resolvedAlign(): AccordionAlign {
    return this.align ?? "end";
  }

  get resolvedAllowMultiple(): boolean {
    return this.allowMultiple ?? this.multiple ?? false;
  }

  get effectiveOpenIds(): string[] {
    return this.openIds ?? this.localOpenIds;
  }

  itemId(item: AccordionItem, index: number): string {
    return item.id ?? `${this.instancePrefix}-${index}`;
  }

  isOpen(item: AccordionItem, index: number): boolean {
    return this.effectiveOpenIds.includes(this.itemId(item, index));
  }

  itemClass(item: AccordionItem, index: number): string {
    return classNames(
      "st-accordion__item",
      this.isOpen(item, index) && "st-accordion__item--open",
    );
  }

  toggle(item: AccordionItem, index: number): void {
    const id = this.itemId(item, index);
    const current = this.effectiveOpenIds;
    const next = current.includes(id)
      ? current.filter((v) => v !== id)
      : this.resolvedAllowMultiple
        ? [...current, id]
        : [id];
    if (this.openIds === undefined) {
      this.localOpenIds = next;
    }
    this.change.emit(next);
  }

  resolveContent(item: AccordionItem): string {
    return typeof item.content === "function" ? String(item.content()) : item.content;
  }

  get hostClass(): string {
    return classNames(
      "st-accordion",
      `st-accordion--${this.size ?? "md"}`,
      `st-accordion--align-${this.resolvedAlign}`,
      this.classInput,
    );
  }
}
