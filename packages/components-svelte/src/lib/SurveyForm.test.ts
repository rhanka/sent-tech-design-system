import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SurveyForm from "./SurveyForm.svelte";
import {
  clearAllSurveyStorage,
  loadPendingSubmission,
  loadSurveyDraft,
  savePendingSubmission,
  saveSurveyDraft,
} from "./survey-storage.js";
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
        allowSimulatedLinkOpen: true,
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

    await waitFor(() =>
      expect(onrequestlink).toHaveBeenCalledWith({
        surveyId: "demo-c",
        email: "alice@devmtl.ca",
        enrollmentMeta: {},
      }),
    );

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

  it("P1-1: hides simulated link bypass by default and guards onrequestlink offline, busy, and rejection", async () => {
    // Offline blocks magic-link request before saving draft or moving to link_sent
    setNavigatorOnline(false);
    const offlineReq = vi.fn();
    const { getByLabelText, getByRole, queryByText, unmount } = render(SurveyForm, {
      props: {
        survey: TEST_SURVEY,
        locale: "fr",
        onrequestlink: offlineReq,
      },
    });
    await fireEvent.input(getByLabelText(/Adresse e-mail/i), {
      target: { value: "alice@devmtl.ca" },
    });
    await fireEvent.click(getByRole("button", { name: /Recevoir mon lien/i }));
    expect(offlineReq).not.toHaveBeenCalled();
    expect(queryByText(/Un lien vient de partir/i)).toBeNull();
    expect(loadSurveyDraft("demo-c", "alice@devmtl.ca")).toBeNull();
    unmount();

    // Rejection stays on enrollment, saves no empty draft, and re-enables button
    setNavigatorOnline(true);
    let rejectFn!: (err: Error) => void;
    const rejectingReq = vi.fn(
      () =>
        new Promise<void>((_res, rej) => {
          rejectFn = rej;
        }),
    );
    const r2 = render(SurveyForm, {
      props: {
        survey: TEST_SURVEY,
        locale: "fr",
        onrequestlink: rejectingReq,
      },
    });
    await fireEvent.input(r2.getByLabelText(/Adresse e-mail/i), {
      target: { value: "alice@devmtl.ca" },
    });
    const sendBtn = r2.getByRole("button", { name: /Recevoir mon lien/i }) as HTMLButtonElement;
    await fireEvent.click(sendBtn);
    expect(sendBtn.disabled).toBe(true);
    rejectFn(new Error("auth_down"));
    await waitFor(() => expect(sendBtn.disabled).toBe(false));
    expect(r2.queryByText(/Un lien vient de partir/i)).toBeNull();
    expect(loadSurveyDraft("demo-c", "alice@devmtl.ca")).toBeNull();
    r2.unmount();

    // Default allowSimulatedLinkOpen is false (no unauthenticated bypass button on link_sent)
    const okReq = vi.fn().mockResolvedValue(undefined);
    const r3 = render(SurveyForm, {
      props: {
        survey: TEST_SURVEY,
        locale: "fr",
        onrequestlink: okReq,
      },
    });
    await fireEvent.input(r3.getByLabelText(/Adresse e-mail/i), {
      target: { value: "alice@devmtl.ca" },
    });
    await fireEvent.input(r3.getByLabelText(/Entreprise/i), {
      target: { value: "Secret Org" },
    });
    await fireEvent.click(r3.getByRole("button", { name: /Recevoir mon lien/i }));
    await waitFor(() => expect(r3.getByText(/Un lien vient de partir/i)).toBeTruthy());
    expect(r3.queryByRole("button", { name: /Ouvrir le sondage/i })).toBeNull();
    // P2-6: display:"never" company_name is NOT sent alongside raw email in onrequestlink
    expect(okReq).toHaveBeenCalledWith({
      surveyId: "demo-c",
      email: "alice@devmtl.ca",
      enrollmentMeta: {},
    });
    r3.unmount();
  });

  it("P1-1: restores pre-link draft on magic-link return, reacts to async /api/me prop updates, and scopes by respondentSeed", async () => {
    const now = Date.now();
    saveSurveyDraft("demo-c", "alice@devmtl.ca", {
      surveyId: "demo-c",
      answers: { type: "startup" },
      questionIndex: 1,
      enrollmentMeta: { company_name: "Studio Nord" },
      expiresAt: now + 20 * 60 * 1000,
      updatedAt: now - 10_000,
    });

    const onsubmit = vi.fn();
    const { rerender, getByLabelText, getByRole, getByText } = render(SurveyForm, {
      props: {
        survey: TEST_SURVEY,
        locale: "fr",
        onsubmit,
      },
    });

    // Initially on enrollment before /api/me resolves
    expect(getByText(/Accéder au sondage/i)).toBeTruthy();

    // Async /api/me updates initialStep & initialEmail
    await rerender({
      survey: TEST_SURVEY,
      locale: "fr",
      initialStep: "questions",
      initialEmail: "alice@devmtl.ca",
      onsubmit,
    });

    // Restores Q2, restored banner, answers, and pre-link company_name
    await waitFor(() => expect(getByText(/Brouillon restauré/i)).toBeTruthy());
    expect(getByText(/Quels outils utilisez-vous/i)).toBeTruthy();

    await fireEvent.click(getByLabelText("Outil Alpha"));
    await fireEvent.click(getByRole("button", { name: /Envoyer seulement celles-ci \(2\/3\)/i }));
    await fireEvent.click(getByRole("button", { name: /Confirmer l’envoi partiel/i }));

    await waitFor(() => expect(onsubmit).toHaveBeenCalledTimes(1));
    expect(onsubmit.mock.calls[0][0]).toMatchObject({
      answers: { type: "startup", tools: ["t1"] },
      enrollmentMeta: { company_name: "Studio Nord" },
      returnedFromDraft: true,
    });

    // Non-PII respondentSeed isolates non-email sessions instead of collapsing onto "anonymous"
    const directSurvey: SurveyDefinition = {
      ...TEST_SURVEY,
      rules: { ...TEST_SURVEY.rules, enrollment: "none" },
    };
    const rSeed = render(SurveyForm, {
      props: {
        survey: directSurvey,
        locale: "en",
        respondentSeed: "session-xyz-42",
      },
    });
    await fireEvent.click(rSeed.getByLabelText("Startup"));
    expect(loadSurveyDraft("demo-c", "session-xyz-42")).not.toBeNull();
    expect(loadSurveyDraft("demo-c", "anonymous")).toBeNull();
    rSeed.unmount();
  });

  it("P1-2: clears prior respondent PII on leaveForLater and change-email, and binds offline queue to queued identity", async () => {
    const onsubmit = vi.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByRole, unmount } = render(SurveyForm, {
      props: {
        survey: TEST_SURVEY,
        locale: "fr",
        allowSimulatedLinkOpen: true,
        onsubmit,
      },
    });

    // User A enrolls with company_name and answers Q1, then leaves for later
    await fireEvent.input(getByLabelText(/Adresse e-mail/i), {
      target: { value: "alice@devmtl.ca" },
    });
    await fireEvent.input(getByLabelText(/Entreprise/i), {
      target: { value: "Alice Secret Inc" },
    });
    await fireEvent.click(getByRole("button", { name: /Recevoir mon lien/i }));
    await waitFor(() => expect(getByRole("button", { name: /Ouvrir le sondage/i })).toBeTruthy());
    await fireEvent.click(getByRole("button", { name: /Ouvrir le sondage/i }));
    await fireEvent.click(getByLabelText("Startup"));
    await fireEvent.click(getByRole("button", { name: /Quitter et reprendre plus tard/i }));

    // Back on enrollment: inputs MUST be blank (no prior PII leak)
    const emailAfterLeave = getByLabelText(/Adresse e-mail/i) as HTMLInputElement;
    const companyAfterLeave = getByLabelText(/Entreprise/i) as HTMLInputElement;
    expect(emailAfterLeave.value).toBe("");
    expect(companyAfterLeave.value).toBe("");

    // User B enrolls without company_name and submits -> must NOT inherit Alice's company_name or answers
    await fireEvent.input(emailAfterLeave, { target: { value: "bob@devmtl.ca" } });
    await fireEvent.click(getByRole("button", { name: /Recevoir mon lien/i }));
    await waitFor(() => expect(getByRole("button", { name: /Changer d’e-mail/i })).toBeTruthy());
    // Also verify Changer d'e-mail clears inputs
    await fireEvent.click(getByRole("button", { name: /Changer d’e-mail/i }));
    expect((getByLabelText(/Adresse e-mail/i) as HTMLInputElement).value).toBe("");

    await fireEvent.input(getByLabelText(/Adresse e-mail/i), {
      target: { value: "bob@devmtl.ca" },
    });
    await fireEvent.click(getByRole("button", { name: /Recevoir mon lien/i }));
    await waitFor(() => expect(getByRole("button", { name: /Ouvrir le sondage/i })).toBeTruthy());
    await fireEvent.click(getByRole("button", { name: /Ouvrir le sondage/i }));
    await fireEvent.click(getByLabelText("Manufacturier"));
    await fireEvent.click(getByRole("button", { name: /Envoyer seulement celles-ci \(1\/3\)/i }));
    await fireEvent.click(getByRole("button", { name: /Confirmer l’envoi partiel/i }));

    await waitFor(() => expect(onsubmit).toHaveBeenCalledTimes(1));
    expect(onsubmit.mock.calls[0][0]).toMatchObject({
      answers: { type: "manuf" },
      enrollmentMeta: {},
    });
    unmount();

    // Offline queue bound to queued identity: editing email to Bob must NOT touch Bob's slot or jump Bob to thanks
    savePendingSubmission("demo-c", "alice@devmtl.ca", {
      payload: {
        surveyId: "demo-c",
        mode: "partial",
        answeredCount: 1,
        totalQuestions: 3,
        answers: { type: "startup" },
        enrollmentMeta: { company_name: "Alice Secret Inc" },
        returnedFromDraft: false,
        submittedAt: "2026-11-27T14:00:00.000Z",
      },
      queuedAt: Date.now(),
      attempts: 1,
      lastError: "offline",
    });
    saveSurveyDraft("demo-c", "bob@devmtl.ca", {
      surveyId: "demo-c",
      answers: { type: "manuf" },
      questionIndex: 0,
      enrollmentMeta: {},
      expiresAt: Date.now() + 20 * 60 * 1000,
      updatedAt: Date.now(),
    });

    setNavigatorOnline(false);
    const flushSpy = vi.fn().mockResolvedValue(undefined);
    const r2 = render(SurveyForm, {
      props: {
        survey: TEST_SURVEY,
        locale: "fr",
        initialStep: "enrollment",
        initialEmail: "alice@devmtl.ca",
        onsubmit: flushSpy,
      },
    });
    // Bob edits the email field before reconnect
    await fireEvent.input(r2.getByLabelText(/Adresse e-mail/i), {
      target: { value: "bob@devmtl.ca" },
    });
    setNavigatorOnline(true);
    window.dispatchEvent(new Event("online"));

    // Bob's draft MUST stay intact and Bob MUST NOT be jumped to thanks
    expect(loadSurveyDraft("demo-c", "bob@devmtl.ca")).not.toBeNull();
    expect(loadPendingSubmission("demo-c", "bob@devmtl.ca")).toBeNull();
    expect(r2.queryByText(/Merci pour vos réponses/i)).toBeNull();
    r2.unmount();
  });

  it("P1-3: enforces minSelections on final submit, binds aria-invalid/aria-describedby, focuses ErrorSummary, and avoids hardcoded question 1", async () => {
    const minSurvey: SurveyDefinition = {
      ...TEST_SURVEY,
      rules: {
        ...TEST_SURVEY.rules,
        enrollment: "none",
        requiredForSubmit: ["type"],
      },
      questions: [
        TEST_SURVEY.questions[0],
        {
          id: "tools",
          type: "multi",
          label: { fr: "Choisissez au moins 2 outils", en: "Pick at least 2 tools" },
          minSelections: 2,
          options: [
            { id: "t1", label: { fr: "Outil Alpha", en: "Alpha Tool" } },
            { id: "t2", label: { fr: "Outil Beta", en: "Beta Tool" } },
            { id: "t3", label: { fr: "Outil Gamma", en: "Gamma Tool" } },
          ],
        },
      ],
    };

    const onsubmit = vi.fn();
    const r1 = render(SurveyForm, {
      props: { survey: minSurvey, locale: "fr", onsubmit },
    });
    await fireEvent.click(r1.getByLabelText("Startup"));
    await fireEvent.click(r1.getByRole("button", { name: /Suivant/i }));
    await fireEvent.click(r1.getByLabelText("Outil Alpha"));
    await fireEvent.click(r1.getByRole("button", { name: /Envoyer mes réponses/i }));

    expect(onsubmit).not.toHaveBeenCalled();
    // Error must reference question 2, not hardcoded "question 1"
    expect(r1.queryByText(/question 1/i)).toBeNull();
    expect(r1.getByText(/Question 2 : sélectionnez au moins 2/i)).toBeTruthy();
    // Control has aria-invalid="true" and aria-describedby linked to error text
    const alphaCheckbox = r1.getByLabelText("Outil Alpha") as HTMLInputElement;
    expect(alphaCheckbox.getAttribute("aria-invalid")).toBe("true");
    const descIds = (alphaCheckbox.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    expect(descIds.some((id) => document.getElementById(id)?.textContent?.includes("au moins 2"))).toBe(true);
    r1.unmount();
    clearAllSurveyStorage();

    // all-at-once focuses ErrorSummary and marks invalid controls
    const allAtOnceSurvey: SurveyDefinition = {
      ...minSurvey,
      rules: { ...minSurvey.rules, mode: "all-at-once" },
    };
    const r2 = render(SurveyForm, {
      props: { survey: allAtOnceSurvey, locale: "en", onsubmit },
    });
    await fireEvent.click(r2.getByLabelText("Alpha Tool"));
    await fireEvent.click(r2.getByRole("button", { name: /Submit my answers/i }));

    expect(onsubmit).not.toHaveBeenCalled();
    const summary = r2.container.querySelector(".st-error-summary") as HTMLElement;
    expect(summary).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(summary));
    // Q1 (RadioGroup) and Q2 (CheckboxGroup) both marked invalid
    const radioGroup = r2.container.querySelector('fieldset[role="radiogroup"]') as HTMLElement;
    expect(radioGroup.getAttribute("aria-invalid")).toBe("true");
    expect((r2.getByLabelText("Alpha Tool") as HTMLInputElement).getAttribute("aria-invalid")).toBe("true");
    r2.unmount();
  });

  it("P1-4 & P2-7: localizes FR ARIA labels, keeps >=44px modal close target, avoids nested alerts, and uses @container sticky nav", async () => {
    setNavigatorOnline(false);
    const { container, getByLabelText, getByRole } = render(SurveyForm, {
      props: {
        survey: {
          ...TEST_SURVEY,
          rules: { ...TEST_SURVEY.rules, enrollment: "none" },
        },
        locale: "fr",
      },
    });

    // FR nav aria-label (never English "Survey navigation")
    const nav = container.querySelector("nav.st-surveyNav") as HTMLElement;
    expect(nav.getAttribute("aria-label")).toBe("Navigation du sondage");

    // Partial submit modal close button has FR aria-label="Fermer"
    await fireEvent.click(getByLabelText("Startup"));
    await fireEvent.click(getByRole("button", { name: /Envoyer seulement celles-ci \(1\/3\)/i }));
    const closeBtn = container.querySelector(".st-modal__close") as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    expect(closeBtn.getAttribute("aria-label")).toBe("Fermer");

    // Confirm offline partial submit to display pending banner and verify no nested role="alert"
    await fireEvent.click(getByRole("button", { name: /Confirmer l’envoi partiel/i }));
    const nestedAlerts = container.querySelectorAll('[role="alert"] [role="alert"]');
    expect(nestedAlerts.length).toBe(0);

    // Modal close target >= 44px (2.75rem) & SurveyNav stickyMobile uses @container
    const modalSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "Modal.svelte"),
      "utf8",
    );
    expect(modalSource).toMatch(/\.st-modal__close\s*\{[^}]*2\.75rem/s);

    const navSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "SurveyNav.svelte"),
      "utf8",
    );
    expect(navSource).toMatch(/@container\s*\(max-width:\s*520px\)\s*\{[\s\S]*\.st-surveyNav--stickyMobile/);

    const formSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "SurveyForm.svelte"),
      "utf8",
    );
    expect(formSource).toMatch(/\.st-surveyForm__main[\s\S]*38rem/);
  });

  it("P2-6: does not persist dead drafts after 30-min expiry and persists again after renewing window", async () => {
    vi.useFakeTimers();
    try {
      const start = new Date("2026-11-27T15:00:00.000Z").getTime();
      vi.setSystemTime(start);

      const { getByLabelText, getByRole, getByText } = render(SurveyForm, {
        props: {
          survey: {
            ...TEST_SURVEY,
            rules: { ...TEST_SURVEY.rules, enrollment: "none", draftWindowMinutes: 30 },
          },
          locale: "fr",
          respondentSeed: "timer-user-1",
        },
      });

      await fireEvent.click(getByLabelText("Startup"));
      expect(loadSurveyDraft("demo-c", "timer-user-1", start + 1000)).not.toBeNull();

      // Advance past 30 minutes
      await vi.advanceTimersByTimeAsync(31 * 60 * 1000);
      expect(getByText(/Brouillon expiré/i)).toBeTruthy();

      // Clear expired entry then edit: must NOT write a dead past-expiresAt draft
      expect(loadSurveyDraft("demo-c", "timer-user-1", Date.now())).toBeNull();
      await fireEvent.click(getByLabelText("Manufacturier"));
      // Still no dead draft written with past expiresAt
      const rawKeys = Object.keys(window.localStorage).filter((k) => k.includes("draft:"));
      expect(rawKeys.length).toBe(0);

      // Renew window persists a fresh draft
      await fireEvent.click(getByRole("button", { name: /Relancer la fenêtre/i }));
      const renewed = loadSurveyDraft("demo-c", "timer-user-1", Date.now() + 1000);
      expect(renewed).not.toBeNull();
      expect(renewed?.answers).toEqual({ type: "manuf" });
    } finally {
      vi.useRealTimers();
    }
  });
});

