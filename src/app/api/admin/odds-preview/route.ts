import { NextResponse } from "next/server"

import { TheOddsApiProvider } from "@/lib/data/providers/the-odds-api"
import { authorizeAdmin } from "@/lib/data/supabase/admin-auth"

export async function GET() {
  const authorization = await authorizeAdmin()

  if (!authorization.authorized) {
    return NextResponse.json(
      {
        error: authorization.status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN",
      },
      {
        status: authorization.status,
      },
    )
  }

  try {
    const provider = new TheOddsApiProvider()

    const odds = await provider.getOdds()

    return NextResponse.json({
      count: odds.length,
      odds,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: "ODDS_PROVIDER_FAILED",
      },
      {
        status: 500,
      },
    )
  }
}
