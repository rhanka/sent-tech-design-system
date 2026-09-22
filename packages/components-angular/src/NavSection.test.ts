// @vitest-environment jsdom
import "@angular/compiler";
import { afterEach, describe, expect, it } from "vitest";
import { Component, createComponent, provideZonelessChangeDetection } from "@angular/core";
import type { ApplicationRef, ComponentRef, Type } from "@angular/core";
import { createApplication } from "@angular/platform-browser";

import { NavSection } from "../dist/NavSection.js";

// ---------------------------------------------------------------------------
// Rendering tests, through a real consumer template. NavSection has two
// branches (collapsible disclosure / static titled group) and must show the
// consumer's content in whichever one is active. Declaring one default
// `<ng-content>` per branch does not do that: Angular feeds a single default
// slot per component, so one branch always rendered empty. The content is
// now declared once, in an `<ng-template>` each branch inserts — these tests
// pin that the SAME projected nodes reach both branches.
// ---------------------------------------------------------------------------

type Mounted<T> = { root: HTMLElement; app: ApplicationRef; ref: ComponentRef<T> };
const mounted: Mounted<unknown>[] = [];

async function render<T>(component: Type<T>): Promise<Mounted<T>> {
  const app = await createApplication({ providers: [provideZonelessChangeDetection()] });
  const root = document.createElement("div");
  document.body.append(root);
  const ref = createComponent(component, { environmentInjector: app.injector, hostElement: root });
  app.attachView(ref.hostView);
  app.tick();
  const m = { root, app, ref };
  mounted.push(m as Mounted<unknown>);
  return m;
}

afterEach(() => {
  for (const { root, app, ref } of mounted.splice(0)) {
    app.detachView(ref.hostView);
    ref.destroy();
    app.destroy();
    root.remove();
  }
});

class ConsumerState {
  collapsible = true;
}

const Consumer = Component({
  selector: "probe-nav-consumer",
  standalone: true,
  imports: [NavSection],
  template: `
    <st-nav-section label="Workspace" [collapsible]="collapsible">
      <a class="probe-item" href="#overview">Overview</a>
      <a class="probe-item" href="#members">Members</a>
      <a class="probe-item" href="#settings">Settings</a>
    </st-nav-section>
  `,
})(ConsumerState);

function itemTexts(scope: Element | null): string[] {
  return [...(scope?.querySelectorAll(".probe-item") ?? [])].map((el) => el.textContent ?? "");
}

describe("NavSection, rendered from a consumer template", () => {
  it("shows the projected content in the collapsible branch, then in the static branch", async () => {
    const { root, app, ref } = await render<ConsumerState>(Consumer);

    // Collapsible (open by default): the items live in the disclosure region.
    expect(root.querySelector(".st-navSection--collapsible")).not.toBeNull();
    expect(itemTexts(root.querySelector(".st-collapsible__region"))).toEqual(["Overview", "Members", "Settings"]);

    // Same instance switched to static: the same items move to the group body.
    ref.instance.collapsible = false;
    ref.changeDetectorRef.detectChanges();
    app.tick();

    expect(root.querySelector(".st-navSection--collapsible")).toBeNull();
    expect(root.querySelector(".st-navSection--static")).not.toBeNull();
    expect(itemTexts(root.querySelector(".st-navSection__body"))).toEqual(["Overview", "Members", "Settings"]);
    expect(itemTexts(root)).toHaveLength(3);
  }, 20_000);
});
