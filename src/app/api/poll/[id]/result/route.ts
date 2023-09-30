import { getError } from "@/lib/error-handler";
import { RequestHandler } from "@/lib/types";
import { getPollResult } from "@/services/polls/result";
import { NextResponse } from "next/server";

export const GET: RequestHandler<{ id: string }> = async (request, context) => {
  try {
    const data = getPollResult(context.params.id);
    return NextResponse.json(data);
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
};
