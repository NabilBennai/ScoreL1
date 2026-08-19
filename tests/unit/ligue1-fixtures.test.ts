import { describe, expect, it } from "vitest"
import { LIGUE1_2026_2027_FIXTURES } from "../../src/lib/data/fixtures/ligue1-2026-2027"

describe("Ligue 1 2026-2027 fixtures", () => {
  it("contains 306 fixtures", () => {
    expect(LIGUE1_2026_2027_FIXTURES).toHaveLength(306)
  })

  it("contains 34 rounds", () => {
    const rounds = new Set(
      LIGUE1_2026_2027_FIXTURES.map((fixture) => fixture.round),
    )

    expect(rounds.size).toBe(34)

    for (let round = 1; round <= 34; round += 1) {
      expect(rounds.has(round)).toBe(true)
    }
  })

  it("contains exactly 9 matches per round", () => {
    for (let round = 1; round <= 34; round += 1) {
      const fixtures = LIGUE1_2026_2027_FIXTURES.filter(
        (fixture) => fixture.round === round,
      )

      expect(fixtures).toHaveLength(9)
    }
  })

  it("uses exactly 18 teams", () => {
    const teams = new Set<string>()

    for (const fixture of LIGUE1_2026_2027_FIXTURES) {
      teams.add(fixture.homeSlug)
      teams.add(fixture.awaySlug)
    }

    expect(teams.size).toBe(18)
  })

  it("uses every team exactly once per round", () => {
    for (let round = 1; round <= 34; round += 1) {
      const fixtures = LIGUE1_2026_2027_FIXTURES.filter(
        (fixture) => fixture.round === round,
      )

      const appearances = new Map<string, number>()

      for (const fixture of fixtures) {
        appearances.set(
          fixture.homeSlug,
          (appearances.get(fixture.homeSlug) ?? 0) + 1,
        )

        appearances.set(
          fixture.awaySlug,
          (appearances.get(fixture.awaySlug) ?? 0) + 1,
        )
      }

      expect(appearances.size).toBe(18)

      for (const count of appearances.values()) {
        expect(count).toBe(1)
      }
    }
  })

  it("never schedules a team against itself", () => {
    for (const fixture of LIGUE1_2026_2027_FIXTURES) {
      expect(fixture.homeSlug).not.toBe(fixture.awaySlug)
    }
  })

  it("contains every unordered pair exactly twice", () => {
    const pairCounts = new Map<string, number>()

    for (const fixture of LIGUE1_2026_2027_FIXTURES) {
      const pair = [fixture.homeSlug, fixture.awaySlug].sort().join("|")

      pairCounts.set(pair, (pairCounts.get(pair) ?? 0) + 1)
    }

    expect(pairCounts.size).toBe(153)

    for (const count of pairCounts.values()) {
      expect(count).toBe(2)
    }
  })

  it("contains each home-away direction exactly once", () => {
    const directedPairs = new Map<string, number>()

    for (const fixture of LIGUE1_2026_2027_FIXTURES) {
      const key = `${fixture.homeSlug}|${fixture.awaySlug}`

      directedPairs.set(key, (directedPairs.get(key) ?? 0) + 1)
    }

    expect(directedPairs.size).toBe(306)

    for (const count of directedPairs.values()) {
      expect(count).toBe(1)
    }
  })
})
