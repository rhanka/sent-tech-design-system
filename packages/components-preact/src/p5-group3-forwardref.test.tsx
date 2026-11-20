import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createRef } from "preact";
import type { CSSProperties } from "preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Avatar } from "./Avatar.js";
import { AvatarGroup } from "./AvatarGroup.js";
import { BackToTop } from "./BackToTop.js";
import { Badge } from "./Badge.js";
import { CheckboxGroup } from "./CheckboxGroup.js";
import { DisplaySettings } from "./DisplaySettings.js";
import type { DisplaySettingsState } from "./DisplaySettings.js";
import { Embed } from "./Embed.js";
import { MediaContent } from "./MediaContent.js";
import { SelectableRow } from "./SelectableRow.js";
import { Stepper } from "./Stepper.js";
import { TableOfContents } from "./TableOfContents.js";
import { Transcription } from "./Transcription.js";

afterEach(cleanup);

describe("P5 group 3 forwardRef modules — Batch 1 (SelectableRow, Avatar, AvatarGroup, DisplaySettings)", () => {
  it("SelectableRow forwards refs across <div> and <a href>, mutates signals, and composes consumer handlers", async () => {
    const cls = signal("sr-init");
    const selected = signal(false);
    const disabled = signal(false);
    const accentBar = signal(false);
    const onSelect = vi.fn();
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    const onFocus = vi.fn();
    const objRef = createRef<HTMLElement>();
    const cbRef = vi.fn();

    const { rerender, unmount } = render(
      <SelectableRow
        ref={objRef}
        value="item-1"
        className={cls}
        selected={selected}
        disabled={disabled}
        accentBar={accentBar}
        onSelect={onSelect}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
      >
        First row
      </SelectableRow>,
    );
    const divRow = screen.getByRole("button", { name: "First row" });
    expect(objRef.current).toBe(divRow);
    expect(objRef.current?.tagName).toBe("DIV");
    expect(divRow.className).toBe("st-selectableRow sr-init");
    expect(divRow.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(divRow);
    expect(onSelect).toHaveBeenCalledWith(true);
    expect(onClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(divRow, { key: " " });
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onKeyDown).toHaveBeenCalledTimes(1);

    divRow.focus();
    expect(onFocus).toHaveBeenCalledTimes(1);

    cls.value = "sr-next";
    selected.value = true;
    accentBar.value = true;
    await waitFor(() =>
      expect(divRow.className).toBe("st-selectableRow st-selectableRow--selected st-selectableRow--accentBar sr-next"),
    );
    expect(divRow.getAttribute("aria-pressed")).toBe("true");

    disabled.value = true;
    await waitFor(() => expect(divRow.getAttribute("aria-disabled")).toBe("true"));
    expect(divRow.getAttribute("tabindex")).toBe("-1");

    // Swap ref and switch to anchor branch (`href`).
    disabled.value = false;
    rerender(
      <SelectableRow
        ref={cbRef}
        href="/items/1"
        className={cls}
        selected={selected}
        disabled={disabled}
        onKeyDown={onKeyDown}
      >
        Link row
      </SelectableRow>,
    );
    const linkRow = screen.getByRole("link", { name: "Link row" });
    expect(objRef.current).toBeNull();
    expect(linkRow.tagName).toBe("A");
    expect(cbRef).toHaveBeenLastCalledWith(linkRow);

    // Consumer onKeyDown still runs on link rows too.
    fireEvent.keyDown(linkRow, { key: "a" });
    expect(onKeyDown).toHaveBeenCalledTimes(2);

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });

  it("Avatar forwards refs in initials and image modes, mutates className signal, and preserves consumer handlers", async () => {
    const cls = signal("av-before");
    const onClick = vi.fn();
    const objRef = createRef<HTMLSpanElement>();
    const cbRef = vi.fn();

    const { rerender, unmount } = render(
      <Avatar ref={objRef} name="Ada Lovelace" className={cls} onClick={onClick} />,
    );
    const avatar = screen.getByRole("img", { name: "Ada Lovelace" }) as HTMLSpanElement;
    expect(objRef.current).toBe(avatar);
    expect(objRef.current?.tagName).toBe("SPAN");
    expect(avatar.className).toBe("st-avatar st-avatar--md st-avatar--circle st-avatar--category1 av-before");

    fireEvent.click(avatar);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "av-after";
    await waitFor(() =>
      expect(avatar.className).toBe("st-avatar st-avatar--md st-avatar--circle st-avatar--category1 av-after"),
    );

    rerender(
      <Avatar
        ref={cbRef}
        name="Ada Lovelace"
        src="https://example.com/ada.png"
        className={cls}
        onClick={onClick}
      />,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(avatar);
    expect(avatar.className).toContain("st-avatar--image");
    expect(avatar.querySelector("img.st-avatar__image")?.getAttribute("src")).toBe("https://example.com/ada.png");

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });

  it("AvatarGroup forwards refs to <div>, mutates className/max/total/style signals, and preserves consumer handlers", async () => {
    const cls = signal("ag-before");
    const max = signal(2);
    const total = signal(5);
    const style = signal<CSSProperties>({ color: "red" });
    const onClick = vi.fn();
    const objRef = createRef<HTMLDivElement>();
    const cbRef = vi.fn();

    const { container, rerender, unmount } = render(
      <AvatarGroup
        ref={objRef}
        data-testid="ag"
        max={max}
        total={total}
        className={cls}
        style={style}
        onClick={onClick}
      >
        <span>A</span>
      </AvatarGroup>,
    );
    const el = screen.getByTestId("ag") as HTMLDivElement;
    expect(objRef.current).toBe(el);
    expect(objRef.current?.tagName).toBe("DIV");
    expect(el.className).toBe("st-avatarGroup st-avatarGroup--md ag-before");
    expect(el.style.color).toBe("red");
    expect(el.style.getPropertyValue("--st-avatar-group-max")).toBe("2");
    expect(container.querySelector(".st-avatarGroup__overflow")?.textContent).toBe("+3");

    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "ag-after";
    max.value = 3;
    total.value = 7;
    style.value = { color: "blue" };
    await waitFor(() => expect(el.className).toBe("st-avatarGroup st-avatarGroup--md ag-after"));
    expect(el.style.color).toBe("blue");
    expect(el.style.getPropertyValue("--st-avatar-group-max")).toBe("3");
    expect(container.querySelector(".st-avatarGroup__overflow")?.textContent).toBe("+4");

    total.value = 2;
    await waitFor(() => expect(container.querySelector(".st-avatarGroup__overflow")).toBeNull());

    rerender(
      <AvatarGroup
        ref={cbRef}
        data-testid="ag"
        max={max}
        total={total}
        className={cls}
        style={style}
        onClick={onClick}
      >
        <span>A</span>
      </AvatarGroup>,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(el);

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });

  it("DisplaySettings forwards refs to <div>, mutates className/values/show* signals, and preserves consumer handlers", async () => {
    const cls = signal("ds-before");
    const values = signal<Partial<DisplaySettingsState>>({
      fontScale: "normal",
      contrast: "default",
      lineSpacing: "normal",
      reducedMotion: false,
    });
    const showFontScale = signal(true);
    const showContrast = signal(true);
    const showLineSpacing = signal(true);
    const showReducedMotion = signal(true);
    const onChange = vi.fn();
    const onClick = vi.fn();
    const objRef = createRef<HTMLDivElement>();
    const cbRef = vi.fn();

    const { container, rerender, unmount } = render(
      <DisplaySettings
        ref={objRef}
        data-testid="ds"
        className={cls}
        values={values}
        showFontScale={showFontScale}
        showContrast={showContrast}
        showLineSpacing={showLineSpacing}
        showReducedMotion={showReducedMotion}
        onChange={onChange}
        onClick={onClick}
      />,
    );
    const root = screen.getByTestId("ds") as HTMLDivElement;
    expect(objRef.current).toBe(root);
    expect(objRef.current?.tagName).toBe("DIV");
    expect(root.className).toBe("st-displaySettings ds-before");
    expect(container.querySelectorAll(".st-displaySettings__field")).toHaveLength(4);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);

    const fontSelect = container.querySelectorAll("select")[0] as HTMLSelectElement;
    const contrastSelect = container.querySelectorAll("select")[1] as HTMLSelectElement;
    const spacingSelect = container.querySelectorAll("select")[2] as HTMLSelectElement;
    const motionSwitch = screen.getByRole("switch") as HTMLInputElement;
    expect(fontSelect.value).toBe("normal");
    expect(contrastSelect.value).toBe("default");
    expect(spacingSelect.value).toBe("normal");
    expect(motionSwitch.checked).toBe(false);

    // Post-mount mutations of className and values signals update the DOM controls.
    cls.value = "ds-after";
    values.value = {
      fontScale: "extra-large",
      contrast: "high",
      lineSpacing: "comfortable",
      reducedMotion: true,
    };
    await waitFor(() => expect(root.className).toBe("st-displaySettings ds-after"));
    await waitFor(() => expect(fontSelect.value).toBe("extra-large"));
    expect(contrastSelect.value).toBe("high");
    expect(spacingSelect.value).toBe("comfortable");
    expect(motionSwitch.checked).toBe(true);

    // Post-mount mutations of show* boolean signals remove/restore fields in DOM.
    showFontScale.value = false;
    showContrast.value = false;
    showLineSpacing.value = false;
    showReducedMotion.value = false;
    await waitFor(() => expect(container.querySelectorAll(".st-displaySettings__field")).toHaveLength(0));

    showReducedMotion.value = true;
    await waitFor(() => expect(container.querySelectorAll(".st-displaySettings__field")).toHaveLength(1));
    const restoredSwitch = screen.getByRole("switch") as HTMLInputElement;
    fireEvent.click(restoredSwitch);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ reducedMotion: false }));

    rerender(
      <DisplaySettings
        ref={cbRef}
        data-testid="ds"
        className={cls}
        values={values}
        showFontScale={showFontScale}
        showContrast={showContrast}
        showLineSpacing={showLineSpacing}
        showReducedMotion={showReducedMotion}
        onChange={onChange}
        onClick={onClick}
      />,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(root);

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });
});

