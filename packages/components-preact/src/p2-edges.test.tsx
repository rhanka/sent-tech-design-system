import { signal } from "@preact/signals";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Calendar } from "./Calendar.js";
import { Checkbox } from "./Checkbox.js";
import { CheckboxGroup } from "./CheckboxGroup.js";
import { Combobox } from "./Combobox.js";
import { ContentSwitcher } from "./ContentSwitcher.js";
import { DatePicker } from "./DatePicker.js";
import { Dropdown } from "./Dropdown.js";
import { FileUploader } from "./FileUploader.js";
import { Form } from "./Form.js";
import { FormGroup } from "./FormGroup.js";
import { Input } from "./Input.js";
import { Menu } from "./Menu.js";
import { MenuPopover } from "./MenuPopover.js";
import { MultiSelect } from "./MultiSelect.js";
import { NumberInput } from "./NumberInput.js";
import { PasswordInput } from "./PasswordInput.js";
import { Radio } from "./Radio.js";
import { RadioGroup } from "./RadioGroup.js";
import { RangeSlider } from "./RangeSlider.js";
import { Search } from "./Search.js";
import { Select } from "./Select.js";
import { SelectableList } from "./SelectableList.js";
import { SelectableRow } from "./SelectableRow.js";
import { Slider } from "./Slider.js";
import { Switch } from "./Switch.js";
import { Textarea } from "./Textarea.js";
import { TileGroup } from "./TileGroup.js";
import { TimePicker } from "./TimePicker.js";
import { TimeRangePicker } from "./TimeRangePicker.js";
import { Toggle } from "./Toggle.js";

afterEach(cleanup);

