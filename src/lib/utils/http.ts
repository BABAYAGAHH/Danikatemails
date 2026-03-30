import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export async function parseJsonBody<T>(request: NextRequest, parser: (value: unknown) => T) {
  const body = await request.json().catch(() => {
    throw new ApiError(400, "Invalid JSON body");
  });

  return parser(body);
}

export function getRequestIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function jsonOk(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        details: error.details
      },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed",
        details: error.flatten()
      },
      { status: 400 }
    );
  }

  const message = error instanceof Error ? error.message : "Internal server error";

  return NextResponse.json(
    {
      ok: false,
      error: message
    },
    { status: 500 }
  );
}
