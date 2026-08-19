import { NextResponse } from "next/server"
import { runLigue1Pipeline } from "@/lib/data/services/run-ligue1-pipeline"

export async function POST() {
  try {
    const startedAt = Date.now()

    const result = await runLigue1Pipeline()

    return NextResponse.json({
      success: true,
      durationMs: Date.now() - startedAt,
      ...result,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        error: "LIGUE1_PIPELINE_FAILED",
      },
      {
        status: 500,
      },
    )
  }
}
