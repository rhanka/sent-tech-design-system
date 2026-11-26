import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_AI_EFFECT_NEUTRAL_ID,
  DEFAULT_AI_EFFECT_NON_SUBSTANTIVE,
  DEFAULT_AI_EFFECT_OPTIONS,
  fromKeynoteQuestionnaire,
  isScopedAnswerValue,
  isSurveyDefinitionV2,
  resolveAiEffectOptions,
  resolveLocalizedText,
  shuffleSurveyOptions,
  type AiEffectQuestion,
  type KeynoteQuestionnaireDoc,
  type MultiChoiceQuestion,
  type ScaleQuestion,
  type SingleChoiceQuestion,
  type TextQuestion,
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

describe("SurveyDefinition v2 — adapter, owner decisions, ai_effect and P1 contract fields", () => {
  const SAMPLE_V2_DOC: KeynoteQuestionnaireDoc = {
    schema: "keynote-poll/questionnaires@2",
    event: { name: "/dev/mtl 2026" },
    rules: {
      anonymous: true,
      draftWindowMinutes: 30,
      minCellSize: 5,
      minTypeSize: 10,
      lowNThreshold: 120,
    },
    entry: {
      scope: {
        id: "default_scope",
        label: { fr: "Je réponds pour :", en: "I am answering for:" },
        default: "enterprise",
        options: [
          {
            id: "enterprise",
            fr: "La pratique observée dans mon entreprise",
            en: "Practice observed in my company",
            short: "En entreprise",
          },
          {
            id: "personal",
            fr: "Ma pratique perso",
            en: "My personal practice",
            short: "Pratique perso",
          },
          {
            id: "both",
            fr: "Les deux (deux réponses côte à côte)",
            en: "Both (two answers side by side)",
            short: "Les deux",
          },
        ],
      },
      depth: {
        id: "depth_mode",
        label: {
          fr: "Temps que vous souhaitez y consacrer :",
          en: "How much time would you like to spend:",
        },
        default: "fast",
        options: [
          { id: "fast", fr: "90 s · 8 questions", en: "90 s · 8 questions", questionsMax: 8 },
          {
            id: "deep",
            fr: "5 min · jusqu’à 39 questions",
            en: "5 min · up to 39 questions",
            questionsMax: 39,
            allowThemeSelection: true,
          },
        ],
      },
    },
    themes: [
      { id: "usine", section: "usine", questionCount: 6, estimatedSeconds: 45, label: { fr: "Usine", en: "Factory" } },
      { id: "connaissance", section: "connaissance", questionCount: 6, estimatedSeconds: 45, label: { fr: "Connaissance", en: "Knowledge" } },
    ],
    formats: [
      {
        id: "V2",
        name: { fr: "Du code à la décision", en: "From Code to Decision" },
        questions: [
          {
            id: "type",
            tier: "core",
            deepTheme: null,
            type: "single",
            contextual: false,
            requiredForSubmit: true,
            label: { fr: "Quel secteur ?", en: "Which sector?" },
            options: [
              { id: "manuf", fr: "Manufacturier", en: "Manufacturing", short: "Manuf." },
              { id: "startup", fr: "Startup", en: "Startup", short: "Startup" },
            ],
          },
          {
            id: "ai_impact_year",
            tier: "core",
            deepTheme: null,
            type: "scale",
            scaleKind: "bipolar",
            neutralOptionId: "imp_neutral",
            nonSubstantive: ["imp_nsp"],
            contextual: false,
            label: {
              fr: "Sur l’année, l’IA a eu sur votre travail un effet :",
              en: "Over the year, AI has had on your work an effect:",
            },
            options: [
              { id: "imp_vneg", fr: "−− · Très négatif", en: "−− · Very negative" },
              { id: "imp_neg", fr: "− · Plutôt négatif", en: "− · Mostly negative" },
              { id: "imp_neutral", fr: "0 · Neutre", en: "0 · Neutral" },
              { id: "imp_pos", fr: "+ · Plutôt positif", en: "+ · Mostly positive" },
              { id: "imp_vpos", fr: "++ · Très positif", en: "++ · Very positive" },
              { id: "imp_nsp", fr: "Je ne sais pas", en: "I don’t know" },
            ],
          },
          {
            id: "code_tools",
            tier: "core",
            deepTheme: null,
            type: "multi",
            contextual: true,
            label: { fr: "Quels assistants utilisez-vous ?", en: "Which assistants do you use?" },
            options: [
              { id: "tool_a", fr: "Assistant A", en: "Assistant A" },
              { id: "tool_b", fr: "Assistant B", en: "Assistant B" },
              { id: "aucun", fr: "Aucun", en: "None" },
            ],
            exclusive: ["aucun"],
          },
          {
            id: "sdlc",
            tier: "deep",
            deepTheme: "usine",
            type: "scale",
            contextual: true,
            label: { fr: "Maturité cycle ?", en: "Lifecycle maturity?" },
            options: [
              { id: "m1", fr: "1 · Aucun", en: "1 · None" },
              { id: "m2", fr: "2 · Essais", en: "2 · Trials" },
              { id: "m3", fr: "3 · Quotidien", en: "3 · Daily" },
              { id: "m4", fr: "4 · Intégré", en: "4 · Integrated" },
            ],
          },
          {
            id: "open_feedback",
            tier: "closing",
            deepTheme: null,
            placement: "closing",
            type: "text",
            contextual: false,
            optional: true,
            maxLength: 280,
            display: "agent_summary_only",
            label: { fr: "Question ouverte (facultatif)", en: "Open question (optional)" },
            placeholder: { fr: "280 caractères max.", en: "280 chars max." },
          },
          {
            id: "company_name",
            tier: "enrollment",
            deepTheme: null,
            placement: "enrollment",
            type: "text",
            contextual: false,
            optional: true,
            maxLength: 80,
            display: "never",
            label: { fr: "Nom de votre entreprise", en: "Company name" },
          },
        ],
      },
    ],
  };

  it("maps keynote-poll/questionnaires@2 into a versioned v2 SurveyDefinition with owner overrides", () => {
    const survey = fromKeynoteQuestionnaire(SAMPLE_V2_DOC);

    expect(survey.schemaVersion).toBe(2);
    expect(isSurveyDefinitionV2(survey)).toBe(true);
    expect(survey.id).toBe("V2");

    // Owner decision (5): no pre-selection of scope on entry
    expect(survey.entry?.scope.default).toBeNull();
    expect(survey.entry?.scope.options.map((o) => o.id)).toEqual([
      "enterprise",
      "personal",
      "both",
    ]);

    // Owner decision (2): concise sector-only promise & optional company_name kept in enrollmentFields
    expect(resolveLocalizedText(survey.entry?.scope.privacyNotice, "fr")).toMatch(/secteur/i);
    expect(resolveLocalizedText(survey.entry?.scope.privacyNotice, "en")).toMatch(/sector/i);
    expect(survey.enrollmentFields?.map((f) => f.id)).toEqual(["company_name"]);
    expect(survey.enrollmentFields?.[0]).toMatchObject({
      id: "company_name",
      optional: true,
      display: "never",
    });

    // Owner decision (1): displayed durations ~2 min and 6–8 min
    const fastOpt = survey.entry?.depth.options.find((o) => o.id === "fast");
    const deepOpt = survey.entry?.depth.options.find((o) => o.id === "deep");
    expect(resolveLocalizedText(fastOpt?.durationLabel, "fr")).toBe("~2 min");
    expect(resolveLocalizedText(fastOpt?.label, "fr")).toContain("~2 min");
    expect(resolveLocalizedText(deepOpt?.durationLabel, "fr")).toBe("6–8 min");
    expect(resolveLocalizedText(deepOpt?.label, "fr")).toContain("6–8 min");
    expect(deepOpt?.allowThemeSelection).toBe(true);

    // Tier & theme separation: closing open question stays in questions, company_name in enrollmentFields
    expect(survey.questions.filter((q) => q.tier === "core")).toHaveLength(3);
    expect(survey.questions.filter((q) => q.tier === "deep")).toHaveLength(1);
    expect(survey.questions.filter((q) => q.tier === "closing")).toHaveLength(1);
    expect(survey.themes?.map((t) => t.id)).toEqual(["usine", "connaissance"]);

    // Symmetric bipolar scale with separated "I don't know" on ai_impact_year
    const impact = survey.questions.find((q) => q.id === "ai_impact_year") as ScaleQuestion;
    expect(impact.type).toBe("scale");
    expect(impact.scaleKind).toBe("bipolar");
    expect(impact.neutralOptionId).toBe("imp_neutral");
    expect(impact.nonSubstantive).toEqual(["imp_nsp"]);
    expect(impact.contextual).toBe(false);
    expect(impact.options).toHaveLength(6);

    // Owner decision (4): closing open question kept as text_long with agent_summary_only (not enrollment)
    const openQ = survey.questions.find((q) => q.id === "open_feedback") as TextQuestion;
    expect(openQ.type).toBe("text_long");
    expect(openQ.placement).toBe("closing");
    expect(openQ.display).toBe("agent_summary_only");
    expect(openQ.optional).toBe(true);
    expect(openQ.maxLength).toBe(280);
    expect(survey.questions.some((q) => q.id === "company_name")).toBe(false);
  });

  it("loads the local scratchpad sondage-v2-questionnaire.json losslessly when present", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const candidates = [
      resolve(here, "../../../../../scratchpad/survey-form/v2/sondage-v2-questionnaire.json"),
      resolve(here, "../../../../../../scratchpad/survey-form/v2/sondage-v2-questionnaire.json"),
    ];
    const v2JsonPath = candidates.find((p) => existsSync(p));
    if (!v2JsonPath) return;

    const rawDoc = JSON.parse(readFileSync(v2JsonPath, "utf8")) as KeynoteQuestionnaireDoc;
    const survey = fromKeynoteQuestionnaire(rawDoc);
    expect(survey.schemaVersion).toBe(2);
    expect(survey.questions.filter((q) => q.tier === "core")).toHaveLength(8);
    expect(survey.questions.filter((q) => q.tier === "deep")).toHaveLength(30);
    expect(survey.questions.filter((q) => q.tier === "closing")).toHaveLength(1);
    expect(survey.themes).toHaveLength(5);
    expect(survey.enrollmentFields?.map((f) => f.id)).toEqual(["company_name"]);
  });

  it("supports single-questionnaire v2 documents without a formats[] array and ai_effect questions", () => {
    const singleDoc: KeynoteQuestionnaireDoc = {
      schema: "keynote-poll/questionnaires@2",
      questionnaire: {
        id: "devmtl-v2",
        name: { fr: "Sondage unique", en: "Single poll" },
        questions: [
          {
            id: "ai_impact_year",
            tier: "core",
            type: "ai_effect",
            contextual: false,
            label: {
              fr: "Sur l’année, l’IA a eu sur votre travail un effet :",
              en: "Over the year, AI has had on your work an effect:",
            },
          },
        ],
      },
    };

    const survey = fromKeynoteQuestionnaire(singleDoc);
    expect(survey.schemaVersion).toBe(2);
    expect(survey.id).toBe("devmtl-v2");
    const q = survey.questions[0] as AiEffectQuestion;
    expect(q.type).toBe("ai_effect");
    expect(q.neutralOptionId).toBe(DEFAULT_AI_EFFECT_NEUTRAL_ID);
    expect(q.nonSubstantive).toEqual(DEFAULT_AI_EFFECT_NON_SUBSTANTIVE);
    expect(resolveAiEffectOptions(q)).toEqual(DEFAULT_AI_EFFECT_OPTIONS);
    expect(DEFAULT_AI_EFFECT_OPTIONS).toHaveLength(6);
  });

  it("keeps v1 definitions recognized as v1 and detects scoped answer values", () => {
    const v1 = fromKeynoteQuestionnaire(SAMPLE_KEYNOTE_DOC, "A");
    expect(v1.schemaVersion).toBe(1);
    expect(isSurveyDefinitionV2(v1)).toBe(false);

    expect(isScopedAnswerValue({ enterprise: "c2" })).toBe(true);
    expect(isScopedAnswerValue({ enterprise: ["a"], personal: ["b"] })).toBe(true);
    expect(isScopedAnswerValue("plain")).toBe(false);
    expect(isScopedAnswerValue(["a", "b"])).toBe(false);
    expect(isScopedAnswerValue({ row1: "col1" })).toBe(false);
    expect(isScopedAnswerValue({})).toBe(false);
  });
});
