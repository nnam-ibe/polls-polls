import { getError } from "@/lib/error-handler";
import { RequestHandler } from "@/lib/types";
import { deletePoll, getPoll } from "@/services/polls";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const GET: RequestHandler<{ id: string }> = async (request, context) => {
  try {
    const poll = getPoll(context.params.id);
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
    const { userId } = getAuth(request);

    deletePoll(pollId, userId);

    return NextResponse.json({ message: "Poll deleted!" });
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
};
