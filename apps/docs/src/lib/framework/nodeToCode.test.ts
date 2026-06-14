import { describe, expect, it } from "vitest";

import { nodeToCode } from "./nodeToCode";
import type { NodeSpec } from "./examples";

describe("nodeToCode", () => {
  it("serializes Angular primitive and expression bindings", () => {
    const nodes: NodeSpec[] = [
      {
        comp: "Input",
        props: {
          label: "Identifiant",
          invalid: true,
          count: 3,
          options: [{ label: "Admin", value: "admin" }]
        }
      }
    ];

    expect(nodeToCode(nodes, "angular")).toBe(
      `<Input
  label="Identifiant"
  [invalid]="true"
  [count]="3"
  [options]="[{'label':'Admin','value':'admin'}]"
/>`
    );
  });

  it("keeps Angular layout wrappers out of generated examples", () => {
    const nodes: NodeSpec[] = [
      {
        el: "div",
        props: { class: "fp-row" },
        children: [{ comp: "Button", props: { variant: "primary" }, children: ["Primary"] }]
      }
    ];

    expect(nodeToCode(nodes, "angular")).toBe(
      '<Button variant="primary">Primary</Button>'
    );
  });
});
