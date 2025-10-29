"use client";

import { useSearchContext } from "@/lib/hooks";

export default function SearchForm() {
  const { searchQuery, handleChangeSearchQuery } = useSearchContext();
  return (
    <form action="" className="w-full h-full">
      <input
        type="search"
        className="w-full h-full bg-white/20 rounded-md px-5 outline-none transition
      focus:bg-white/50 hover:bg-white/30 placeholder:text-white/50"
        placeholder="Search Pets"
        value={searchQuery}
        onChange={(e) => handleChangeSearchQuery(e.target.value)}
      />
    </form>
  );
}
