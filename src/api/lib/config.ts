import dotenv from 'dotenv';
dotenv.config();

export interface Config {
  port: number;
  corsOrigin: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  redisUrl: string | undefined;
  apiKeyPrefix: string;
  extractionLLM: string;
  logLevel: string;
}

function env(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function envOrEmpty(key: string): string {
  return process.env[key] ?? '';
}

let _config: Config | null = null;

export function getConfig(): Config {
  if (_config) return _config;
  _config = {
    port: parseInt(env('PORT', '3000'), 10),
    corsOrigin: env('CORS_ORIGIN', '*'),
    supabaseUrl: envOrEmpty('SUPABASE_URL'),
    supabaseServiceRoleKey: envOrEmpty('SUPABASE_SERVICE_ROLE_KEY'),
    redisUrl: process.env['REDIS_URL'] || undefined,
    apiKeyPrefix: env('API_KEY_PREFIX', 'sk-'),
    extractionLLM: env('EXTRACTION_LLM', 'gemini'),
    logLevel: env('LOG_LEVEL', 'info'),
  };
  return _config;
}
