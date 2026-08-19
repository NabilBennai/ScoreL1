import { calculateFootballModel } from "@/lib/model/football-model"
import { estimateCrowd } from "@/lib/model/crowd-model"
import { calculateExpectedValues } from "@/lib/model/expected-value"
import type { MppRules } from "@/lib/model/mpp-rules"
import {
  chooseBalanced,
  chooseChallenger,
  chooseLeader,
} from "@/lib/model/strategies"
import { getLatestMarketConsensusForMatch } from "@/lib/data/repositories/market-consensus-repository"
import { persistPrediction } from "@/lib/data/repositories/prediction-repository"

const DEV_MPP_RULES: MppRules = {
  correctOutcomePoints: 10,
  rarityTiers: [
    {
      maxShareExclusive: 0.005,
      bonus: 100,
    },
    {
      maxShareExclusive: 0.05,
      bonus: 70,
    },
    {
      maxShareExclusive: 0.2,
      bonus: 50,
    },
    {
      maxShareExclusive: 0.3,
      bonus: 30,
    },
    {
      maxShareExclusive: 1.01,
      bonus: 20,
    },
  ],
}

export async function calculateMatchPrediction(matchId: string) {
  const { consensus, capturedAt } =
    await getLatestMarketConsensusForMatch(matchId)

  const football = calculateFootballModel({
    oneXTwoOdds: consensus.oneXTwo,
    over25Odds: consensus.over25,
    bttsOdds: consensus.btts,
  })

  const crowd = estimateCrowd(football.scoreProbabilities, 1)

  const expectedValues = calculateExpectedValues(
    football.scoreProbabilities,
    crowd,
    DEV_MPP_RULES,
  )

  const leader = chooseLeader(expectedValues)
  const balanced = chooseBalanced(expectedValues)

  const challenger = chooseChallenger(expectedValues, balanced)

  const persisted = await persistPrediction(
    {
      matchId,
      provider: "the-odds-api-consensus",
      bookmaker: "consensus",
      capturedAt,
      odds: {
        oneXTwo: consensus.oneXTwo,
        over25: consensus.over25,
        btts: consensus.btts,
      },
    },
    football,
    {
      crowd,
      expectedValues,
      leaderScore: `${leader.home}-${leader.away}`,
      balancedScore: `${balanced.home}-${balanced.away}`,
      challengerScore: `${challenger.home}-${challenger.away}`,
    },
  )

  return {
    ...persisted,
    bookmakerCount: consensus.bookmakerCount,
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
