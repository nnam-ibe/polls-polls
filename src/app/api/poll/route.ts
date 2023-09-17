import { db } from "@/db/index";
import { dbPollChoices, dbPolls } from "@/db/schema";
import { getError } from "@/lib/error-handler";
import { PollChoiceInsertSchema, PollInsertSchema } from "@/lib/types";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    const body = await request.json();
    const pollData = PollInsertSchema.parse(body);
    pollData.createdBy = userId;
    let pollId: string | undefined;

    await db.transaction(async (tx) => {
      const result = await tx.insert(dbPolls).values(pollData).returning();
      const poll = result[0];

      const choices = Array.from(body.choices, (choice) =>
        PollChoiceInsertSchema.parse({
          title: choice,
          pollId: poll.id,
          createdBy: userId,
        })
      );

      await tx.insert(dbPollChoices).values(choices);
      pollId = poll.id;
    });

    return NextResponse.json({ message: "Poll Created", id: pollId });
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}
