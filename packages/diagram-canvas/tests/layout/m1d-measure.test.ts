/**
 * M1-d measurement witnesses (§4.6.6, §5.6): subtitle delta, line sharing and
 * toggle-reduced width. Each test asserts the emitted measurement changed
 * placement, never a bare role-call observation.
 */
import { describe, expect, it } from "vitest";

import { TOGGLE_ALLOCATION } from "../../src/index.js";
import {
  buildMeasuredDocument,
  fixedLinesMeasurer,
  geometryOf,
  layMeasured,
  makePresentation,
  occurrenceOfEntity,
  wordWrapMeasurer,
} from "./m1d-fixtures.js";

const presentation = makePresentation({
  forms: { C: "container", a: "card", b: "card", lone: "card" },
  texts: {
    C: { kicker: "Zone", title: "Container", subtitle: "first second third fourth fifth sixth" },
    a: { title: "Alpha", body: "alpha body text" },
    b: { title: "Beta" },
    lone: { title: "Lone" },
  },
});

describe("measured subtitle height moves the first child row", () => {
  it("gives a first-child y delta equal to the header-height delta", () => {
    const document = buildMeasuredDocument();
    const one = layMeasured(document, presentation, fixedLinesMeasurer({ subtitle: 1 }));
    const two = layMeasured(document, presentation, fixedLinesMeasurer({ subtitle: 2 }));
    const headerOne = one.headers.find((header) => header.occurrence === occurrenceOfEntity("C"))!;
    const headerTwo = two.headers.find((header) => header.occurrence === occurrenceOfEntity("C"))!;
    expect(headerTwo.height - headerOne.height).toBe(10);
    const yOne = geometryOf(one.view, "a").y;
    const yTwo = geometryOf(two.view, "a").y;
    expect(yTwo - yOne).toBe(headerTwo.height - headerOne.height);
  });
});

describe("layout lines and emitted measurements share one result", () => {
  it("records the same lines for every slot", () => {
    const document = buildMeasuredDocument();
    const measurer = wordWrapMeasurer({ charWidth: 8 });
    const measured = layMeasured(document, presentation, measurer);
    const emitted: { role: string; lines: readonly string[] }[] = [];
    for (const header of measured.headers) {
      if (header.kicker !== undefined) emitted.push({ role: "kicker", lines: header.kicker.lines });
      emitted.push({ role: "title", lines: header.title.lines });
      if (header.subtitle !== undefined) emitted.push({ role: "subtitle", lines: header.subtitle.lines });
    }
    for (const slot of measured.slots) emitted.push({ role: slot.role, lines: slot.layout.lines });
    expect(emitted.length).toBeGreaterThan(0);
    // Every emitted line array matches a recorded call with the same role:
    // wrapping is deterministic in (text, width), so replaying the recorded
    // call reproduces the emitted lines exactly.
    for (const entry of emitted) {
      const candidates = measurer.calls.filter((call) => call.role === entry.role);
      expect(candidates.length).toBeGreaterThan(0);
      const replayed = candidates.some((call) => {
        const replay = wordWrapMeasurer({ charWidth: 8 })({
          text: call.text,
          role: call.role,
          availableWidth: call.availableWidth,
          allocatedLines: call.allocatedLines,
          folded: call.folded,
        });
        return JSON.stringify(replay.lines) === JSON.stringify(entry.lines);
      });
      expect(replayed).toBe(true);
    }
  });
});

describe("toggle-bearing headers wrap at the reduced width", () => {
  it("uses the reduced width in the input and the emitted measurement", () => {
    const document = buildMeasuredDocument();
    const measurer = wordWrapMeasurer({ charWidth: 8 });
    const measured = layMeasured(document, presentation, measurer);
    // Header measurements only: width probes use a far larger allocation.
    const titleCalls = measurer.calls.filter((call) => call.role === "title" && call.availableWidth <= 460 - 32);
    const containerCall = titleCalls.find((call) => call.text === "Container")!;
    const leafCall = titleCalls.find((call) => call.text === "Alpha")!;
    // The container renders a fold control, the leaf does not: the
    // container title is measured at its own inner width minus the toggle
    // allocation, the leaf at its full inner width.
    const containerInner = geometryOf(measured.view, "C").width - 32;
    expect(containerCall.availableWidth).toBe(containerInner - TOGGLE_ALLOCATION);
    expect(leafCall.availableWidth).toBe(460 - 32);
    expect(containerInner - containerCall.availableWidth).toBe(TOGGLE_ALLOCATION);
    const header = measured.headers.find((entry) => entry.occurrence === occurrenceOfEntity("C"))!;
    const replay = wordWrapMeasurer({ charWidth: 8 })({
      text: "Container",
      role: "title",
      availableWidth: containerCall.availableWidth,
      allocatedLines: 2,
      folded: false,
    });
    expect(header.title.lines).toEqual(replay.lines);
  });
});
