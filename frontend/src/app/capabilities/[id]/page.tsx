import Link from "next/link";
import { notFound } from "next/navigation";
import { getCapabilityById } from "@/lib/api/capabilities";
import { DataQualityRulesPlayground } from "@/components/DataQualityRulesPlayground";

type CapabilityPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CapabilityPage({
  params,
}: CapabilityPageProps) {
  const { id } = await params;
  const capability = await getCapabilityById(id);

  if (!capability) {
    notFound();
  }

  return (
    <div className="min-h-screen text-zinc-950">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-8 lg:py-14">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span>Marketplace</span>
          <span aria-hidden="true">/</span>
          <span className="text-zinc-700">{capability.name}</span>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition-colors hover:text-indigo-800"
          >
            <span aria-hidden="true">{"<-"}</span>
            Back to marketplace
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
          <article className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5 sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
                {capability.type}
              </span>
              <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-700">
                {capability.category}
              </span>
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Prototype
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              {capability.name}
            </h1>

            <p className="mt-5 text-base leading-8 text-zinc-600 sm:text-lg">
              {capability.description}
            </p>

            <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Capability ID
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-900 sm:text-base">
                {capability.id}
              </p>
            </div>
          </article>

          <aside className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 sm:p-8">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
              Integration architecture
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Available through REST API for web and service clients, and through an MCP tool for AI assistants and agents.
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Both adapters reuse the same ExecutionService to keep validation and execution behavior consistent.
            </p>
            <div className="mt-5 space-y-2 text-sm text-zinc-700">
              <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">REST API adapter</p>
              <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">MCP tool adapter</p>
              <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">Deterministic execution core</p>
            </div>
          </aside>
        </div>

        {capability.id === "data-quality-rules" && (
          <section className="rounded-3xl border border-zinc-200 bg-white/80 p-2 shadow-sm ring-1 ring-zinc-950/5 sm:p-3">
            <DataQualityRulesPlayground capabilityId={capability.id} />
          </section>
        )}
      </main>
    </div>
  );
}