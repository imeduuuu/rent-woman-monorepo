import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { env } from "@/lib/env";

export async function GET(): Promise<Response> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expiresAt = Date.now() + 1000 * 60 * 15;
  const payload = `${session.user.id}:${expiresAt}`;
  const token = crypto.createHmac("sha256", env.SOCKET_AUTH_SECRET).update(payload).digest("hex");

  return NextResponse.json({
    userId: session.user.id,
    token,
    expiresAt
  });
}
