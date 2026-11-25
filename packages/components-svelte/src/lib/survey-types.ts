export type SurveyLocale = "fr" | "en";

export type SurveySchemaVersion = 1 | 2;

export type LocalizedText = string | { fr: string; en: string };

export type SurveyScope = "enterprise" | "personal";

export type SurveyEntryScope = SurveyScope | "both";

export type SurveyDepthMode = "fast" | "deep";

export type SurveyQuestionTier = "core" | "deep" | "closing";

export type SurveyScaleKind = "ordinal" | "bipolar";

export type SurveyTextPlacement = "enrollment" | "closing";

export type SurveyTextDisplay = "never" | "agent_summary_only" | "aggregate";

export interface SurveyOption {
  id: string;
  label: LocalizedText;
  short?: string;
  description?: LocalizedText;
  disabled?: boolean;
}

export interface EnrollmentField {
  id: string;
  label: LocalizedText;
  placeholder?: LocalizedText;
  helperText?: LocalizedText;
  maxLength?: number;
  optional?: boolean;
  display: "never" | "aggregate";
}

export interface SurveyEntryScopeOption {
  id: SurveyEntryScope;
  label: LocalizedText;
  short?: string;
  description?: LocalizedText;
}

export interface SurveyEntryDepthOption {
  id: SurveyDepthMode;
  label: LocalizedText;
  durationLabel?: LocalizedText;
  questionsMax?: number;
  estimatedSeconds?: { min: number; max: number };
  allowThemeSelection?: boolean;
  stopAnytimeNote?: LocalizedText;
}

export interface SurveyEntryConfig {
  scope: {
    id?: string;
    label: LocalizedText;
    /** Null/undefined enforces no pre-selection on entry. */
    default?: SurveyEntryScope | null;
    options: SurveyEntryScopeOption[];
    perQuestionHint?: LocalizedText;
    privacyNotice?: LocalizedText;
  };
  depth: {
    id?: string;
    label: LocalizedText;
    default?: SurveyDepthMode | null;
    options: SurveyEntryDepthOption[];
  };
}

export interface SurveyDeepTheme {
  id: string;
  section?: string;
  label: LocalizedText;
  questionCount?: number;
  estimatedSeconds?: number;
}

export interface QuestionBase {
  id: string;
  tier?: SurveyQuestionTier;
  deepTheme?: string | null;
  contextual?: boolean;
  section?: string;
  moment?: LocalizedText;
  theme?: string;
  label: LocalizedText;
  helperText?: LocalizedText;
  required?: boolean;
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: "single";
  options: SurveyOption[];
}

export interface MultiChoiceQuestion extends QuestionBase {
  type: "multi";
  options: SurveyOption[];
  exclusive?: string[];
  minSelections?: number;
  maxSelections?: number;
}

export interface ScaleQuestion extends QuestionBase {
  type: "scale" | "likert";
  options: SurveyOption[];
  scaleKind?: SurveyScaleKind;
  neutralOptionId?: string;
  nonSubstantive?: string[];
  minLabel?: LocalizedText;
  maxLabel?: LocalizedText;
  layout?: "auto" | "stacked" | "horizontal";
}

export interface AiEffectQuestion extends QuestionBase {
  type: "ai_effect";
  options?: SurveyOption[];
  neutralOptionId?: string;
  nonSubstantive?: string[];
  minLabel?: LocalizedText;
  maxLabel?: LocalizedText;
  layout?: "auto" | "stacked" | "horizontal";
}

export interface RatingQuestion extends QuestionBase {
  type: "rating";
  max?: number;
  allowHalf?: boolean;
  lowLabel?: LocalizedText;
  highLabel?: LocalizedText;
}

export interface NpsQuestion extends QuestionBase {
  type: "nps";
  lowLabel?: LocalizedText;
  highLabel?: LocalizedText;
}

export interface SliderQuestion extends QuestionBase {
  type: "slider";
  min: number;
  max: number;
  step?: number;
  unit?: string;
  minLabel?: LocalizedText;
  maxLabel?: LocalizedText;
}

