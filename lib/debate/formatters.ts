const statusColors = {
  DRAFT: "bg-gray-500",
  OPEN: "bg-green-500",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-purple-500",
  CANCELLED: "bg-red-500",
} as const;

export const getStatusBadgeColor = (
  status: keyof typeof statusColors | string,
): string => {
  const color = statusColors[status as keyof typeof statusColors];

  return color || "bg-gray-500";
};

export const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "PROPOSER":
      return "bg-green-500";
    case "OPPOSER":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export const getRoleTranslationKey = (role: string): string => {
  switch (role) {
    case "PROPOSER":
      return "debate.info.proposers";
    case "OPPOSER":
      return "debate.info.opposers";
    default:
      return role;
  }
};

export function getFormatLabel(format: string): string {
  switch (format) {
    case "ONE_VS_ONE":
      return "1v1";
    case "ONE_VS_MANY":
      return "1 vs Many";
    case "MULTI_SIDED":
      return "Multi-sided";
    default:
      return format;
  }
}

export const getStatusTranslationKey = (status: string) => {
  const map: Record<string, string> = {
    DRAFT: "debates.statusDraft",
    OPEN: "debates.statusOpen",
    IN_PROGRESS: "debates.statusInProgress",
    COMPLETED: "debates.statusCompleted",
    CANCELLED: "debates.statusCancelled",
  };
  return map[status] || status;
};

export function formatTimeLimit(turnTimeLimit: number | null): string {
  return turnTimeLimit ? `${turnTimeLimit}h` : "No limit";
}
