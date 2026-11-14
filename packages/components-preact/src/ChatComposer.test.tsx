import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatComposer } from "./ChatComposer.js";

afterEach(cleanup);

function type(textarea: HTMLTextAreaElement, value: string) {
  fireEvent.input(textarea, { target: { value } });
}

describe("ChatComposer (Preact)", () => {
  it("renders the composer contract: form, textarea, toolbar and a disabled submit while empty", () => {
    const { container } = render(
      <ChatComposer placeholder="Ask" aria-label="Composer" className="extra">
        <button type="button">Attach</button>
      </ChatComposer>,
    );
    const form = screen.getByRole("form", { name: "Composer" });
    expect(form.className).toBe("st-chatComposer extra");
    const textarea = screen.getByPlaceholderText("Ask") as HTMLTextAreaElement;
    expect(textarea.className).toBe("st-chatComposer__textarea st-chatComposer__input");
    expect(textarea.value).toBe("");
    const submit = screen.getByRole("button", { name: "Send" }) as HTMLButtonElement;
    expect(submit.getAttribute("type")).toBe("submit");
    expect(submit.className).toBe("st-button st-button--primary st-button--md");
    expect(submit.disabled).toBe(true);
    expect(submit.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".st-chatComposer__actions--left")?.textContent).toBe("Attach");
    expect(container.querySelector(".st-chatComposer__body .st-chatComposer__inputShell textarea")).toBe(textarea);
  });

  it("tracks every keystroke, enables the submit and emits the draft on submit", () => {
    const onSubmit = vi.fn();
    render(<ChatComposer placeholder="Ask" submitLabel="Send message" onSubmit={onSubmit} />);
    const textarea = screen.getByPlaceholderText("Ask") as HTMLTextAreaElement;
    const submit = screen.getByRole("button", { name: "Send message" }) as HTMLButtonElement;

    type(textarea, "   ");
    expect(submit.disabled).toBe(true);
    type(textarea, "Hello");
    expect(textarea.value).toBe("Hello");
    expect(submit.disabled).toBe(false);

    const notPrevented = fireEvent.submit(textarea.closest("form") as HTMLFormElement);
    expect(notPrevented).toBe(false);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ value: "Hello" });
  });

  it("seeds the draft from `value`", () => {
    const onSubmit = vi.fn();
    render(<ChatComposer value="Draft" placeholder="Ask" onSubmit={onSubmit} />);
    const textarea = screen.getByPlaceholderText("Ask") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Draft");
    expect((screen.getByRole("button", { name: "Send" }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.submit(textarea.closest("form") as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalledWith({ value: "Draft" });
  });

  it("accepts a signal as the seed and reads it once, untracked", () => {
    const seed = signal("From signal");
    let renders = 0;
    function Host() {
      renders += 1;
      return <ChatComposer value={seed} placeholder="Ask" />;
    }
    render(<Host />);
    const textarea = screen.getByPlaceholderText("Ask") as HTMLTextAreaElement;
    expect(textarea.value).toBe("From signal");
    type(textarea, "Edited");
    seed.value = "Changed later";
    expect(textarea.value).toBe("Edited");
    expect(renders).toBe(1);
  });
});
