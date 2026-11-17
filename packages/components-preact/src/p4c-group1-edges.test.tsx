import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { EyeOff } from "lucide-preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Avatar } from "./Avatar.js";
import { AvatarGroup } from "./AvatarGroup.js";
import { ChatMessage } from "./ChatMessage.js";
import { ChatThread } from "./ChatThread.js";
import { Embed } from "./Embed.js";
import { Icon } from "./Icon.js";
import { MessageActions } from "./MessageActions.js";
import { MessageStatusBadge } from "./MessageStatusBadge.js";
import { Overline } from "./Overline.js";
import { Typography } from "./Typography.js";

afterEach(cleanup);

describe("P4c group 1 edges (Icon, Overline: signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on Icon and Overline", () => {
    render(
      <>
        <Icon name="settings" data-testid="e-icon" className={signal("x-icon")} />
        <Overline data-testid="e-overline" className={signal("x-overline")}>
          Documentation
        </Overline>
      </>,
    );
    expect(screen.getByTestId("e-icon").getAttribute("class")).toContain("x-icon");
    expect(screen.getByTestId("e-overline").className).toContain("x-overline");
  });

  it("follows className signals mutated after mount (DOM changes)", async () => {
    const iconClass = signal("x-icon");
    const overlineClass = signal("x-overline");
    render(
      <>
        <Icon name="settings" data-testid="m-icon" className={iconClass} />
        <Overline data-testid="m-overline" className={overlineClass}>
          Documentation
        </Overline>
      </>,
    );
    iconClass.value = "y-icon";
    overlineClass.value = "y-overline";
    await screen.findByTestId("m-icon");
    expect(screen.getByTestId("m-icon").getAttribute("class")).toContain("y-icon");
    expect(screen.getByTestId("m-icon").getAttribute("class")).not.toContain("x-icon");
    expect(screen.getByTestId("m-overline").className).toContain("y-overline");
    expect(screen.getByTestId("m-overline").className).not.toContain("x-overline");
  });

  it("Icon renders svg defaults, title naming and glyph precedence", () => {
    const { container, unmount } = render(<Icon name="settings" data-testid="t-icon" />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.getAttribute("width")).toBe("18");
    expect(svg.getAttribute("stroke-width")).toBe("2.25");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    unmount();
    const titled = render(<Icon name="eye" title="Afficher" />);
    const named = titled.container.querySelector("svg") as SVGElement;
    expect(named.getAttribute("role")).toBe("img");
    expect(named.getAttribute("aria-label")).toBe("Afficher");
    titled.unmount();
    const byName = render(<Icon name="eye-off" />);
    const byGlyph = render(<Icon glyph={EyeOff} />);
    expect(byGlyph.container.querySelector("svg")?.outerHTML).toBe(
      byName.container.querySelector("svg")?.outerHTML,
    );
    byName.unmount();
    byGlyph.unmount();
  });

  it("Overline renders the requested tag and forwards rest props", () => {
    const { container } = render(
      <Overline as="h2" data-testid="t-overline" id="ov-1">
        Signaux
      </Overline>,
    );
    const el = container.querySelector(".st-overline");
    expect(el?.tagName).toBe("H2");
    expect(el?.getAttribute("id")).toBe("ov-1");
  });
});

