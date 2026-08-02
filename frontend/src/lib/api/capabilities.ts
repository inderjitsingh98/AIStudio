import { capabilities as fallbackCapabilities } from "@/data/capabilities";

export type Capability = {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
};

type CapabilitiesResponse = {
  capabilities: Capability[];
};

const API_BASE_URL =
  process.env.BACKEND_API_URL ?? "http://127.0.0.1:5000";

export async function getCapabilities(): Promise<Capability[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/capabilities`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        `Capability API request failed with status ${response.status}`,
      );
    }

    const payload =
      (await response.json()) as CapabilitiesResponse;

    return payload.capabilities;
  } catch (error) {
    console.warn(
      "Capability API unavailable. Falling back to local catalogue.",
      error,
    );
    return fallbackCapabilities;
  }
}

type CapabilityResponse = {
  capability: Capability;
};

export async function getCapabilityById(
  id: string,
): Promise<Capability | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/capabilities/${encodeURIComponent(id)}`,
      {
        cache: "no-store",
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        `Capability API request failed with status ${response.status}`,
      );
    }

    const payload =
      (await response.json()) as CapabilityResponse;

    return payload.capability;
  } catch (error) {
    console.warn(
      "Capability API unavailable. Falling back to local catalogue.",
      error,
    );
    return (
      fallbackCapabilities.find((capability) => capability.id === id)
      ?? null
    );
  }
}

