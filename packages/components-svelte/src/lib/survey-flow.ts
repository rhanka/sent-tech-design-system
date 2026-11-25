import {
  isScopedAnswerValue,
  isSurveyDefinitionV2,
  type AnswerMap,
  type AnswerValue,
  type PrimitiveAnswerValue,
  type ScopedAnswerValue,
  type SurveyDefinition,
  type SurveyDepthMode,
  type SurveyEnrollmentMode,
  type SurveyEntryScope,
  type SurveyQuestion,
  type SurveyStep,
  type SurveySubmissionMode,
  type SurveySubmitPayload,
} from "./survey-types.js";

export type QuestionValidationError = "required" | "minSelections" | "maxSelections" | null;

export interface ActiveQuestionsOptions {
  depthMode?: SurveyDepthMode | null;
  selectedThemes?: string[];
  includeClosing?: boolean;
}

export function isValidSurveyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());
}

function isPrimitiveAnswerPresent(value: PrimitiveAnswerValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return false;
}

export function isAnswerPresent(value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (isScopedAnswerValue(value)) {
    return (
      isPrimitiveAnswerPresent(value.enterprise) || isPrimitiveAnswerPresent(value.personal)
    );
  }
  return isPrimitiveAnswerPresent(value);
}

function clonePrimitiveValue(val: PrimitiveAnswerValue): PrimitiveAnswerValue {
  if (Array.isArray(val)) return val.slice();
  if (typeof val === "object" && val !== null) return { ...val };
  return val;
}

export function getCoreSurveyQuestions(survey: SurveyDefinition): SurveyQuestion[] {
  const hasTiers = survey.questions.some((q) => q.tier != null);
  if (!hasTiers) return survey.questions;
  return survey.questions.filter((q) => q.tier === "core" || q.tier == null);
}

export function getDeepQuestionsForThemes(
  survey: SurveyDefinition,
  selectedThemes?: string[],
): SurveyQuestion[] {
  const deep = survey.questions.filter((q) => q.tier === "deep");
  if (selectedThemes == null) return deep;
  const set = new Set(selectedThemes);
  return deep.filter((q) => q.deepTheme != null && set.has(q.deepTheme));
}

export function getClosingSurveyQuestions(survey: SurveyDefinition): SurveyQuestion[] {
  return survey.questions.filter((q) => q.tier === "closing");
}

export function getActiveSurveyQuestions(
  survey: SurveyDefinition,
  options: ActiveQuestionsOptions = {},
): SurveyQuestion[] {
  const hasTiers = survey.questions.some((q) => q.tier != null);
  if (!hasTiers) return survey.questions;

  const core = getCoreSurveyQuestions(survey);
  const closing = options.includeClosing === false ? [] : getClosingSurveyQuestions(survey);

  if (options.depthMode === "deep") {
    const deep = getDeepQuestionsForThemes(survey, options.selectedThemes);
    return [...core, ...deep, ...closing];
  }

  return [...core, ...closing];
}

export function countAnsweredQuestions(
  questions: SurveyQuestion[],
  answers: AnswerMap,
): number {
  let count = 0;
  for (const q of questions) {
    if (isAnswerPresent(answers[q.id])) count += 1;
  }
  return count;
}

export function extractCleanAnswers(
  questions: SurveyQuestion[],
  answers: AnswerMap,
): AnswerMap {
  const clean: AnswerMap = {};
  for (const q of questions) {
    const val = answers[q.id];
    if (!isAnswerPresent(val)) continue;
    if (isScopedAnswerValue(val)) {
      const scoped: ScopedAnswerValue = {};
      if (isPrimitiveAnswerPresent(val.enterprise) && val.enterprise !== undefined) {
        scoped.enterprise = clonePrimitiveValue(val.enterprise);
      }
      if (isPrimitiveAnswerPresent(val.personal) && val.personal !== undefined) {
        scoped.personal = clonePrimitiveValue(val.personal);
      }
      if (Object.keys(scoped).length > 0) {
        clean[q.id] = scoped;
      }
    } else if (val !== undefined) {
      clean[q.id] = clonePrimitiveValue(val);
    }
  }
  return clean;
}

export function resolveExclusiveMultiChange(
  prev: string[],
  next: string[],
  exclusive?: string[],
): string[] {
  if (!exclusive || exclusive.length === 0) return next;
  const excl = new Set(exclusive);
  const newlyAddedExclusive = next.find((v) => excl.has(v) && !prev.includes(v));
  if (newlyAddedExclusive) {
    return [newlyAddedExclusive];
  }
  if (next.some((v) => !excl.has(v))) {
    return next.filter((v) => !excl.has(v));
  }
  return next;
}

function validateMultiArray(
  question: Extract<SurveyQuestion, { type: "multi" }>,
  arr: string[],
): QuestionValidationError {
  const hasExclusive = Boolean(
    question.exclusive?.length && arr.some((v) => question.exclusive!.includes(v)),
  );
  if (
    !hasExclusive &&
    question.minSelections != null &&
    arr.length > 0 &&
    arr.length < question.minSelections
  ) {
    return "minSelections";
  }
  if (question.maxSelections != null && arr.length > question.maxSelections) {
    return "maxSelections";
  }
  return null;
}

