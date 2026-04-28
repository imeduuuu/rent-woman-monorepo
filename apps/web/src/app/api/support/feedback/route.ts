import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { env } from "@/lib/env";

const schema = z.object({
  caseId: z.string().min(1),
  messageId: z.string().min(1),
  rating: z.enum(["positive", "negative"]),
  comment: z.string().max(500).optional()
});

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/support/feedback`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-api-key": env.INTERNAL_API_KEY
      },
      body: JSON.stringify({ ...body.data, userId: session.user.id })
    });
  } catch {
    // silencioso
  }

  return NextResponse.json({ data: { received: true }, error: null });
}
