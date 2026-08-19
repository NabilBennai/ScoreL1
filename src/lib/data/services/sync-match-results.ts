import { TheOddsApiProvider } from "@/lib/data/providers/the-odds-api"
import { supabaseServer } from "@/lib/data/supabase/server"

export type MatchResultsSyncResult = {
  providerEvents: number
  completedEvents: number
  updatedMatches: number
  unchangedMatches: number
  missingMatches: number
  incompleteScores: number
}

export async function syncMatchResults(): Promise<MatchResultsSyncResult> {
  const provider = new TheOddsApiProvider()

  const scores = await provider.getScores(3)

  const completed = scores.filter((score) => score.completed)

  if (completed.length === 0) {
    return {
      providerEvents: scores.length,
      completedEvents: 0,
      updatedMatches: 0,
      unchangedMatches: 0,
      missingMatches: 0,
      incompleteScores: 0,
    }
  }

  const externalIds = completed.map((score) => score.externalId)

  const { data, error } = await supabaseServer
    .from("matches")
    .select(
      `
      id,
      external_id,
      status,
      home_goals,
      away_goals
    `,
    )
    .in("external_id", externalIds)

  if (error) {
    throw new Error(`Unable to load matches for result sync: ${error.message}`)
  }

  const matchesByExternalId = new Map(
    (data ?? [])
      .filter(
        (
          match,
        ): match is typeof match & {
          external_id: string
        } => match.external_id !== null,
      )
      .map((match) => [match.external_id, match]),
  )

  let updatedMatches = 0
  let unchangedMatches = 0
  let missingMatches = 0
  let incompleteScores = 0

  for (const score of completed) {
    const match = matchesByExternalId.get(score.externalId)

    if (!match) {
      missingMatches += 1
      continue
    }

    if (score.homeGoals === null || score.awayGoals === null) {
      incompleteScores += 1
      continue
    }

    const alreadyUpToDate =
      match.status === "FINISHED" &&
      match.home_goals === score.homeGoals &&
      match.away_goals === score.awayGoals

    if (alreadyUpToDate) {
      unchangedMatches += 1
      continue
    }

    const { error: updateError } = await supabaseServer
      .from("matches")
      .update({
        status: "FINISHED",
        home_goals: score.homeGoals,
        away_goals: score.awayGoals,
      })
      .eq("id", match.id)

    if (updateError) {
      throw new Error(
        `Unable to persist result for match ${match.id}: ${updateError.message}`,
      )
    }

    updatedMatches += 1
  }

  return {
    providerEvents: scores.length,
    completedEvents: completed.length,
    updatedMatches,
    unchangedMatches,
    missingMatches,
    incompleteScores,
  }
}