export interface TextQuestion extends QuestionBase {
  type: "text_short" | "text_long";
  placeholder?: LocalizedText;
  maxLength?: number;
  optional?: boolean;
  placement?: SurveyTextPlacement;
  display?: SurveyTextDisplay;
}

export interface YesNoQuestion extends QuestionBase {
  type: "yes_no";
  yesLabel?: LocalizedText;
  noLabel?: LocalizedText;
}

export interface RankingQuestion extends QuestionBase {
  type: "ranking";
  options: SurveyOption[];
}

export interface MatrixQuestion extends QuestionBase {
  type: "matrix";
  rows: SurveyOption[];
  columns: SurveyOption[];
}

export type SurveyQuestion =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | ScaleQuestion
  | AiEffectQuestion
  | RatingQuestion
  | NpsQuestion
  | SliderQuestion
  | TextQuestion
  | YesNoQuestion
  | RankingQuestion
  | MatrixQuestion;

export type SurveyEnrollmentMode = "none" | "email-magic-link" | "email-unverified";

export interface SurveyRules {
  mode: "one-per-screen" | "all-at-once";
  enrollment?: SurveyEnrollmentMode;
  authIssuerLabel?: string;
  offerPasskey?: boolean;
  draftWindowMinutes?: number;
  explicitSubmitOnly: true;
  allowPartialSubmit?: boolean;
  requiredForSubmit?: string[];
  shuffleMultiOptions?: boolean;
  anonymous?: boolean;
  minCellSize?: number;
  minSegmentSize?: number;
  lowNThreshold?: number;
}

export interface SurveyPrivacyNoticeConfig {
  title: LocalizedText;
  items: LocalizedText[];
}

export interface SurveyDefinition {
  schemaVersion?: SurveySchemaVersion;
  id: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  estimatedSeconds?: { min: number; max: number };
  entry?: SurveyEntryConfig;
  themes?: SurveyDeepTheme[];
  rules: SurveyRules;
  enrollmentFields?: EnrollmentField[];
  privacyNotice?: SurveyPrivacyNoticeConfig;
  questions: SurveyQuestion[];
}

export type PrimitiveAnswerValue = string | number | string[] | Record<string, string>;

export interface ScopedAnswerValue<T extends PrimitiveAnswerValue = PrimitiveAnswerValue> {
  enterprise?: T;
  personal?: T;
}

export type AnswerValue = PrimitiveAnswerValue | ScopedAnswerValue;

export type AnswerMap = Record<string, AnswerValue>;

export type SurveyStep =
  | "enrollment"
  | "link_sent"
  | "entry_scope"
  | "entry_depth"
  | "questions"
  | "deep_themes"
  | "thanks";

export type SurveySubmissionMode = "complete" | "partial";

export interface SurveySubmitPayload {
  schemaVersion?: SurveySchemaVersion;
  surveyId: string;
  mode: SurveySubmissionMode;
  answeredCount: number;
  totalQuestions: number;
  answers: AnswerMap;
  enrollmentMeta: Record<string, string>;
  entryScope?: SurveyEntryScope;
  depthMode?: SurveyDepthMode;
  selectedThemes?: string[];
  returnedFromDraft: boolean;
  submittedAt: string;
}

export interface SurveyRequestLinkPayload {
  surveyId: string;
  email: string;
  enrollmentMeta: Record<string, string>;
}

export interface SurveyDraft {
  surveyId: string;
  answers: AnswerMap;
  questionIndex: number;
  enrollmentMeta: Record<string, string>;
  entryScope?: SurveyEntryScope | null;
  depthMode?: SurveyDepthMode | null;
  selectedThemes?: string[];
  questionScopes?: Record<string, SurveyScope>;
  step?: SurveyStep;
  expiresAt: number;
  updatedAt: number;
}

export interface SurveyPendingSubmission {
  payload: SurveySubmitPayload;
  queuedAt: number;
  attempts: number;
  lastError?: string;
}

export interface KeynoteOption {
  id: string;
  fr: string;
  en: string;
  short?: string;
  description?: { fr: string; en: string };
}

