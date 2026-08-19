import {z} from "zod"

const decimalOdd = z.number().finite().gt(1)

export const calculatePredictionSchema = z.object({
    matchId: z.string().uuid(),
    provider: z.string().min(1),
    bookmaker: z.string().min(1).optional(),
    capturedAt: z.string().datetime(),

    odds: z.object({
        oneXTwo: z.object({
            home: decimalOdd,
            draw: decimalOdd,
            away: decimalOdd,
        }),

        over25: z
            .object({
                over: decimalOdd,
                under: decimalOdd,
            })
            .optional(),

        btts: z
            .object({
                yes: decimalOdd,
                no: decimalOdd,
            })
            .optional(),
    }),
})

export type CalculatePredictionInput = z.infer<
    typeof calculatePredictionSchema
>