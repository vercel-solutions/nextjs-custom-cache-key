import { cacheKey } from "@/caching";

export const dynamic = "error";

type Params = Promise<{ cachekey: string }>;

export default async function Home(props: { params: Params }) {
  const params = await props.params;
  console.log("PARAMS", params);
  const { searchParams, headers, cookies } = cacheKey(params.cachekey);

  console.log("S:", searchParams);
  console.log("H:", headers);
  console.log("C:", cookies);

  // Simulate a slow page render.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const now = new Date();
  const formattedTime = now.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="text-center">
        <h1 className="text-4xl font-bold mb-4">Server Time</h1>
        <div className="text-xl p-6 rounded-lg bg-black/[.05] dark:bg-white/[.06] font-[family-name:var(--font-geist-mono)]">
          {formattedTime}
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          If the page is cached the time won't update with a refresh.
        </p>
      </main>
    </div>
  );
}
