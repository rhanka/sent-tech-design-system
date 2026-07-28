import { Component, ElementRef, EventEmitter, Input as NgInput, Output, ViewChild } from "@angular/core";

import { classNames } from "./classNames.js";
import { Icon } from "./Icon.js";

export type PanelSectionProps = {
  id: string;
  label: string;
  /**
   * Convenience (not in the Svelte contract): renders the header-trailing
   * actions slot wrapper. Angular content projection has no way to detect
   * whether optional projected content was actually supplied the way a
   * Svelte snippet prop (`actions?: Snippet`) can — same reasoning as
   * `SelectableRow`'s `leading`/`trailing`/`caption` flags. Project the
   * actions markup with `slot="actions"` and set this to `true`.
   */
  actions?: boolean;
  class?: string;
};

/**
 * One section of a `PanelStack`. Faithful Angular port of
 * `PanelSection.svelte` — see `PanelStack.ts` for the ratified contract and
 * for why Angular-specific coordination departs from Svelte's context.
 *
 * `isPrimary`/`expanded`/`scrollOwner` are plain `@Input()`s here (not
 * derived from an injected context, unlike Svelte's `getContext`): a
 * `PanelStack` ancestor discovers this component via `@ContentChildren` and
 * pushes these three directly onto each instance it finds. A `PanelSection`
 * with no such ancestor (never synced) simply keeps its declared defaults —
 * which mirror `PanelSection.svelte`'s own "no context" fallback exactly:
 * fully expanded, scroll-owning, non-primary, so it still renders sanely in
 * isolation.
 */
@Component({
  selector: "st-panel-section",
  standalone: true,
  imports: [Icon],
  // The host tag itself carries `.st-panelSection` (no inner wrapper div) —
  // see `PanelStack.ts`'s class-level doc comment for why: the shared
  // stylesheet's `.st-panelStack > .st-panelSection + .st-panelSection`
  // separator rule needs `.st-panelSection` to be a genuine DOM child of
  // `.st-panelStack`, and `display:flex`/`flex:0 0 auto`/`flex:1 1 0` (from
  // that same class) need to apply to a box that actually participates as a
  // flex item in the stack's layout — both of which an extra
  // `:host{display:contents}`-wrapped inner div would undermine.
  host: {
    "[attr.data-st-component]": "componentName",
    "[attr.data-panel-section-id]": "id",
    "[class]": "hostClass",
  },
  template: `
    <div class="st-panelSection__header" #headerEl>
      <h3 class="st-panelSection__heading">
        @if (isPrimary) {
          <span class="st-panelSection__title st-panelSection__title--primary" [id]="triggerId">{{ label }}</span>
        } @else {
          <button
            type="button"
            class="st-panelSection__trigger"
            [attr.aria-expanded]="expanded ? 'true' : 'false'"
            [attr.aria-controls]="regionId"
            [id]="triggerId"
            (click)="onTriggerClick()"
          >
            <span class="st-panelSection__title">{{ label }}</span>
            <span [class]="iconClass" aria-hidden="true">
              <st-icon name="chevron-down" [size]="18"></st-icon>
            </span>
          </button>
        }
      </h3>
      @if (actions) {
        <div class="st-panelSection__actions">
          <ng-content select="[slot='actions']"></ng-content>
        </div>
      }
    </div>
    <!-- Mounted once, always — collapsing is purely a class/CSS concern
         (sizing + hiding this region), never a conditional block. A chat
         session, a map or any other stateful widget rendered here survives
         collapse/expand without remounting; see AppShell's
         panelCollapse="accordion" region for the same technique. -->
    <div [class]="bodyClasses" role="region" [id]="regionId" [attr.aria-labelledby]="triggerId">
      <ng-content></ng-content>
    </div>
  `,
})
export class PanelSection {
  static readonly stComponentName = "PanelSection";
  readonly componentName = "PanelSection";

  @NgInput() id!: string;
  @NgInput() label!: string;
  @NgInput() actions?: boolean;
  @NgInput("class") classInput?: string;

  /** Angular-idiom @Input()s (not literal Svelte props) — see the class-level
   *  doc comment: a PanelStack ancestor pushes these directly. Defaults match
   *  PanelSection.svelte's own no-context fallback. */
  @NgInput() isPrimary = false;
  @NgInput() expanded = true;
  @NgInput() scrollOwner = true;

  /** Angular-idiom addition: fired with this section's `id` when its header
   *  trigger is activated. `PanelStack` subscribes to every discovered
   *  section's emitter to drive `toggle()`. */
  @Output() readonly toggleRequested = new EventEmitter<string>();

  @ViewChild("headerEl") private headerElRef?: ElementRef<HTMLElement>;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  /** The section's own root element — is the host itself (see the
   *  class-level doc comment) — read by `PanelStack` for ResizeObserver
   *  measurement. */
  get rootElement(): HTMLElement {
    return this.host.nativeElement;
  }

  /** Split-primary's auto-collapse measures whichever section is CURRENTLY
   *  primary by its header height specifically — see `PanelStack.ts`'s
   *  `register` doc; sticky-item ignores it. `undefined` until the view has
   *  rendered (e.g. a bare, un-mounted instance in a test). */
  get headerElement(): HTMLElement | undefined {
    return this.headerElRef?.nativeElement;
  }

  get triggerId(): string {
    return `st-panelSection-trigger-${this.id}`;
  }

  get regionId(): string {
    return `st-panelSection-region-${this.id}`;
  }

  get hostClass(): string {
    return classNames("st-panelSection", this.scrollOwner ? "st-panelSection--scrollOwner" : null, this.classInput);
  }

  get bodyClasses(): string {
    return classNames(
      "st-panelSection__body",
      this.scrollOwner
        ? "st-panelSection__body--scrollOwner"
        : !this.expanded
          ? "st-panelSection__body--collapsed"
          : null,
    );
  }

  get iconClass(): string {
    return classNames("st-panelSection__icon", this.expanded ? "st-panelSection__icon--expanded" : null);
  }

  onTriggerClick(): void {
    this.toggleRequested.emit(this.id);
  }
}
