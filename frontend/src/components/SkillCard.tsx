type SkillCardProps = {
  type: string;
  category: string;
  name: string;
  description: string;
};

export function SkillCard({
  type,
  category,
  name,
  description,
}: SkillCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 transition-colors sm:p-6">
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

      <p className="mt-6 text-sm font-semibold text-indigo-700">
        Open capability
      </p>
    </article>
  );
}