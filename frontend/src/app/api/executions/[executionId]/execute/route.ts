import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    executionId: string;
  }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { executionId } = await params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "validation_error",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400 },
    );
  }

  const backendBaseUrl = process.env.BACKEND_API_URL ?? "http://127.0.0.1:5000";
  const backendUrl = `${backendBaseUrl}/api/v1/executions/${encodeURIComponent(executionId)}/execute`;

  try {
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const backendText = await backendResponse.text();
    let backendJson: unknown = {};

    if (backendText) {
      try {
        backendJson = JSON.parse(backendText);
      } catch {
        return NextResponse.json(
          {
            error: {
              code: "invalid_backend_response",
              message: "Backend returned a non-JSON response.",
            },
          },
          { status: 502 },
        );
      }
    }

    return NextResponse.json(backendJson, {
      status: backendResponse.status,
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "backend_unavailable",
          message: "Unable to reach backend service.",
        },
      },
      { status: 502 },
    );
  }
}