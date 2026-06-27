import {
  type AfterViewInit,
  Component,
  ElementRef,
  Input as NgInput,
  type OnChanges,
} from "@angular/core";

import { classNames } from "./classNames.js";

import {
  SELECTABLE_LIST_KEY,
  type SelectableListContext,
} from "./SelectableRow.js";

export type SelectableListProps = {
  /** Accessible name for the listbox (required for SR users). */
  label?: string;
  /** References the id of an external visible label (alternative to `label`). */
  labelledby?: string;
  /**
   * Allow more than one selected row. Adds aria-multiselectable and toggles
   * each row independently. Defaults to false (single-select).
   */
  multiple?: boolean;
  /**
   * Selected value(s). Controlled when provided. For single-select pass a
   * string (or null); for multiple pass a string[]. When omitted the list is
   * uncontrolled and keeps its own internal selection.
   */
  value?: string | string[] | null;
  /**
   * Fired with the new selection on every change. Receives a string|null for
   * single-select and a string[] for multiple. Required for the controlled
   * pattern; also fires for uncontrolled lists.
   */
  onChange?: (value: string | string[] | null) => void;
  class?: string;
};

@Component({
  selector: "st-selectable-list",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass"
      role="listbox"
      [attr.aria-label]="labelledby ? null : label"
      [attr.aria-labelledby]="labelledby"
      [attr.aria-multiselectable]="multiple ? 'true' : null">
      <ng-content></ng-content>
    </div>
  `,
})
export class SelectableList implements AfterViewInit, OnChanges {
  static readonly stComponentName = "SelectableList";
  readonly componentName = "SelectableList";
  @NgInput() label?: string;
  @NgInput() labelledby?: string;
  @NgInput() multiple?: boolean;
  @NgInput() value?: string | string[] | null;
  @NgInput() onChange?: (value: string | string[] | null) => void;
  @NgInput("class") classInput?: string;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.syncSelection();
    // Safety re-apply after the current render flush settles (projected rows may
    // finish rendering their inner element just after this hook in the zoneless
    // island). Idempotent.
    queueMicrotask(() => this.syncSelection());
  }

  ngOnChanges(): void {
    this.syncSelection();
  }

  /**
   * The list OWNS selection: it drives the `--selected` styling of its
   * {@link SelectableRow} children from its own `value`, mirroring the
   * provide/inject contract of the React/Svelte/Vue references. Angular projects
   * pre-instantiated rows as plain DOM (no shared injector), so the list reads
   * each row's `data-value` and toggles the modifier directly. The rows' own
   * `[class]` binding only manages the tokens it emits (never `--selected` for a
   * managed row), so the patch is not clobbered on re-render.
   */
  private syncSelection(): void {
    const root = this.host?.nativeElement;
    if (!root) return;
    const selected = new Set<string>();
    const value = this.value;
    if (Array.isArray(value)) {
      for (const entry of value) if (entry != null) selected.add(String(entry));
    } else if (value != null) {
      selected.add(String(value));
    }
    const rows = root.querySelectorAll<HTMLElement>(".st-selectableRow[data-value]");
    rows.forEach((row) => {
      const rowValue = row.getAttribute("data-value");
      const isSelected = rowValue != null && selected.has(rowValue);
      row.classList.toggle("st-selectableRow--selected", isSelected);
      row.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
  }

  get hostClass(): string {
    return classNames("st-selectableList", this.classInput);
  }
}
