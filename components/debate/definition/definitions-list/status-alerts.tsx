import { T } from "@/components/ui/translated-text";
import type { Definition } from "@/types/definitions";

interface StatusAlertsProps {
  status: Definition["status"];
  isSuperseded?: boolean;
}

export function StatusAlerts({ status, isSuperseded }: StatusAlertsProps) {
  if (status === "DEPRECATED" && isSuperseded) {
    return (
      <div className="bg-yellow-500/10 dark:bg-yellow-500/20 border border-yellow-500/20 dark:border-yellow-500/30 p-3 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-400">
          <T k="debate.definition.superseded" />
        </p>
      </div>
    );
  }

  if (status === "CONTESTED") {
    return (
      <div className="bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 dark:border-orange-500/30 p-3 rounded-lg">
        <p className="text-sm text-orange-800 dark:text-orange-400">
          <T k="debate.definition.improved" />
        </p>
      </div>
    );
  }

  return null;
}
