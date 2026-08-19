import { describe, expect, it } from "vitest"
import { importFootballDataCsv } from "../../src/lib/data/historical/football-data"

describe("importFootballDataCsv", () => {
  it("imports closing odds and final score", () => {
    const csv = [
      "Div,Date,Time,HomeTeam,AwayTeam,FTHG,FTAG,AvgCH,AvgCD,AvgCA,AvgC>2.5,AvgC<2.5",
      "F1,16/03/2025,19:45,Paris SG,Marseille,3,1,1.55,4.40,5.50,1.60,2.30",
    ].join("\n")

    const result = importFootballDataCsv(csv)

    expect(result.rejected).toEqual([])

    expect(result.rows).toHaveLength(1)

    expect(result.rows[0]).toMatchObject({
      homeTeam: "Paris SG",
      awayTeam: "Marseille",

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
      },

      finalScore: {
        home: 3,
        away: 1,
      },
    })
  })

  it("accepts a match without closing totals", () => {
    const csv = [
      "Date,Time,HomeTeam,AwayTeam,FTHG,FTAG,AvgCH,AvgCD,AvgCA,AvgC>2.5,AvgC<2.5",
      "16/03/2025,19:45,Paris SG,Marseille,3,1,1.55,4.40,5.50,,",
    ].join("\n")

    const result = importFootballDataCsv(csv)

    expect(result.rows).toHaveLength(1)

    expect(result.rows[0].odds.over25).toBeUndefined()
  })

  it("rejects a row without closing 1X2 odds", () => {
    const csv = [
      "Date,Time,HomeTeam,AwayTeam,FTHG,FTAG,AvgCH,AvgCD,AvgCA",
      "16/03/2025,19:45,Paris SG,Marseille,3,1,,4.40,5.50",
    ].join("\n")

    const result = importFootballDataCsv(csv)

    expect(result.rows).toHaveLength(0)

    expect(result.rejected).toEqual([
      {
        line: 2,
        reason: "Missing or invalid closing 1X2 odds",
      },
    ])
  })
})
