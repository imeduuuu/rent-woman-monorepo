import crypto from "node:crypto";

import { env } from "../config/env";

export function signSocketToken(userId: string, expiresAt: number): string {
  return crypto.createHmac("sha256", env.SOCKET_AUTH_SECRET).update(`${userId}:${expiresAt}`).digest("hex");
}

export function verifySocketToken(userId: string, expiresAt: number, token: string): boolean {
  if (Date.now() > expiresAt) {
    return false;
  }

  const expectedToken = signSocketToken(userId, expiresAt);

  if (expectedToken.length !== token.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expectedToken), Buffer.from(token));
}
