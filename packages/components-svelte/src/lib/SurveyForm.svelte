<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type {
    AnswerMap,
    LocalizedText,
    SurveyDefinition,
    SurveyDraft,
    SurveyRequestLinkPayload,
    SurveyStep,
    SurveySubmitPayload,
  } from "./survey-types.js";

  export interface SurveyFormPasskeyOffer {
    title?: LocalizedText;
    description?: LocalizedText;
    ctaLabel?: LocalizedText;
    savedLabel?: LocalizedText;
  }

  export type SurveyFormProps = Omit<HTMLAttributes<HTMLDivElement>, "class" | "onsubmit"> & {
    survey: SurveyDefinition;
    locale?: string;
    initialAnswers?: AnswerMap;
    initialStep?: SurveyStep;
    initialEmail?: string;
    readOnly?: boolean;
    /** Allow opening the poll directly from the link_sent screen (useful for demos/tests). */
    allowSimulatedLinkOpen?: boolean;
    /** Optional salt override for salted localStorage draft keys. */
    storageSalt?: string;
    /** Persist local 30-min drafts and offline pending submissions. Default true. */
    persistDraft?: boolean;
    /** Optional copy overrides for the thank-you passkey offer card. */
    passkeyOffer?: SurveyFormPasskeyOffer;
    /** Local UI hook when draft answers or step change (never sent to server). */
    ondraftchange?: (draft: SurveyDraft) => void;
    /** Emitted when the respondent requests a magic link or enrolls by email. */
    onrequestlink?: (payload: SurveyRequestLinkPayload) => void | Promise<void>;
    /** Emitted ONLY on an explicit user submit gesture. Rejection queues offline retry. */
    onsubmit?: (payload: SurveySubmitPayload) => void | Promise<void>;
    /** Emitted when the respondent clicks the optional passkey button on thanks. */
    onregisterpasskey?: () => void | Promise<void>;
    /** Optional action buttons snippet rendered at the bottom of the thank-you screen. */
    thanksActions?: Snippet<[SurveySubmitPayload]>;
    /** Optional custom passkey snippet replacing the default passkey card. */
    passkeySlot?: Snippet;
    class?: string;
  };
</script>

