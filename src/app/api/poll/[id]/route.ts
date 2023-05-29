import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, context) {
  try {
    const pollId = context.params.id;

    const poll = await prisma.poll.findUniqueOrThrow({
      where: { id: pollId },
      include: { PollChoice: true },
    });

    return NextResponse.json(poll);
  } catch (error) {
    return new Response("Invalid request", { status: 400 });
  }
}
