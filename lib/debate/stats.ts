import type { DebateWithDetails } from "@/types/debate";

export function calculateDebateProgress(debate: DebateWithDetails) {
  const activeParticipants = debate.participants.filter(
    (p) => p.status === "ACTIVE",
  );

  const allTurnNumbers = debate.participants.flatMap((participant) =>
    participant.arguments.map((argument) => argument.turnNumber),
  );
  const uniqueTurnsWithArguments = [...new Set(allTurnNumbers)].sort(
    (a, b) => a - b,
  );

  const currentTurn =
    uniqueTurnsWithArguments.length > 0
      ? Math.max(...uniqueTurnsWithArguments)
      : 1;

  let completedTurns = 0;

  for (let turn = 1; turn <= currentTurn; turn++) {
    const participantsWithArgumentsThisTurn = activeParticipants.filter(
      (participant) =>
        participant.arguments.some((arg) => arg.turnNumber === turn),
    );

    if (
      participantsWithArgumentsThisTurn.length === activeParticipants.length
    ) {
      completedTurns++;
    }
  }

  const debateProgress =
    debate.turnsPerSide > 0 ? (completedTurns / debate.turnsPerSide) * 100 : 0;

  return {
    currentTurn,
    debateProgress: Math.min(debateProgress, 100),
    totalPossibleTurns: debate.turnsPerSide,
    completedTurns,
    uniqueTurnsWithArguments,
  };
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
