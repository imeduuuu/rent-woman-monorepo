import { Redis as UpstashRedis } from "@upstash/redis";
import IORedis from "ioredis";

import { env } from "../config/env";

type CacheValue = string | number | boolean | object | null;

const upstash = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
  ? new UpstashRedis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN
    })
  : null;

const redis = env.REDIS_URL
  ? new IORedis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1
    })
  : null;

redis?.on("error", (error) => {
  console.error("Redis cache unavailable:", error.message);
});

export async function cacheSet(key: string, value: CacheValue, ttlSeconds = 60): Promise<void> {
  const payload = typeof value === "string" ? value : JSON.stringify(value);

  if (upstash) {
    await upstash.set(key, payload, { ex: ttlSeconds });
    return;
  }

  if (redis) {
    await redis.set(key, payload, "EX", ttlSeconds);
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  let payload: string | null = null;

  if (upstash) {
    payload = await upstash.get<string>(key);
  } else if (redis) {
    payload = await redis.get(key);
  }

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload) as T;
  } catch {
    return payload as T;
  }
}
