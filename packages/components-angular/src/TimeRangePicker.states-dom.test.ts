// @vitest-environment jsdom
import "@angular/compiler";
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";
import { describe, expect, it } from "vitest";

import { TimeRangePicker } from "../dist/TimeRangePicker.js";

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

type Range = { mode: "relative" | "absolute"; relative?: string; from: number; to: number };

class HeaderHost {
  range: Range = {
    mode: "absolute",
    from: new Date(2024, 0, 15, 10, 0).getTime(),
    to: new Date(2024, 2, 10, 11, 30).getTime(),
  };
  cancelled = 0;
  applied: unknown[] = [];
  onCancel = (): void => {
    this.cancelled += 1;
  };
  onApply = (v: unknown): void => {
    this.applied.push(v);
  };
}
Component({
  standalone: true,
  imports: [TimeRangePicker],
  template: `
    <st-time-range-picker [value]="range" locale="en-US" [onCancel]="onCancel" [onApply]="onApply">
      <div slot="customHeader"><p data-testid="trp-header">Document or acquisition?</p></div>
    </st-time-range-picker>
  `,
})(HeaderHost);

class BareHost {
  range: Range = {
    mode: "absolute",
    from: new Date(2024, 0, 15, 10, 0).getTime(),
    to: new Date(2024, 2, 10, 11, 30).getTime(),
  };
}
Component({
  standalone: true,
  imports: [TimeRangePicker],
  template: `<st-time-range-picker [value]="range" locale="en-US"></st-time-range-picker>`,
})(BareHost);

describe("TimeRangePicker — customHeader projection in a mounted Angular consumer", () => {
  it("projects the header above the calendars and hides the empty host otherwise", () => {
    const fixture = TestBed.createComponent(HeaderHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    (root.querySelector(".st-timeRangePicker__trigger") as HTMLElement).click();
    fixture.detectChanges();
    const slot = root.querySelector(".st-timeRangePicker__customHeader") as HTMLElement;
    expect(slot.querySelector('[data-testid="trp-header"]')).toBeTruthy();
    const calendars = root.querySelector(".st-timeRangePicker__calendars") as HTMLElement;
    expect(calendars).toBeTruthy();
    expect(slot.compareDocumentPosition(calendars) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const bare = TestBed.createComponent(BareHost);
    bare.detectChanges();
    const bareRoot = bare.nativeElement as HTMLElement;
    (bareRoot.querySelector(".st-timeRangePicker__trigger") as HTMLElement).click();
    bare.detectChanges();
    const bareSlot = bareRoot.querySelector(".st-timeRangePicker__customHeader") as HTMLElement;
    // Always rendered (projection host) but empty -> hidden by :empty.
    expect(bareSlot.textContent?.trim()).toBe("");
  });

  it("Escape and outside pointerdown close the panel and call onCancel", () => {
    const fixture = TestBed.createComponent(HeaderHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const open = () => {
      (root.querySelector(".st-timeRangePicker__trigger") as HTMLElement).click();
      fixture.detectChanges();
    };

    open();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(host.cancelled).toBe(1);

    open();
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    fixture.detectChanges();
    expect(host.cancelled).toBe(2);
    expect(host.applied).toEqual([]);
  });

  it("Apply calls onApply without onCancel", () => {
    const fixture = TestBed.createComponent(HeaderHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    (root.querySelector(".st-timeRangePicker__trigger") as HTMLElement).click();
    fixture.detectChanges();
    const apply = Array.from(root.querySelectorAll<HTMLElement>("button, st-button")).find(
      (b) => b.textContent?.trim() === "Apply",
    ) as HTMLElement;
    (apply.tagName === "ST-BUTTON" ? apply.querySelector("button") : apply)!.click();
    fixture.detectChanges();
    expect(host.applied).toHaveLength(1);
    expect(host.cancelled).toBe(0);
  });
});
