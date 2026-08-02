import { CapabilityMarketplace } from "@/components/CapabilityMarketplace";
import { ApiStatus } from "@/components/ApiStatus";
import { getCapabilities } from "@/lib/api/capabilities";

export default async function Home() {
  const capabilities = await getCapabilities();

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
              CapabilityForge AI
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">
              From natural-language intent to governed, executable AI capabilities.
            </p>
          </div>

<ApiStatus />
          <nav aria-label="Primary" className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex">
            <a href="#capabilities" className="transition-colors hover:text-zinc-950">
              Explore
            </a>
            <a href="#capabilities" className="transition-colors hover:text-zinc-950">
              My Capabilities
            </a>
            <a href="#capabilities" className="transition-colors hover:text-zinc-950">
              Runs
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-indigo-50/70">
          <div className="grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] lg:px-10 lg:py-12">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Enterprise capability prototype
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
                Governed AI capabilities from intent to deterministic execution.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
                The first vertical slice is Data Quality Rules: AI proposes structured candidate rules from natural-language requirements, a human approves or rejects them, and a deterministic engine executes only approved rules with a traceable scorecard. The same capability is available through REST for the web app and MCP for AI clients.
              </p>
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

        <CapabilityMarketplace capabilities={capabilities} />
      </main>
    </div>
  );
}