describe("P5 group 3 forwardRef modules — Batch 2 (Embed, MediaContent, Transcription, CheckboxGroup)", () => {
  it("Embed forwards refs to outer <div>, mutates className signal, and preserves consumer handlers", async () => {
    const cls = signal("emb-before");
    const onClick = vi.fn();
    const objRef = createRef<HTMLDivElement>();
    const cbRef = vi.fn();

    const { container, rerender, unmount } = render(
      <Embed
        ref={objRef}
        data-testid="emb"
        src="https://example.com/report"
        title="Embedded report"
        className={cls}
        onClick={onClick}
      />,
    );
    const root = screen.getByTestId("emb") as HTMLDivElement;
    expect(objRef.current).toBe(root);
    expect(objRef.current?.tagName).toBe("DIV");
    expect(root.className).toBe("st-embed emb-before");
    expect(container.querySelector("iframe.st-embed__frame")?.getAttribute("title")).toBe("Embedded report");

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "emb-after";
    await waitFor(() => expect(root.className).toBe("st-embed emb-after"));

    rerender(
      <Embed
        ref={cbRef}
        data-testid="emb"
        src="https://example.com/report"
        title="Embedded report"
        className={cls}
        onClick={onClick}
      />,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(root);

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });

  it("MediaContent forwards refs to <figure>, mutates className/mediaControls signals, and preserves consumer handlers", async () => {
    const cls = signal("mc-before");
    const mediaControls = signal(true);
    const onClick = vi.fn();
    const objRef = createRef<HTMLElement>();
    const cbRef = vi.fn();

    const { container, rerender, unmount } = render(
      <MediaContent
        ref={objRef}
        data-testid="mc"
        title="Demo clip"
        media="https://example.com/clip.mp4"
        mediaKind="video"
        mediaControls={mediaControls}
        className={cls}
        onClick={onClick}
      />,
    );
    const figure = screen.getByTestId("mc");
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(objRef.current).toBe(figure);
    expect(objRef.current?.tagName).toBe("FIGURE");
    expect(figure.className).toBe("st-mediaContent mc-before");
    expect(video.controls).toBe(true);

    fireEvent.click(figure);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "mc-after";
    mediaControls.value = false;
    await waitFor(() => expect(figure.className).toBe("st-mediaContent mc-after"));
    await waitFor(() => expect(video.controls).toBe(false));

    mediaControls.value = true;
    await waitFor(() => expect(video.controls).toBe(true));

    rerender(
      <MediaContent
        ref={cbRef}
        data-testid="mc"
        title="Poster"
        media="https://example.com/poster.png"
        mediaAlt="Poster image"
        className={cls}
        onClick={onClick}
      />,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(figure);
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("Poster image");

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });

  it("Transcription forwards refs to <details>, mutates className/open/showTimestamps signals, and preserves consumer handlers", async () => {
    const cls = signal("tr-before");
    const open = signal(false);
    const showTimestamps = signal(true);
    const onClick = vi.fn();
    const objRef = createRef<HTMLDetailsElement>();
    const cbRef = vi.fn();

    const { container, rerender, unmount } = render(
      <Transcription
        ref={objRef}
        data-testid="tr"
        title="Audio transcript"
        segments={[{ speaker: "Alice", startTime: "00:00", endTime: "00:10", text: "Bonjour" }]}
        open={open}
        showTimestamps={showTimestamps}
        className={cls}
        onClick={onClick}
      />,
    );
    const details = screen.getByTestId("tr") as HTMLDetailsElement;
    expect(objRef.current).toBe(details);
    expect(objRef.current?.tagName).toBe("DETAILS");
    expect(details.className).toBe("st-transcription tr-before");
    expect(details.open).toBe(false);
    expect(container.querySelector("time")).not.toBeNull();

    fireEvent.click(details);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "tr-after";
    open.value = true;
    showTimestamps.value = false;
    await waitFor(() => expect(details.className).toBe("st-transcription tr-after"));
    await waitFor(() => expect(details.open).toBe(true));
    expect(container.querySelector("time")).toBeNull();

    open.value = false;
    showTimestamps.value = true;
    await waitFor(() => expect(details.open).toBe(false));
    await waitFor(() => expect(container.querySelector("time")).not.toBeNull());

    rerender(
      <Transcription
        ref={cbRef}
        data-testid="tr"
        text="Plain transcript"
        open={open}
        showTimestamps={showTimestamps}
        className={cls}
        onClick={onClick}
      />,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(details);
    expect(container.querySelector(".st-transcription__text")?.textContent).toBe("Plain transcript");

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });

  it("CheckboxGroup forwards refs to <fieldset>, mutates className/value/disabled signals, and preserves consumer handlers", async () => {
    const cls = signal("cg-before");
    const value = signal<string[]>(["a"]);
    const disabled = signal(false);
    const onChange = vi.fn();
    const onClick = vi.fn();
    const objRef = createRef<HTMLFieldSetElement>();
    const cbRef = vi.fn();
    const options = [
      { label: "Alpha", value: "a" },
      { label: "Beta", value: "b" },
    ];

    const { rerender, unmount } = render(
      <CheckboxGroup
        ref={objRef}
        legend="Choices"
        name="choices"
        options={options}
        value={value}
        disabled={disabled}
        className={cls}
        onChange={onChange}
        onClick={onClick}
      />,
    );
    const fieldset = screen.getByRole("group", { name: "Choices" }) as HTMLFieldSetElement;
    const alpha = screen.getByLabelText("Alpha") as HTMLInputElement;
    const beta = screen.getByLabelText("Beta") as HTMLInputElement;
    expect(objRef.current).toBe(fieldset);
    expect(objRef.current?.tagName).toBe("FIELDSET");
    expect(fieldset.className).toBe("st-checkboxGroup st-checkboxGroup--vertical cg-before");
    expect(fieldset.disabled).toBe(false);
    expect(alpha.checked).toBe(true);
    expect(beta.checked).toBe(false);

    fireEvent.click(beta);
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "cg-after";
    value.value = ["b"];
    disabled.value = true;
    await waitFor(() => expect(fieldset.className).toBe("st-checkboxGroup st-checkboxGroup--vertical cg-after"));
    await waitFor(() => expect(fieldset.disabled).toBe(true));
    expect(alpha.checked).toBe(false);
    expect(beta.checked).toBe(true);

    disabled.value = false;
    await waitFor(() => expect(fieldset.disabled).toBe(false));

    rerender(
      <CheckboxGroup
        ref={cbRef}
        legend="Choices"
        name="choices"
        options={options}
        value={value}
        disabled={disabled}
        className={cls}
        onChange={onChange}
        onClick={onClick}
      />,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(fieldset);

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });
});

describe("P5 group 3 forwardRef modules — Batch 3 (BackToTop, Stepper, TableOfContents, Badge)", () => {
  it("BackToTop forwards refs to <button>, mutates className/disabled/autoHide/smooth signals, normalises SVG, and composes consumer onClick", async () => {
    const cls = signal("btt-before");
    const disabled = signal(false);
    const autoHide = signal(true);
    const smooth = signal(true);
    const calls: string[] = [];
    const onClick = vi.fn(() => calls.push("consumer"));
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {
      calls.push("scroll");
    });
    const objRef = createRef<HTMLButtonElement>();
    const cbRef = vi.fn();

    try {
      const { container, rerender, unmount } = render(
        <BackToTop
          ref={objRef}
          label="Top"
          targetId="missing-anchor"
          threshold={240}
          autoHide={autoHide}
          smooth={smooth}
          disabled={disabled}
          className={cls}
          onClick={onClick}
        />,
      );
      const btn = container.querySelector("button.st-backToTop") as HTMLButtonElement;
      expect(objRef.current).toBe(btn);
      expect(objRef.current?.tagName).toBe("BUTTON");
      expect(btn.className).toBe("st-backToTop btt-before");
      expect(btn.disabled).toBe(false);
      // With scrollY=0 and threshold=240, autoHide hides the button.
      expect(btn.getAttribute("aria-hidden")).toBe("true");
      expect(btn.getAttribute("tabindex")).toBe("-1");

      // SVG normaliser from runtime.ts converts camelCase attributes on ArrowUp icon.
      const svg = container.querySelector(".st-backToTop__icon svg");
      expect(svg?.getAttribute("stroke-width")).not.toBeNull();
      expect(svg?.getAttribute("strokeWidth")).toBeNull();

      // Mutate autoHide, className, smooth signals post-mount.
      cls.value = "btt-after";
      autoHide.value = false;
      await waitFor(() => expect(btn.className).toBe("st-backToTop btt-after"));
      await waitFor(() => expect(btn.getAttribute("aria-hidden")).toBeNull());
      expect(btn.getAttribute("tabindex")).toBeNull();

      // Consumer onClick runs first, then window.scrollTo with smooth behavior.
      fireEvent.click(btn);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(scrollSpy).toHaveBeenLastCalledWith({ top: 0, behavior: "smooth" });
      expect(calls).toEqual(["consumer", "scroll"]);

      // Mutate smooth signal post-mount -> scrollTo switches to "auto".
      smooth.value = false;
      await waitFor(() => {
        scrollSpy.mockClear();
        fireEvent.click(btn);
        expect(scrollSpy).toHaveBeenLastCalledWith({ top: 0, behavior: "auto" });
      });

      // Mutate disabled signal post-mount.
      disabled.value = true;
      await waitFor(() => expect(btn.disabled).toBe(true));
      disabled.value = false;
      await waitFor(() => expect(btn.disabled).toBe(false));

      rerender(
        <BackToTop
          ref={cbRef}
          label="Top"
          targetId="missing-anchor"
          autoHide={autoHide}
          smooth={smooth}
          disabled={disabled}
          className={cls}
          onClick={onClick}
        />,
      );
      expect(objRef.current).toBeNull();
      expect(cbRef).toHaveBeenLastCalledWith(btn);

      unmount();
      expect(cbRef).toHaveBeenLastCalledWith(null);
    } finally {
      scrollSpy.mockRestore();
    }
  });

  it("Stepper forwards refs to <ol>, mutates className/current/clickable signals, normalises SVG stroke-width, and preserves consumer handlers", async () => {
    const cls = signal("stp-before");
    const current = signal(0);
    const clickable = signal(false);
    const onStepClick = vi.fn();
    const onClick = vi.fn();
    const objRef = createRef<HTMLOListElement>();
    const cbRef = vi.fn();
    const steps = [{ label: "Start" }, { label: "Review" }, { label: "Done" }];

    const { container, rerender, unmount } = render(
      <Stepper
        ref={objRef}
        steps={steps}
        current={current}
        clickable={clickable}
        onStepClick={onStepClick}
        className={cls}
        onClick={onClick}
      />,
    );
    const list = screen.getByRole("list", { name: "Progression" }) as HTMLOListElement;
    expect(objRef.current).toBe(list);
    expect(objRef.current?.tagName).toBe("OL");
    expect(list.className).toBe("st-stepper st-stepper--horizontal stp-before");
    expect(list.querySelectorAll("li")[0].getAttribute("aria-current")).toBe("step");
    expect(list.querySelectorAll("button.st-stepper__circle--button")).toHaveLength(0);

    // Mutate current, clickable, and className signals post-mount.
    cls.value = "stp-after";
    current.value = 1;
    clickable.value = true;
    await waitFor(() => expect(list.className).toBe("st-stepper st-stepper--horizontal stp-after"));
    await waitFor(() => expect(list.querySelectorAll("li")[1].getAttribute("aria-current")).toBe("step"));
    expect(list.querySelectorAll("li")[0].className).toContain("st-stepper__step--complete");

    // Completed step renders lucide Check SVG with normalised stroke-width="2.5".
    const svg = container.querySelector(".st-stepper__step--complete svg");
    expect(svg?.getAttribute("stroke-width")).toBe("2.5");
    expect(svg?.getAttribute("strokeWidth")).toBeNull();

    // Clickable step button invokes onStepClick AND bubbles to consumer onClick on <ol>.
    const stepButton = screen.getByRole("button", { name: "Review" });
    fireEvent.click(stepButton);
    expect(onStepClick).toHaveBeenCalledWith(1);
    expect(onClick).toHaveBeenCalledTimes(1);

    clickable.value = false;
    await waitFor(() => expect(list.querySelectorAll("button.st-stepper__circle--button")).toHaveLength(0));

    rerender(
      <Stepper
        ref={cbRef}
        steps={steps}
        current={current}
        clickable={clickable}
        onStepClick={onStepClick}
        className={cls}
        onClick={onClick}
      />,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(list);

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });

  it("TableOfContents forwards refs to <nav>, mutates className/activeId signals, and preserves consumer handlers", async () => {
    const cls = signal("toc-before");
    const activeId = signal("intro");
    const onClick = vi.fn();
    const objRef = createRef<HTMLElement>();
    const cbRef = vi.fn();
    const items = [
      { id: "intro", label: "Introduction", level: 1 },
      { id: "#api", label: "API", level: 2 },
    ];

    const { rerender, unmount } = render(
      <TableOfContents
        ref={objRef}
        title="Sommaire"
        items={items}
        activeId={activeId}
        className={cls}
        onClick={onClick}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Sommaire" });
    const introLink = screen.getByRole("link", { name: "Introduction" });
    const apiLink = screen.getByRole("link", { name: "API" });
    expect(objRef.current).toBe(nav);
    expect(objRef.current?.tagName).toBe("NAV");
    expect(nav.className).toBe("st-tableOfContents toc-before");
    expect(introLink.getAttribute("aria-current")).toBe("location");
    expect(apiLink.getAttribute("aria-current")).toBeNull();

    fireEvent.click(nav);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "toc-after";
    activeId.value = "#api";
    await waitFor(() => expect(nav.className).toBe("st-tableOfContents toc-after"));
    await waitFor(() => expect(apiLink.getAttribute("aria-current")).toBe("location"));
    expect(introLink.getAttribute("aria-current")).toBeNull();

    rerender(
      <TableOfContents
        ref={cbRef}
        title="Sommaire"
        items={items}
        activeId={activeId}
        className={cls}
        onClick={onClick}
      />,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(nav);

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });

  it("Badge forwards refs to <span>, mutates className signal, and preserves consumer handlers", async () => {
    const cls = signal("bdg-before");
    const onClick = vi.fn();
    const objRef = createRef<HTMLSpanElement>();
    const cbRef = vi.fn();

    const { rerender, unmount } = render(
      <Badge ref={objRef} data-testid="bdg" tone="info" shape="circle" size="sm" className={cls} onClick={onClick}>
        4
      </Badge>,
    );
    const badge = screen.getByTestId("bdg") as HTMLSpanElement;
    expect(objRef.current).toBe(badge);
    expect(objRef.current?.tagName).toBe("SPAN");
    expect(badge.className).toBe("st-badge st-badge--info st-badge--circle st-badge--sm bdg-before");

    fireEvent.click(badge);
    expect(onClick).toHaveBeenCalledTimes(1);

    cls.value = "bdg-after";
    await waitFor(() =>
      expect(badge.className).toBe("st-badge st-badge--info st-badge--circle st-badge--sm bdg-after"),
    );

    rerender(
      <Badge ref={cbRef} data-testid="bdg" tone="info" shape="circle" size="sm" className={cls} onClick={onClick}>
        4
      </Badge>,
    );
    expect(objRef.current).toBeNull();
    expect(cbRef).toHaveBeenLastCalledWith(badge);

    unmount();
    expect(cbRef).toHaveBeenLastCalledWith(null);
  });
});
