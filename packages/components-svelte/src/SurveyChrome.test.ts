import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet, tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import Input from "./lib/Input.svelte";
import Stepper from "./lib/Stepper.svelte";
import SurveyNav from "./lib/SurveyNav.svelte";
import SurveyPrivacyNotice from "./lib/SurveyPrivacyNotice.svelte";
import SurveyQuestionCard from "./lib/SurveyQuestionCard.svelte";

const here = dirname(fileURLToPath(import.meta.url));

const snippet = (html: string) =>
  createRawSnippet(() => ({ render: () => html }));

describe("Input — aria-describedby wiring", () => {
  it("links helperText via aria-describedby", () => {
    render(Input, {
      props: {
        label: "Courriel",
        helperText: "Un lien magique sera envoyé."
      }
    });
    const field = screen.getByLabelText("Courriel") as HTMLInputElement;
    const describedBy = field.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const helpEl = document.getElementById(describedBy!);
    expect(helpEl).toBeTruthy();
    expect(helpEl?.textContent).toBe("Un lien magique sera envoyé.");
  });

  it("links errorText via aria-describedby and sets aria-invalid", () => {
    render(Input, {
      props: {
        label: "Courriel",
        helperText: "Aide",
        errorText: "Adresse invalide"
      }
    });
    const field = screen.getByLabelText("Courriel") as HTMLInputElement;
    expect(field.getAttribute("aria-invalid")).toBe("true");
    const describedBy = field.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const errorEl = document.getElementById(describedBy!);
    expect(errorEl).toBeTruthy();
    expect(errorEl?.textContent).toBe("Adresse invalide");
  });

  it("merges consumer-supplied aria-describedby with errorText id", () => {
    render(Input, {
      props: {
        label: "Entreprise",
        "aria-describedby": "external-hint",
        helperText: "Jamais affiché à l'écran"
      }
    });
    const field = screen.getByLabelText("Entreprise") as HTMLInputElement;
    const tokens = (field.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    expect(tokens[0]).toBe("external-hint");
    expect(tokens.length).toBe(2);
    expect(document.getElementById(tokens[1])?.textContent).toBe("Jamais affiché à l'écran");
  });

  it("omits aria-describedby when no help, error or external id is present", () => {
    render(Input, { props: { label: "Nom" } });
    const field = screen.getByLabelText("Nom") as HTMLInputElement;
    expect(field.getAttribute("aria-describedby")).toBeNull();
  });
});

describe("Stepper — compactMobile", () => {
  const steps = [
    { label: "Courriel" },
    { label: "Lien envoyé" },
    { label: "Sondage" },
    { label: "Merci" }
  ];

  it("preserves default classes when compactMobile is unset", () => {
    const { container } = render(Stepper, { props: { steps, current: 2 } });
    const list = container.querySelector("ol.st-stepper") as HTMLElement;
    expect(list.classList.contains("st-stepper--compactMobile")).toBe(false);
  });

  it("adds st-stepper--compactMobile and keeps all step labels accessible to screen readers", () => {
    const { container } = render(Stepper, {
      props: { steps, current: 2, compactMobile: true, label: "Étapes du sondage" }
    });
    const list = container.querySelector("ol.st-stepper") as HTMLElement;
    expect(list.classList.contains("st-stepper--compactMobile")).toBe(true);
    expect(list.getAttribute("aria-label")).toBe("Étapes du sondage");

    const current = container.querySelector('[aria-current="step"]') as HTMLElement;
    expect(current).toBeTruthy();
    expect(current.textContent).toContain("Sondage");
    // All non-current labels stay in the DOM (visually hidden at <=480px, not display:none)
    for (const step of steps) {
      expect(list.textContent).toContain(step.label);
    }
  });

  it("uses a container query at max-width: 25rem (400px) to keep non-current labels visually hidden on phone columns", () => {
    const source = readFileSync(join(here, "lib", "Stepper.svelte"), "utf8");
    expect(source).toContain("container-type: inline-size");
    expect(source).toMatch(/@container\s*\(max-width:\s*25rem\)/);
    expect(source).toContain(".st-stepper--compactMobile");
  });

  it("keeps the final step indicator left-aligned, prevents 0px intrinsic collapse, and enlarges clickable step buttons to >= 44px", async () => {
    const onStepClick = vi.fn();
    const { container } = render(Stepper, {
      props: {
        steps,
        current: steps.length - 1,
        compactMobile: true,
        clickable: true,
        onStepClick
      }
    });

    const current = container.querySelector('[aria-current="step"]') as HTMLElement;
    expect(current).toBeTruthy();
    expect(current.textContent).toContain("Merci");

    const buttons = container.querySelectorAll("button.st-stepper__circle--button");
    expect(buttons).toHaveLength(steps.length);
    await fireEvent.click(buttons[steps.length - 1]);
    expect(onStepClick).toHaveBeenCalledWith(steps.length - 1);

    const source = readFileSync(join(here, "lib", "Stepper.svelte"), "utf8");
    expect(source).toMatch(
      /\.st-stepper--horizontal\s+\.st-stepper__indicator\s*\{[^}]*justify-content:\s*flex-start/s
    );
    expect(source).toMatch(
      /\.st-stepper--compactMobile\.st-stepper--horizontal\s*\{[^}]*width:\s*100%/s
    );
    expect(source).toMatch(
      /\.st-stepper__circle--button\s*\{[^}]*min-height:\s*2\.75rem[^}]*min-width:\s*2\.75rem/s
    );
  });
});

