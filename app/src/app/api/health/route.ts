import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/health — Health check endpoint.
 * Used by Docker healthcheck and Uptime Kuma.
 */
export async function GET() {
  try {
    // Verify DB connectivity
    await db.execute("SELECT 1");

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Database unreachable" },
      { status: 503 },
    );
  }
}