export interface KeynoteEntryScopeOption {
  id: SurveyEntryScope;
  fr: string;
  en: string;
  short?: string;
  description?: { fr: string; en: string };
}

export interface KeynoteEntryDepthOption {
  id: SurveyDepthMode;
  fr: string;
  en: string;
  durationLabel?: LocalizedText;
  questionsMax?: number;
  estimatedSeconds?: { min: number; max: number };
  allowThemeSelection?: boolean;
  stopAnytimeNote?: LocalizedText;
}

export interface KeynoteEntryConfig {
  scope: {
    id?: string;
    label: LocalizedText;
    default?: SurveyEntryScope | null;
    options: KeynoteEntryScopeOption[];
    perQuestionHint?: LocalizedText;
    privacyNotice?: LocalizedText;
  };
  depth: {
    id?: string;
    label: LocalizedText;
    default?: SurveyDepthMode | null;
    options: KeynoteEntryDepthOption[];
  };
}

export interface KeynoteTheme {
  id: string;
  section?: string;
  questionCount?: number;
  estimatedSeconds?: number;
  label: LocalizedText;
}

export interface KeynoteQuestion {
  id: string;
  tier?: SurveyQuestionTier | "enrollment";
  deepTheme?: string | null;
  contextual?: boolean;
  placement?: SurveyTextPlacement;
  section?: string;
  moment?: { fr: string; en: string };
  theme?: string;
  type: "single" | "multi" | "scale" | "ai_effect" | "text";
  scaleKind?: SurveyScaleKind;
  neutralOptionId?: string;
  nonSubstantive?: string[];
  label: { fr: string; en: string };
  helperText?: { fr: string; en: string };
  placeholder?: { fr: string; en: string };
  options?: KeynoteOption[];
  exclusive?: string[];
  minSelections?: number;
  maxSelections?: number;
  optional?: boolean;
  requiredForSubmit?: boolean;
  maxLength?: number;
  display?: SurveyTextDisplay;
}

export interface KeynoteFormat {
  id: string;
  name: { fr: string; en: string };
  estimatedSeconds?: { min: number; max: number };
  questions: KeynoteQuestion[];
}

export interface KeynoteQuestionnaireDoc {
  schema?: string;
  event?: {
    name?: string;
    session?: string;
    date?: string;
    place?: string;
  };
  rules?: {
    anonymous?: boolean;
    draftWindowMinutes?: number;
    minCellSize?: number;
    minTypeSize?: number;
    lowNThreshold?: number;
  };
  entry?: KeynoteEntryConfig;
  themes?: KeynoteTheme[];
  questionnaire?: KeynoteFormat;
  formats?: KeynoteFormat[];
}

export interface KeynoteAdapterOptions {
  enrollment?: SurveyEnrollmentMode;
  authIssuerLabel?: string;
  offerPasskey?: boolean;
  allowPartialSubmit?: boolean;
  lowNThreshold?: number;
  /** Keep source default scope instead of clearing pre-selection on entry. Default false. */
  preselectScope?: boolean;
  /** Preserve raw source depth labels instead of normalizing to ~2 min / 6–8 min. Default false. */
  preserveSourceDurations?: boolean;
}

export const DEFAULT_AI_EFFECT_NEUTRAL_ID = "imp_neutral";

export const DEFAULT_AI_EFFECT_NON_SUBSTANTIVE: readonly string[] = ["imp_nsp"];

export const DEFAULT_AI_EFFECT_OPTIONS: SurveyOption[] = [
  {
    id: "imp_vneg",
    label: { fr: "−− · Très négatif", en: "−− · Very negative" },
    short: "Effet très négatif",
  },
  {
    id: "imp_neg",
    label: { fr: "− · Plutôt négatif", en: "− · Mostly negative" },
    short: "Effet négatif",
  },
  {
    id: "imp_neutral",
    label: {
      fr: "0 · Neutre (ni positif ni négatif)",
      en: "0 · Neutral (neither positive nor negative)",
    },
    short: "Effet neutre",
  },
  {
    id: "imp_pos",
    label: { fr: "+ · Plutôt positif", en: "+ · Mostly positive" },
    short: "Effet positif",
  },
  {
    id: "imp_vpos",
    label: { fr: "++ · Très positif", en: "++ · Very positive" },
    short: "Effet très positif",
  },
  {
    id: "imp_nsp",
    label: { fr: "Je ne sais pas", en: "I don’t know" },
    short: "Effet : NSP",
  },
];

