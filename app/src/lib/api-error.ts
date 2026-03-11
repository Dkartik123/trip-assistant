import { NextResponse } from "next/server";

interface ErrorBody {
  error: string;
  details?: unknown;
}

export function apiError(status: number, message: string, details?: unknown) {
  const body: ErrorBody = { error: message };
  if (details) body.details = details;
  return NextResponse.json(body, { status });
}

export function badRequest(message: string, details?: unknown) {
  return apiError(400, message, details);
}

export function notFound(message = "Not found") {
  return apiError(404, message);
}

export function serverError(message = "Internal server error") {
  return apiError(500, message);
}
