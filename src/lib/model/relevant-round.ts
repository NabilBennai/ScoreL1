export type AvailableRound = {
  round: number
  firstKickoffAt: string
  lastKickoffAt: string
  matchCount: number
}

export function getRelevantRound(
  rounds: AvailableRound[],
  now = new Date(),
): AvailableRound | null {
  if (rounds.length === 0) {
    return null
  }

  const nowTimestamp = now.getTime()

  const currentOrUpcoming = rounds.find(
    (round) => new Date(round.lastKickoffAt).getTime() >= nowTimestamp,
  )

  if (currentOrUpcoming) {
    return currentOrUpcoming
  }

  return rounds[rounds.length - 1]
}
