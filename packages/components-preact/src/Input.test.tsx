import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createRef } from "preact";
import { useState } from "preact/hooks";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Input } from "./Input.js";

afterEach(cleanup);

function type(input: HTMLInputElement, value: string) {
  fireEvent.input(input, { target: { value } });
}

describe("Input (Preact)", () => {
  it("associates the label with the control and renders the helper text", () => {
    const { container } = render(<Input label="Email" helperText="Work address" />);
    const input = screen.getByLabelText("Email") as HTMLInputElement;
    expect(input.className).toBe("st-control st-control--md");
    expect(input.id).toMatch(/^st-input-/);
    expect(container.querySelector(".st-field")).toBeTruthy();
    expect(screen.getByText("Work address").className).toBe("st-field__help");
    expect(input.getAttribute("aria-invalid")).toBeNull();
  });

  it("keeps an explicit id and gives two instances distinct generated ids", () => {
    render(
      <>
        <Input label="Named" id="custom" />
        <Input label="First" />
        <Input label="Second" />
      </>,
    );
    expect(screen.getByLabelText("Named").id).toBe("custom");
    expect(screen.getByLabelText("First").id).not.toBe(screen.getByLabelText("Second").id);
  });

  it("flags the invalid state and shows the error instead of the helper text", () => {
    render(<Input label="Email" size="lg" helperText="Work address" errorText="Required" />);
    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.className).toBe("st-control st-control--lg");
    expect(screen.getByText("Required").className).toBe("st-field__error");
    expect(screen.queryByText("Work address")).toBeNull();
  });

  it("forwards its ref to the <input> element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input label="Email" ref={ref} />);
    expect(ref.current).toBe(screen.getByLabelText("Email"));
  });

  it("is controlled by hook state through value + onInput", () => {
    const seen = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("a");
      return (
        <Input
          label="Name"
          value={value}
          onInput={(event) => {
            seen(event.currentTarget.value);
            setValue(event.currentTarget.value.toUpperCase());
          }}
        />
      );
    }
    render(<Controlled />);
    const input = screen.getByLabelText("Name") as HTMLInputElement;
    expect(input.value).toBe("a");
    type(input, "ab");
    expect(seen).toHaveBeenLastCalledWith("ab");
    // The parent's state, not the keystroke, decides the displayed value.
    expect(input.value).toBe("AB");
  });

  it("is controlled by a signal at the edge, without re-rendering the host", async () => {
    const value = signal("a");
    let renders = 0;
    function Host() {
      renders += 1;
      return <Input label="Name" value={value} onInput={(event) => (value.value = event.currentTarget.value)} />;
    }
    render(<Host />);
    const input = screen.getByLabelText("Name") as HTMLInputElement;
    expect(input.value).toBe("a");
    type(input, "ab");
    expect(value.value).toBe("ab");
    value.value = "reset";
    await waitFor(() => expect(input.value).toBe("reset"));
    expect(renders).toBe(1);
  });
});
