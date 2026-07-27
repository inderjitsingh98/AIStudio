"use client";

import { useState } from "react";

export function SearchBar() {
  const [searchText, setSearchText] = useState("");

  return (
    <div className="w-full">
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
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none"
      />

      <p className="mt-2 text-sm text-zinc-500">
        Current search: {searchText || "None"}
      </p>
    </div>
  );
}