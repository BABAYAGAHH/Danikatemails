import pino from "pino";

export const logger = pino({
  name: "regionreach",
  level: process.env.LOG_LEVEL ?? "info",
  base: undefined
});
