import { NgTemplateOutlet } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

/**
 * Shared context contract between {@link SelectableList} and its slotted
 * {@link SelectableRow} children. The list owns selection + the roving tabindex
 * and exposes the getters/callbacks the rows read to derive their own `role` /
 * `tabindex` / `aria-selected`. When a row is used STANDALONE (no provider)
 * `inject` returns undefined and the row falls back to its own state.
 */
export type SelectableListContext = {
  /** Reactive bump incremented on every selection / focus / registry change. */
  version: { value: number };
  /** True when the list manages selection/roving for its rows. */
  readonly managed: true;
  /** listbox role for the wrapper → rows are "option". */
  readonly itemRole: "option";
  /** Register a row element; returns an unregister callback. disabled is forwarded so the list can skip it during keyboard navigation. */
  register: (el: HTMLElement, value: string | undefined, disabled?: boolean) => () => void;
  /** Is the row with this element currently selected? */
  isSelected: (el: HTMLElement) => boolean;
  /** Should the row with this element be the roving-tabindex stop (tabindex 0)? */
  isTabStop: (el: HTMLElement) => boolean;
  /** Row was activated (click / Space / Enter). The list toggles selection. */
  activate: (el: HTMLElement) => void;
  /** Row received focus → becomes the roving tab stop. */
  focusRow: (el: HTMLElement) => void;
  /** Arrow / Home / End navigation from a row. */
  navigate: (el: HTMLElement, key: string) => void;
};

/** Context key for list→row communication (Angular DI / lookup). Mirrors the
 *  Vue InjectionKey symbol so SelectableList can share its managed context. */
export const SELECTABLE_LIST_KEY = Symbol("SELECTABLE_LIST_KEY");

export type SelectableRowProps = {
  /**
   * Selected state. Honoured when the row is used STANDALONE; inside a
   * {@link SelectableList} the list is the source of truth, so this prop is
   * ignored for managed rows.
   */
  selected?: boolean;
  /** Notified on every toggle with the new selected state (standalone rows). */
  onSelect?: (selected: boolean) => void;
  /** Non-interactive when true. */
  disabled?: boolean;
  /** Stable value, surfaced as `data-value` and used by the list for `value`. */
  value?: string;
  /** Native link target. When set on a standalone row, the row renders as an anchor. */
  href?: string;
  /**
   * ARIA role for the standalone row. Defaults to "button" for standalone use —
   * "option" is only valid inside a listbox. Inside a list the role is forced to
   * "option".
   */
  role?: string;
  /**
   * Opt-in left accent bar on the selected state. Off by default so the
   * selected item is a calm tinted surface + accented text (two signals only).
   */
  accentBar?: boolean;
  /**
   * When true, the row stacks the primary label over a muted caption line
   * (projected via `[slot='caption']`) and gains the `--hasCaption` modifier.
   */
  caption?: boolean;
  /** When true, renders the leading slot wrapper (projected via `[slot='leading']`). */
  leading?: boolean;
  /** When true, renders the trailing slot wrapper (projected via `[slot='trailing']`). */
  trailing?: boolean;
  class?: string;
};

@Component({
  selector: "st-selectable-row",
  standalone: true,
  template: `
    @if (href && !disabled) {
      <a
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        [href]="href"
        [attr.role]="effectiveRole"
        [attr.aria-selected]="effectiveRole === 'option' ? selectedAttr : null"
        [attr.aria-pressed]="effectiveRole === 'button' ? selectedAttr : null"
        [attr.aria-disabled]="disabled ? 'true' : null"
        [attr.data-value]="value"
        [attr.tabindex]="tabindex"
        (click)="handleClick($event)"
      >
        <ng-container [ngTemplateOutlet]="body"></ng-container>
      </a>
    } @else {
      <div
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        [attr.role]="effectiveRole"
        [attr.aria-selected]="effectiveRole === 'option' ? selectedAttr : null"
        [attr.aria-pressed]="effectiveRole === 'button' ? selectedAttr : null"
        [attr.aria-disabled]="disabled ? 'true' : null"
        [attr.data-value]="value"
        [attr.tabindex]="tabindex"
        (click)="handleClick($event)"
      >
        <ng-container [ngTemplateOutlet]="body"></ng-container>
      </div>
    }
    <ng-template #body>
      @if (leading) {
        <span class="st-selectableRow__leading"><ng-content select="[slot='leading']"></ng-content></span>
      }
      @if (caption) {
        <span class="st-selectableRow__content st-selectableRow__content--stacked">
          <span class="st-selectableRow__label"><ng-content></ng-content></span>
          <span class="st-selectableRow__caption"><ng-content select="[slot='caption']"></ng-content></span>
        </span>
      } @else {
        <span class="st-selectableRow__content"><ng-content></ng-content></span>
      }
      @if (trailing) {
        <span class="st-selectableRow__trailing"><ng-content select="[slot='trailing']"></ng-content></span>
      }
    </ng-template>
  `,
  imports: [NgTemplateOutlet],
})
export class SelectableRow {
  static readonly stComponentName = "SelectableRow";
  readonly componentName = "SelectableRow";
  @NgInput() selected?: boolean;
  @NgInput() onSelect?: (selected: boolean) => void;
  @NgInput() disabled?: boolean;
  @NgInput() value?: string;
  @NgInput() href?: string;
  @NgInput() role?: string;
  @NgInput() accentBar?: boolean;
  @NgInput() caption?: boolean;
  @NgInput() leading?: boolean;
  @NgInput() trailing?: boolean;
  @NgInput("class") classInput?: string;

  get effectiveRole(): string | null {
    // Standalone row: an anchor keeps its native role (undefined), otherwise the
    // declared role (default "button").
    return this.href ? null : this.role || "button";
  }

  get selectedAttr(): "true" | "false" {
    return this.selected ? "true" : "false";
  }

  get tabindex(): number {
    return this.disabled ? -1 : 0;
  }

  handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.onSelect?.(!this.selected);
  }

  get hostClass(): string {
    return classNames(
      "st-selectableRow",
      this.selected && "st-selectableRow--selected",
      this.disabled && "st-selectableRow--disabled",
      this.accentBar && "st-selectableRow--accentBar",
      this.caption && "st-selectableRow--hasCaption",
      this.classInput,
    );
  }
}
