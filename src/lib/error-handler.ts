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

  return new AppError("Internal Server Error", 500);
}
