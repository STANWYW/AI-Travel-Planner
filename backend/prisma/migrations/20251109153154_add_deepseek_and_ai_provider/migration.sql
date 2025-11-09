-- AlterTable
ALTER TABLE "api_configs" ADD COLUMN IF NOT EXISTS "aiProvider" TEXT DEFAULT 'openrouter';
ALTER TABLE "api_configs" ADD COLUMN IF NOT EXISTS "selectedModel" TEXT;
ALTER TABLE "api_configs" ADD COLUMN IF NOT EXISTS "deepseekKey" TEXT;
