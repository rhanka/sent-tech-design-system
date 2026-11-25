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
    /** Optional non-PII session seed for local draft isolation and deterministic shuffling when no email is supplied. */
    respondentSeed?: string;
    readOnly?: boolean;
    /** Allow opening the poll directly from the link_sent screen (useful for demos/tests). Default false. */
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
  import { tick, untrack } from "svelte";
  import Alert from "./Alert.svelte";
  import Autosave from "./Autosave.svelte";
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import Card from "./Card.svelte";
  import CheckboxGroup from "./CheckboxGroup.svelte";
  import Divider from "./Divider.svelte";
  import ErrorSummary from "./ErrorSummary.svelte";
  import Inline from "./Inline.svelte";
  import Input from "./Input.svelte";
  import LikertScale from "./LikertScale.svelte";
  import ProgressBar from "./ProgressBar.svelte";
  import RadioGroup from "./RadioGroup.svelte";
  import Stack from "./Stack.svelte";
  import Stepper from "./Stepper.svelte";
  import SurveyNav from "./SurveyNav.svelte";
  import SurveyPrivacyNotice from "./SurveyPrivacyNotice.svelte";
  import SurveyQuestionCard from "./SurveyQuestionCard.svelte";
  import Tag from "./Tag.svelte";
  import Typography from "./Typography.svelte";
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
    respondentSeed,
    readOnly = false,
    allowSimulatedLinkOpen = false,
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
          offlineLinkError: "Connexion requise pour envoyer votre lien de connexion.",
          requestLinkError: "Impossible d’envoyer le lien de connexion. Veuillez réessayer.",
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
          submitGateSingle: (n: number) =>
            `Veuillez répondre à la question ${n} requise avant d’envoyer vos réponses.`,
          submitGateMinSel: (n: number, min: number) =>
            `Question ${n} : sélectionnez au moins ${min} option(s) avant d’envoyer.`,
          submitGateMaxSel: (n: number, max: number) =>
            `Question ${n} : sélectionnez au plus ${max} option(s) avant d’envoyer.`,
          submitGateMulti: (nums: number[]) =>
            `Veuillez vérifier les questions (${nums.join(", ")}) avant d’envoyer vos réponses.`,
          errorSummaryHeading: "Vérifiez vos réponses avant l’envoi",
          navAriaLabel: "Navigation du sondage",
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
          partialModalClose: "Fermer",
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
          passkeyError: "Impossible d’enregistrer la clé d’accès. Veuillez réessayer.",
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
          offlineLinkError: "An internet connection is required to send your sign-in link.",
          requestLinkError: "Could not send your sign-in link. Please try again.",
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
          submitGateSingle: (n: number) =>
            `Please answer required question ${n} before submitting.`,
          submitGateMinSel: (n: number, min: number) =>
            `Question ${n}: select at least ${min} option(s) before submitting.`,
          submitGateMaxSel: (n: number, max: number) =>
            `Question ${n}: select at most ${max} option(s) before submitting.`,
          submitGateMulti: (nums: number[]) =>
            `Please review questions (${nums.join(", ")}) before submitting.`,
          errorSummaryHeading: "Please review your answers before submitting",
          navAriaLabel: "Survey navigation",
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
          partialModalClose: "Close",
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
          passkeyError: "Could not save the passkey. Please try again.",
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
  let trackedInitKey = "";
  let step = $state<SurveyStep>("questions");
  let email = $state("");
  let emailError = $state("");
  let enrollmentError = $state("");
  let requestingLink = $state(false);
  let sessionIdentity = $state("");
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
  let submitting = $state(false);
  let pendingSubmission = $state<SurveyPendingSubmission | null>(null);
  let pendingIdentity = $state<string | null>(null);
  let lastSubmitted = $state<SurveySubmitPayload | null>(null);
  let passkeySaved = $state(false);
  let registeringPasskey = $state(false);
  let passkeyError = $state("");
  let isOnline = $state(typeof navigator !== "undefined" ? navigator.onLine : true);
  let thanksHeadingEl = $state<HTMLElement | undefined>(undefined);
  let errorSummaryWrap = $state<HTMLElement | undefined>(undefined);

  // Reset / initialize when survey.id or initial auth/session props change (e.g. async /api/me)
  $effect(() => {
    const id = survey.id;
    const initStep = initialStep;
    const initEmail = initialEmail;
    const seed = respondentSeed ?? "";
    const key = `${id}\0${initStep ?? ""}\0${initEmail}\0${seed}`;
    if (key === trackedInitKey) return;
    trackedInitKey = key;

    untrack(() => {
      const nextStep = resolveInitialStep(survey, initStep);
      const cleanedEmail = (initEmail || "").trim();
      const nextIdentity = cleanedEmail || seed.trim() || "anonymous";
      step = nextStep;
      email = initEmail;
      emailError = "";
      enrollmentError = "";
      requestingLink = false;
      sessionIdentity = nextIdentity;
      questionError = "";
      submitError = "";
      missingIds = [];
      submitting = false;
      lastSubmitted = null;

      const restored =
        nextStep === "questions" && persistDraft
          ? loadSurveyDraft(id, nextIdentity, Date.now(), storageSalt)
          : null;

      if (restored) {
        answers = { ...(initialAnswers ?? {}), ...restored.answers };
        questionIndex = Math.min(restored.questionIndex, Math.max(0, survey.questions.length - 1));
        enrollmentMeta = { ...restored.enrollmentMeta };
        expiresAt = restored.expiresAt;
        const hasProgress =
          countAnsweredQuestions(survey.questions, restored.answers) > 0 ||
          restored.questionIndex > 0;
        returnedFromDraft = hasProgress;
        restoredBanner = hasProgress;
      } else {
        answers = initialAnswers ? { ...initialAnswers } : {};
        questionIndex = 0;
        enrollmentMeta = {};
        returnedFromDraft = false;
        restoredBanner = false;
        expiresAt =
          nextStep === "questions" && draftWindowMinutes > 0 ? Date.now() + draftTtlMs : 0;
      }

      passkeySaved = persistDraft ? hasSurveyPasskey(nextIdentity, storageSalt) : false;
      registeringPasskey = false;
      passkeyError = "";
      const loadedPending = persistDraft
        ? loadPendingSubmission(id, nextIdentity, storageSalt)
        : null;
      pendingSubmission = loadedPending;
      pendingIdentity = loadedPending ? nextIdentity : null;
    });
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
      if (
        pendingSubmission &&
        pendingIdentity &&
        !submitting &&
        (step !== "enrollment" || email.trim().toLowerCase() === pendingIdentity.toLowerCase())
      ) {
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

  const activeIdentity = $derived(sessionIdentity || (respondentSeed || "").trim() || "anonymous");

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
    identityOverride?: string,
  ) {
    const now = Date.now();
    const draft: SurveyDraft = {
      surveyId: survey.id,
      answers: nextAnswers,
      questionIndex: nextIndex,
      enrollmentMeta: sanitizeEnrollmentMeta(nextMeta),
      expiresAt: nextExpires,
      updatedAt: now,
    };
    const targetIdentity = identityOverride ?? activeIdentity;
    const notExpired = nextExpires <= 0 || now < nextExpires;
    if (persistDraft && draftWindowMinutes > 0 && notExpired) {
      saveSurveyDraft(survey.id, targetIdentity, draft, storageSalt);
    }
    ondraftchange?.(draft);
  }

  async function handleEnrollmentSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (readOnly || requestingLink) return;
    const cleaned = email.trim();
    if (!isValidSurveyEmail(cleaned)) {
      emailError = copy.emailError;
      return;
    }
    emailError = "";
    enrollmentError = "";

    if (enrollmentMode === "email-magic-link" && !isOnline) {
      enrollmentError = copy.offlineLinkError;
      return;
    }

    const cleanMeta = sanitizeEnrollmentMeta(enrollmentMeta);
    const neverDisplayIds = new Set(
      (survey.enrollmentFields ?? []).filter((f) => f.display === "never").map((f) => f.id),
    );
    const linkMeta = Object.fromEntries(
      Object.entries(cleanMeta).filter(([k]) => !neverDisplayIds.has(k)),
    );

    if (onrequestlink) {
      requestingLink = true;
      try {
        await onrequestlink({
          surveyId: survey.id,
          email: cleaned,
          enrollmentMeta: linkMeta,
        });
      } catch {
        enrollmentError = copy.requestLinkError;
        return;
      } finally {
        requestingLink = false;
      }
    }

    sessionIdentity = cleaned;
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
      enrollmentMeta = cleanMeta;
      expiresAt = draftWindowMinutes > 0 ? Date.now() + draftTtlMs : 0;
      returnedFromDraft = false;
      restoredBanner = false;
      persistCurrentDraft(answers, questionIndex, expiresAt, cleanMeta, cleaned);
    }

    const loadedPending = persistDraft
      ? loadPendingSubmission(survey.id, cleaned, storageSalt)
      : null;
    pendingSubmission = loadedPending;
    pendingIdentity = loadedPending ? cleaned : null;
    passkeySaved = persistDraft ? hasSurveyPasskey(cleaned, storageSalt) : false;

    step = enrollmentMode === "email-magic-link" ? "link_sent" : "questions";
  }

  function handleResumeDraft() {
    if (!existingDraft) return;
    const cleaned = email.trim();
    sessionIdentity = cleaned;
    answers = { ...existingDraft.answers };
    questionIndex = Math.min(existingDraft.questionIndex, Math.max(0, survey.questions.length - 1));
    enrollmentMeta = { ...existingDraft.enrollmentMeta, ...sanitizeEnrollmentMeta(enrollmentMeta) };
    expiresAt = existingDraft.expiresAt;
    returnedFromDraft = true;
    restoredBanner = true;
    const loadedPending = persistDraft
      ? loadPendingSubmission(survey.id, cleaned, storageSalt)
      : null;
    pendingSubmission = loadedPending;
    pendingIdentity = loadedPending ? cleaned : null;
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

  function resetToEnrollment() {
    email = "";
    emailError = "";
    enrollmentError = "";
    requestingLink = false;
    enrollmentMeta = {};
    answers = {};
    questionIndex = 0;
    expiresAt = 0;
    restoredBanner = false;
    returnedFromDraft = false;
    questionError = "";
    submitError = "";
    missingIds = [];
    pendingSubmission = null;
    pendingIdentity = null;
    sessionIdentity = (respondentSeed || "").trim();
    passkeySaved = false;
    registeringPasskey = false;
    passkeyError = "";
    step = "enrollment";
  }

  function leaveForLater() {
    persistCurrentDraft(answers, questionIndex, expiresAt);
    resetToEnrollment();
  }

  function queuePendingSubmission(
    payload: SurveySubmitPayload,
    errorReason: string,
    targetIdentity = activeIdentity,
  ) {
    const sameTarget = pendingIdentity?.toLowerCase() === targetIdentity.toLowerCase();
    const entry: SurveyPendingSubmission = {
      payload,
      queuedAt: sameTarget && pendingSubmission ? pendingSubmission.queuedAt : Date.now(),
      attempts: (sameTarget && pendingSubmission ? pendingSubmission.attempts : 0) + 1,
      lastError: errorReason,
    };
    if (persistDraft) {
      savePendingSubmission(survey.id, targetIdentity, entry, storageSalt);
    }
    if (targetIdentity.toLowerCase() === activeIdentity.toLowerCase()) {
      pendingSubmission = entry;
      pendingIdentity = targetIdentity;
    }
  }

  async function deliverSubmission(
    payload: SurveySubmitPayload,
    targetIdentity = activeIdentity,
    fromExplicitRetry = false,
  ) {
    if (!isOnline) {
      queuePendingSubmission(payload, "offline", targetIdentity);
      return;
    }
    submitting = true;
    try {
      await onsubmit?.(payload);
      if (persistDraft) {
        clearPendingSubmission(survey.id, targetIdentity, storageSalt);
        clearSurveyDraft(survey.id, targetIdentity, storageSalt);
      }
      if (pendingIdentity?.toLowerCase() === targetIdentity.toLowerCase()) {
        pendingSubmission = null;
        pendingIdentity = null;
      }
      if (
        targetIdentity.toLowerCase() === activeIdentity.toLowerCase() &&
        (step !== "enrollment" || fromExplicitRetry)
      ) {
        passkeySaved = persistDraft ? hasSurveyPasskey(targetIdentity, storageSalt) : passkeySaved;
        lastSubmitted = payload;
        step = "thanks";
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : "submit_failed";
      queuePendingSubmission(payload, reason, targetIdentity);
    } finally {
      submitting = false;
    }
  }

  async function flushPendingSubmission(explicit = false) {
    if (!pendingSubmission || !pendingIdentity || submitting) return;
    await deliverSubmission(pendingSubmission.payload, pendingIdentity, explicit);
  }

  function formatSubmitGateError(ids: string[]): string {
    const entries = ids
      .map((id) => {
        const idx = survey.questions.findIndex((q) => q.id === id);
        return idx >= 0 ? { q: survey.questions[idx], num: idx + 1 } : null;
      })
      .filter((item): item is { q: SurveyQuestion; num: number } => item !== null);
    if (entries.length === 1) {
      const { q, num } = entries[0];
      const err = validateQuestionAnswer(q, answers[q.id]);
      if (err === "minSelections" && q.type === "multi" && q.minSelections != null) {
        return copy.submitGateMinSel(num, q.minSelections);
      }
      if (err === "maxSelections" && q.type === "multi" && q.maxSelections != null) {
        return copy.submitGateMaxSel(num, q.maxSelections);
      }
      return copy.submitGateSingle(num);
    }
    if (entries.length > 1) {
      return copy.submitGateMulti(entries.map((e) => e.num));
    }
    return copy.submitGateSingle(1);
  }

  function fieldErrorFor(q: SurveyQuestion): string | undefined {
    if (survey.rules.mode === "one-per-screen" && currentQuestion?.id === q.id && questionError) {
      return questionError;
    }
    if (missingIds.includes(q.id)) {
      return validationMessageFor(q) || copy.requiredError;
    }
    return undefined;
  }

  async function handleExplicitSubmit(requestedMode: "complete" | "partial") {
    if (readOnly || submitting) return;
    const check = validateSubmission(survey, answers, requestedMode);
    if (!check.valid) {
      missingIds = check.missingIds;
      submitError = formatSubmitGateError(check.missingIds);
      if (
        survey.rules.mode === "one-per-screen" &&
        currentQuestion &&
        check.missingIds.includes(currentQuestion.id)
      ) {
        questionError = validationMessageFor(currentQuestion) || copy.requiredError;
      }
      if (survey.rules.mode === "all-at-once") {
        tick().then(() => {
          errorSummaryWrap?.querySelector<HTMLElement>(".st-error-summary")?.focus();
        });
      }
      return;
    }

    missingIds = [];
    submitError = "";
    questionError = "";

    const payload = buildSubmitPayload({
      survey,
      answers,
      enrollmentMeta,
      requestedMode,
      returnedFromDraft,
    });
    await deliverSubmission(payload, activeIdentity);
  }

  async function handleRegisterPasskey() {
    if (registeringPasskey || passkeySaved) return;
    registeringPasskey = true;
    passkeyError = "";
    try {
      await onregisterpasskey?.();
      if (persistDraft) {
        saveSurveyPasskey(activeIdentity, storageSalt);
      }
      passkeySaved = true;
    } catch (err) {
      const isCancel =
        err instanceof Error && (err.name === "NotAllowedError" || err.name === "AbortError");
      if (!isCancel) {
        passkeyError = copy.passkeyError;
      }
    } finally {
      registeringPasskey = false;
    }
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
      const label = q ? resolveLocalizedText(q.label, locale) : id;
      const msg = q ? validationMessageFor(q) || copy.requiredError : copy.requiredError;
      return {
        href: `#st-survey-q-${survey.id}-${id}`,
        text: `${label} — ${msg}`,
      };
    }),
  );
