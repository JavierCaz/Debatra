export function getRoleBadgeColor(role: string): string {
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
}

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

export function getStatusColor(status: string): string {
  switch (status) {
    case "DRAFT":
      return "bg-gray-500";
    case "OPEN":
      return "bg-blue-500";
    case "IN_PROGRESS":
      return "bg-yellow-500";
    case "COMPLETED":
      return "bg-green-500";
    case "CANCELLED":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

export function formatTimeLimit(turnTimeLimit: number | null): string {
  return turnTimeLimit ? `${turnTimeLimit}h` : "No limit";
}
