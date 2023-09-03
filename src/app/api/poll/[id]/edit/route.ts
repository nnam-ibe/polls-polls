import { db } from "@/db/index";
import { dbPollChoices, dbPolls } from "@/db/schema";
import { AppError, getError } from "@/lib/error-handler";
import { RequestHandler } from "@/lib/types";
import { PollChoicesUpdateSchema, PollUpdateSchema } from "@/lib/types/poll";
import { getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type PollChoiceUpdate = {
  id: string;
  title: string;
  updatedAt?: Date;
};

export const POST: RequestHandler<{ id: string }> = async (
  request,
  context
) => {
  try {
    const pollId = context.params.id;
    const poll = await db.query.dbPolls.findFirst({
      with: {
        PollChoices: true,
      },
      where: eq(dbPolls.id, pollId),
    });

    if (!poll) {
      throw new AppError("Poll not found", 400);
    }

    if (!poll.createdBy) {
      throw new AppError("Anonymous polls cannot be edited", 400);
    }

    const { userId } = getAuth(request);
    if (poll.createdBy !== userId) {
      throw new AppError("Only the creator of the poll can edit", 400);
    }

    const body = await request.json();
    const pollData = PollUpdateSchema.parse(body);
    pollData.updatedAt = new Date();
    await db.update(dbPolls).set(pollData).where(eq(dbPolls.id, pollId));

    const choicesData = PollChoicesUpdateSchema.parse(body.choices);

    const newChoices: string[] = [];
    const existingChoices: PollChoiceUpdate[] = [];
    choicesData.forEach((choice) => {
      if (choice.id) {
        existingChoices.push(choice as PollChoiceUpdate);
      } else {
        newChoices.push(choice.title);
      }
    });

    const updates = existingChoices.map(async (choice) => {
      choice.updatedAt = new Date();
      return db
        .update(dbPollChoices)
        .set(choice)
        .where(eq(dbPollChoices.id, choice.id));
    });

    if (newChoices.length > 0) {
      const insertPollChoicesData = newChoices.map((choice) => ({
        title: choice,
        pollId,
        createdBy: userId,
        updatedAt: new Date(),
      }));
      updates.push(db.insert(dbPollChoices).values(insertPollChoicesData));
    }
    await Promise.all(updates);

    return NextResponse.json({ message: "All done all done" });
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
};