const V2_SECTOR_PRIVACY_NOTICE: LocalizedText = {
  fr: "Seul le secteur d’activité est utilisé dans l’analyse. Le nom d’entreprise reste facultatif et n’est jamais affiché.",
  en: "Only the sector is used in the analysis. Any company name stays optional and is never displayed.",
};

export function resolveAiEffectOptions(question: AiEffectQuestion): SurveyOption[] {
  return question.options && question.options.length > 0
    ? question.options
    : DEFAULT_AI_EFFECT_OPTIONS;
}

export function isSurveyDefinitionV2(survey: SurveyDefinition): boolean {
  return (
    survey.schemaVersion === 2 ||
    Boolean(survey.entry) ||
    Boolean(survey.themes && survey.themes.length > 0)
  );
}

export function isScopedAnswerValue(
  value: AnswerValue | undefined,
): value is ScopedAnswerValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  if (keys.length === 0) return false;
  return keys.every((k) => k === "enterprise" || k === "personal");
}

export function resolveSurveyLocale(locale?: string): SurveyLocale {
  return (locale ?? "fr").toLowerCase().startsWith("en") ? "en" : "fr";
}

export function resolveLocalizedText(
  text: LocalizedText | undefined,
  locale?: string,
): string {
  if (text == null) return "";
  if (typeof text === "string") return text;
  const lang = resolveSurveyLocale(locale);
  return text[lang] || text.fr || text.en || "";
}

function mapKeynoteOptions(options?: KeynoteOption[]): SurveyOption[] {
  return (options ?? []).map((opt) => ({
    id: opt.id,
    label: { fr: opt.fr, en: opt.en },
    ...(opt.short ? { short: opt.short } : {}),
    ...(opt.description ? { description: opt.description } : {}),
  }));
}

function mapKeynoteEntry(
  entry: KeynoteEntryConfig,
  options: KeynoteAdapterOptions,
): SurveyEntryConfig {
  return {
    scope: {
      ...(entry.scope.id ? { id: entry.scope.id } : {}),
      label: entry.scope.label,
      default: options.preselectScope ? (entry.scope.default ?? null) : null,
      options: entry.scope.options.map((opt) => ({
        id: opt.id,
        label: { fr: opt.fr, en: opt.en },
        ...(opt.short ? { short: opt.short } : {}),
        ...(opt.description ? { description: opt.description } : {}),
      })),
      ...(entry.scope.perQuestionHint ? { perQuestionHint: entry.scope.perQuestionHint } : {}),
      privacyNotice: V2_SECTOR_PRIVACY_NOTICE,
    },
    depth: {
      ...(entry.depth.id ? { id: entry.depth.id } : {}),
      label: entry.depth.label,
      default: entry.depth.default ?? null,
      options: entry.depth.options.map((opt) => {
        if (options.preserveSourceDurations) {
          return {
            id: opt.id,
            label: { fr: opt.fr, en: opt.en },
            ...(opt.durationLabel ? { durationLabel: opt.durationLabel } : {}),
            ...(opt.questionsMax != null ? { questionsMax: opt.questionsMax } : {}),
            ...(opt.estimatedSeconds ? { estimatedSeconds: opt.estimatedSeconds } : {}),
            ...(opt.allowThemeSelection != null
              ? { allowThemeSelection: opt.allowThemeSelection }
              : {}),
            ...(opt.stopAnytimeNote ? { stopAnytimeNote: opt.stopAnytimeNote } : {}),
          };
        }

        const isFast = opt.id === "fast";
        const questionsMax = opt.questionsMax ?? (isFast ? 8 : 39);
        const durationLabel: LocalizedText = isFast
          ? { fr: "~2 min", en: "~2 min" }
          : { fr: "6–8 min", en: "6–8 min" };
        const label: LocalizedText = isFast
          ? {
              fr: `~2 min · ${questionsMax} questions`,
              en: `~2 min · ${questionsMax} questions`,
            }
          : {
              fr: `6–8 min · jusqu’à ${questionsMax} questions`,
              en: `6–8 min · up to ${questionsMax} questions`,
            };

        return {
          id: opt.id,
          label,
          durationLabel,
          questionsMax,
          estimatedSeconds: isFast ? { min: 100, max: 130 } : { min: 360, max: 480 },
          ...(opt.allowThemeSelection != null
            ? { allowThemeSelection: opt.allowThemeSelection }
            : {}),
          ...(opt.stopAnytimeNote ? { stopAnytimeNote: opt.stopAnytimeNote } : {}),
        };
      }),
    },
  };
}

