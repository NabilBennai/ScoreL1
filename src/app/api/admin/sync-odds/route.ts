import { NextResponse } from "next/server"

import { syncTheOddsApi } from "@/lib/data/services/sync-the-odds-api"
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
