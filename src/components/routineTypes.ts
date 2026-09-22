export type ExerciseState = {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  restSeconds: string;
  notes: string;
  videoUrl: string;
  imageData: string;
};

export type BlockState = {
  label: string;
  exercises: ExerciseState[];
};

export type DayState = {
  label: string;
  blocks: BlockState[];
};

export type LibraryExerciseOption = {
  id: string;
  name: string;
  category: string | null;
  sets: number;
  reps: string;
  weight: string | null;
  restSeconds: number | null;
  notes: string | null;
  videoUrl: string | null;
  imageData: string | null;
};

export function exerciseFromTemplate(template: LibraryExerciseOption): ExerciseState {
  return {
    name: template.name,
    sets: String(template.sets),
    reps: template.reps,
    weight: template.weight ?? "",
    restSeconds: template.restSeconds != null ? String(template.restSeconds) : "",
    notes: template.notes ?? "",
    videoUrl: template.videoUrl ?? "",
    imageData: template.imageData ?? "",
  };
}

export type RoutineTemplateExerciseOption = {
  name: string;
  sets: number;
  reps: string;
  weight: string | null;
  restSeconds: number | null;
  notes: string | null;
  videoUrl: string | null;
  imageData: string | null;
};

export type RoutineTemplateOption = {
  id: string;
  title: string;
  days: {
    label: string;
    blocks: {
      label: string;
      exercises: RoutineTemplateExerciseOption[];
    }[];
  }[];
};

export function daysFromRoutineTemplate(template: RoutineTemplateOption): DayState[] {
  return template.days.map((day) => ({
    label: day.label,
    blocks: day.blocks.map((block) => ({
      label: block.label,
      exercises: block.exercises.map((exercise) => ({
        name: exercise.name,
        sets: String(exercise.sets),
        reps: exercise.reps,
        weight: exercise.weight ?? "",
        restSeconds: exercise.restSeconds != null ? String(exercise.restSeconds) : "",
        notes: exercise.notes ?? "",
        videoUrl: exercise.videoUrl ?? "",
        imageData: exercise.imageData ?? "",
      })),
    })),
  }));
}
