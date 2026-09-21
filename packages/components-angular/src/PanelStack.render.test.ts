// @vitest-environment jsdom
import "@angular/compiler";
import { afterEach, describe, expect, it } from "vitest";
import { Component, createComponent, provideZonelessChangeDetection } from "@angular/core";
import type { ApplicationRef, ComponentRef, Type } from "@angular/core";
import { createApplication } from "@angular/platform-browser";

import { PanelSection } from "../dist/PanelSection.js";
import { PanelStack } from "../dist/PanelStack.js";

// ---------------------------------------------------------------------------
// Rendering tests, through a real consumer template. `PanelStack.test.ts`
// drives bare instances; that cannot see the Angular lifecycle ordering the
// stack depends on. `PanelStack.syncSections()` runs from the stack's
// `ngAfterContentInit`, BEFORE its children's view queries are refreshed, so a
// section only registers if its `#headerEl` query is resolved at view
// creation (`static: true`). With a non-static query every `headerElement` is
// still `undefined` there, no section registers, and the stack renders zero
// expanded sections and zero scroll owners, silently, forever. Only a mounted
// template exercises that ordering, so that is what these tests do.
// ---------------------------------------------------------------------------

type Mounted = { root: HTMLElement; app: ApplicationRef; ref: ComponentRef<unknown> };
const mounted: Mounted[] = [];

async function render(component: Type<unknown>): Promise<Mounted> {
  const app = await createApplication({ providers: [provideZonelessChangeDetection()] });
  const root = document.createElement("div");
  document.body.append(root);
  const ref = createComponent(component, { environmentInjector: app.injector, hostElement: root });
  app.attachView(ref.hostView);
  app.tick();
  const m = { root, app, ref };
  mounted.push(m);
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

// Children declared in the consumer's template — the only kind of content an
// Angular `@ContentChildren` query resolves, and the way every real consumer
// writes a stack.
const StickyConsumer = Component({
  selector: "probe-sticky-consumer",
  standalone: true,
  imports: [PanelStack, PanelSection],
  template: `
    <st-panel-stack label="Side panel" defaultExpanded="filters">
      <st-panel-section id="filters" label="Filters"><p>Filters body</p></st-panel-section>
      <st-panel-section id="details" label="Details"><p>Details body</p></st-panel-section>
      <st-panel-section id="history" label="History"><p>History body</p></st-panel-section>
    </st-panel-stack>
  `,
})(class StickyConsumer {});

function section(root: HTMLElement, id: string): HTMLElement {
  const el = root.querySelector<HTMLElement>(`st-panel-section[data-panel-section-id="${id}"]`);
  if (!el) throw new Error(`section ${id} not rendered`);
  return el;
}

function expandedIds(root: HTMLElement): string[] {
  return [...root.querySelectorAll<HTMLElement>("st-panel-section")]
    .filter((el) => el.querySelector(".st-panelSection__trigger")?.getAttribute("aria-expanded") === "true")
    .map((el) => el.dataset["panelSectionId"] ?? "");
}

function scrollOwnerIds(root: HTMLElement): string[] {
  return [...root.querySelectorAll<HTMLElement>("st-panel-section")]
    .filter((el) => el.querySelector(".st-panelSection__body--scrollOwner"))
    .map((el) => el.dataset["panelSectionId"] ?? "");
}

describe("PanelStack + PanelSection, rendered from a consumer template (sticky-item)", () => {
  it("expands exactly one section: the seeded one, the others collapsed to their header", async () => {
    const { root } = await render(StickyConsumer);

    expect(root.querySelectorAll("st-panel-section")).toHaveLength(3);
    expect(expandedIds(root)).toEqual(["filters"]);
    expect(root.querySelectorAll(".st-panelSection__body--collapsed")).toHaveLength(2);
  }, 20_000);

  it("gives the scroll to exactly one section, the expanded one", async () => {
    const { root } = await render(StickyConsumer);

    expect(scrollOwnerIds(root)).toEqual(["filters"]);
  }, 20_000);

  it("moves the expanded section, and the scroll with it, when another header is clicked", async () => {
    const { root, app } = await render(StickyConsumer);

    section(root, "details").querySelector<HTMLButtonElement>(".st-panelSection__trigger")!.click();
    app.tick();

    expect(expandedIds(root)).toEqual(["details"]);
    expect(scrollOwnerIds(root)).toEqual(["details"]);
    expect(section(root, "filters").querySelector(".st-panelSection__body--collapsed")).not.toBeNull();
  }, 20_000);
});
