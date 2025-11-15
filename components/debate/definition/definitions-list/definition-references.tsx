import { ExternalLink } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DefinitionReference } from "@/types/definitions";

interface DefinitionReferencesProps {
  references: DefinitionReference[];
  definitionId: string;
}

export function DefinitionReferences({
  references,
  definitionId,
}: DefinitionReferencesProps) {
  const [expandedReferences, setExpandedReferences] = useState<string[]>([]);

  const getReferenceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ACADEMIC_PAPER: "Academic Paper",
      NEWS_ARTICLE: "News Article",
      BOOK: "Book",
      GOVERNMENT_DOCUMENT: "Government Document",
      STATISTICS: "Statistics",
      VIDEO: "Video",
      WEBSITE: "Website",
      OTHER: "Other",
    };
    return labels[type] || type;
  };

  if (references.length === 0) return null;

  return (
    <div className="border-t pt-4">
      <Accordion
        type="multiple"
        value={expandedReferences}
        onValueChange={setExpandedReferences}
      >
        <AccordionItem value={definitionId} className="border-none">
          <AccordionTrigger className="hover:no-underline py-2">
            <h4 className="text-sm font-semibold text-muted-foreground">
              References ({references.length})
            </h4>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {references.map((reference, index) => (
                <div
                  key={reference.id}
                  className="bg-muted/30 dark:bg-muted/50 p-3 rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {getReferenceTypeLabel(reference.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Reference {index + 1}
                        </span>
                      </div>
                      <h5 className="font-semibold text-sm text-foreground">
                        {reference.title}
                      </h5>
                      {reference.author && (
                        <p className="text-xs text-muted-foreground">
                          by {reference.author}
                        </p>
                      )}
                      {reference.publication && (
                        <p className="text-xs text-muted-foreground">
                          {reference.publication}
                        </p>
                      )}
                      {reference.notes && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          {reference.notes}
                        </p>
                      )}
                    </div>
                    {reference.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="shrink-0"
                      >
                        <a
                          href={reference.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
