import { calculateFootballModel } from "@/lib/model/football-model"
import { estimateCrowd } from "@/lib/model/crowd-model"
import { calculateExpectedValues } from "@/lib/model/expected-value"
import { DEV_MPP_CONFIG } from "@/lib/model/mpp-config"
import {
  chooseBalanced,
  chooseChallenger,
  chooseLeader,
} from "@/lib/model/strategies"
import { getLatestMarketConsensusForMatch } from "@/lib/data/repositories/market-consensus-repository"
import {
  getExistingPrediction,
  getOrCreateModelVersion,
  getOrCreateOddsSnapshot,
  persistPrediction,
} from "@/lib/data/repositories/prediction-repository"

export async function calculateMatchPrediction(matchId: string) {
  const { consensus, capturedAt } =
    await getLatestMarketConsensusForMatch(matchId)

  const input = {
    matchId,
    provider: "the-odds-api-consensus",
    bookmaker: "consensus",
    capturedAt,
    odds: {
      oneXTwo: consensus.oneXTwo,
      over25: consensus.over25,
      btts: consensus.btts,
    },
  }

  const oddsSnapshotId = await getOrCreateOddsSnapshot(input, {
    reuseByContent: true,
  })

  const modelVersionId = await getOrCreateModelVersion()

  const existingPrediction = await getExistingPrediction(
    matchId,
    oddsSnapshotId,
    modelVersionId,
  )

  if (existingPrediction) {
    return {
      predictionId: existingPrediction.id,
      oddsSnapshotId,
      modelVersionId,
      predictionCreated: false,
      calculationSkipped: true,
      bookmakerCount: consensus.bookmakerCount,
      crowdAlpha: DEV_MPP_CONFIG.crowdAlpha,
      strategies: {
        leader: existingPrediction.leader_score,
        balanced: existingPrediction.balanced_score,
        challenger: existingPrediction.challenger_score,
      },
    }
  }

  const football = calculateFootballModel({
    oneXTwoOdds: consensus.oneXTwo,
    over25Odds: consensus.over25,
    bttsOdds: consensus.btts,
  })

  const crowd = estimateCrowd(
    football.scoreProbabilities,
    DEV_MPP_CONFIG.crowdAlpha,
  )

  const expectedValues = calculateExpectedValues(
    football.scoreProbabilities,
    crowd,
    DEV_MPP_CONFIG.rules,
  )

  const leader = chooseLeader(expectedValues)

  const balanced = chooseBalanced(expectedValues)

  const challenger = chooseChallenger(expectedValues, balanced)

  const persisted = await persistPrediction(
    input,
    football,
    {
      crowd,
      expectedValues,
      leaderScore: `${leader.home}-${leader.away}`,
      balancedScore: `${balanced.home}-${balanced.away}`,
      challengerScore: `${challenger.home}-${challenger.away}`,
    },
    {
      oddsSnapshotId,
      modelVersionId,
    },
  )

  return {
    ...persisted,
    calculationSkipped: false,
    bookmakerCount: consensus.bookmakerCount,
    crowdAlpha: DEV_MPP_CONFIG.crowdAlpha,
    model: {
      lambdaHome: football.lambdaHome,
      lambdaAway: football.lambdaAway,
      rho: football.rho,
      fitLoss: football.fitLoss,
    },
    strategies: {
      leader,
      balanced,
      challenger,
    },
  }
}
