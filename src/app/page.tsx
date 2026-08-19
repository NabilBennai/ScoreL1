import Link from "next/link"
import { getAvailableRounds } from "@/lib/data/repositories/home-repository"
import { getRelevantRound } from "@/lib/model/relevant-round"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export default async function HomePage() {
  const rounds = await getAvailableRounds()

  const relevantRound = getRelevantRound(rounds)

  return (
    <main className="mx-auto max-w-6xl p-8">
      <section className="turf-texture relative overflow-hidden rounded-2xl bg-linear-to-br from-pitch-950 via-pitch-800 to-pitch-400 p-8 text-cream-50 shadow-lg shadow-pitch-950/20 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
          Mon Petit Prono · Ligue 1
        </p>

        <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          Pronostics de scores exacts basés sur les probabilités de marché
        </h1>

        <p className="mt-4 max-w-2xl text-cream-100/85">
          Le moteur combine les cotes bookmakers, un modèle Poisson/Dixon-Coles
          et une estimation du peloton MPP pour proposer deux stratégies :
          Leader et Équilibré.
        </p>

        {relevantRound && (
          <div className="mt-8">
            <Link
              href={`/journee/${relevantRound.round}`}
              className="inline-flex rounded-lg bg-gold-500 px-5 py-3 font-semibold text-ink-900 transition hover:bg-gold-400"
            >
              Voir la journée {relevantRound.round}
            </Link>

            <p className="mt-3 text-sm text-cream-100/70">
              {relevantRound.matchCount} match
              {relevantRound.matchCount > 1 ? "s" : ""} disponible
              {relevantRound.matchCount > 1 ? "s" : ""}
            </p>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink-400">Ligue 1</p>

            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink-900">
              Journées disponibles
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
                  className="rounded-xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-pitch-500 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-ink-400">Ligue 1</p>

                      <p className="mt-1 font-display text-2xl font-semibold text-ink-900">
                        Journée {round.round}
                      </p>
                    </div>

                    {isRelevant && (
                      <span className="rounded-full bg-pitch-600 px-3 py-1 text-xs font-medium text-cream-50">
                        À suivre
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-ink-600">
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

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-pitch-600">
            Leader
          </p>

          <p className="mt-2 text-sm text-ink-600">
            Le score exact le plus probable selon le modèle. À privilégier si tu
            veux maximiser les chances de trouver le score exact.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
            Équilibré
          </p>

          <p className="mt-2 text-sm text-ink-600">
            Le meilleur compromis entre probabilité du résultat et espérance de
            points MPP.
          </p>
        </div>
      </section>
    </main>
  )
}
