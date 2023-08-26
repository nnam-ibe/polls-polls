import { db } from "@/db/index";
import { dbPolls, dbRankedVotes, dbSingleVotes } from "@/db/schema";
import { AppError, getError } from "@/lib/error-handler";
import {
  RankedVoteInsertSchema,
  RequestHandler,
  SingleVoteInsertSchema,
} from "@/lib/types";
import type { PollWChoices } from "@/lib/types/poll";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

let POST: RequestHandler<{ id: string }>;

async function handleSingleVote(poll: PollWChoices, body: unknown) {
  const data = SingleVoteInsertSchema.parse(body);
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
}

async function handleRankedVote(poll: PollWChoices, body: unknown) {
  const voteId = randomUUID();
  const data = RankedVoteInsertSchema.parse(body);

  const promises = data.ranking.map(async (choiceId, index) => {
    const choice = poll.PollChoices.find((choice) => choice.id === choiceId);
    if (!choice) {
      throw new AppError(`Invalid choice: ${choiceId}`, 400);
    }

    await db.insert(dbRankedVotes).values({
      pollId: data.pollId,
      pollChoiceId: choiceId,
      rank: index + 1,
      VoteId: voteId,
    });
  });

  return Promise.all(promises);
}

POST = async (request, context) => {
  try {
    const body = await request.json();

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

    if (poll.voteType === "single") {
      await handleSingleVote(poll, body);
    } else {
      await handleRankedVote(poll, body);
    }

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
