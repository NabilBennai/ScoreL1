import { runBacktest, type BacktestSummary } from "./backtest"
import {
  calculateHistoricalPredictions,
  type HistoricalPredictionResult,
} from "./historical-prediction"
import {
  validateHistoricalMarketDataset,
  type HistoricalMarketRow,
} from "./historical-market"

export type HistoricalBacktestResult = {
  dataset: {
    inputRows: number
    validRows: number
    rejectedRows: number
    rejected: Array<{
      index: number
      reason: string
    }>
  }

  predictions: HistoricalPredictionResult[]

  summary: BacktestSummary
}

export function runHistoricalBacktest(
  values: unknown[],
): HistoricalBacktestResult {
  const validation = validateHistoricalMarketDataset(values)

  const predictions = calculateHistoricalPredictions(validation.validRows)

  const summary = runBacktest(predictions.map((result) => result.prediction))

  return {
    dataset: {
      inputRows: values.length,
      validRows: validation.validRows.length,
      rejectedRows: validation.rejectedRows.length,
      rejected: validation.rejectedRows,
    },

    predictions,

    summary,
  }
}

export function runValidatedHistoricalBacktest(
  rows: HistoricalMarketRow[],
): HistoricalBacktestResult {
  const predictions = calculateHistoricalPredictions(rows)

  const summary = runBacktest(predictions.map((result) => result.prediction))

  return {
    dataset: {
      inputRows: rows.length,
      validRows: rows.length,
      rejectedRows: 0,
      rejected: [],
    },

    predictions,

    summary,
  }
}
