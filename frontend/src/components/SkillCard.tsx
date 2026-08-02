import Link from "next/link";
import type { Capability } from "@/data/capabilities";

type SkillCardProps = Pick<
  Capability,
  "id" | "type" | "category" | "name" | "description"
>;

export function SkillCard({
  id,
  type,
  category,
  name,
  description,
}: SkillCardProps) {
  const isDataQualityRules = id === "data-quality-rules";

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 transition duration-200 hover:border-zinc-300 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
          {type}
        </span>
        <p className="text-sm font-medium text-zinc-500">
          {category}
        </p>
      </div>

      <h2 className="mt-6 text-xl font-semibold tracking-tight text-zinc-900">
        {name}
      </h2>

      <p className="mt-3 text-sm leading-7 text-zinc-600 sm:text-base">
        {description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
          Prototype
        </span>
        <span className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
          Reusable
        </span>
        {isDataQualityRules && (
          <>
            <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              REST
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              MCP
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              Human approval
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              Executable
            </span>
          </>
        )}
      </div>

      <Link
        href={`/capabilities/${id}`}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-800 focus-visible:rounded-md"
      >
        Open capability
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
          {"->"}
        </span>
      </Link>
    </article>
  );
}