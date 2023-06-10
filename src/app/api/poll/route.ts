import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";
import { fromZodError } from "zod-validation-error";
import { APIPollSchema, APIPollChoiceSchema } from "@/lib/types";

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return new Response(JSON.stringify({ errors: validationError }), {
        status: 422,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response("Invalid request", { status: 400 });
  }
}
