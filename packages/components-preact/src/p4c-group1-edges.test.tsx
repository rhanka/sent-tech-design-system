import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { EyeOff } from "lucide-preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Avatar } from "./Avatar.js";
import { AvatarGroup } from "./AvatarGroup.js";
import { ChatMessage } from "./ChatMessage.js";
import type { ChatMessageRole } from "./ChatMessage.js";
import { ChatThread } from "./ChatThread.js";
import { Embed } from "./Embed.js";
import { Icon } from "./Icon.js";
import { DisplaySettings } from "./DisplaySettings.js";
import { MediaContent } from "./MediaContent.js";
import { MessageActions } from "./MessageActions.js";
import { MessageStatusBadge } from "./MessageStatusBadge.js";
import { Overline } from "./Overline.js";
import { StreamingMessage } from "./StreamingMessage.js";
import { Transcription } from "./Transcription.js";
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

  it("AvatarGroup renders the overflow token and follows max/total signals", async () => {
    const max = signal(2);
    const total = signal(5);
    const { container } = render(
      <AvatarGroup max={max} total={total} size="md">
        <span>x</span>
      </AvatarGroup>,
    );
    expect(container.querySelector(".st-avatarGroup__overflow")?.textContent).toBe("+3");
    total.value = 6;
    await waitFor(() =>
      expect(container.querySelector(".st-avatarGroup__overflow")?.textContent).toBe("+4"),
    );
    max.value = 1;
    await waitFor(() =>
      expect(container.querySelector(".st-avatarGroup__overflow")?.textContent).toBe("+5"),
    );
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
    const actionsClass = signal("x-actions");
    const badgeClass = signal("x-badge");
    render(
      <>
        <ChatMessage data-testid="m-chat" content="Hi" className={chatClass} />
        <ChatThread data-testid="m-thread" className={threadClass} />
        <MessageActions data-testid="m-actions" actions={[{ label: "Copy" }]} className={actionsClass} />
        <MessageStatusBadge data-testid="m-badge" status="sent" className={badgeClass} />
      </>,
    );
    chatClass.value = "y-chat";
    threadClass.value = "y-thread";
    actionsClass.value = "y-actions";
    badgeClass.value = "y-badge";
    await screen.findByTestId("m-chat");
    expect(screen.getByTestId("m-chat").className).toContain("y-chat");
    expect(screen.getByTestId("m-chat").className).not.toContain("x-chat");
    expect(screen.getByTestId("m-thread").className).toContain("y-thread");
    expect(screen.getByTestId("m-thread").className).not.toContain("x-thread");
    expect(screen.getByTestId("m-actions").className).toContain("y-actions");
    expect(screen.getByTestId("m-actions").className).not.toContain("x-actions");
    expect(screen.getByTestId("m-badge").className).toContain("y-badge");
    expect(screen.getByTestId("m-badge").className).not.toContain("x-badge");
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

describe("P4c group 1 edges (StreamingMessage, Transcription, DisplaySettings, MediaContent)", () => {
  it("accepts a Signal for className on every batch-D module", () => {
    render(
      <>
        <StreamingMessage data-testid="e-stream" text="Live" className={signal("x-stream")} />
        <Transcription data-testid="e-transcript" text="Hello" className={signal("x-transcript")} />
        <DisplaySettings data-testid="e-display" className={signal("x-display")} />
        <MediaContent data-testid="e-media" title="T" className={signal("x-media")} />
      </>,
    );
    expect(screen.getByTestId("e-stream").className).toContain("x-stream");
    expect(screen.getByTestId("e-transcript").className).toContain("x-transcript");
    expect(screen.getByTestId("e-display").className).toContain("x-display");
    expect(screen.getByTestId("e-media").className).toContain("x-media");
  });

  it("follows className signals mutated after mount (DOM changes)", async () => {
    const streamClass = signal("x-stream");
    const transcriptClass = signal("x-transcript");
    const displayClass = signal("x-display");
    const mediaClass = signal("x-media");
    render(
      <>
        <StreamingMessage data-testid="m-stream" text="Live" className={streamClass} />
        <Transcription data-testid="m-transcript" text="Hello" className={transcriptClass} />
        <DisplaySettings data-testid="m-display" className={displayClass} />
        <MediaContent data-testid="m-media" title="T" className={mediaClass} />
      </>,
    );
    streamClass.value = "y-stream";
    transcriptClass.value = "y-transcript";
    displayClass.value = "y-display";
    mediaClass.value = "y-media";
    await screen.findByTestId("m-stream");
    expect(screen.getByTestId("m-stream").className).toContain("y-stream");
    expect(screen.getByTestId("m-stream").className).not.toContain("x-stream");
    expect(screen.getByTestId("m-transcript").className).toContain("y-transcript");
    expect(screen.getByTestId("m-transcript").className).not.toContain("x-transcript");
    expect(screen.getByTestId("m-display").className).toContain("y-display");
    expect(screen.getByTestId("m-display").className).not.toContain("x-display");
    expect(screen.getByTestId("m-media").className).toContain("y-media");
    expect(screen.getByTestId("m-media").className).not.toContain("x-media");
  });

  it("StreamingMessage shows the placeholder when empty and lists events", () => {
    const { container, unmount } = render(<StreamingMessage />);
    expect(container.querySelector(".st-streamingMessage__text--muted")).not.toBeNull();
    expect(container.querySelector(".st-streamingMessage--live")).not.toBeNull();
    unmount();
    const withEvents = render(
      <StreamingMessage
        text="Partial"
        mode="passive"
        events={[{ id: "e1", label: "Tool call" }]}
      />,
    );
    expect(withEvents.container.querySelector(".st-streamingMessage--passive")).not.toBeNull();
    expect(withEvents.container.querySelector(".st-streamingMessage__trailList")?.textContent).toBe(
      "Tool call",
    );
    withEvents.unmount();
  });

  it("Transcription renders segments with intervals and follows the open signal", async () => {
    const open = signal(false);
    const { container } = render(
      <Transcription
        open={open}
        segments={[{ speaker: "Ada", startTime: "00:01", endTime: "00:05", text: "Hello" }]}
      />,
    );
    expect(container.querySelector(".st-transcription__speaker")?.textContent).toBe("Ada");
    expect(container.querySelector("time")?.textContent).toContain("00:01 - 00:05");
    expect(container.querySelector("details")?.hasAttribute("open")).toBe(false);
    open.value = true;
    await waitFor(() =>
      expect(container.querySelector("details")?.hasAttribute("open")).toBe(true),
    );
  });

  it("DisplaySettings calls onChange with merged settings", () => {
    const onChange = vi.fn();
    const { container } = render(
      <DisplaySettings onChange={onChange} showReducedMotion={false} />,
    );
    expect(container.querySelector(".st-displaySettings__field--switch")).toBeNull();
    const select = container.querySelector("select") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "large" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toMatchObject({ fontScale: "large", contrast: "default" });
  });

  it("DisplaySettings follows showReducedMotion signals mutated after mount", async () => {
    const showReducedMotion = signal(false);
    const { container } = render(<DisplaySettings showReducedMotion={showReducedMotion} />);
    expect(container.querySelector(".st-displaySettings__field--switch")).toBeNull();
    showReducedMotion.value = true;
    await waitFor(() =>
      expect(container.querySelector(".st-displaySettings__field--switch")).not.toBeNull(),
    );
  });

  it("ChatThread follows messages and autoScroll signals mutated after mount", async () => {
    const messages = signal<Array<{ id: string; role: ChatMessageRole; content: string }>>([{ id: "1", role: "assistant", content: "Hello" }]);
    const autoScroll = signal(true);
    const { container } = render(<ChatThread messages={messages} autoScroll={autoScroll} />);
    expect(container.querySelectorAll(".st-chatMessage__content").length).toBe(1);
    expect(container.querySelector(".st-chatMessage__content")?.textContent).toBe("Hello");
    messages.value = [
      { id: "1", role: "assistant", content: "Hello" },
      { id: "2", role: "user", content: "World" },
    ];
    await waitFor(() =>
      expect(container.querySelectorAll(".st-chatMessage__content").length).toBe(2),
    );
    expect(container.querySelectorAll(".st-chatMessage__content")[1].textContent).toBe("World");
    autoScroll.value = false;
    await waitFor(() =>
      expect(container.querySelectorAll(".st-chatMessage__content").length).toBe(2),
    );
    messages.value = [{ id: "1", role: "assistant", content: "Solo" }];
    await waitFor(() =>
      expect(container.querySelector(".st-chatMessage__content")?.textContent).toBe("Solo"),
    );
  });

  it("DisplaySettings follows values and show toggles mutated after mount", async () => {
    const values = signal<Partial<{ fontScale: "normal" | "large" | "extra-large"; contrast: "default" | "high"; lineSpacing: "normal" | "comfortable"; reducedMotion: boolean }>>({ fontScale: "normal" });
    const showFontScale = signal(true);
    const showContrast = signal(true);
    const showLineSpacing = signal(true);
    const { container } = render(
      <DisplaySettings values={values} showFontScale={showFontScale} showContrast={showContrast} showLineSpacing={showLineSpacing} />,
    );
    const select = container.querySelector("select") as HTMLSelectElement;
    expect(select.value).toBe("normal");
    values.value = { fontScale: "large" };
    await waitFor(() =>
      expect((container.querySelector("select") as HTMLSelectElement).value).toBe("large"),
    );
    showFontScale.value = false;
    await waitFor(() =>
      expect(container.querySelector(".st-displaySettings__label")?.textContent).not.toBe("Taille de texte"),
    );
    expect(container.querySelectorAll(".st-displaySettings__field").length).toBe(3);
    showContrast.value = false;
    await waitFor(() =>
      expect(container.querySelectorAll(".st-displaySettings__field").length).toBe(2),
    );
    showLineSpacing.value = false;
    await waitFor(() =>
      expect(container.querySelectorAll(".st-displaySettings__field").length).toBe(1),
    );
  });

  it("MediaContent follows mediaControls signals mutated after mount", async () => {
    const mediaControls = signal(true);
    const { container } = render(
      <MediaContent title="Clip" media="https://example.com/c.mp4" mediaKind="video" mediaControls={mediaControls} />,
    );
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video.controls).toBe(true);
    mediaControls.value = false;
    await waitFor(() =>
      expect((container.querySelector("video") as HTMLVideoElement).controls).toBe(false),
    );
  });

  it("Transcription follows showTimestamps signals mutated after mount", async () => {
    const showTimestamps = signal(true);
    const { container } = render(
      <Transcription
        showTimestamps={showTimestamps}
        segments={[{ speaker: "Ada", startTime: "00:01", endTime: "00:05", text: "Hello" }]}
      />,
    );
    expect(container.querySelector("time")).not.toBeNull();
    showTimestamps.value = false;
    await waitFor(() => expect(container.querySelector("time")).toBeNull());
  });

  it("MediaContent renders video with captions and falls back to children", () => {
    const { container, unmount } = render(
      <MediaContent title="Clip" media="https://example.com/c.mp4" mediaKind="video" caption="Cap" />,
    );
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video.getAttribute("aria-label")).toBe("Clip");
    expect(video.querySelector("track")?.getAttribute("kind")).toBe("captions");
    expect(container.querySelector("figcaption")?.textContent).toContain("Cap");
    unmount();
    const fallback = render(<MediaContent title="T" media=" "><p>Child</p></MediaContent>);
    expect(fallback.container.querySelector(".st-mediaContent__media")?.textContent).toBe("Child");
    fallback.unmount();
  });
});