export function fromKeynoteQuestionnaire(
  doc: KeynoteQuestionnaireDoc,
  formatId?: string,
  options: KeynoteAdapterOptions = {},
): SurveyDefinition {
  const candidates: KeynoteFormat[] = doc.questionnaire
    ? [doc.questionnaire]
    : (doc.formats ?? []);

  let format: KeynoteFormat | undefined;
  if (formatId) {
    format = candidates.find((f) => f.id === formatId);
    if (!format) {
      throw new Error(`Format "${formatId}" not found in keynote questionnaire document.`);
    }
  } else if (candidates.length === 1) {
    format = candidates[0];
  } else {
    throw new Error(`Format "${formatId ?? ""}" not found in keynote questionnaire document.`);
  }

  const isV2 =
    doc.schema === "keynote-poll/questionnaires@2" ||
    Boolean(doc.entry) ||
    Boolean(doc.themes && doc.themes.length > 0) ||
    Boolean(doc.questionnaire);

  const enrollmentFields: EnrollmentField[] = [];
  const questions: SurveyQuestion[] = [];
  const explicitRequiredIds: string[] = [];

  for (const q of format.questions) {
    const isClosingText =
      q.type === "text" &&
      (q.placement === "closing" || q.tier === "closing" || q.display === "agent_summary_only");

    if (
      !isClosingText &&
      (q.type === "text" ||
        q.display === "never" ||
        q.placement === "enrollment" ||
        q.tier === "enrollment")
    ) {
      enrollmentFields.push({
        id: q.id,
        label: q.label,
        ...(q.placeholder ? { placeholder: q.placeholder } : {}),
        ...(q.helperText ? { helperText: q.helperText } : {}),
        optional: q.optional ?? true,
        ...(q.maxLength != null ? { maxLength: q.maxLength } : {}),
        display: q.display === "aggregate" ? "aggregate" : "never",
      });
      continue;
    }

    if (q.requiredForSubmit) {
      explicitRequiredIds.push(q.id);
    }

    const tier: SurveyQuestionTier | undefined =
      q.tier === "core" || q.tier === "deep" || q.tier === "closing" ? q.tier : undefined;

    const base: QuestionBase = {
      id: q.id,
      ...(tier ? { tier } : {}),
      ...(q.deepTheme !== undefined ? { deepTheme: q.deepTheme } : {}),
      ...(q.contextual !== undefined ? { contextual: q.contextual } : {}),
      ...(q.section ? { section: q.section } : {}),
      ...(q.moment ? { moment: q.moment } : {}),
      ...(q.theme ? { theme: q.theme } : {}),
      label: q.label,
      ...(q.helperText ? { helperText: q.helperText } : {}),
    };

    if (isClosingText) {
      questions.push({
        ...base,
        tier: tier ?? "closing",
        type: "text_long",
        placement: q.placement ?? "closing",
        display: q.display ?? "agent_summary_only",
        optional: q.optional ?? true,
        ...(q.maxLength != null ? { maxLength: q.maxLength } : {}),
        ...(q.placeholder ? { placeholder: q.placeholder } : {}),
      });
      continue;
    }

    const mappedOptions = mapKeynoteOptions(q.options);
    if (q.type === "multi") {
      questions.push({
        ...base,
        type: "multi",
        options: mappedOptions,
        ...(q.exclusive?.length ? { exclusive: q.exclusive.slice() } : {}),
        ...(q.minSelections != null ? { minSelections: q.minSelections } : {}),
        ...(q.maxSelections != null ? { maxSelections: q.maxSelections } : {}),
      });
    } else if (q.type === "ai_effect") {
      questions.push({
        ...base,
        type: "ai_effect",
        ...(mappedOptions.length > 0 ? { options: mappedOptions } : {}),
        neutralOptionId: q.neutralOptionId ?? DEFAULT_AI_EFFECT_NEUTRAL_ID,
        nonSubstantive: q.nonSubstantive?.length
          ? q.nonSubstantive.slice()
          : [...DEFAULT_AI_EFFECT_NON_SUBSTANTIVE],
      });
    } else if (q.type === "scale") {
      questions.push({
        ...base,
        type: "scale",
        options: mappedOptions,
        ...(q.scaleKind ? { scaleKind: q.scaleKind } : {}),
        ...(q.neutralOptionId ? { neutralOptionId: q.neutralOptionId } : {}),
        ...(q.nonSubstantive?.length ? { nonSubstantive: q.nonSubstantive.slice() } : {}),
      });
    } else {
      questions.push({
        ...base,
        type: "single",
        options: mappedOptions,
      });
    }
  }

  const requiredForSubmit =
    explicitRequiredIds.length > 0
      ? explicitRequiredIds
      : questions.some((q) => q.id === "type")
        ? ["type"]
        : [];

  const themes: SurveyDeepTheme[] | undefined = doc.themes?.map((t) => ({
    id: t.id,
    ...(t.section ? { section: t.section } : {}),
    label: t.label,
    ...(t.questionCount != null ? { questionCount: t.questionCount } : {}),
    ...(t.estimatedSeconds != null ? { estimatedSeconds: t.estimatedSeconds } : {}),
  }));

  return {
    schemaVersion: isV2 ? 2 : 1,
    id: format.id,
    title: format.name,
    ...(doc.event?.name ? { subtitle: doc.event.name } : {}),
    ...(format.estimatedSeconds ? { estimatedSeconds: format.estimatedSeconds } : {}),
    ...(doc.entry ? { entry: mapKeynoteEntry(doc.entry, options) } : {}),
    ...(themes && themes.length > 0 ? { themes } : {}),
    rules: {
      mode: "one-per-screen",
      enrollment: options.enrollment ?? "email-magic-link",
      authIssuerLabel: options.authIssuerLabel ?? "auth.sent-tech.ca",
      offerPasskey: options.offerPasskey ?? true,
      draftWindowMinutes: doc.rules?.draftWindowMinutes ?? 30,
      explicitSubmitOnly: true,
      allowPartialSubmit: options.allowPartialSubmit ?? true,
      requiredForSubmit,
      shuffleMultiOptions: true,
      anonymous: doc.rules?.anonymous ?? true,
      minCellSize: doc.rules?.minCellSize ?? 5,
      minSegmentSize: doc.rules?.minTypeSize ?? 10,
      lowNThreshold: options.lowNThreshold ?? doc.rules?.lowNThreshold ?? 120,
    },
    ...(enrollmentFields.length > 0 ? { enrollmentFields } : {}),
    questions,
  };
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleSurveyOptions(
  question: SurveyQuestion,
  seedStr: string,
): SurveyOption[] {
  if (question.type !== "multi") {
    if (question.type === "ai_effect") {
      return resolveAiEffectOptions(question);
    }
    return "options" in question && question.options ? question.options : [];
  }
  const exclusiveSet = new Set(question.exclusive ?? []);
  const fixed = question.options.filter((o) => exclusiveSet.has(o.id));
  const movable = question.options.filter((o) => !exclusiveSet.has(o.id)).slice();

  let h = 2166136261;
  const input = `${question.id}:${seedStr || "anon"}`;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const nextRand = mulberry32(h >>> 0);
  for (let i = movable.length - 1; i > 0; i -= 1) {
    const j = Math.floor(nextRand() * (i + 1));
    [movable[i], movable[j]] = [movable[j], movable[i]];
  }
  return [...movable, ...fixed];
}
