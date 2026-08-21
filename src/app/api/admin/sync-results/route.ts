import { NextResponse } from "next/server"

import { syncMatchResults } from "@/lib/data/services/sync-match-results"
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
