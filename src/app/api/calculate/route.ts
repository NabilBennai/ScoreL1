import { NextResponse } from "next/server"
import { calculateFootballModel } from "@/lib/model/football-model"
import { calculatePredictionSchema } from "@/lib/validation/calculate-prediction"
import { persistPrediction } from "@/lib/data/repositories/prediction-repository"

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

    const result = calculateFootballModel({
      oneXTwoOdds: input.odds.oneXTwo,
      over25Odds: input.odds.over25,
      bttsOdds: input.odds.btts,
    })

    const persisted = await persistPrediction(input, result)

    return NextResponse.json({
      ...persisted,

      model: {
        lambdaHome: result.lambdaHome,
        lambdaAway: result.lambdaAway,
        rho: result.rho,
        fitLoss: result.fitLoss,
      },

      projections: result.projections,
      scoreProbabilities: result.scoreProbabilities,
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
