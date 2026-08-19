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

export interface OddsProvider {
  getUpcomingEvents(): Promise<ProviderEvent[]>

  getOdds(): Promise<ProviderOdds[]>
}
