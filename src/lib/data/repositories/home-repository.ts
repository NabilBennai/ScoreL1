import { supabaseServer } from "@/lib/data/supabase/server"

export type AvailableRound = {
  round: number
  firstKickoffAt: string
  lastKickoffAt: string
  matchCount: number
}

export async function getAvailableRounds(): Promise<AvailableRound[]> {
  const { data, error } = await supabaseServer
    .from("matches")
    .select(
      `
      round,
      kickoff_at
    `,
    )
    .not("round", "is", null)
    .order("round", {
      ascending: true,
    })
    .order("kickoff_at", {
      ascending: true,
    })

  if (error) {
    throw new Error(`Unable to load available rounds: ${error.message}`)
  }

  const rounds = new Map<number, AvailableRound>()

  for (const match of data ?? []) {
    if (match.round === null) {
      continue
    }

    const existing = rounds.get(match.round)

    if (!existing) {
      rounds.set(match.round, {
        round: match.round,
        firstKickoffAt: match.kickoff_at,
        lastKickoffAt: match.kickoff_at,
        matchCount: 1,
      })

      continue
    }

    const kickoff = new Date(match.kickoff_at).getTime()

    if (kickoff < new Date(existing.firstKickoffAt).getTime()) {
      existing.firstKickoffAt = match.kickoff_at
    }

    if (kickoff > new Date(existing.lastKickoffAt).getTime()) {
      existing.lastKickoffAt = match.kickoff_at
    }

    existing.matchCount += 1
  }

  return [...rounds.values()].sort((a, b) => a.round - b.round)
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
