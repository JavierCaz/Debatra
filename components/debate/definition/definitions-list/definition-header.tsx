import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        <Avatar className="h-4 w-4">
          <AvatarImage src={proposer.image} />
          <AvatarFallback className="text-[8px]">
            {proposer.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span>by {proposer.name}</span>
      </div>
      <span>•</span>
      <span>{new Date(createdAt).toLocaleDateString()}</span>
      {referencesCount > 0 && (
        <>
          <span>•</span>
          <span>
            {referencesCount} reference{referencesCount !== 1 ? "s" : ""}
          </span>
        </>
      )}
    </div>
  );
}
