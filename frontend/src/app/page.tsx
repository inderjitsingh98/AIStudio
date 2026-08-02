import { CapabilityMarketplace } from "@/components/CapabilityMarketplace";
import { ApiStatus } from "@/components/ApiStatus";
import { getCapabilities } from "@/lib/api/capabilities";
import Link from "next/link";

export default async function Home() {
  const capabilities = await getCapabilities();

  return (
    <div className="min-h-screen text-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8 lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-indigo-600">
              CapabilityForge AI
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-700 sm:text-base">
              From natural-language intent to governed, executable AI capabilities.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ApiStatus />
            <nav
              aria-label="Primary"
              className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex"
            >
              <a href="#capabilities" className="transition-colors hover:text-zinc-950">
                Explore
              </a>
              <a href="#workflow" className="transition-colors hover:text-zinc-950">
                Workflow
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-indigo-50/60 shadow-sm ring-1 ring-zinc-950/5">
          <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)] lg:px-10 lg:py-12">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Enterprise capability prototype
              </p>
              <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                CapabilityForge AI
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
                Discover reusable AI capabilities that turn intent into governed execution. The Data Quality Rules slice generates structured recommendations, supports human review, and executes only approved rules through deterministic application logic.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-700">
                <span className="rounded-full border border-zinc-300 bg-white px-3 py-1">REST + MCP</span>
                <span className="rounded-full border border-zinc-300 bg-white px-3 py-1">Human-in-the-loop</span>
                <span className="rounded-full border border-zinc-300 bg-white px-3 py-1">Deterministic execution</span>
                <span className="rounded-full border border-zinc-300 bg-white px-3 py-1">Tested workflow</span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#capabilities"
                  className="rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800"
                >
                  Explore capabilities
                </a>
                <Link
                  href="/capabilities/data-quality-rules"
                  className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                >
                  Open Data Quality Rules
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm ring-1 ring-zinc-950/5">
              <p className="text-sm font-medium text-zinc-500">
                Marketplace overview
              </p>
              <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Available
                  </dt>
                  <dd className="mt-3 text-2xl font-semibold text-zinc-950">
                    {capabilities.length} capabilities
                  </dd>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Focus
                  </dt>
                  <dd className="mt-3 text-2xl font-semibold text-zinc-950">
                    Data trust
                  </dd>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Delivery
                  </dt>
                  <dd className="mt-3 text-2xl font-semibold text-zinc-950">
                    Curated launch
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section id="workflow" className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
            Lifecycle workflow
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 sm:text-base">
            Discover capability to scorecard outcome with explicit governance and deterministic execution controls.
          </p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              "Describe intent",
              "Generate rules",
              "Human review",
              "Execute safely",
              "Measure quality",
            ].map((step, index) => (
              <li key={step} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <CapabilityMarketplace capabilities={capabilities} />
      </main>
    </div>
  );
}
