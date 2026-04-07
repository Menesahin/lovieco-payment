// Structured logger — uses console in dev, Pino in Docker/production
// Pino causes Turbopack issues when imported from Server Actions called by Client Components

interface LogFn {
  (obj: Record<string, unknown>, msg: string): void;
  (msg: string): void;
}

function createLogFn(level: string): LogFn {
  return (...args: unknown[]) => {
    if (typeof args[0] === "object" && args[0] !== null) {
      const obj = args[0] as Record<string, unknown>;
      const msg = args[1] as string;
      console[level as "info" | "warn" | "error" | "debug"](
        JSON.stringify({ level, msg, ...obj, timestamp: new Date().toISOString() })
      );
    } else {
      console[level as "info" | "warn" | "error" | "debug"](
        JSON.stringify({ level, msg: args[0], timestamp: new Date().toISOString() })
      );
    }
  };
}

export const logger = {
  info: createLogFn("info") as LogFn,
  warn: createLogFn("warn") as LogFn,
  error: createLogFn("error") as LogFn,
  debug: createLogFn("debug") as LogFn,
};
