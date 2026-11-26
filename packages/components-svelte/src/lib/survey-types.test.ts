import { describe, expect, it } from "vitest";
import {
  fromKeynoteQuestionnaire,
  resolveLocalizedText,
  shuffleSurveyOptions,
  type KeynoteQuestionnaireDoc,
  type MultiChoiceQuestion,
  type SingleChoiceQuestion,
} from "./survey-types.js";

const SAMPLE_KEYNOTE_DOC: KeynoteQuestionnaireDoc = {
  schema: "keynote-poll/questionnaires@1",
  event: {
    name: "/dev/mtl 2026",
    session: "Keynote d’ouverture",
    date: "2026-11-27",
    place: "Concordia, Montréal",
  },
  rules: {
    anonymous: true,
    draftWindowMinutes: 30,
    minCellSize: 5,
    minTypeSize: 10,
  },
  formats: [
    {
      id: "A",
      name: { fr: "Pratiques et outils", en: "Practices and tools" },
      estimatedSeconds: { min: 90, max: 110 },
      questions: [
        {
          id: "type",
          section: "usine",
          moment: { fr: "Usine — quatre visites", en: "Factory — four visits" },
          theme: "company_type",
          type: "single",
          label: { fr: "Type d’organisation ?", en: "Organisation type?" },
          options: [
            { id: "manuf", fr: "Manufacturier", en: "Manufacturing", short: "Manuf." },
            { id: "startup", fr: "Startup", en: "Startup", short: "Startup" },
          ],
        },
        {
          id: "tools",
          section: "bio",
          moment: { fr: "Outillage", en: "Tooling" },
          theme: "code_tools",
          type: "multi",
          label: { fr: "Quels outils ?", en: "Which tools?" },
          options: [
            { id: "t1", fr: "Outil 1", en: "Tool 1", short: "T1" },
            { id: "t2", fr: "Outil 2", en: "Tool 2", short: "T2" },
            { id: "t3", fr: "Outil 3", en: "Tool 3", short: "T3" },
            { id: "t4", fr: "Outil 4", en: "Tool 4", short: "T4" },
            { id: "aucun", fr: "Aucun", en: "None", short: "Aucun" },
          ],
          exclusive: ["aucun"],
        },
        {
          id: "autonomy",
          section: "journee",
          moment: { fr: "Autonomie", en: "Autonomy" },
          theme: "autonomy",
          type: "scale",
          label: { fr: "Niveau d’autonomie ?", en: "Autonomy level?" },
          options: [
            { id: "a0", fr: "1 · Début", en: "1 · Start", short: "1" },
            { id: "a1", fr: "2 · Supervisé", en: "2 · Supervised", short: "2" },
            { id: "a2", fr: "3 · Autonome", en: "3 · Autonomous", short: "3" },
            { id: "a3", fr: "4 · Parallèle", en: "4 · Parallel", short: "4" },
          ],
        },
        {
          id: "company_name",
          section: "ouverture",
          moment: { fr: "Hors questions", en: "Outside questions" },
          theme: "company_name",
          type: "text",
          label: { fr: "Entreprise (facultatif)", en: "Company (optional)" },
          options: [],
          optional: true,
          maxLength: 80,
          display: "never",
        },
      ],
    },
  ],
};

describe("resolveLocalizedText", () => {
  it("returns plain strings unchanged", () => {
    expect(resolveLocalizedText("Hello", "fr")).toBe("Hello");
    expect(resolveLocalizedText(undefined, "fr")).toBe("");
  });

  it("picks the requested language and falls back cleanly", () => {
    const label = { fr: "Bonjour", en: "Hello" };
    expect(resolveLocalizedText(label, "fr")).toBe("Bonjour");
    expect(resolveLocalizedText(label, "fr-CA")).toBe("Bonjour");
    expect(resolveLocalizedText(label, "en")).toBe("Hello");
    expect(resolveLocalizedText(label, "en-US")).toBe("Hello");
    expect(resolveLocalizedText(label, "de")).toBe("Bonjour");
  });
});