</script>

{#snippet renderQuestionControl(q: SurveyQuestion)}
  {@const qOptions = getOrderedOptions(q)}
  {@const qLegend = resolveLocalizedText(q.label, locale)}
  {@const qHelper = q.helperText ? resolveLocalizedText(q.helperText, locale) : undefined}
  {@const qError = fieldErrorFor(q)}
  <div id={`st-survey-q-${survey.id}-${q.id}`} class="st-surveyForm__questionControl">
    {#if q.type === "multi"}
      <CheckboxGroup
        name={`st-survey-${survey.id}-${q.id}`}
        legend={qLegend}
        variant="card"
        helperText={qHelper ?? copy.multiHint}
        errorText={qError}
        invalid={Boolean(qError)}
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
        errorText={qError}
        invalid={Boolean(qError)}
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
        errorText={qError}
        invalid={Boolean(qError)}
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
            <Stepper
              steps={stepperSteps}
              current={stepIndex}
              label={copy.stepperLabel}
              compactMobile={true}
            />
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
                  onclick={() => void flushPendingSubmission(true)}
                >
                  {copy.retryNowBtn}
                </Button>
              {/snippet}
            </Alert>
            <div class="st-surveyForm__autosaveRow">
              <Autosave
                status={submitting ? "saving" : "error"}
                locale={lang === "fr" ? "fr-CA" : "en-CA"}
                labels={{ saving: copy.autosaveSaving, error: copy.autosavePending }}
              />
            </div>
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
                  disabled={readOnly || requestingLink}
                  oninput={() => {
                    emailError = "";
                    enrollmentError = "";
                    if (
                      pendingIdentity &&
                      email.trim().toLowerCase() !== pendingIdentity.toLowerCase()
                    ) {
                      pendingSubmission = null;
                      pendingIdentity = null;
                    }
                  }}
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
                    disabled={readOnly || requestingLink}
                    oninput={(e) => {
                      enrollmentMeta = {
                        ...enrollmentMeta,
                        [field.id]: e.currentTarget.value,
                      };
                    }}
                  />
                {/each}

                {#if enrollmentError}
                  <Alert tone="error" title={enrollmentError} />
                {/if}

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
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={readOnly || requestingLink}
                  >
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
                  onclick={resetToEnrollment}
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
                <ProgressBar
                  value={questionIndex + 1}
                  max={survey.questions.length}
                  showValue={true}
                  valueText={`${questionIndex + 1} / ${survey.questions.length}`}
                  label={copy.questionCounter(questionIndex + 1, survey.questions.length)}
                />

                <SurveyQuestionCard
                  index={questionIndex + 1}
                  total={survey.questions.length}
                  sectionTag={currentQuestion.moment
                    ? resolveLocalizedText(currentQuestion.moment, locale)
                    : undefined}
                  required={Boolean(currentQuestion.required)}
                  data-invalid={fieldErrorFor(currentQuestion) ? "true" : undefined}
                >
                  {@render renderQuestionControl(currentQuestion)}
                </SurveyQuestionCard>

                {#if submitError}
                  <Alert tone="error" title={submitError} />
                {/if}

                <SurveyNav
                  canGoPrevious={questionIndex > 0}
                  isLast={questionIndex === survey.questions.length - 1}
                  nextDisabled={questionIndex === survey.questions.length - 1
                    ? readOnly || answeredCount === 0
                    : false}
                  {submitting}
                  ariaLabel={copy.navAriaLabel}
                  previousLabel={copy.prevBtn}
                  nextLabel={copy.nextBtn}
                  submitLabel={copy.submitAllBtn}
                  leaveLabel={enrollmentMode !== "none" ? copy.leaveBtn : undefined}
                  allowPartialSubmit={canPartialSubmit}
                  {answeredCount}
                  totalQuestions={survey.questions.length}
                  partialSubmitLabel={copy.submitPartialBtn(answeredCount, survey.questions.length)}
                  partialConfirmTitle={copy.partialModalTitle}
                  partialConfirmDescription={copy.partialModalDesc(
                    answeredCount,
                    survey.questions.length,
                  )}
                  partialConfirmLabel={copy.partialModalConfirm}
                  partialCancelLabel={copy.partialModalCancel}
                  partialCloseLabel={copy.partialModalClose}
                  stickyMobile={true}
                  onprevious={goPrev}
                  onnext={goNext}
                  onsubmit={() => void handleExplicitSubmit("complete")}
                  onpartialsubmit={() => void handleExplicitSubmit("partial")}
                  onleave={leaveForLater}
                />
              {:else}
                {#if errorSummaryItems.length > 0}
                  <div bind:this={errorSummaryWrap}>
                    <ErrorSummary
                      heading={copy.errorSummaryHeading}
                      errors={errorSummaryItems}
                    />
                  </div>
                {/if}
                <Stack gap={4}>
                  {#each survey.questions as q, qIdx (q.id)}
                    <SurveyQuestionCard
                      index={qIdx + 1}
                      total={survey.questions.length}
                      sectionTag={q.moment ? resolveLocalizedText(q.moment, locale) : undefined}
                      required={Boolean(q.required)}
                      data-invalid={fieldErrorFor(q) ? "true" : undefined}
                    >
                      {@render renderQuestionControl(q)}
                    </SurveyQuestionCard>
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
                          disabled={registeringPasskey}
                          onclick={() => void handleRegisterPasskey()}
                        >
                          {resolvedPasskeyBtn}
                        </Button>
                      {/if}
                    </div>
                    {#if passkeyError}
                      <Alert tone="error" title={passkeyError} />
                    {/if}
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
      <div class="st-surveyForm__privacy">
        <div class="st-surveyForm__privacyDesktop">
          <SurveyPrivacyNotice
            title={privacyTitle}
            items={privacyItems}
            mode="card"
            sticky={true}
            headingAs="h3"
          />
        </div>
        <div class="st-surveyForm__privacyCompact">
          <SurveyPrivacyNotice
            title={privacyTitle}
            items={privacyItems}
            mode="collapsible"
            headingAs="h3"
          />
        </div>
      </div>
    {/if}
  </div>
</div>

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
    margin-inline: auto;
    max-width: 44rem;
    min-width: 0;
    width: 100%;
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

  .st-surveyForm__questionControl {
    min-width: 0;
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

  /* 984px+ desktop: two-column layout with sticky privacy card keeping main >= 44rem (>= 600px inner for LikertScale) */
  @container st-survey-form (min-width: 984px) {
    .st-surveyForm--withPrivacy .st-surveyForm__grid {
      gap: var(--st-spacing-6, 1.5rem);
      grid-template-columns: minmax(0, min(100%, 44rem)) minmax(16rem, 20rem);
      justify-content: center;
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