describe("P2 form edges (signals at the edges, post-mount mutation)", () => {
  it("accepts a Signal for className on every P2 module", () => {
    render(
      <>
        <Calendar data-testid="e-calendar" className={signal("x-calendar")} />
        <Checkbox data-testid="e-checkbox" label="C" className={signal("x-checkbox")} />
        <CheckboxGroup data-testid="e-checkboxgroup" legend="G" className={signal("x-checkboxgroup")} />
        <Combobox data-testid="e-combobox" options={[]} className={signal("x-combobox")} />
        <ContentSwitcher data-testid="e-contentswitcher" items={[]} className={signal("x-contentswitcher")} />
        <DatePicker data-testid="e-datepicker" className={signal("x-datepicker")} />
        <Dropdown data-testid="e-dropdown" options={[]} className={signal("x-dropdown")} />
        <FileUploader data-testid="e-fileuploader" className={signal("x-fileuploader")} />
        <Form data-testid="e-form" className={signal("x-form")}>x</Form>
        <FormGroup data-testid="e-formgroup" legend="G" className={signal("x-formgroup")} />
        <Input data-testid="e-input" className={signal("x-input")} />
        <Menu data-testid="e-menu" items={[]} className={signal("x-menu")} />
        <MenuPopover data-testid="e-menupopover" open trigger={null} label="M" className={signal("x-menupopover")} />
        <MultiSelect data-testid="e-multiselect" options={[]} className={signal("x-multiselect")} />
        <NumberInput data-testid="e-numberinput" className={signal("x-numberinput")} />
        <PasswordInput data-testid="e-passwordinput" className={signal("x-passwordinput")} />
        <Radio data-testid="e-radio" label="R" className={signal("x-radio")} />
        <RadioGroup data-testid="e-radiogroup" legend="G" name="g" className={signal("x-radiogroup")} />
        <span data-testid="e-rangeslider">
          <RangeSlider className={signal("x-rangeslider")} />
        </span>
        <Search data-testid="e-search" className={signal("x-search")} />
        <Select data-testid="e-select" className={signal("x-select")} />
        <SelectableList data-testid="e-selectablelist" className={signal("x-selectablelist")} />
        <SelectableRow data-testid="e-selectablerow" value="s" className={signal("x-selectablerow")}>
          S
        </SelectableRow>
        <Slider data-testid="e-slider" className={signal("x-slider")} />
        <Switch data-testid="e-switch" label="S" className={signal("x-switch")} />
        <Textarea data-testid="e-textarea" className={signal("x-textarea")} />
        <TileGroup data-testid="e-tilegroup" items={[]} className={signal("x-tilegroup")} />
        <TimePicker data-testid="e-timepicker" className={signal("x-timepicker")} />
        <TimeRangePicker data-testid="e-timerangepicker" className={signal("x-timerangepicker")} />
        <Toggle data-testid="e-toggle" label="T" className={signal("x-toggle")} />
      </>,
    );
    for (const [testId, extra] of [
      ["e-calendar", "x-calendar"],
      ["e-checkbox", "x-checkbox"],
      ["e-checkboxgroup", "x-checkboxgroup"],
      ["e-combobox", "x-combobox"],
      ["e-contentswitcher", "x-contentswitcher"],
      ["e-datepicker", "x-datepicker"],
      ["e-dropdown", "x-dropdown"],
      ["e-fileuploader", "x-fileuploader"],
      ["e-form", "x-form"],
      ["e-formgroup", "x-formgroup"],
      ["e-input", "x-input"],
      ["e-menu", "x-menu"],
      ["e-menupopover", "x-menupopover"],
      ["e-multiselect", "x-multiselect"],
      ["e-numberinput", "x-numberinput"],
      ["e-passwordinput", "x-passwordinput"],
      ["e-radio", "x-radio"],
      ["e-radiogroup", "x-radiogroup"],
      ["e-rangeslider", "x-rangeslider"],
      ["e-search", "x-search"],
      ["e-select", "x-select"],
      ["e-selectablelist", "x-selectablelist"],
      ["e-selectablerow", "x-selectablerow"],
      ["e-slider", "x-slider"],
      ["e-switch", "x-switch"],
      ["e-textarea", "x-textarea"],
      ["e-tilegroup", "x-tilegroup"],
      ["e-timepicker", "x-timepicker"],
      ["e-timerangepicker", "x-timerangepicker"],
      ["e-toggle", "x-toggle"],
    ] as const) {
      // Wrapped controls spread the test id onto their inner control while
      // the consumer class lands on the outer wrapper.
      const el = screen.getByTestId(testId);
      const host = (() => {
        switch (testId) {
          case "e-checkbox":
          case "e-radio":
          case "e-switch":
          case "e-toggle":
            return el.closest("label")!;
          case "e-input":
          case "e-numberinput":
          case "e-passwordinput":
          case "e-select":
          case "e-textarea":
          case "e-slider":
            return el.closest(".st-field")!;
          case "e-search":
            return el.closest(".st-search")!;
          case "e-rangeslider":
            return el.firstElementChild as HTMLElement;
          default:
            return el;
        }
      })();
      expect(host.className).toContain(extra);
    }
  });

  it("follows a className signal mutated after mount", async () => {
    const cls = signal("before");
    render(<Form data-testid="e-form-signal" className={cls}>x</Form>);
    expect(screen.getByTestId("e-form-signal").className).toContain("before");
    cls.value = "after";
    await waitFor(() => expect(screen.getByTestId("e-form-signal").className).toContain("after"));
  });

  it("Checkbox follows a checked signal mutated after mount", async () => {
    const checked = signal(false);
    const { container } = render(<Checkbox label="C" checked={checked} />);
    const input = container.querySelector(".st-choice__input") as HTMLInputElement;
    expect(input.checked).toBe(false);
    checked.value = true;
    await waitFor(() => expect((container.querySelector(".st-choice__input") as HTMLInputElement).checked).toBe(true));
  });

  it("Radio follows a checked signal mutated after mount", async () => {
    const checked = signal(false);
    const { container } = render(<Radio label="R" name="r" checked={checked} />);
    expect((container.querySelector(".st-choice__input") as HTMLInputElement).checked).toBe(false);
    checked.value = true;
    await waitFor(() => expect((container.querySelector(".st-choice__input") as HTMLInputElement).checked).toBe(true));
  });

  it("CheckboxGroup follows a value signal mutated after mount", async () => {
    const value = signal(["a"]);
    const options = [
      { label: "A", value: "a" },
      { label: "B", value: "b" },
    ];
    const onChange = vi.fn();
    const { container } = render(<CheckboxGroup legend="G" options={options} value={value} onChange={onChange} />);
    const boxes = Array.from(container.querySelectorAll<HTMLInputElement>(".st-choice__input"));
    expect(boxes[0].checked).toBe(true);
    expect(boxes[1].checked).toBe(false);
    value.value = ["b"];
    await waitFor(() =>
      expect(
        Array.from(container.querySelectorAll<HTMLInputElement>(".st-choice__input")).map((el) => el.checked),
      ).toEqual([false, true]),
    );
    fireEvent.click(boxes[0]);
    expect(onChange).toHaveBeenLastCalledWith(["b", "a"]);
  });

  it("RadioGroup follows a value signal mutated after mount", async () => {
    const value = signal("a");
    const options = [
      { label: "A", value: "a" },
      { label: "B", value: "b" },
    ];
    const onChange = vi.fn();
    const { container } = render(<RadioGroup legend="G" name="g" options={options} value={value} onChange={onChange} />);
    const radios = Array.from(container.querySelectorAll<HTMLInputElement>(".st-choice__input"));
    expect(radios[0].checked).toBe(true);
    value.value = "b";
    await waitFor(() =>
      expect(
        Array.from(container.querySelectorAll<HTMLInputElement>(".st-choice__input")).map((el) => el.checked),
      ).toEqual([false, true]),
    );
    fireEvent.click(radios[0]);
    expect(onChange).toHaveBeenLastCalledWith("a");
  });

  it("Toggle follows a checked signal mutated after mount", async () => {
    const checked = signal(false);
    const { container } = render(<Toggle label="T" checked={checked} />);
    expect(container.querySelector(".st-toggle__state")?.textContent).toBe("Off");
    expect(container.querySelector(".st-toggle__input")?.getAttribute("aria-checked")).toBe("false");
    checked.value = true;
    await waitFor(() => expect(container.querySelector(".st-toggle__state")?.textContent).toBe("On"));
    await waitFor(() => expect(container.querySelector(".st-toggle__input")?.getAttribute("aria-checked")).toBe("true"));
  });

  it("Switch follows a checked signal mutated after mount", async () => {
    const checked = signal(false);
    const { container } = render(<Switch label="S" checked={checked} />);
    expect(container.querySelector(".st-switch__input")?.getAttribute("aria-checked")).toBe("false");
    checked.value = true;
    await waitFor(() => expect(container.querySelector(".st-switch__input")?.getAttribute("aria-checked")).toBe("true"));
  });

  it("Input follows invalid and value signals mutated after mount", async () => {
    const invalid = signal(false);
    const value = signal("hi");
    const { container } = render(<Input label="L" invalid={invalid} value={value} onChange={() => {}} />);
    const input = container.querySelector(".st-control") as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(input.value).toBe("hi");
    invalid.value = true;
    value.value = "bye";
    await waitFor(() => expect((container.querySelector(".st-control") as HTMLInputElement).getAttribute("aria-invalid")).toBe("true"));
    await waitFor(() => expect((container.querySelector(".st-control") as HTMLInputElement).value).toBe("bye"));
  });

  it("NumberInput follows a value signal mutated after mount and increments", async () => {
    const value = signal(1);
    const { container } = render(<NumberInput label="N" value={value} />);
    expect((container.querySelector(".st-numberInput__control") as HTMLInputElement).value).toBe("1");
    value.value = 4;
    await waitFor(() => expect((container.querySelector(".st-numberInput__control") as HTMLInputElement).value).toBe("4"));
  });

  it("NumberInput increments and decrements uncontrolled", () => {
    const { container } = render(<NumberInput label="N" defaultValue={1} />);
    const buttons = container.querySelectorAll(".st-numberInput__button");
    fireEvent.click(buttons[1]);
    expect((container.querySelector(".st-numberInput__control") as HTMLInputElement).value).toBe("2");
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[0]);
    expect((container.querySelector(".st-numberInput__control") as HTMLInputElement).value).toBe("0");
  });

  it("PasswordInput toggles masking without a signal", () => {
    const { container } = render(<PasswordInput label="P" />);
    const input = container.querySelector(".st-passwordInput__control") as HTMLInputElement;
    expect(input.type).toBe("password");
    const toggle = container.querySelector(".st-passwordInput__toggle") as HTMLButtonElement;
    expect(toggle.getAttribute("aria-label")).toBe("Show password");
    fireEvent.click(toggle);
    expect((container.querySelector(".st-passwordInput__control") as HTMLInputElement).type).toBe("text");
    expect((container.querySelector(".st-passwordInput__toggle") as HTMLButtonElement).getAttribute("aria-label")).toBe("Hide password");
  });

  it("Search renders a clear button when onClear is set", () => {
    const onClear = vi.fn();
    const { container } = render(<Search label="S" onClear={onClear} />);
    const input = container.querySelector(".st-search__control") as HTMLInputElement;
    expect(input.type).toBe("search");
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onClear).toHaveBeenCalledTimes(1);
    const { container: fluid } = render(<Search label="S" fluid onClear={() => {}} />);
    expect(fluid.querySelector(".st-search--fluid")).toBeTruthy();
  });

  it("Select renders options and follows an invalid signal mutated after mount", async () => {
    const invalid = signal(false);
    const { container } = render(
      <Select label="S" invalid={invalid} options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} />,
    );
    expect(container.querySelectorAll("option")).toHaveLength(2);
    expect(container.querySelector("select")?.getAttribute("aria-invalid")).toBeNull();
    invalid.value = true;
    await waitFor(() => expect(container.querySelector("select")?.getAttribute("aria-invalid")).toBe("true"));
  });

  it("Textarea renders a labelled control", () => {
    const { container } = render(<Textarea label="T" helperText="H" />);
    const area = container.querySelector(".st-textarea") as HTMLTextAreaElement;
    expect(area.getAttribute("id")).toBe(container.querySelector("label")?.getAttribute("for"));
    expect(container.querySelector(".st-field__help")?.textContent).toBe("H");
  });

  it("Input fires both onChange and onInput once per input event", () => {
    const onChange = vi.fn();
    const onInput = vi.fn();
    const { container } = render(<Input label="L" defaultValue="a" onChange={onChange} onInput={onInput} />);
    fireEvent.input(container.querySelector(".st-control") as HTMLInputElement, { target: { value: "b" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("Textarea fires both onChange and onInput once per input event", () => {
    const onChange = vi.fn();
    const onInput = vi.fn();
    const { container } = render(<Textarea label="T" defaultValue="a" onChange={onChange} onInput={onInput} />);
    fireEvent.input(container.querySelector(".st-textarea") as HTMLTextAreaElement, { target: { value: "b" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("Search fires both onChange and onInput once per input event", () => {
    const onChange = vi.fn();
    const onInput = vi.fn();
    const { container } = render(<Search defaultValue="a" onChange={onChange} onInput={onInput} />);
    fireEvent.input(container.querySelector(".st-search__input") as HTMLInputElement, { target: { value: "b" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("PasswordInput fires both onChange and onInput once per input event", () => {
    const onChange = vi.fn();
    const onInput = vi.fn();
    const { container } = render(<PasswordInput label="P" defaultValue="a" onChange={onChange} onInput={onInput} />);
    fireEvent.input(container.querySelector(".st-passwordInput__control") as HTMLInputElement, { target: { value: "b" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("NumberInput fires both onChange and onInput once per input event", () => {
    const onChange = vi.fn();
    const onInput = vi.fn();
    const { container } = render(<NumberInput label="N" defaultValue={1} onChange={onChange} onInput={onInput} />);
    fireEvent.input(container.querySelector(".st-numberInput__control") as HTMLInputElement, { target: { value: "2" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("Slider fires both onChange and onInput once per input event", () => {
    const onChange = vi.fn();
    const onInput = vi.fn();
    const { container } = render(<Slider label="S" defaultValue={20} onChange={onChange} onInput={onInput} />);
    fireEvent.input(container.querySelector(".st-slider__input") as HTMLInputElement, { target: { value: "42" } });
    expect(onChange).toHaveBeenLastCalledWith(42);
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("Slider follows a value signal mutated after mount", async () => {
    const value = signal(20);
    const onChange = vi.fn();
    const { container } = render(<Slider label="S" value={value} onChange={onChange} />);
    expect(container.querySelector(".st-slider__value")?.textContent).toBe("20");
    expect((container.querySelector(".st-slider__input") as HTMLInputElement).value).toBe("20");
    value.value = 70;
    await waitFor(() => expect(container.querySelector(".st-slider__value")?.textContent).toBe("70"));
    fireEvent.change(container.querySelector(".st-slider__input") as HTMLInputElement, { target: { value: "80" } });
    expect(onChange).toHaveBeenLastCalledWith(80);
  });

  it("RangeSlider follows a value signal mutated after mount", async () => {
    const value = signal<[number, number]>([20, 80]);
    const { container } = render(<RangeSlider value={value} min={0} max={100} />);
    const thumbs = container.querySelectorAll('[role="slider"]');
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0].getAttribute("aria-valuenow")).toBe("20");
    expect(thumbs[1].getAttribute("aria-valuenow")).toBe("80");
    value.value = [30, 60];
    await waitFor(() => expect(container.querySelectorAll('[role="slider"]')[0].getAttribute("aria-valuenow")).toBe("30"));
    await waitFor(() => expect(container.querySelectorAll('[role="slider"]')[1].getAttribute("aria-valuenow")).toBe("60"));
  });

  it("Combobox follows value and open signals mutated after mount", async () => {
    const value = signal("b");
    const open = signal(false);
    const options = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
    ];
    const onSelect = vi.fn();
    const { container } = render(<Combobox label="C" options={options} value={value} open={open} onSelect={onSelect} />);
    const input = container.querySelector(".st-combobox__control") as HTMLInputElement;
    expect(input.value).toBe("Beta");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    value.value = "a";
    open.value = true;
    await waitFor(() => expect((container.querySelector(".st-combobox__control") as HTMLInputElement).value).toBe("Alpha"));
    await waitFor(() => expect((container.querySelector(".st-combobox__control") as HTMLInputElement).getAttribute("aria-expanded")).toBe("true"));
    expect(container.querySelector('[role="listbox"]')).toBeTruthy();
    open.value = false;
    await waitFor(() => expect((container.querySelector(".st-combobox__control") as HTMLInputElement).getAttribute("aria-expanded")).toBe("false"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("Combobox selects an option from the list", () => {
    const onSelect = vi.fn();
    const options = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
    ];
    const { container } = render(<Combobox label="C" options={options} onSelect={onSelect} />);
    fireEvent.click(container.querySelector(".st-combobox__toggle") as HTMLButtonElement);
    expect(container.querySelector('[role="listbox"]')).toBeTruthy();
    fireEvent.mouseDown(screen.getByRole("option", { name: "Beta" }));
    expect(onSelect).toHaveBeenLastCalledWith("b");
    expect((container.querySelector(".st-combobox__control") as HTMLInputElement).value).toBe("Beta");
  });

  it("Dropdown follows value and open signals mutated after mount", async () => {
    const value = signal("a");
    const open = signal(false);
    const options = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
    ];
    const onSelect = vi.fn();
    render(<Dropdown label="D" options={options} value={value} open={open} onSelect={onSelect} />);
    expect(screen.getByRole("button", { expanded: false }).textContent).toContain("Alpha");
    value.value = "b";
    open.value = true;
    await waitFor(() => expect(screen.getByRole("listbox")).toBeTruthy());
    fireEvent.click(screen.getByRole("option", { name: "Beta" }));
    expect(onSelect).toHaveBeenLastCalledWith("b");
  });

  it("MultiSelect follows value and open signals mutated after mount", async () => {
    const value = signal<string[]>(["a"]);
    const open = signal(false);
    const options = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
    ];
    const onChange = vi.fn();
    const { container } = render(<MultiSelect label="M" options={options} value={value} open={open} onChange={onChange} />);
    const tagLabels = () =>
      Array.from(container.querySelectorAll(".st-multiSelect__tagLabel")).map((el) => el.textContent);
    expect(tagLabels()).toEqual(["Alpha"]);
    value.value = ["a", "b"];
    open.value = true;
    await waitFor(() => expect(tagLabels()).toEqual(["Alpha", "Beta"]));
    await waitFor(() => expect(screen.getByRole("listbox")).toBeTruthy());
    fireEvent.click(screen.getByRole("option", { name: "Alpha" }));
    expect(onChange).toHaveBeenLastCalledWith(["b"]);
  });

  it("DatePicker follows a value signal mutated after mount and picks a day", async () => {
    const value = signal<Date | null>(new Date(2026, 2, 10));
    const onChange = vi.fn();
    const { container } = render(<DatePicker label="D" value={value} onChange={onChange} />);
    expect((container.querySelector(".st-datepicker__control") as HTMLInputElement).value).toBe("10/03/2026");
    value.value = new Date(2026, 2, 12);
    await waitFor(() =>
      expect((container.querySelector(".st-datepicker__control") as HTMLInputElement).value).toBe("12/03/2026"),
    );
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le calendrier" }));
    expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    const day20 = Array.from(container.querySelectorAll<HTMLButtonElement>(".st-datepicker__day")).find(
      (el) => el.textContent === "20" && !el.className.includes("outside"),
    )!;
    fireEvent.click(day20);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(20);
  });

  it("Calendar follows value and month signals mutated after mount", async () => {
    const value = signal<string | null>("2026-03-10");
    const month = signal("2026-03");
    const onChange = vi.fn();
    const { container } = render(<Calendar value={value} month={month} onChange={onChange} />);
    expect(container.querySelector(".st-calendar__day--selected")?.textContent).toBe("10");
    const before = container.querySelector(".st-calendar__monthLabel")?.textContent;
    value.value = "2026-03-12";
    await waitFor(() => expect(container.querySelector(".st-calendar__day--selected")?.textContent).toBe("12"));
    month.value = "2026-04";
    await waitFor(() =>
      expect(container.querySelector(".st-calendar__monthLabel")?.textContent).not.toBe(before),
    );
    const day15 = Array.from(container.querySelectorAll<HTMLButtonElement>(".st-calendar__day")).find(
      (el) => el.textContent === "15" && !el.className.includes("outside"),
    )!;
    fireEvent.click(day15);
    expect(onChange).toHaveBeenLastCalledWith("2026-04-15");
  });

  it("TimePicker follows a value signal mutated after mount and picks a slot", async () => {
    const value = signal("10:30");
    const onChange = vi.fn();
    const { container } = render(<TimePicker label="T" value={value} onChange={onChange} />);
    expect((container.querySelector(".st-timepicker__control") as HTMLInputElement).value).toBe("10:30");
    value.value = "11:00";
    await waitFor(() =>
      expect((container.querySelector(".st-timepicker__control") as HTMLInputElement).value).toBe("11:00"),
    );
    fireEvent.click(container.querySelector(".st-timepicker__trigger") as HTMLButtonElement);
    await waitFor(() => expect(container.querySelector('[role="listbox"]')).toBeTruthy());
    fireEvent.click(screen.getByRole("option", { name: "01:00" }));
    expect(onChange).toHaveBeenLastCalledWith("01:00");
  });

  it("TimeRangePicker opens the panel and resolves a preset", async () => {
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <TimeRangePicker
        label="P"
        presets={[{ token: "1h", label: "Last hour" }]}
        onChange={onChange}
        onOpenChange={onOpenChange}
      />,
    );
    const trigger = screen.getByRole("button", { expanded: false });
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy());
    expect(screen.getByRole("group", { name: "P" })).toBeTruthy();
    fireEvent.click(screen.getByRole("option", { name: "Last hour" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as { mode: string; relative: string }).mode).toBe("relative");
    expect((onChange.mock.calls[0][0] as { mode: string; relative: string }).relative).toBe("1h");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("TimeRangePicker stages the custom tab behind Apply", async () => {
    const onChange = vi.fn();
    render(<TimeRangePicker label="P" />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Personnalisé" }));
    // The seeded relative range stages a complete draft: From/To fields are
    // filled and Apply is armed, but nothing emits until Apply or Cancel.
    expect(screen.getAllByPlaceholderText("AAAA-MM-JJ HH:mm")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Appliquer" }).hasAttribute("disabled")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("SelectableList follows a value signal and supports roving tabindex", async () => {
    const value = signal<string | null>("a");
    const onChange = vi.fn();
    const { container } = render(
      <SelectableList label="L" value={value} onChange={onChange}>
        <SelectableRow value="a">A</SelectableRow>
        <SelectableRow value="b">B</SelectableRow>
      </SelectableList>,
    );
    const rows = Array.from(container.querySelectorAll('[role="option"]')) as HTMLElement[];
    expect(rows).toHaveLength(2);
    expect(rows[0].getAttribute("aria-selected")).toBe("true");
    expect(rows[0].getAttribute("tabindex")).toBe("0");
    value.value = "b";
    await waitFor(() => expect(container.querySelectorAll('[role="option"]')[1].getAttribute("aria-selected")).toBe("true"));
    fireEvent.click(rows[0]);
    expect(onChange).toHaveBeenLastCalledWith("a");
    rows[0].focus();
    fireEvent.keyDown(rows[0], { key: "ArrowDown" });
    await waitFor(() => expect(document.activeElement?.getAttribute("data-value")).toBe("b"));
  });

  it("SelectableRow follows selected, accentBar and className signals mutated after mount", async () => {
    const selected = signal(false);
    const accentBar = signal(false);
    const cls = signal("before");
    const onSelect = vi.fn();
    render(
      <SelectableRow value="a" selected={selected} accentBar={accentBar} className={cls} onSelect={onSelect}>
        A
      </SelectableRow>,
    );
    const row = screen.getByRole("button");
    expect(row.getAttribute("aria-pressed")).toBe("false");
    expect(row.className).not.toContain("st-selectableRow--selected");
    expect(row.className).not.toContain("st-selectableRow--accentBar");
    expect(row.className).toContain("before");
    // A raw Signal object is truthy: without the edge unwrap this click would
    // emit `false` and the row would already render selected.
    fireEvent.click(row);
    expect(onSelect).toHaveBeenLastCalledWith(true);
    selected.value = true;
    accentBar.value = true;
    cls.value = "after";
    await waitFor(() => expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true"));
    await waitFor(() => expect(screen.getByRole("button").className).toContain("st-selectableRow--selected"));
    await waitFor(() => expect(screen.getByRole("button").className).toContain("st-selectableRow--accentBar"));
    await waitFor(() => expect(screen.getByRole("button").className).toContain("after"));
  });

  it("SelectableRow follows a standalone disabled signal mutated after mount", async () => {
    const disabled = signal(false);
    const onSelect = vi.fn();
    render(
      <SelectableRow value="a" disabled={disabled} onSelect={onSelect}>
        A
      </SelectableRow>,
    );
    const row = screen.getByRole("button");
    expect(row.getAttribute("tabindex")).toBe("0");
    expect(row.getAttribute("aria-disabled")).toBeNull();
    fireEvent.click(row);
    expect(onSelect).toHaveBeenLastCalledWith(true);
    disabled.value = true;
    await waitFor(() => expect(screen.getByRole("button").getAttribute("tabindex")).toBe("-1"));
    await waitFor(() => expect(screen.getByRole("button").getAttribute("aria-disabled")).toBe("true"));
    await waitFor(() => expect(screen.getByRole("button").className).toContain("st-selectableRow--disabled"));
    fireEvent.click(screen.getByRole("button"));
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("SelectableRow follows a list-managed disabled signal mutated after mount", async () => {
    const disabled = signal(false);
    const { container } = render(
      <SelectableList label="L">
        <SelectableRow value="a" disabled={disabled}>
          A
        </SelectableRow>
        <SelectableRow value="b">B</SelectableRow>
      </SelectableList>,
    );
    const rows = () => Array.from(container.querySelectorAll('[role="option"]')) as HTMLElement[];
    expect(rows()[0].getAttribute("tabindex")).toBe("0");
    expect(rows()[1].getAttribute("tabindex")).toBe("-1");
    disabled.value = true;
    await waitFor(() => expect(container.querySelectorAll('[role="option"]')[0].getAttribute("tabindex")).toBe("-1"));
    await waitFor(() => expect(container.querySelectorAll('[role="option"]')[1].getAttribute("tabindex")).toBe("0"));
    // The newly disabled row is skipped by arrow navigation.
    rows()[1].focus();
    fireEvent.keyDown(rows()[1], { key: "ArrowUp" });
    await waitFor(() => expect(document.activeElement?.getAttribute("data-value")).toBe("b"));
    expect(document.activeElement?.getAttribute("data-value")).not.toBe("a");
  });

  it("TileGroup follows a value signal mutated after mount", async () => {
    const value = signal("a");
    const onChange = vi.fn();
    const items = [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ];
    const { container } = render(<TileGroup legend="G" items={items} value={value} onChange={onChange} />);
    const radios = Array.from(container.querySelectorAll<HTMLInputElement>(".st-tileGroup__input"));
    expect(radios[0].checked).toBe(true);
    value.value = "b";
    await waitFor(() =>
      expect(
        Array.from(container.querySelectorAll<HTMLInputElement>(".st-tileGroup__input")).map((el) => el.checked),
      ).toEqual([false, true]),
    );
    fireEvent.click(radios[0]);
    expect(onChange).toHaveBeenLastCalledWith("a");
  });

  it("ContentSwitcher follows a value signal mutated after mount", async () => {
    const value = signal("a");
    const onChange = vi.fn();
    render(
      <ContentSwitcher
        items={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
        value={value}
        onChange={onChange}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[0].getAttribute("aria-pressed")).toBe("true");
    expect(buttons[1].getAttribute("aria-pressed")).toBe("false");
    value.value = "b";
    await waitFor(() => expect(screen.getAllByRole("button")[1].getAttribute("aria-pressed")).toBe("true"));
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onChange).toHaveBeenLastCalledWith("a");
  });

  it("Combobox follows a disabled signal mutated after mount", async () => {
    const disabled = signal(true);
    const { container } = render(<Combobox label="C" options={[{ value: "a", label: "Alpha" }]} disabled={disabled} />);
    expect((container.querySelector(".st-combobox__toggle") as HTMLButtonElement).disabled).toBe(true);
    disabled.value = false;
    await waitFor(() =>
      expect((container.querySelector(".st-combobox__toggle") as HTMLButtonElement).disabled).toBe(false),
    );
  });

  it("Combobox ignores free text unless allowCustomValue is enabled", () => {
    const onChange = vi.fn();
    const allowCustomValue = signal(false);
    const { container } = render(
      <Combobox label="C" options={[{ value: "a", label: "Alpha" }]} allowCustomValue={allowCustomValue} onChange={onChange} />,
    );
    fireEvent.input(container.querySelector(".st-combobox__control") as HTMLInputElement, { target: { value: "zzz" } });
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      allowCustomValue.value = true;
    });
    fireEvent.input(container.querySelector(".st-combobox__control") as HTMLInputElement, { target: { value: "yyy" } });
    expect(onChange).toHaveBeenLastCalledWith("yyy");
  });

  it("DatePicker follows a disabled signal mutated after mount", async () => {
    const disabled = signal(true);
    const { container } = render(<DatePicker label="D" disabled={disabled} />);
    expect((container.querySelector(".st-datepicker__trigger") as HTMLButtonElement).disabled).toBe(true);
    disabled.value = false;
    await waitFor(() =>
      expect((container.querySelector(".st-datepicker__trigger") as HTMLButtonElement).disabled).toBe(false),
    );
  });

  it("TimePicker follows a disabled signal mutated after mount", async () => {
    const disabled = signal(true);
    const { container } = render(<TimePicker label="T" disabled={disabled} />);
    expect((container.querySelector(".st-timepicker__trigger") as HTMLButtonElement).disabled).toBe(true);
    disabled.value = false;
    await waitFor(() =>
      expect((container.querySelector(".st-timepicker__trigger") as HTMLButtonElement).disabled).toBe(false),
    );
  });

  it("TimeRangePicker follows a disabled signal mutated after mount", async () => {
    const disabled = signal(true);
    const { container } = render(<TimeRangePicker label="P" disabled={disabled} />);
    expect((container.querySelector(".st-timeRangePicker__trigger") as HTMLButtonElement).disabled).toBe(true);
    disabled.value = false;
    await waitFor(() =>
      expect((container.querySelector(".st-timeRangePicker__trigger") as HTMLButtonElement).disabled).toBe(false),
    );
  });

  it("RangeSlider follows a disabled signal mutated after mount", async () => {
    const disabled = signal(true);
    const { container } = render(<RangeSlider value={[20, 80]} disabled={disabled} />);
    expect(container.querySelectorAll('[role="slider"]')[0].getAttribute("tabindex")).toBe("-1");
    disabled.value = false;
    await waitFor(() =>
      expect(container.querySelectorAll('[role="slider"]')[0].getAttribute("tabindex")).toBe("0"),
    );
  });

  it("FileUploader follows a disabled signal mutated after mount", async () => {
    const disabled = signal(true);
    const { container } = render(<FileUploader label="F" disabled={disabled} />);
    expect((container.querySelector(".st-fileUploader__trigger") as HTMLButtonElement).disabled).toBe(true);
    disabled.value = false;
    await waitFor(() =>
      expect((container.querySelector(".st-fileUploader__trigger") as HTMLButtonElement).disabled).toBe(false),
    );
  });

  it("TileGroup follows disabled and legendHidden signals mutated after mount", async () => {
    const disabled = signal(true);
    const legendHidden = signal(false);
    const items = [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ];
    const { container } = render(<TileGroup legend="G" items={items} disabled={disabled} legendHidden={legendHidden} />);
    expect((container.querySelector(".st-tileGroup__input") as HTMLInputElement).disabled).toBe(true);
    expect(container.querySelector(".st-tileGroup__legend")?.className).not.toContain("hidden");
    disabled.value = false;
    legendHidden.value = true;
    await waitFor(() =>
      expect((container.querySelector(".st-tileGroup__input") as HTMLInputElement).disabled).toBe(false),
    );
    await waitFor(() =>
      expect(container.querySelector(".st-tileGroup__legend")?.className).toContain("hidden"),
    );
  });

  it("SelectableList follows a multiple signal mutated after mount", async () => {
    const multiple = signal(false);
    const onChange = vi.fn();
    const { container } = render(
      <SelectableList label="L" multiple={multiple} onChange={onChange}>
        <SelectableRow value="a">A</SelectableRow>
        <SelectableRow value="b">B</SelectableRow>
      </SelectableList>,
    );
    expect(container.querySelector('[role="listbox"]')?.getAttribute("aria-multiselectable")).toBeNull();
    multiple.value = true;
    await waitFor(() =>
      expect(container.querySelector('[role="listbox"]')?.getAttribute("aria-multiselectable")).toBe("true"),
    );
    fireEvent.click(screen.getByRole("option", { name: "A" }));
    expect(onChange).toHaveBeenLastCalledWith(["a"]);
  });

  it("NumberInput keeps step buttons usable with disabled={signal(false)} at min", async () => {
    const disabled = signal(false);
    const { container } = render(<NumberInput label="N" value={0} min={0} disabled={disabled} />);
    const buttons = container.querySelectorAll(".st-numberInput__button");
    // At min the decrement stays disabled by the min guard, the increment by
    // the signal (false) stays enabled: the Signal object itself must never
    // win the `disabled || isAtMin` guard.
    expect((buttons[0] as HTMLButtonElement).disabled).toBe(true);
    expect((buttons[1] as HTMLButtonElement).disabled).toBe(false);
    disabled.value = true;
    await waitFor(() => expect((buttons[1] as HTMLButtonElement).disabled).toBe(true));
  });

  it("MenuPopover follows closeOnEscape and closeOnOutside signals mutated after mount", async () => {
    const closeOnEscape = signal(false);
    const closeOnOutside = signal(false);
    render(
      <MenuPopover defaultOpen label="M" closeOnOutside={closeOnOutside} closeOnEscape={closeOnEscape}>
        <span>body</span>
      </MenuPopover>,
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeTruthy();
    act(() => {
      closeOnEscape.value = true;
      closeOnOutside.value = true;
    });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("Calendar follows a range signal mutated after mount", async () => {
    const range = signal(false);
    const { container } = render(<Calendar value="2026-03-10" range={range} />);
    expect(container.querySelector(".st-calendar__day--selected")).toBeTruthy();
    range.value = true;
    await waitFor(() => expect(container.querySelector(".st-calendar__day--selected")).toBeNull());
  });

  it("CheckboxGroup and RadioGroup follow a disabled signal mutated after mount", async () => {
    const disabled = signal(true);
    const { container } = render(
      <>
        <CheckboxGroup legend="G" options={[{ label: "A", value: "a" }]} disabled={disabled} />
        <RadioGroup legend="H" name="h" options={[{ label: "A", value: "a" }]} disabled={disabled} />
      </>,
    );
    for (const fieldset of Array.from(container.querySelectorAll("fieldset"))) {
      expect(fieldset.disabled).toBe(true);
    }
    disabled.value = false;
    await waitFor(() => {
      for (const fieldset of Array.from(container.querySelectorAll("fieldset"))) {
        expect(fieldset.disabled).toBe(false);
      }
    });
  });

  it("MultiSelect follows a disabled signal mutated after mount", async () => {
    const disabled = signal(true);
    const { container } = render(
      <MultiSelect label="M" options={[{ value: "a", label: "Alpha" }]} disabled={disabled} />,
    );
    expect((container.querySelector(".st-multiSelect__trigger") as HTMLButtonElement).disabled).toBe(true);
    disabled.value = false;
    await waitFor(() =>
      expect((container.querySelector(".st-multiSelect__trigger") as HTMLButtonElement).disabled).toBe(false),
    );
  });

  it("Switch and Toggle render defaultChecked signals as unchecked when false", () => {
    const switchDefault = signal(false);
    const toggleDefault = signal(false);
    const { container } = render(
      <>
        <Switch label="S" defaultChecked={switchDefault} />
        <Toggle label="T" defaultChecked={toggleDefault} />
      </>,
    );
    expect(container.querySelector(".st-switch__input")?.getAttribute("aria-checked")).toBe("false");
    expect(container.querySelector(".st-toggle__state")?.textContent).toBe("Off");
  });

  it("a signal holding undefined counts as absent for id and controlled value", async () => {
    const empty = signal(undefined as unknown as string);
    const { container } = render(<Input label="L" id={empty as unknown as string} />);
    const input = container.querySelector(".st-control") as HTMLInputElement;
    expect(input.id).toMatch(/^st-input-/);
    expect(container.querySelector("label")?.getAttribute("for")).toBe(input.id);

    const searchEmpty = signal(undefined as unknown as string);
    const { container: searchContainer } = render(<Search id={searchEmpty as unknown as string} />);
    const searchInput = searchContainer.querySelector(".st-search__input") as HTMLInputElement;
    expect(searchInput.id).toMatch(/^st-search-/);

    const listValue = signal(undefined as unknown as string | null);
    const onChange = vi.fn();
    const { container: listContainer } = render(
      <SelectableList label="L" value={listValue as unknown as string | null} onChange={onChange}>
        <SelectableRow value="a">A</SelectableRow>
      </SelectableList>,
    );
    fireEvent.click(listContainer.querySelector('[role="option"]') as HTMLElement);
    expect(onChange).toHaveBeenLastCalledWith("a");
    expect((listContainer.querySelector('[role="option"]') as HTMLElement).getAttribute("aria-selected")).toBe("true");
  });

  it("Checkbox merges a signal holding undefined without an undefined token", () => {
    const empty = signal(undefined as unknown as string);
    const { container } = render(
      <Checkbox label="C" description="D" aria-describedby={empty as unknown as string} />,
    );
    const describedBy = (container.querySelector(".st-choice__input") as HTMLInputElement).getAttribute("aria-describedby");
    expect(describedBy).not.toContain("undefined");
    expect(describedBy).toContain("-description");
  });

  it("RangeSlider treats a null value as uncontrolled", () => {
    const { container } = render(<RangeSlider min={0} max={100} value={null as unknown as [number, number]} />);
    const thumbs = container.querySelectorAll('[role="slider"]');
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0].getAttribute("aria-valuenow")).toBe("0");
    expect(thumbs[1].getAttribute("aria-valuenow")).toBe("100");
  });

  it("Menu selects a flat leaf and opens a cascade parent", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Menu
        items={[
          { value: "a", label: "A" },
          { value: "p", label: "P", children: [{ value: "c", label: "C" }] },
        ]}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "A" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect((onSelect.mock.calls[0][0] as { value: string }).value).toBe("a");
    fireEvent.click(screen.getByRole("menuitem", { name: "P" }));
    expect(container.querySelectorAll('[role="menu"]')).toHaveLength(2);
    fireEvent.click(screen.getByRole("menuitem", { name: "C" }));
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect((onSelect.mock.calls[1][0] as { value: string }).value).toBe("c");
    expect(onSelect.mock.calls[1][1]).toEqual(["p", "c"]);
  });

  it("MenuPopover opens and closes on Escape and outside pointerdown", async () => {
    const onOpenChange = vi.fn();
    render(
      <MenuPopover defaultOpen label="M" onOpenChange={onOpenChange}>
        <span>body</span>
      </MenuPopover>,
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("ContentSwitcher relays selection with the lowercase alias", () => {
    const onChange = vi.fn();
    render(
      <ContentSwitcher
        items={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
        value="a"
        onchange={onChange}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[0].getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(buttons[1]);
    expect(onChange).toHaveBeenLastCalledWith("b");
  });

  it("FileUploader follows an items signal and removes an item", async () => {
    const items = signal([{ name: "f.txt", size: 2048 }]);
    const onRemoveItem = vi.fn();
    const { container } = render(<FileUploader label="F" items={items} onRemoveItem={onRemoveItem} />);
    expect(container.querySelector(".st-fileUploader__itemName")?.textContent).toBe("f.txt");
    expect(container.querySelector(".st-fileUploader__itemSize")?.textContent).toBe("2.0 KB");
    items.value = [{ name: "f.txt", size: 2048 }, { name: "g.txt", size: 512 }];
    await waitFor(() => expect(container.querySelectorAll(".st-fileUploader__item")).toHaveLength(2));
    fireEvent.click(screen.getByRole("button", { name: "Remove f.txt" }));
    expect(onRemoveItem).toHaveBeenLastCalledWith(0);
  });

  it("Form and FormGroup render status, message, legend and helper", () => {
    const { container } = render(
      <Form status="submitted" message="Done">
        <FormGroup legend="G" helperText="H">
          <span>x</span>
        </FormGroup>
      </Form>,
    );
    expect(container.querySelector(".st-form__message--success")?.textContent).toBe("Done");
    expect(container.querySelector(".st-formGroup__legend")?.textContent).toBe("G");
    expect(container.querySelector(".st-formGroup__help")?.textContent).toBe("H");
  });
});
