import { NextResponse } from "next/server"

import { calculateUpcomingPredictions } from "@/lib/data/services/calculate-upcoming-predictions"
import { authorizeAdmin } from "@/lib/data/supabase/admin-auth"

export async function POST() {
  const authorization = await authorizeAdmin()

  if (!authorization.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: authorization.status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN",
      },
      {
        status: authorization.status,
      },
    )
  }

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
