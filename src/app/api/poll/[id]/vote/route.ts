import { db } from "@/db/index";
import { dbPolls, dbSingleVotes } from "@/db/schema";
import { AppError, getError } from "@/lib/error-handler";
import { RequestHandler, SingleVoteInsertSchema } from "@/lib/types";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

let POST: RequestHandler<{ id: string }>;
POST = async (request, context) => {
  try {
    const body = await request.json();
    const data = SingleVoteInsertSchema.parse(body);
    if (data.pollId !== context.params.id) {
      throw new AppError("Invalid poll id", 400);
    }

    const poll = await db.query.dbPolls.findFirst({
      with: {
        PollChoices: true,
      },
      where: eq(dbPolls.id, data.pollId),
    });

    if (!poll) {
      throw new AppError("Poll not found", 400);
    }

    if (poll.voteType !== "single") {
      throw new AppError("Only accepting single votes", 400);
    }

    const choice = poll.PollChoices.find(
      (choice) => choice.id === data.pollChoiceId
    );
    if (!choice) {
      throw new AppError(`Invalid choice: ${data.pollChoiceId}`, 400);
    }

    await db.insert(dbSingleVotes).values({
      pollId: data.pollId,
      pollChoiceId: data.pollChoiceId,
      voterId: data.voterId,
    });

    return NextResponse.json({ message: "Vote casted" });
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
};

export { POST };
