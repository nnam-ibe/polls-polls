import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}
const connection = postgres(process.env.DATABASE_URL, {
  max: 1,
});

export const db = drizzle(connection, {
  schema,
});
