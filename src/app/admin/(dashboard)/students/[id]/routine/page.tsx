import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getActiveRoutine, getExerciseTemplates, getRoutineTemplates, getStudentById } from "@/lib/data";
import { RoutineEditor } from "@/components/RoutineEditor";
import { saveRoutineAction } from "./actions";
import { saveRoutineTemplateAction } from "@/app/admin/(dashboard)/routine-templates/actions";

export default async function RoutineEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();

  const [activeRoutine, libraryExercises, routineTemplates] = await Promise.all([
    getActiveRoutine(id),
    getExerciseTemplates(),
    getRoutineTemplates(),
  ]);

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
          className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Volver a {student.name}
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-ink">
          {activeRoutine ? "Editar rutina" : "Nueva rutina"} de {student.name}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Al guardar se crea una nueva versión de la rutina y queda como la activa; las anteriores
          quedan en el historial.
        </p>
      </div>

      <RoutineEditor
        initialTitle={activeRoutine?.title ?? ""}
        initialDays={initialDays}
        libraryExercises={libraryExercises}
        routineTemplates={routineTemplates}
        onSave={boundSave}
        onSaveAsTemplate={saveRoutineTemplateAction}
      />
    </div>
  );
}