export function validateQuestionAnswer(
  question: SurveyQuestion,
  value: AnswerValue | undefined,
): QuestionValidationError {
  const present = isAnswerPresent(value);
  if (question.required && !present) {
    return "required";
  }
  if (question.type === "multi") {
    if (Array.isArray(value)) {
      return validateMultiArray(question, value);
    }
    if (isScopedAnswerValue(value)) {
      if (Array.isArray(value.enterprise)) {
        const err = validateMultiArray(question, value.enterprise);
        if (err) return err;
      }
      if (Array.isArray(value.personal)) {
        const err = validateMultiArray(question, value.personal);
        if (err) return err;
      }
    }
  }
  return null;
}

export function validateSubmission(
  survey: SurveyDefinition,
  answers: AnswerMap,
  mode: SurveySubmissionMode,
  activeQuestions: SurveyQuestion[] = survey.questions,
): { valid: boolean; missingIds: string[] } {
  const missingSet = new Set<string>();
  const activeIds = new Set(activeQuestions.map((q) => q.id));

  for (const id of survey.rules.requiredForSubmit ?? []) {
    if (activeIds.has(id) && !isAnswerPresent(answers[id])) {
      missingSet.add(id);
    }
  }

  for (const q of activeQuestions) {
    const err = validateQuestionAnswer(q, answers[q.id]);
    if (err === "required") {
      if (mode === "complete") missingSet.add(q.id);
    } else if (err === "minSelections" || err === "maxSelections") {
      missingSet.add(q.id);
    }
  }

  const missingIds = [...missingSet];
  if (missingIds.length > 0) {
    return { valid: false, missingIds };
  }

  if (countAnsweredQuestions(activeQuestions, answers) === 0) {
    return {
      valid: false,
      missingIds: activeQuestions.length > 0 ? [activeQuestions[0].id] : [],
    };
  }

  return { valid: true, missingIds: [] };
}

export function formatSurveyCountdown(remainingMs: number): string {
  const totalSec = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function resolveInitialStep(
  survey: SurveyDefinition,
  initialStep?: SurveyStep,
): SurveyStep {
  if (initialStep) return initialStep;
  const enrollment = survey.rules.enrollment ?? "none";
  if (enrollment !== "none") return "enrollment";
  return survey.entry ? "entry_scope" : "questions";
}

export function computeStepIndex(
  step: SurveyStep,
  enrollmentMode: SurveyEnrollmentMode = "none",
  hasEntry = false,
): number {
  if (!hasEntry) {
    if (enrollmentMode === "email-magic-link") {
      if (step === "enrollment") return 0;
      if (step === "link_sent") return 1;
      if (step === "questions" || step === "deep_themes") return 2;
      return 3;
    }
    if (enrollmentMode === "email-unverified") {
      if (step === "enrollment" || step === "link_sent") return 0;
      if (step === "questions" || step === "deep_themes") return 1;
      return 2;
    }
    return step === "thanks" ? 1 : 0;
  }

  if (enrollmentMode === "email-magic-link") {
    if (step === "enrollment") return 0;
    if (step === "link_sent") return 1;
    if (step === "entry_scope" || step === "entry_depth") return 2;
    if (step === "questions" || step === "deep_themes") return 3;
    return 4;
  }
  if (enrollmentMode === "email-unverified") {
    if (step === "enrollment" || step === "link_sent") return 0;
    if (step === "entry_scope" || step === "entry_depth") return 1;
    if (step === "questions" || step === "deep_themes") return 2;
    return 3;
  }
  if (step === "entry_scope" || step === "entry_depth") return 0;
  if (step === "questions" || step === "deep_themes") return 1;
  return 2;
}

export function sanitizeEnrollmentMeta(
  enrollmentMeta: Record<string, string>,
): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const [key, val] of Object.entries(enrollmentMeta)) {
    const trimmed = String(val ?? "").trim();
    if (trimmed) clean[key] = trimmed;
  }
  return clean;
}

export function buildSubmitPayload(params: {
  survey: SurveyDefinition;
  activeQuestions?: SurveyQuestion[];
  answers: AnswerMap;
  enrollmentMeta: Record<string, string>;
  requestedMode: SurveySubmissionMode;
  returnedFromDraft: boolean;
  entryScope?: SurveyEntryScope | null;
  depthMode?: SurveyDepthMode | null;
  selectedThemes?: string[];
  nowIso?: string;
}): SurveySubmitPayload {
  const targetQuestions = params.activeQuestions ?? params.survey.questions;
  const cleanAnswers = extractCleanAnswers(targetQuestions, params.answers);
  const answeredCount = Object.keys(cleanAnswers).length;
  const totalQuestions = targetQuestions.length;
  const nonOptionalCount = targetQuestions.filter(
    (q) => !(q.type === "text_long" || q.type === "text_short") || !q.optional,
  ).length;
  const effectiveMode: SurveySubmissionMode =
    params.requestedMode === "complete" && answeredCount >= nonOptionalCount && answeredCount > 0
      ? "complete"
      : "partial";

  const isV2 = isSurveyDefinitionV2(params.survey);

  return {
    ...(isV2 ? { schemaVersion: 2 as const } : {}),
    surveyId: params.survey.id,
    mode: effectiveMode,
    answeredCount,
    totalQuestions,
    answers: cleanAnswers,
    enrollmentMeta: sanitizeEnrollmentMeta(params.enrollmentMeta),
    ...(params.entryScope ? { entryScope: params.entryScope } : {}),
    ...(params.depthMode ? { depthMode: params.depthMode } : {}),
    ...(params.selectedThemes && params.selectedThemes.length > 0
      ? { selectedThemes: params.selectedThemes.slice() }
      : {}),
    returnedFromDraft: params.returnedFromDraft,
    submittedAt: params.nowIso ?? new Date().toISOString(),
  };
}
