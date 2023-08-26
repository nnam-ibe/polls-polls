import { db } from "@/db/index";
import { dbPolls } from "@/db/schema";
import { AppError, getError } from "@/lib/error-handler";
import { RequestHandler } from "@/lib/types";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { calculateRankedResult, calculateSingleResult } from "./collate-votes";

let GET: RequestHandler<{ id: string }>;
GET = async (request, context) => {
  try {
    const pollId = context.params.id;
    const poll = await db.query.dbPolls.findFirst({
      with: {
        PollChoices: true,
        SingleVotes: true,
        RankedVotes: true,
      },
      where: eq(dbPolls.id, pollId),
    });

    if (!poll) {
      throw new AppError("Poll not found", 400);
    }

    const result =
      poll.voteType === "ranked"
        ? calculateRankedResult(poll)
        : calculateSingleResult(poll);

    return NextResponse.json({ result, poll });
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
};

export { GET };
