import { NextResponse } from "next/server"

import { runLigue1Pipeline } from "@/lib/data/services/run-ligue1-pipeline"
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

  const startedAt = Date.now()

  try {
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
        durationMs: Date.now() - startedAt,
        error: "PIPELINE_FAILED",
      },
      {
        status: 500,
      },
    )
  }
}
