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
  reused: number
  failed: number
  results: Array<{
    matchId: string
    kickoffAt: string
    success: boolean
    predictionId?: string
    calculationSkipped?: boolean
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

function formatStrategyScore(
  strategy:
    | string
    | {
        home: number
        away: number
      }
    | null,
): string {
  if (!strategy) {
    return "—"
  }

  if (typeof strategy === "string") {
    return strategy
  }

  return `${strategy.home}-${strategy.away}`
}

export async function calculateUpcomingPredictions(): Promise<BatchPredictionResult> {
  const matches = await getUpcomingMatches()

  const results: BatchPredictionResult["results"] = []

  let calculated = 0
  let reused = 0
  let failed = 0

  for (const match of matches) {
    try {
      const prediction = await calculateMatchPrediction(match.id)

      const calculationSkipped = prediction.calculationSkipped === true

      if (calculationSkipped) {
        reused += 1
      } else {
        calculated += 1
      }

      results.push({
        matchId: match.id,
        kickoffAt: match.kickoff_at,
        success: true,
        predictionId: prediction.predictionId,
        calculationSkipped,
        leaderScore: formatStrategyScore(prediction.strategies.leader),
        balancedScore: formatStrategyScore(prediction.strategies.balanced),
        challengerScore: formatStrategyScore(prediction.strategies.challenger),
      })
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
    reused,
    failed,
    results,
  }
}
