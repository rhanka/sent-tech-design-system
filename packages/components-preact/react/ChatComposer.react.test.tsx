// React leg only. `textInput` is the one adapter whose behaviour differs
// between the two legs (`onInput` on Preact, `onChange` on React), and the
// existing `components-react` tests only render `ChatComposer`. This file
// types into the EMITTED composer and submits it, so the React twin of the
// adapter (`react/runtime.ts`) is exercised end to end.
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as barrel from "../../components-react/src/index.js";
import { ChatComposer } from "../.react-emit/src/ChatComposer.js";

afterEach(cleanup);

function type(textarea: HTMLTextAreaElement, value: string) {
  // React listens to the native `input` event for `onChange` on a text control.
  fireEvent.change(textarea, { target: { value } });
}

describe("ChatComposer (React emission), text-input path", () => {
  it("is the module the components-react barrel serves", () => {
    expect(barrel.ChatComposer).toBe(ChatComposer);
  });

  it("tracks every keystroke, enables the submit and emits the draft on submit", () => {
    const onSubmit = vi.fn();
    render(<ChatComposer placeholder="Ask" submitLabel="Send message" onSubmit={onSubmit} />);
    const textarea = screen.getByPlaceholderText("Ask") as HTMLTextAreaElement;
    const submit = screen.getByRole("button", { name: "Send message" }) as HTMLButtonElement;
    expect(textarea.value).toBe("");
    expect(submit.disabled).toBe(true);

    type(textarea, "   ");
    expect(textarea.value).toBe("   ");
    expect(submit.disabled).toBe(true);
    type(textarea, "H");
    expect(submit.disabled).toBe(false);
    type(textarea, "Hello");
    expect(textarea.value).toBe("Hello");
    expect(submit.disabled).toBe(false);

    const notPrevented = fireEvent.submit(textarea.closest("form") as HTMLFormElement);
    expect(notPrevented).toBe(false);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ value: "Hello" });
  });

  it("keeps the field controlled: the DOM value follows the draft after each change", () => {
    const onSubmit = vi.fn();
    render(<ChatComposer value="Draft" placeholder="Ask" onSubmit={onSubmit} />);
    const textarea = screen.getByPlaceholderText("Ask") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Draft");
    type(textarea, "Draft, edited");
    type(textarea, "");
    expect(textarea.value).toBe("");
    expect((screen.getByRole("button", { name: "Send" }) as HTMLButtonElement).disabled).toBe(true);
    type(textarea, "Final");
    fireEvent.submit(textarea.closest("form") as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalledWith({ value: "Final" });
  });
});
