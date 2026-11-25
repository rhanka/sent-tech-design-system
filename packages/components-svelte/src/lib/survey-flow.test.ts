import { describe, expect, it } from "vitest";
import {
  buildSubmitPayload,
  computeStepIndex,
  countAnsweredQuestions,
  extractCleanAnswers,
  formatSurveyCountdown,
  isValidSurveyEmail,
  resolveExclusiveMultiChange,
  resolveInitialStep,
  validateQuestionAnswer,
  validateSubmission,
} from "./survey-flow.js";
import type { SurveyDefinition } from "./survey-types.js";

const SAMPLE_SURVEY: SurveyDefinition = {
  id: "C",
  title: { fr: "Sondage", en: "Survey" },
  rules: {
    mode: "one-per-screen",
    enrollment: "email-magic-link",
    draftWindowMinutes: 30,
    explicitSubmitOnly: true,
    allowPartialSubmit: true,
    requiredForSubmit: ["type"],
  },
  enrollmentFields: [
    {
      id: "company_name",
      label: { fr: "Entreprise", en: "Company" },
      display: "never",
      optional: true,
      maxLength: 80,
    },
  ],
  questions: [
    {
      id: "type",
      type: "single",
      label: { fr: "Type ?", en: "Type?" },
      required: true,
      options: [
        { id: "manuf", label: "Manuf" },
        { id: "startup", label: "Startup" },
      ],
    },
    {
      id: "tools",
      type: "multi",
      label: { fr: "Outils ?", en: "Tools?" },
      exclusive: ["none"],
      maxSelections: 2,
      options: [
        { id: "t1", label: "T1" },
        { id: "t2", label: "T2" },
        { id: "t3", label: "T3" },
        { id: "none", label: "None" },
      ],
    },
    {
      id: "level",
      type: "scale",
      label: { fr: "Niveau ?", en: "Level?" },
      options: [
        { id: "l1", label: "1" },
        { id: "l2", label: "2" },
        { id: "l3", label: "3" },
        { id: "l4", label: "4" },
      ],
    },
  ],
};

describe("survey-flow helpers", () => {
  it("validates email syntax", () => {
    expect(isValidSurveyEmail("alice@devmtl.ca")).toBe(true);
    expect(isValidSurveyEmail("  alice+1@sub.org.ca ")).toBe(true);
    expect(isValidSurveyEmail("")).toBe(false);
    expect(isValidSurveyEmail("alice@")).toBe(false);
    expect(isValidSurveyEmail("alice")).toBe(false);
  });

  it("formats MM:SS countdown cleanly", () => {
    expect(formatSurveyCountdown(30 * 60 * 1000)).toBe("30:00");
    expect(formatSurveyCountdown(65_000)).toBe("01:05");
    expect(formatSurveyCountdown(500)).toBe("00:01");
    expect(formatSurveyCountdown(0)).toBe("00:00");
    expect(formatSurveyCountdown(-5000)).toBe("00:00");
  });

  it("resolves exclusive multi-choice selections both ways", () => {
    expect(resolveExclusiveMultiChange(["t1"], ["t1", "none"], ["none"])).toEqual(["none"]);
    expect(resolveExclusiveMultiChange(["none"], ["none", "t2"], ["none"])).toEqual(["t2"]);
    expect(resolveExclusiveMultiChange(["t1"], ["t1", "t2"], ["none"])).toEqual(["t1", "t2"]);
  });

  it("extracts clean answers and excludes non-scored / enrollment fields", () => {
    const raw = {
      type: "startup",
      tools: ["t1"],
      level: "",
      company_name: "Secret Corp",
    };
    expect(countAnsweredQuestions(SAMPLE_SURVEY.questions, raw)).toBe(2);
    expect(extractCleanAnswers(SAMPLE_SURVEY.questions, raw)).toEqual({
      type: "startup",
      tools: ["t1"],
    });
  });

  it("validates single question rules and full/partial submission gates", () => {
    expect(validateQuestionAnswer(SAMPLE_SURVEY.questions[0], undefined)).toBe("required");
    expect(validateQuestionAnswer(SAMPLE_SURVEY.questions[0], "manuf")).toBeNull();
    expect(validateQuestionAnswer(SAMPLE_SURVEY.questions[1], ["t1", "t2", "t3"])).toBe(
      "maxSelections",
    );

    expect(validateSubmission(SAMPLE_SURVEY, { tools: ["t1"] }, "partial")).toEqual({
      valid: false,
      missingIds: ["type"],
    });
    expect(validateSubmission(SAMPLE_SURVEY, { type: "startup" }, "partial")).toEqual({
      valid: true,
      missingIds: [],
    });
    expect(validateSubmission(SAMPLE_SURVEY, {}, "complete")).toEqual({
      valid: false,
      missingIds: ["type"],
    });
  });

  it("builds a complete or partial submit payload with segregated enrollmentMeta", () => {
    const partial = buildSubmitPayload({
      survey: SAMPLE_SURVEY,
      answers: { type: "startup", company_name: "NeverMix" },
      enrollmentMeta: { company_name: "  Acme  " },
      requestedMode: "complete",
      returnedFromDraft: true,
      nowIso: "2026-11-27T15:00:00.000Z",
    });
    expect(partial).toEqual({
      surveyId: "C",
      mode: "partial",
      answeredCount: 1,
      totalQuestions: 3,
      answers: { type: "startup" },
      enrollmentMeta: { company_name: "Acme" },
      returnedFromDraft: true,
      submittedAt: "2026-11-27T15:00:00.000Z",
    });

    const complete = buildSubmitPayload({
      survey: SAMPLE_SURVEY,
      answers: { type: "startup", tools: ["t1"], level: "l3" },
      enrollmentMeta: {},
      requestedMode: "complete",
      returnedFromDraft: false,
      nowIso: "2026-11-27T15:05:00.000Z",
    });
    expect(complete.mode).toBe("complete");
    expect(complete.answeredCount).toBe(3);
  });

  it("resolves initial step and stepper indices per enrollment mode", () => {
    expect(resolveInitialStep(SAMPLE_SURVEY)).toBe("enrollment");
    expect(
      resolveInitialStep({
        ...SAMPLE_SURVEY,
        rules: { ...SAMPLE_SURVEY.rules, enrollment: "none" },
      }),
    ).toBe("questions");
    expect(resolveInitialStep(SAMPLE_SURVEY, "questions")).toBe("questions");

    expect(computeStepIndex("enrollment", "email-magic-link")).toBe(0);
    expect(computeStepIndex("link_sent", "email-magic-link")).toBe(1);
    expect(computeStepIndex("questions", "email-magic-link")).toBe(2);
    expect(computeStepIndex("thanks", "email-magic-link")).toBe(3);

    expect(computeStepIndex("enrollment", "email-unverified")).toBe(0);
    expect(computeStepIndex("questions", "email-unverified")).toBe(1);
    expect(computeStepIndex("thanks", "email-unverified")).toBe(2);

    expect(computeStepIndex("questions", "none")).toBe(0);
    expect(computeStepIndex("thanks", "none")).toBe(1);
  });
});
