import { NextResponse } from "next/server"
import { calculateFootballModel } from "@/lib/model/football-model"
import { estimateCrowd } from "@/lib/model/crowd-model"
import { calculateExpectedValues } from "@/lib/model/expected-value"
import type { MppRules } from "@/lib/model/mpp-rules"
import {
  chooseBalanced,
  chooseChallenger,
  chooseLeader,
} from "@/lib/model/strategies"
import { calculatePredictionSchema } from "@/lib/validation/calculate-prediction"
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

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const parsed = calculatePredictionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "INVALID_PAYLOAD",
          details: parsed.error.flatten(),
        },
        {
          status: 400,
        },
      )
    }

    const input = parsed.data

    const football = calculateFootballModel({
      oneXTwoOdds: input.odds.oneXTwo,
      over25Odds: input.odds.over25,
      bttsOdds: input.odds.btts,
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

    const persisted = await persistPrediction(input, football, {
      crowd,
      expectedValues,
      leaderScore: `${leader.home}-${leader.away}`,
      balancedScore: `${balanced.home}-${balanced.away}`,
      challengerScore: `${challenger.home}-${challenger.away}`,
    })

    return NextResponse.json({
      ...persisted,

      model: {
        lambdaHome: football.lambdaHome,
        lambdaAway: football.lambdaAway,
        rho: football.rho,
        fitLoss: football.fitLoss,
      },

      projections: football.projections,

      strategies: {
        leader,
        balanced,
        challenger,
      },

      scoreProbabilities: football.scoreProbabilities,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: "CALCULATION_FAILED",
      },
      {
        status: 500,
      },
    )
  }
}
