import IORedis from "ioredis";
import { env } from "@/lib/utils/env";

const globalForRedis = globalThis as unknown as {
  redis?: IORedis;
};

export function getRedis() {
  if (globalForRedis.redis) {
    return globalForRedis.redis;
  }

  const redis = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true
  });

  if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = redis;
  }

  return redis;
}
