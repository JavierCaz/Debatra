"use client";

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DefinitionSource {
  id: string;
  type: string;
  title: string;
  url?: string;
  author?: string;
  publication?: string;
  notes?: string;
}

interface Definition {
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
  sources: DefinitionSource[];
  votes?: {
    support: number;
    oppose: number;
  };
  endorsements?: {
    id: string;
    user: {
      name: string;
      image?: string;
    };
  }[];
  supersededBy?: {
    id: string;
    term: string;
  };
  supersedes?: {
    id: string;
    term: string;
    status: "PROPOSED" | "ACCEPTED" | "CONTESTED" | "DEPRECATED";
    createdAt: Date;
    proposer: {
      id: string;
      name: string;
      image?: string;
    };
  }[];
  referencedByArguments?: number;
}

interface DefinitionsListProps {
  definitions: Definition[];
  currentUserId?: string;
  debateId: string;
  onVote: (definitionId: string, support: boolean) => void;
  onEndorse: (definitionId: string) => void;
  onAccept: (definitionId: string) => void;
  onSupersede: (definitionId: string) => void;
  isParticipant?: boolean;
}

export function DefinitionsList({
  definitions,
  currentUserId,
  onVote,
  onEndorse,
  onAccept,
  onSupersede,
  isParticipant = false,
}: DefinitionsListProps) {
  const [expandedSources, setExpandedSources] = useState<string[]>([]);
  const [selectedDefinitionId, setSelectedDefinitionId] = useState<
    string | null
  >(null);

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

  // Get the current definition to display (either selected or latest)
  const getCurrentDefinition = (termDefinitions: Definition[]) => {
    if (selectedDefinitionId) {
      const selected = termDefinitions.find(
        (def) => def.id === selectedDefinitionId,
      );
      if (selected) return selected;
    }
    return termDefinitions[0]; // Return the latest definition
  };

  const getStatusColor = (status: Definition["status"]) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "PROPOSED":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "CONTESTED":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      case "DEPRECATED":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: Definition["status"]) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "CONTESTED":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: Definition["status"]) => {
    switch (status) {
      case "ACCEPTED":
        return "Accepted";
      case "PROPOSED":
        return "Proposed";
      case "CONTESTED":
        return "Contested";
      case "DEPRECATED":
        return "Deprecated";
      default:
        return status;
    }
  };

  const getSourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ACADEMIC_PAPER: "Academic Paper",
      NEWS_ARTICLE: "News Article",
      BOOK: "Book",
      GOVERNMENT_DOCUMENT: "Government Document",
      STATISTICS: "Statistics",
      VIDEO: "Video",
      WEBSITE: "Website",
      OTHER: "Other",
    };
    return labels[type] || type;
  };

  if (definitions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Definitions Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Participants haven't defined any key terms for this debate yet.
            Definitions help establish shared understanding of important
            concepts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(definitionsByTerm).map(([term, termDefinitions]) => {
        const currentDefinition = getCurrentDefinition(termDefinitions);
        const hasMultipleVersions = termDefinitions.length > 1;

        return (
          <Card key={term} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Version History Breadcrumb */}
                  {hasMultipleVersions && (
                    <Breadcrumb>
                      <BreadcrumbList>
                        {termDefinitions.map((def, index) => (
                          <BreadcrumbItem key={def.id}>
                            {index > 0 && (
                              <BreadcrumbSeparator>
                                <ChevronRight className="h-4 w-4" />
                              </BreadcrumbSeparator>
                            )}
                            <BreadcrumbLink
                              onClick={() => setSelectedDefinitionId(def.id)}
                              className={`cursor-pointer ${
                                def.id === currentDefinition.id
                                  ? "text-primary font-semibold"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              Version {termDefinitions.length - index}
                              {def.status === "ACCEPTED" && " ✓"}
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                        ))}
                      </BreadcrumbList>
                    </Breadcrumb>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-2xl">
                      {currentDefinition.term}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={getStatusColor(currentDefinition.status)}
                    >
                      {getStatusIcon(currentDefinition.status)}
                      <span className="ml-1">
                        {getStatusLabel(currentDefinition.status)}
                      </span>
                    </Badge>
                    {(currentDefinition.referencedByArguments ?? 0) > 0 ? (
                      <Badge variant="secondary">
                        Referenced by {currentDefinition.referencedByArguments}{" "}
                        argument
                        {currentDefinition.referencedByArguments !== 1
                          ? "s"
                          : ""}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        Not yet referenced
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={currentDefinition.proposer.image} />
                      <AvatarFallback>
                        {currentDefinition.proposer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      Proposed by{" "}
                      <strong>{currentDefinition.proposer.name}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(
                        currentDefinition.createdAt,
                      ).toLocaleDateString()}
                    </span>
                    {hasMultipleVersions && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600">
                          {termDefinitions.length} version
                          {termDefinitions.length > 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action buttons - only show for PROPOSED definitions */}
                <div className="flex flex-col items-end gap-2 min-w-0">
                  {/* Voting buttons */}
                  {currentUserId && onVote && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVote(currentDefinition.id, true)}
                        className="gap-1 flex-shrink-0"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {currentDefinition.votes?.support || 0}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVote(currentDefinition.id, false)}
                        className="gap-1 flex-shrink-0"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        {currentDefinition.votes?.oppose || 0}
                      </Button>
                    </div>
                  )}

                  {/* Action buttons for PROPOSED definitions */}
                  {isParticipant && currentDefinition.status === "PROPOSED" && (
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAccept?.(currentDefinition.id)}
                        className="gap-1 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-500 dark:border-green-800 dark:hover:bg-green-950/20"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSupersede?.(currentDefinition.id)}
                        className="gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-500 dark:border-blue-800 dark:hover:bg-blue-950/20"
                      >
                        <BookOpen className="h-4 w-4" />
                        Improve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
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

              {/* Endorsements */}
              {currentDefinition.endorsements &&
                currentDefinition.endorsements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                      Endorsed by Participants
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {currentDefinition.endorsements.map((endorsement) => (
                        <div
                          key={endorsement.id}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                        >
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={endorsement.user.image} />
                            <AvatarFallback className="text-[8px]">
                              {endorsement.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{endorsement.user.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Endorse Button (for participants who haven't endorsed) */}
              {isParticipant &&
                onEndorse &&
                currentDefinition.status === "PROPOSED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEndorse(currentDefinition.id)}
                    className="w-full"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Endorse This Definition
                  </Button>
                )}

              {/* Sources */}
              {currentDefinition.sources.length > 0 && (
                <div className="border-t pt-4">
                  <Accordion
                    type="multiple"
                    value={expandedSources}
                    onValueChange={setExpandedSources}
                  >
                    <AccordionItem
                      value={currentDefinition.id}
                      className="border-none"
                    >
                      <AccordionTrigger className="hover:no-underline py-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          Sources ({currentDefinition.sources.length})
                        </h4>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          {currentDefinition.sources.map((source, index) => (
                            <div
                              key={source.id}
                              className="bg-muted/30 dark:bg-muted/50 p-3 rounded-lg space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {getSourceTypeLabel(source.type)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      Source {index + 1}
                                    </span>
                                  </div>
                                  <h5 className="font-semibold text-sm text-foreground">
                                    {source.title}
                                  </h5>
                                  {source.author && (
                                    <p className="text-xs text-muted-foreground">
                                      by {source.author}
                                    </p>
                                  )}
                                  {source.publication && (
                                    <p className="text-xs text-muted-foreground">
                                      {source.publication}
                                    </p>
                                  )}
                                  {source.notes && (
                                    <p className="text-sm mt-2 text-muted-foreground">
                                      {source.notes}
                                    </p>
                                  )}
                                </div>
                                {source.url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="shrink-0"
                                  >
                                    <a
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {/* Version History Info */}
              {hasMultipleVersions && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    Version History
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    This definition has {termDefinitions.length} versions. Use
                    the breadcrumb above to navigate between different versions.
                  </p>
                </div>
              )}

              {/* Status-specific warnings */}
              {currentDefinition.status === "DEPRECATED" &&
                currentDefinition.supersededBy && (
                  <div className="bg-yellow-500/10 dark:bg-yellow-500/20 border border-yellow-500/20 dark:border-yellow-500/30 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      This definition has been superseded by a newer version.
                    </p>
                  </div>
                )}

              {currentDefinition.status === "CONTESTED" && (
                <div className="bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 dark:border-orange-500/30 p-3 rounded-lg">
                  <p className="text-sm text-orange-800 dark:text-orange-400">
                    This definition has been contested and improved upon by
                    other participants.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
