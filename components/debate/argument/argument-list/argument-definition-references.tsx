import { BookOpen } from "lucide-react";
import type { DefinitionStatus } from "@/app/generated/prisma";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ArgumentWithDefinitions {
  definitionReferences?: {
    id: string;
    term: string;
    definition: string;
    status: DefinitionStatus;
  }[];
}

export function ArgumentDefinitionReferences({
  definitions,
}: {
  definitions: ArgumentWithDefinitions["definitionReferences"];
}) {
  if (!definitions || definitions.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          References {definitions.length} definition
          {definitions.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {definitions.map((def) => (
          <HoverCard key={def.id}>
            <HoverCardTrigger asChild>
              <Badge
                variant={def.status === "ACCEPTED" ? "default" : "secondary"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {def.term}
              </Badge>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{def.term}</h4>
                  <Badge
                    variant="outline"
                    className={
                      def.status === "ACCEPTED"
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                    }
                  >
                    {def.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {def.definition}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  );
}
