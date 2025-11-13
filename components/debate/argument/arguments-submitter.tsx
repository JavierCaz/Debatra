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

  const addArgument = () => {
    if (initialArguments.length >= maxArguments) return;

    const newArgument: InitialArgument = {
      id: Date.now(),
      content: "",
      references: [],
    };
    addItem(newArgument);
  };

  const removeArgument = (id: number) => {
    if (initialArguments.length > minArguments) {
      removeItem(id);
    }
  };

  const updateArgumentReferences = (id: number, references: Reference[]) => {
    updateItem(id, { references });
  };

  const getPreviewText = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, "").trim();
    return plainText.length > 100
      ? plainText.substring(0, 100) + "..."
      : plainText || "No content yet";
  };

  const hasContent = (argument: InitialArgument) => {
    const plainText = argument.content.replace(/<[^>]*>/g, "").trim();
    return plainText.length > 0;
  };

  const hasReferences = (argument: InitialArgument) => {
    return argument.references.length > 0;
  };

  const canAddArgument = initialArguments.length < maxArguments && !disabled;

  const config = {
    title,
    description,
    disabledMessage,
  };

  if (disabled) {
    return <DisabledState title={title} message={disabledMessage} />;
  }

  return (
    <div className="space-y-6">
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Accordion
        type="multiple"
        value={expandedItems}
        onValueChange={setExpandedItems}
        className="space-y-4"
      >
        {initialArguments.map((argument, index) => {
          const hasArgumentContent = hasContent(argument);
          const hasArgumentReferences = hasReferences(argument);

          return (
            <AccordionItemWrapper
              key={argument.id}
              id={argument.id}
              title={
                mode === "create"
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
              <div className="space-y-2">
                <Label>
                  Argument Content <span className="text-destructive">*</span>
                </Label>
                <TiptapEditor
                  content={argument.content}
                  onChange={(content) => updateItem(argument.id, { content })}
                  placeholder="Present your argument, evidence, and reasoning..."
                />
                <p className="text-xs text-muted-foreground">
                  Provide a well-reasoned argument with supporting evidence
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
    </div>
  );
}
