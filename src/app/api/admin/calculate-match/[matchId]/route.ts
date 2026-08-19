import { NextResponse } from "next/server"
import { calculateMatchPrediction } from "@/lib/data/services/calculate-match-prediction"

type RouteContext = {
  params: Promise<{
    matchId: string
  }>
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { matchId } = await context.params

    const result = await calculateMatchPrediction(matchId)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        error: "MATCH_PREDICTION_FAILED",
      },
      {
        status: 500,
      },
    )
  }
}
