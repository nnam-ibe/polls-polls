import { db } from "@/db/index";
import { dbPollChoices, dbPolls } from "@/db/schema";
import { getError } from "@/lib/error-handler";
import { PollChoiceInsertSchema, PollInsertSchema } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pollData = PollInsertSchema.parse(body);
    const result = await db.insert(dbPolls).values(pollData).returning();
    const poll = result[0];

    const choices = Array.from(body.choices, (choice) =>
      PollChoiceInsertSchema.parse({
        title: choice,
        pollId: poll.id,
      })
    );

    await db.insert(dbPollChoices).values(choices);

    return NextResponse.json({ message: "Poll Created", id: poll.id });
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}
