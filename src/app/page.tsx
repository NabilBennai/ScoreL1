import Link from "next/link"
import { getAvailableRounds } from "@/lib/data/repositories/home-repository"
import {
  getCurrentAccessLevel,
  hasPaidAccess,
} from "@/lib/data/supabase/access"
import { getRelevantRound } from "@/lib/model/relevant-round"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function PricingHome() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-12 sm:px-8 sm:py-16">
      <section className="w-full" aria-label="Offres d'abonnement">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-pitch-600">
            MPP Scores
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            Des pronostics Ligue 1 guidés par la donnée.
          </h1>
          <p className="mt-4 text-base leading-7 text-ink-500">
            Retrouvez les scores exacts les plus probables pour chaque journée,
            calculés à partir des cotes du marché et de notre modèle
            statistique.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <article className="surface-card rounded-[1.75rem] p-8 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-pitch-600">
              Mensuel
            </p>
            <p className="mt-8 font-display text-6xl font-bold tracking-tight text-ink-900 sm:text-7xl">
              5,99&nbsp;€
            </p>
            <p className="mt-2 text-sm font-medium text-ink-400">par mois</p>
          </article>

          <article className="hero-pitch relative overflow-hidden rounded-[1.75rem] p-8 text-cream-50 shadow-xl shadow-pitch-950/15 sm:p-10">
            <div className="pitch-orbit" aria-hidden="true" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pitch-300">
                Annuel
              </p>
              <p className="mt-8 font-display text-6xl font-bold tracking-tight sm:text-7xl">
                59,99&nbsp;€
              </p>
              <p className="mt-2 text-sm font-medium text-cream-100/75">
                par an
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}

async function PaidHome() {
  const rounds = await getAvailableRounds()

  const relevantRound = getRelevantRound(rounds)

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
      <section className="hero-pitch relative overflow-hidden rounded-[1.75rem] px-6 py-9 text-cream-50 shadow-xl shadow-pitch-950/15 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        <div className="pitch-orbit" aria-hidden="true" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-pitch-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400 shadow-[0_0_0_4px_rgba(240,196,84,.14)]" />
            Ligue 1 · Modèle prédictif
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-[0.98] tracking-[-0.02em] sm:text-6xl lg:text-7xl">
            Le score juste,
            <br />
            <span className="text-pitch-300">avant le coup d&apos;envoi.</span>
          </h1>

          <p className="mt-5 max-w-xl text-[0.95rem] leading-7 text-cream-100/75 sm:text-base">
            Des pronostics de scores exacts nourris par les cotes bookmakers et
            un modèle statistique pensé pour Mon Petit Prono.
          </p>

          {relevantRound && (
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                href={`/journee/${relevantRound.round}`}
                className="inline-flex items-center gap-3 rounded-xl bg-gold-400 px-5 py-3 text-sm font-bold text-pitch-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#f5ce69]"
              >
                Journée {relevantRound.round}
                <span aria-hidden="true">→</span>
              </Link>

              <p className="text-xs text-cream-50/80">
                {relevantRound.matchCount} match
                {relevantRound.matchCount > 1 ? "s" : ""} disponible
                {relevantRound.matchCount > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-12 sm:mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-pitch-600">
              Calendrier
            </p>

            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink-900">
              Les prochaines journées
            </h2>
          </div>

          <p className="text-sm text-ink-400">
            {rounds.length} journée
            {rounds.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="pitch-divider mt-4" />

        {rounds.length === 0 ? (
          <div className="mt-6 rounded-xl border border-line bg-white p-8">
            <p className="text-ink-600">
              Aucun match n&apos;est encore enregistré.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rounds.map((round) => {
              const isRelevant = relevantRound?.round === round.round

              return (
                <Link
                  key={round.round}
                  href={`/journee/${round.round}`}
                  className="surface-card group relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-1 hover:border-pitch-500/50 hover:shadow-lg"
                >
                  <span className="absolute inset-y-0 left-0 w-1 bg-pitch-500 opacity-0 transition group-hover:opacity-100" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-400">
                        Ligue 1
                      </p>

                      <p className="mt-1 font-display text-2xl font-semibold text-ink-900">
                        Journée {round.round}
                      </p>
                    </div>

                    {isRelevant && (
                      <span className="rounded-full bg-pitch-600 px-3 py-1 text-xs font-medium text-cream-50">
                        En cours
                      </span>
                    )}
                  </div>

                  <p className="mt-5 text-sm font-medium text-ink-600">
                    {round.matchCount} match
                    {round.matchCount > 1 ? "s" : ""}
                  </p>

                  <p className="mt-1 text-sm text-ink-400">
                    {formatDate(round.firstKickoffAt)}

                    {round.firstKickoffAt !== round.lastKickoffAt &&
                      ` — ${formatDate(round.lastKickoffAt)}`}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="mt-14 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-pitch-600">
            Deux façons de jouer
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold text-ink-900">
            Choisis ta stratégie
          </h2>
        </div>
        <div className="grid md:grid-cols-2">
          <div className="p-6 md:border-r md:border-line">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pitch-600 text-sm font-bold text-white">
              01
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-pitch-600">
              Leader
            </p>

            <p className="mt-2 text-sm text-ink-600">
              Le score exact le plus probable selon le modèle. À privilégier si
              tu veux maximiser les chances de trouver le score exact.
            </p>
          </div>

          <div className="border-t border-line p-6 md:border-t-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400 text-sm font-bold text-pitch-950">
              02
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-gold-500">
              Équilibré
            </p>

            <p className="mt-2 text-sm text-ink-600">
              Le meilleur compromis entre probabilité du résultat et espérance
              de points MPP.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default async function HomePage() {
  const accessLevel = await getCurrentAccessLevel()

  if (!hasPaidAccess(accessLevel)) {
    return <PricingHome />
  }

  return <PaidHome />
}
