"use client";

import { BookOpen } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAccordionItems } from "@/hooks/use-accordion-items";
import type { InitialDefinition } from "@/types/definitions";
import type { Reference } from "@/types/reference";
import { ReferencesSection } from "../reference/reference-section";
import { AccordionItemWrapper } from "../submission/shared/accordion-item-wrapper";
import { AccordionSectionHeader } from "../submission/shared/accordion-section-header";
import { DisabledState } from "../submission/shared/disabled-state";

interface DefinitionsSubmitterProps {
  definitions: InitialDefinition[];
  error?: string;
  onDefinitionsChange: (definitions: InitialDefinition[]) => void;
  disabled?: boolean;
  disabledMessage?: string;
  maxDefinitions?: number;
  title?: string;
  description?: string;
  showStatusIndicators?: boolean;
}

export function DefinitionsSubmitter({
  definitions,
  error,
  onDefinitionsChange,
  disabled = false,
  disabledMessage = "Definition submission is not available at this time",
  maxDefinitions = 10,
  title = "Key Definitions",
  description = "Define important terms and concepts for this debate",
  showStatusIndicators = true,
}: DefinitionsSubmitterProps) {
  const {
    expandedItems,
    setExpandedItems,
    addItem,
    removeItem,
    updateItem,
    expandAll,
    collapseAll,
    isExpanded,
  } = useAccordionItems(definitions, onDefinitionsChange);

  const addDefinition = () => {
    if (definitions.length >= maxDefinitions) return;

    const newDefinition: InitialDefinition = {
      id: Date.now(),
      term: "",
      definition: "",
      context: "",
      references: [],
    };
    addItem(newDefinition);
  };

  const hasContent = (definition: InitialDefinition) => {
    return (
      definition.term.trim().length > 0 &&
      definition.definition.trim().length > 0
    );
  };

  const hasReferences = (definition: InitialDefinition) => {
    return definition.references.length > 0;
  };

  const canAddDefinition = definitions.length < maxDefinitions && !disabled;

  const config = {
    title,
    description,
    disabledMessage,
    icon: BookOpen,
    emptyMessage: {
      title: "No Definitions Yet",
      description:
        "Defining key terms helps ensure all participants share a common understanding of important concepts in the debate.",
      icon: BookOpen,
    },
  };

  if (disabled) {
    return (
      <DisabledState title={title} message={disabledMessage} icon={BookOpen} />
    );
  }

  return (
    <div className="space-y-6">
      <AccordionSectionHeader
        config={config}
        itemsCount={definitions.length}
        canAddItem={canAddDefinition}
        onAddItem={addDefinition}
        itemsLabel="Definition"
        expandAll={expandAll}
        collapseAll={collapseAll}
        expandedItems={expandedItems}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Accordion
        type="multiple"
        value={expandedItems}
        onValueChange={setExpandedItems}
        className="space-y-4"
      >
        {definitions.map((definition, index) => {
          const hasDefinitionContent = hasContent(definition);
          const hasDefinitionReferences = hasReferences(definition);

          return (
            <AccordionItemWrapper
              key={definition.id}
              id={definition.id}
              title={definition.term || `Definition ${index + 1}`}
              preview={
                definition.definition
                  ? definition.definition.length > 100
                    ? `${definition.definition.substring(0, 100)}...`
                    : definition.definition
                  : "No definition yet"
              }
              isExpanded={isExpanded(definition.id)}
              showStatusIndicators={showStatusIndicators}
              hasContent={hasDefinitionContent}
              hasReferences={hasDefinitionReferences}
              referencesCount={definition.references.length}
              canDelete={true}
              onDelete={removeItem}
            >
              <div className="space-y-2">
                <Label htmlFor={`term-${definition.id}`}>
                  Term <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`term-${definition.id}`}
                  value={definition.term}
                  onChange={(e) =>
                    updateItem(definition.id, {
                      term: e.target.value,
                    })
                  }
                  placeholder="e.g., Universal Basic Income, Sustainability, Democracy"
                />
                <p className="text-xs text-muted-foreground">
                  The specific term or concept you're defining
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`definition-${definition.id}`}>
                  Definition <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id={`definition-${definition.id}`}
                  value={definition.definition}
                  onChange={(e) =>
                    updateItem(definition.id, {
                      definition: e.target.value,
                    })
                  }
                  placeholder="Provide a clear, precise definition of the term"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Be as clear and specific as possible
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`context-${definition.id}`}>
                  Context (Optional)
                </Label>
                <Textarea
                  id={`context-${definition.id}`}
                  value={definition.context || ""}
                  onChange={(e) =>
                    updateItem(definition.id, {
                      context: e.target.value,
                    })
                  }
                  placeholder="Explain why this definition is important for this debate or provide additional context"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Why is this definition important for this debate?
                </p>
              </div>

              <div className="border-t pt-4">
                <ReferencesSection
                  references={definition.references}
                  onReferencesChange={(references: Reference[]) =>
                    updateItem(definition.id, { references })
                  }
                />
              </div>
            </AccordionItemWrapper>
          );
        })}
      </Accordion>

      {definitions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-base font-semibold mb-2">No Definitions Yet</h4>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Defining key terms helps ensure all participants share a common
              understanding of important concepts in the debate.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
