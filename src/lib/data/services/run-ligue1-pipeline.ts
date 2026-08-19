import { assignMatchRounds } from "@/lib/data/services/assign-match-rounds"
import { calculateUpcomingPredictions } from "@/lib/data/services/calculate-upcoming-predictions"
import { syncMatchResults } from "@/lib/data/services/sync-match-results"
import { syncTheOddsApi } from "@/lib/data/services/sync-the-odds-api"

export async function runLigue1Pipeline() {
  const sync = await syncTheOddsApi()

  const rounds = await assignMatchRounds()

  const predictions = await calculateUpcomingPredictions()

  const results = await syncMatchResults()

  return {
    sync,
    rounds,
    predictions,
    results,
  }
}
