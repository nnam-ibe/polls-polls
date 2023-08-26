import { db } from "@/db/index";
import { dbPolls } from "@/db/schema";
import { getError } from "@/lib/error-handler";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const polls = await db.query.dbPolls.findMany({
      where: eq(dbPolls.isActive, true),
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
