import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import ConfigItemCard from "./lib/ConfigItemCard.svelte";

describe("ConfigItemCard", () => {
  it("renders name, key and description with a stable test id", () => {
    const { container } = render(ConfigItemCard, {
      props: {
        item: {
          id: "1",
          name: "Agent de tri",
          key: "triage-agent",
          description: "Classe les demandes entrantes.",
          sourceLevel: "user",
          parentId: null,
        },
      },
    });
    const root = container.querySelector(".st-configItemCard");
    expect(root).toBeTruthy();
    expect(root?.tagName.toLowerCase()).toBe("article");
    expect(root?.getAttribute("data-testid")).toBe("config-item-card-triage-agent");
    expect(screen.getByText("Agent de tri")).toBeTruthy();
    expect(screen.getByText("triage-agent")).toBeTruthy();
    expect(screen.getByText("Classe les demandes entrantes.")).toBeTruthy();
  });

  it("shows the système badge for code/admin source levels", () => {
    const { container } = render(ConfigItemCard, {
      props: { item: { id: "1", name: "Défaut", sourceLevel: "code", parentId: null } },
    });
    expect(container.querySelector(".st-configItemCard__badge--system")).toBeTruthy();
    expect(container.querySelector(".st-configItemCard__badge--custom")).toBeFalsy();
  });

  it("shows the personnalisé badge for a copied (user + parentId) item", () => {
    const { container } = render(ConfigItemCard, {
      props: { item: { id: "2", name: "Copie", sourceLevel: "user", parentId: "1" } },
    });
    expect(container.querySelector(".st-configItemCard__badge--custom")).toBeTruthy();
    expect(container.querySelector(".st-configItemCard__badge--system")).toBeFalsy();
  });

  it("system item shows only Copier, and hides it when hasCopy is true", () => {
    const onCopy = vi.fn();
    const { container, rerender } = render(ConfigItemCard, {
      props: {
        item: { id: "1", name: "Sys", sourceLevel: "admin", parentId: null },
        onCopy,
      },
    });
    const copyBtn = container.querySelector('[aria-label="Copier"]');
    expect(copyBtn).toBeTruthy();
    expect(container.querySelector('[aria-label="Éditer"]')).toBeFalsy();

    rerender({
      item: { id: "1", name: "Sys", sourceLevel: "admin", parentId: null },
      onCopy,
      hasCopy: true,
    });
    expect(container.querySelector('[aria-label="Copier"]')).toBeFalsy();
  });

  it("copied item exposes Éditer and Réinitialiser, calling back with the id", async () => {
    const onEdit = vi.fn();
    const onReset = vi.fn();
    const { container } = render(ConfigItemCard, {
      props: {
        item: { id: "9", name: "Copie", sourceLevel: "user", parentId: "1" },
        onEdit,
        onReset,
      },
    });
    const edit = container.querySelector('[aria-label="Éditer"]') as HTMLButtonElement;
    const reset = container.querySelector('[aria-label="Réinitialiser"]') as HTMLButtonElement;
    expect(edit).toBeTruthy();
    expect(reset).toBeTruthy();
    edit.click();
    reset.click();
    expect(onEdit).toHaveBeenCalledWith("9");
    expect(onReset).toHaveBeenCalledWith("9");
  });

  it("user-created item exposes Éditer and Supprimer (no Réinitialiser)", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const { container } = render(ConfigItemCard, {
      props: {
        item: { id: "3", name: "Perso", sourceLevel: "user", parentId: null },
        onEdit,
        onDelete,
      },
    });
    expect(container.querySelector('[aria-label="Supprimer"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Éditer"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Réinitialiser"]')).toBeFalsy();
    (container.querySelector('[aria-label="Supprimer"]') as HTMLButtonElement).click();
    expect(onDelete).toHaveBeenCalledWith("3");
  });

  it("disables every action button when disabled", () => {
    const { container } = render(ConfigItemCard, {
      props: {
        item: { id: "3", name: "Perso", sourceLevel: "user", parentId: null },
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        disabled: true,
      },
    });
    const buttons = container.querySelectorAll(".st-configItemCard__action");
    expect(buttons.length).toBe(2);
    buttons.forEach((b) => expect((b as HTMLButtonElement).disabled).toBe(true));
  });
});