describe("SurveyQuestionCard", () => {
  it("renders question index/total, section tag, optional badge, and children fieldset", () => {
    const { container } = render(SurveyQuestionCard, {
      props: {
        index: 2,
        total: 8,
        sectionTag: "Ouverture — profil",
        required: false,
        optionalLabel: "Optionnel",
        children: snippet("<fieldset><legend>Quel est votre rôle ?</legend></fieldset>")
      }
    });
    expect(container.querySelector(".st-surveyQuestionCard")).toBeTruthy();
    expect(screen.getByText("Question 2 / 8")).toBeTruthy();
    expect(screen.getByText("Ouverture — profil")).toBeTruthy();
    expect(screen.getByText("Optionnel")).toBeTruthy();
    expect(container.querySelector("fieldset legend")?.textContent).toBe("Quel est votre rôle ?");
  });

  it("renders requiredLabel badge when required is true and hides optionalLabel", () => {
    render(SurveyQuestionCard, {
      props: {
        index: 1,
        total: 5,
        required: true,
        requiredLabel: "Obligatoire",
        optionalLabel: "Optionnel",
        children: snippet("<div>Q1</div>")
      }
    });
    expect(screen.getByText("Obligatoire")).toBeTruthy();
    expect(screen.queryByText("Optionnel")).toBeNull();
  });

  it("announces validation error immediately with role=alert", () => {
    const { container } = render(SurveyQuestionCard, {
      props: {
        index: 1,
        total: 8,
        required: true,
        errorText: "Veuillez répondre à la question 1 avant d'envoyer.",
        children: snippet("<div>Q1</div>")
      }
    });
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Veuillez répondre à la question 1 avant d'envoyer.");
    expect(container.querySelector(".st-surveyQuestionCard")?.getAttribute("data-invalid")).toBe(
      "true"
    );
  });

  it("supports optional title heading and headerTrailing snippet", () => {
    render(SurveyQuestionCard, {
      props: {
        index: 3,
        total: 6,
        title: "Outils utilisés",
        headerTrailing: snippet('<span data-testid="timer">29:45</span>'),
        children: snippet("<div>Body</div>")
      }
    });
    expect(screen.getByRole("heading", { name: "Outils utilisés" })).toBeTruthy();
    expect(screen.getByTestId("timer").textContent).toBe("29:45");
  });

  it("adapts card padding via container query from 1rem to 1.5rem at 25rem and keeps AA contrast on inline errors", () => {
    const source = readFileSync(join(here, "lib", "SurveyQuestionCard.svelte"), "utf8");
    expect(source).toContain("container-type: inline-size");
    expect(source).toMatch(/@container\s*\(min-width:\s*25rem\)/);
    expect(source).toContain("var(--st-spacing-6, 1.5rem)");
    expect(source).toMatch(
      /\.st-surveyQuestionCard__error\s*\{[^}]*color:\s*var\(--st-semantic-text-primary/s
    );
    expect(source).not.toContain("0.0625rem");
  });
});

describe("SurveyNav", () => {
  it("renders Previous and Next as >=44px lg buttons and never auto-submits", async () => {
    const onprevious = vi.fn();
    const onnext = vi.fn();
    const onsubmit = vi.fn();
    const onpartialsubmit = vi.fn();

    render(SurveyNav, {
      props: {
        canGoPrevious: true,
        isLast: false,
        previousLabel: "Précédent",
        nextLabel: "Suivant",
        onprevious,
        onnext,
        onsubmit,
        onpartialsubmit
      }
    });

    const prev = screen.getByRole("button", { name: "Précédent" }) as HTMLButtonElement;
    const next = screen.getByRole("button", { name: "Suivant" }) as HTMLButtonElement;
    expect(prev.classList.contains("st-button--lg")).toBe(true);
    expect(next.classList.contains("st-button--lg")).toBe(true);
    expect(prev.type).toBe("button");
    expect(next.type).toBe("button");

    await fireEvent.click(prev);
    await fireEvent.click(next);
    expect(onprevious).toHaveBeenCalledTimes(1);
    expect(onnext).toHaveBeenCalledTimes(1);
    expect(onsubmit).not.toHaveBeenCalled();
    expect(onpartialsubmit).not.toHaveBeenCalled();
  });

  it("renders explicit final submit CTA when isLast is true", async () => {
    const onsubmit = vi.fn();
    render(SurveyNav, {
      props: {
        canGoPrevious: true,
        isLast: true,
        submitLabel: "Envoyer mes réponses",
        onsubmit
      }
    });

    const submitBtn = screen.getByRole("button", {
      name: "Envoyer mes réponses"
    }) as HTMLButtonElement;
    expect(submitBtn.type).toBe("button");
    expect(submitBtn.classList.contains("st-button--lg")).toBe(true);
    expect(onsubmit).not.toHaveBeenCalled();

    await fireEvent.click(submitBtn);
    expect(onsubmit).toHaveBeenCalledTimes(1);
  });

  it("requires confirmation Modal before firing onpartialsubmit", async () => {
    const onpartialsubmit = vi.fn();
    render(SurveyNav, {
      props: {
        isLast: false,
        allowPartialSubmit: true,
        answeredCount: 3,
        totalQuestions: 8,
        partialSubmitLabel: "Envoyer seulement celles-ci (3/8)",
        partialConfirmTitle: "Confirmer l'envoi partiel",
        partialConfirmDescription: "Vos 3 réponses enregistrées seront envoyées.",
        partialConfirmLabel: "Confirmer l'envoi",
        partialCancelLabel: "Continuer le sondage",
        onpartialsubmit
      }
    });

    const trigger = screen.getByRole("button", {
      name: "Envoyer seulement celles-ci (3/8)"
    }) as HTMLButtonElement;
    expect(trigger.classList.contains("st-button--lg")).toBe(true);

    // First click opens modal — must NOT submit yet
    trigger.focus();
    await fireEvent.click(trigger);
    await tick();
    expect(onpartialsubmit).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: "Confirmer l'envoi partiel" });
    expect(dialog).toBeTruthy();
    expect(dialog.classList.contains("st-surveyNav__modal")).toBe(true);
    expect(dialog.contains(document.activeElement)).toBe(true);

    // Cancel closes modal without submitting and restores focus to the trigger
    const cancelBtn = screen.getByRole("button", { name: "Continuer le sondage" });
    cancelBtn.focus();
    await fireEvent.click(cancelBtn);
    await tick();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onpartialsubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);

    // Re-open and explicitly confirm; focus returns to trigger if consumer stays on page
    trigger.focus();
    await fireEvent.click(trigger);
    await tick();
    const confirmBtn = screen.getByRole("button", { name: "Confirmer l'envoi" });
    confirmBtn.focus();
    await fireEvent.click(confirmBtn);
    await tick();
    expect(onpartialsubmit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("enforces >= 44px close button on the partial-submit modal and @container support on stickyMobile", () => {
    const source = readFileSync(join(here, "lib", "SurveyNav.svelte"), "utf8");
    expect(source).toMatch(
      /\.st-surveyNav__modal\s+\.st-modal__close\)\s*\{[^}]*min-height:\s*2\.75rem[^}]*min-width:\s*2\.75rem/s
    );
    expect(source).toMatch(/@container\s*\(max-width:\s*25rem\)/);
    expect(source).toMatch(/@container\s*\(max-width:\s*25rem\)\s*\{[\s\S]*\.st-surveyNav--stickyMobile/);
  });

  it("renders optional leave ghost button and supports stickyMobile safe-area padding", async () => {
    const onleave = vi.fn();
    const { container } = render(SurveyNav, {
      props: {
        canGoPrevious: false,
        leaveLabel: "Quitter",
        stickyMobile: true,
        onleave
      }
    });

    expect(screen.queryByRole("button", { name: "Previous" })).toBeNull();
    const leaveBtn = screen.getByRole("button", { name: "Quitter" }) as HTMLButtonElement;
    expect(leaveBtn.classList.contains("st-button--ghost")).toBe(true);
    expect(leaveBtn.classList.contains("st-button--lg")).toBe(true);
    await fireEvent.click(leaveBtn);
    expect(onleave).toHaveBeenCalledTimes(1);

    expect(container.querySelector(".st-surveyNav--stickyMobile")).toBeTruthy();
    const source = readFileSync(join(here, "lib", "SurveyNav.svelte"), "utf8");
    expect(source).toContain("safe-area-inset-bottom");
  });
});

