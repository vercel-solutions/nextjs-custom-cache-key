"use client";

import { useSearchParams } from "next/navigation";

export default function ClientComp() {
  const searchParams = useSearchParams();

  // Log each search parameter
  for (const [key, value] of searchParams.entries()) {
    console.log(`Search param - ${key}:`, value);
  }

  const paramEntries = Array.from(searchParams.entries());

  return (
    <div className="mt-12 text-center">
      <h2 className="text-4xl font-bold mb-4">Search Parameters</h2>
      {paramEntries.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No search parameters found
        </p>
      ) : (
        <ul className="space-y-2">
          {paramEntries.map(([key, value]) => (
            <li
              key={key}
              className="p-6 rounded-lg bg-black/[.05] dark:bg-white/[.06] font-[family-name:var(--font-geist-mono)]"
            >
              <span className="font-semibold">{key}:</span> {value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
