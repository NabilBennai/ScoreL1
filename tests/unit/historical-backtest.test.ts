import { describe, expect, it } from "vitest"
import {
  runHistoricalBacktest,
  runValidatedHistoricalBacktest,
} from "../../src/lib/model/historical-backtest"
import type { HistoricalMarketRow } from "../../src/lib/model/historical-market"

const firstMatch: HistoricalMarketRow = {
  matchId: "match-1",

  kickoffAt: "2025-03-16T19:45:00Z",

  homeTeam: "PSG",
  awayTeam: "OM",

  odds: {
    oneXTwo: {
      home: 1.55,
      draw: 4.4,
      away: 5.5,
    },

    over25: {
      over: 1.6,
      under: 2.3,
    },

    btts: {
      yes: 1.7,
      no: 2.05,
    },
  },

  finalScore: {
    home: 3,
    away: 1,
  },
}

const secondMatch: HistoricalMarketRow = {
  matchId: "match-2",

  kickoffAt: "2025-03-17T19:45:00Z",

  homeTeam: "Lyon",
  awayTeam: "Nice",

  odds: {
    oneXTwo: {
      home: 2.2,
      draw: 3.4,
      away: 3.2,
    },

    over25: {
      over: 1.9,
      under: 1.9,
    },

    btts: {
      yes: 1.75,
      no: 2,
    },
  },

  finalScore: {
    home: 1,
    away: 1,
  },
}

describe("runHistoricalBacktest", () => {
  it("validates, predicts and aggregates a dataset", () => {
    const result = runHistoricalBacktest([firstMatch, secondMatch])

    expect(result.dataset.inputRows).toBe(2)

    expect(result.dataset.validRows).toBe(2)

    expect(result.dataset.rejectedRows).toBe(0)

    expect(result.predictions).toHaveLength(2)

    expect(result.summary.matches).toBe(2)
  })

  it("keeps invalid rows out of the backtest", () => {
    const result = runHistoricalBacktest([
      firstMatch,

      {
        ...secondMatch,

        odds: {
          ...secondMatch.odds,

          oneXTwo: {
            ...secondMatch.odds.oneXTwo,

            home: 1,
          },
        },
      },
    ])

    expect(result.dataset.inputRows).toBe(2)

    expect(result.dataset.validRows).toBe(1)

    expect(result.dataset.rejectedRows).toBe(1)

    expect(result.predictions).toHaveLength(1)

    expect(result.summary.matches).toBe(1)

    expect(result.dataset.rejected[0].reason).toBe(
      "Invalid oneXTwo decimal odds",
    )
  })
})

describe("runValidatedHistoricalBacktest", () => {
  it("runs a prevalidated dataset", () => {
    const result = runValidatedHistoricalBacktest([firstMatch, secondMatch])

    expect(result.dataset).toEqual({
      inputRows: 2,
      validRows: 2,
      rejectedRows: 0,
      rejected: [],
    })

    expect(result.summary.matches).toBe(2)
  })
})
