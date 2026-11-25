import { describe, expect, it } from "vitest";
import {
  buildSubmitPayload,
  computeStepIndex,
  countAnsweredQuestions,
  extractCleanAnswers,
  formatSurveyCountdown,
  getActiveSurveyQuestions,
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

  it("enforces minSelections and maxSelections during validateSubmission (complete and partial)", () => {
    const surveyWithMin: SurveyDefinition = {
      ...SAMPLE_SURVEY,
      questions: [
        SAMPLE_SURVEY.questions[0],
        {
          id: "tools",
          type: "multi",
          label: { fr: "Outils ?", en: "Tools?" },
          exclusive: ["none"],
          minSelections: 2,
          maxSelections: 2,
          options: [
            { id: "t1", label: "T1" },
            { id: "t2", label: "T2" },
            { id: "t3", label: "T3" },
            { id: "none", label: "None" },
          ],
        },
      ],
    };

    expect(
      validateSubmission(surveyWithMin, { type: "startup", tools: ["t1"] }, "complete"),
    ).toEqual({
      valid: false,
      missingIds: ["tools"],
    });
    expect(
      validateSubmission(surveyWithMin, { type: "startup", tools: ["t1"] }, "partial"),
    ).toEqual({
      valid: false,
      missingIds: ["tools"],
    });
    expect(
      validateSubmission(surveyWithMin, { type: "startup", tools: ["t1", "t2", "t3"] }, "complete"),
    ).toEqual({
      valid: false,
      missingIds: ["tools"],
    });
    expect(
      validateSubmission(surveyWithMin, { type: "startup", tools: ["t1", "t2"] }, "complete"),
    ).toEqual({
      valid: true,
      missingIds: [],
    });
    // Exclusive option satisfies minSelections
    expect(
      validateSubmission(surveyWithMin, { type: "startup", tools: ["none"] }, "complete"),
    ).toEqual({
      valid: true,
      missingIds: [],
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

  it("filters v2 active questions by depth mode and selected themes", () => {
    const v2Survey: SurveyDefinition = {
      schemaVersion: 2,
      id: "V2",
      title: { fr: "Sondage v2", en: "Survey v2" },
      entry: {
        scope: {
          label: { fr: "Je réponds pour :", en: "Answering for:" },
          default: null,
          options: [
            { id: "enterprise", label: { fr: "Entreprise", en: "Company" } },
            { id: "personal", label: { fr: "Perso", en: "Personal" } },
            { id: "both", label: { fr: "Les deux", en: "Both" } },
          ],
        },
        depth: {
          label: { fr: "Durée :", en: "Duration:" },
          options: [
            { id: "fast", label: { fr: "~2 min", en: "~2 min" } },
            { id: "deep", label: { fr: "6–8 min", en: "6–8 min" }, allowThemeSelection: true },
          ],
        },
      },
      themes: [
        { id: "usine", label: { fr: "Usine", en: "Factory" } },
        { id: "decision", label: { fr: "Décision", en: "Decision" } },
      ],
      rules: {
        mode: "one-per-screen",
        enrollment: "none",
        explicitSubmitOnly: true,
        requiredForSubmit: ["type"],
      },
      questions: [
        {
          id: "type",
          tier: "core",
          contextual: false,
          type: "single",
          label: "Secteur",
          options: [
            { id: "startup", label: "Startup" },
            { id: "pme", label: "PME" },
          ],
        },
        {
          id: "code_tools",
          tier: "core",
          contextual: true,
          type: "multi",
          maxSelections: 2,
          label: "Outils",
          options: [
            { id: "a", label: "A" },
            { id: "b", label: "B" },
            { id: "c", label: "C" },
          ],
        },
        {
          id: "sdlc",
          tier: "deep",
          deepTheme: "usine",
          contextual: true,
          type: "single",
          label: "SDLC",
          options: [
            { id: "m1", label: "1" },
            { id: "m2", label: "2" },
          ],
        },
        {
          id: "spec",
          tier: "deep",
          deepTheme: "decision",
          contextual: true,
          type: "single",
          label: "Specs",
          options: [
            { id: "s1", label: "1" },
            { id: "s2", label: "2" },
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
          label: "Question ouverte",
        },
      ],
    };

    expect(resolveInitialStep(v2Survey)).toBe("entry_scope");
    expect(computeStepIndex("entry_scope", "none", true)).toBe(0);
    expect(computeStepIndex("entry_depth", "none", true)).toBe(0);
    expect(computeStepIndex("questions", "none", true)).toBe(1);
    expect(computeStepIndex("deep_themes", "none", true)).toBe(1);
    expect(computeStepIndex("thanks", "none", true)).toBe(2);

    expect(
      getActiveSurveyQuestions(v2Survey, { depthMode: "fast" }).map((q) => q.id),
    ).toEqual(["type", "code_tools", "open_feedback"]);

    expect(
      getActiveSurveyQuestions(v2Survey, {
        depthMode: "deep",
        selectedThemes: ["usine"],
      }).map((q) => q.id),
    ).toEqual(["type", "code_tools", "sdlc", "open_feedback"]);

    // Scoped answers count, clean, validate, and build v2 submit payload
    const rawAnswers = {
      type: "startup",
      code_tools: { enterprise: ["a"], personal: [] },
      sdlc: { personal: "" },
    };
    const fastQs = getActiveSurveyQuestions(v2Survey, { depthMode: "fast" });
    expect(countAnsweredQuestions(fastQs, rawAnswers)).toBe(2);
    expect(extractCleanAnswers(fastQs, rawAnswers)).toEqual({
      type: "startup",
      code_tools: { enterprise: ["a"] },
    });
    expect(
      validateQuestionAnswer(v2Survey.questions[1], {
        enterprise: ["a", "b", "c"],
      }),
    ).toBe("maxSelections");

    const payload = buildSubmitPayload({
      survey: v2Survey,
      activeQuestions: fastQs,
      answers: rawAnswers,
      enrollmentMeta: {},
      entryScope: "enterprise",
      depthMode: "fast",
      requestedMode: "partial",
      returnedFromDraft: false,
      nowIso: "2026-11-27T15:00:00.000Z",
    });
    expect(payload.schemaVersion).toBe(2);
    expect(payload.entryScope).toBe("enterprise");
    expect(payload.depthMode).toBe("fast");
    expect(payload.answeredCount).toBe(2);
    expect(payload.totalQuestions).toBe(3);
  });

  it("enforces minSelections, maxSelections, and exclusive exemption on v2 scoped multi answers in validateSubmission", () => {
    const v2MultiSurvey: SurveyDefinition = {
      schemaVersion: 2,
      id: "V2-MULTI",
      title: "V2 Multi",
      rules: {
        mode: "one-per-screen",
        enrollment: "none",
        explicitSubmitOnly: true,
        requiredForSubmit: ["type"],
      },
      questions: [
        {
          id: "type",
          tier: "core",
          type: "single",
          label: "Secteur",
          options: [{ id: "startup", label: "Startup" }],
        },
        {
          id: "code_tools",
          tier: "core",
          contextual: true,
          type: "multi",
          exclusive: ["aucun"],
          minSelections: 2,
          maxSelections: 2,
          label: "Outils",
          options: [
            { id: "a", label: "A" },
            { id: "b", label: "B" },
            { id: "c", label: "C" },
            { id: "aucun", label: "Aucun" },
          ],
        },
        {
          id: "deep_q",
          tier: "deep",
          deepTheme: "usine",
          type: "single",
          required: true,
          label: "Deep required",
          options: [{ id: "d1", label: "D1" }],
        },
      ],
    };

    const fastQs = getActiveSurveyQuestions(v2MultiSurvey, { depthMode: "fast" });
    // Too few on enterprise side fails both complete and partial
    expect(
      validateSubmission(
        v2MultiSurvey,
        { type: "startup", code_tools: { enterprise: ["a"] } },
        "complete",
        fastQs,
      ),
    ).toEqual({ valid: false, missingIds: ["code_tools"] });
    expect(
      validateSubmission(
        v2MultiSurvey,
        { type: "startup", code_tools: { personal: ["a"] } },
        "partial",
        fastQs,
      ),
    ).toEqual({ valid: false, missingIds: ["code_tools"] });
    // Exclusive option ("aucun") on enterprise or personal satisfies minSelections > 1
    expect(
      validateSubmission(
        v2MultiSurvey,
        { type: "startup", code_tools: { enterprise: ["aucun"], personal: ["a", "b"] } },
        "complete",
        fastQs,
      ),
    ).toEqual({ valid: true, missingIds: [] });
    // Too many on personal side fails
    expect(
      validateSubmission(
        v2MultiSurvey,
        { type: "startup", code_tools: { enterprise: ["a", "b"], personal: ["a", "b", "c"] } },
        "complete",
        fastQs,
      ),
    ).toEqual({ valid: false, missingIds: ["code_tools"] });
  });
});
