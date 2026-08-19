import { describe, expect, it } from "vitest"
import {
  calculateHistoricalPrediction,
  calculateHistoricalPredictions,
} from "../../src/lib/model/historical-prediction"
import type { HistoricalMarketRow } from "../../src/lib/model/historical-market"

const historicalMatch: HistoricalMarketRow = {
  matchId: "historical-match-1",

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

describe("calculateHistoricalPrediction", () => {
  it("runs the complete prediction pipeline", () => {
    const result = calculateHistoricalPrediction(historicalMatch)

    expect(result.prediction.matchId).toBe("historical-match-1")

    expect(result.model.lambdaHome).toBeGreaterThan(0)

    expect(result.model.lambdaAway).toBeGreaterThan(0)

    expect(Number.isFinite(result.model.marketFitLoss)).toBe(true)

    expect(result.prediction.actualScore).toEqual({
      home: 3,
      away: 1,
    })

    expect(result.prediction.leader.home).toBeGreaterThanOrEqual(0)

    expect(result.prediction.leader.away).toBeGreaterThanOrEqual(0)

    expect(result.prediction.balanced.home).toBeGreaterThanOrEqual(0)

    expect(result.prediction.challenger.home).toBeGreaterThanOrEqual(0)

    expect(result.prediction.crowdShares.leader).toBeGreaterThan(0)

    expect(result.prediction.crowdShares.leader).toBeLessThanOrEqual(1)

    expect(result.prediction.crowdShares.balanced).toBeGreaterThan(0)

    expect(result.prediction.crowdShares.challenger).toBeGreaterThan(0)
  })

  it("is deterministic", () => {
    const first = calculateHistoricalPrediction(historicalMatch)

    const second = calculateHistoricalPrediction(historicalMatch)

    expect(second).toEqual(first)
  })
})

describe("calculateHistoricalPredictions", () => {
  it("processes several matches", () => {
    const result = calculateHistoricalPredictions([
      historicalMatch,

      {
        ...historicalMatch,
        matchId: "historical-match-2",

        odds: {
          oneXTwo: {
            home: 2.4,
            draw: 3.3,
            away: 2.9,
          },

          over25: {
            over: 1.95,
            under: 1.85,
          },

          btts: {
            yes: 1.8,
            no: 1.95,
          },
        },

        finalScore: {
          home: 1,
          away: 1,
        },
      },
    ])

    expect(result).toHaveLength(2)

    expect(result.map((row) => row.prediction.matchId)).toEqual([
      "historical-match-1",
      "historical-match-2",
    ])
  })
})
