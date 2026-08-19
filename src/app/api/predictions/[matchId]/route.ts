import { NextResponse } from "next/server"
import { getLatestPredictionForMatch } from "@/lib/data/repositories/match-prediction-repository"

type RouteContext = {
  params: Promise<{
    matchId: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { matchId } = await context.params

    const prediction = await getLatestPredictionForMatch(matchId)

    if (!prediction) {
      return NextResponse.json(
        {
          error: "PREDICTION_NOT_FOUND",
        },
        {
          status: 404,
        },
      )
    }

    return NextResponse.json(prediction)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: "PREDICTION_LOAD_FAILED",
      },
      {
        status: 500,
      },
    )
  }
}
