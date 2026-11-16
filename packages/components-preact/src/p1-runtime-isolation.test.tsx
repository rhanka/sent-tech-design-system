// Isolation proof for the options.vnode SVG normalisation (Carbon round-2
// finding 2). This file imports NO forwardRef component, so src/runtime.ts is
// evaluated ONLY through the explicit side-effect imports in FieldCard.tsx,
// Rating.tsx (and the barrel belt-and-suspenders in index.ts). If those
// imports regress — or the package.json sideEffects listing drops them —
// strokeWidth reverts to camelCase attributes and these tests fail. Vitest
// isolates module registries per test file, so the forwardRef imports in
// p1-edges.test.tsx cannot mask a gap here.
import { cleanup, render } from "@testing-library/preact";
import { afterEach, describe, expect, it } from "vitest";
import { FieldCard } from "./FieldCard.js";
import { Rating } from "./Rating.js";

afterEach(cleanup);

describe("P1 runtime isolation (Carbon finding 2)", () => {
  it("a deep import of FieldCard renders kebab-case SVG presentation attributes", () => {
    const { container } = render(<FieldCard label="F" commentCount={2} onOpenComments={() => {}} />);
    const path = container.querySelector("svg path");
    expect(path?.getAttribute("stroke-width")).toBe("1.25");
    expect(path?.getAttribute("stroke-linecap")).toBe("round");
    expect(path?.getAttribute("stroke-linejoin")).toBe("round");
    expect(path?.getAttribute("strokeWidth")).toBeNull();
    expect(path?.getAttribute("strokeLinecap")).toBeNull();
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 16 16");
  });

  it("a deep import of Rating renders kebab-case SVG presentation attributes", () => {
    const { container } = render(<Rating value={3} label="Note" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("stroke-width")).toBe("1.75");
    expect(svg?.getAttribute("stroke-linecap")).toBe("round");
    expect(svg?.getAttribute("stroke-linejoin")).toBe("round");
    expect(svg?.getAttribute("strokeWidth")).toBeNull();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
  });
});
