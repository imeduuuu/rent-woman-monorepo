import crypto from "node:crypto";

import { prisma } from "@repo/db";
import type { SumsubAccessTokenResponse } from "@repo/types";


import { env } from "../config/env";

interface GenerateAccessTokenInput {
  userId: string;
  email: string;
  phone?: string;
  levelName?: string;
}

function buildSignedHeaders(method: string, path: string, body: string, timestamp: string): HeadersInit {
  const signaturePayload = `${timestamp}${method.toUpperCase()}${path}${body}`;
  const signature = crypto.createHmac("sha256", env.SUMSUB_SECRET_KEY).update(signaturePayload).digest("hex");

  return {
    "content-type": "application/json",
    "X-App-Token": env.SUMSUB_APP_TOKEN,
    "X-App-Access-Sig": signature,
    "X-App-Access-Ts": timestamp
  };
}

export async function generateSumsubAccessToken(
  input: GenerateAccessTokenInput
): Promise<SumsubAccessTokenResponse> {
  const path = "/resources/accessTokens/sdk";
  const body = JSON.stringify({
    userId: input.userId,
    levelName: input.levelName ?? env.SUMSUB_LEVEL_NAME,
    ttlInSecs: 600,
    applicantIdentifiers: {
      email: input.email,
      ...(input.phone ? { phone: input.phone } : {})
    }
  });

  const timestamp = Math.floor(Date.now() / 1000).toString();

  const response = await fetch(`${env.SUMSUB_BASE_URL}${path}`, {
    method: "POST",
    headers: buildSignedHeaders("POST", path, body, timestamp),
    body
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sumsub access token request failed: ${errorText}`);
  }

  const data = (await response.json()) as { token: string };

  await prisma.kycVerification.upsert({
    where: {
      userId: input.userId
    },
    update: {
      status: "PENDING"
    },
    create: {
      userId: input.userId,
      status: "PENDING"
    }
  }).catch(async () => {
    await prisma.kycVerification.create({
      data: {
        userId: input.userId,
        status: "PENDING"
      }
    });
  });

  return {
    token: data.token,
    userId: input.userId,
    levelName: input.levelName ?? env.SUMSUB_LEVEL_NAME
  };
}
