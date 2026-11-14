import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createRef } from "preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";

afterEach(cleanup);

describe("Button (Preact)", () => {
  it("renders the shared DS class contract with the default variant, size and type", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.className).toBe("st-button st-button--primary st-button--md");
    expect(button.getAttribute("type")).toBe("button");
  });

  it("applies variant, size, type and a consumer class", () => {
    render(
      <Button variant="danger" size="lg" type="submit" className="extra">
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button.className).toBe("st-button st-button--danger st-button--lg extra");
    expect(button.getAttribute("type")).toBe("submit");
  });

  it("forwards its ref to the <button> element (object and callback refs)", () => {
    const objectRef = createRef<HTMLButtonElement>();
    const callbackRef = vi.fn();
    render(
      <>
        <Button ref={objectRef}>One</Button>
        <Button ref={callbackRef}>Two</Button>
      </>,
    );
    expect(objectRef.current).toBe(screen.getByRole("button", { name: "One" }));
    expect(callbackRef).toHaveBeenCalledWith(screen.getByRole("button", { name: "Two" }));
  });

  it("passes native attributes and events through", () => {
    const onClick = vi.fn();
    render(
      <Button disabled={false} aria-pressed="true" data-testid="b" onClick={onClick}>
        Toggle
      </Button>,
    );
    const button = screen.getByTestId("b");
    expect(button.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("binds a signal-valued attribute to the DOM without re-rendering the component", async () => {
    const disabled = signal(false);
    let renders = 0;
    function Host() {
      renders += 1;
      return <Button disabled={disabled}>Send</Button>;
    }
    render(<Host />);
    const button = screen.getByRole("button", { name: "Send" }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    disabled.value = true;
    // @preact/signals flushes DOM bindings asynchronously.
    await waitFor(() => expect(button.disabled).toBe(true));
    expect(renders).toBe(1);
  });
});
