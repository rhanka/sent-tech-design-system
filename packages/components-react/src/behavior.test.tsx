import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  Accordion,
  Button,
  Checkbox,
  Combobox,
  Drawer,
  Dropdown,
  Menu,
  Modal,
  MultiSelect,
  OverflowMenu,
  Pagination,
  Popover,
  Radio,
  Switch,
  Tabs,
  Toast,
  Toggle,
  Toggletip,
  Tooltip,
} from "./index.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  document.body.style.overflow = "";
  vi.useRealTimers();
});

describe("React behavioral parity", () => {
  it("switches tabs with pointer and keyboard while preserving tab-panel relationships", () => {
    const onChange = vi.fn();
    render(
      <Tabs
        label="Framework"
        items={[
          { value: "svelte", label: "Svelte", content: "Svelte content" },
          { value: "react", label: "React", content: "React content" },
          { value: "vue", label: "Vue", content: "Vue content", disabled: true },
        ]}
        onChange={onChange}
      />,
    );

    const svelte = screen.getByRole("tab", { name: "Svelte" });
    const react = screen.getByRole("tab", { name: "React" });

    expect(svelte.getAttribute("aria-selected")).toBe("true");
    expect(svelte.getAttribute("aria-controls")).toBeTruthy();
    expect(screen.getByRole("tabpanel").id).toBe(svelte.getAttribute("aria-controls"));

    fireEvent.keyDown(svelte, { key: "ArrowRight" });
    expect(react.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(react);
    expect(screen.getByRole("tabpanel").textContent).toBe("React content");

    fireEvent.keyDown(react, { key: "Home" });
    expect(svelte.getAttribute("aria-selected")).toBe("true");

    fireEvent.click(react);
    expect(onChange).toHaveBeenLastCalledWith("react");
  });

  it("updates accordion aria state, region wiring, and single-open behavior", () => {
    const onChange = vi.fn();
    render(
      <Accordion
        allowMultiple={false}
        onChange={onChange}
        items={[
          { id: "one", title: "One", content: "Panel one" },
          { id: "two", title: "Two", content: "Panel two" },
        ]}
      />,
    );

    const one = screen.getByRole("button", { name: /one/i });
    const two = screen.getByRole("button", { name: /two/i });

    fireEvent.click(one);
    expect(one.getAttribute("aria-expanded")).toBe("true");
    expect(one.getAttribute("aria-controls")).toBe("st-accordion-panel-one");
    expect(screen.getByRole("region", { name: "One" }).textContent).toBe("Panel one");

    fireEvent.click(two);
    expect(one.getAttribute("aria-expanded")).toBe("false");
    expect(two.getAttribute("aria-expanded")).toBe("true");
    expect(screen.queryByText("Panel one")).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith(["two"]);
  });

  it("traps focus, locks scroll, and closes modal/drawer with Escape or backdrop", () => {
    const onModalClose = vi.fn();
    const onDrawerClose = vi.fn();
    render(
      <>
        <button type="button">Before</button>
        <Modal open title="Confirm" onClose={onModalClose}>
          <button type="button">First action</button>
          <button type="button">Last action</button>
        </Modal>
        <Drawer open title="Filters" onClose={onDrawerClose}>
          <button type="button">Apply</button>
        </Drawer>
      </>,
    );

    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("dialog", { name: "Confirm" }).getAttribute("aria-modal")).toBe("true");
    expect(screen.getByRole("dialog", { name: "Filters" }).getAttribute("aria-modal")).toBe("true");

    const modalClose = screen.getAllByRole("button", { name: "Close" })[0];
    const lastAction = screen.getByRole("button", { name: "Last action" });
    lastAction.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(modalClose);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onModalClose).toHaveBeenCalledTimes(1);
    expect(onDrawerClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("st-drawer-backdrop"));
    expect(onDrawerClose).toHaveBeenCalledTimes(2);
  });

  it("opens menu surfaces, supports roving focus, selection, placement, and outside click", () => {
    const onDropdownSelect = vi.fn();
    const onMenuSelect = vi.fn();
    render(
      <div>
        <Dropdown
          label="Region"
          options={[
            { value: "eu", label: "Europe" },
            { value: "na", label: "North America" },
          ]}
          onSelect={onDropdownSelect}
        />
        <Menu items={[{ id: "copy", label: "Copy" }, { id: "archive", label: "Archive" }]} onSelect={onMenuSelect} />
        <Popover placement="right" trigger={<Button>Context</Button>}>
          Popover body
        </Popover>
        <OverflowMenu items={[{ id: "rename", label: "Rename" }]} label="More actions" placement="bottom-end" />
        <button type="button">Outside</button>
      </div>,
    );

    const dropdownButton = screen.getByRole("button", { name: /region/i });
    expect(dropdownButton.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(dropdownButton);
    expect(dropdownButton.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(dropdownButton, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("option", { name: "Europe" }));
    fireEvent.keyDown(document.activeElement as Element, { key: "Enter" });
    expect(onDropdownSelect).toHaveBeenCalledWith("eu");
    expect(dropdownButton.getAttribute("aria-expanded")).toBe("false");

    const copy = screen.getByRole("menuitem", { name: "Copy" });
    copy.focus();
    fireEvent.keyDown(copy, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Archive" }));
    fireEvent.keyDown(document.activeElement as Element, { key: "Enter" });
    expect(onMenuSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "archive" }));

    const popoverTrigger = screen.getByRole("button", { name: "Context" });
    fireEvent.click(popoverTrigger);
    expect(screen.getByRole("dialog", { name: "Context" }).className).toContain("st-popover--right");
    fireEvent.mouseDown(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("dialog", { name: "Context" })).toBeNull();

    const overflowTrigger = screen.getByRole("button", { name: "More actions" });
    fireEvent.click(overflowTrigger);
    const overflowMenu = screen.getAllByRole("menu").find((menu) => menu.parentElement?.className.includes("st-overflowMenu__list"));
    expect(overflowMenu?.parentElement?.className).toContain("st-overflowMenu__list");
    expect(overflowMenu?.parentElement?.className).toContain("st-overflowMenu__list--bottom-end");
  });

  it("keeps choice controls controlled and paginates with current-page semantics", () => {
    const onPageChange = vi.fn();
    function ControlledChoices() {
      const [checked, setChecked] = React.useState(false);
      return (
        <>
          <Checkbox label="Accept" checked={checked} onChange={(event) => setChecked(event.currentTarget.checked)} />
          <Radio label="Owner" checked={checked} onChange={(event) => setChecked(event.currentTarget.checked)} />
          <Toggle label="Notify" checked={checked} onChange={(event) => setChecked(event.currentTarget.checked)} />
          <Switch label="Billing" checked={checked} onChange={(event) => setChecked(event.currentTarget.checked)} />
        </>
      );
    }

    render(
      <>
        <ControlledChoices />
        <Pagination page={2} pageCount={4} onPageChange={onPageChange} />
      </>,
    );

    const checkbox = screen.getByLabelText("Accept") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect((screen.getByRole("switch", { name: "Notify" }) as HTMLInputElement).getAttribute("aria-checked")).toBe("true");
    expect((screen.getByLabelText("Billing") as HTMLInputElement).getAttribute("aria-checked")).toBe("true");

    const pageTwo = screen.getByRole("button", { name: "Page 2" });
    expect(pageTwo.getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("toggles disclosure help surfaces and keeps tooltip content accessible on focus", () => {
    render(
      <>
        <Tooltip content="Detailed help">
          <button type="button">Hover help</button>
        </Tooltip>
        <Toggletip label="More information" content="Persistent help" />
      </>,
    );

    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(tooltip.getAttribute("aria-hidden")).toBe("true");
    fireEvent.focus(screen.getByRole("button", { name: "Hover help" }));
    expect(tooltip.getAttribute("aria-hidden")).toBe("false");

    const toggletip = screen.getByRole("button", { name: "More information" });
    expect(toggletip.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggletip);
    expect(toggletip.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("status").textContent).toContain("Persistent help");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(toggletip.getAttribute("aria-expanded")).toBe("false");
  });

  it("selects combobox and multiselect options with keyboard and controlled callbacks", () => {
    const onComboboxChange = vi.fn();
    const onMultiSelectChange = vi.fn();
    render(
      <>
        <Combobox
          label="Team"
          options={[
            { value: "design", label: "Design" },
            { value: "engineering", label: "Engineering" },
          ]}
          onChange={onComboboxChange}
        />
        <MultiSelect
          label="Scopes"
          options={[
            { value: "docs", label: "Docs" },
            { value: "api", label: "API" },
          ]}
          onChange={onMultiSelectChange}
        />
      </>,
    );

    const team = screen.getByRole("combobox", { name: "Team" });
    fireEvent.focus(team);
    fireEvent.change(team, { target: { value: "eng" } });
    fireEvent.keyDown(team, { key: "ArrowDown" });
    fireEvent.keyDown(team, { key: "Enter" });
    expect(onComboboxChange).toHaveBeenCalledWith("engineering");
    expect((team as HTMLInputElement).value).toBe("Engineering");

    const scopes = screen.getByRole("group", { name: "Scopes" }).querySelector(".st-multiSelect__trigger") as HTMLButtonElement;
    fireEvent.click(scopes);
    expect(screen.getByRole("listbox", { name: "Scopes" }).getAttribute("aria-multiselectable")).toBe("true");
    fireEvent.click(screen.getByRole("option", { name: "Docs" }));
    expect(onMultiSelectChange).toHaveBeenCalledWith(["docs"]);
    expect(screen.getByText("Docs", { selector: ".st-multiSelect__tagLabel" }).className).toContain("st-multiSelect__tagLabel");
  });

  it("supports queued toasts and auto-dismisses individual notices", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <Toast
        title="Ignored"
        items={[
          { id: "saved", tone: "success", title: "Saved", message: "Changes persisted" },
          { id: "queued", tone: "info", title: "Queued", message: "Next item" },
        ]}
        autoDismiss
        duration={1000}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getAllByRole("status")).toHaveLength(2);
    vi.advanceTimersByTime(1000);
    expect(onDismiss).toHaveBeenCalledWith("saved");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss Queued" }));
    expect(onDismiss).toHaveBeenCalledWith("queued");
  });
});
