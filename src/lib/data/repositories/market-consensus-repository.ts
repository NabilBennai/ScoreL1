import { supabaseServer } from "@/lib/data/supabase/server"
import {
  buildMarketConsensus,
  type BookmakerMarket,
  type MarketConsensus,
} from "@/lib/model/market-consensus"

type SnapshotRow = {
  bookmaker: string | null
  captured_at: string
  market_payload: {
    oneXTwo?: {
      home: number
      draw: number
      away: number
    } | null
    over25?: {
      over: number
      under: number
    } | null
    btts?: {
      yes: number
      no: number
    } | null
  }
}

export async function getLatestMarketConsensusForMatch(
  matchId: string,
): Promise<{
  consensus: MarketConsensus
  capturedAt: string
}> {
  const { data, error } = await supabaseServer
    .from("odds_snapshots")
    .select(
      `
        bookmaker,
        captured_at,
        market_payload
      `,
    )
    .eq("match_id", matchId)
    .eq("provider", "the-odds-api")
    .order("captured_at", {
      ascending: false,
    })

  if (error) {
    throw new Error(`Unable to load odds snapshots: ${error.message}`)
  }

  const rows = (data ?? []) as SnapshotRow[]

  if (rows.length === 0) {
    throw new Error(`No odds snapshots available for match ${matchId}`)
  }

  const latestByBookmaker = new Map<string, SnapshotRow>()

  for (const row of rows) {
    if (!row.bookmaker) {
      continue
    }

    if (!latestByBookmaker.has(row.bookmaker)) {
      latestByBookmaker.set(row.bookmaker, row)
    }
  }

  const markets: BookmakerMarket[] = []

  for (const [bookmaker, row] of latestByBookmaker) {
    const payload = row.market_payload

    markets.push({
      bookmaker,
      oneXTwo: payload.oneXTwo ?? undefined,
      over25: payload.over25 ?? undefined,
      btts: payload.btts ?? undefined,
    })
  }

  const consensus = buildMarketConsensus(markets)

  const capturedAt = rows[0].captured_at

  return {
    consensus,
    capturedAt,
  }
}
