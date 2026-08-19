import { devigPower } from "./devig-power"
import { applyDixonColes } from "./dixon-coles"
import { projectBtts, projectOneXTwo, projectTotals } from "./market-projection"
import { fitGoalModel } from "./optimizer"
import { buildPoissonScoreGrid, normalizeScoreGrid } from "./score-grid"

export type RawFootballMarketInput = {
  oneXTwoOdds: {
    home: number
    draw: number
    away: number
  }
  over25Odds?: {
    over: number
    under: number
  }
  bttsOdds?: {
    yes: number
    no: number
  }
}

export type FootballModelResult = {
  lambdaHome: number
  lambdaAway: number
  rho: number
  fitLoss: number

  fairMarkets: {
    oneXTwo: {
      home: number
      draw: number
      away: number
    }
    over25?: number
    under25?: number
    bttsYes?: number
    bttsNo?: number
  }

  projections: {
    oneXTwo: {
      home: number
      draw: number
      away: number
    }
    totals25: {
      over: number
      under: number
    }
    btts: {
      yes: number
      no: number
    }
  }

  scoreProbabilities: Array<{
    home: number
    away: number
    probability: number
  }>
}

export function calculateFootballModel(
  input: RawFootballMarketInput,
  rho = 0,
): FootballModelResult {
  const fairOneXTwo = devigPower([
    input.oneXTwoOdds.home,
    input.oneXTwoOdds.draw,
    input.oneXTwoOdds.away,
  ]).probabilities

  const fairMarkets: FootballModelResult["fairMarkets"] = {
    oneXTwo: {
      home: fairOneXTwo[0],
      draw: fairOneXTwo[1],
      away: fairOneXTwo[2],
    },
  }

  if (input.over25Odds) {
    const fairTotals = devigPower([
      input.over25Odds.over,
      input.over25Odds.under,
    ]).probabilities

    fairMarkets.over25 = fairTotals[0]
    fairMarkets.under25 = fairTotals[1]
  }

  if (input.bttsOdds) {
    const fairBtts = devigPower([
      input.bttsOdds.yes,
      input.bttsOdds.no,
    ]).probabilities

    fairMarkets.bttsYes = fairBtts[0]
    fairMarkets.bttsNo = fairBtts[1]
  }

  const fit = fitGoalModel(
    {
      oneXTwo: fairMarkets.oneXTwo,
      over25: fairMarkets.over25,
      under25: fairMarkets.under25,
      bttsYes: fairMarkets.bttsYes,
      bttsNo: fairMarkets.bttsNo,
    },
    rho,
  )

  const poisson = normalizeScoreGrid(
    buildPoissonScoreGrid(fit.lambdaHome, fit.lambdaAway, 12),
  )

  const corrected = applyDixonColes(
    poisson,
    fit.lambdaHome,
    fit.lambdaAway,
    rho,
  )

  return {
    lambdaHome: fit.lambdaHome,
    lambdaAway: fit.lambdaAway,
    rho,
    fitLoss: fit.loss,

    fairMarkets,

    projections: {
      oneXTwo: projectOneXTwo(corrected),
      totals25: projectTotals(corrected, 2.5),
      btts: projectBtts(corrected),
    },

    scoreProbabilities: corrected.scores,
  }
}
