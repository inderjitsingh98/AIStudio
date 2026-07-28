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
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isHealthy ? "bg-emerald-500" : "bg-red-500"
        }`}
        aria-hidden="true"
      />

      <span className="font-medium text-zinc-700">
        API: {isHealthy ? "Healthy" : "Unavailable"}
      </span>

      {health && (
        <span className="text-zinc-500">
          v{health.version}
        </span>
      )}
    </div>
  );
}