describe("P4c group 1 edges (Avatar, AvatarGroup, Typography, Embed: signals at the edges)", () => {
  it("accepts a Signal for className on every batch-B module", () => {
    render(
      <>
        <Avatar name="Ada Lovelace" data-testid="e-avatar" className={signal("x-avatar")} />
        <AvatarGroup data-testid="e-agroup" className={signal("x-agroup")} />
        <Typography data-testid="e-typo" className={signal("x-typo")}>
          Hello
        </Typography>
        <Embed
          src="https://example.com/doc"
          title="Doc"
          data-testid="e-embed"
          className={signal("x-embed")}
        />
      </>,
    );
    expect(screen.getByTestId("e-avatar").className).toContain("x-avatar");
    expect(screen.getByTestId("e-agroup").className).toContain("x-agroup");
    expect(screen.getByTestId("e-typo").className).toContain("x-typo");
    expect(screen.getByTestId("e-embed").className).toContain("x-embed");
  });

  it("follows className signals mutated after mount (DOM changes)", async () => {
    const avatarClass = signal("x-avatar");
    const agroupClass = signal("x-agroup");
    const typoClass = signal("x-typo");
    const embedClass = signal("x-embed");
    render(
      <>
        <Avatar name="Ada Lovelace" data-testid="m-avatar" className={avatarClass} />
        <AvatarGroup data-testid="m-agroup" className={agroupClass} />
        <Typography data-testid="m-typo" className={typoClass}>
          Hello
        </Typography>
        <Embed src="https://example.com/doc" title="Doc" data-testid="m-embed" className={embedClass} />
      </>,
    );
    avatarClass.value = "y-avatar";
    agroupClass.value = "y-agroup";
    typoClass.value = "y-typo";
    embedClass.value = "y-embed";
    await screen.findByTestId("m-avatar");
    expect(screen.getByTestId("m-avatar").className).toContain("y-avatar");
    expect(screen.getByTestId("m-avatar").className).not.toContain("x-avatar");
    expect(screen.getByTestId("m-agroup").className).toContain("y-agroup");
    expect(screen.getByTestId("m-typo").className).toContain("y-typo");
    expect(screen.getByTestId("m-embed").className).toContain("y-embed");
  });

  it("Avatar derives initials with an accessible name, or renders the image", () => {
    const { container, unmount } = render(<Avatar name="Ada Lovelace" />);
    expect(container.querySelector(".st-avatar__initials")?.textContent).toBe("AL");
    expect(container.querySelector(".st-avatar")?.getAttribute("aria-label")).toBe("Ada Lovelace");
    unmount();
    const withSrc = render(<Avatar name="Ada Lovelace" src="https://example.com/a.png" />);
    const img = withSrc.container.querySelector("img.st-avatar__image") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("https://example.com/a.png");
    withSrc.unmount();
  });

  it("AvatarGroup renders the overflow token and follows max/total signals", () => {
    const max = signal(2);
    const total = signal(5);
    const { container } = render(
      <AvatarGroup max={max} total={total} size="md">
        <span>x</span>
      </AvatarGroup>,
    );
    expect(container.querySelector(".st-avatarGroup__overflow")?.textContent).toBe("+3");
    expect(container.querySelector(".st-avatarGroup")).not.toBeNull();
  });

  it("Typography maps variants to tags and follows the truncate signal", async () => {
    const truncate = signal(false);
    const { container } = render(
      <Typography variant="h2" truncate={truncate}>
        Title
      </Typography>,
    );
    expect(container.querySelector("h2.st-typography--h2")).not.toBeNull();
    expect(container.querySelector(".st-typography--truncate")).toBeNull();
    truncate.value = true;
    await waitFor(() => expect(container.querySelector(".st-typography--truncate")).not.toBeNull());
  });

  it("Embed renders a titled sandboxed iframe", () => {
    const { container } = render(<Embed src="https://example.com/doc" title="Doc" />);
    const frame = container.querySelector("iframe.st-embed__frame") as HTMLIFrameElement;
    expect(frame.getAttribute("src")).toBe("https://example.com/doc");
    expect(frame.getAttribute("title")).toBe("Doc");
    expect(frame.getAttribute("sandbox")).toBe("");
    expect(frame.getAttribute("loading")).toBe("lazy");
  });
});

