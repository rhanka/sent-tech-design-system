export type SurveyLocale = "fr" | "en";

export type LocalizedText = string | { fr: string; en: string };

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

export interface QuestionBase {
  id: string;
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
  id: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  estimatedSeconds?: { min: number; max: number };
  rules: SurveyRules;
  enrollmentFields?: EnrollmentField[];
  privacyNotice?: SurveyPrivacyNoticeConfig;
  questions: SurveyQuestion[];
}

export type AnswerValue = string | number | string[] | Record<string, string>;

export type AnswerMap = Record<string, AnswerValue>;

export type SurveyStep = "enrollment" | "link_sent" | "questions" | "thanks";

export type SurveySubmissionMode = "complete" | "partial";

export interface SurveySubmitPayload {
  surveyId: string;
  mode: SurveySubmissionMode;
  answeredCount: number;
  totalQuestions: number;
  answers: AnswerMap;
  enrollmentMeta: Record<string, string>;
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
}

export interface KeynoteQuestion {
  id: string;
  section?: string;
  moment?: { fr: string; en: string };
  theme?: string;
  type: "single" | "multi" | "scale" | "text";
  label: { fr: string; en: string };
  options?: KeynoteOption[];
  exclusive?: string[];
  optional?: boolean;
  maxLength?: number;
  display?: "never" | "aggregate";
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
  };
  formats: KeynoteFormat[];
}

export interface KeynoteAdapterOptions {
  enrollment?: SurveyEnrollmentMode;
  authIssuerLabel?: string;
  offerPasskey?: boolean;
  allowPartialSubmit?: boolean;
  lowNThreshold?: number;
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
  }));
}

export function fromKeynoteQuestionnaire(
  doc: KeynoteQuestionnaireDoc,
  formatId: string,
  options: KeynoteAdapterOptions = {},
): SurveyDefinition {
  const format = doc.formats.find((f) => f.id === formatId);
  if (!format) {
    throw new Error(`Format "${formatId}" not found in keynote questionnaire document.`);
  }

  const enrollmentFields: EnrollmentField[] = [];
  const questions: SurveyQuestion[] = [];

  for (const q of format.questions) {
    if (q.type === "text" || q.display === "never") {
      enrollmentFields.push({
        id: q.id,
        label: q.label,
        optional: q.optional ?? true,
        ...(q.maxLength != null ? { maxLength: q.maxLength } : {}),
        display: q.display ?? "never",
      });
      continue;
    }

    const base: QuestionBase = {
      id: q.id,
      ...(q.section ? { section: q.section } : {}),
      ...(q.moment ? { moment: q.moment } : {}),
      ...(q.theme ? { theme: q.theme } : {}),
      label: q.label,
    };

    const mappedOptions = mapKeynoteOptions(q.options);
    if (q.type === "multi") {
      questions.push({
        ...base,
        type: "multi",
        options: mappedOptions,
        ...(q.exclusive?.length ? { exclusive: q.exclusive.slice() } : {}),
      });
    } else if (q.type === "scale") {
      questions.push({
        ...base,
        type: "scale",
        options: mappedOptions,
      });
    } else {
      questions.push({
        ...base,
        type: "single",
        options: mappedOptions,
      });
    }
  }

  const requiredForSubmit = questions.some((q) => q.id === "type") ? ["type"] : [];

  return {
    id: format.id,
    title: format.name,
    ...(doc.event?.name ? { subtitle: doc.event.name } : {}),
    ...(format.estimatedSeconds ? { estimatedSeconds: format.estimatedSeconds } : {}),
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
      lowNThreshold: options.lowNThreshold ?? 120,
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
    return "options" in question ? question.options : [];
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
