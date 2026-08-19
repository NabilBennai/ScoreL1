import { describe, expect, it } from "vitest"
import {
  validateHistoricalMarketDataset,
  validateHistoricalMarketRow,
} from "../../src/lib/model/historical-market"

const validRow = {
  matchId: "psg-om-2025",
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

describe("validateHistoricalMarketRow", () => {
  it("accepts a complete historical row", () => {
    const result = validateHistoricalMarketRow(validRow)

    expect(result.valid).toBe(true)
  })

  it("accepts a row without optional markets", () => {
    const result = validateHistoricalMarketRow({
      ...validRow,

      odds: {
        oneXTwo: validRow.odds.oneXTwo,
      },
    })

    expect(result.valid).toBe(true)
  })

  it("rejects decimal odds at or below one", () => {
    const result = validateHistoricalMarketRow({
      ...validRow,

      odds: {
        ...validRow.odds,

        oneXTwo: {
          ...validRow.odds.oneXTwo,
          home: 1,
        },
      },
    })

    expect(result.valid).toBe(false)

    if (!result.valid) {
      expect(result.reason).toBe("Invalid oneXTwo decimal odds")
    }
  })

  it("rejects an invalid final score", () => {
    const result = validateHistoricalMarketRow({
      ...validRow,

      finalScore: {
        home: -1,
        away: 0,
      },
    })

    expect(result.valid).toBe(false)
  })

  it("rejects identical teams", () => {
    const result = validateHistoricalMarketRow({
      ...validRow,
      awayTeam: "PSG",
    })

    expect(result.valid).toBe(false)

    if (!result.valid) {
      expect(result.reason).toBe("Home and away teams must differ")
    }
  })
})

describe("validateHistoricalMarketDataset", () => {
  it("separates valid and rejected rows", () => {
    const result = validateHistoricalMarketDataset([
      validRow,

      {
        ...validRow,
        matchId: "invalid",
        finalScore: {
          home: -1,
          away: 2,
        },
      },
    ])

    expect(result.validRows).toHaveLength(1)

    expect(result.rejectedRows).toEqual([
      {
        index: 1,
        reason: "Invalid final score",
      },
    ])
  })
})
