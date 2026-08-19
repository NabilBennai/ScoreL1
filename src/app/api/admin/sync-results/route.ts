import { NextResponse } from "next/server"
import { syncMatchResults } from "@/lib/data/services/sync-match-results"

export async function POST() {
  try {
    const result = await syncMatchResults()

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        error: "RESULT_SYNC_FAILED",
      },
      {
        status: 500,
      },
    )
  }
}
