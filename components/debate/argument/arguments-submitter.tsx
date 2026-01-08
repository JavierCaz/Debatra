"use client";

import { Accordion } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { useAccordionItems } from "@/hooks/use-accordion-items";
import type { InitialArgument } from "@/types/debate";
import type { Reference } from "@/types/reference";
import { ReferencesSection } from "../reference/reference-section";
import { AccordionItemWrapper } from "../submission/shared/accordion-item-wrapper";
import { AccordionSectionHeader } from "../submission/shared/accordion-section-header";
import { DisabledState } from "../submission/shared/disabled-state";

interface ArgumentsSectionProps {
  initialArguments: InitialArgument[];
  error?: string;
  onArgumentsChange: (args: InitialArgument[]) => void;
  mode?: "create" | "respond";
  disabled?: boolean;
  disabledMessage?: string;
  maxArguments?: number;
  minArguments?: number;
  title?: string;
  description?: string;
  showStatusIndicators?: boolean;
  isReply?: boolean;
  replyToArgumentId?: string;
  isForfeit?: boolean;
}

export function ArgumentsSubmitter({
  initialArguments,
  error,
  onArgumentsChange,
  mode = "create",
  disabled = false,
  disabledMessage = "Argument submission is not available at this time",
  maxArguments = 8,
  minArguments = 1,
  title = "Arguments",
  description = "Add your arguments with supporting evidence",
  showStatusIndicators = true,
  isReply = false,
  replyToArgumentId,
  isForfeit = false,
}: ArgumentsSectionProps) {
  const {
    expandedItems,
    setExpandedItems,
    addItem,
    removeItem,
    updateItem,
    expandAll,
    collapseAll,
    isExpanded,
  } = useAccordionItems(initialArguments, onArgumentsChange);

  // Find the reply argument if it exists
  const replyArgument =
    isReply && replyToArgumentId
      ? initialArguments.find((arg) => arg.responseToId === replyToArgumentId)
      : null;

  const addArgument = () => {
    if (initialArguments.length >= maxArguments || isForfeit) return;

    const newArgument: InitialArgument = {
      id: Date.now(),
      content: "",
      references: [],
    };
    addItem(newArgument);
  };

  const removeArgument = (id: number) => {
    if (initialArguments.length > minArguments && !isForfeit) {
      removeItem(id);
    }
  };

  const updateArgumentReferences = (id: number, references: Reference[]) => {
    if (!isForfeit) {
      updateItem(id, { references });
    }
  };

  const getPreviewText = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, "").trim();
    return plainText.length > 100
      ? `${plainText.substring(0, 100)}...`
      : plainText || "No content yet";
  };

  const hasContent = (argument: InitialArgument) => {
    const plainText = argument.content.replace(/<[^>]*>/g, "").trim();
    return plainText.length > 0;
  };

  const hasReferences = (argument: InitialArgument) => {
    return argument.references.length > 0;
  };

  const canAddArgument =
    initialArguments.length < maxArguments && !disabled && !isForfeit;

  const config = {
    title: isForfeit ? "Forfeit Explanation (Optional)" : title,
    description: isForfeit
      ? "You can provide an optional explanation for forfeiting the debate."
      : description,
    disabledMessage,
  };

  if (disabled) {
    return <DisabledState title={title} message={disabledMessage} />;
  }

  return (
    <div className="space-y-6">
      {/* Show forfeit warning banner when in forfeit mode */}
      {isForfeit && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-destructive">
              You are about to forfeit the debate
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This means you will concede the entire debate and your opponent will
            win. This action cannot be undone.
            {!initialArguments[0]?.content.trim() &&
              " You can optionally provide an explanation below."}
          </p>
        </div>
      )}

      {/* Reply Indicator Banner - hide in forfeit mode */}
      {isReply && replyArgument && !isForfeit && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              You are replying to an argument
            </p>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            One of your arguments below is specifically replying to another
            argument and will be linked in the discussion thread. You can also
            add regular arguments alongside your reply.
          </p>
        </div>
      )}

      {/* Accordion Section Header - hide in forfeit mode */}
      {!isForfeit && (
        <AccordionSectionHeader
          config={config}
          itemsCount={initialArguments.length}
          canAddItem={canAddArgument}
          onAddItem={addArgument}
          itemsLabel="Argument"
          expandAll={expandAll}
          collapseAll={collapseAll}
          expandedItems={expandedItems}
        />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* In forfeit mode, show just a simple editor */}
      {isForfeit ? (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Forfeit Explanation (Optional)
            </Label>
            <TiptapEditor
              content={initialArguments[0]?.content || ""}
              onChange={(content) => {
                // Ensure we have at least one argument
                if (initialArguments.length === 0) {
                  const newArgument: InitialArgument = {
                    id: Date.now(),
                    content,
                    references: [],
                  };
                  onArgumentsChange([newArgument]);
                } else {
                  updateItem(initialArguments[0].id, { content });
                }
              }}
              placeholder="Optional: Explain why you're forfeiting the debate..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              This explanation is optional and will be visible to your opponent.
            </p>
          </div>
        </div>
      ) : (
        // Normal mode (not forfeit) - show full accordion interface
        <Accordion
          type="multiple"
          value={expandedItems}
          onValueChange={setExpandedItems}
          className="space-y-4"
        >
          {initialArguments.map((argument, index) => {
            const hasArgumentContent = hasContent(argument);
            const hasArgumentReferences = hasReferences(argument);
            const isReplyArgument = replyToArgumentId
              ? argument.responseToId === replyToArgumentId
              : false;

            return (
              <AccordionItemWrapper
                key={argument.id}
                id={argument.id}
                title={
                  isReplyArgument
                    ? `Reply to Argument`
                    : mode === "create"
                      ? `Argument ${index + 1}`
                      : `Your Argument ${index + 1}`
                }
                preview={getPreviewText(argument.content)}
                isExpanded={isExpanded(argument.id)}
                showStatusIndicators={showStatusIndicators}
                hasContent={hasArgumentContent}
                hasReferences={hasArgumentReferences}
                referencesCount={argument.references.length}
                canDelete={initialArguments.length > minArguments}
                onDelete={removeArgument}
              >
                {/* Reply Indicator */}
                {isReplyArgument && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          This argument is a reply
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Make sure to address the points in the original
                          argument you're responding to. This argument will be
                          linked to the original in the discussion thread.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>
                    {isReplyArgument ? "Reply Content" : "Argument Content"}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <TiptapEditor
                    content={argument.content}
                    onChange={(content) => updateItem(argument.id, { content })}
                    placeholder={
                      isReplyArgument
                        ? "Write your response to the argument. Address specific points and provide counter-evidence..."
                        : "Present your argument, evidence, and reasoning..."
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {isReplyArgument
                      ? "Provide a thoughtful response that addresses the original argument's points"
                      : "Provide a well-reasoned argument with supporting evidence"}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <ReferencesSection
                    references={argument.references}
                    onReferencesChange={(references: Reference[]) =>
                      updateArgumentReferences(argument.id, references)
                    }
                  />
                </div>
              </AccordionItemWrapper>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
