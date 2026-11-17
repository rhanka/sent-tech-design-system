// React leg only. The emitted ForceGraph must map the `dblClick` adapter to
// React's `onDoubleClick`: double-clicking a node fires `onOpenEntity` (the
// Preact leg covers the `onDblClick` twin in p4a-group1-edges).
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ForceGraph } from "../.react-emit/src/ForceGraph.js";

afterEach(cleanup);

describe("ForceGraph (React emission), double-click opens the entity", () => {
  it("fires onOpenEntity with the node id on double-click", () => {
    const onOpenEntity = vi.fn();
    const { container } = render(
      <ForceGraph
        nodes={[{ id: "a" }, { id: "b" }]}
        edges={[{ source: "a", target: "b" }]}
        label="L"
        onOpenEntity={onOpenEntity}
      />,
    );
    const shapes = container.querySelectorAll(".st-forceGraph__shape");
    expect(shapes.length).toBe(2);
    fireEvent.doubleClick(shapes[1]);
    expect(onOpenEntity).toHaveBeenCalledTimes(1);
    expect(onOpenEntity).toHaveBeenCalledWith("b");
  });
});
