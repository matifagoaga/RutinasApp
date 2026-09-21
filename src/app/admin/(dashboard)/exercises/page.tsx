import Link from "next/link";
import { getExerciseTemplates } from "@/lib/data";
import { ExerciseTemplateForm } from "@/components/ExerciseTemplateForm";
import { DeleteTemplateButton } from "@/components/DeleteTemplateButton";
import { createExerciseTemplateAction, deleteExerciseTemplateAction } from "./actions";

// La lista cambia cada vez que se agrega/edita/borra un ejercicio; sin esto
// Next.js la generaría estática en el build y quedaría congelada.
export const dynamic = "force-dynamic";

export default async function ExerciseLibraryPage() {
  const templates = await getExerciseTemplates();

  const groups = new Map<string, typeof templates>();
  for (const template of templates) {
    const key = template.category ?? "Sin categoría";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(template);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          📚 Biblioteca de ejercicios
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Cargá cada ejercicio una vez y después insertalo en cualquier rutina desde el editor,
          sin volver a tipear ni subir la foto de nuevo.
        </p>
      </div>

      <section className="flex flex-col gap-6">
        {templates.length === 0 ? (
          <p className="text-sm text-zinc-500">Todavía no cargaste ningún ejercicio.</p>
        ) : (
          [...groups.entries()].map(([category, items]) => (
            <div key={category}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                {category}
              </h2>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="bg-emerald-50 text-left text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <th className="px-3 py-2.5">Ejercicio</th>
                      <th className="px-3 py-2.5 text-center">Series</th>
                      <th className="px-3 py-2.5 text-center">Reps</th>
                      <th className="px-3 py-2.5 text-center">Peso</th>
                      <th className="px-3 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                    {items.map((template) => (
                      <tr key={template.id}>
                        <td className="px-3 py-2.5 font-medium text-zinc-900 dark:text-zinc-50">
                          <div className="flex items-center gap-2">
                            {template.imageData && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={template.imageData}
                                alt={template.name}
                                className="h-10 w-10 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
                              />
                            )}
                            <span>{template.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center text-zinc-700 dark:text-zinc-300">
                          {template.sets}
                        </td>
                        <td className="px-3 py-2.5 text-center text-zinc-700 dark:text-zinc-300">
                          {template.reps}
                        </td>
                        <td className="px-3 py-2.5 text-center text-zinc-700 dark:text-zinc-300">
                          {template.weight || "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/admin/exercises/${template.id}`}
                              className="text-xs font-medium text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"
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

      <section className="max-w-lg rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm dark:border-emerald-950 dark:bg-zinc-950">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <span>➕</span> Agregar ejercicio a la biblioteca
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
