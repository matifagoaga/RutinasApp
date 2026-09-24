/**
 * Crea la cuenta de un entrenador nuevo. Alta manual, no hay registro público
 * (decisión de producto: el dueño de la app cobra por afuera antes del alta).
 * También carga de una el catálogo general de ejercicios (con video) en su
 * biblioteca — es parte del servicio, no un paso aparte.
 *
 * Uso:
 *   npm run trainer:create -- "Nombre Apellido" email@ejemplo.com [contraseña]
 *
 * Si no se pasa contraseña, se genera una al azar y se imprime una sola vez.
 */
import "dotenv/config";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { seedExerciseLibrary } from "../prisma/exercise-catalog";

async function main() {
  const [name, emailRaw, passwordArg] = process.argv.slice(2);

  if (!name || !emailRaw) {
    console.error('Uso: npm run trainer:create -- "Nombre Apellido" email@ejemplo.com [contraseña]');
    process.exit(1);
  }

  const email = emailRaw.trim().toLowerCase();
  const password = passwordArg || crypto.randomBytes(9).toString("base64url");

  const existing = await db.trainer.findUnique({ where: { email } });
  if (existing) {
    console.error(`Ya existe un entrenador con el email ${email}`);
    process.exit(1);
  }

  const trainer = await db.trainer.create({
    data: { name, email, passwordHash: hashPassword(password) },
  });

  const exercisesCreated = await seedExerciseLibrary(db, trainer.id);

  console.log(`Entrenador creado: ${trainer.name} <${trainer.email}> (id ${trainer.id})`);
  console.log(`Biblioteca de ejercicios cargada: ${exercisesCreated} ejercicios.`);
  if (!passwordArg) {
    console.log(`Contraseña generada (guardala, no se vuelve a mostrar): ${password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
