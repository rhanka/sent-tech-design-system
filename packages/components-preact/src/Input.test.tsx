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

  it("follows className, invalid, disabled and id signals post-mount and detaches refs on swap and unmount", async () => {
    const cls = signal("in-before");
    const invalid = signal(false);
    const disabled = signal(false);
    const id = signal("field-a");
    const refA = createRef<HTMLInputElement>();
    const refB = vi.fn();

    const { container, rerender, unmount } = render(
      <Input ref={refA} label="Code" id={id} className={cls} invalid={invalid} disabled={disabled} />,
    );
    const field = container.querySelector(".st-field") as HTMLElement;
    const label = container.querySelector("label") as HTMLLabelElement;
    const input = screen.getByLabelText("Code") as HTMLInputElement;
    expect(refA.current).toBe(input);
    expect(field.className).toBe("st-field in-before");
    expect(label.getAttribute("for")).toBe("field-a");
    expect(input.id).toBe("field-a");
    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(input.disabled).toBe(false);

    cls.value = "in-after";
    invalid.value = true;
    disabled.value = true;
    id.value = "field-b";
    await waitFor(() => expect(field.className).toBe("st-field in-after"));
    expect(label.getAttribute("for")).toBe("field-b");
    expect(input.id).toBe("field-b");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    await waitFor(() => expect(input.disabled).toBe(true));

    invalid.value = false;
    disabled.value = false;
    await waitFor(() => expect(input.getAttribute("aria-invalid")).toBeNull());
    await waitFor(() => expect(input.disabled).toBe(false));

    rerender(<Input ref={refB} label="Code" id={id} className={cls} invalid={invalid} disabled={disabled} />);
    expect(refA.current).toBeNull();
    expect(refB).toHaveBeenLastCalledWith(input);

    unmount();
    expect(refB).toHaveBeenLastCalledWith(null);
  });
});
