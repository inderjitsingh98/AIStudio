import Link from "next/link";
import { notFound } from "next/navigation";
import { capabilities } from "@/data/capabilities";

type CapabilityPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CapabilityPage({
  params,
}: CapabilityPageProps) {
  const { id } = await params;
  const capability = capabilities.find((item) => item.id === id);

  if (!capability) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 sm:px-8 lg:py-14">
        <div>
          <Link
            href="/"
            className="text-sm font-semibold text-indigo-700 transition-colors hover:text-indigo-800"
          >
            Back to marketplace
          </Link>
        </div>

        <article className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <span className="inline-flex w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
              {capability.type}
            </span>
            <p className="text-sm font-medium text-zinc-500">
              {capability.category}
            </p>
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
      </main>
    </div>
  );
}