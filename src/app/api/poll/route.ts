import { getError } from "@/lib/error-handler";
import prisma from "@/lib/prisma";
import { APIPollChoiceSchema, APIPollSchema } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pollData = APIPollSchema.parse(body);
    const poll = await prisma.poll.create({ data: pollData });

    const choices = Array.from(body.choices, (choice) =>
      APIPollChoiceSchema.parse({
        title: choice,
        pollId: poll.id,
      })
    );

    await prisma.pollChoice.createMany({ data: choices });

    return NextResponse.json({ message: "Poll Created", id: poll.id });
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}
