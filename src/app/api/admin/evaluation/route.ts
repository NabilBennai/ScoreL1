import { NextResponse } from "next/server"

import { getPredictionEvaluationSummary } from "@/lib/data/repositories/evaluation-repository"
import { authorizeAdmin } from "@/lib/data/supabase/admin-auth"

export async function GET() {
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
