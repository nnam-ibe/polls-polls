import { AppError, getError } from "@/lib/error-handler";
import prisma from "@/lib/prisma";
import { RequestHandler, SingleVoteSchema } from "@/lib/types";
import { NextResponse } from "next/server";

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

    if (poll.voteType !== "single") {
      throw new AppError("Only accepting single votes", 400);
    }
    // TODO:  coallate votes -----------------------------------------------------------------

    // const choice = poll.PollChoice.find(
    //   (choice) => choice.id === data.choiceId
    // );
    // if (!choice) {
    //   throw new AppError(`Invalid choice: ${data.choiceId}`, 400);
    // }

    // await prisma.singleVote.create({
    //   data: {
    //     pollId: data.pollId,
    //     pollChoiceId: data.choiceId,
    //     voterId: data.userId,
    //   },
    // });

    // return NextResponse.json({ message: "Vote casted" });
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
};

export { GET };
