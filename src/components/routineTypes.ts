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
