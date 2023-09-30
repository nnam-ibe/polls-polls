import { db } from "@/db/index";
import { dbPolls } from "@/db/schema";
import { AppError } from "@/lib/error-handler";
import { eq } from "drizzle-orm";
import { calculateRankedResult, calculateSingleResult } from "./collate-votes";

export async function getPollResult(id: string) {
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

  const result =
    poll.voteType === "ranked"
      ? calculateRankedResult(poll)
      : calculateSingleResult(poll);

  return { poll, result };
}
