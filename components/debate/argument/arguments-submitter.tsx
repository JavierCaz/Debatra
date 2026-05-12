"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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
  replyToArgumentId?: string;
  replyContextMap?: Map<
    string,
    { userName: string; argumentNumber: number; turnNumber: number }
  >;
  isForfeit?: boolean;
  replyFocusKey?: number;
}

export function ArgumentsSubmitter({
  initialArguments,
  error,
  onArgumentsChange,
  mode = "create",
  disabled = false,
  disabledMessage,
  maxArguments = 8,
  minArguments = 1,
  title,
  description,
  showStatusIndicators = true,
  replyToArgumentId,
  replyContextMap,
  isForfeit = false,
  replyFocusKey = 0,
}: ArgumentsSectionProps) {
  const { t } = useTranslation();
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

  const replyArgIdRef = useRef<number | null>(null);
  const prevFocusKeyRef = useRef(0);

  useEffect(() => {
    const prevId = replyArgIdRef.current;
    const prevFocusKey = prevFocusKeyRef.current;
    prevFocusKeyRef.current = replyFocusKey;

    let currentId: number | null = null;
    if (replyToArgumentId) {
      const replyArg = initialArguments.find(
        (a) => a.responseToId === replyToArgumentId,
      );
      currentId = replyArg ? replyArg.id : null;
    }
    replyArgIdRef.current = currentId;

    if (
      currentId !== null &&
      (currentId !== prevId || replyFocusKey !== prevFocusKey)
    ) {
      const focusEditor = () => {
        const proseMirror = document.querySelector(
          `[data-argument-id="${currentId}"] .ProseMirror`,
        );
        if (proseMirror instanceof HTMLElement) {
          proseMirror.scrollIntoView({ behavior: "smooth", block: "center" });
          proseMirror.focus({ preventScroll: true });
        }
      };

      if (currentId !== prevId) {
        setTimeout(focusEditor, 250);
      } else {
        focusEditor();
      }
    }
  });

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
      : plainText || t("debate.argument.noContent");
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

  const resolvedTitle = title ?? t("debate.content.arguments");
  const resolvedDisabledMessage =
    disabledMessage ?? t("debate.argument.submissionNotAvailable");

  const config = {
    title: isForfeit ? t("debate.argument.forfeitExplanation") : resolvedTitle,
    description: isForfeit
      ? t("debate.argument.forfeitExplanationDesc")
      : description,
    disabledMessage: resolvedDisabledMessage,
  };

  if (disabled) {
    return (
      <DisabledState title={resolvedTitle} message={resolvedDisabledMessage} />
    );
  }

  return (
    <div className="space-y-6">
      {isForfeit && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-destructive">
              {t("debate.argument.forfeitWarning")}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("debate.argument.forfeitWarningDesc")}
            {!initialArguments[0]?.content.trim() && (
              <> {t("debate.argument.forfeitExplainOptional")}</>
            )}
          </p>
        </div>
      )}

      {!isForfeit && (
        <AccordionSectionHeader
          config={config}
          itemsCount={initialArguments.length}
          canAddItem={canAddArgument}
          onAddItem={addArgument}
          itemsLabel={t("debate.argument.title")}
          expandAll={expandAll}
          collapseAll={collapseAll}
          expandedItems={expandedItems}
        />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* In forfeit mode, show just a simple editor */}
      {isForfeit ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("debate.argument.forfeitExplanation")}
            </Label>
            <TiptapEditor
              content={initialArguments[0]?.content || ""}
              onChange={(content) => {
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
              placeholder={t("debate.argument.forfeitPlaceholder")}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("debate.argument.forfeitHint")}
            </p>
          </div>
        </div>
      ) : (
        <Accordion
          type="multiple"
          value={expandedItems}
          onValueChange={setExpandedItems}
          className="space-y-4"
        >
          {initialArguments.map((argument, index) => {
            const hasArgumentContent = hasContent(argument);
            const hasArgumentReferences = hasReferences(argument);
            const isReplyArgument = !!argument.responseToId;
            const argReplyContext =
              isReplyArgument && replyContextMap && argument.responseToId
                ? replyContextMap.get(argument.responseToId)
                : undefined;

            return (
              <AccordionItemWrapper
                key={argument.id}
                id={argument.id}
                title={
                  isReplyArgument
                    ? argReplyContext
                      ? t("debate.argument.replyToUser", {
                          name: argReplyContext.userName,
                          argNum: argReplyContext.argumentNumber,
                          turnNum: argReplyContext.turnNumber,
                        })
                      : t("debate.argument.replyToArg")
                    : mode === "create"
                      ? t("debate.argument.argN", { number: index + 1 })
                      : t("debate.argument.yourArgN", { number: index + 1 })
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
                {isReplyArgument && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 dark:bg-blue-900/20 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {t("debate.argument.replyLinkHint")}
                    </p>
                  </div>
                )}

                <div className="space-y-2" data-argument-id={argument.id}>
                  <Label>
                    {isReplyArgument
                      ? t("debate.argument.replyContent")
                      : t("debate.argument.argContent")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <TiptapEditor
                    content={argument.content}
                    onChange={(content) => updateItem(argument.id, { content })}
                    placeholder={
                      isReplyArgument
                        ? t("debate.argument.replyPlaceholder")
                        : t("debate.argument.argPlaceholder")
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {isReplyArgument
                      ? t("debate.argument.replyHelp")
                      : t("debate.argument.argHelp")}
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
