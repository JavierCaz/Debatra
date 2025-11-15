"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import type { Definition, DefinitionsListProps } from "@/types/definitions";
import { DefinitionActions } from "./definition-actions";
import { DefinitionHeader } from "./definition-header";
import { DefinitionReferences } from "./definition-references";
import { DefinitionStatusBadge } from "./definition-status-badge";
import { DefinitionsEmptyState } from "./definitions-empty-state";
import { StatusAlerts } from "./status-alerts";
import { VersionSelector } from "./version-selector";

export function DefinitionsList({
  definitions,
  currentUserId,
  debate,
  onVote,
  onAccept,
  onSupersede,
  isParticipant = false,
  isUsersTurn = false,
}: DefinitionsListProps) {
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<
    string | null
  >(null);
  const [expandedDefinitions, setExpandedDefinitions] = useState<string[]>([]);

  // Group definitions by term and build version history
  const definitionsByTerm = definitions.reduce(
    (acc, definition) => {
      if (!acc[definition.term]) {
        acc[definition.term] = [];
      }
      acc[definition.term].push(definition);
      return acc;
    },
    {} as Record<string, Definition[]>,
  );

  // Sort each term's definitions by creation date (newest first)
  Object.keys(definitionsByTerm).forEach((term) => {
    definitionsByTerm[term].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  });

  // Get the current definition to display
  const getCurrentDefinition = (termDefinitions: Definition[]) => {
    if (selectedDefinitionId) {
      const selected = termDefinitions.find(
        (def) => def.id === selectedDefinitionId,
      );
      if (selected) return selected;
    }
    return termDefinitions[0];
  };

  const getIsOppositeTeam = (definition: Definition): boolean => {
    if (!currentUserId || !isParticipant) return false;

    // Find current user's participant record
    const currentUserParticipant = debate.participants.find(
      (p) => p.userId === currentUserId,
    );

    // Find definition proposer's participant record
    const definitionProposerParticipant = debate.participants.find(
      (p) => p.userId === definition.proposer.id,
    );

    if (!currentUserParticipant || !definitionProposerParticipant) return false;

    // User is on opposite team if their role is different from proposer's role
    return currentUserParticipant.role !== definitionProposerParticipant.role;
  };

  // Expand/Collapse All functions
  const expandAll = () => {
    setExpandedDefinitions(Object.keys(definitionsByTerm));
  };

  const collapseAll = () => {
    setExpandedDefinitions([]);
  };

  if (definitions.length === 0) {
    return <DefinitionsEmptyState />;
  }

  return (
    <div className="space-y-4">
      {/* Expand/Collapse Controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {Object.keys(definitionsByTerm).length} term
          {Object.keys(definitionsByTerm).length !== 1 ? "s" : ""} defined
        </div>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={expandAll}
            disabled={
              expandedDefinitions.length ===
              Object.keys(definitionsByTerm).length
            }
          >
            Expand All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={collapseAll}
            disabled={expandedDefinitions.length === 0}
          >
            Collapse All
          </Button>
        </div>
      </div>

      <Accordion
        type="multiple"
        value={expandedDefinitions}
        onValueChange={setExpandedDefinitions}
        className="border-b rounded-lg space-y-4"
      >
        {Object.entries(definitionsByTerm).map(([term, termDefinitions]) => {
          const currentDefinition = getCurrentDefinition(termDefinitions);
          const hasMultipleVersions = termDefinitions.length > 1;
          const isExpanded = expandedDefinitions.includes(term);
          const isOppositeTeam = getIsOppositeTeam(currentDefinition);

          return (
            <AccordionItem
              key={term}
              value={term}
              className="border rounded-lg bg-background"
            >
              <AccordionTrigger className="px-6 mb-2 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/50 rounded-t-lg">
                <div className="flex items-center justify-between w-full pr-8">
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-base font-semibold">
                      {currentDefinition.term}
                    </span>
                    <DefinitionStatusBadge
                      status={currentDefinition.status}
                      referencedCount={currentDefinition.referencedByArguments}
                      versionCount={
                        hasMultipleVersions ? termDefinitions.length : undefined
                      }
                    />
                  </div>
                </div>
              </AccordionTrigger>

              {/* Preview when collapsed */}
              {!isExpanded && (
                <div className="px-6 pb-4">
                  <DefinitionHeader
                    proposer={currentDefinition.proposer}
                    createdAt={currentDefinition.createdAt}
                    referencesCount={currentDefinition.references.length}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentDefinition.definition.length > 150
                      ? `${currentDefinition.definition.substring(0, 150)}...`
                      : currentDefinition.definition}
                  </p>
                </div>
              )}

              <AccordionContent className="px-0">
                <div className="px-6 pb-6 space-y-4">
                  {/* Version History Selector */}
                  {hasMultipleVersions && (
                    <VersionSelector
                      versions={termDefinitions}
                      currentVersionId={currentDefinition.id}
                      onVersionSelect={setSelectedDefinitionId}
                    />
                  )}

                  {/* Definition Metadata */}
                  <DefinitionHeader
                    proposer={currentDefinition.proposer}
                    createdAt={currentDefinition.createdAt}
                    referencesCount={currentDefinition.references.length}
                  />

                  {/* Definition Text */}
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                      Definition
                    </h4>
                    <p className="text-base leading-relaxed">
                      {currentDefinition.definition}
                    </p>
                  </div>

                  {/* Context (if provided) */}
                  {currentDefinition.context && (
                    <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                        Context
                      </h4>
                      <p className="text-sm leading-relaxed text-foreground">
                        {currentDefinition.context}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <DefinitionActions
                    definitionId={currentDefinition.id}
                    status={currentDefinition.status}
                    votes={currentDefinition.votes}
                    currentUserId={currentUserId}
                    isParticipant={isParticipant}
                    isUsersTurn={isUsersTurn}
                    isOppositeTeam={isOppositeTeam}
                    onVote={onVote}
                    onAccept={onAccept}
                    onSupersede={onSupersede}
                  />

                  {/* References */}
                  <DefinitionReferences
                    references={currentDefinition.references}
                    definitionId={currentDefinition.id}
                  />

                  {/* Status-specific warnings */}
                  <StatusAlerts
                    status={currentDefinition.status}
                    isSuperseded={!!currentDefinition.supersededBy}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
