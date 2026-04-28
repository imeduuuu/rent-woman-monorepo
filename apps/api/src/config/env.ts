import { config } from "dotenv";
import { z } from "zod";

config();

const optionalUrl = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().url().optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  INTERNAL_API_KEY: z.string().min(8),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  SOCKET_AUTH_SECRET: z.string().min(8),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_S3_BUCKET: z.string(),
  AWS_S3_PUBLIC_BASE_URL: z.string().url(),
  AWS_REKOGNITION_MIN_CONFIDENCE: z.coerce.number().default(75),
  SUMSUB_BASE_URL: z.string().url(),
  SUMSUB_APP_TOKEN: z.string(),
  SUMSUB_SECRET_KEY: z.string(),
  SUMSUB_LEVEL_NAME: z.string(),
  RESEND_API_KEY: z.string(),
  RESEND_FROM_EMAIL: z.string().email(),
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_VERIFY_SERVICE_SID: z.string(),
  // Agentes n8n
  N8N_BASE_URL: z.string().url().optional(),
  AGENTS_INTERNAL_TOKEN: z.string().optional()
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  REDIS_URL: process.env.REDIS_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  SOCKET_AUTH_SECRET: process.env.SOCKET_AUTH_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_S3_PUBLIC_BASE_URL: process.env.AWS_S3_PUBLIC_BASE_URL,
  AWS_REKOGNITION_MIN_CONFIDENCE: process.env.AWS_REKOGNITION_MIN_CONFIDENCE,
  SUMSUB_BASE_URL: process.env.SUMSUB_BASE_URL,
  SUMSUB_APP_TOKEN: process.env.SUMSUB_APP_TOKEN,
  SUMSUB_SECRET_KEY: process.env.SUMSUB_SECRET_KEY,
  SUMSUB_LEVEL_NAME: process.env.SUMSUB_LEVEL_NAME,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID: process.env.TWILIO_VERIFY_SERVICE_SID,
  N8N_BASE_URL: process.env.N8N_BASE_URL,
  AGENTS_INTERNAL_TOKEN: process.env.AGENTS_INTERNAL_TOKEN
});
