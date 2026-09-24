import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { requireTrainerSession } from "@/lib/auth";
import { getExerciseTemplates } from "@/lib/data";
import { ExerciseTemplateForm } from "@/components/ExerciseTemplateForm";
import { DeleteTemplateButton } from "@/components/DeleteTemplateButton";
import { createExerciseTemplateAction, deleteExerciseTemplateAction } from "./actions";

// La lista cambia cada vez que se agrega/edita/borra un ejercicio; sin esto
// Next.js la generaría estática en el build y quedaría congelada.
export const dynamic = "force-dynamic";

export default async function ExerciseLibraryPage() {
  const { trainerId } = await requireTrainerSession();
  const templates = await getExerciseTemplates(trainerId);

  const groups = new Map<string, typeof templates>();
  for (const template of templates) {
    const key = template.category ?? "Sin categoría";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(template);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold text-ink">
          <BookOpen className="h-6 w-6 text-ink-muted" strokeWidth={1.75} /> Biblioteca de ejercicios
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Cargá cada ejercicio una vez y después insertalo en cualquier rutina desde el editor,
          sin volver a tipear ni subir la foto de nuevo.
        </p>
      </div>

      <section className="flex flex-col gap-6">
        {templates.length === 0 ? (
          <p className="text-sm text-ink-muted">Todavía no cargaste ningún ejercicio.</p>
        ) : (
          [...groups.entries()].map(([category, items]) => (
            <div key={category}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                {category}
              </h2>
              <div className="overflow-x-auto rounded-card border border-line">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      <th className="px-3 py-2.5">Ejercicio</th>
                      <th className="px-3 py-2.5 text-center">Series</th>
                      <th className="px-3 py-2.5 text-center">Reps</th>
                      <th className="px-3 py-2.5 text-center">Peso</th>
                      <th className="px-3 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {items.map((template) => (
                      <tr key={template.id}>
                        <td className="px-3 py-2.5 font-medium text-ink">
                          <div className="flex items-center gap-2">
                            {template.imageData && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={template.imageData}
                                alt={template.name}
                                className="h-10 w-10 rounded-button border border-line object-cover"
                              />
                            )}
                            <span>{template.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center text-ink-muted">
                          {template.sets}
                        </td>
                        <td className="px-3 py-2.5 text-center text-ink-muted">
                          {template.reps}
                        </td>
                        <td className="px-3 py-2.5 text-center text-ink-muted">
                          {template.weight || "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/admin/exercises/${template.id}`}
                              className="text-xs font-medium text-accent hover:text-accent-hover"
                            >
                              Editar
                            </Link>
                            <DeleteTemplateButton
                              exerciseName={template.name}
                              onDelete={deleteExerciseTemplateAction.bind(null, template.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="max-w-lg rounded-card-lg border border-line p-6">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-ink">
          <Plus className="h-5 w-5 text-ink-muted" strokeWidth={1.75} /> Agregar ejercicio a la biblioteca
        </h2>
        <div className="mt-4">
          {/* key fuerza que el formulario se reinicie después de cada alta exitosa */}
          <ExerciseTemplateForm
            key={templates.length}
            onSave={createExerciseTemplateAction}
            submitLabel="Agregar"
          />
        </div>
      </section>
    </div>
  );
}
