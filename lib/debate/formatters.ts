export const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "PROPOSER":
      return "bg-green-500";
    case "OPPOSER":
      return "bg-red-500";
    case "NEUTRAL":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

export const getRoleDisplayName = (role: string) => {
  switch (role) {
    case "PROPOSER":
      return "Proposers";
    case "OPPOSER":
      return "Opposers";
    case "NEUTRAL":
      return "Neutral";
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

export function formatTimeLimit(turnTimeLimit: number | null): string {
  return turnTimeLimit ? `${turnTimeLimit}h` : "No limit";
}
