import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createRef } from "preact";
import type { CSSProperties } from "preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Avatar } from "./Avatar.js";
import { AvatarGroup } from "./AvatarGroup.js";
import { DisplaySettings } from "./DisplaySettings.js";
import type { DisplaySettingsState } from "./DisplaySettings.js";
import { SelectableRow } from "./SelectableRow.js";

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
