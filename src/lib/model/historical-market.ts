export type HistoricalMarketRow = {
  matchId: string
  kickoffAt: string

  homeTeam: string
  awayTeam: string

  odds: {
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

  finalScore: {
    home: number
    away: number
  }
}

export type HistoricalMarketValidationResult =
  | {
      valid: true
      row: HistoricalMarketRow
    }
  | {
      valid: false
      reason: string
    }

function isPositiveDecimalOdd(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 1
}

function isGoalCount(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0
}

function isValidDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !Number.isNaN(new Date(value).getTime())
  )
}

export function validateHistoricalMarketRow(
  value: unknown,
): HistoricalMarketValidationResult {
  if (typeof value !== "object" || value === null) {
    return {
      valid: false,
      reason: "Row must be an object",
    }
  }

  const row = value as Record<string, unknown>

  if (typeof row.matchId !== "string" || row.matchId.length === 0) {
    return {
      valid: false,
      reason: "Invalid matchId",
    }
  }

  if (!isValidDate(row.kickoffAt)) {
    return {
      valid: false,
      reason: "Invalid kickoffAt",
    }
  }

  if (typeof row.homeTeam !== "string" || row.homeTeam.length === 0) {
    return {
      valid: false,
      reason: "Invalid homeTeam",
    }
  }

  if (typeof row.awayTeam !== "string" || row.awayTeam.length === 0) {
    return {
      valid: false,
      reason: "Invalid awayTeam",
    }
  }

  if (row.homeTeam === row.awayTeam) {
    return {
      valid: false,
      reason: "Home and away teams must differ",
    }
  }

  if (typeof row.odds !== "object" || row.odds === null) {
    return {
      valid: false,
      reason: "Missing odds",
    }
  }

  const odds = row.odds as Record<string, unknown>

  if (typeof odds.oneXTwo !== "object" || odds.oneXTwo === null) {
    return {
      valid: false,
      reason: "Missing oneXTwo odds",
    }
  }

  const oneXTwo = odds.oneXTwo as Record<string, unknown>

  if (
    !isPositiveDecimalOdd(oneXTwo.home) ||
    !isPositiveDecimalOdd(oneXTwo.draw) ||
    !isPositiveDecimalOdd(oneXTwo.away)
  ) {
    return {
      valid: false,
      reason: "Invalid oneXTwo decimal odds",
    }
  }

  if (odds.over25 !== undefined) {
    if (typeof odds.over25 !== "object" || odds.over25 === null) {
      return {
        valid: false,
        reason: "Invalid over25 market",
      }
    }

    const over25 = odds.over25 as Record<string, unknown>

    if (
      !isPositiveDecimalOdd(over25.over) ||
      !isPositiveDecimalOdd(over25.under)
    ) {
      return {
        valid: false,
        reason: "Invalid over25 decimal odds",
      }
    }
  }

  if (odds.btts !== undefined) {
    if (typeof odds.btts !== "object" || odds.btts === null) {
      return {
        valid: false,
        reason: "Invalid BTTS market",
      }
    }

    const btts = odds.btts as Record<string, unknown>

    if (!isPositiveDecimalOdd(btts.yes) || !isPositiveDecimalOdd(btts.no)) {
      return {
        valid: false,
        reason: "Invalid BTTS decimal odds",
      }
    }
  }

  if (typeof row.finalScore !== "object" || row.finalScore === null) {
    return {
      valid: false,
      reason: "Missing finalScore",
    }
  }

  const finalScore = row.finalScore as Record<string, unknown>

  if (!isGoalCount(finalScore.home) || !isGoalCount(finalScore.away)) {
    return {
      valid: false,
      reason: "Invalid final score",
    }
  }

  return {
    valid: true,
    row: value as HistoricalMarketRow,
  }
}

export function validateHistoricalMarketDataset(values: unknown[]): {
  validRows: HistoricalMarketRow[]
  rejectedRows: Array<{
    index: number
    reason: string
  }>
} {
  const validRows: HistoricalMarketRow[] = []

  const rejectedRows: Array<{
    index: number
    reason: string
  }> = []

  values.forEach((value, index) => {
    const result = validateHistoricalMarketRow(value)

    if (result.valid) {
      validRows.push(result.row)
      return
    }

    rejectedRows.push({
      index,
      reason: result.reason,
    })
  })

  return {
    validRows,
    rejectedRows,
  }
}
