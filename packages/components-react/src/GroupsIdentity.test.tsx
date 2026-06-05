import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  Avatar,
  AvatarGroup,
  ButtonGroup,
  Button,
  CheckboxGroup,
  RadioGroup,
  Typography,
  Collapsible,
  Stepper,
} from "./index.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("Avatar", () => {
  it("renders derived initials when no src is provided", () => {
    render(<Avatar name="Ada Lovelace" />);
    const avatar = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(avatar.textContent).toBe("AL");
    expect(avatar.querySelector("img")).toBeNull();
  });

  it("renders an image when src is provided", () => {
    const { container } = render(<Avatar name="Ada Lovelace" src="/ada.png" alt="Portrait" />);
    const avatar = container.querySelector(".st-avatar") as HTMLElement;
    expect(avatar.getAttribute("aria-label")).toBe("Portrait");
    const img = avatar.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("/ada.png");
    expect(avatar.querySelector(".st-avatar__initials")).toBeNull();
  });
});

describe("AvatarGroup", () => {
  it("renders a +N overflow token when total exceeds max", () => {
    render(
      <AvatarGroup max={2} total={5}>
        <Avatar name="A B" />
        <Avatar name="C D" />
      </AvatarGroup>,
    );
    expect(screen.getByLabelText("+3").textContent).toBe("+3");
  });

  it("renders no overflow token when total is within max", () => {
    const { container } = render(
      <AvatarGroup max={3} total={2}>
        <Avatar name="A B" />
        <Avatar name="C D" />
      </AvatarGroup>,
    );
    expect(container.querySelector(".st-avatarGroup__overflow")).toBeNull();
  });
});

describe("ButtonGroup", () => {
  it("exposes role=group with the provided label", () => {
    render(
      <ButtonGroup label="Actions">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "Actions" });
    expect(group).toBeTruthy();
    expect(group.classList.contains("st-buttonGroup")).toBe(true);
  });
});

describe("CheckboxGroup", () => {
  it("calls onChange with the next selection when a box is toggled", () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        legend="Toppings"
        name="toppings"
        value={["a"]}
        onChange={onChange}
        options={[
          { label: "Anchovies", value: "a" },
          { label: "Basil", value: "b" },
        ]}
      />,
    );
    fireEvent.click(screen.getByLabelText("Basil"));
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
    // Unchecking an already-selected value removes it.
    onChange.mockClear();
    fireEvent.click(screen.getByLabelText("Anchovies"));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

describe("RadioGroup", () => {
  it("emits the selected value and enforces exclusivity", () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        legend="Size"
        name="size"
        value="sm"
        onChange={onChange}
        options={[
          { label: "Small", value: "sm" },
          { label: "Large", value: "lg" },
        ]}
      />,
    );
    const small = screen.getByLabelText("Small") as HTMLInputElement;
    const large = screen.getByLabelText("Large") as HTMLInputElement;
    expect(small.checked).toBe(true);
    expect(large.checked).toBe(false);
    fireEvent.click(large);
    expect(onChange).toHaveBeenCalledWith("lg");
  });
});

describe("Typography", () => {
  it("maps a variant to its default tag", () => {
    const { container } = render(<Typography variant="h2">Title</Typography>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("H2");
    expect(el.classList.contains("st-typography--h2")).toBe(true);
  });

  it("honours the as override and truncate flag", () => {
    const { container } = render(
      <Typography variant="body" as="span" truncate>
        Long text
      </Typography>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("SPAN");
    expect(el.classList.contains("st-typography--truncate")).toBe(true);
  });
});

describe("Collapsible", () => {
  it("toggles aria-expanded and reveals the region", () => {
    const onToggle = vi.fn();
    render(
      <Collapsible title="Details" onToggle={onToggle}>
        Hidden content
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Details" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("region")).toBeNull();
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(onToggle).toHaveBeenCalledWith(true);
    const region = screen.getByRole("region");
    expect(region.getAttribute("aria-labelledby")).toBe(trigger.id);
    expect(trigger.getAttribute("aria-controls")).toBe(region.id);
  });
});

describe("Stepper", () => {
  it("marks the current step with aria-current=step", () => {
    render(
      <Stepper
        current={1}
        steps={[{ label: "One" }, { label: "Two" }, { label: "Three" }]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0].getAttribute("aria-current")).toBeNull();
    expect(items[1].getAttribute("aria-current")).toBe("step");
    expect(items[2].getAttribute("aria-current")).toBeNull();
  });

  it("invokes onStepClick when clickable", () => {
    const onStepClick = vi.fn();
    render(
      <Stepper
        current={1}
        clickable
        onStepClick={onStepClick}
        steps={[{ label: "One" }, { label: "Two" }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "One" }));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });
});
