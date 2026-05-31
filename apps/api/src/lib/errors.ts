import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiErrorResponse } from "@nadir-wallet/types";

export class ApiError extends Error {
  readonly status: ContentfulStatusCode;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: ContentfulStatusCode, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown): ApiError {
  return new ApiError(400, "bad_request", message, details);
}

export function handleError(err: unknown, c: Context) {
  if (err instanceof ApiError) {
    const body: ApiErrorResponse = {
      error: { code: err.code, message: err.message, details: err.details },
    };
    return c.json(body, err.status);
  }

  console.error("Unhandled API error", err);
  const body: ApiErrorResponse = {
    error: { code: "internal_error", message: "Something went wrong" },
  };
  return c.json(body, 500);
}
