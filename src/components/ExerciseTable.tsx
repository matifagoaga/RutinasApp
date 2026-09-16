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
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="bg-emerald-50 text-left text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            <th className="px-3 py-2.5">Ejercicio</th>
            <th className="px-3 py-2.5 text-center">Series</th>
            <th className="px-3 py-2.5 text-center">Reps</th>
            <th className="px-3 py-2.5 text-center">Peso</th>
            <th className="px-3 py-2.5 text-center">Descanso</th>
            <th className="px-3 py-2.5">Notas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
          {exercises.map((exercise) => (
            <tr key={exercise.id}>
              <td className="px-3 py-2.5 font-medium text-zinc-900 dark:text-zinc-50">
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
                        className="h-10 w-10 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
                      />
                    </a>
                  )}
                  <span>{exercise.name}</span>
                  {exercise.videoUrl && (
                    <a
                      href={exercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-print inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                    >
                      ▶ video
                    </a>
                  )}
                </div>
              </td>
              <td className="px-3 py-2.5 text-center text-zinc-700 dark:text-zinc-300">{exercise.sets}</td>
              <td className="px-3 py-2.5 text-center text-zinc-700 dark:text-zinc-300">{exercise.reps}</td>
              <td className="px-3 py-2.5 text-center text-zinc-700 dark:text-zinc-300">
                {exercise.weight || "—"}
              </td>
              <td className="px-3 py-2.5 text-center text-zinc-700 dark:text-zinc-300">
                {exercise.restSeconds != null ? `${exercise.restSeconds}s` : "—"}
              </td>
              <td className="px-3 py-2.5 text-zinc-500 dark:text-zinc-400">{exercise.notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
