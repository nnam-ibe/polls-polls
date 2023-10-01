import { db } from "@/db/index";
import {
  dbPollChoices,
  dbPolls,
  dbRankedVotes,
  dbSingleVotes,
} from "@/db/schema";
import { AppError } from "@/lib/error-handler";
import { eq } from "drizzle-orm";

export async function getPoll(id: string) {
  const poll = await db.query.dbPolls.findFirst({
    with: {
      PollChoices: true,
      SingleVotes: true,
      RankedVotes: true,
    },
    where: eq(dbPolls.id, id),
  });

  if (!poll) {
    throw new AppError("Poll not found", 400);
  }
  return poll;
}

export async function deletePoll(id: string, userId: string | null) {
  const poll = await db.query.dbPolls.findFirst({
    with: {
      PollChoices: true,
    },
    where: eq(dbPolls.id, id),
  });

  if (!poll) {
    throw new AppError("Poll not found", 400);
  }

  if (poll.deletedAt) {
    return true;
  }

  if (!poll.createdBy) {
    throw new AppError("Anonymous polls cannot be deleted", 400);
  }

  if (poll.createdBy !== userId) {
    throw new AppError("Poll can only be deleted the creator of the poll", 400);
  }

  const deletedDate = new Date();

  await db.transaction(async (tx) => {
    if (poll.voteType === "ranked") {
      await tx
        .update(dbRankedVotes)
        .set({
          deletedAt: deletedDate,
        })
        .where(eq(dbRankedVotes.pollId, id));
    } else {
      await tx
        .update(dbSingleVotes)
        .set({
          deletedAt: deletedDate,
        })
        .where(eq(dbSingleVotes.pollId, id));
    }

    await tx
      .update(dbPollChoices)
      .set({
        deletedAt: deletedDate,
      })
      .where(eq(dbPollChoices.pollId, id));

    await tx
      .update(dbPolls)
      .set({
        isActive: false,
        deletedAt: deletedDate,
      })
      .where(eq(dbPolls.id, id));
  });

  return true;
}
