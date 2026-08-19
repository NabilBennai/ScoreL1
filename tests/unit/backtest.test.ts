import { describe, expect, it } from "vitest"
import {
  runBacktest,
  type HistoricalPrediction,
} from "../../src/lib/model/backtest"

describe("runBacktest", () => {
  it("returns an empty summary", () => {
    expect(runBacktest([])).toEqual({
      matches: 0,

      leader: {
        exactScores: 0,
        correctOutcomes: 0,
        totalPoints: 0,
      },

      balanced: {
        exactScores: 0,
        correctOutcomes: 0,
        totalPoints: 0,
      },

      challenger: {
        exactScores: 0,
        correctOutcomes: 0,
        totalPoints: 0,
      },
    })
  })

  it("aggregates strategy performance", () => {
    const matches: HistoricalPrediction[] = [
      {
        matchId: "match-1",

        actualScore: {
          home: 2,
          away: 1,
        },

        leader: {
          home: 2,
          away: 1,
        },

        balanced: {
          home: 1,
          away: 0,
        },

        challenger: {
          home: 1,
          away: 1,
        },

        crowdShares: {
          leader: 0.1,
          balanced: 0.2,
          challenger: 0.15,
        },
      },

      {
        matchId: "match-2",

        actualScore: {
          home: 0,
          away: 1,
        },

        leader: {
          home: 1,
          away: 1,
        },

        balanced: {
          home: 0,
          away: 1,
        },

        challenger: {
          home: 0,
          away: 2,
        },

        crowdShares: {
          leader: 0.2,
          balanced: 0.1,
          challenger: 0.03,
        },
      },
    ]

    const result = runBacktest(matches)

    expect(result.matches).toBe(2)

    expect(result.leader.exactScores).toBe(1)

    expect(result.leader.correctOutcomes).toBe(1)

    expect(result.leader.totalPoints).toBe(60)

    expect(result.balanced.exactScores).toBe(1)

    expect(result.balanced.correctOutcomes).toBe(2)

    expect(result.balanced.totalPoints).toBe(70)

    expect(result.challenger.exactScores).toBe(0)

    expect(result.challenger.correctOutcomes).toBe(1)

    expect(result.challenger.totalPoints).toBe(10)
  })
})
