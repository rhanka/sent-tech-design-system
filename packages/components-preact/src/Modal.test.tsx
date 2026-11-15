import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

describe("Modal (Preact)", () => {
  it("renders nothing while closed", () => {
    const { container } = render(<Modal title="Confirm">Proceed?</Modal>);
    expect(container.innerHTML).toBe("");
    expect(document.body.style.overflow).toBe("");
  });

  it("exposes the dialog contract: role, aria-modal, accessible name, DS classes", () => {
    render(
      <Modal open title="Confirm" description="Irreversible" footer={<button type="button">OK</button>} className="extra">
        Proceed?
      </Modal>,
    );
    const dialog = screen.getByRole("dialog", { name: "Confirm" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("tabindex")).toBe("-1");
    expect(dialog.className).toBe("st-modal extra");
    expect(dialog.parentElement?.className).toBe("st-modal__backdrop");
    expect(screen.getByText("Confirm").className).toBe("st-modal__title");
    expect(screen.getByText("Irreversible").className).toBe("st-modal__description");
    expect(screen.getByText("Proceed?").className).toBe("st-modal__body");
    expect(screen.getByRole("button", { name: "OK" }).parentElement?.className).toBe("st-modal__footer");
    expect(screen.getByRole("button", { name: "Close" }).querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("falls back to the 'Modal' accessible name without a title", () => {
    render(<Modal open>Body</Modal>);
    expect(screen.getByRole("dialog", { name: "Modal" })).toBeTruthy();
  });

  it("focuses the close button, locks body scroll and restores it on unmount", () => {
    const { unmount } = render(
      <Modal open title="Confirm">
        Proceed?
      </Modal>,
    );
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("traps Tab inside the dialog and closes on Escape or the close button", () => {
    const onClose = vi.fn();
    render(
      <>
        <button type="button">Before</button>
        <Modal open title="Confirm" onClose={onClose} closeLabel="Dismiss">
          <button type="button">First action</button>
          <button type="button">Last action</button>
        </Modal>
      </>,
    );
    const close = screen.getByRole("button", { name: "Dismiss" });
    const last = screen.getByRole("button", { name: "Last action" });

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(close);

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(close);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("accepts a signal for `open` at the edge and follows it", async () => {
    const open = signal(false);
    render(
      <Modal open={open} title="Confirm">
        Proceed?
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    open.value = true;
    await waitFor(() => expect(screen.getByRole("dialog", { name: "Confirm" })).toBeTruthy());
    // Effects of a signal-driven re-render are flushed after the render itself.
    await waitFor(() => expect(document.body.style.overflow).toBe("hidden"));
    open.value = false;
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.body.style.overflow).toBe(""));
  });
});