describe("SurveyPrivacyNotice", () => {
  const rules = [
    "Lien magique sans 2FA forcé.",
    "Brouillon local conservé 30 minutes.",
    "Cellules inférieures à 5 masquées."
  ];

  it("renders expanded Card with heading, summary badge, named landmark, and UnorderedList in card mode", () => {
    const { container } = render(SurveyPrivacyNotice, {
      props: {
        title: "Confidentialité et anonymat",
        summaryBadge: "Anonyme · < 5 masqué",
        items: rules,
        mode: "card",
        sticky: true
      }
    });

    const aside = screen.getByRole("complementary", { name: "Confidentialité et anonymat" });
    expect(aside).toBeTruthy();
    expect(container.querySelector(".st-surveyPrivacy--sticky")).toBeTruthy();
    expect(screen.getByText("Confidentialité et anonymat")).toBeTruthy();
    expect(screen.getByText("Anonyme · < 5 masqué")).toBeTruthy();
    for (const rule of rules) {
      expect(screen.getByText(rule)).toBeTruthy();
    }
    expect(container.querySelector(".st-collapsible")).toBeNull();
  });

  it("renders Collapsible disclosure in collapsible mode and expands on click", async () => {
    const { container } = render(SurveyPrivacyNotice, {
      props: {
        title: "Confidentialité et anonymat",
        summaryBadge: "Anonyme",
        items: rules,
        mode: "collapsible"
      }
    });

    const trigger = container.querySelector(".st-collapsible__trigger") as HTMLButtonElement;
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByText("Anonyme")).toBeTruthy();
    expect(screen.queryByText(rules[0])).toBeNull();

    await fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    for (const rule of rules) {
      expect(screen.getByText(rule)).toBeTruthy();
    }
  });

  it("observes parent layout width (not 300px side-rail <aside> width) and keeps Card + sticky at 820/1280px", async () => {
    let observerCallback: ResizeObserverCallback | undefined;
    let observedTarget: Element | undefined;
    const OriginalResizeObserver = globalThis.ResizeObserver;
    class MockResizeObserver {
      constructor(cb: ResizeObserverCallback) {
        observerCallback = cb;
      }
      observe(target: Element) {
        observedTarget = target;
      }
      unobserve() {}
      disconnect() {}
    }
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

    const host = document.createElement("div");
    document.body.appendChild(host);
    vi.spyOn(host, "getBoundingClientRect").mockReturnValue({ width: 820 } as DOMRect);

    try {
      const { container } = render(SurveyPrivacyNotice, {
        target: host,
        props: {
          title: "Confidentialité",
          summaryBadge: "Anonyme",
          items: rules,
          mode: "auto",
          sticky: true
        }
      });

      const root = container.querySelector(".st-surveyPrivacy") as HTMLElement;
      expect(root).toBeTruthy();
      vi.spyOn(root, "getBoundingClientRect").mockReturnValue({ width: 300 } as DOMRect);

      await tick();
      // Must observe the parent layout container, NOT <aside>'s own 300px rail
      expect(observedTarget).toBe(host);
      expect(container.querySelector(".st-collapsible__trigger")).toBeNull();
      expect(root.classList.contains("st-surveyPrivacy--sticky")).toBe(true);
      expect(screen.getAllByText(rules[0])).toHaveLength(1);

      // Simulate 390px phone layout container
      observerCallback?.(
        [{ target: host, contentRect: { width: 390 } } as unknown as ResizeObserverEntry],
        {} as ResizeObserver
      );
      await tick();
      expect(container.querySelector(".st-collapsible__trigger")).toBeTruthy();
      expect(root.classList.contains("st-surveyPrivacy--sticky")).toBe(false);
      expect(screen.queryByText(rules[0])).toBeNull();

      // Simulate 1280px desktop layout while <aside> remains 300px side rail
      observerCallback?.(
        [{ target: host, contentRect: { width: 1280 } } as unknown as ResizeObserverEntry],
        {} as ResizeObserver
      );
      await tick();
      expect(container.querySelector(".st-collapsible__trigger")).toBeNull();
      expect(root.classList.contains("st-surveyPrivacy--sticky")).toBe(true);
      expect(screen.getAllByText(rules[0])).toHaveLength(1);
    } finally {
      globalThis.ResizeObserver = OriginalResizeObserver;
      host.remove();
    }
  });

  it("renders Collapsible immediately on a 390px viewport before ResizeObserver fires (no Card->Collapsible flash)", () => {
    const originalWidth = window.innerWidth;
    const OriginalResizeObserver = globalThis.ResizeObserver;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    globalThis.ResizeObserver = undefined as unknown as typeof ResizeObserver;

    try {
      const { container } = render(SurveyPrivacyNotice, {
        props: {
          title: "Confidentialité",
          summaryBadge: "Anonyme",
          items: rules,
          mode: "auto",
          sticky: true
        }
      });

      expect(container.querySelector(".st-collapsible__trigger")).toBeTruthy();
      expect(container.querySelector(".st-surveyPrivacy--sticky")).toBeNull();
    } finally {
      Object.defineProperty(window, "innerWidth", { configurable: true, value: originalWidth });
      globalThis.ResizeObserver = OriginalResizeObserver;
    }
  });

  it("enforces >= 44px touch target on the collapsible trigger", () => {
    const source = readFileSync(join(here, "lib", "SurveyPrivacyNotice.svelte"), "utf8");
    expect(source).toContain("2.75rem");
  });
});
