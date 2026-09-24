/**
 * Catálogo general de ejercicios que se carga automáticamente en la
 * biblioteca de todo entrenador nuevo — es parte del servicio, no un paso
 * opcional. Los videos son los mismos que ya se usan en las rutinas
 * cargadas (reutilizados, no inventados); donde no había un video
 * equivalente en uso, queda en null para que el entrenador lo complete
 * desde la biblioteca. Ver scripts/create-trainer.ts (alta automática) y
 * este archivo corrido directo (re-seed manual).
 */
import type { PrismaClient } from "../src/generated/prisma/client";

const COMPOUND = { sets: 4, reps: "6-10", restSeconds: 90 };
const ACCESSORY = { sets: 3, reps: "10-12", restSeconds: 60 };
const CORE = { sets: 3, reps: "15-20", restSeconds: 45 };
const CARDIO = { sets: 1, reps: "15-20 min", restSeconds: null };

export type SeedExercise = {
  name: string;
  category: string;
  defaults: { sets: number; reps: string; restSeconds: number | null };
  videoUrl: string | null;
};

export const EXERCISES: SeedExercise[] = [
  // Pecho
  { name: "Press de banca plano", category: "Pecho", defaults: COMPOUND, videoUrl: "https://www.youtube.com/watch?v=xRDeg9X1_28" },
  { name: "Press de banca inclinado", category: "Pecho", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/LDEHmb9DpO8" },
  { name: "Press de banca declinado", category: "Pecho", defaults: ACCESSORY, videoUrl: null },
  { name: "Aperturas con mancuerna", category: "Pecho", defaults: ACCESSORY, videoUrl: null },
  { name: "Cruce de poleas", category: "Pecho", defaults: ACCESSORY, videoUrl: null },
  { name: "Fondos en paralelas", category: "Pecho", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/wN_9d37DO4M" },
  { name: "Flexiones de brazos", category: "Pecho", defaults: ACCESSORY, videoUrl: null },
  { name: "Peck deck / Contractora", category: "Pecho", defaults: ACCESSORY, videoUrl: null },

  // Espalda
  { name: "Dominadas", category: "Espalda", defaults: COMPOUND, videoUrl: "https://www.youtube.com/shorts/BT3CSQKeEww" },
  { name: "Peso muerto", category: "Espalda", defaults: COMPOUND, videoUrl: null },
  { name: "Remo con barra", category: "Espalda", defaults: COMPOUND, videoUrl: "https://www.youtube.com/shorts/sr_U0jBE89A" },
  { name: "Remo con mancuerna", category: "Espalda", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/watch?v=ryhxLQUn-cQ" },
  { name: "Remo en polea sentado", category: "Espalda", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/watch?v=hiujo_wbkLU" },
  { name: "Jalón al pecho", category: "Espalda", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/TcYwpzaRS1I" },
  { name: "Remo en máquina", category: "Espalda", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/watch?v=hiujo_wbkLU" },
  { name: "Face pull", category: "Espalda", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/bcaNXuEKPCI" },
  { name: "Hiperextensiones", category: "Espalda", defaults: ACCESSORY, videoUrl: null },

  // Hombros
  { name: "Press militar con barra", category: "Hombros", defaults: COMPOUND, videoUrl: "https://www.youtube.com/watch?v=xM2FGQuhZAY" },
  { name: "Press Arnold", category: "Hombros", defaults: ACCESSORY, videoUrl: null },
  { name: "Elevaciones laterales", category: "Hombros", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/wPkosHeBUGc" },
  { name: "Elevaciones frontales", category: "Hombros", defaults: ACCESSORY, videoUrl: null },
  { name: "Pájaro (posterior)", category: "Hombros", defaults: ACCESSORY, videoUrl: null },
  { name: "Remo al mentón", category: "Hombros", defaults: ACCESSORY, videoUrl: null },
  { name: "Press de hombros en máquina", category: "Hombros", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/watch?v=HiT5sEFgInw" },
  { name: "Encogimientos de hombros", category: "Hombros", defaults: ACCESSORY, videoUrl: null },

  // Bíceps
  { name: "Curl con barra", category: "Bíceps", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/lj0Ue9U0Rg8" },
  { name: "Curl con mancuernas", category: "Bíceps", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/WrpQYs_n_Pw" },
  { name: "Curl martillo", category: "Bíceps", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/PzmSQcFSNPI" },
  { name: "Curl concentrado", category: "Bíceps", defaults: ACCESSORY, videoUrl: null },
  { name: "Curl en polea", category: "Bíceps", defaults: ACCESSORY, videoUrl: null },
  { name: "Curl Scott (predicador)", category: "Bíceps", defaults: ACCESSORY, videoUrl: null },

  // Tríceps
  { name: "Press francés", category: "Tríceps", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/BTkLgHG7kzo" },
  { name: "Extensión de tríceps en polea", category: "Tríceps", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/sU9snn0qTEs" },
  { name: "Patada de tríceps", category: "Tríceps", defaults: ACCESSORY, videoUrl: null },
  { name: "Fondos en banco", category: "Tríceps", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/wN_9d37DO4M" },
  { name: "Extensión de tríceps sobre la cabeza", category: "Tríceps", defaults: ACCESSORY, videoUrl: null },
  { name: "Press cerrado en banca", category: "Tríceps", defaults: ACCESSORY, videoUrl: null },

  // Piernas
  { name: "Sentadilla", category: "Piernas", defaults: COMPOUND, videoUrl: "https://www.youtube.com/shorts/M0UsWb2iNag" },
  { name: "Sentadilla frontal", category: "Piernas", defaults: COMPOUND, videoUrl: null },
  { name: "Sentadilla búlgara", category: "Piernas", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/eu4AjZ3mVKM" },
  { name: "Prensa de piernas", category: "Piernas", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/4k8GkDBTrXE" },
  { name: "Zancadas", category: "Piernas", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/watch?v=stw9oAkTjhc" },
  { name: "Peso muerto rumano", category: "Piernas", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/5kYMN400cOs" },
  { name: "Extensión de cuádriceps", category: "Piernas", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/iNvPzf15KKA" },
  { name: "Curl femoral", category: "Piernas", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/watch?v=9xbBr5Ytl8c" },
  { name: "Sentadilla hack", category: "Piernas", defaults: ACCESSORY, videoUrl: null },
  { name: "Step up", category: "Piernas", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/eu4AjZ3mVKM" },

  // Glúteos
  { name: "Hip thrust", category: "Glúteos", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/watch?v=2DVaazHpotc" },
  { name: "Puente de glúteos", category: "Glúteos", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/watch?v=ma_8C7ZqUJo" },
  { name: "Patada de glúteo en polea", category: "Glúteos", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/_RovolXS2m8" },
  { name: "Abducción de cadera en máquina", category: "Glúteos", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/watch?v=7Oa_6915l3M" },

  // Pantorrillas
  { name: "Elevación de talones de pie", category: "Pantorrillas", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/zOKPGa6GhNY" },
  { name: "Elevación de talones sentado", category: "Pantorrillas", defaults: ACCESSORY, videoUrl: null },

  // Abdomen
  { name: "Crunch abdominal", category: "Abdomen", defaults: CORE, videoUrl: null },
  { name: "Plancha", category: "Abdomen", defaults: { sets: 3, reps: "30-45 seg", restSeconds: 45 }, videoUrl: "https://www.youtube.com/shorts/MczN_Wu94Hc" },
  { name: "Elevación de piernas", category: "Abdomen", defaults: CORE, videoUrl: "https://www.youtube.com/shorts/vsG3ufxXtUo" },
  { name: "Abdominales en polea", category: "Abdomen", defaults: CORE, videoUrl: null },
  { name: "Russian twist", category: "Abdomen", defaults: CORE, videoUrl: null },
  { name: "Rueda abdominal", category: "Abdomen", defaults: ACCESSORY, videoUrl: "https://www.youtube.com/shorts/ODRGMj5qEbY" },

  // Cardio
  { name: "Cinta / Caminadora", category: "Cardio", defaults: CARDIO, videoUrl: null },
  { name: "Bicicleta fija", category: "Cardio", defaults: CARDIO, videoUrl: null },
  { name: "Remo (máquina)", category: "Cardio", defaults: CARDIO, videoUrl: null },
  { name: "Escaladora / Elíptica", category: "Cardio", defaults: CARDIO, videoUrl: null },
  { name: "Burpees", category: "Cardio", defaults: { sets: 3, reps: "45 seg", restSeconds: 30 }, videoUrl: null },
];

/** Carga los ejercicios del catálogo que el entrenador todavía no tiene. Devuelve cuántos creó. */
export async function seedExerciseLibrary(db: PrismaClient, trainerId: string): Promise<number> {
  const existing = new Set(
    (await db.exerciseTemplate.findMany({ where: { trainerId }, select: { name: true } })).map((e) => e.name)
  );

  let created = 0;
  for (const exercise of EXERCISES) {
    if (existing.has(exercise.name)) continue;
    await db.exerciseTemplate.create({
      data: {
        trainerId,
        name: exercise.name,
        category: exercise.category,
        sets: exercise.defaults.sets,
        reps: exercise.defaults.reps,
        restSeconds: exercise.defaults.restSeconds,
        videoUrl: exercise.videoUrl,
      },
    });
    created++;
  }
  return created;
}
