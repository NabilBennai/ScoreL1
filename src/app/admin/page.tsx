import Link from "next/link"
import PipelineRunner from "./PipelineRunner"

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Administration
        </p>

        <h1 className="mt-2 text-3xl font-bold">Pipeline Ligue 1</h1>

        <p className="mt-3 max-w-2xl text-zinc-600">
          Synchronise les dernières cotes, affecte les matchs à leur journée et
          recalcule les prédictions MPP.
        </p>
      </header>

      <PipelineRunner />

      <section className="mt-10 border-t pt-6">
        <Link
          href="/journee/1"
          className="font-medium underline underline-offset-4"
        >
          Voir la Journée 1
        </Link>
      </section>
    </main>
  )
}
