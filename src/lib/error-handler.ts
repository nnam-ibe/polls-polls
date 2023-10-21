import * as z from "zod";
import { fromZodError } from "zod-validation-error";

export class AppError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof z.ZodError) {
    const validationError = fromZodError(error);
    return new AppError(validationError.message, 400);
  }
  if (error instanceof SyntaxError && error.message.includes("JSON")) {
    return new AppError("Malformed JSON", 400);
  }
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "PostgresError" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.includes("invalid input syntax for type uuid")
  ) {
    return new AppError("Invalid id", 400);
  }

  return new AppError("Internal Server Error", 500);
}
