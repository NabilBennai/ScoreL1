import { NextResponse } from "next/server"
import { calculateUpcomingPredictions } from "@/lib/data/services/calculate-upcoming-predictions"

export async function POST() {
  try {
    const result = await calculateUpcomingPredictions()

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        error: "UPCOMING_PREDICTIONS_FAILED",
      },
      {
        status: 500,
      },
    )
  }
}
