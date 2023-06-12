import { getError } from "@/lib/error-handler";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const polls = await prisma.poll.findMany({
      where: {
        isActive: true,
      },
    });
    return NextResponse.json(polls);
  } catch (err) {
    const error = getError(err);
    return NextResponse.json(
      { message: error.message },
      { status: error.status }
    );
  }
}
