import { AppError, getError } from "@/lib/error-handler";
import prisma from "@/lib/prisma";
import { RequestHandler, SingleVoteSchema } from "@/lib/types";
import { NextResponse } from "next/server";

let POST: RequestHandler<{ id: string }>;
POST = async (request, context) => {
  try {
    const body = await request.json();
    const data = SingleVoteSchema.parse(body);
    if (data.pollId !== context.params.id) {
      throw new AppError("Invalid poll id", 400);
    }

    const poll = await prisma.poll.findUnique({
      where: { id: data.pollId },
      include: { PollChoice: true },
    });
    if (!poll) {
      throw new AppError("Poll not found", 400);
    }

    if (poll.voteType !== "single") {
      throw new AppError("Only accepting single votes", 400);
    }

    const choice = poll.PollChoice.find(
      (choice) => choice.id === data.choiceId
    );
    if (!choice) {
      throw new AppError(`Invalid choice: ${data.choiceId}`, 400);
    }

    await prisma.singleVote.create({
      data: {
        pollId: data.pollId,
        pollChoiceId: data.choiceId,
        voterId: data.userId,
      },
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
