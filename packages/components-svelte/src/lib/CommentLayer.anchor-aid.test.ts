import { fireEvent, render } from "@testing-library/svelte";
import { createRawSnippet, tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { decodeAnchor, resolveAnchor } from "@sentropic/design-system-review-core";
import CommentLayer, { type CommentLayerCreatePayload } from "./CommentLayer.svelte";

const artifactHtml = `<div data-review-root>
  <header data-anchor-id="hdr-title"><h1>Quarterly Review</h1></header>
  <section data-anchor-id="sec-a"><p>Section A body.</p></section>
  <section data-anchor-id="sec-b"><p>Section B body.</p></section>
</div>`;

const currentUser = { actorId: "user-alice", kind: "human" as const, displayLabel: "Alice", color: "#2563eb" };

async function clickAndSubmit(container: HTMLElement, selector: string, body: string) {
  const target = container.querySelector<HTMLElement>(selector);
  expect(target).toBeTruthy();
  await fireEvent.click(target!);
  await tick();
  const composer = container.querySelector(".st-review-layer__composer");
  expect(composer).toBeTruthy();
  const textarea = container.querySelector<HTMLTextAreaElement>(".st-review-composer__textarea");
  expect(textarea).toBeTruthy();
  await fireEvent.input(textarea!, { target: { value: body } });
  await tick();
  const submit = container.querySelector<HTMLButtonElement>('.st-review-composer__actions button[type="submit"]');
  expect(submit).toBeTruthy();
  await fireEvent.click(submit!);
  await tick();
}

describe("CommentLayer — element anchors keep the block aid (B5)", () => {
  it("click on an inner <p> of a <section data-anchor-id> creates an element anchor carrying the section aid", async () => {
    const created: CommentLayerCreatePayload[] = [];
    const onCreate = vi.fn((payload: CommentLayerCreatePayload) => {
      created.push(payload);
      return Promise.resolve();
    });
    const { container } = render(CommentLayer, {
      props: {
        mode: "review",
        target: { kind: "artifact", id: "art-1" },
        artifactVersion: "v1",
        comments: [],
        currentUser,
        onCreate,
        children: createRawSnippet(() => ({ render: () => artifactHtml })),
      },
    });
    await tick();

    await clickAndSubmit(container, '[data-anchor-id="sec-b"] p', "Check section B");

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(created).toHaveLength(1);
    const anchor = decodeAnchor(created[0]!.sectionKey);
    expect(anchor).not.toBeNull();
    expect(anchor!.t).toBe("element");
    if (anchor!.t === "element") {
      expect(anchor!.aid).toBe("sec-b");
    }
    const root = container.querySelector("[data-review-root]")!;
    expect(resolveAnchor(root, anchor!, { artifactVersion: "v1" }).status).toBe("resolved");
  });

  it("click on an <h1> of a <header data-anchor-id> carries the header aid and the header thread is never orphan", async () => {
    const created: CommentLayerCreatePayload[] = [];
    const onCreate = vi.fn((payload: CommentLayerCreatePayload) => {
      created.push(payload);
      return Promise.resolve();
    });
    const { container } = render(CommentLayer, {
      props: {
        mode: "review",
        target: { kind: "artifact", id: "art-1" },
        artifactVersion: "v1",
        comments: [],
        currentUser,
        onCreate,
        children: createRawSnippet(() => ({ render: () => artifactHtml })),
      },
    });
    await tick();

    await clickAndSubmit(container, '[data-anchor-id="hdr-title"] h1', "General header note");

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(created).toHaveLength(1);
    const anchor = decodeAnchor(created[0]!.sectionKey);
    expect(anchor).not.toBeNull();
    expect(anchor!.t).toBe("element");
    if (anchor!.t === "element") {
      expect(anchor!.aid).toBe("hdr-title");
    }
    const root = container.querySelector("[data-review-root]")!;
    const resolved = resolveAnchor(root, anchor!, { artifactVersion: "v1" });
    expect(resolved.status).toBe("resolved");
  });
});
