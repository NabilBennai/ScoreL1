import Link from "next/link"
import {
  getAvailableRounds,
  getRelevantRound,
} from "@/lib/data/repositories/home-repository"

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
      <section className="rounded-2xl border p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Mon Petit Prono Ligue 1
        </p>

        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight">
          Pronostics de scores exacts basés sur les probabilités de marché
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-600">
          Le moteur combine les cotes bookmakers, un modèle Poisson/Dixon-Coles
          et une estimation du peloton MPP pour produire trois stratégies :
          Leader, Équilibré et Challenger.
        </p>

        {relevantRound && (
          <div className="mt-8">
            <Link
              href={`/journee/${relevantRound.round}`}
              className="inline-flex rounded-lg bg-zinc-900 px-5 py-3 font-medium text-white transition hover:bg-zinc-700"
            >
              Voir la journée {relevantRound.round}
            </Link>

            <p className="mt-3 text-sm text-zinc-500">
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
            <p className="text-sm text-zinc-500">Ligue 1</p>

            <h2 className="mt-1 text-2xl font-semibold">
              Journées disponibles
            </h2>
          </div>

          <p className="text-sm text-zinc-500">
            {rounds.length} journée
            {rounds.length > 1 ? "s" : ""}
          </p>
        </div>

        {rounds.length === 0 ? (
          <div className="mt-6 rounded-xl border p-8">
            <p className="text-zinc-600">
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
                  className="rounded-xl border p-5 transition hover:bg-zinc-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Ligue 1</p>

                      <p className="mt-1 text-xl font-semibold">
                        Journée {round.round}
                      </p>
                    </div>

                    {isRelevant && (
                      <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
                        À suivre
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-zinc-600">
                    {round.matchCount} match
                    {round.matchCount > 1 ? "s" : ""}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
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

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-sm font-medium">Leader</p>

          <p className="mt-2 text-sm text-zinc-600">
            Le score exact le plus probable selon le modèle.
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm font-medium">Équilibré</p>

          <p className="mt-2 text-sm text-zinc-600">
            Le score qui maximise l&apos;espérance de points MPP.
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm font-medium">Challenger</p>

          <p className="mt-2 text-sm text-zinc-600">
            Une option plus différenciante lorsque sa probabilité reste
            suffisante.
          </p>
        </div>
      </section>
    </main>
  )
}
