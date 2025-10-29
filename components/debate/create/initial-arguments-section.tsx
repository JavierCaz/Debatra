"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import type { InitialArgument } from "@/types/debate";
import { ReferencesSection } from "./reference-section";

interface InitialArgumentsSectionProps {
  initialArguments: InitialArgument[];
  error?: string;
  onArgumentsChange: (args: InitialArgument[]) => void;
}

export function InitialArgumentsSection({
  initialArguments,
  error,
  onArgumentsChange,
}: InitialArgumentsSectionProps) {
  const [expandedArguments, setExpandedArguments] = useState<Set<number>>(
    new Set(initialArguments.map((arg) => arg.id)),
  );

  const addArgument = () => {
    const newArgument: InitialArgument = {
      id: Date.now(),
      content: "",
      references: [],
    };
    onArgumentsChange([...initialArguments, newArgument]);
    // Auto-expand new arguments
    setExpandedArguments((prev) => new Set([...prev, newArgument.id]));
  };

  const removeArgument = (id: number) => {
    if (initialArguments.length > 1) {
      onArgumentsChange(initialArguments.filter((arg) => arg.id !== id));
      setExpandedArguments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const updateArgument = (id: number, updates: Partial<InitialArgument>) => {
    onArgumentsChange(
      initialArguments.map((arg) =>
        arg.id === id ? { ...arg, ...updates } : arg,
      ),
    );
  };

  const updateArgumentReferences = (id: number, references: any[]) => {
    updateArgument(id, { references });
  };

  const toggleArgument = (id: number) => {
    setExpandedArguments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isArgumentExpanded = (id: number) => expandedArguments.has(id);

  // Get character count for preview (strip HTML tags)
  const getPreviewText = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, "").trim();
    return plainText.length > 100
      ? plainText.substring(0, 100) + "..."
      : plainText || "No content yet";
  };

  // Check if argument has content
  const hasContent = (argument: InitialArgument) => {
    const plainText = argument.content.replace(/<[^>]*>/g, "").trim();
    return plainText.length > 0;
  };

  // Check if argument has references
  const hasReferences = (argument: InitialArgument) => {
    return argument.references.length > 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Initial Arguments</h3>
          <p className="text-sm text-muted-foreground">
            Add one or more initial arguments to start the debate
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addArgument}>
          <Plus className="h-4 w-4 mr-2" />
          Add Argument
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-4">
        {initialArguments.map((argument, index) => {
          const isExpanded = isArgumentExpanded(argument.id);
          const hasArgumentContent = hasContent(argument);
          const hasArgumentReferences = hasReferences(argument);

          return (
            <Card key={argument.id} className="relative">
              <CardHeader
                className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleArgument(argument.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <CardTitle className="text-base">
                      Argument {index + 1}
                    </CardTitle>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status indicators */}
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      {hasArgumentContent && (
                        <div
                          className="w-2 h-2 rounded-full bg-green-500"
                          title="Has content"
                        />
                      )}
                      {hasArgumentReferences && (
                        <div
                          className="w-2 h-2 rounded-full bg-blue-500"
                          title="Has references"
                        />
                      )}
                    </div>

                    {initialArguments.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeArgument(argument.id);
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleArgument(argument.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Preview when collapsed */}
                {!isExpanded && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      {getPreviewText(argument.content)}
                    </p>
                    {hasArgumentReferences && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {argument.references.length} reference(s)
                      </p>
                    )}
                  </div>
                )}
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-6 border-t pt-4">
                  <div className="space-y-2">
                    <Label>
                      Argument Content{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <TiptapEditor
                      content={argument.content}
                      onChange={(content) =>
                        updateArgument(argument.id, { content })
                      }
                      placeholder="Present your argument, evidence, and reasoning..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Provide a well-reasoned argument with supporting evidence
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <ReferencesSection
                      references={argument.references}
                      onReferencesChange={(references) =>
                        updateArgumentReferences(argument.id, references)
                      }
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const allExpanded =
              initialArguments.length === expandedArguments.size;
            if (allExpanded) {
              setExpandedArguments(new Set());
            } else {
              setExpandedArguments(
                new Set(initialArguments.map((arg) => arg.id)),
              );
            }
          }}
        >
          {expandedArguments.size === initialArguments.length
            ? "Collapse All"
            : "Expand All"}
        </Button>
      </div>
    </div>
  );
}
