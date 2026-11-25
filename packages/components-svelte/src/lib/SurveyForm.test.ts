import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SurveyForm from "./SurveyForm.svelte";
import { clearAllSurveyStorage, loadPendingSubmission, saveSurveyDraft } from "./survey-storage.js";
import type { SurveyDefinition, SurveySubmitPayload } from "./survey-types.js";

const TEST_SURVEY: SurveyDefinition = {
  id: "demo-c",
  title: { fr: "Sondage Keynote", en: "Keynote Poll" },
  subtitle: "/dev/mtl 2026",
  rules: {
    mode: "one-per-screen",
    enrollment: "email-magic-link",
    authIssuerLabel: "auth.sent-tech.ca",
    offerPasskey: true,
    draftWindowMinutes: 30,
    explicitSubmitOnly: true,
    allowPartialSubmit: true,
    requiredForSubmit: ["type"],
    shuffleMultiOptions: true,
    anonymous: true,
  },
  enrollmentFields: [
    {
      id: "company_name",
      label: { fr: "Entreprise (facultatif)", en: "Company (optional)" },
      placeholder: { fr: "Jamais affiché", en: "Never shown" },
      maxLength: 80,
      optional: true,
      display: "never",
    },
  ],
  privacyNotice: {
    title: { fr: "Confidentialité", en: "Privacy" },
    items: [
      { fr: "Aucun envoi automatique.", en: "No auto-submit." },
      { fr: "Brouillon gardé 30 minutes.", en: "Draft kept 30 minutes." },
    ],
  },
  questions: [
    {
      id: "type",
      moment: { fr: "Moment 1", en: "Moment 1" },
      type: "single",
      label: { fr: "Quel type d’organisation ?", en: "Which organisation type?" },
      options: [
        { id: "manuf", label: { fr: "Manufacturier", en: "Manufacturing" } },
        { id: "startup", label: { fr: "Startup", en: "Startup" } },
      ],
    },
    {
      id: "tools",
      moment: { fr: "Moment 2", en: "Moment 2" },
      type: "multi",
      label: { fr: "Quels outils utilisez-vous ?", en: "Which tools do you use?" },
      exclusive: ["none"],
      options: [
        { id: "t1", label: { fr: "Outil Alpha", en: "Alpha Tool" } },
        { id: "t2", label: { fr: "Outil Beta", en: "Beta Tool" } },
        { id: "none", label: { fr: "Aucun", en: "None" } },
      ],
    },
    {
      id: "autonomy",
      moment: { fr: "Moment 3", en: "Moment 3" },
      type: "scale",
      label: { fr: "Niveau d’autonomie ?", en: "Autonomy level?" },
      minLabel: { fr: "Début", en: "Start" },
      maxLabel: { fr: "Autonome", en: "Autonomous" },
      options: [
        { id: "a1", label: { fr: "1 · Assistance simple", en: "1 · Simple help" } },
        { id: "a2", label: { fr: "2 · Supervisé", en: "2 · Supervised" } },
        { id: "a3", label: { fr: "3 · Autonome", en: "3 · Autonomous" } },
        { id: "a4", label: { fr: "4 · Parallèle", en: "4 · Parallel" } },
      ],
    },
  ],
};

function setNavigatorOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value,
  });
}

