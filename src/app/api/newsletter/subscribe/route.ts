import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { newsletterRateLimit, rateLimit } from "@/lib/rate-limit";

const subscribeSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const { success } = await rateLimit(newsletterRateLimit, ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    await prisma.emailSubscriber.upsert({
      where: { email },
      update: {},
      create: { email, source: "website" },
    });

    return NextResponse.json({
      message: "You've been subscribed! Thank you for joining the VirasatJewels community.",
    });
  } catch (error) {
    console.error("[newsletter/subscribe]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
