import type { Reference } from "./reference";

export interface InitialDefinition {
  id: number; // temporary ID for UI purposes
  term: string;
  definition: string;
  context?: string;
  references: Reference[];
}
