-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "client" TEXT,
    "year" INTEGER,
    "url" TEXT,
    "cover" TEXT,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "screen" JSONB,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_published_position_idx" ON "projects"("published", "position");


-- Segurança: a tabela fica fora da API pública do Supabase (chave anon/publishable).
-- O site lê e grava só pelo servidor, via Prisma (usuário postgres, que não passa pelo RLS).
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
