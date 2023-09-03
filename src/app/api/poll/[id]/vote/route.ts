import { db } from "@/db/index";
import { dbPolls, dbRankedVotes, dbSingleVotes } from "@/db/schema";
import { AppError, getError } from "@/lib/error-handler";
import {
  RankedVoteInsertSchema,
  RequestHandler,
  SingleVoteInsertSchema,
} from "@/lib/types";
import type { PollWChoices } from "@/lib/types/poll";
import { getAuth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type HandleVoteProps = {
  poll: PollWChoices;
  body: unknown;
  userId: string | null;
};

async function handleSingleVote(props: HandleVoteProps) {
  const { poll, body, userId } = props;
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
    voterId: userId,
  });
}

async function handleRankedVote(props: HandleVoteProps) {
  const { poll, body, userId } = props;
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
      voterId: userId,
    });
  });

  return Promise.all(promises);
}

export const POST: RequestHandler<{ id: string }> = async (
  request,
  context
) => {
  try {
    const { userId } = getAuth(request);
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

    const voteProps = { poll, body, userId };
    if (poll.voteType === "single") {
      await handleSingleVote(voteProps);
    } else {
      await handleRankedVote(voteProps);
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
