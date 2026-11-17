import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Mesmo arquivo de variáveis do Next (o Prisma não carrega o .env sozinho)
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrações vão pela conexão direta (modo sessão); o site usa DATABASE_URL (pooler)
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
