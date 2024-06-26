import { NextRequest } from "next/server";
import * as z from "zod";

type Context<T> = {
  params: T;
};

export type RequestHandler<T> = (
  request: NextRequest,
  context: Context<T>
) => Promise<Response>;

export const ApiErrorSchema = z.object({
  message: z
    .string()
    .optional()
    .transform((val) => val ?? "Internal Server Error"),
});
