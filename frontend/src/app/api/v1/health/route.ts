import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "trusted-data-ai-api",
    status: "healthy",
    version: "1.0.0",
  });
}