import type { DebateWithDetails } from "@/types/debate";

export function calculateDebateProgress(debate: DebateWithDetails) {
  const allTurnNumbers = debate.participants.flatMap((participant) =>
    participant.arguments.map((argument) => argument.turnNumber),
  );

  const currentTurn =
    allTurnNumbers.length > 0 ? Math.max(...allTurnNumbers) : 0;

  const activeParticipants = debate.participants.filter(
    (p) => p.status === "ACTIVE",
  );

  const totalPossibleArguments =
    debate.turnsPerSide * activeParticipants.length;

  const totalArgumentsSubmitted = debate.participants.reduce(
    (total, participant) => total + participant.arguments.length,
    0,
  );

  const debateProgress =
    totalPossibleArguments > 0
      ? (totalArgumentsSubmitted / totalPossibleArguments) * 100
      : 0;

  const totalPossibleTurns = debate.turnsPerSide;

  return { currentTurn, debateProgress, totalPossibleTurns };
}

export function groupArgumentsByTurn(debate: DebateWithDetails) {
  return debate.participants.reduce(
    (acc, participant) => {
      participant.arguments.forEach((argument) => {
        const turnNumber = argument.turnNumber;
        if (!acc[turnNumber]) {
          acc[turnNumber] = {};
        }
        if (!acc[turnNumber][participant.id]) {
          acc[turnNumber][participant.id] = {
            participant,
            arguments: [],
          };
        }
        acc[turnNumber][participant.id].arguments.push(argument);
      });
      return acc;
    },
    {} as Record<
      number,
      Record<
        string,
        {
          participant: (typeof debate.participants)[0];
          arguments: (typeof debate.participants)[0]["arguments"];
        }
      >
    >,
  );
}

export function getSortedTurnNumbers(
  argumentsByTurn: ReturnType<typeof groupArgumentsByTurn>,
) {
  return Object.keys(argumentsByTurn)
    .map(Number)
    .sort((a, b) => a - b);
}

export function getParticipantsInOrder(
  turnData: ReturnType<typeof groupArgumentsByTurn>[number],
) {
  const participants = Object.values(turnData).map((item) => item.participant);
  return participants.sort((a, b) => {
    const roleOrder = { PROPOSER: 0, OPPOSER: 1 };
    return roleOrder[a.role] - roleOrder[b.role];
  });
}