<script lang="ts">
  import { tick } from "svelte";
  import Alert from "./Alert.svelte";
  import Autosave from "./Autosave.svelte";
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import Card from "./Card.svelte";
  import CheckboxGroup from "./CheckboxGroup.svelte";
  import Collapsible from "./Collapsible.svelte";
  import Divider from "./Divider.svelte";
  import ErrorSummary from "./ErrorSummary.svelte";
  import Inline from "./Inline.svelte";
  import Input from "./Input.svelte";
  import LikertScale from "./LikertScale.svelte";
  import Modal from "./Modal.svelte";
  import ProgressBar from "./ProgressBar.svelte";
  import RadioGroup from "./RadioGroup.svelte";
  import Stack from "./Stack.svelte";
  import Stepper from "./Stepper.svelte";
  import Tag from "./Tag.svelte";
  import Typography from "./Typography.svelte";
  import UnorderedList from "./UnorderedList.svelte";
  import {
    buildSubmitPayload,
    computeStepIndex,
    countAnsweredQuestions,
    formatSurveyCountdown,
    isValidSurveyEmail,
    resolveExclusiveMultiChange,
    resolveInitialStep,
    sanitizeEnrollmentMeta,
    validateQuestionAnswer,
    validateSubmission,
  } from "./survey-flow.js";
  import {
    DEFAULT_DRAFT_TTL_MS,
    clearPendingSubmission,
    clearSurveyDraft,
    hasSurveyPasskey,
    loadPendingSubmission,
    loadSurveyDraft,
    savePendingSubmission,
    saveSurveyDraft,
    saveSurveyPasskey,
  } from "./survey-storage.js";
  import {
    resolveLocalizedText,
    resolveSurveyLocale,
    shuffleSurveyOptions,
    type AnswerValue,
    type SurveyPendingSubmission,
    type SurveyQuestion,
  } from "./survey-types.js";

  let {
    survey,
    locale = "fr",
    initialAnswers,
    initialStep,
    initialEmail = "",
    readOnly = false,
    allowSimulatedLinkOpen = true,
    storageSalt,
    persistDraft = true,
    passkeyOffer,
    ondraftchange,
    onrequestlink,
    onsubmit,
    onregisterpasskey,
    thanksActions,
    passkeySlot,
    class: className,
    ...rest
  }: SurveyFormProps = $props();

  const lang = $derived(resolveSurveyLocale(locale));
  const enrollmentMode = $derived(survey.rules.enrollment ?? "none");
  const draftWindowMinutes = $derived(survey.rules.draftWindowMinutes ?? 30);
  const draftTtlMs = $derived(
    draftWindowMinutes > 0 ? draftWindowMinutes * 60 * 1000 : DEFAULT_DRAFT_TTL_MS,
  );
  const authIssuer = $derived(survey.rules.authIssuerLabel ?? "auth.sent-tech.ca");

  const copy = $derived(
    lang === "fr"
      ? {
          stepsMagic: [
            { label: "E-mail" },
            { label: "Lien envoyé" },
            { label: "Sondage" },
            { label: "Merci" },
          ],
          stepsEmail: [{ label: "E-mail" }, { label: "Sondage" }, { label: "Merci" }],
          stepsDirect: [{ label: "Sondage" }, { label: "Merci" }],
          stepperLabel: "Progression du sondage",
          emailTitle: "Accéder au sondage",
          emailIntro:
            "Saisissez votre e-mail pour ouvrir votre session. Vos réponses restent anonymes ; le brouillon est conservé 30 minutes.",
          emailLabel: "Adresse e-mail",
          emailPlaceholder: "vous@organisation.ca",
          emailHelper: `Vérifiée par lien ${authIssuer} · aucune double authentification exigée.`,
          emailHelperUnverified: "Utilisée uniquement pour retrouver votre brouillon pendant 30 minutes.",
          emailError: "Veuillez saisir une adresse e-mail valide.",
          sendLinkBtn: "Recevoir mon lien",
          startSurveyBtn: "Commencer le sondage",
          resumeTitle: "Brouillon actif retrouvé",
          resumeMsg: (n: number, tot: number, rem: string) =>
            `${n}/${tot} réponses enregistrées en brouillon (temps restant : ${rem}).`,
          resumeBtn: "Reprendre mon brouillon",
          linkSentTitle: "Un lien vient de partir",
          linkSentMsg: (addr: string) =>
            `Un lien de connexion a été envoyé par ${authIssuer} à ${addr}. Aucune double authentification n’est exigée.`,
          changeEmailBtn: "Changer d’e-mail",
          openPollBtn: "Ouvrir le sondage",
          draftBadge: (rem: string) => `Brouillon · ${rem}`,
          draftExpiredTitle: "Brouillon expiré",
          draftExpiredMsg:
            "La fenêtre de 30 minutes est écoulée. Rien n’a été envoyé automatiquement.",
          restartDraftBtn: "Relancer la fenêtre",
          restoredTitle: "Brouillon restauré",
          restoredMsg: "Vos réponses précédentes ont été retrouvées.",
          offlineTitle: "Hors ligne — brouillon conservé localement",
          offlineMsg:
            "Vos choix restent enregistrés sur cet appareil. Si vous cliquez sur Envoyer, l’envoi repartira automatiquement au retour du réseau.",
          pendingTitle: "Envoi en attente de reconnexion",
          pendingMsg:
            "Votre envoi explicite est conservé localement et sera retransmis dès le retour de la connexion.",
          retryNowBtn: "Réessayer maintenant",
          autosavePending: "Envoi en attente",
          autosaveSaving: "Envoi en cours…",
          questionCounter: (i: number, n: number) => `Question ${i} / ${n}`,
          singleHint: "Choisissez une seule réponse.",
          multiHint: "Plusieurs réponses possibles.",
          scaleHint: "Choisissez le palier qui correspond le mieux.",
          requiredError: "Veuillez répondre à cette question avant de continuer.",
          minSelError: (min: number) => `Sélectionnez au moins ${min} option(s).`,
          maxSelError: (max: number) => `Sélectionnez au plus ${max} option(s).`,
          submitGateError:
            "Répondez au moins à la question 1 requise avant d’envoyer vos réponses.",
          errorSummaryHeading: "Vérifiez vos réponses avant l’envoi",
          prevBtn: "Précédent",
          nextBtn: "Suivant",
          submitAllBtn: "Envoyer mes réponses",
          submitPartialBtn: (n: number, tot: number) => `Envoyer seulement celles-ci (${n}/${tot})`,
          leaveBtn: "Quitter et reprendre plus tard",
          partialModalTitle: "Envoyer vos réponses partielles ?",
          partialModalDesc: (n: number, tot: number) =>
            `Vous avez répondu à ${n} question(s) sur ${tot}. Seules les réponses cochées seront transmises.`,
          partialModalCancel: "Continuer le sondage",
          partialModalConfirm: "Confirmer l’envoi partiel",
          thanksTitle: "Merci pour vos réponses !",
          thanksComplete: (n: number) => `Votre questionnaire complet (${n} questions) a bien été envoyé.`,
          thanksPartial: (n: number, tot: number) =>
            `Votre envoi partiel (${n}/${tot} questions) a bien été envoyé.`,
          completeBadge: "Complet",
          partialBadge: "Partiel",
          passkeyTitle: "Ajouter une clé d’accès (facultatif)",
          passkeyDesc:
            "Enregistrez une clé d’accès sur cet appareil pour rouvrir plus vite lors de vos prochaines visites.",
          passkeyBtn: "Ajouter une clé d’accès",
          passkeyAdded: "Clé d’accès enregistrée",
          defaultPrivacyTitle: "Règles de confidentialité",
          defaultPrivacyItems: [
            `Lien envoyé par ${authIssuer}, sans double authentification exigée.`,
            "Brouillon conservé 30 minutes sur votre appareil.",
            "Aucun envoi automatique : rien ne part sans votre clic explicite.",
            "Empreinte salée séparée des réponses ; cases < 5 masquées dans les résultats.",
          ],
        }
      : {
          stepsMagic: [
            { label: "Email" },
            { label: "Link sent" },
            { label: "Poll" },
            { label: "Thanks" },
          ],
          stepsEmail: [{ label: "Email" }, { label: "Poll" }, { label: "Thanks" }],
          stepsDirect: [{ label: "Poll" }, { label: "Thanks" }],
          stepperLabel: "Survey progress",
          emailTitle: "Open the survey",
          emailIntro:
            "Enter your email to start your session. Your answers stay anonymous; your draft is kept for 30 minutes.",
          emailLabel: "Email address",
          emailPlaceholder: "you@organisation.ca",
          emailHelper: `Verified via ${authIssuer} magic link · no 2FA required.`,
          emailHelperUnverified: "Used only to restore your local draft for 30 minutes.",
          emailError: "Please enter a valid email address.",
          sendLinkBtn: "Send my link",
          startSurveyBtn: "Start survey",
          resumeTitle: "Active draft found",
          resumeMsg: (n: number, tot: number, rem: string) =>
            `${n}/${tot} draft answers saved (time left: ${rem}).`,
          resumeBtn: "Resume my draft",
          linkSentTitle: "A sign-in link was sent",
          linkSentMsg: (addr: string) =>
            `A sign-in link was sent by ${authIssuer} to ${addr}. No 2FA is required.`,
          changeEmailBtn: "Change email",
          openPollBtn: "Open survey",
          draftBadge: (rem: string) => `Draft · ${rem}`,
          draftExpiredTitle: "Draft expired",
          draftExpiredMsg:
            "The 30-minute window elapsed. Nothing was submitted automatically.",
          restartDraftBtn: "Renew draft window",
          restoredTitle: "Draft restored",
          restoredMsg: "Your previous answers were restored.",
          offlineTitle: "Offline — draft saved locally",
          offlineMsg:
            "Your selections stay saved on this device. Explicit submissions will automatically retry when back online.",
          pendingTitle: "Submission waiting for connection",
          pendingMsg:
            "Your explicit submission is safely queued locally and will send automatically once reconnected.",
          retryNowBtn: "Retry now",
          autosavePending: "Pending retry",
          autosaveSaving: "Sending…",
          questionCounter: (i: number, n: number) => `Question ${i} / ${n}`,
          singleHint: "Choose one answer.",
          multiHint: "Select all that apply.",
          scaleHint: "Pick the level that fits best.",
          requiredError: "Please answer this question before continuing.",
          minSelError: (min: number) => `Select at least ${min} option(s).`,
          maxSelError: (max: number) => `Select at most ${max} option(s).`,
          submitGateError: "Please answer required question 1 before submitting.",
          errorSummaryHeading: "Please review your answers before submitting",
          prevBtn: "Previous",
          nextBtn: "Next",
          submitAllBtn: "Submit my answers",
          submitPartialBtn: (n: number, tot: number) => `Submit only these (${n}/${tot})`,
          leaveBtn: "Leave and resume later",
          partialModalTitle: "Submit partial answers?",
          partialModalDesc: (n: number, tot: number) =>
            `You answered ${n} out of ${tot} questions. Only selected answers will be submitted.`,
          partialModalCancel: "Keep answering",
          partialModalConfirm: "Confirm partial submit",
          thanksTitle: "Thank you for participating!",
          thanksComplete: (n: number) => `Your complete survey (${n} questions) was submitted.`,
          thanksPartial: (n: number, tot: number) =>
            `Your partial submission (${n}/${tot} questions) was submitted.`,
          completeBadge: "Complete",
          partialBadge: "Partial",
          passkeyTitle: "Add a passkey (optional)",
          passkeyDesc:
            "Register a local passkey on this device to sign in faster on future visits.",
          passkeyBtn: "Add a passkey",
          passkeyAdded: "Passkey saved",
          defaultPrivacyTitle: "Privacy & session rules",
          defaultPrivacyItems: [
            `Sign-in link sent by ${authIssuer}, no 2FA required.`,
            "Draft kept for 30 minutes on your device.",
            "No auto-submit: nothing leaves without your explicit click.",
            "Salted email hash kept separate from answers; cells < 5 masked.",
          ],
        },
  );

  // Flow state
  let trackedSurveyId = $state("");
  let step = $state<SurveyStep>("questions");
  let email = $state("");
  let emailError = $state("");
  let enrollmentMeta = $state<Record<string, string>>({});
  let answers = $state<AnswerMap>({});
  let questionIndex = $state(0);
  let expiresAt = $state(0);
  let nowMs = $state(Date.now());
  let restoredBanner = $state(false);
  let returnedFromDraft = $state(false);
  let questionError = $state("");
  let submitError = $state("");
  let missingIds = $state<string[]>([]);
  let partialModalOpen = $state(false);
  let submitting = $state(false);
  let pendingSubmission = $state<SurveyPendingSubmission | null>(null);
  let lastSubmitted = $state<SurveySubmitPayload | null>(null);
  let passkeySaved = $state(false);
  let isOnline = $state(typeof navigator !== "undefined" ? navigator.onLine : true);
  let thanksHeadingEl = $state<HTMLElement | undefined>(undefined);

  // Reset / initialize when survey.id changes
  $effect(() => {
    const id = survey.id;
    if (id === trackedSurveyId) return;
    trackedSurveyId = id;
    step = resolveInitialStep(survey, initialStep);
    email = initialEmail;
    emailError = "";
    enrollmentMeta = {};
    answers = initialAnswers ? { ...initialAnswers } : {};
    questionIndex = 0;
    restoredBanner = false;
    returnedFromDraft = false;
    questionError = "";
    submitError = "";
    missingIds = [];
    partialModalOpen = false;
    submitting = false;
    lastSubmitted = null;
    const identity = (initialEmail || "").trim() || "anonymous";
    passkeySaved = persistDraft ? hasSurveyPasskey(identity, storageSalt) : false;
    pendingSubmission = persistDraft ? loadPendingSubmission(id, identity, storageSalt) : null;
    if (step === "questions" && draftWindowMinutes > 0) {
      expiresAt = Date.now() + draftTtlMs;
    } else {
      expiresAt = 0;
    }
  });

  // 1-second draft countdown timer
  $effect(() => {
    if (step !== "questions" && step !== "link_sent") return;
    nowMs = Date.now();
    const timer = setInterval(() => {
      nowMs = Date.now();
    }, 1000);
    return () => clearInterval(timer);
  });

  // Move focus to thank-you heading on completion
  $effect(() => {
    if (step === "thanks") {
      tick().then(() => thanksHeadingEl?.focus());
    }
  });

  // Track online/offline state and auto-flush ONLY an explicit pendingSubmission on reconnect
  $effect(() => {
    if (typeof window === "undefined") return;
    const handleOffline = () => {
      isOnline = false;
    };
    const handleOnline = () => {
      isOnline = true;
      if (pendingSubmission && !submitting) {
        void flushPendingSubmission();
      }
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  });

  const activeIdentity = $derived(email.trim() || "anonymous");

  const existingDraft = $derived.by(() => {
    if (!persistDraft || step !== "enrollment") return null;
    const trimmed = email.trim();
    if (!isValidSurveyEmail(trimmed)) return null;
    void nowMs;
    return loadSurveyDraft(survey.id, trimmed, Date.now(), storageSalt);
  });

  const remainingMs = $derived(expiresAt > 0 ? Math.max(0, expiresAt - nowMs) : 0);
  const draftExpired = $derived(
    step === "questions" && draftWindowMinutes > 0 && expiresAt > 0 && remainingMs <= 0,
  );

  const stepperSteps = $derived(
    enrollmentMode === "email-magic-link"
      ? copy.stepsMagic
      : enrollmentMode === "email-unverified"
        ? copy.stepsEmail
        : copy.stepsDirect,
  );
  const stepIndex = $derived(computeStepIndex(step, enrollmentMode));
  const currentQuestion = $derived(survey.questions[questionIndex] ?? survey.questions[0]);
  const answeredCount = $derived(countAnsweredQuestions(survey.questions, answers));
  const canPartialSubmit = $derived(
    !readOnly &&
      survey.rules.allowPartialSubmit !== false &&
      answeredCount > 0 &&
      answeredCount < survey.questions.length,
  );

  const privacyTitle = $derived(
    survey.privacyNotice
      ? resolveLocalizedText(survey.privacyNotice.title, locale)
      : copy.defaultPrivacyTitle,
  );
  const privacyItems = $derived(
    survey.privacyNotice
      ? survey.privacyNotice.items.map((item) => resolveLocalizedText(item, locale))
      : copy.defaultPrivacyItems,
  );
  const showPrivacy = $derived(Boolean(survey.privacyNotice) || survey.rules.anonymous !== false);

  const rootClasses = $derived(
    ["st-surveyForm", showPrivacy ? "st-surveyForm--withPrivacy" : null, className]
      .filter(Boolean)
      .join(" "),
  );

  function getOrderedOptions(question: SurveyQuestion) {
    if (question.type === "multi" && survey.rules.shuffleMultiOptions !== false) {
      return shuffleSurveyOptions(question, `${survey.id}:${activeIdentity.toLowerCase()}`);
    }
    return "options" in question ? question.options : [];
  }

  function persistCurrentDraft(
    nextAnswers: AnswerMap,
    nextIndex: number,
    nextExpires: number,
    nextMeta: Record<string, string> = enrollmentMeta,
  ) {
    const draft: SurveyDraft = {
      surveyId: survey.id,
      answers: nextAnswers,
      questionIndex: nextIndex,
      enrollmentMeta: sanitizeEnrollmentMeta(nextMeta),
      expiresAt: nextExpires,
      updatedAt: Date.now(),
    };
    if (persistDraft && draftWindowMinutes > 0) {
      saveSurveyDraft(survey.id, activeIdentity, draft, storageSalt);
    }
    ondraftchange?.(draft);
  }

  async function handleEnrollmentSubmit(event: SubmitEvent) {
    event.preventDefault();
    const cleaned = email.trim();
    if (!isValidSurveyEmail(cleaned)) {
      emailError = copy.emailError;
      return;
    }
    emailError = "";

    const cleanMeta = sanitizeEnrollmentMeta(enrollmentMeta);
    const found = persistDraft
      ? loadSurveyDraft(survey.id, cleaned, Date.now(), storageSalt)
      : null;

    if (found) {
      answers = { ...found.answers };
      questionIndex = Math.min(found.questionIndex, Math.max(0, survey.questions.length - 1));
      enrollmentMeta = { ...found.enrollmentMeta, ...cleanMeta };
      expiresAt = found.expiresAt;
      returnedFromDraft = true;
      restoredBanner = true;
    } else {
      answers = initialAnswers ? { ...initialAnswers } : {};
      questionIndex = 0;
      expiresAt = draftWindowMinutes > 0 ? Date.now() + draftTtlMs : 0;
      returnedFromDraft = false;
      restoredBanner = false;
      persistCurrentDraft(answers, questionIndex, expiresAt, cleanMeta);
    }

    pendingSubmission = persistDraft
      ? loadPendingSubmission(survey.id, cleaned, storageSalt)
      : null;
    passkeySaved = persistDraft ? hasSurveyPasskey(cleaned, storageSalt) : false;

    if (onrequestlink) {
      await onrequestlink({
        surveyId: survey.id,
        email: cleaned,
        enrollmentMeta: cleanMeta,
      });
    }

    step = enrollmentMode === "email-magic-link" ? "link_sent" : "questions";
  }

  function handleResumeDraft() {
    if (!existingDraft) return;
    answers = { ...existingDraft.answers };
    questionIndex = Math.min(existingDraft.questionIndex, Math.max(0, survey.questions.length - 1));
    enrollmentMeta = { ...existingDraft.enrollmentMeta, ...sanitizeEnrollmentMeta(enrollmentMeta) };
    expiresAt = existingDraft.expiresAt;
    returnedFromDraft = true;
    restoredBanner = true;
    pendingSubmission = persistDraft
      ? loadPendingSubmission(survey.id, email.trim(), storageSalt)
      : null;
    step = "questions";
  }

  function handleOpenFromLink() {
    if (draftWindowMinutes > 0 && (!expiresAt || Date.now() >= expiresAt)) {
      expiresAt = Date.now() + draftTtlMs;
    }
    persistCurrentDraft(answers, questionIndex, expiresAt);
    step = "questions";
  }

  function handleRenewDraft() {
    expiresAt = Date.now() + draftTtlMs;
    nowMs = Date.now();
    persistCurrentDraft(answers, questionIndex, expiresAt);
  }

  function updateAnswer(qid: string, val: AnswerValue) {
    if (readOnly) return;
    questionError = "";
    submitError = "";
    missingIds = missingIds.filter((id) => id !== qid);
    const next = { ...answers, [qid]: val };
    answers = next;
    persistCurrentDraft(next, questionIndex, expiresAt);
  }

  function handleMultiChange(question: Extract<SurveyQuestion, { type: "multi" }>, nextVals: string[]) {
    if (readOnly) return;
    const prev = Array.isArray(answers[question.id]) ? (answers[question.id] as string[]) : [];
    const resolved = resolveExclusiveMultiChange(prev, nextVals, question.exclusive);
    if (question.maxSelections != null && resolved.length > question.maxSelections) {
      questionError = copy.maxSelError(question.maxSelections);
      return;
    }
    updateAnswer(question.id, resolved);
  }

  function validationMessageFor(q: SurveyQuestion): string {
    const err = validateQuestionAnswer(q, answers[q.id]);
    if (err === "required") return copy.requiredError;
    if (err === "minSelections" && q.type === "multi" && q.minSelections != null) {
      return copy.minSelError(q.minSelections);
    }
    if (err === "maxSelections" && q.type === "multi" && q.maxSelections != null) {
      return copy.maxSelError(q.maxSelections);
    }
    return "";
  }

  function goPrev() {
    questionError = "";
    submitError = "";
    if (questionIndex > 0) {
      questionIndex -= 1;
      persistCurrentDraft(answers, questionIndex, expiresAt);
    }
  }

  function goNext() {
    if (!currentQuestion) return;
    const err = validationMessageFor(currentQuestion);
    if (err) {
      questionError = err;
      return;
    }
    questionError = "";
    submitError = "";
    if (questionIndex < survey.questions.length - 1) {
      questionIndex += 1;
      persistCurrentDraft(answers, questionIndex, expiresAt);
    }
  }

  function leaveForLater() {
    persistCurrentDraft(answers, questionIndex, expiresAt);
    step = "enrollment";
  }

  function queuePendingSubmission(payload: SurveySubmitPayload, errorReason: string) {
    const entry: SurveyPendingSubmission = {
      payload,
      queuedAt: pendingSubmission?.queuedAt ?? Date.now(),
      attempts: (pendingSubmission?.attempts ?? 0) + 1,
      lastError: errorReason,
    };
    pendingSubmission = entry;
    if (persistDraft) {
      savePendingSubmission(survey.id, activeIdentity, entry, storageSalt);
    }
  }

  async function deliverSubmission(payload: SurveySubmitPayload) {
    if (!isOnline) {
      queuePendingSubmission(payload, "offline");
      return;
    }
    submitting = true;
    try {
      await onsubmit?.(payload);
      pendingSubmission = null;
      if (persistDraft) {
        clearPendingSubmission(survey.id, activeIdentity, storageSalt);
        clearSurveyDraft(survey.id, activeIdentity, storageSalt);
      }
      passkeySaved = persistDraft ? hasSurveyPasskey(activeIdentity, storageSalt) : passkeySaved;
      lastSubmitted = payload;
      step = "thanks";
    } catch (err) {
      const reason = err instanceof Error ? err.message : "submit_failed";
      queuePendingSubmission(payload, reason);
    } finally {
      submitting = false;
    }
  }

  async function flushPendingSubmission() {
    if (!pendingSubmission || submitting) return;
    await deliverSubmission(pendingSubmission.payload);
  }

  async function handleExplicitSubmit(requestedMode: "complete" | "partial") {
    if (readOnly || submitting) return;
    const check = validateSubmission(survey, answers, requestedMode);
    if (!check.valid) {
      missingIds = check.missingIds;
      submitError = copy.submitGateError;
      partialModalOpen = false;
      return;
    }

    missingIds = [];
    submitError = "";
    questionError = "";
    partialModalOpen = false;

    const payload = buildSubmitPayload({
      survey,
      answers,
      enrollmentMeta,
      requestedMode,
      returnedFromDraft,
    });
    await deliverSubmission(payload);
  }

  async function handleRegisterPasskey() {
    await onregisterpasskey?.();
    if (persistDraft) {
      saveSurveyPasskey(activeIdentity, storageSalt);
    }
    passkeySaved = true;
  }

  const resolvedPasskeyTitle = $derived(
    passkeyOffer?.title ? resolveLocalizedText(passkeyOffer.title, locale) : copy.passkeyTitle,
  );
  const resolvedPasskeyDesc = $derived(
    passkeyOffer?.description
      ? resolveLocalizedText(passkeyOffer.description, locale)
      : copy.passkeyDesc,
  );
  const resolvedPasskeyBtn = $derived(
    passkeyOffer?.ctaLabel ? resolveLocalizedText(passkeyOffer.ctaLabel, locale) : copy.passkeyBtn,
  );
  const resolvedPasskeySaved = $derived(
    passkeyOffer?.savedLabel
      ? resolveLocalizedText(passkeyOffer.savedLabel, locale)
      : copy.passkeyAdded,
  );

  const errorSummaryItems = $derived(
    missingIds.map((id) => {
      const q = survey.questions.find((item) => item.id === id);
      return {
        href: `#st-survey-q-${survey.id}-${id}`,
        text: q ? resolveLocalizedText(q.label, locale) : id,
      };
    }),
  );
</script>

{#snippet renderQuestionControl(q: SurveyQuestion)}
  {@const qOptions = getOrderedOptions(q)}
  {@const qLegend = resolveLocalizedText(q.label, locale)}
  {@const qHelper = q.helperText ? resolveLocalizedText(q.helperText, locale) : undefined}
  <div id={`st-survey-q-${survey.id}-${q.id}`} class="st-surveyForm__questionControl">
    {#if q.type === "multi"}
      <CheckboxGroup
        name={`st-survey-${survey.id}-${q.id}`}
        legend={qLegend}
        variant="card"
        helperText={qHelper ?? copy.multiHint}
        required={q.required}
        exclusiveValues={q.exclusive}
        minSelections={q.minSelections}
        maxSelections={q.maxSelections}
        options={qOptions.map((o) => ({
          value: o.id,
          label: resolveLocalizedText(o.label, locale),
          description: o.description ? resolveLocalizedText(o.description, locale) : undefined,
          disabled: readOnly || o.disabled,
        }))}
        value={Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : []}
        disabled={readOnly}
        onchange={(vals) => handleMultiChange(q, vals)}
      />
    {:else if q.type === "scale" || q.type === "likert"}
      <LikertScale
        name={`st-survey-${survey.id}-${q.id}`}
        legend={qLegend}
        helperText={qHelper ?? copy.scaleHint}
        required={q.required}
        layout={q.layout ?? "auto"}
        minLabel={q.minLabel ? resolveLocalizedText(q.minLabel, locale) : undefined}
        maxLabel={q.maxLabel ? resolveLocalizedText(q.maxLabel, locale) : undefined}
        options={qOptions.map((o) => ({
          value: o.id,
          label: resolveLocalizedText(o.label, locale),
          description: o.description ? resolveLocalizedText(o.description, locale) : undefined,
          disabled: readOnly || o.disabled,
        }))}
        value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : undefined}
        disabled={readOnly}
        onchange={(val) => updateAnswer(q.id, val)}
      />
    {:else if q.type === "single"}
      <RadioGroup
        name={`st-survey-${survey.id}-${q.id}`}
        legend={qLegend}
        variant="card"
        helperText={qHelper ?? copy.singleHint}
        required={q.required}
        options={qOptions.map((o) => ({
          value: o.id,
          label: resolveLocalizedText(o.label, locale),
          description: o.description ? resolveLocalizedText(o.description, locale) : undefined,
          disabled: readOnly || o.disabled,
        }))}
        value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
        disabled={readOnly}
        onchange={(val) => updateAnswer(q.id, val)}
      />
    {/if}
  </div>
{/snippet}

<div {...rest} class={rootClasses}>
  <div class="st-surveyForm__grid">
    <div class="st-surveyForm__main">
      <Card class="st-surveyForm__card">
        <Stack gap={4}>
          <Inline justify="between" align="center" wrap={true} gap={2}>
            <div class="st-surveyForm__headingGroup">
              <Typography variant="h4" as="h2">
                {resolveLocalizedText(survey.title, locale)}
              </Typography>
              {#if survey.subtitle}
                <Typography variant="body-sm" tone="secondary">
                  {resolveLocalizedText(survey.subtitle, locale)}
                </Typography>
              {/if}
            </div>
            {#if step === "questions" && draftWindowMinutes > 0 && expiresAt > 0}
              <Tag
                tone={draftExpired ? "error" : "info"}
                size="sm"
                class="st-surveyForm__countdown"
              >
                {copy.draftBadge(formatSurveyCountdown(remainingMs))}
              </Tag>
            {/if}
          </Inline>

          <div class="st-surveyForm__stepperWrap">
            <Stepper steps={stepperSteps} current={stepIndex} label={copy.stepperLabel} />
          </div>

          <Divider />

          {#if !isOnline}
            <Alert tone="warning" title={copy.offlineTitle} message={copy.offlineMsg} />
          {/if}

          {#if pendingSubmission && step !== "thanks"}
            <Alert tone="warning" title={copy.pendingTitle} message={copy.pendingMsg}>
              {#snippet actions()}
                <Button
                  variant="primary"
                  size="lg"
                  type="button"
                  disabled={submitting}
                  onclick={() => void flushPendingSubmission()}
                >
                  {copy.retryNowBtn}
                </Button>
              {/snippet}
              <div class="st-surveyForm__autosaveRow">
                <Autosave
                  status={submitting ? "saving" : "error"}
                  locale={lang === "fr" ? "fr-CA" : "en-CA"}
                  labels={{ saving: copy.autosaveSaving, error: copy.autosavePending }}
                />
              </div>
            </Alert>
          {/if}

          {#if step === "enrollment"}
            <form class="st-surveyForm__form" onsubmit={handleEnrollmentSubmit} novalidate>
              <Stack gap={4}>
                <Stack gap={1}>
                  <Typography variant="h5" as="h3">{copy.emailTitle}</Typography>
                  <Typography variant="body-sm" tone="secondary">{copy.emailIntro}</Typography>
                </Stack>

                <Input
                  type="email"
                  size="lg"
                  label={copy.emailLabel}
                  placeholder={copy.emailPlaceholder}
                  helperText={enrollmentMode === "email-magic-link"
                    ? copy.emailHelper
                    : copy.emailHelperUnverified}
                  errorText={emailError}
                  invalid={Boolean(emailError)}
                  bind:value={email}
                  autocomplete="email"
                  disabled={readOnly}
                  required
                />

                {#each survey.enrollmentFields ?? [] as field (field.id)}
                  <Input
                    type="text"
                    size="lg"
                    label={resolveLocalizedText(field.label, locale)}
                    placeholder={field.placeholder
                      ? resolveLocalizedText(field.placeholder, locale)
                      : undefined}
                    helperText={field.helperText
                      ? resolveLocalizedText(field.helperText, locale)
                      : undefined}
                    maxlength={field.maxLength}
                    value={enrollmentMeta[field.id] ?? ""}
                    disabled={readOnly}
                    oninput={(e) => {
                      enrollmentMeta = {
                        ...enrollmentMeta,
                        [field.id]: e.currentTarget.value,
                      };
                    }}
                  />
                {/each}

                {#if existingDraft}
                  <Alert
                    tone="info"
                    title={copy.resumeTitle}
                    message={copy.resumeMsg(
                      countAnsweredQuestions(survey.questions, existingDraft.answers),
                      survey.questions.length,
                      formatSurveyCountdown(Math.max(0, existingDraft.expiresAt - nowMs)),
                    )}
                  >
                    {#snippet actions()}
                      <Button
                        variant="secondary"
                        size="lg"
                        type="button"
                        onclick={handleResumeDraft}
                      >
                        {copy.resumeBtn}
                      </Button>
                    {/snippet}
                  </Alert>
                {/if}

                <Inline justify="end" gap={2}>
                  <Button variant="primary" size="lg" type="submit" disabled={readOnly}>
                    {enrollmentMode === "email-magic-link"
                      ? copy.sendLinkBtn
                      : copy.startSurveyBtn}
                  </Button>
                </Inline>
              </Stack>
            </form>
          {:else if step === "link_sent"}
            <Stack gap={4}>
              <Alert
                tone="info"
                title={copy.linkSentTitle}
                message={copy.linkSentMsg(email.trim())}
              />

              <Inline justify="between" wrap={true} gap={2}>
                <Button
                  variant="ghost"
                  size="lg"
                  type="button"
                  onclick={() => (step = "enrollment")}
                >
                  {copy.changeEmailBtn}
                </Button>
                {#if allowSimulatedLinkOpen}
                  <Button variant="primary" size="lg" type="button" onclick={handleOpenFromLink}>
                    {copy.openPollBtn}
                  </Button>
                {/if}
              </Inline>
            </Stack>
          {:else if step === "questions" && currentQuestion}
            <Stack gap={4}>
              {#if draftExpired}
                <Alert
                  tone="warning"
                  title={copy.draftExpiredTitle}
                  message={copy.draftExpiredMsg}
                >
                  {#snippet actions()}
                    <Button variant="secondary" size="lg" type="button" onclick={handleRenewDraft}>
                      {copy.restartDraftBtn}
                    </Button>
                  {/snippet}
                </Alert>
              {:else if restoredBanner}
                <Alert tone="success" title={copy.restoredTitle} message={copy.restoredMsg} />
              {/if}

              {#if survey.rules.mode === "one-per-screen"}
                <Stack gap={2}>
                  {#if currentQuestion.moment}
                    <div>
                      <Tag tone="neutral" size="sm">
                        {resolveLocalizedText(currentQuestion.moment, locale)}
                      </Tag>
                    </div>
                  {/if}
                  <ProgressBar
                    value={questionIndex + 1}
                    max={survey.questions.length}
                    showValue={true}
                    valueText={`${questionIndex + 1} / ${survey.questions.length}`}
                    label={copy.questionCounter(questionIndex + 1, survey.questions.length)}
                  />
                </Stack>

                <article class="st-surveyForm__questionCard">
                  {@render renderQuestionControl(currentQuestion)}
                  {#if questionError}
                    <p class="st-surveyForm__inlineError" role="alert">{questionError}</p>
                  {/if}
                </article>

                {#if submitError}
                  <Alert tone="error" title={submitError} />
                {/if}

                <div class="st-surveyForm__nav">
                  <Inline justify="between" align="center" wrap={true} gap={2}>
                    <Button
                      variant="secondary"
                      size="lg"
                      type="button"
                      disabled={questionIndex === 0}
                      onclick={goPrev}
                    >
                      {copy.prevBtn}
                    </Button>

                    {#if questionIndex < survey.questions.length - 1}
                      <Button variant="primary" size="lg" type="button" onclick={goNext}>
                        {copy.nextBtn}
                      </Button>
                    {:else}
                      <Button
                        variant="primary"
                        size="lg"
                        type="button"
                        disabled={readOnly || submitting || answeredCount === 0}
                        onclick={() => void handleExplicitSubmit("complete")}
                      >
                        {copy.submitAllBtn}
                      </Button>
                    {/if}
                  </Inline>

                  {#if enrollmentMode !== "none" || canPartialSubmit}
                    <Divider />
                    <Inline justify="between" align="center" wrap={true} gap={2}>
                      {#if enrollmentMode !== "none"}
                        <Button variant="ghost" size="lg" type="button" onclick={leaveForLater}>
                          {copy.leaveBtn}
                        </Button>
                      {:else}
                        <span></span>
                      {/if}

                      {#if canPartialSubmit}
                        <Button
                          variant="secondary"
                          size="lg"
                          type="button"
                          disabled={submitting}
                          onclick={() => (partialModalOpen = true)}
                        >
                          {copy.submitPartialBtn(answeredCount, survey.questions.length)}
                        </Button>
                      {/if}
                    </Inline>
                  {/if}
                </div>
              {:else}
                {#if errorSummaryItems.length > 0}
                  <ErrorSummary
                    heading={copy.errorSummaryHeading}
                    errors={errorSummaryItems}
                  />
                {/if}
                <Stack gap={4}>
                  {#each survey.questions as q (q.id)}
                    <article class="st-surveyForm__questionCard">
                      {#if q.moment}
                        <div class="st-surveyForm__momentRow">
                          <Tag tone="neutral" size="sm">
                            {resolveLocalizedText(q.moment, locale)}
                          </Tag>
                        </div>
                      {/if}
                      {@render renderQuestionControl(q)}
                    </article>
                  {/each}
                </Stack>
                <Inline justify="end" gap={2}>
                  <Button
                    variant="primary"
                    size="lg"
                    type="button"
                    disabled={readOnly || submitting || answeredCount === 0}
                    onclick={() => void handleExplicitSubmit("complete")}
                  >
                    {copy.submitAllBtn}
                  </Button>
                </Inline>
              {/if}
            </Stack>
          {:else if step === "thanks" && lastSubmitted}
            <Stack gap={4}>
              <div bind:this={thanksHeadingEl} tabindex="-1" class="st-surveyForm__thanksFocus">
                <Alert
                  tone="success"
                  title={copy.thanksTitle}
                  message={lastSubmitted.mode === "complete"
                    ? copy.thanksComplete(lastSubmitted.answeredCount)
                    : copy.thanksPartial(lastSubmitted.answeredCount, lastSubmitted.totalQuestions)}
                />
              </div>

              <Inline gap={2} wrap={true}>
                <Badge tone="success">
                  {lastSubmitted.mode === "complete" ? copy.completeBadge : copy.partialBadge}
                </Badge>
                <Badge tone="neutral">
                  {lastSubmitted.answeredCount} / {lastSubmitted.totalQuestions}
                </Badge>
              </Inline>

              {#if passkeySlot}
                {@render passkeySlot()}
              {:else if survey.rules.offerPasskey}
                <Card>
                  <Stack gap={2}>
                    <Typography variant="h6" as="h4">{resolvedPasskeyTitle}</Typography>
                    <Typography variant="body-sm" tone="secondary">
                      {resolvedPasskeyDesc}
                    </Typography>
                    <div>
                      {#if passkeySaved}
                        <Badge tone="success">{resolvedPasskeySaved}</Badge>
                      {:else}
                        <Button
                          variant="secondary"
                          size="lg"
                          type="button"
                          onclick={() => void handleRegisterPasskey()}
                        >
                          {resolvedPasskeyBtn}
                        </Button>
                      {/if}
                    </div>
                  </Stack>
                </Card>
              {/if}

              {#if thanksActions}
                <div class="st-surveyForm__thanksActions">
                  {@render thanksActions(lastSubmitted)}
                </div>
              {/if}
            </Stack>
          {/if}
        </Stack>
      </Card>
    </div>

    {#if showPrivacy}
      <aside class="st-surveyForm__privacy" aria-label={privacyTitle}>
        <div class="st-surveyForm__privacyDesktop">
          <Card>
            <Stack gap={3}>
              <Typography variant="h5" as="h3">{privacyTitle}</Typography>
              <UnorderedList items={privacyItems} />
            </Stack>
          </Card>
        </div>
        <div class="st-surveyForm__privacyCompact">
          <Collapsible title={privacyTitle} size="lg">
            <UnorderedList items={privacyItems} />
          </Collapsible>
        </div>
      </aside>
    {/if}
  </div>
</div>

<Modal
  open={partialModalOpen}
  title={copy.partialModalTitle}
  description={copy.partialModalDesc(answeredCount, survey.questions.length)}
  onclose={() => (partialModalOpen = false)}
>
  {#snippet footer()}
    <Inline justify="end" gap={2} wrap={true}>
      <Button
        variant="ghost"
        size="lg"
        type="button"
        onclick={() => (partialModalOpen = false)}
      >
        {copy.partialModalCancel}
      </Button>
      <Button
        variant="primary"
        size="lg"
        type="button"
        onclick={() => void handleExplicitSubmit("partial")}
      >
        {copy.partialModalConfirm}
      </Button>
    </Inline>
  {/snippet}
</Modal>

<style>
  .st-surveyForm {
    container-name: st-survey-form;
    container-type: inline-size;
    color: var(--st-semantic-text-primary, #1f2437);
    width: 100%;
  }

  .st-surveyForm__grid {
    display: grid;
    gap: var(--st-spacing-4, 1rem);
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
  }

  .st-surveyForm__main {
    min-width: 0;
  }

  .st-surveyForm__headingGroup {
    display: grid;
    gap: var(--st-spacing-1, 0.25rem);
    min-width: 0;
  }

  .st-surveyForm__main :global(.st-surveyForm__countdown) {
    font-variant-numeric: tabular-nums;
  }

  .st-surveyForm__stepperWrap {
    min-width: 0;
  }

  .st-surveyForm__form {
    width: 100%;
  }

  .st-surveyForm__form :global(.st-field) {
    max-width: 100%;
  }

  .st-surveyForm__autosaveRow {
    margin-top: var(--st-spacing-2, 0.5rem);
  }

  .st-surveyForm__questionCard {
    background: var(--st-semantic-surface-default, #ffffff);
    border: 1px solid var(--st-semantic-border-subtle, #d6d9ea);
    border-radius: var(--st-radius-md, 0.5rem);
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
    padding: var(--st-spacing-4, 1rem);
  }

  .st-surveyForm__momentRow {
    display: flex;
    flex-wrap: wrap;
  }

  .st-surveyForm__questionControl {
    min-width: 0;
  }

  .st-surveyForm__inlineError {
    color: var(--st-semantic-feedback-error, #dc2626);
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
  }

  .st-surveyForm__nav {
    display: grid;
    gap: var(--st-spacing-3, 0.75rem);
  }

  .st-surveyForm__thanksFocus:focus {
    outline: none;
  }

  .st-surveyForm__thanksActions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-2, 0.5rem);
    justify-content: space-between;
  }

  .st-surveyForm__privacyDesktop {
    display: none;
  }

  .st-surveyForm__privacyCompact {
    display: block;
  }

  .st-surveyForm__privacyCompact :global(.st-collapsible__trigger) {
    min-height: 2.75rem;
  }

  /* Compact stepper labels on narrow 390px containers */
  @container st-survey-form (max-width: 480px) {
    .st-surveyForm__stepperWrap :global(.st-stepper__step:not(.st-stepper__step--current) .st-stepper__text) {
      border: 0;
      clip: rect(0 0 0 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      white-space: nowrap;
      width: 1px;
    }
  }

  /* 820px+ tablet & 1280px+ desktop: two-column layout with sticky privacy card */
  @container st-survey-form (min-width: 760px) {
    .st-surveyForm--withPrivacy .st-surveyForm__grid {
      gap: var(--st-spacing-6, 1.5rem);
      grid-template-columns: minmax(0, 1fr) minmax(17rem, 21rem);
    }

    .st-surveyForm__questionCard {
      padding: var(--st-spacing-6, 1.5rem);
    }

    .st-surveyForm__privacy {
      position: sticky;
      top: var(--st-spacing-4, 1rem);
    }

    .st-surveyForm__privacyDesktop {
      display: block;
    }

    .st-surveyForm__privacyCompact {
      display: none;
    }
  }
</style>
