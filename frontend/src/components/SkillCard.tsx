type SkillCardProps = {
  name: string;
  description: string;
};

export function SkillCard({
  name,
  description,
}: SkillCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm ring-1 ring-zinc-950/5 sm:p-6">
      <h2 className="text-xl font-semibold text-zinc-900">
        {name}
      </h2>

      <p className="mt-2 text-zinc-600">
        {description}
      </p>
    </article>
  );
}