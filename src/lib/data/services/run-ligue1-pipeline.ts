import { syncTheOddsApi } from "@/lib/data/services/sync-the-odds-api"
import { assignMatchRounds } from "@/lib/data/services/assign-match-rounds"
import { calculateUpcomingPredictions } from "@/lib/data/services/calculate-upcoming-predictions"

export type Ligue1PipelineResult = {
  sync: Awaited<ReturnType<typeof syncTheOddsApi>>
  rounds: Awaited<ReturnType<typeof assignMatchRounds>>
  predictions: Awaited<ReturnType<typeof calculateUpcomingPredictions>>
}

export async function runLigue1Pipeline(): Promise<Ligue1PipelineResult> {
  const sync = await syncTheOddsApi()

  const rounds = await assignMatchRounds()

  const predictions = await calculateUpcomingPredictions()

  return {
    sync,
    rounds,
    predictions,
  }
}
