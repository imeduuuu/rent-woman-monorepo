import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { env } from "@/lib/env";

const schema = z.object({
  message: z.string().min(1).max(2000)
});

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/support/message`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-api-key": env.INTERNAL_API_KEY
      },
      body: JSON.stringify({
        userId: session.user.id,
        email: session.user.email,
        message: body.data.message,
        channel: "chat"
      })
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { data: { success: true, response: "Tu mensaje ha sido recibido. Un agente te responderá pronto." }, error: null },
      { status: 200 }
    );
  }
}
