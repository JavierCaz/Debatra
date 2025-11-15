export const argumentVoteConfig = {
  itemType: "argument" as const,
  voteModel: "argumentVote" as const,
  notificationType: "ARGUMENT_VOTE" as const,
  includeRelations: {
    participant: {
      include: {
        user: true,
      },
    },
    debate: true,
  },
  getAuthorId: (argument: any) => argument.participant.userId,
  generateLink: (argument: any) =>
    `/debates/${argument.debateId}?tab=arguments#argument-${argument.id}`,
  generateMessage: (argument: any, userName: string, voteType: string) =>
    `${userName} ${voteType} your argument`,
  generateMetadata: (argument: any, voteType: string) => ({
    argumentId: argument.id,
    voteType,
  }),
};

export const definitionVoteConfig = {
  itemType: "definition" as const,
  voteModel: "definitionVote" as const,
  notificationType: "DEFINITION_VOTE" as const,
  includeRelations: {
    proposer: true,
    debate: true,
  },
  getAuthorId: (definition: any) => definition.proposerId,
  generateLink: (definition: any) =>
    `/debates/${definition.debateId}?tab=definitions`,
  generateMessage: (definition: any, userName: string, voteType: string) =>
    `${userName} ${voteType} your definition of "${definition.term}"`,
  generateMetadata: (definition: any, voteType: string) => ({
    definitionId: definition.id,
    term: definition.term,
    voteType,
  }),
};
