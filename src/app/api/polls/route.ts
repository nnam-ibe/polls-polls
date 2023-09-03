import { db } from "@/db/index";
import { dbPolls } from "@/db/schema";
import { getError } from "@/lib/error-handler";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = new URLSearchParams(url.searchParams);

    let whereClause = and(
      eq(dbPolls.isActive, true),
      isNull(dbPolls.deletedAt)
    );
    if (params.has("isClosed")) {
      whereClause = and(
        whereClause,
        eq(dbPolls.isClosed, params.get("isClosed") === "true")
      );
    }
    const polls = await db.query.dbPolls.findMany({
      where: whereClause,
    });
    return NextResponse.json(polls);
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}
