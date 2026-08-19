import { supabaseServer } from "@/lib/data/supabase/server"

export async function getAvailableRounds() {
  const { data, error } = await supabaseServer
    .from("matches")
    .select(
      `
      round,
      kickoff_at
    `,
    )
    .order("round", {
      ascending: true,
    })

  if (error) {
    throw new Error(`Unable to load available rounds: ${error.message}`)
  }

  const rounds = new Map<
    number,
    {
      round: number
      firstKickoffAt: string
      lastKickoffAt: string
      matchCount: number
    }
  >()

  for (const match of data) {
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
