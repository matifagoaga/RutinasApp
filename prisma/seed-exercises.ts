/**
 * Carga la biblioteca de ejercicios con un catálogo general (sin
 * especificar barra/mancuerna/máquina salvo que el nombre ya lo distinga).
 * Se puede correr de nuevo sin duplicar: se salta los nombres que ya existen.
 *
 * Uso: npx tsx prisma/seed-exercises.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const COMPOUND = { sets: 4, reps: "6-10", restSeconds: 90 };
const ACCESSORY = { sets: 3, reps: "10-12", restSeconds: 60 };
const CORE = { sets: 3, reps: "15-20", restSeconds: 45 };
const CARDIO = { sets: 1, reps: "15-20 min", restSeconds: null };

type SeedExercise = {
  name: string;
  category: string;
  defaults: { sets: number; reps: string; restSeconds: number | null };
};

const EXERCISES: SeedExercise[] = [
  // Pecho
  { name: "Press de banca plano", category: "Pecho", defaults: COMPOUND },
  { name: "Press de banca inclinado", category: "Pecho", defaults: ACCESSORY },
  { name: "Press de banca declinado", category: "Pecho", defaults: ACCESSORY },
  { name: "Aperturas con mancuerna", category: "Pecho", defaults: ACCESSORY },
  { name: "Cruce de poleas", category: "Pecho", defaults: ACCESSORY },
  { name: "Fondos en paralelas", category: "Pecho", defaults: ACCESSORY },
  { name: "Flexiones de brazos", category: "Pecho", defaults: ACCESSORY },
  { name: "Peck deck / Contractora", category: "Pecho", defaults: ACCESSORY },

  // Espalda
  { name: "Dominadas", category: "Espalda", defaults: COMPOUND },
  { name: "Peso muerto", category: "Espalda", defaults: COMPOUND },
  { name: "Remo con barra", category: "Espalda", defaults: COMPOUND },
  { name: "Remo con mancuerna", category: "Espalda", defaults: ACCESSORY },
  { name: "Remo en polea sentado", category: "Espalda", defaults: ACCESSORY },
  { name: "Jalón al pecho", category: "Espalda", defaults: ACCESSORY },
  { name: "Remo en máquina", category: "Espalda", defaults: ACCESSORY },
  { name: "Face pull", category: "Espalda", defaults: ACCESSORY },
  { name: "Hiperextensiones", category: "Espalda", defaults: ACCESSORY },

  // Hombros
  { name: "Press militar con barra", category: "Hombros", defaults: COMPOUND },
  { name: "Press Arnold", category: "Hombros", defaults: ACCESSORY },
  { name: "Elevaciones laterales", category: "Hombros", defaults: ACCESSORY },
  { name: "Elevaciones frontales", category: "Hombros", defaults: ACCESSORY },
  { name: "Pájaro (posterior)", category: "Hombros", defaults: ACCESSORY },
  { name: "Remo al mentón", category: "Hombros", defaults: ACCESSORY },
  { name: "Press de hombros en máquina", category: "Hombros", defaults: ACCESSORY },
  { name: "Encogimientos de hombros", category: "Hombros", defaults: ACCESSORY },

  // Bíceps
  { name: "Curl con barra", category: "Bíceps", defaults: ACCESSORY },
  { name: "Curl con mancuernas", category: "Bíceps", defaults: ACCESSORY },
  { name: "Curl martillo", category: "Bíceps", defaults: ACCESSORY },
  { name: "Curl concentrado", category: "Bíceps", defaults: ACCESSORY },
  { name: "Curl en polea", category: "Bíceps", defaults: ACCESSORY },
  { name: "Curl Scott (predicador)", category: "Bíceps", defaults: ACCESSORY },

  // Tríceps
  { name: "Press francés", category: "Tríceps", defaults: ACCESSORY },
  { name: "Extensión de tríceps en polea", category: "Tríceps", defaults: ACCESSORY },
  { name: "Patada de tríceps", category: "Tríceps", defaults: ACCESSORY },
  { name: "Fondos en banco", category: "Tríceps", defaults: ACCESSORY },
  { name: "Extensión de tríceps sobre la cabeza", category: "Tríceps", defaults: ACCESSORY },
  { name: "Press cerrado en banca", category: "Tríceps", defaults: ACCESSORY },

  // Piernas
  { name: "Sentadilla", category: "Piernas", defaults: COMPOUND },
  { name: "Sentadilla frontal", category: "Piernas", defaults: COMPOUND },
  { name: "Sentadilla búlgara", category: "Piernas", defaults: ACCESSORY },
  { name: "Prensa de piernas", category: "Piernas", defaults: ACCESSORY },
  { name: "Zancadas", category: "Piernas", defaults: ACCESSORY },
  { name: "Peso muerto rumano", category: "Piernas", defaults: ACCESSORY },
  { name: "Extensión de cuádriceps", category: "Piernas", defaults: ACCESSORY },
  { name: "Curl femoral", category: "Piernas", defaults: ACCESSORY },
  { name: "Sentadilla hack", category: "Piernas", defaults: ACCESSORY },
  { name: "Step up", category: "Piernas", defaults: ACCESSORY },

  // Glúteos
  { name: "Hip thrust", category: "Glúteos", defaults: ACCESSORY },
  { name: "Puente de glúteos", category: "Glúteos", defaults: ACCESSORY },
  { name: "Patada de glúteo en polea", category: "Glúteos", defaults: ACCESSORY },
  { name: "Abducción de cadera en máquina", category: "Glúteos", defaults: ACCESSORY },

  // Pantorrillas
  { name: "Elevación de talones de pie", category: "Pantorrillas", defaults: ACCESSORY },
  { name: "Elevación de talones sentado", category: "Pantorrillas", defaults: ACCESSORY },

  // Abdomen
  { name: "Crunch abdominal", category: "Abdomen", defaults: CORE },
  { name: "Plancha", category: "Abdomen", defaults: { sets: 3, reps: "30-45 seg", restSeconds: 45 } },
  { name: "Elevación de piernas", category: "Abdomen", defaults: CORE },
  { name: "Abdominales en polea", category: "Abdomen", defaults: CORE },
  { name: "Russian twist", category: "Abdomen", defaults: CORE },
  { name: "Rueda abdominal", category: "Abdomen", defaults: ACCESSORY },

  // Cardio
  { name: "Cinta / Caminadora", category: "Cardio", defaults: CARDIO },
  { name: "Bicicleta fija", category: "Cardio", defaults: CARDIO },
  { name: "Remo (máquina)", category: "Cardio", defaults: CARDIO },
  { name: "Escaladora / Elíptica", category: "Cardio", defaults: CARDIO },
  { name: "Burpees", category: "Cardio", defaults: { sets: 3, reps: "45 seg", restSeconds: 30 } },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL");
  const adapter = new PrismaPg({ connectionString: url });
  const db = new PrismaClient({ adapter });

  const existing = new Set((await db.exerciseTemplate.findMany({ select: { name: true } })).map((e) => e.name));

  let created = 0;
  for (const exercise of EXERCISES) {
    if (existing.has(exercise.name)) continue;
    await db.exerciseTemplate.create({
      data: {
        name: exercise.name,
        category: exercise.category,
        sets: exercise.defaults.sets,
        reps: exercise.defaults.reps,
        restSeconds: exercise.defaults.restSeconds,
      },
    });
    created++;
  }

  console.log(`Listo: ${created} ejercicios nuevos (${EXERCISES.length - created} ya existían).`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
