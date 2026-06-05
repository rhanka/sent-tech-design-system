import { fireEvent, render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import Avatar from "./lib/Avatar.svelte";
import AvatarGroup from "./lib/AvatarGroup.svelte";
import ButtonGroup from "./lib/ButtonGroup.svelte";
import CheckboxGroup from "./lib/CheckboxGroup.svelte";
import RadioGroup from "./lib/RadioGroup.svelte";
import Typography from "./lib/Typography.svelte";
import Collapsible from "./lib/Collapsible.svelte";
import Stepper from "./lib/Stepper.svelte";

const text = (value: string) =>
  createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe("Avatar", () => {
  it("renders initials when no src is provided", () => {
    const { container } = render(Avatar, { props: { name: "Ada Lovelace" } });
    const root = container.querySelector(".st-avatar") as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.getAttribute("role")).toBe("img");
    expect(root.getAttribute("aria-label")).toBe("Ada Lovelace");
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".st-avatar__initials")?.textContent).toBe("AL");
  });

  it("renders an img when src is provided", () => {
    const { container } = render(Avatar, {
      props: { name: "Ada Lovelace", src: "https://example.com/a.png" }
    });
    const img = container.querySelector("img.st-avatar__image") as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute("alt")).toBe("Ada Lovelace");
    expect(container.querySelector(".st-avatar__initials")).toBeNull();
  });
});

describe("AvatarGroup", () => {
  it("shows a +N overflow token when total exceeds max", () => {
    const { container } = render(AvatarGroup, {
      props: { max: 3, total: 7, children: text("avatars") }
    });
    const overflow = container.querySelector(".st-avatarGroup__overflow") as HTMLElement;
    expect(overflow).toBeTruthy();
    expect(overflow.textContent).toBe("+4");
  });

  it("hides the overflow token when total fits within max", () => {
    const { container } = render(AvatarGroup, {
      props: { max: 5, total: 2, children: text("avatars") }
    });
    expect(container.querySelector(".st-avatarGroup__overflow")).toBeNull();
  });
});

describe("ButtonGroup", () => {
  it("exposes role=group", () => {
    const { getByRole } = render(ButtonGroup, {
      props: { label: "Actions", children: text("buttons") }
    });
    const group = getByRole("group", { name: "Actions" });
    expect(group).toBeTruthy();
    expect(group.classList.contains("st-buttonGroup--horizontal")).toBe(true);
  });
});

describe("CheckboxGroup", () => {
  it("adds and removes values via onchange", async () => {
    const onchange = vi.fn();
    const { getByLabelText, rerender } = render(CheckboxGroup, {
      props: {
        legend: "Préférences",
        name: "prefs",
        value: [],
        onchange,
        options: [
          { label: "Email", value: "email" },
          { label: "SMS", value: "sms" }
        ]
      }
    });

    await fireEvent.click(getByLabelText("Email"));
    expect(onchange).toHaveBeenLastCalledWith(["email"]);

    // Simulate the controlled update, then untick.
    await rerender({
      legend: "Préférences",
      name: "prefs",
      value: ["email"],
      onchange,
      options: [
        { label: "Email", value: "email" },
        { label: "SMS", value: "sms" }
      ]
    });
    await fireEvent.click(getByLabelText("Email"));
    expect(onchange).toHaveBeenLastCalledWith([]);
  });
});

describe("RadioGroup", () => {
  it("enforces exclusivity through a shared name and reports the selected value", async () => {
    const onchange = vi.fn();
    const { getByLabelText, container } = render(RadioGroup, {
      props: {
        legend: "Plan",
        name: "plan",
        value: "free",
        onchange,
        options: [
          { label: "Gratuit", value: "free" },
          { label: "Pro", value: "pro" }
        ]
      }
    });

    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    expect(inputs.length).toBe(2);
    inputs.forEach((input) => expect(input.getAttribute("name")).toBe("plan"));

    await fireEvent.click(getByLabelText("Pro"));
    expect(onchange).toHaveBeenLastCalledWith("pro");
  });
});

describe("Typography", () => {
  it("maps variant to its default tag and applies the variant class", () => {
    const { container } = render(Typography, {
      props: { variant: "h2", children: text("Titre") }
    });
    const el = container.querySelector("h2.st-typography") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.classList.contains("st-typography--h2")).toBe(true);
  });

  it("applies the truncate modifier class", () => {
    const { container } = render(Typography, {
      props: { variant: "body", truncate: true, children: text("Long text") }
    });
    const el = container.querySelector(".st-typography") as HTMLElement;
    expect(el.classList.contains("st-typography--truncate")).toBe(true);
  });
});

describe("Collapsible", () => {
  it("toggles aria-expanded and reveals the region", async () => {
    const onToggle = vi.fn();
    const { getByRole, queryByRole } = render(Collapsible, {
      props: { title: "Détails", onToggle, children: text("contenu") }
    });
    const trigger = getByRole("button", { name: "Détails" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(queryByRole("region")).toBeNull();

    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(onToggle).toHaveBeenLastCalledWith(true);
    expect(queryByRole("region")).toBeTruthy();
  });
});

describe("Stepper", () => {
  it("marks the current step with aria-current=step", () => {
    const { container } = render(Stepper, {
      props: {
        current: 1,
        steps: [{ label: "Un" }, { label: "Deux" }, { label: "Trois" }]
      }
    });
    const current = container.querySelector('[aria-current="step"]') as HTMLElement;
    expect(current).toBeTruthy();
    expect(current.classList.contains("st-stepper__step--current")).toBe(true);
    expect(current.textContent).toContain("Deux");
  });

  it("calls onStepClick when clickable", async () => {
    const onStepClick = vi.fn();
    const { getByRole } = render(Stepper, {
      props: {
        current: 2,
        clickable: true,
        onStepClick,
        steps: [{ label: "Un" }, { label: "Deux" }, { label: "Trois" }]
      }
    });
    await fireEvent.click(getByRole("button", { name: "Un" }));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });
});
