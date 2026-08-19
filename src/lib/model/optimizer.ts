import {applyDixonColes} from "./dixon-coles"
import {projectBtts, projectOneXTwo, projectTotals,} from "./market-projection"
import {buildPoissonScoreGrid, normalizeScoreGrid,} from "./score-grid"

export type FairMarketInput = {
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

export type GoalModelFit = {
    lambdaHome: number
    lambdaAway: number
    loss: number
}

const EPSILON = 1e-9

function logit(value: number): number {
    const p = Math.min(1 - EPSILON, Math.max(EPSILON, value))
    return Math.log(p / (1 - p))
}

function squaredLogitError(model: number, market: number): number {
    const delta = logit(model) - logit(market)
    return delta * delta
}

function validateProbability(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0 || value >= 1) {
        throw new Error(`${name} must be between 0 and 1`)
    }
}

function validateMarkets(markets: FairMarketInput): void {
    validateProbability(markets.oneXTwo.home, "home")
    validateProbability(markets.oneXTwo.draw, "draw")
    validateProbability(markets.oneXTwo.away, "away")

    const oneXTwoTotal =
        markets.oneXTwo.home +
        markets.oneXTwo.draw +
        markets.oneXTwo.away

    if (Math.abs(oneXTwoTotal - 1) > 1e-6) {
        throw new Error("1X2 probabilities must sum to 1")
    }

    if (markets.over25 !== undefined) {
        validateProbability(markets.over25, "over25")
    }

    if (markets.under25 !== undefined) {
        validateProbability(markets.under25, "under25")
    }

    if (
        markets.over25 !== undefined &&
        markets.under25 !== undefined &&
        Math.abs(markets.over25 + markets.under25 - 1) > 1e-6
    ) {
        throw new Error("Over/Under probabilities must sum to 1")
    }

    if (markets.bttsYes !== undefined) {
        validateProbability(markets.bttsYes, "bttsYes")
    }

    if (markets.bttsNo !== undefined) {
        validateProbability(markets.bttsNo, "bttsNo")
    }

    if (
        markets.bttsYes !== undefined &&
        markets.bttsNo !== undefined &&
        Math.abs(markets.bttsYes + markets.bttsNo - 1) > 1e-6
    ) {
        throw new Error("BTTS probabilities must sum to 1")
    }
}

function computeLoss(
    lambdaHome: number,
    lambdaAway: number,
    rho: number,
    markets: FairMarketInput,
): number {
    const poisson = normalizeScoreGrid(
        buildPoissonScoreGrid(lambdaHome, lambdaAway, 12),
    )

    const grid = applyDixonColes(
        poisson,
        lambdaHome,
        lambdaAway,
        rho,
    )

    const oneXTwo = projectOneXTwo(grid)

    let loss =
        squaredLogitError(oneXTwo.home, markets.oneXTwo.home) +
        squaredLogitError(oneXTwo.draw, markets.oneXTwo.draw) +
        squaredLogitError(oneXTwo.away, markets.oneXTwo.away)

    if (markets.over25 !== undefined) {
        const totals = projectTotals(grid, 2.5)
        loss += 0.8 * squaredLogitError(totals.over, markets.over25)
    }

    if (markets.under25 !== undefined) {
        const totals = projectTotals(grid, 2.5)
        loss += 0.8 * squaredLogitError(totals.under, markets.under25)
    }

    if (markets.bttsYes !== undefined) {
        const btts = projectBtts(grid)
        loss += 0.5 * squaredLogitError(btts.yes, markets.bttsYes)
    }

    if (markets.bttsNo !== undefined) {
        const btts = projectBtts(grid)
        loss += 0.5 * squaredLogitError(btts.no, markets.bttsNo)
    }

    return loss
}

export function fitGoalModel(
    markets: FairMarketInput,
    rho = 0,
): GoalModelFit {
    validateMarkets(markets)

    if (!Number.isFinite(rho)) {
        throw new Error("rho must be finite")
    }

    let best: GoalModelFit = {
        lambdaHome: 1.5,
        lambdaAway: 1.2,
        loss: Number.POSITIVE_INFINITY,
    }

    for (let lambdaHome = 0.1; lambdaHome <= 5; lambdaHome += 0.1) {
        for (let lambdaAway = 0.1; lambdaAway <= 5; lambdaAway += 0.1) {
            const loss = computeLoss(
                lambdaHome,
                lambdaAway,
                rho,
                markets,
            )

            if (loss < best.loss) {
                best = {
                    lambdaHome,
                    lambdaAway,
                    loss,
                }
            }
        }
    }

    const coarse = best

    for (
        let lambdaHome = Math.max(0.05, coarse.lambdaHome - 0.15);
        lambdaHome <= Math.min(6, coarse.lambdaHome + 0.15);
        lambdaHome += 0.01
    ) {
        for (
            let lambdaAway = Math.max(0.05, coarse.lambdaAway - 0.15);
            lambdaAway <= Math.min(6, coarse.lambdaAway + 0.15);
            lambdaAway += 0.01
        ) {
            const loss = computeLoss(
                lambdaHome,
                lambdaAway,
                rho,
                markets,
            )

            if (loss < best.loss) {
                best = {
                    lambdaHome,
                    lambdaAway,
                    loss,
                }
            }
        }
    }

    return best
}