const V2_SURVEY: SurveyDefinition = {
  schemaVersion: 2,
  id: "devmtl-v2",
  title: { fr: "Du code à la décision", en: "From Code to Decision" },
  subtitle: "/dev/mtl 2026",
  entry: {
    scope: {
      id: "default_scope",
      label: { fr: "Je réponds pour :", en: "I am answering for:" },
      default: null,
      options: [
        {
          id: "enterprise",
          label: {
            fr: "La pratique observée dans mon entreprise",
            en: "Practice observed in my company",
          },
          short: "Entreprise",
        },
        {
          id: "personal",
          label: { fr: "Ma pratique perso", en: "My personal practice" },
          short: "Perso",
        },
        {
          id: "both",
          label: { fr: "Les deux", en: "Both" },
          short: "Les deux",
        },
      ],
      privacyNotice: {
        fr: "Seul le secteur d’activité est utilisé dans l’analyse.",
        en: "Only the sector is used in the analysis.",
      },
    },
    depth: {
      id: "depth_mode",
      label: { fr: "Temps souhaité :", en: "Time you want to spend:" },
      default: null,
      options: [
        {
          id: "fast",
          label: { fr: "~2 min · 8 questions", en: "~2 min · 8 questions" },
          durationLabel: { fr: "~2 min", en: "~2 min" },
          questionsMax: 8,
        },
        {
          id: "deep",
          label: { fr: "6–8 min · jusqu’à 39 questions", en: "6–8 min · up to 39 questions" },
          durationLabel: { fr: "6–8 min", en: "6–8 min" },
          questionsMax: 39,
          allowThemeSelection: true,
        },
      ],
    },
  },
  themes: [
    {
      id: "usine",
      label: { fr: "Usine & outils", en: "Factory & tools" },
      questionCount: 1,
    },
    {
      id: "decision",
      label: { fr: "Décision", en: "Decision" },
      questionCount: 1,
    },
  ],
  rules: {
    mode: "one-per-screen",
    enrollment: "none",
    draftWindowMinutes: 30,
    explicitSubmitOnly: true,
    allowPartialSubmit: true,
    requiredForSubmit: ["type"],
    shuffleMultiOptions: false,
    anonymous: true,
  },
  questions: [
    {
      id: "type",
      tier: "core",
      contextual: false,
      type: "single",
      label: { fr: "Quel secteur ?", en: "Which sector?" },
      options: [
        { id: "manuf", label: { fr: "Manufacturier", en: "Manufacturing" } },
        { id: "startup", label: { fr: "Startup", en: "Startup" } },
      ],
    },
    {
      id: "ai_impact_year",
      tier: "core",
      contextual: false,
      type: "ai_effect",
      label: {
        fr: "Sur l’année, l’IA a eu sur votre travail un effet :",
        en: "Over the past year, AI has had on your work an effect:",
      },
    },
    {
      id: "code_tools",
      tier: "core",
      contextual: true,
      type: "multi",
      exclusive: ["aucun"],
      label: { fr: "Quels assistants utilisez-vous ?", en: "Which assistants do you use?" },
      options: [
        { id: "a1", label: { fr: "Assistant Alpha", en: "Alpha Assistant" } },
        { id: "a2", label: { fr: "Assistant Beta", en: "Beta Assistant" } },
        { id: "aucun", label: { fr: "Aucun", en: "None" } },
      ],
    },
    {
      id: "quotas",
      tier: "core",
      contextual: true,
      type: "single",
      label: { fr: "Avez-vous touché une limite de quota ?", en: "Hit a quota limit?" },
      options: [
        { id: "q_week", label: { fr: "Oui, cette semaine", en: "Yes, this week" } },
        { id: "q_never", label: { fr: "Non, jamais", en: "No, never" } },
      ],
    },
    {
      id: "sdlc",
      tier: "deep",
      deepTheme: "usine",
      contextual: true,
      type: "scale",
      label: { fr: "Maturité du cycle ?", en: "Lifecycle maturity?" },
      options: [
        { id: "m1", label: { fr: "1 · Aucun", en: "1 · None" } },
        { id: "m2", label: { fr: "2 · Essais", en: "2 · Trials" } },
        { id: "m3", label: { fr: "3 · Quotidien", en: "3 · Daily" } },
        { id: "m4", label: { fr: "4 · Intégré", en: "4 · Integrated" } },
      ],
    },
    {
      id: "spec",
      tier: "deep",
      deepTheme: "decision",
      contextual: true,
      type: "single",
      label: { fr: "Pratique de spécification ?", en: "Spec practice?" },
      options: [
        { id: "sp1", label: { fr: "Légère", en: "Light" } },
        { id: "sp2", label: { fr: "En lots", en: "Batched" } },
      ],
    },
    {
      id: "open_feedback",
      tier: "closing",
      contextual: false,
      type: "text_long",
      placement: "closing",
      display: "agent_summary_only",
      optional: true,
      maxLength: 280,
      label: { fr: "Question ouverte (facultatif)", en: "Open question (optional)" },
      placeholder: { fr: "280 caractères max.", en: "280 chars max." },
    },
  ],
};

