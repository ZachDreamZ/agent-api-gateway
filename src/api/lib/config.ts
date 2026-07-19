import dotenv from 'dotenv';
dotenv.config();

export interface Config {
  port: number;
  corsOrigin: string;
  redisUrl: string | undefined;
  apiKeyPrefix: string;
  extractionLLM: string;
  logLevel: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  databaseUrl: string;
}

function env(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function envOrEmpty(key: string): string {
  return process.env[key] ?? '';
}
// Returns '*' (wildcard) only when explicitly set; otherwise an exact-origin list.
export function parseCorsOrigins(value: string): string[] | '*' {
  const trimmed = value.trim();
  if (trimmed === '*') return '*';
  return trimmed
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

let _config: Config | null = null;

export function getConfig(): Config {
  if (_config) return _config;
  _config = {
    port: parseInt(env('PORT', '3000'), 10),
    corsOrigin: env('CORS_ORIGIN', 'http://localhost:3000'),
    redisUrl: process.env['REDIS_URL'] || undefined,
    apiKeyPrefix: env('API_KEY_PREFIX', 'sk-'),
    extractionLLM: env('EXTRACTION_LLM', 'gemini'),
    logLevel: env('LOG_LEVEL', 'info'),
    betterAuthSecret: envOrEmpty('BETTER_AUTH_SECRET'),
    betterAuthUrl: envOrEmpty('BETTER_AUTH_URL'),
    databaseUrl: envOrEmpty('DATABASE_URL'),
  };
  return _config;
}
