type HealthResponse = {
  service: string;
  status: string;
  version: string;
};

async function getApiHealth(): Promise<HealthResponse | null> {
  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/v1/health",
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as HealthResponse;
  } catch {
    return null;
  }
}

export async function ApiStatus() {
  const health = await getApiHealth();
  const isHealthy = health?.status === "healthy";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm">
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
          isHealthy
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700"
        }`}
        aria-hidden="true"
      >
        {isHealthy ? "OK" : "!"}
      </span>

      <span className="font-medium text-zinc-700">
        API {isHealthy ? "Healthy" : "Unavailable"}
      </span>

      {health && <span className="text-zinc-500">v{health.version}</span>}
    </div>
  );
}