describe("SurveyForm v2 — two entry screens, orientation toggle, ai_effect & P1 flows", () => {
  beforeEach(() => {
    clearAllSurveyStorage();
    setNavigatorOnline(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearAllSurveyStorage();
    setNavigatorOnline(true);
  });

  it("enforces no pre-selection on scope entry, walks two short entry screens (~2 min), toggles scope per question, renders ai_effect + optional open text", async () => {
    const onsubmit = vi.fn();
    const { container, getByLabelText, getByRole, getByText, queryByRole } = render(SurveyForm, {
      props: {
        survey: V2_SURVEY,
        locale: "fr",
        onsubmit,
      },
    });

    // Entry screen 1: orientation with NO pre-selection + sector-only promise
    expect(getByText(/Je réponds pour/i)).toBeTruthy();
    expect(getByText(/Seul le secteur/i)).toBeTruthy();
    const scopeRadios = [...container.querySelectorAll('input[type="radio"]')] as HTMLInputElement[];
    expect(scopeRadios).toHaveLength(3);
    expect(scopeRadios.every((r) => !r.checked)).toBe(true);

    // Trying to continue without choosing scope shows validation error
    await fireEvent.click(getByRole("button", { name: /Continuer/i }));
    expect(getByRole("alert")).toBeTruthy();

    // Pick Enterprise and move to Entry screen 2 (depth)
    await fireEvent.click(getByLabelText(/La pratique observée dans mon entreprise/i));
    await fireEvent.click(getByRole("button", { name: /Continuer/i }));

    // Entry screen 2: displayed durations ~2 min and 6–8 min
    expect(getByText(/~2 min/i)).toBeTruthy();
    expect(getByText(/6–8 min/i)).toBeTruthy();
    await fireEvent.click(getByLabelText(/~2 min/i));
    await fireEvent.click(getByRole("button", { name: /Commencer/i }));

    // Q1: non-contextual sector -> NO per-question toggle
    expect(getByText(/Quel secteur/i)).toBeTruthy();
    expect(queryByRole("group", { name: /Contexte de réponse/i })).toBeNull();
    await fireEvent.click(getByLabelText("Startup"));
    await fireEvent.click(getByRole("button", { name: /Suivant/i }));

    // Q2: ai_effect symmetric bipolar scale with separated "Je ne sais pas"
    expect(container.querySelector(".st-likert--bipolar")).toBeTruthy();
    expect(container.querySelector('[data-neutral="true"]')).toBeTruthy();
    expect(container.querySelector(".st-likert__nonSubstantive")).toBeTruthy();
    await fireEvent.click(getByLabelText(/Je ne sais pas/i));
    await fireEvent.click(getByRole("button", { name: /Suivant/i }));

    // Q3: contextual multi -> toggle defaults to Entreprise
    expect(getByRole("group", { name: /Contexte de réponse/i })).toBeTruthy();
    expect(getByRole("button", { name: "Entreprise" }).getAttribute("aria-pressed")).toBe("true");
    await fireEvent.click(getByLabelText("Assistant Alpha"));
    await fireEvent.click(getByRole("button", { name: /Suivant/i }));

    // Q4: contextual single -> toggle to Perso for this question only
    expect(getByRole("button", { name: "Entreprise" }).getAttribute("aria-pressed")).toBe("true");
    await fireEvent.click(getByRole("button", { name: "Perso" }));
    expect(getByRole("button", { name: "Perso" }).getAttribute("aria-pressed")).toBe("true");
    await fireEvent.click(getByLabelText("Oui, cette semaine"));
    await fireEvent.click(getByRole("button", { name: /Suivant/i }));

    // Closing optional open question (fast mode skips deep questions)
    expect(getByText(/Question ouverte/i)).toBeTruthy();
    const textarea = getByLabelText(/Question ouverte/i) as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: "Plus d'exemples sur les specs." } });
    expect(getByText(/30 \/ 280/)).toBeTruthy();

    await fireEvent.click(getByRole("button", { name: /Envoyer mes réponses/i }));
    await waitFor(() => expect(onsubmit).toHaveBeenCalledTimes(1));

    const payload = onsubmit.mock.calls[0][0] as SurveySubmitPayload;
    expect(payload.schemaVersion).toBe(2);
    expect(payload.mode).toBe("complete");
    expect(payload.entryScope).toBe("enterprise");
    expect(payload.depthMode).toBe("fast");
    expect(payload.answers).toEqual({
      type: "startup",
      ai_impact_year: "imp_nsp",
      code_tools: { enterprise: ["a1"] },
      quotas: { personal: "q_week" },
      open_feedback: "Plus d'exemples sur les specs.",
    });
  });

  it("supports P1 deep-dive theme milestone after core questions and 'both' side-by-side dual answers", async () => {
    const onsubmit = vi.fn();
    const { container, getByLabelText, getByRole, getByText, queryByText } = render(SurveyForm, {
      props: {
        survey: V2_SURVEY,
        locale: "fr",
        onsubmit,
      },
    });

    // Screen 1: pick "Les deux"
    await fireEvent.click(getByLabelText(/Les deux/i));
    await fireEvent.click(getByRole("button", { name: /Continuer/i }));

    // Screen 2: pick "6–8 min" (deep)
    await fireEvent.click(getByLabelText(/6–8 min/i));
    await fireEvent.click(getByRole("button", { name: /Commencer/i }));

    // Q1 sector
    await fireEvent.click(getByLabelText("Manufacturier"));
    await fireEvent.click(getByRole("button", { name: /Suivant/i }));

    // Q2 ai_effect
    await fireEvent.click(getByLabelText(/Plutôt positif/i));
    await fireEvent.click(getByRole("button", { name: /Suivant/i }));

    // Q3 contextual multi in 'both' mode -> dual side-by-side inputs
    expect(container.querySelector(".st-surveyDual")).toBeTruthy();
    await fireEvent.click(getByLabelText("Assistant Alpha — Entreprise"));
    await fireEvent.click(getByLabelText("Assistant Beta — Perso"));
    await fireEvent.click(getByRole("button", { name: /Suivant/i }));

    // Q4 contextual single in 'both' mode -> independent enterprise & personal answers
    await fireEvent.click(getByLabelText("Non, jamais — Entreprise"));
    await fireEvent.click(getByLabelText("Oui, cette semaine — Perso"));
    await fireEvent.click(getByRole("button", { name: /Suivant/i }));

    // Milestone after core questions: select only "Usine & outils" (uncheck "Décision")
    expect(getByText(/Thèmes d’approfondissement/i)).toBeTruthy();
    await fireEvent.click(getByLabelText(/Décision/i));
    await fireEvent.click(getByRole("button", { name: /Continuer l’approfondissement/i }));

    // Deep question from "usine" renders; "spec" from "decision" is skipped
    expect(getByText(/Maturité du cycle/i)).toBeTruthy();
    await fireEvent.click(getByLabelText(/3 · Quotidien — Entreprise/i));
    await fireEvent.click(getByRole("button", { name: /Suivant/i }));

    expect(queryByText(/Pratique de spécification/i)).toBeNull();
    expect(getByText(/Question ouverte/i)).toBeTruthy();

    // Leave open question blank -> still complete submit!
    await fireEvent.click(getByRole("button", { name: /Envoyer mes réponses/i }));
    await waitFor(() => expect(onsubmit).toHaveBeenCalledTimes(1));

    const payload = onsubmit.mock.calls[0][0] as SurveySubmitPayload;
    expect(payload.mode).toBe("complete");
    expect(payload.entryScope).toBe("both");
    expect(payload.depthMode).toBe("deep");
    expect(payload.selectedThemes).toEqual(["usine"]);
    expect(payload.answers).toEqual({
      type: "manuf",
      ai_impact_year: "imp_pos",
      code_tools: { enterprise: ["a1"], personal: ["a2"] },
      quotas: { enterprise: "q_never", personal: "q_week" },
      sdlc: { enterprise: "m3" },
    });
  });

  it("allows back navigation between entry screens, re-tags an answered contextual question on toggle, and submits immediately from the deep-dive milestone", async () => {
    const onsubmit = vi.fn();
    const { getByLabelText, getByRole, getByText } = render(SurveyForm, {
      props: {
        survey: V2_SURVEY,
        locale: "en",
        onsubmit,
      },
    });

    // Screen 1 -> Screen 2 -> Back to Screen 1 (selection preserved) -> Screen 2 -> Start (deep)
    await fireEvent.click(getByLabelText(/Practice observed in my company/i));
    await fireEvent.click(getByRole("button", { name: /^Continue$/i }));
    await fireEvent.click(getByRole("button", { name: /^Previous$/i }));
    expect(
      (getByLabelText(/Practice observed in my company/i) as HTMLInputElement).checked,
    ).toBe(true);
    await fireEvent.click(getByRole("button", { name: /^Continue$/i }));

    await fireEvent.click(getByLabelText(/6–8 min/i));
    await fireEvent.click(getByRole("button", { name: /^Start$/i }));

    // Core Q1..Q4; on Q4 answer first under Company, then toggle to Personal -> re-tags to personal
    await fireEvent.click(getByLabelText("Startup"));
    await fireEvent.click(getByRole("button", { name: /^Next$/i }));
    await fireEvent.click(getByLabelText(/Neutral/i));
    await fireEvent.click(getByRole("button", { name: /^Next$/i }));
    await fireEvent.click(getByLabelText("Alpha Assistant"));
    await fireEvent.click(getByRole("button", { name: /^Next$/i }));

    await fireEvent.click(getByLabelText("Yes, this week"));
    await fireEvent.click(getByRole("button", { name: "Personal" }));
    await fireEvent.click(getByRole("button", { name: /^Next$/i }));

    // Milestone screen: submit core answers immediately
    expect(getByText(/Deep-dive themes/i)).toBeTruthy();
    await fireEvent.click(getByRole("button", { name: /Submit my answers now/i }));
    await waitFor(() => expect(onsubmit).toHaveBeenCalledTimes(1));

    const payload = onsubmit.mock.calls[0][0] as SurveySubmitPayload;
    expect(payload.answers).toEqual({
      type: "startup",
      ai_impact_year: "imp_neutral",
      code_tools: { enterprise: ["a1"] },
      quotas: { personal: "q_week" },
    });
  });
});
