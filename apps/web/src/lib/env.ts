import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url(),
  INTERNAL_API_KEY: z.string().min(8),
  SOCKET_AUTH_SECRET: z.string().min(8),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_PRICE_PREMIUM_MONTHLY: z.string(),
  STRIPE_PRICE_ELITE_MONTHLY: z.string(),
  STRIPE_PRICE_ONE_TIME_SPOTLIGHT: z.string(),
  N8N_BASE_URL: z.string().url().optional(),
  AGENTS_INTERNAL_TOKEN: z.string().optional()
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
  SOCKET_AUTH_SECRET: process.env.SOCKET_AUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PRICE_PREMIUM_MONTHLY: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
  STRIPE_PRICE_ELITE_MONTHLY: process.env.STRIPE_PRICE_ELITE_MONTHLY,
  STRIPE_PRICE_ONE_TIME_SPOTLIGHT: process.env.STRIPE_PRICE_ONE_TIME_SPOTLIGHT,
  N8N_BASE_URL: process.env.N8N_BASE_URL,
  AGENTS_INTERNAL_TOKEN: process.env.AGENTS_INTERNAL_TOKEN
});
