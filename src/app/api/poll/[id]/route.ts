import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GetFunc } from "@/lib/types";

export const GET: GetFunc<{ id: string }> = async (request, context) => {
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
};
