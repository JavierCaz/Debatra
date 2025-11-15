import { CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Definition } from "@/types/definitions";

interface VersionSelectorProps {
  versions: Pick<Definition, "id" | "status" | "createdAt">[];
  currentVersionId: string;
  onVersionSelect: (versionId: string) => void;
}

export function VersionSelector({
  versions,
  currentVersionId,
  onVersionSelect,
}: VersionSelectorProps) {
  if (versions.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap p-2">
      {versions.map((version, index) => (
        <div key={version.id} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVersionSelect(version.id)}
            className={`h-auto p-2 text-xs ${
              version.id === currentVersionId
                ? "text-primary font-semibold bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Version {versions.length - index}
          </Button>
        </div>
      ))}
    </div>
  );
}
