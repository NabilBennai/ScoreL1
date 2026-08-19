import { describe, expect, it } from "vitest"
import {
  getRelevantRound,
  type AvailableRound,
} from "../../src/lib/model/relevant-round"

describe("getRelevantRound", () => {
  const rounds: AvailableRound[] = [
    {
      round: 1,
      firstKickoffAt: "2026-08-21T18:45:00Z",
      lastKickoffAt: "2026-08-23T18:45:00Z",
      matchCount: 9,
    },
    {
      round: 2,
      firstKickoffAt: "2026-08-28T18:45:00Z",
      lastKickoffAt: "2026-08-30T18:45:00Z",
      matchCount: 9,
    },
    {
      round: 3,
      firstKickoffAt: "2026-09-11T18:45:00Z",
      lastKickoffAt: "2026-09-13T18:45:00Z",
      matchCount: 9,
    },
  ]

  it("returns null when no round is available", () => {
    expect(getRelevantRound([])).toBeNull()
  })

  it("selects the first upcoming round before the season starts", () => {
    const result = getRelevantRound(rounds, new Date("2026-08-19T18:00:00Z"))

    expect(result?.round).toBe(1)
  })

  it("keeps the current round while it is still in progress", () => {
    const result = getRelevantRound(rounds, new Date("2026-08-22T12:00:00Z"))

    expect(result?.round).toBe(1)
  })

  it("moves to the next round after the previous round has finished", () => {
    const result = getRelevantRound(rounds, new Date("2026-08-24T12:00:00Z"))

    expect(result?.round).toBe(2)
  })

  it("selects the last available round after all rounds have finished", () => {
    const result = getRelevantRound(rounds, new Date("2027-06-01T12:00:00Z"))

    expect(result?.round).toBe(3)
  })

  it("handles a single available round", () => {
    const result = getRelevantRound(
      [rounds[0]],
      new Date("2026-08-22T12:00:00Z"),
    )

    expect(result?.round).toBe(1)
  })
})
