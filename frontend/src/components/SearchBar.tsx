"use client";

import { useState } from "react";

export function SearchBar() {
  const [searchText, setSearchText] = useState("");

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm ring-1 ring-zinc-950/5 sm:p-5">
      <label
        htmlFor="skill-search"
        className="mb-2 block text-sm font-medium text-zinc-700"
      >
        Search capabilities
      </label>

      <input
        id="skill-search"
        type="search"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        placeholder="Search skills, agents, and applications"
        className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none ring-0 transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
      />

      <p className="mt-3 text-sm text-zinc-500">
        Current search: {searchText || "None"}
      </p>
    </div>
  );
}