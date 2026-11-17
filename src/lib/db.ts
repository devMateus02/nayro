import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

/** O banco está configurado no .env? (sem ele o site usa os projetos de reserva) */
export const dbConfigured = Boolean(connectionString);

// Uma instância só, mesmo com o recarregamento do código no `next dev`
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/** Cliente do banco (Prisma). null quando DATABASE_URL não está definida. */
export const db: PrismaClient | null = connectionString ? (globalForPrisma.prisma ??= createClient()) : null;
