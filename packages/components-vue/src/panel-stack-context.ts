import type { InjectionKey } from 'vue';
export const PANEL_STACK_KEY: InjectionKey<PanelStackContext> = Symbol("st-panel-stack");

export type PanelStackContext = {
  /** Is this section the (non-collapsible) primary of a split-primary stack? */
  isPrimary: (id: string) => boolean;
  /** Is this section currently expanded (body visible, content-sized or scrolling)? */
  isExpanded: (id: string) => boolean;
  /** Is this section's body THE single scroll owner right now (flex:1 1 0, overflow:auto)? */
  isScrollOwner: (id: string) => boolean;
  /** Header was activated (click / Space / Enter on the disclosure button). */
  toggle: (id: string) => void;
  /**
   * Register a section's root AND header element, in mount/DOM order;
   * returns an unregister callback. NOT just bookkeeping — the stack falls
   * back to the first registered section as the scroll owner whenever
   * nothing else designates one (unset/stale `expanded` or `primary`), so
   * the invariant "exactly one scroll owner whenever the stack has ≥1
   * section" holds even for a misconfigured or dynamically-changing stack.
   * `headerEl` is used only by split-primary's auto-collapse measurement
   * (the header of whichever section is CURRENTLY primary is observed for
   * its height); sticky-item ignores it.
   */
  register: (id: string, rootEl: HTMLElement, headerEl: HTMLElement) => () => void;
};


export const PANEL_STACK_MAX_SECTIONS = 4;
export const PRIMARY_MIN_BLOCK_SIZE_PX = 160;
