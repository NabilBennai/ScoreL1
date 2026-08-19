import { describe, expect, it } from "vitest"
import {
  buildMarketConsensus,
  type BookmakerMarket,
} from "../../src/lib/model/market-consensus"

describe("buildMarketConsensus", () => {
  it("builds the median 1X2 market", () => {
    const markets: BookmakerMarket[] = [
      {
        bookmaker: "book-a",
        oneXTwo: {
          home: 1.8,
          draw: 3.5,
          away: 4.2,
        },
      },
      {
        bookmaker: "book-b",
        oneXTwo: {
          home: 1.9,
          draw: 3.6,
          away: 4,
        },
      },
      {
        bookmaker: "book-c",
        oneXTwo: {
          home: 2,
          draw: 3.7,
          away: 3.8,
        },
      },
    ]

    const consensus = buildMarketConsensus(markets)

    expect(consensus.bookmakerCount).toBe(3)
    expect(consensus.oneXTwo.home).toBeCloseTo(1.9)
    expect(consensus.oneXTwo.draw).toBeCloseTo(3.6)
    expect(consensus.oneXTwo.away).toBeCloseTo(4)
  })

  it("is robust to an extreme bookmaker value", () => {
    const markets: BookmakerMarket[] = [
      {
        bookmaker: "book-a",
        oneXTwo: {
          home: 1.8,
          draw: 3.5,
          away: 4.1,
        },
      },
      {
        bookmaker: "book-b",
        oneXTwo: {
          home: 1.82,
          draw: 3.55,
          away: 4.05,
        },
      },
      {
        bookmaker: "outlier",
        oneXTwo: {
          home: 8,
          draw: 9,
          away: 12,
        },
      },
    ]

    const consensus = buildMarketConsensus(markets)

    expect(consensus.oneXTwo.home).toBeCloseTo(1.82)
    expect(consensus.oneXTwo.draw).toBeCloseTo(3.55)
    expect(consensus.oneXTwo.away).toBeCloseTo(4.1)
  })

  it("builds optional totals consensus", () => {
    const markets: BookmakerMarket[] = [
      {
        bookmaker: "book-a",
        oneXTwo: {
          home: 1.8,
          draw: 3.5,
          away: 4.2,
        },
        over25: {
          over: 1.75,
          under: 2.05,
        },
      },
      {
        bookmaker: "book-b",
        oneXTwo: {
          home: 1.85,
          draw: 3.6,
          away: 4.1,
        },
        over25: {
          over: 1.8,
          under: 2,
        },
      },
    ]

    const consensus = buildMarketConsensus(markets)

    expect(consensus.over25).toBeDefined()
    expect(consensus.over25?.over).toBeCloseTo(1.775)
    expect(consensus.over25?.under).toBeCloseTo(2.025)
  })

  it("supports bookmakers without totals", () => {
    const markets: BookmakerMarket[] = [
      {
        bookmaker: "book-a",
        oneXTwo: {
          home: 1.8,
          draw: 3.5,
          away: 4.2,
        },
      },
      {
        bookmaker: "book-b",
        oneXTwo: {
          home: 1.85,
          draw: 3.6,
          away: 4.1,
        },
        over25: {
          over: 1.8,
          under: 2,
        },
      },
    ]

    const consensus = buildMarketConsensus(markets)

    expect(consensus.over25?.over).toBeCloseTo(1.8)
    expect(consensus.over25?.under).toBeCloseTo(2)
  })

  it("rejects an empty market list", () => {
    expect(() => buildMarketConsensus([])).toThrow(
      "No bookmaker markets available",
    )
  })

  it("requires at least one 1X2 market", () => {
    expect(() =>
      buildMarketConsensus([
        {
          bookmaker: "book-a",
          over25: {
            over: 1.8,
            under: 2,
          },
        },
      ]),
    ).toThrow("No 1X2 bookmaker market available")
  })

  it("rejects invalid decimal odds", () => {
    expect(() =>
      buildMarketConsensus([
        {
          bookmaker: "book-a",
          oneXTwo: {
            home: 1,
            draw: 3.5,
            away: 4,
          },
        },
      ]),
    ).toThrow("Invalid decimal odd")
  })
})
