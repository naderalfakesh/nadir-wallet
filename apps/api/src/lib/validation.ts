import type { z } from "zod";
import { badRequest } from "./errors";

export function parseOrThrow<T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw badRequest("Request validation failed", result.error.flatten());
  }
  return result.data;
}
