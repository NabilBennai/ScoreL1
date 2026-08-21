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

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-5 shrink-0"
      fill="none"
    >
      <path
        d="m5 10.5 3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AnonymousHome() {
  const benefits = [
    {
      number: "01",
      title: "Une lecture claire de chaque match",
      description:
        "Visualise le score leader, son niveau de confiance et l’alternative la plus intéressante pour ton prono.",
    },
    {
      number: "02",
      title: "Un modèle nourri par le marché",
      description:
        "Les cotes bookmakers sont corrigées puis croisées avec Poisson et Dixon-Coles pour obtenir des probabilités plus solides.",
    },
    {
      number: "03",
      title: "Une stratégie pensée pour MPP",
      description:
        "Choisis entre le score le plus probable et le meilleur compromis pour maximiser ton espérance de points.",
    },
  ]

  const includedFeatures = [
    "Toutes les journées de Ligue 1",
    "Scores exacts et probabilités détaillées",
    "Stratégies Leader et Équilibré",
    "Mises à jour avant les coups d’envoi",
  ]

  return (
    <main className="w-full flex-1 overflow-hidden">
      <section className="relative bg-pitch-950 px-5 py-12 text-cream-50 sm:px-8 sm:py-16 lg:py-20">
        <div className="absolute inset-0 opacity-40" aria-hidden="true">
          <div className="absolute -right-24 top-1/2 size-[34rem] -translate-y-1/2 rounded-full border border-white/15" />
          <div className="absolute right-[10.5rem] top-0 h-full w-px bg-white/10" />
          <div className="absolute -left-20 -top-28 size-80 rounded-full bg-pitch-500/25 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-pitch-300">
              <span className="size-1.5 rounded-full bg-gold-400 shadow-[0_0_0_4px_rgba(240,196,84,.14)]" />
              Ligue 1 · Le data coach de tes pronos
            </div>

            <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold uppercase leading-[0.92] tracking-[-0.025em] sm:text-6xl lg:text-7xl">
              Arrête de jouer
              <br />
              <span className="text-pitch-300">tes scores au hasard.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-cream-100/75 sm:text-lg sm:leading-8">
              MPP Scores transforme les cotes du marché et des modèles
              statistiques en choix simples pour chaque journée de Ligue 1.
              Moins d’intuition, plus de décisions éclairées.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="premium-button inline-flex items-center justify-center gap-3 rounded-xl bg-gold-400 px-6 py-3.5 text-sm font-bold text-pitch-950 shadow-lg shadow-black/15 hover:bg-[#f5ce69] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
              >
                Obtenir ma licence
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href="#comment-ca-marche"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/8 px-6 py-3.5 text-sm font-bold text-white hover:border-white/40 hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Découvrir la méthode
              </a>
            </div>

            <p className="mt-4 text-xs text-cream-100/55">
              Connexion Google en quelques secondes · À partir de 5,99 € / mois
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute -inset-6 rounded-full bg-pitch-400/15 blur-3xl" />
            <div className="relative rotate-1 rounded-[1.75rem] border border-white/15 bg-white/10 p-3 shadow-2xl shadow-black/25 backdrop-blur-sm">
              <div className="rounded-[1.35rem] bg-cream-50 p-5 text-ink-900 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-pitch-600">
                      Exemple de recommandation
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold uppercase">
                      Marseille · Monaco
                    </p>
                  </div>
                  <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-bold text-pitch-800">
                    J08
                  </span>
                </div>

                <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-sm font-bold shadow-sm ring-1 ring-line">
                      OM
                    </span>
                    <p className="mt-2 text-xs font-semibold text-ink-600">
                      Marseille
                    </p>
                  </div>

                  <div className="scoreboard-chip min-w-28 px-5 py-4">
                    <p className="scoreboard-label text-[0.58rem] font-bold">
                      Score leader
                    </p>
                    <p className="scoreboard-digits mt-1 text-3xl">2–1</p>
                  </div>

                  <div className="text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-sm font-bold shadow-sm ring-1 ring-line">
                      ASM
                    </span>
                    <p className="mt-2 text-xs font-semibold text-ink-600">
                      Monaco
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-xl border border-line bg-white p-3 text-center">
                  <div>
                    <p className="text-[0.6rem] font-semibold uppercase text-ink-400">
                      Domicile
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold text-pitch-800">
                      49%
                    </p>
                  </div>
                  <div className="border-x border-line">
                    <p className="text-[0.6rem] font-semibold uppercase text-ink-400">
                      Nul
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold text-ink-600">
                      25%
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.6rem] font-semibold uppercase text-ink-400">
                      Extérieur
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold text-ink-600">
                      26%
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-pitch-950 px-4 py-3 text-white">
                  <span className="text-xs font-semibold">
                    Option Équilibrée
                  </span>
                  <span className="font-mono text-sm font-bold text-gold-400">
                    1–1
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-400">
            Un moteur de décision, pas une boule de cristal
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-bold text-ink-600 sm:justify-end">
            <span>Cotes bookmakers</span>
            <span className="size-1 rounded-full bg-pitch-400" />
            <span>Modèle Poisson</span>
            <span className="size-1 rounded-full bg-pitch-400" />
            <span>Correction Dixon-Coles</span>
          </div>
        </div>
      </section>

      <section
        id="comment-ca-marche"
        className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-pitch-600">
              La donnée au service du jeu
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none text-ink-900 sm:text-5xl">
              Ton prono en trois temps.
            </h2>
            <p className="mt-4 text-base leading-7 text-ink-600">
              Toute la complexité reste derrière le modèle. Tu gardes une
              recommandation lisible et le dernier mot.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {benefits.map((benefit) => (
              <article
                key={benefit.number}
                className="surface-card rounded-2xl p-6 sm:p-7"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-pitch-950 font-mono text-xs font-bold text-gold-400">
                  {benefit.number}
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold uppercase leading-tight text-ink-900">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-ink-600">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-pitch-600">
              Pourquoi MPP Scores ?
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none text-ink-900 sm:text-5xl">
              Chaque point compte.
            </h2>
            <p className="mt-5 text-base leading-7 text-ink-600">
              Un score populaire n’est pas toujours le meilleur choix. MPP
              Scores compare les scénarios pour t’aider à arbitrer entre
              sécurité et potentiel de points.
            </p>
            <Link
              href="/login"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-pitch-800 underline decoration-pitch-300 decoration-2 underline-offset-4 hover:text-pitch-950"
            >
              Commencer avec mon compte Google
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="hero-pitch relative overflow-hidden rounded-[1.75rem] p-7 text-white shadow-xl shadow-pitch-950/15 sm:p-9">
            <div className="pitch-orbit" aria-hidden="true" />
            <div className="relative z-10 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-pitch-300">
                  Stratégie Leader
                </p>
                <p className="mt-4 font-display text-3xl font-bold uppercase">
                  Le choix le plus probable.
                </p>
                <p className="mt-3 text-sm leading-6 text-cream-100/70">
                  Pour viser le score exact soutenu par la plus forte
                  probabilité du modèle.
                </p>
              </div>
              <div className="border-t border-white/15 pt-6 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
                  Stratégie Équilibrée
                </p>
                <p className="mt-4 font-display text-3xl font-bold uppercase">
                  Le meilleur compromis.
                </p>
                <p className="mt-3 text-sm leading-6 text-cream-100/70">
                  Pour combiner probabilité du résultat et espérance de points
                  sur MPP.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="tarifs" className="scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-pitch-600">
              Ta saison commence ici
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none text-ink-900 sm:text-5xl">
              Choisis ta licence.
            </h2>
            <p className="mt-4 text-base leading-7 text-ink-600">
              Accède à l’intégralité des analyses Ligue 1. L’offre annuelle est
              la plus avantageuse pour suivre toute la saison.
            </p>
          </div>

          <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2">
            <article className="surface-card flex flex-col rounded-[1.75rem] p-7 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pitch-600">
                Licence mensuelle
              </p>
              <div className="mt-6 flex items-end gap-2">
                <p className="font-display text-6xl font-bold leading-none tracking-tight text-ink-900">
                  5,99 €
                </p>
                <p className="pb-1 text-sm font-medium text-ink-400">/ mois</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-ink-600">
                La liberté de tester le modèle et d’arrêter quand tu le
                souhaites.
              </p>
              <Link
                href="/login"
                className="mt-7 inline-flex items-center justify-center rounded-xl border border-pitch-800 px-5 py-3 text-sm font-bold text-pitch-800 hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-600"
              >
                Choisir le mensuel
              </Link>
            </article>

            <article className="hero-pitch relative flex flex-col overflow-hidden rounded-[1.75rem] p-7 text-white shadow-xl shadow-pitch-950/15 sm:p-9">
              <div className="pitch-orbit" aria-hidden="true" />
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-pitch-300">
                    Licence annuelle
                  </p>
                  <span className="rounded-full bg-gold-400 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-pitch-950">
                    2 mois offerts
                  </span>
                </div>
                <div className="mt-6 flex items-end gap-2">
                  <p className="font-display text-6xl font-bold leading-none tracking-tight">
                    59,99 €
                  </p>
                  <p className="pb-1 text-sm font-medium text-cream-100/65">
                    / an
                  </p>
                </div>
                <p className="mt-4 text-sm leading-6 text-cream-100/75">
                  Le meilleur tarif pour préparer chaque journée, toute la
                  saison.
                </p>
                <Link
                  href="/login"
                  className="premium-button mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-400 px-5 py-3 text-sm font-bold text-pitch-950 hover:bg-[#f5ce69] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
                >
                  Obtenir la licence annuelle
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
            {includedFeatures.map((feature) => (
              <p
                key={feature}
                className="flex items-center gap-3 text-sm font-medium text-ink-600"
              >
                <span className="grid size-7 place-items-center rounded-full bg-cream-100 text-pitch-800">
                  <CheckIcon />
                </span>
                {feature}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-pitch-950 px-6 py-10 text-center text-white shadow-xl shadow-pitch-950/15 sm:px-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pitch-300">
            Prêt pour la prochaine journée ?
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl font-bold uppercase leading-none sm:text-5xl">
            Fais parler la donnée avant le coup d’envoi.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-cream-100/70">
            Connecte-toi, choisis ta licence et retrouve tous les pronostics de
            la saison.
          </p>
          <Link
            href="/login"
            className="premium-button mt-7 inline-flex items-center gap-3 rounded-xl bg-gold-400 px-6 py-3.5 text-sm font-bold text-pitch-950 hover:bg-[#f5ce69] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
          >
            Créer mon accès
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  )
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

  if (accessLevel === "anonymous") {
    return <AnonymousHome />
  }

  if (!hasPaidAccess(accessLevel)) {
    return <PricingHome />
  }

  return <PaidHome />
}
