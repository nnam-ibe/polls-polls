import { db } from "@/db/index";
import {
  dbPollChoices,
  dbPolls,
  dbRankedVotes,
  dbSingleVotes,
} from "@/db/schema";
import { AppError, getError } from "@/lib/error-handler";
import { RequestHandler } from "@/lib/types";
import { getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET: RequestHandler<{ id: string }> = async (request, context) => {
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

    return NextResponse.json(poll);
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
};

export const DELETE: RequestHandler<{ id: string }> = async (
  request,
  context
) => {
  try {
    const pollId = context.params.id;
    const poll = await db.query.dbPolls.findFirst({
      with: {
        PollChoices: true,
      },
      where: eq(dbPolls.id, pollId),
    });

    if (!poll) {
      throw new AppError("Poll not found", 400);
    }

    if (poll.deletedAt) {
      return NextResponse.json({ message: "Poll already deleted!" });
    }

    if (!poll.createdBy) {
      throw new AppError("Anonymous polls cannot be deleted", 400);
    }

    const { userId } = getAuth(request);
    if (poll.createdBy !== userId) {
      throw new AppError(
        "Poll can only be deleted the creator of the poll",
        400
      );
    }

    const deletedDate = new Date();

    if (poll.voteType === "ranked") {
      await db
        .update(dbRankedVotes)
        .set({
          deletedAt: deletedDate,
        })
        .where(eq(dbRankedVotes.pollId, pollId));
    } else {
      await db
        .update(dbSingleVotes)
        .set({
          deletedAt: deletedDate,
        })
        .where(eq(dbSingleVotes.pollId, pollId));
    }

    await db
      .update(dbPollChoices)
      .set({
        deletedAt: deletedDate,
      })
      .where(eq(dbPollChoices.pollId, pollId));

    await db
      .update(dbPolls)
      .set({
        isActive: false,
        deletedAt: deletedDate,
      })
      .where(eq(dbPolls.id, pollId));

    return NextResponse.json({ message: "Poll deleted!" });
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
};
