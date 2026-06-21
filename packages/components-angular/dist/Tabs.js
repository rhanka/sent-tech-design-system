import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
let _tabCounter = 0;
export class Tabs {
    static stComponentName = "Tabs";
    componentName = "Tabs";
    uid = `st-tabs-${++_tabCounter}`;
    localCurrent = "";
    items;
    activeValue;
    activeId;
    label;
    onchange;
    classInput;
    change = new EventEmitter();
    ngOnInit() {
        if (!this.localCurrent) {
            const first = this.items?.find((item) => !item.disabled) ?? this.items?.[0];
            if (first) {
                this.localCurrent = this.tabId(first, this.items.indexOf(first));
            }
        }
    }
    tabId(item, index) {
        return item.id ?? item.value ?? `tab-${index}`;
    }
    get current() {
        return this.activeValue ?? this.activeId ?? this.localCurrent;
    }
    get activeTabId() {
        const idx = Math.max(0, this.items?.findIndex((item, i) => this.tabId(item, i) === this.current) ?? 0);
        return this.tabId(this.items?.[idx] ?? this.items?.[0], idx);
    }
    get activeContent() {
        const idx = Math.max(0, this.items?.findIndex((item, i) => this.tabId(item, i) === this.current) ?? 0);
        return this.items?.[idx]?.content ?? "";
    }
    isActive(item, index) {
        return this.tabId(item, index) === this.current;
    }
    tabClass(item, index) {
        return classNames("st-tabs__tab", this.isActive(item, index) && "st-tabs__tab--active");
    }
    select(item, index) {
        if (item.disabled)
            return;
        const val = this.tabId(item, index);
        if (this.activeValue === undefined && this.activeId === undefined) {
            this.localCurrent = val;
        }
        this.change.emit(val);
        this.onchange?.(val);
    }
    get hostClass() {
        return classNames("st-tabs", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tabs, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Tabs, isStandalone: true, selector: "st-tabs", inputs: { items: "items", activeValue: "activeValue", activeId: "activeId", label: "label", onchange: "onchange", classInput: ["class", "classInput"] }, outputs: { change: "change" }, ngImport: i0, template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-tabs__list" role="tablist" [attr.aria-label]="label ?? 'Tabs'">
        @for (item of items; track tabId(item, $index)) {
          <button
            type="button"
            role="tab"
            [id]="uid + '-tab-' + tabId(item, $index)"
            [class]="tabClass(item, $index)"
            [attr.aria-selected]="isActive(item, $index)"
            [attr.aria-controls]="uid + '-panel-' + tabId(item, $index)"
            [attr.tabindex]="isActive(item, $index) ? 0 : -1"
            [disabled]="item.disabled"
            (click)="select(item, $index)"
          >{{ item.label }}</button>
        }
      </div>
      <div
        [id]="uid + '-panel-' + activeTabId"
        class="st-tabs__panel"
        role="tabpanel"
        [attr.aria-labelledby]="uid + '-tab-' + activeTabId"
      >{{ activeContent }}<ng-content></ng-content></div>
    </section>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Tabs, decorators: [{
            type: Component,
            args: [{
                    selector: "st-tabs",
                    standalone: true,
                    template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-tabs__list" role="tablist" [attr.aria-label]="label ?? 'Tabs'">
        @for (item of items; track tabId(item, $index)) {
          <button
            type="button"
            role="tab"
            [id]="uid + '-tab-' + tabId(item, $index)"
            [class]="tabClass(item, $index)"
            [attr.aria-selected]="isActive(item, $index)"
            [attr.aria-controls]="uid + '-panel-' + tabId(item, $index)"
            [attr.tabindex]="isActive(item, $index) ? 0 : -1"
            [disabled]="item.disabled"
            (click)="select(item, $index)"
          >{{ item.label }}</button>
        }
      </div>
      <div
        [id]="uid + '-panel-' + activeTabId"
        class="st-tabs__panel"
        role="tabpanel"
        [attr.aria-labelledby]="uid + '-tab-' + activeTabId"
      >{{ activeContent }}<ng-content></ng-content></div>
    </section>
  `,
                }]
        }], propDecorators: { items: [{
                type: NgInput
            }], activeValue: [{
                type: NgInput
            }], activeId: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], onchange: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], change: [{
                type: Output
            }] } });
//# sourceMappingURL=Tabs.js.map