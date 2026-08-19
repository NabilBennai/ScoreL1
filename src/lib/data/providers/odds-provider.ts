export type ProviderEvent = {
  externalId: string
  homeTeam: string
  awayTeam: string
  commenceTime: string
}

export type ProviderOdds = {
  externalId: string
  homeTeam: string
  awayTeam: string
  commenceTime: string
  bookmaker: string
  capturedAt: string

  oneXTwo?: {
    home: number
    draw: number
    away: number
  }

  over25?: {
    over: number
    under: number
  }
}

export type ProviderScore = {
  externalId: string
  homeTeam: string
  awayTeam: string
  commenceTime: string
  completed: boolean
  homeGoals: number | null
  awayGoals: number | null
  lastUpdate: string | null
}

export interface OddsProvider {
  getUpcomingEvents(): Promise<ProviderEvent[]>

  getOdds(): Promise<ProviderOdds[]>

  getScores(daysFrom?: number): Promise<ProviderScore[]>
}
