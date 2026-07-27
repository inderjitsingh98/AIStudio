"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SkillCard } from "@/components/SkillCard";

type Capability = {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
};

type CapabilityMarketplaceProps = {
  capabilities: Capability[];
};

export function CapabilityMarketplace({
  capabilities,
}: CapabilityMarketplaceProps) {
  const [searchText, setSearchText] = useState("");

  const query = searchText.trim().toLowerCase();
  const filteredCapabilities = query
    ? capabilities.filter((capability) =>
        [
          capability.name,
          capability.description,
          capability.type,
          capability.category,
        ].some((value) => value.toLowerCase().includes(query)),
      )
    : capabilities;

  return (
    <section id="capabilities" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Capability marketplace
          </h2>
          <p className="mt-2 text-base leading-7 text-zinc-600">
            A focused catalog of reusable AI building blocks for data quality and lineage teams.
          </p>
        </div>

        <div className="w-full max-w-xl">
          <SearchBar value={searchText} onChange={setSearchText} />
        </div>
      </div>

      {filteredCapabilities.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCapabilities.map((capability) => (
            <SkillCard
              key={capability.id}
              type={capability.type}
              category={capability.category}
              name={capability.name}
              description={capability.description}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-10 text-center shadow-sm ring-1 ring-zinc-950/5">
          <p className="text-lg font-semibold tracking-tight text-zinc-950">
            No capabilities match your search.
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600 sm:text-base">
            Try another term across capability names, descriptions, types, or categories.
          </p>
        </div>
      )}
    </section>
  );
}