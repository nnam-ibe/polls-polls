import { db } from "@/db/index";
import { dbPolls } from "@/db/schema";
import type { PollQuery } from "@/lib/types";
import { and, eq, isNull } from "drizzle-orm";

export async function fetchPolls(parameters: PollQuery) {
  let whereClause = and(eq(dbPolls.isActive, true), isNull(dbPolls.deletedAt));
  if ("isClosed" in parameters && parameters.isClosed !== undefined) {
    whereClause = and(whereClause, eq(dbPolls.isClosed, parameters.isClosed));
  }
  const polls = await db.query.dbPolls.findMany({
    where: whereClause,
  });
  return polls;
}
