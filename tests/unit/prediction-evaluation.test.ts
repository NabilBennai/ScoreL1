import { describe, expect, it } from "vitest"
import {
  evaluatePrediction,
  parseScore,
} from "../../src/lib/model/prediction-evaluation"

describe("parseScore", () => {
  it("parses a valid score", () => {
    expect(parseScore("2-1")).toEqual({
      home: 2,
      away: 1,
    })
  })

  it("rejects an invalid score", () => {
    expect(() => parseScore("abc")).toThrow("Invalid score")
  })

  it("rejects negative goals", () => {
    expect(() => parseScore("-1-0")).toThrow("Invalid score")
  })
})

describe("evaluatePrediction", () => {
  it("detects an exact score", () => {
    const result = evaluatePrediction(
      {
        home: 2,
        away: 1,
      },
      {
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
      },
    )

    expect(result.leader.exactScore).toBe(true)

    expect(result.leader.correctOutcome).toBe(true)
  })

  it("detects correct outcome without exact score", () => {
    const result = evaluatePrediction(
      {
        home: 3,
        away: 1,
      },
      {
        leader: {
          home: 2,
          away: 0,
        },
        balanced: {
          home: 1,
          away: 1,
        },
        challenger: {
          home: 0,
          away: 1,
        },
      },
    )

    expect(result.leader.exactScore).toBe(false)

    expect(result.leader.correctOutcome).toBe(true)

    expect(result.balanced.correctOutcome).toBe(false)

    expect(result.challenger.correctOutcome).toBe(false)
  })

  it("handles draws", () => {
    const result = evaluatePrediction(
      {
        home: 1,
        away: 1,
      },
      {
        leader: {
          home: 0,
          away: 0,
        },
        balanced: {
          home: 1,
          away: 1,
        },
        challenger: {
          home: 2,
          away: 1,
        },
      },
    )

    expect(result.leader.correctOutcome).toBe(true)

    expect(result.leader.exactScore).toBe(false)

    expect(result.balanced.exactScore).toBe(true)

    expect(result.challenger.correctOutcome).toBe(false)
  })
})
