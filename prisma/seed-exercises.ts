/**
 * Re-carga la biblioteca de ejercicios de UN entrenador con el catálogo
 * general (ver exercise-catalog.ts). Se puede correr de nuevo sin duplicar.
 * Uso normal: esto ya lo corre automáticamente scripts/create-trainer.ts al
 * dar de alta a alguien — este archivo es sólo para re-sembrar a mano.
 *
 * Uso: npx tsx prisma/seed-exercises.ts email@delentrenador.com
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedExerciseLibrary } from "./exercise-catalog";

async function main() {
  const emailArg = process.argv[2];
  if (!emailArg) {
    console.error("Uso: npx tsx prisma/seed-exercises.ts email@delentrenador.com");
    process.exit(1);
  }
  const email = emailArg.trim().toLowerCase();

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL");
  const adapter = new PrismaPg({ connectionString: url });
  const db = new PrismaClient({ adapter });

  const trainer = await db.trainer.findUnique({ where: { email } });
  if (!trainer) {
    console.error(`No existe ningún entrenador con el email ${email}`);
    process.exit(1);
  }

  const created = await seedExerciseLibrary(db, trainer.id);
  console.log(`Listo: ${created} ejercicios nuevos cargados para ${trainer.email}.`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
