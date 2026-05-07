"use client";

import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  disabledMessage: disabledMessageProp,
  maxDefinitions = 10,
  title: titleProp,
  description: descriptionProp,
  showStatusIndicators = true,
}: DefinitionsSubmitterProps) {
  const { t } = useTranslation();
  const disabledMessage =
    disabledMessageProp ?? t("debate.definition.submissionNotAvailable");
  const title = titleProp ?? t("debate.definition.title");
  const description = descriptionProp ?? t("debate.definition.description");

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
      title: t("debate.definition.noDefinitions"),
      description: t("debate.definition.noDefinitionsDesc"),
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
        itemsLabel={t("debate.definition.term")}
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
              title={
                definition.term ||
                t("debate.definition.termN", { number: index + 1 })
              }
              preview={
                definition.definition
                  ? definition.definition.length > 100
                    ? `${definition.definition.substring(0, 100)}...`
                    : definition.definition
                  : t("debate.definition.noDefinitionYet")
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
                  placeholder={t("debate.definition.termPlaceholder")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("debate.definition.termHelp")}
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
                  placeholder={t("debate.definition.defPlaceholder")}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {t("debate.definition.defHelp")}
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
            <h4 className="text-base font-semibold mb-2">
              {t("debate.definition.noDefinitions")}
            </h4>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              {t("debate.definition.noDefinitionsDesc")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
