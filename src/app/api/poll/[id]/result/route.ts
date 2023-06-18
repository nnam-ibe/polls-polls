import { AppError, getError } from "@/lib/error-handler";
import prisma from "@/lib/prisma";
import { RequestHandler, SingleVoteSchema } from "@/lib/types";
import { NextResponse } from "next/server";
import { rankedResult, singleResult } from "./collate-votes";

let GET: RequestHandler<{ id: string }>;
GET = async (request, context) => {
  try {
    const pollId = context.params.id;
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { PollChoice: true, SingleVote: true, RankedVote: true },
    });
    if (!poll) {
      throw new AppError("Poll not found", 400);
    }

    const result =
      poll.voteType === "ranked" ? rankedResult(poll) : singleResult(poll);

    return NextResponse.json(result);
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
};

export { GET };
