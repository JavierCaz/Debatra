"use client";

import { useState } from "react";
import { DebateResponseSection } from "@/components/debate/details/debate-response-section";
import { DefinitionsResponseSection } from "@/components/debate/details/definitions-response-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { groupArgumentsByTurn } from "@/lib/debate/stats";
import type { DebateWithDetails } from "@/types/debate";
import { ArgumentsList } from "../argument/argument-list";
import { DefinitionsList } from "../definition/definitions-list";

// Simple interface for the transformed definition data
interface TransformedDefinition {
  id: string;
  term: string;
  definition: string;
  context?: string;
  status: "PROPOSED" | "ACCEPTED" | "CONTESTED" | "DEPRECATED";
  createdAt: Date;
  proposer: {
    id: string;
    name: string;
    image?: string;
  };
  references: Array<{
    id: string;
    type: string;
    title: string;
    url?: string;
    author?: string;
    publication?: string;
    notes?: string;
  }>;
  votes: {
    support: number;
    oppose: number;
  };
  endorsements: Array<{
    id: string;
    user: {
      name: string;
      image?: string;
    };
  }>;
  supersededBy?: {
    id: string;
    term: string;
  };
  referencedByArguments: number;
}

interface DebateContentSectionProps {
  debate: DebateWithDetails;
  currentUserId?: string;
  isParticipant?: boolean;
}

export function DebateContentSection({
  debate,
  currentUserId,
  isParticipant = false,
}: DebateContentSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("arguments");
  const [supersedeDefinitionId, setSupersedeDefinitionId] = useState<
    string | null
  >(null);

  const argumentsByTurn = groupArgumentsByTurn(debate);
  const turnNumbers = Object.keys(argumentsByTurn)
    .map(Number)
    .sort((a, b) => a - b);

  // Safe transformation of definitions data with null handling
  const transformedDefinitions: TransformedDefinition[] =
    debate.definitions.map((def) => {
      const supportVotes =
        def.votes?.filter((vote) => vote.support).length || 0;
      const opposeVotes =
        def.votes?.filter((vote) => !vote.support).length || 0;

      return {
        id: def.id,
        term: def.term,
        definition: def.definition,
        context: def.context || undefined,
        status: def.status,
        createdAt: def.createdAt,
        proposer: {
          id: def.proposer.id,
          name: def.proposer.name || "Unknown User",
          image: def.proposer.image || undefined,
        },
        references: def.references.map((ref) => ({
          id: ref.id,
          type: ref.type,
          title: ref.title,
          url: ref.url || undefined,
          author: ref.author || undefined,
          publication: ref.publication || undefined,
          notes: ref.notes || undefined,
        })),
        votes: {
          support: supportVotes,
          oppose: opposeVotes,
        },
        endorsements: (def.endorsements || []).map((endorsement) => ({
          id: endorsement.id,
          user: {
            name: endorsement.user.name || "Unknown User",
            image: endorsement.user.image || undefined,
          },
        })),
        supersededBy: def.supersededBy
          ? {
              id: def.supersededBy.id,
              term: def.supersededBy.term,
            }
          : undefined,
        referencedByArguments: def.argumentReferences?.length ?? 0,
      };
    });

  const totalDefinitions = transformedDefinitions.length;

  const handleTabChange = (value: string) => {
    if (value === "arguments" || value === "definitions") {
      setActiveTab(value);
    }
  };

  // Handler functions for definition interactions
  const handleDefinitionVote = async (
    definitionId: string,
    support: boolean,
  ) => {
    try {
      const response = await fetch("/api/definitions/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          definitionId,
          support,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error("Failed to vote:", result.error);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error voting on definition:", error);
    }
  };

  const handleDefinitionEndorse = async (definitionId: string) => {
    try {
      const response = await fetch("/api/definitions/endorse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          definitionId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error("Failed to endorse:", result.error);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error endorsing definition:", error);
    }
  };

  const handleAcceptDefinition = async (definitionId: string) => {
    try {
      const response = await fetch("/api/definitions/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          definitionId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error("Failed to accept definition:", result.error);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error accepting definition:", error);
    }
  };

  const handleSupersedeDefinition = (definitionId: string) => {
    setSupersedeDefinitionId(definitionId);
  };

  const handleSupersedeComplete = () => {
    setSupersedeDefinitionId(null);
    window.location.reload(); // Refresh to show the updated definitions
  };

  const handleArgumentVote = async (argumentId: string, support: boolean) => {
    try {
      const response = await fetch("/api/arguments/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          argumentId,
          support,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error("Failed to vote on argument:", result.error);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error voting on argument:", error);
    }
  };

  return (
    <div className="flex-1 min-w-0 space-y-6">
      {/* Arguments & Definitions Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="arguments" className="relative">
            Arguments
            {Object.keys(argumentsByTurn).length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-primary-foreground bg-primary rounded-full">
                {Object.keys(argumentsByTurn).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="definitions" className="relative">
            Definitions
            {totalDefinitions > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-primary-foreground bg-primary rounded-full">
                {totalDefinitions}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arguments" className="mt-6 space-y-8">
          {/* Arguments List with voting support */}
          <ArgumentsList
            argumentsByTurn={argumentsByTurn}
            turnNumbers={turnNumbers}
            currentUserId={currentUserId}
            onVote={handleArgumentVote}
          />

          {/* Arguments Response Section */}
          <DebateResponseSection debate={debate} />
        </TabsContent>

        <TabsContent value="definitions" className="mt-6 space-y-8">
          {/* Definitions List */}
          <DefinitionsList
            definitions={transformedDefinitions}
            currentUserId={currentUserId}
            debateId={debate.id}
            onVote={handleDefinitionVote}
            onEndorse={handleDefinitionEndorse}
            onAccept={handleAcceptDefinition}
            onSupersede={handleSupersedeDefinition}
            isParticipant={isParticipant}
          />

          {/* Definitions Response Section */}
          <DefinitionsResponseSection
            debate={debate}
            supersedeDefinitionId={supersedeDefinitionId || undefined}
            onSupersedeComplete={handleSupersedeComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
