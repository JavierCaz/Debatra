import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { T } from "@/components/ui/translated-text";

export function DefinitionsEmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          <T k="debate.definition.noDefinitions" />
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          <T k="debate.definition.noDefinitionsList" />
        </p>
      </CardContent>
    </Card>
  );
}
