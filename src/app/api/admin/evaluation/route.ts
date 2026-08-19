import { NextResponse } from "next/server"
import { getPredictionEvaluationSummary } from "@/lib/data/repositories/evaluation-repository"

export async function GET() {
  try {
    const summary = await getPredictionEvaluationSummary()

    return NextResponse.json({
      success: true,
      ...summary,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        error: "EVALUATION_FAILED",
      },
      {
        status: 500,
      },
    )
  }
}
