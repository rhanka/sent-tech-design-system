import { render, screen, fireEvent } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import ChatMessage from "./lib/ChatMessage.svelte";
import ChatComposer from "./lib/ChatComposer.svelte";
import ChatThread from "./lib/ChatThread.svelte";
import MessageActions from "./lib/MessageActions.svelte";
import MessageStatusBadge from "./lib/MessageStatusBadge.svelte";
import StreamingMessage from "./lib/StreamingMessage.svelte";

const dummyIcon = createRawSnippet(() => ({
  render: () => "<span>⚡</span>"
}));

const dummyChildren = createRawSnippet(() => ({
  render: () => '<p data-testid="message-content">Bonjour le monde</p>'
}));

const dummyAvatar = createRawSnippet(() => ({
  render: () => '<span data-testid="avatar">AI</span>'
}));

const dummyFooter = createRawSnippet(() => ({
  render: () => '<span data-testid="footer">Signature</span>'
}));

const dummyActions = createRawSnippet(() => ({
  render: () => '<button data-testid="action-btn">Action</button>'
}));

describe("MessageStatusBadge", () => {
  it("renders correctly with default warning for pending", () => {
    render(MessageStatusBadge, { props: { status: "pending" } });
    const badge = screen.getByLabelText("Statut: En attente");
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain("En attente");
  });

  it("renders correctly with default info for processing", () => {
    render(MessageStatusBadge, { props: { status: "processing" } });
    const badge = screen.getByLabelText("Statut: En cours");
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain("En cours");
  });

  it("renders correctly with default success for completed", () => {
    render(MessageStatusBadge, { props: { status: "completed" } });
    const badge = screen.getByLabelText("Statut: Terminé");
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain("Terminé");
  });

  it("renders correctly with default error for failed", () => {
    render(MessageStatusBadge, { props: { status: "failed" } });
    const badge = screen.getByLabelText("Statut: Échec");
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain("Échec");
  });

  it("accepts an explicit tone property", () => {
    render(MessageStatusBadge, { props: { status: "completed", tone: "neutral" } });
    const badge = screen.getByLabelText("Statut: Terminé");
    expect(badge).toBeTruthy();
  });
});

