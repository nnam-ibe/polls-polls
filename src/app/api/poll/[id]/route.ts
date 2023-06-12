import { AppError, getError } from "@/lib/error-handler";
import prisma from "@/lib/prisma";
import { RequestHandler } from "@/lib/types";
import { NextResponse } from "next/server";

export const GET: RequestHandler<{ id: string }> = async (request, context) => {
  try {
    const pollId = context.params.id;

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { PollChoice: true },
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
