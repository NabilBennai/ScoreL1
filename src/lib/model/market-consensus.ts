export type BookmakerMarket = {
  bookmaker: string

  oneXTwo?: {
    home: number
    draw: number
    away: number
  }

  over25?: {
    over: number
    under: number
  }

  btts?: {
    yes: number
    no: number
  }
}

export type MarketConsensus = {
  bookmakerCount: number

  oneXTwo: {
    home: number
    draw: number
    away: number
  }

  over25?: {
    over: number
    under: number
  }

  btts?: {
    yes: number
    no: number
  }
}

function validateOdd(value: number): void {
  if (!Number.isFinite(value) || value <= 1) {
    throw new Error(`Invalid decimal odd: ${value}`)
  }
}

function median(values: number[]): number {
  if (values.length === 0) {
    throw new Error("Unable to calculate median of empty values")
  }

  const sorted = [...values].sort((a, b) => a - b)

  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 1) {
    return sorted[middle]
  }

  return (sorted[middle - 1] + sorted[middle]) / 2
}

export function buildMarketConsensus(
  markets: BookmakerMarket[],
): MarketConsensus {
  if (markets.length === 0) {
    throw new Error("No bookmaker markets available")
  }

  const oneXTwoMarkets = markets.filter(
    (
      market,
    ): market is BookmakerMarket & {
      oneXTwo: NonNullable<BookmakerMarket["oneXTwo"]>
    } => market.oneXTwo !== undefined,
  )

  if (oneXTwoMarkets.length === 0) {
    throw new Error("No 1X2 bookmaker market available")
  }

  const oneXTwoHome: number[] = []
  const oneXTwoDraw: number[] = []
  const oneXTwoAway: number[] = []

  for (const market of oneXTwoMarkets) {
    validateOdd(market.oneXTwo.home)
    validateOdd(market.oneXTwo.draw)
    validateOdd(market.oneXTwo.away)

    oneXTwoHome.push(market.oneXTwo.home)
    oneXTwoDraw.push(market.oneXTwo.draw)
    oneXTwoAway.push(market.oneXTwo.away)
  }

  const over25Markets = markets.filter(
    (
      market,
    ): market is BookmakerMarket & {
      over25: NonNullable<BookmakerMarket["over25"]>
    } => market.over25 !== undefined,
  )

  const bttsMarkets = markets.filter(
    (
      market,
    ): market is BookmakerMarket & {
      btts: NonNullable<BookmakerMarket["btts"]>
    } => market.btts !== undefined,
  )

  let over25: MarketConsensus["over25"] | undefined

  if (over25Markets.length > 0) {
    const over: number[] = []
    const under: number[] = []

    for (const market of over25Markets) {
      validateOdd(market.over25.over)
      validateOdd(market.over25.under)

      over.push(market.over25.over)
      under.push(market.over25.under)
    }

    over25 = {
      over: median(over),
      under: median(under),
    }
  }

  let btts: MarketConsensus["btts"] | undefined

  if (bttsMarkets.length > 0) {
    const yes: number[] = []
    const no: number[] = []

    for (const market of bttsMarkets) {
      validateOdd(market.btts.yes)
      validateOdd(market.btts.no)

      yes.push(market.btts.yes)
      no.push(market.btts.no)
    }

    btts = {
      yes: median(yes),
      no: median(no),
    }
  }

  return {
    bookmakerCount: new Set(markets.map((market) => market.bookmaker)).size,

    oneXTwo: {
      home: median(oneXTwoHome),
      draw: median(oneXTwoDraw),
      away: median(oneXTwoAway),
    },

    over25,
    btts,
  }
}
