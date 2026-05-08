import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { T } from "@/components/ui/translated-text";
import type { Definition } from "@/types/definitions";

interface DefinitionStatusBadgeProps {
  status: Definition["status"];
  versionCount?: number;
}

export function DefinitionStatusBadge({
  status,
  versionCount,
}: DefinitionStatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "PROPOSED":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "CONTESTED":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      case "DEPRECATED":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "CONTESTED":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "ACCEPTED":
        return <T k="debate.definition.accepted" />;
      case "PROPOSED":
        return <T k="debate.definition.proposed" />;
      case "CONTESTED":
        return <T k="debate.definition.contested" />;
      case "DEPRECATED":
        return <T k="debate.definition.deprecated" />;
      default:
        return status;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={getStatusColor()}>
        {getStatusIcon()}
        <span className="ml-1">{getStatusLabel()}</span>
      </Badge>

      {versionCount && (versionCount ?? 0) > 1 && (
        <Badge variant="outline" className="text-xs">
          {versionCount} version{versionCount > 1 ? "s" : ""}
        </Badge>
      )}
    </div>
  );
}
