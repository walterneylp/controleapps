import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3333),
  appName: process.env.APP_NAME ?? "controle-app-backend",
  tokenSecret: required("TOKEN_SECRET", "local-dev-secret-change-me"),
  tokenTtlSeconds: Number(process.env.TOKEN_TTL_SECONDS ?? 60 * 60 * 8)
};
