import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
          className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Volver a la biblioteca
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-ink">
          Editar {template.name}
        </h1>
      </div>

      <div className="max-w-lg rounded-card-lg border border-line p-6">
        <ExerciseTemplateForm
          initial={{
            name: template.name,
            category: template.category ?? "",
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