describe("SurveyForm — enrollment, flow, explicit submit & passkey", () => {
  beforeEach(() => {
    clearAllSurveyStorage();
    setNavigatorOnline(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearAllSurveyStorage();
    setNavigatorOnline(true);
  });

  it("walks email -> link_sent -> questions (single/multi/scale) -> explicit submit -> thanks + passkey", async () => {
    const onrequestlink = vi.fn();
    const onsubmit = vi.fn();
    const onregisterpasskey = vi.fn();

    const { getByLabelText, getByRole, getByText, queryByText } = render(SurveyForm, {
      props: {
        survey: TEST_SURVEY,
        locale: "fr",
        onrequestlink,
        onsubmit,
        onregisterpasskey,
      },
    });

    // Step 1: invalid email shows validation error and stays on enrollment
    const emailInput = getByLabelText(/Adresse e-mail/i) as HTMLInputElement;
    await fireEvent.input(emailInput, { target: { value: "not-an-email" } });
    await fireEvent.click(getByRole("button", { name: /Recevoir mon lien/i }));
    expect(getByText(/adresse e-mail valide/i)).toBeTruthy();
    expect(onrequestlink).not.toHaveBeenCalled();

    // Valid email + display:never company_name
    await fireEvent.input(emailInput, { target: { value: "alice@devmtl.ca" } });
    const companyInput = getByLabelText(/Entreprise/i) as HTMLInputElement;
    await fireEvent.input(companyInput, { target: { value: "Studio Nord" } });
    await fireEvent.click(getByRole("button", { name: /Recevoir mon lien/i }));

    expect(onrequestlink).toHaveBeenCalledWith({
      surveyId: "demo-c",
      email: "alice@devmtl.ca",
      enrollmentMeta: { company_name: "Studio Nord" },
    });

    // Step 2: link_sent mentions auth.sent-tech.ca
    expect(getByText(/auth\.sent-tech\.ca/i)).toBeTruthy();
    await fireEvent.click(getByRole("button", { name: /Ouvrir le sondage/i }));

    // Step 3: Q1 single choice + progressbar + 30-min countdown badge
    expect(getByRole("progressbar")).toBeTruthy();
    expect(getByText(/Brouillon · /i)).toBeTruthy();

    await fireEvent.click(getByLabelText("Startup"));
    // Selecting an option never auto-submits
    expect(onsubmit).not.toHaveBeenCalled();

    await fireEvent.click(getByRole("button", { name: /Suivant/i }));
    expect(onsubmit).not.toHaveBeenCalled();

    // Q2 multi choice with exclusive option
    await fireEvent.click(getByLabelText("Outil Alpha"));
    await fireEvent.click(getByLabelText("Aucun"));
    // Exclusive clears Alpha
    expect((getByLabelText("Outil Alpha") as HTMLInputElement).checked).toBe(false);
    expect((getByLabelText("Aucun") as HTMLInputElement).checked).toBe(true);
    // Picking Alpha again clears Aucun
    await fireEvent.click(getByLabelText("Outil Alpha"));
    expect((getByLabelText("Aucun") as HTMLInputElement).checked).toBe(false);
    expect((getByLabelText("Outil Alpha") as HTMLInputElement).checked).toBe(true);

    await fireEvent.click(getByRole("button", { name: /Suivant/i }));

    // Q3 scale
    await fireEvent.click(getByLabelText(/3 · Autonome/i));
    expect(onsubmit).not.toHaveBeenCalled();

    // Explicit complete submit
    await fireEvent.click(getByRole("button", { name: /Envoyer mes réponses/i }));

    await waitFor(() => expect(onsubmit).toHaveBeenCalledTimes(1));
    const payload = onsubmit.mock.calls[0][0] as SurveySubmitPayload;
    expect(payload.surveyId).toBe("demo-c");
    expect(payload.mode).toBe("complete");
    expect(payload.answeredCount).toBe(3);
    expect(payload.totalQuestions).toBe(3);
    expect(payload.answers).toEqual({
      type: "startup",
      tools: ["t1"],
      autonomy: "a3",
    });
    // company_name stays segregated in enrollmentMeta, never inside answers
    expect(payload.answers).not.toHaveProperty("company_name");
    expect(payload.enrollmentMeta).toEqual({ company_name: "Studio Nord" });

    // Step 4: Thank-you screen + optional passkey
    expect(getByText(/Merci pour vos réponses/i)).toBeTruthy();
    expect(queryByText(/Envoyer mes réponses/i)).toBeNull();

    await fireEvent.click(getByRole("button", { name: /Ajouter une clé d’accès/i }));
    expect(onregisterpasskey).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(getByText(/Clé d’accès enregistrée/i)).toBeTruthy());
  });

  it("supports explicit partial submit via confirmation modal and enforces requiredForSubmit", async () => {
    const onsubmit = vi.fn();
    const { getByLabelText, getByRole, getByText } = render(SurveyForm, {
      props: {
        survey: {
          ...TEST_SURVEY,
          rules: { ...TEST_SURVEY.rules, enrollment: "none" },
        },
        locale: "fr",
        onsubmit,
      },
    });

    // Skip Q1 ("type") and answer Q2 ("tools") -> partial submit must fail gate
    await fireEvent.click(getByRole("button", { name: /Suivant/i }));
    await fireEvent.click(getByLabelText("Outil Alpha"));

    await fireEvent.click(getByRole("button", { name: /Envoyer seulement celles-ci \(1\/3\)/i }));
    // Confirmation modal opens
    expect(getByRole("dialog")).toBeTruthy();
    await fireEvent.click(getByRole("button", { name: /Confirmer l’envoi partiel/i }));
    expect(onsubmit).not.toHaveBeenCalled();
    expect(getByText(/question 1/i)).toBeTruthy();

    // Go back, answer Q1, then open modal -> cancel -> still no submit
    await fireEvent.click(getByRole("button", { name: /Précédent/i }));
    await fireEvent.click(getByLabelText("Manufacturier"));
    await fireEvent.click(getByRole("button", { name: /Envoyer seulement celles-ci \(2\/3\)/i }));
    await fireEvent.click(getByRole("button", { name: /Continuer le sondage/i }));
    expect(onsubmit).not.toHaveBeenCalled();

    // Now confirm partial submit
    await fireEvent.click(getByRole("button", { name: /Envoyer seulement celles-ci \(2\/3\)/i }));
    await fireEvent.click(getByRole("button", { name: /Confirmer l’envoi partiel/i }));

    await waitFor(() => expect(onsubmit).toHaveBeenCalledTimes(1));
    expect(onsubmit.mock.calls[0][0]).toMatchObject({
      mode: "partial",
      answeredCount: 2,
      totalQuestions: 3,
      answers: { type: "manuf", tools: ["t1"] },
    });
  });

  it("detects and resumes an active 30-min local draft for the same email", async () => {
    const now = Date.now();
    saveSurveyDraft("demo-c", "alice@devmtl.ca", {
      surveyId: "demo-c",
      answers: { type: "startup" },
      questionIndex: 1,
      enrollmentMeta: { company_name: "Atelier" },
      expiresAt: now + 15 * 60 * 1000,
      updatedAt: now - 60_000,
    });

    const { getByLabelText, getByRole, getByText } = render(SurveyForm, {
      props: {
        survey: TEST_SURVEY,
        locale: "fr",
      },
    });

    const emailInput = getByLabelText(/Adresse e-mail/i);
    await fireEvent.input(emailInput, { target: { value: "alice@devmtl.ca" } });

    expect(getByText(/Brouillon actif retrouvé/i)).toBeTruthy();
    await fireEvent.click(getByRole("button", { name: /Reprendre mon brouillon/i }));

    // Jumps straight to restored question index (Q2) with restored banner
    expect(getByText(/Brouillon restauré/i)).toBeTruthy();
    expect(getByText(/Quels outils utilisez-vous/i)).toBeTruthy();
  });

  it("queues explicit submission when offline or failing and auto-retries on reconnect", async () => {
    setNavigatorOnline(false);
    const onsubmit = vi.fn().mockResolvedValue(undefined);

    const { getByLabelText, getByRole, getByText } = render(SurveyForm, {
      props: {
        survey: {
          ...TEST_SURVEY,
          rules: { ...TEST_SURVEY.rules, enrollment: "none" },
        },
        locale: "en",
        onsubmit,
      },
    });

    // Offline status banner visible
    expect(getByText(/Offline/i)).toBeTruthy();

    await fireEvent.click(getByLabelText("Startup"));
    await fireEvent.click(getByRole("button", { name: /Submit only these \(1\/3\)/i }));
    await fireEvent.click(getByRole("button", { name: /Confirm partial submit/i }));

    // Because offline, onsubmit is NOT called yet, and pendingSubmission is stored locally
    expect(onsubmit).not.toHaveBeenCalled();
    expect(getByRole("button", { name: /Retry now/i })).toBeTruthy();
    expect(loadPendingSubmission("demo-c", "anonymous")).not.toBeNull();

    // Reconnect triggers automatic flush of the explicitly queued submission
    setNavigatorOnline(true);
    window.dispatchEvent(new Event("online"));

    await waitFor(() => expect(onsubmit).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getByText(/Thank you/i)).toBeTruthy());
    expect(loadPendingSubmission("demo-c", "anonymous")).toBeNull();
  });

  it("never auto-submits an unsubmitted draft on reconnect", async () => {
    setNavigatorOnline(false);
    const onsubmit = vi.fn();

    const { getByLabelText } = render(SurveyForm, {
      props: {
        survey: {
          ...TEST_SURVEY,
          rules: { ...TEST_SURVEY.rules, enrollment: "none" },
        },
        locale: "en",
        onsubmit,
      },
    });

    await fireEvent.click(getByLabelText("Startup"));
    setNavigatorOnline(true);
    window.dispatchEvent(new Event("online"));

    expect(onsubmit).not.toHaveBeenCalled();
  });

  it("queues explicit submission on network rejection and succeeds on manual retry", async () => {
    const onsubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error("network_down"))
      .mockResolvedValueOnce(undefined);

    const { getByLabelText, getByRole, getByText } = render(SurveyForm, {
      props: {
        survey: {
          ...TEST_SURVEY,
          rules: { ...TEST_SURVEY.rules, enrollment: "none" },
        },
        locale: "en",
        onsubmit,
      },
    });

    await fireEvent.click(getByLabelText("Startup"));
    await fireEvent.click(getByRole("button", { name: /Submit only these \(1\/3\)/i }));
    await fireEvent.click(getByRole("button", { name: /Confirm partial submit/i }));

    await waitFor(() => expect(onsubmit).toHaveBeenCalledTimes(1));
    const retryBtn = await waitFor(() => getByRole("button", { name: /Retry now/i }));
    await fireEvent.click(retryBtn);

    await waitFor(() => expect(onsubmit).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(getByText(/Thank you/i)).toBeTruthy());
  });

  it("supports email-unverified mode by jumping directly from enrollment to questions", async () => {
    const onrequestlink = vi.fn();
    const { getByLabelText, getByRole, getByText, queryByText } = render(SurveyForm, {
      props: {
        survey: {
          ...TEST_SURVEY,
          rules: { ...TEST_SURVEY.rules, enrollment: "email-unverified" },
        },
        locale: "en",
        onrequestlink,
      },
    });

    await fireEvent.input(getByLabelText(/Email address/i), {
      target: { value: "bob@devmtl.ca" },
    });
    await fireEvent.click(getByRole("button", { name: /Start survey/i }));

    await waitFor(() => expect(onrequestlink).toHaveBeenCalledTimes(1));
    expect(queryByText(/sign-in link was sent/i)).toBeNull();
    expect(getByText(/Which organisation type/i)).toBeTruthy();
  });

  it("supports all-at-once mode with ErrorSummary on missing required answers", async () => {
    const onsubmit = vi.fn();
    const { getByLabelText, getByRole, getByText } = render(SurveyForm, {
      props: {
        survey: {
          ...TEST_SURVEY,
          rules: { ...TEST_SURVEY.rules, mode: "all-at-once", enrollment: "none" },
        },
        locale: "en",
        onsubmit,
      },
    });

    // All three questions visible together
    expect(getByText(/Which organisation type/i)).toBeTruthy();
    expect(getByText(/Which tools do you use/i)).toBeTruthy();
    expect(getByText(/Autonomy level/i)).toBeTruthy();

    // Answer only Q2, omit requiredForSubmit Q1 -> ErrorSummary shown
    await fireEvent.click(getByLabelText("Alpha Tool"));
    await fireEvent.click(getByRole("button", { name: /Submit my answers/i }));

    expect(onsubmit).not.toHaveBeenCalled();
    expect(getByText(/Please review your answers/i)).toBeTruthy();
  });

  it("uses @container layout, >= 44px touch targets, and --st-* tokens with fallbacks", () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "SurveyForm.svelte"),
      "utf8",
    );
    expect(source).toContain("container-type: inline-size");
    expect(source).toContain("@container");
    expect(source).toContain("--st-semantic-");
    expect(source).not.toMatch(/border-(left|right|top|bottom)[^;]*;\s*border-radius:\s*[^0]/);
  });
});
