import Link from "next/link"
import EvaluationPanel from "./EvaluationPanel"
import PipelineRunner from "./PipelineRunner"

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl p-8">
      <header>
        <p className="text-sm font-medium text-zinc-500">Administration</p>

        <h1 className="mt-2 text-3xl font-bold">Pipeline Ligue 1</h1>

        <p className="mt-3 max-w-2xl text-zinc-600">
          Synchronisation des cotes, attribution des journées, calcul des
          prédictions et récupération des résultats.
        </p>

        <div className="mt-4">
          <Link href="/" className="text-sm font-medium underline">
            Retour à l`&lsquo;accueil
          </Link>
        </div>
      </header>

      <section className="mt-10">
        <PipelineRunner />
      </section>

      <section className="mt-12 border-t pt-10">
        <EvaluationPanel />
      </section>
    </main>
  )
}
