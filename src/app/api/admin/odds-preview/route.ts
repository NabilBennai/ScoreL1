import { NextResponse } from "next/server"
import { TheOddsApiProvider } from "@/lib/data/providers/the-odds-api"

export async function GET() {
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
