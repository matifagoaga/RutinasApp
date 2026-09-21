import { notFound } from "next/navigation";
import Link from "next/link";
import { getExerciseTemplateById } from "@/lib/data";
import { ExerciseTemplateForm } from "@/components/ExerciseTemplateForm";
import { updateExerciseTemplateAction } from "../actions";

export default async function EditExerciseTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const template = await getExerciseTemplateById(templateId);
  if (!template) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/exercises"
          className="text-sm text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"
        >
          ← Volver a la biblioteca
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Editar {template.name}
        </h1>
      </div>

      <div className="max-w-lg rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-950 dark:bg-zinc-950">
        <ExerciseTemplateForm
          initial={{
            name: template.name,
            sets: String(template.sets),
            reps: template.reps,
            weight: template.weight ?? "",
            restSeconds: template.restSeconds != null ? String(template.restSeconds) : "",
            notes: template.notes ?? "",
            videoUrl: template.videoUrl ?? "",
            imageData: template.imageData ?? "",
          }}
          submitLabel="Guardar cambios"
          onSave={updateExerciseTemplateAction.bind(null, templateId)}
        />
      </div>
    </div>
  );
}
