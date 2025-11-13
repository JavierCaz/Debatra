import type { Reference } from "./reference";

export interface InitialDefinition {
  id: number; // temporary ID for UI purposes
  term: string;
  definition: string;
  context?: string;
  references: Reference[];
}

export interface DefinitionReference {
  id: string;
  type: string;
  title: string;
  url?: string;
  author?: string;
  publication?: string;
  notes?: string;
}

export interface DefinitionUser {
  id: string;
  name: string;
  image?: string;
}

export interface DefinitionVotes {
  support: number;
  oppose: number;
}

export interface DefinitionEndorsement {
  id: string;
  user: {
    name: string;
    image?: string;
  };
}

export interface DefinitionRelation {
  id: string;
  term: string;
  status: "PROPOSED" | "ACCEPTED" | "CONTESTED" | "DEPRECATED";
  createdAt: Date;
  proposer: DefinitionUser;
}

export interface Definition {
  id: string;
  term: string;
  definition: string;
  context?: string;
  status: "PROPOSED" | "ACCEPTED" | "CONTESTED" | "DEPRECATED";
  createdAt: Date;
  proposer: DefinitionUser;
  references: DefinitionReference[];
  votes?: DefinitionVotes;
  endorsements?: DefinitionEndorsement[];
  supersededBy?: {
    id: string;
    term: string;
  };
  supersedes?: DefinitionRelation[];
  referencedByArguments?: number;
}

export interface DefinitionsListProps {
  definitions: Definition[];
  currentUserId?: string;
  debateId: string;
  onVote: (definitionId: string, support: boolean) => void;
  onEndorse: (definitionId: string) => void;
  onAccept: (definitionId: string) => void;
  onSupersede: (definitionId: string) => void;
  isParticipant?: boolean;
}