describe("fromKeynoteQuestionnaire", () => {
  it("maps keynote format into SurveyDefinition and separates display:never fields", () => {
    const survey = fromKeynoteQuestionnaire(SAMPLE_KEYNOTE_DOC, "A");
    expect(survey.id).toBe("A");
    expect(survey.title).toEqual({ fr: "Pratiques et outils", en: "Practices and tools" });
    expect(survey.estimatedSeconds).toEqual({ min: 90, max: 110 });
    expect(survey.rules.mode).toBe("one-per-screen");
    expect(survey.rules.enrollment).toBe("email-magic-link");
    expect(survey.rules.authIssuerLabel).toBe("auth.sent-tech.ca");
    expect(survey.rules.explicitSubmitOnly).toBe(true);
    expect(survey.rules.allowPartialSubmit).toBe(true);
    expect(survey.rules.draftWindowMinutes).toBe(30);
    expect(survey.rules.requiredForSubmit).toEqual(["type"]);
    expect(survey.rules.minCellSize).toBe(5);
    expect(survey.rules.minSegmentSize).toBe(10);

    // Scored questions exclude display:never text field
    expect(survey.questions.map((q) => q.id)).toEqual(["type", "tools", "autonomy"]);
    expect(survey.enrollmentFields).toHaveLength(1);
    expect(survey.enrollmentFields?.[0]).toMatchObject({
      id: "company_name",
      display: "never",
      optional: true,
      maxLength: 80,
    });

    const multi = survey.questions[1] as MultiChoiceQuestion;
    expect(multi.type).toBe("multi");
    expect(multi.exclusive).toEqual(["aucun"]);
    expect(multi.options[0]).toEqual({
      id: "t1",
      label: { fr: "Outil 1", en: "Tool 1" },
      short: "T1",
    });
  });

  it("supports enrollment mode override and throws when format is missing", () => {
    const survey = fromKeynoteQuestionnaire(SAMPLE_KEYNOTE_DOC, "A", {
      enrollment: "email-unverified",
      offerPasskey: false,
    });
    expect(survey.rules.enrollment).toBe("email-unverified");
    expect(survey.rules.offerPasskey).toBe(false);

    expect(() => fromKeynoteQuestionnaire(SAMPLE_KEYNOTE_DOC, "Z")).toThrow(/Format "Z"/);
  });
});

describe("shuffleSurveyOptions", () => {
  const multiQ: MultiChoiceQuestion = {
    id: "tools",
    type: "multi",
    label: "Tools",
    options: [
      { id: "t1", label: "Tool 1" },
      { id: "t2", label: "Tool 2" },
      { id: "t3", label: "Tool 3" },
      { id: "t4", label: "Tool 4" },
      { id: "t5", label: "Tool 5" },
      { id: "t6", label: "Tool 6" },
      { id: "none", label: "None" },
    ],
    exclusive: ["none"],
  };

  it("returns deterministic order for the same respondent seed and pins exclusive options at the end", () => {
    const first = shuffleSurveyOptions(multiQ, "A:alice@example.org");
    const second = shuffleSurveyOptions(multiQ, "A:alice@example.org");
    expect(first.map((o) => o.id)).toEqual(second.map((o) => o.id));
    expect(first.at(-1)?.id).toBe("none");
    expect(first.map((o) => o.id).sort()).toEqual(["none", "t1", "t2", "t3", "t4", "t5", "t6"]);
  });

  it("varies order across different respondent seeds", () => {
    const orders = new Set(
      ["u1@ex.ca", "u2@ex.ca", "u3@ex.ca", "u4@ex.ca", "u5@ex.ca"].map((s) =>
        shuffleSurveyOptions(multiQ, s)
          .map((o) => o.id)
          .join(","),
      ),
    );
    expect(orders.size).toBeGreaterThan(1);
  });

  it("does not shuffle non-multi questions", () => {
    const singleQ: SingleChoiceQuestion = {
      id: "type",
      type: "single",
      label: "Type",
      options: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
        { id: "c", label: "C" },
      ],
    };
    expect(shuffleSurveyOptions(singleQ, "seed-1").map((o) => o.id)).toEqual(["a", "b", "c"]);
  });
});
