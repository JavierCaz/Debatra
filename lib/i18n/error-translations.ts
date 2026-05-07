import type { TFunction } from "i18next";

const exactMatches: Record<string, string> = {
  "You must be logged in to submit arguments": "debate.errors.loginRequired",
  "At least one argument is required": "debate.errors.atLeastOneArg",
  "Debate not found": "debate.errors.debateNotFound",
  "Debate is not in progress": "debate.errors.debateNotInProgress",
  "You are not a participant in this debate": "debate.errors.notParticipant",
  "It's not your turn to submit arguments": "debate.errors.notYourTurn",
  "You have already submitted arguments for this turn":
    "debate.errors.alreadySubmitted",
  "Each argument must have at least 10 characters of content":
    "debate.errors.argMinLength",
  "You must be logged in to supersede definitions":
    "debate.errors.loginRequiredDefinitions",
  "Original definition not found": "debate.errors.originalDefinitionNotFound",
  "Only debate participants can supersede definitions":
    "debate.errors.participantsOnly",
};

export function translateSubmitError(
  message: string,
  t: TFunction,
  isForfeit: boolean,
): string {
  if (message.startsWith("Each argument requires at least")) {
    const count = Number.parseInt(message.match(/\d+/)?.[0] || "1", 10);
    return t("debate.errors.argMinReferences", { count });
  }

  const key = exactMatches[message];
  if (key) return t(key);

  return isForfeit
    ? t("debate.errors.failedToForfeit")
    : t("debate.errors.failedToSubmitArgs");
}

export function translateDefinitionError(
  message: string,
  t: TFunction,
): string | undefined {
  const key = exactMatches[message];
  return key ? t(key) : undefined;
}
