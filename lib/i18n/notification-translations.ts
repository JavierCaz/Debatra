import type { TFunction } from "i18next";
import type { NotificationDTO } from "@/types/notifications";

export function getNotifTitle(n: NotificationDTO, t: TFunction): string {
  const meta = n.metadata as Record<string, unknown> | null;

  switch (n.type) {
    case "NEW_ARGUMENT":
      return t("notifications.yourTurnTitle");
    case "DEBATE_INVITATION":
      return t("notifications.debateInvitationTitle");
    case "DEBATE_ACCEPTED":
      return t("notifications.debateAcceptedTitle");
    case "DEBATE_DECLINED":
      return t("notifications.debateDeclinedTitle");
    case "NEW_DEFINITION":
      return t("notifications.newDefinitionTitle");
    case "DEFINITION_ACCEPTED":
      return t("notifications.definitionAcceptedTitle");
    case "DEFINITION_IMPROVED":
      return t("notifications.definitionImprovedTitle");
    case "DEFINITION_ENDORSED":
      return t("notifications.definitionEndorsedTitle");
    case "ARGUMENT_VOTE": {
      const voteType = meta?.voteType;
      return voteType === "supported"
        ? t("notifications.argumentUpvotedTitle")
        : t("notifications.argumentDownvotedTitle");
    }
    case "DEFINITION_VOTE": {
      const support = meta?.support;
      return support
        ? t("notifications.definitionUpvotedTitle")
        : t("notifications.definitionDownvotedTitle");
    }
    case "DEBATE_COMPLETED":
      return t("notifications.debateCompletedTitle");
    default:
      return n.title || "";
  }
}

export function getNotifMessage(
  n: NotificationDTO,
  t: TFunction,
): string | undefined {
  const meta = n.metadata as Record<string, unknown> | null;
  const debateTitle =
    typeof meta?.debateTitle === "string" ? meta.debateTitle : "";
  const actorName = n.actor?.name || "Someone";
  const term = typeof meta?.term === "string" ? meta.term : "";
  const side =
    typeof meta?.turnSide === "string"
      ? meta.turnSide.toLowerCase()
      : "opponent";
  const turn =
    typeof meta?.turnNumber === "number" ? String(meta.turnNumber) : "1";

  switch (n.type) {
    case "NEW_ARGUMENT":
      return t("notifications.yourTurnMessage", {
        side,
        turn,
        title: debateTitle,
      });
    case "DEBATE_INVITATION":
      return t("notifications.debateInvitationMessage", {
        actor: actorName,
        title: debateTitle,
      });
    case "DEBATE_ACCEPTED":
      return t("notifications.debateAcceptedMessage", {
        actor: actorName,
        title: debateTitle,
      });
    case "DEBATE_DECLINED":
      return t("notifications.debateDeclinedMessage", {
        actor: actorName,
        title: debateTitle,
      });
    case "NEW_DEFINITION":
      return t("notifications.newDefinitionMessage", {
        actor: actorName,
        term,
      });
    case "DEFINITION_ACCEPTED":
      return t("notifications.definitionAcceptedMessage", { term });
    case "DEFINITION_IMPROVED":
      return t("notifications.definitionImprovedMessage", { term });
    case "DEFINITION_ENDORSED":
      return t("notifications.definitionEndorsedMessage", {
        actor: actorName,
        term,
      });
    case "ARGUMENT_VOTE": {
      const voteType = meta?.voteType;
      return t("notifications.argumentVoteMessage", {
        actor: actorName,
        vote: voteType === "supported" ? "supported" : "opposed",
      });
    }
    case "DEFINITION_VOTE": {
      const support = meta?.support;
      return t("notifications.definitionVoteMessage", {
        actor: actorName,
        vote: support ? "supported" : "opposed",
        term,
      });
    }
    case "DEBATE_COMPLETED": {
      const winningRole =
        typeof meta?.winningRole === "string"
          ? meta.winningRole.toLowerCase()
          : "";
      return t("notifications.debateCompletedMessage", {
        title: debateTitle,
        side: winningRole,
      });
    }
    default:
      return n.message || undefined;
  }
}
