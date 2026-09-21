// Constante sin dependencias de servidor (Prisma/pg), para poder importarla
// tanto desde componentes cliente como desde src/lib/data.ts.
export const EXERCISE_CATEGORIES = [
  "Pecho",
  "Espalda",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Piernas",
  "Glúteos",
  "Pantorrillas",
  "Abdomen",
  "Cardio",
] as const;
