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
  } catch (error) {
    return new Response("Invalid request", { status: 400 });
  }
}
