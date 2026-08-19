import { NextResponse } from "next/server"
import { syncTheOddsApi } from "@/lib/data/services/sync-the-odds-api"

export async function POST() {
  try {
    const result = await syncTheOddsApi()

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        error: "ODDS_SYNC_FAILED",
      },
      {
        status: 500,
      },
    )
  }
}
