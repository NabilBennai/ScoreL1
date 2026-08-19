import type { OddsProvider, ProviderEvent, ProviderOdds } from "./odds-provider"

const BASE_URL = "https://api.the-odds-api.com/v4"

const SPORT_KEY = "soccer_france_ligue_one"

type OddsApiOutcome = {
  name: string
  price: number
  point?: number
}

type OddsApiMarket = {
  key: string
  last_update: string
  outcomes: OddsApiOutcome[]
}

type OddsApiBookmaker = {
  key: string
  title: string
  last_update: string
  markets: OddsApiMarket[]
}

type OddsApiEvent = {
  id: string
  sport_key: string
  sport_title: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers?: OddsApiBookmaker[]
}

function getApiKey(): string {
  const apiKey = process.env.ODDS_API_KEY

  if (!apiKey) {
    throw new Error("Missing ODDS_API_KEY")
  }

  return apiKey
}

function buildUrl(pathname: string, params: Record<string, string>): string {
  const url = new URL(`${BASE_URL}${pathname}`)

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  return url.toString()
}

function parseOneXTwo(
  market: OddsApiMarket,
  homeTeam: string,
  awayTeam: string,
) {
  const home = market.outcomes.find((outcome) => outcome.name === homeTeam)

  const away = market.outcomes.find((outcome) => outcome.name === awayTeam)

  const draw = market.outcomes.find(
    (outcome) => outcome.name.toLowerCase() === "draw",
  )

  if (!home || !away || !draw) {
    return undefined
  }

  return {
    home: home.price,
    draw: draw.price,
    away: away.price,
  }
}

function parseOver25(market: OddsApiMarket) {
  const over = market.outcomes.find(
    (outcome) => outcome.name.toLowerCase() === "over" && outcome.point === 2.5,
  )

  const under = market.outcomes.find(
    (outcome) =>
      outcome.name.toLowerCase() === "under" && outcome.point === 2.5,
  )

  if (!over || !under) {
    return undefined
  }

  return {
    over: over.price,
    under: under.price,
  }
}

export class TheOddsApiProvider implements OddsProvider {
  async getUpcomingEvents(): Promise<ProviderEvent[]> {
    const url = buildUrl(`/sports/${SPORT_KEY}/events`, {
      apiKey: getApiKey(),
    })

    const response = await fetch(url, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`The Odds API events request failed: ${response.status}`)
    }

    const events = (await response.json()) as OddsApiEvent[]

    return events.map((event) => ({
      externalId: event.id,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      commenceTime: event.commence_time,
    }))
  }

  async getOdds(): Promise<ProviderOdds[]> {
    const url = buildUrl(`/sports/${SPORT_KEY}/odds`, {
      apiKey: getApiKey(),
      regions: "eu",
      markets: "h2h,totals",
      oddsFormat: "decimal",
      dateFormat: "iso",
    })

    const response = await fetch(url, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`The Odds API odds request failed: ${response.status}`)
    }

    const events = (await response.json()) as OddsApiEvent[]

    const results: ProviderOdds[] = []

    for (const event of events) {
      for (const bookmaker of event.bookmakers ?? []) {
        const h2hMarket = bookmaker.markets.find(
          (market) => market.key === "h2h",
        )

        const totalsMarket = bookmaker.markets.find(
          (market) => market.key === "totals",
        )

        const oneXTwo = h2hMarket
          ? parseOneXTwo(h2hMarket, event.home_team, event.away_team)
          : undefined

        const over25 = totalsMarket ? parseOver25(totalsMarket) : undefined

        if (!oneXTwo && !over25) {
          continue
        }

        results.push({
          externalId: event.id,
          homeTeam: event.home_team,
          awayTeam: event.away_team,
          commenceTime: event.commence_time,
          bookmaker: bookmaker.key,
          capturedAt: bookmaker.last_update,
          oneXTwo,
          over25,
        })
      }
    }

    return results
  }
}
