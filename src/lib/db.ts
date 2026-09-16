import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

// Desarrollo local: SQLite vía better-sqlite3. Para producción con Postgres
// (Neon), reemplazar este adapter por `@prisma/adapter-pg` y actualizar
// `provider` en prisma/schema.prisma a "postgresql" (ver README).
function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL en las variables de entorno");

  const adapter = new PrismaBetterSqlite3({
    url: url.replace(/^file:/, ""),
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
