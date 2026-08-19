import { supabaseServer } from "@/lib/data/supabase/server"
import { calculateMatchPrediction } from "@/lib/data/services/calculate-match-prediction"

type UpcomingMatch = {
  id: string
  kickoff_at: string
  external_id: string | null
}

export type BatchPredictionResult = {
  matchesFound: number
  calculated: number
  failed: number
  results: Array<{
    matchId: string
    kickoffAt: string
    success: boolean
    predictionId?: string
    leaderScore?: string
    balancedScore?: string
    challengerScore?: string
    error?: string
  }>
}

async function getUpcomingMatches(): Promise<UpcomingMatch[]> {
  const { data, error } = await supabaseServer
    .from("matches")
    .select(
      `
        id,
        kickoff_at,
        external_id
      `,
    )
    .not("external_id", "is", null)
    .gte("kickoff_at", new Date().toISOString())
    .order("kickoff_at", {
      ascending: true,
    })

  if (error) {
    throw new Error(`Unable to load upcoming matches: ${error.message}`)
  }

  return data ?? []
}

export async function calculateUpcomingPredictions(): Promise<BatchPredictionResult> {
  const matches = await getUpcomingMatches()

  const results: BatchPredictionResult["results"] = []

  let calculated = 0
  let failed = 0

  for (const match of matches) {
    try {
      const prediction = await calculateMatchPrediction(match.id)

      results.push({
        matchId: match.id,
        kickoffAt: match.kickoff_at,
        success: true,
        predictionId: prediction.predictionId,
        leaderScore: `${prediction.strategies.leader.home}-${prediction.strategies.leader.away}`,
        balancedScore: `${prediction.strategies.balanced.home}-${prediction.strategies.balanced.away}`,
        challengerScore: `${prediction.strategies.challenger.home}-${prediction.strategies.challenger.away}`,
      })

      calculated += 1
    } catch (error) {
      results.push({
        matchId: match.id,
        kickoffAt: match.kickoff_at,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })

      failed += 1
    }
  }

  return {
    matchesFound: matches.length,
    calculated,
    failed,
    results,
  }
}
