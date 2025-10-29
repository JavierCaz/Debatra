// components/debate/argument-references.tsx
"use client";

import { format } from "date-fns";
import { ChevronDown, ChevronUp, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { DebateWithDetails } from "@/types/debate";

interface ArgumentReferencesProps {
  references: DebateWithDetails["participants"][0]["arguments"][0]["references"];
}

const getReferenceTypeIcon = (_type: string) => {
  return <FileText className="w-3 h-3" />;
};

export function ArgumentReferences({ references }: ArgumentReferencesProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (references.length === 0) return null;

  return (
    <div className="mt-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              References ({references.length})
            </span>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span className="sr-only">Toggle references</span>
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-3">
          <div className="space-y-3">
            {references.map((reference) => (
              <div
                key={reference.id}
                className="flex items-start space-x-3 p-3 bg-background border rounded-lg"
              >
                {getReferenceTypeIcon(reference.type)}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm leading-relaxed">
                      {reference.title}
                    </p>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {reference.type.replace("_", " ")}
                    </Badge>
                  </div>

                  {reference.author && (
                    <p className="text-xs text-muted-foreground">
                      {reference.author}
                      {reference.publication && ` - ${reference.publication}`}
                      {reference.publishedAt &&
                        ` (${format(new Date(reference.publishedAt), "yyyy")})`}
                    </p>
                  )}

                  {reference.url && (
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center"
                    >
                      View source
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}

                  {reference.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      Note: {reference.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
