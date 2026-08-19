import { NextResponse } from "next/server"
import { assignMatchRounds } from "@/lib/data/services/assign-match-rounds"

export async function POST() {
  try {
    const result = await assignMatchRounds()

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        error: "ROUND_ASSIGNMENT_FAILED",
      },
      {
        status: 500,
      },
    )
  }
}
