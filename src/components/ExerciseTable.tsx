import { PlayCircle } from "lucide-react";

export type ExerciseRow = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string | null;
  restSeconds?: number | null;
  notes?: string | null;
  videoUrl?: string | null;
  imageData?: string | null;
};

export function ExerciseTable({ exercises }: { exercises: ExerciseRow[] }) {
  return (
    <div className="overflow-x-auto rounded-card border border-line">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <th className="px-4 py-3">Ejercicio</th>
            <th className="px-4 py-3 text-center">Series</th>
            <th className="px-4 py-3 text-center">Reps</th>
            <th className="px-4 py-3 text-center">Peso</th>
            <th className="px-4 py-3 text-center">Descanso</th>
            <th className="px-4 py-3">Notas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {exercises.map((exercise) => (
            <tr key={exercise.id}>
              <td className="px-4 py-3 font-medium text-ink">
                <div className="flex flex-wrap items-center gap-2">
                  {exercise.imageData && (
                    <a
                      href={exercise.imageData}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-print shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={exercise.imageData}
                        alt={exercise.name}
                        className="h-10 w-10 rounded-button border border-line object-cover"
                      />
                    </a>
                  )}
                  <span>{exercise.name}</span>
                  {exercise.videoUrl && (
                    <a
                      href={exercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-print inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink hover:underline"
                    >
                      <PlayCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                      video
                    </a>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-center text-ink">{exercise.sets}</td>
              <td className="px-4 py-3 text-center text-ink">{exercise.reps}</td>
              <td className="px-4 py-3 text-center text-ink">{exercise.weight || "—"}</td>
              <td className="px-4 py-3 text-center text-ink">
                {exercise.restSeconds != null ? `${exercise.restSeconds}s` : "—"}
              </td>
              <td className="px-4 py-3 text-ink-muted">{exercise.notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
