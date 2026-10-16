// @vitest-environment jsdom
import "@angular/compiler";
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";
import { describe, expect, it } from "vitest";

import { TimeRangePicker } from "../dist/TimeRangePicker.js";

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

type Range = { mode: "relative" | "absolute"; relative?: string; from: number; to: number };

// Mounted consumer of the documented customExtra usage with the openChange /
// change contract: the extra stays a draft, every dismissal emits nothing.
class DismissalHost {
  range: Range = {
    mode: "absolute",
    from: new Date(2024, 0, 15, 10, 0).getTime(),
    to: new Date(2024, 2, 10, 11, 30).getTime(),
  };
  opens: boolean[] = [];
  seen: unknown[] = [];
  opened = (open: boolean): void => {
    this.opens.push(open);
  };
  changed = (next: unknown): void => {
    this.seen.push(next);
  };
}
Component({
  standalone: true,
  imports: [TimeRangePicker],
  template: `
    <st-time-range-picker [value]="range" locale="en-US" (openChange)="opened($event)" (change)="changed($event)">
      <div slot="customExtra"><p data-testid="trp-extra">Document or acquisition?</p></div>
    </st-time-range-picker>
  `,
})(DismissalHost);

describe("TimeRangePicker — Escape / outside dismissal in a mounted Angular consumer", () => {
  it("Escape and outside pointerdown close the panel, report openChange(false) and emit no change", () => {
    const fixture = TestBed.createComponent(DismissalHost);
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
    expect(host.opens).toEqual([true, false]);
    expect(host.seen).toEqual([]);

    open();
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    fixture.detectChanges();
    expect(host.opens).toEqual([true, false, true, false]);
    expect(host.seen).toEqual([]);
  });
});
