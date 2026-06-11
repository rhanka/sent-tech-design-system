import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { ConfigItemCard } from "./ConfigItemCard.js";

afterEach(cleanup);

describe("ConfigItemCard", () => {
  it("renders name, key and description with a stable test id", () => {
    const { container } = render(
      <ConfigItemCard
        item={{
          id: "1",
          name: "Agent de tri",
          key: "triage-agent",
          description: "Classe les demandes entrantes.",
          sourceLevel: "user",
          parentId: null,
        }}
      />,
    );
    const root = container.querySelector(".st-configItemCard")!;
    expect(root.tagName.toLowerCase()).toBe("article");
    expect(root.getAttribute("data-testid")).toBe("config-item-card-triage-agent");
    expect(container.querySelector(".st-configItemCard__name")?.textContent).toBe("Agent de tri");
    expect(container.querySelector(".st-configItemCard__key")?.textContent).toBe("triage-agent");
    expect(container.querySelector(".st-configItemCard__description")?.textContent).toBe(
      "Classe les demandes entrantes.",
    );
  });

  it("shows the système badge for code/admin and personnalisé for copied", () => {
    const { container: c1 } = render(
      <ConfigItemCard item={{ id: "1", name: "Sys", sourceLevel: "code", parentId: null }} />,
    );
    expect(c1.querySelector(".st-configItemCard__badge--system")).toBeTruthy();

    const { container: c2 } = render(
      <ConfigItemCard item={{ id: "2", name: "Copie", sourceLevel: "user", parentId: "1" }} />,
    );
    expect(c2.querySelector(".st-configItemCard__badge--custom")).toBeTruthy();
  });

  it("system item shows only Copier and hides it when hasCopy is true", () => {
    const onCopy = vi.fn();
    const { container, rerender } = render(
      <ConfigItemCard
        item={{ id: "1", name: "Sys", sourceLevel: "admin", parentId: null }}
        onCopy={onCopy}
      />,
    );
    expect(container.querySelector('[aria-label="Copier"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Éditer"]')).toBeFalsy();
    fireEvent.click(container.querySelector('[aria-label="Copier"]')!);
    expect(onCopy).toHaveBeenCalledWith("1");

    rerender(
      <ConfigItemCard
        item={{ id: "1", name: "Sys", sourceLevel: "admin", parentId: null }}
        onCopy={onCopy}
        hasCopy
      />,
    );
    expect(container.querySelector('[aria-label="Copier"]')).toBeFalsy();
  });

  it("copied item exposes Éditer and Réinitialiser, calling back with the id", () => {
    const onEdit = vi.fn();
    const onReset = vi.fn();
    const { container } = render(
      <ConfigItemCard
        item={{ id: "9", name: "Copie", sourceLevel: "user", parentId: "1" }}
        onEdit={onEdit}
        onReset={onReset}
      />,
    );
    fireEvent.click(container.querySelector('[aria-label="Éditer"]')!);
    fireEvent.click(container.querySelector('[aria-label="Réinitialiser"]')!);
    expect(onEdit).toHaveBeenCalledWith("9");
    expect(onReset).toHaveBeenCalledWith("9");
  });

  it("user-created item exposes Éditer and Supprimer (no Réinitialiser)", () => {
    const onDelete = vi.fn();
    const { container } = render(
      <ConfigItemCard
        item={{ id: "3", name: "Perso", sourceLevel: "user", parentId: null }}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );
    expect(container.querySelector('[aria-label="Supprimer"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Réinitialiser"]')).toBeFalsy();
    fireEvent.click(container.querySelector('[aria-label="Supprimer"]')!);
    expect(onDelete).toHaveBeenCalledWith("3");
  });

  it("disables every action button when disabled and renders children", () => {
    const { container } = render(
      <ConfigItemCard
        item={{ id: "3", name: "Perso", sourceLevel: "user", parentId: null }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        disabled
      >
        <span data-testid="extra">extra</span>
      </ConfigItemCard>,
    );
    const buttons = container.querySelectorAll(".st-configItemCard__action");
    expect(buttons.length).toBe(2);
    buttons.forEach((b) => expect((b as HTMLButtonElement).disabled).toBe(true));
    expect(container.querySelector('[data-testid="extra"]')).toBeTruthy();
  });
});
