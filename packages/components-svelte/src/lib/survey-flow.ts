import type {
  AnswerMap,
  AnswerValue,
  SurveyDefinition,
  SurveyEnrollmentMode,
  SurveyQuestion,
  SurveyStep,
  SurveySubmissionMode,
  SurveySubmitPayload,
} from "./survey-types.js";

export type QuestionValidationError = "required" | "minSelections" | "maxSelections" | null;

export function isValidSurveyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());
}

export function isAnswerPresent(value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return false;
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
    if (Array.isArray(val)) {
      clean[q.id] = val.slice();
    } else if (typeof val === "object" && val !== null) {
      clean[q.id] = { ...val };
    } else {
      clean[q.id] = val;
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

export function validateQuestionAnswer(
  question: SurveyQuestion,
  value: AnswerValue | undefined,
): QuestionValidationError {
  const present = isAnswerPresent(value);
  if (question.required && !present) {
    return "required";
  }
  if (question.type === "multi" && Array.isArray(value)) {
    if (question.minSelections != null && value.length > 0 && value.length < question.minSelections) {
      return "minSelections";
    }
    if (question.maxSelections != null && value.length > question.maxSelections) {
      return "maxSelections";
    }
  }
  return null;
}

export function validateSubmission(
  survey: SurveyDefinition,
  answers: AnswerMap,
  mode: SurveySubmissionMode,
): { valid: boolean; missingIds: string[] } {
  const missingSet = new Set<string>();

  for (const id of survey.rules.requiredForSubmit ?? []) {
    if (!isAnswerPresent(answers[id])) {
      missingSet.add(id);
    }
  }

  if (mode === "complete") {
    for (const q of survey.questions) {
      if (q.required && !isAnswerPresent(answers[q.id])) {
        missingSet.add(q.id);
      }
    }
  }

  const missingIds = [...missingSet];
  if (missingIds.length > 0) {
    return { valid: false, missingIds };
  }

  if (countAnsweredQuestions(survey.questions, answers) === 0) {
    return {
      valid: false,
      missingIds: survey.questions.length > 0 ? [survey.questions[0].id] : [],
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
  return enrollment === "none" ? "questions" : "enrollment";
}

export function computeStepIndex(
  step: SurveyStep,
  enrollmentMode: SurveyEnrollmentMode = "none",
): number {
  if (enrollmentMode === "email-magic-link") {
    if (step === "enrollment") return 0;
    if (step === "link_sent") return 1;
    if (step === "questions") return 2;
    return 3;
  }
  if (enrollmentMode === "email-unverified") {
    if (step === "enrollment" || step === "link_sent") return 0;
    if (step === "questions") return 1;
    return 2;
  }
  return step === "thanks" ? 1 : 0;
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
  answers: AnswerMap;
  enrollmentMeta: Record<string, string>;
  requestedMode: SurveySubmissionMode;
  returnedFromDraft: boolean;
  nowIso?: string;
}): SurveySubmitPayload {
  const cleanAnswers = extractCleanAnswers(params.survey.questions, params.answers);
  const answeredCount = Object.keys(cleanAnswers).length;
  const totalQuestions = params.survey.questions.length;
  const effectiveMode: SurveySubmissionMode =
    params.requestedMode === "complete" && answeredCount === totalQuestions
      ? "complete"
      : "partial";

  return {
    surveyId: params.survey.id,
    mode: effectiveMode,
    answeredCount,
    totalQuestions,
    answers: cleanAnswers,
    enrollmentMeta: sanitizeEnrollmentMeta(params.enrollmentMeta),
    returnedFromDraft: params.returnedFromDraft,
    submittedAt: params.nowIso ?? new Date().toISOString(),
  };
}