describe("MessageActions", () => {
  it("renders standard list of actions as small buttons", () => {
    const onClick = vi.fn();
    const actionsList = [
      { id: "edit", label: "Modifier", icon: dummyIcon, onClick },
      { id: "copy", label: "Copier", icon: dummyIcon }
    ];

    render(MessageActions, { props: { actions: actionsList } });

    const group = screen.getByRole("group", { name: "Actions du message" });
    expect(group).toBeTruthy();

    const editBtn = screen.getByRole("button", { name: "Modifier" });
    expect(editBtn).toBeTruthy();

    const copyBtn = screen.getByRole("button", { name: "Copier" });
    expect(copyBtn).toBeTruthy();
  });

  it("triggers the onClick handler when a button is clicked", async () => {
    const onClick = vi.fn();
    const actionsList = [{ id: "delete", label: "Supprimer", icon: dummyIcon, onClick }];

    render(MessageActions, { props: { actions: actionsList } });

    const btn = screen.getByRole("button", { name: "Supprimer" });
    await fireEvent.click(btn);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables actions marked as disabled", () => {
    const onClick = vi.fn();
    const actionsList = [{ id: "share", label: "Partager", icon: dummyIcon, onClick, disabled: true }];

    render(MessageActions, { props: { actions: actionsList } });

    const btn = screen.getByRole("button", { name: "Partager" }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("renders the overflow snippet if provided", () => {
    const overflowSnippet = createRawSnippet(() => ({
      render: () => '<span data-testid="overflow-trigger">Plus</span>'
    }));

    render(MessageActions, { props: { actions: [], overflow: overflowSnippet } });

    expect(screen.getByTestId("overflow-trigger")).toBeTruthy();
  });
});

describe("ChatMessage", () => {
  it("renders children content inside the message bubble", () => {
    render(ChatMessage, {
      props: {
        role: "user",
        children: dummyChildren
      }
    });

    expect(screen.getByTestId("message-content")).toBeTruthy();
  });

  it("applies role-specific classes and data attributes", () => {
    const { container } = render(ChatMessage, {
      props: {
        role: "assistant",
        children: dummyChildren
      }
    });

    const article = container.querySelector("article");
    expect(article).toBeTruthy();
    expect(article?.classList.contains("st-chatMessage--assistant")).toBe(true);
    expect(article?.getAttribute("data-role")).toBe("assistant");
  });

  it("handles alignment logic correctly (user -> end, assistant/system/tool -> start)", () => {
    const { container: userContainer } = render(ChatMessage, {
      props: { role: "user", children: dummyChildren }
    });
    expect(userContainer.querySelector("article")?.getAttribute("data-align")).toBe("end");

    const { container: assistantContainer } = render(ChatMessage, {
      props: { role: "assistant", children: dummyChildren }
    });
    expect(assistantContainer.querySelector("article")?.getAttribute("data-align")).toBe("start");

    const { container: systemContainer } = render(ChatMessage, {
      props: { role: "system", children: dummyChildren }
    });
    expect(systemContainer.querySelector("article")?.getAttribute("data-align")).toBe("start");

    const { container: toolContainer } = render(ChatMessage, {
      props: { role: "tool", children: dummyChildren }
    });
    expect(toolContainer.querySelector("article")?.getAttribute("data-align")).toBe("start");
  });

  it("normalizes status and applies the correct data-status and classes", () => {
    // Normal statuses
    const { container: completedC } = render(ChatMessage, {
      props: { role: "assistant", status: "completed", children: dummyChildren }
    });
    expect(completedC.querySelector("article")?.getAttribute("data-status")).toBe("completed");

    // Legacy or active statuses
    const { container: streamingC } = render(ChatMessage, {
      props: { role: "assistant", status: "streaming", children: dummyChildren }
    });
    expect(streamingC.querySelector("article")?.getAttribute("data-status")).toBe("processing");
    expect(streamingC.querySelector("article")?.classList.contains("st-chatMessage--processing")).toBe(true);

    const { container: errorC } = render(ChatMessage, {
      props: { role: "assistant", status: "error", children: dummyChildren }
    });
    expect(errorC.querySelector("article")?.getAttribute("data-status")).toBe("failed");
    expect(errorC.querySelector("article")?.classList.contains("st-chatMessage--failed")).toBe(true);
  });

  it("renders avatar snippet when provided", () => {
    render(ChatMessage, {
      props: {
        role: "assistant",
        avatar: dummyAvatar,
        children: dummyChildren
      }
    });

    expect(screen.getByTestId("avatar")).toBeTruthy();
  });

  it("renders footer snippet or timestamp correctly", () => {
    // With timestamp only
    const { container: tsContainer } = render(ChatMessage, {
      props: {
        role: "user",
        timestamp: "12:34",
        children: dummyChildren
      }
    });
    expect(tsContainer.textContent).toContain("12:34");

    // With footer snippet
    render(ChatMessage, {
      props: {
        role: "user",
        footer: dummyFooter,
        children: dummyChildren
      }
    });
    expect(screen.getByTestId("footer")).toBeTruthy();
  });

  it("renders actions snippet when provided", () => {
    render(ChatMessage, {
      props: {
        role: "assistant",
        actions: dummyActions,
        children: dummyChildren
      }
    });

    expect(screen.getByTestId("action-btn")).toBeTruthy();
  });

  it("includes pulse indicator and aria-live='polite' in streaming/processing state", () => {
    const { container } = render(ChatMessage, {
      props: {
        role: "assistant",
        status: "processing",
        children: dummyChildren
      }
    });

    const article = container.querySelector("article");
    expect(article?.getAttribute("aria-live")).toBe("polite");

    const pulse = container.querySelector(".st-chatMessage__pulse");
    expect(pulse).toBeTruthy();
  });
});

describe("StreamingMessage", () => {
  it("renders finalContent when provided", () => {
    render(StreamingMessage, {
      props: {
        finalContent: "Message finalisé."
      }
    });

    expect(screen.getByText("Message finalisé.")).toBeTruthy();
  });

  it("reconstitutes content from delta events if finalContent is omitted", () => {
    const eventsList = [
      { type: "message.delta", delta: "Bonjour " },
      { type: "message.delta", delta: "l'ami !" }
    ];

    render(StreamingMessage, {
      props: {
        events: eventsList as any
      }
    });

    expect(screen.getByText("Bonjour l'ami !")).toBeTruthy();
  });

  it("displays placeholder when content and events are empty", () => {
    render(StreamingMessage, {
      props: {
        placeholder: "Attente de réponse..."
      }
    });

    expect(screen.getByText("Attente de réponse...")).toBeTruthy();
  });

  it("includes streamId label in metadata", () => {
    render(StreamingMessage, {
      props: {
        streamId: "stream-999"
      }
    });

    expect(screen.getByText("(Flux : stream-999)")).toBeTruthy();
  });

  it("renders details trail in live mode when tool calls, permissions, or checkpoints exist", () => {
    const eventsList = [
      { type: "tool.started", toolCallId: "call-1", toolName: "recherche_web" },
      { type: "tool.completed", toolCallId: "call-1", status: "success", toolName: "recherche_web" },
      { type: "permission.requested", toolCallId: "call-2", choices: ["allow", "deny"] },
      { type: "checkpoint.requested", checkpointId: "chk-1", label: "Sauvegarde" }
    ];

    render(StreamingMessage, {
      props: {
        mode: "live",
        events: eventsList as any
      }
    });

    const summary = screen.getByText("Détails du stream");
    expect(summary).toBeTruthy();

    expect(screen.getByText("recherche_web")).toBeTruthy();
    expect(screen.getByText("Sauvegarde (chk-1)")).toBeTruthy();
  });

  it("does not render details trail in passive mode", () => {
    const eventsList = [
      { type: "tool.started", toolCallId: "call-1", toolName: "recherche_web" }
    ];

    render(StreamingMessage, {
      props: {
        mode: "passive",
        events: eventsList as any
      }
    });

    expect(screen.queryByText("Détails du stream")).toBeNull();
  });
});

describe("ChatComposer", () => {
  it("renders textarea with default placeholder and aria-label", () => {
    render(ChatComposer, {
      props: {
        placeholder: "Tapez ici...",
        inputAriaLabel: "Zone d'écriture"
      }
    });

    const textarea = screen.getByLabelText("Zone d'écriture") as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(textarea.placeholder).toBe("Tapez ici...");
  });

  it("starts with empty input and a disabled send button by default", () => {
    render(ChatComposer, {
      props: {
        sendAriaLabel: "Bouton d'envoi"
      }
    });

    const sendBtn = screen.getByLabelText("Bouton d'envoi") as HTMLButtonElement;
    expect(sendBtn.disabled).toBe(true);
  });

  it("enables send button when user types a non-empty string", async () => {
    render(ChatComposer, {
      props: {
        value: "Test",
        sendAriaLabel: "Bouton d'envoi"
      }
    });

    const sendBtn = screen.getByLabelText("Bouton d'envoi") as HTMLButtonElement;
    expect(sendBtn.disabled).toBe(false);
  });

  it("calls onsubmit with text and source 'submit' when submitting form", async () => {
    const onsubmit = vi.fn();
    render(ChatComposer, {
      props: {
        value: "Hello AI",
        onsubmit,
        sendAriaLabel: "Bouton d'envoi"
      }
    });

    const form = screen.getByRole("textbox").closest("form");
    expect(form).toBeTruthy();

    await fireEvent.submit(form!);

    expect(onsubmit).toHaveBeenCalledTimes(1);
    expect(onsubmit.mock.calls[0][0]).toMatchObject({
      message: "Hello AI",
      source: "submit"
    });
  });

  it("submits using keydown Enter without shift, calling onsubmit with source 'keyboard'", async () => {
    const onsubmit = vi.fn();
    render(ChatComposer, {
      props: {
        value: "Hello keyboard",
        onsubmit
      }
    });

    const textarea = screen.getByRole("textbox");
    await fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(onsubmit).toHaveBeenCalledTimes(1);
    expect(onsubmit.mock.calls[0][0]).toMatchObject({
      message: "Hello keyboard",
      source: "keyboard"
    });
  });

  it("does not submit with Enter if shift key is pressed", async () => {
    const onsubmit = vi.fn();
    render(ChatComposer, {
      props: {
        value: "Hello new line",
        onsubmit
      }
    });

    const textarea = screen.getByRole("textbox");
    await fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(onsubmit).not.toHaveBeenCalled();
  });

  it("clears the value after successful submit by default (clearOnSubmit = true)", async () => {
    let valueBind = "To be cleared";
    const onsubmit = vi.fn().mockImplementation(() => Promise.resolve());
    render(ChatComposer, {
      props: {
        value: valueBind,
        onsubmit,
        clearOnSubmit: true
      }
    });

    const form = screen.getByRole("textbox").closest("form");
    await fireEvent.submit(form!);

    // wait for async submit resolution inside the component
    await new Promise((r) => setTimeout(r, 10));

    // The textarea internal value inside the DOM should be cleared
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("");
  });

  it("does not clear the value after submit if clearOnSubmit = false", async () => {
    const onsubmit = vi.fn().mockImplementation(() => Promise.resolve());
    render(ChatComposer, {
      props: {
        value: "To stay",
        onsubmit,
        clearOnSubmit: false
      }
    });

    const form = screen.getByRole("textbox").closest("form");
    await fireEvent.submit(form!);

    await new Promise((r) => setTimeout(r, 10));

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("To stay");
  });

  it("exposes stoppable action showing stop button when busy/submitting, and calls onstop on click", async () => {
    const onstop = vi.fn();
    render(ChatComposer, {
      props: {
        busy: true,
        stoppable: true,
        onstop,
        stopAriaLabel: "Bouton d'arrêt"
      }
    });

    const stopBtn = screen.getByLabelText("Bouton d'arrêt");
    expect(stopBtn).toBeTruthy();

    await fireEvent.click(stopBtn);
    expect(onstop).toHaveBeenCalledTimes(1);
  });
});

describe("ChatThread", () => {
  it("renders container with role 'log', polite aria-live, and specified label", () => {
    render(ChatThread, {
      props: {
        label: "Discussion avec IA"
      }
    });

    const section = screen.getByRole("log", { name: "Discussion avec IA" });
    expect(section).toBeTruthy();
    expect(section.getAttribute("aria-live")).toBe("polite");
    expect(section.getAttribute("aria-relevant")).toBe("additions text");
  });

  it("shows empty state snippet when there are no message elements rendered", () => {
    const emptySnippet = createRawSnippet(() => ({
      render: () => '<div data-testid="empty-state">Aucun message pour l\'instant</div>'
    }));

    render(ChatThread, {
      props: {
        label: "Chat",
        emptyState: emptySnippet
      }
    });

    expect(screen.getByTestId("empty-state")).toBeTruthy();
  });
});
