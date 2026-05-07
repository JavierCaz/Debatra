import { T } from "@/components/ui/translated-text";
import type { DefinitionUser } from "@/types/definitions";

interface DefinitionHeaderProps {
  proposer: DefinitionUser;
  createdAt: Date;
  referencesCount: number;
}

export function DefinitionHeader({
  proposer,
  createdAt,
  referencesCount,
}: DefinitionHeaderProps) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <span>
          <T
            k="debate.definition.byProposer"
            values={{ name: proposer.name }}
          />
        </span>
      </div>
      <span>•</span>
      <span>{new Date(createdAt).toLocaleDateString()}</span>
      {referencesCount > 0 && (
        <>
          <span>•</span>
          <span>
            <T
              k="debate.definition.referencesCount"
              values={{ count: referencesCount }}
            />
          </span>
        </>
      )}
    </div>
  );
}
