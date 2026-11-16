import type { InjectionKey } from 'vue';


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
export const SELECTABLE_LIST_KEY: InjectionKey<SelectableListContext> = Symbol('st-selectable-list');