describe("P4c group 1 edges (ChatMessage, ChatThread, MessageActions, MessageStatusBadge)", () => {
  it("accepts a Signal for className on every batch-C module", () => {
    render(
      <>
        <ChatMessage data-testid="e-chat" content="Hi" className={signal("x-chat")} />
        <ChatThread data-testid="e-thread" className={signal("x-thread")} />
        <MessageActions data-testid="e-actions" actions={[{ label: "Copy" }]} className={signal("x-actions")} />
        <MessageStatusBadge data-testid="e-badge" status="sent" className={signal("x-badge")} />
      </>,
    );
    expect(screen.getByTestId("e-chat").className).toContain("x-chat");
    expect(screen.getByTestId("e-thread").className).toContain("x-thread");
    expect(screen.getByTestId("e-actions").className).toContain("x-actions");
    expect(screen.getByTestId("e-badge").className).toContain("x-badge");
  });

  it("follows className signals mutated after mount (DOM changes)", async () => {
    const chatClass = signal("x-chat");
    const threadClass = signal("x-thread");
    render(
      <>
        <ChatMessage data-testid="m-chat" content="Hi" className={chatClass} />
        <ChatThread data-testid="m-thread" className={threadClass} />
      </>,
    );
    chatClass.value = "y-chat";
    threadClass.value = "y-thread";
    await screen.findByTestId("m-chat");
    expect(screen.getByTestId("m-chat").className).toContain("y-chat");
    expect(screen.getByTestId("m-chat").className).not.toContain("x-chat");
    expect(screen.getByTestId("m-thread").className).toContain("y-thread");
  });

  it("ChatMessage normalizes streaming/error statuses and aligns user roles", () => {
    const { container, unmount } = render(<ChatMessage role="user" status="streaming" content="Hi" />);
    const article = container.querySelector("article.st-chatMessage") as HTMLElement;
    expect(article.dataset.role).toBe("user");
    expect(article.dataset.align).toBe("end");
    expect(article.dataset.status).toBe("processing");
    expect(article.getAttribute("aria-live")).toBe("polite");
    expect(container.querySelector(".st-chatMessage__pulse")).not.toBeNull();
    unmount();
    const failed = render(<ChatMessage status="error" content="Oops" />);
    expect(failed.container.querySelector("article")?.dataset.status).toBe("failed");
    failed.unmount();
  });

  it("ChatThread renders messages and the empty state", () => {
    const { container, unmount } = render(
      <ChatThread messages={[{ id: "1", role: "assistant", content: "Hello" }]} />,
    );
    expect(container.querySelector(".st-chatThread__list .st-chatMessage__content")?.textContent).toBe("Hello");
    expect(container.querySelector('[role="log"]')).not.toBeNull();
    unmount();
    const empty = render(<ChatThread emptyLabel="No messages yet" />);
    expect(empty.container.querySelector(".st-chatThread__empty")?.textContent).toBe("No messages yet");
    empty.unmount();
  });

  it("MessageActions fires the action handler and the consumer group handler (composed)", () => {
    const onAction = vi.fn();
    const onGroupClick = vi.fn();
    render(
      <MessageActions
        actions={[{ id: "copy", label: "Copy", onClick: onAction }]}
        onClick={onGroupClick}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    // No local onClick on the group: the consumer handler from rest props
    // still fires through the bubbled click (compose, never overwrite).
    expect(onGroupClick).toHaveBeenCalledTimes(1);
  });

  it("MessageStatusBadge normalizes statuses, resolves tones and honours labels", () => {
    const { container, unmount } = render(<MessageStatusBadge status="sent" />);
    const badge = container.querySelector(".st-messageStatusBadge") as HTMLElement;
    expect(badge.className).toContain("st-badge--success");
    expect(badge.textContent).toBe("Completed");
    unmount();
    const custom = render(
      <MessageStatusBadge status="processing" tone="warning" labels={{ processing: "Working…" }} />,
    );
    const customBadge = custom.container.querySelector(".st-messageStatusBadge") as HTMLElement;
    expect(customBadge.className).toContain("st-badge--warning");
    expect(customBadge.textContent).toBe("Working…");
    custom.unmount();
  });
});
