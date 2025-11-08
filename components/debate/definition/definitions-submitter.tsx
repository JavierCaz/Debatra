"use client";

import { BookOpen, Lock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { InitialDefinition } from "@/types/definitions";
import type { Reference } from "@/types/reference";
import { ReferencesSection } from "../reference/reference-section";

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
  const [expandedItems, setExpandedItems] = useState<string[]>(
    definitions.map((def) => def.id.toString()),
  );

  const addDefinition = () => {
    if (definitions.length >= maxDefinitions) return;

    const newDefinition: InitialDefinition = {
      id: Date.now(),
      term: "",
      definition: "",
      context: "",
      references: [],
    };
    onDefinitionsChange([...definitions, newDefinition]);
    setExpandedItems((prev) => [...prev, newDefinition.id.toString()]);
  };

  const removeDefinition = (id: number) => {
    onDefinitionsChange(definitions.filter((def) => def.id !== id));
    setExpandedItems((prev) =>
      prev.filter((itemId) => itemId !== id.toString()),
    );
  };

  const updateDefinition = (
    id: number,
    updates: Partial<InitialDefinition>,
  ) => {
    onDefinitionsChange(
      definitions.map((def) => (def.id === id ? { ...def, ...updates } : def)),
    );
  };

  const hasContent = (definition: InitialDefinition) => {
    return (
      definition.term.trim().length > 0 &&
      definition.definition.trim().length > 0
    );
  };

  const hasreferences = (definition: InitialDefinition) => {
    return definition.references.length > 0;
  };

  const expandAll = () => {
    setExpandedItems(definitions.map((def) => def.id.toString()));
  };

  const collapseAll = () => {
    setExpandedItems([]);
  };

  const canAddDefinition = definitions.length < maxDefinitions && !disabled;

  if (disabled) {
    return (
      <Card className="border-dashed bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Lock className="h-8 w-8 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {disabledMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>

        {canAddDefinition && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDefinition}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Definition
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {definitions.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {definitions.length} definition{definitions.length !== 1 ? "s" : ""}
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={expandAll}
              disabled={expandedItems.length === definitions.length}
            >
              Expand All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={collapseAll}
              disabled={expandedItems.length === 0}
            >
              Collapse All
            </Button>
          </div>
        </div>
      )}

      <Accordion
        type="multiple"
        value={expandedItems}
        onValueChange={setExpandedItems}
        className="space-y-4"
      >
        {definitions.map((definition, index) => {
          const hasDefinitionContent = hasContent(definition);
          const hasDefinitionreferences = hasreferences(definition);
          const isExpanded = expandedItems.includes(definition.id.toString());

          return (
            <AccordionItem
              key={definition.id}
              value={definition.id.toString()}
              className="border border-border rounded-lg bg-background"
            >
              <div className="relative">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                  <div className="flex items-center justify-between w-full pr-8">
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-base font-semibold">
                        {definition.term || `Definition ${index + 1}`}
                      </span>

                      {showStatusIndicators && (
                        <div className="flex items-center space-x-1">
                          {hasDefinitionContent && (
                            <div
                              className="w-2 h-2 rounded-full bg-green-500"
                              title="Has content"
                            />
                          )}
                          {hasDefinitionreferences && (
                            <div
                              className="w-2 h-2 rounded-full bg-blue-500"
                              title="Has references"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDefinition(definition.id);
                  }}
                  className="absolute right-12 top-4 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {!isExpanded && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-muted-foreground">
                    {definition.definition
                      ? definition.definition.length > 100
                        ? definition.definition.substring(0, 100) + "..."
                        : definition.definition
                      : "No definition yet"}
                  </p>
                  {hasDefinitionreferences && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {definition.references.length} source(s)
                    </p>
                  )}
                </div>
              )}

              <AccordionContent className="px-0">
                <div className="px-6 pb-6 space-y-6 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor={`term-${definition.id}`}>
                      Term <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`term-${definition.id}`}
                      value={definition.term}
                      onChange={(e) =>
                        updateDefinition(definition.id, {
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
                        updateDefinition(definition.id, {
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
                        updateDefinition(definition.id, {
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
                        updateDefinition(definition.id, { references })
                      }
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
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
            <Button type="button" variant="outline" onClick={addDefinition}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Definition
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
