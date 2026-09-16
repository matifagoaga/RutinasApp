import { notFound } from "next/navigation";
import Link from "next/link";
import { getActiveRoutine, getStudentById } from "@/lib/data";
import { RoutineEditor } from "@/components/RoutineEditor";
import { saveRoutineAction } from "./actions";

export default async function RoutineEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();

  const activeRoutine = await getActiveRoutine(id);

  const initialDays = (activeRoutine?.days ?? []).map((day) => ({
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

  const boundSave = saveRoutineAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/admin/students/${id}`}
          className="text-sm text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          ← Volver a {student.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {activeRoutine ? "Editar rutina" : "Nueva rutina"} de {student.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Al guardar se crea una nueva versión de la rutina y queda como la activa; las anteriores
          quedan en el historial.
        </p>
      </div>

      <RoutineEditor
        initialTitle={activeRoutine?.title ?? ""}
        initialDays={initialDays}
        onSave={boundSave}
      />
    </div>
  );
}
